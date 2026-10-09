import type { GarnishId, GlassType, IceType, Method, Recipe, RimType } from '../data/types'
import { canonicalId, INGREDIENT_MAP } from '../data/ingredients'
import { GLASS_FAMILIES, GLASS_MAP } from '../data/glasses'
import { GARNISH_MAP } from '../data/garnishes'
import { METHOD_LABELS, ICE_LABELS } from '../data/recipes'
import { formatAmountShort } from './units'
import { withinDiscreteTolerance, withinTolerance, type ContentEntry } from './pouring'

/** What the bartender actually handed over. Derived from the bar state. */
export interface ServedDrink {
  glass: GlassType | null
  contents: ContentEntry[]
  ice: IceType
  method: Method
  /** The shaker / mixing glass had ice when it was shaken or stirred. */
  chilledWithIce: boolean
  rim: RimType
  garnishes: GarnishId[]
  muddled: boolean
}

export type CategoryKey = 'ingredients' | 'amounts' | 'glass' | 'method' | 'ice' | 'rim' | 'garnish'

export interface CategoryScore {
  key: CategoryKey
  label: string
  points: number
  max: number
  status: 'ok' | 'partial' | 'bad'
  notes: string[]
}

export interface ScoreResult {
  total: number
  categories: CategoryScore[]
  verdict: string
  passed: boolean
  mastered: boolean
}

export const MAX_POINTS: Record<CategoryKey, number> = {
  ingredients: 30,
  amounts: 20,
  glass: 10,
  method: 15,
  ice: 10,
  rim: 5,
  garnish: 10,
}

export const PASS_SCORE = 70
export const MASTER_SCORE = 90
export const AMOUNT_TOLERANCE = 0.15

function status(points: number, max: number): CategoryScore['status'] {
  if (points >= max - 1e-9) return 'ok'
  if (points <= 0) return 'bad'
  return 'partial'
}

function name(id: string): string {
  return INGREDIENT_MAP[id]?.name ?? id
}

/** Collapse poured bottles to canonical recipe ingredients. */
export function canonicalTotals(contents: ContentEntry[]): Map<string, number> {
  const m = new Map<string, number>()
  for (const c of contents) {
    const id = canonicalId(c.id)
    m.set(id, (m.get(id) ?? 0) + c.amount)
  }
  return m
}

export function amountWithinTolerance(id: string, actual: number, expected: number): boolean {
  const unit = INGREDIENT_MAP[id]?.unit ?? 'ml'
  if (unit === 'ml') return withinTolerance(actual, expected, AMOUNT_TOLERANCE)
  return withinDiscreteTolerance(actual, expected, AMOUNT_TOLERANCE)
}

function scoreIngredients(recipe: Recipe, got: Map<string, number>): CategoryScore {
  const max = MAX_POINTS.ingredients
  const expected = recipe.ingredients.map((i) => i.id)
  const expectedSet = new Set(expected)
  const present = expected.filter((id) => (got.get(id) ?? 0) > 0)
  const missing = expected.filter((id) => !(got.get(id) ?? 0))
  const extras = [...got.keys()].filter((id) => !expectedSet.has(id) && (got.get(id) ?? 0) > 0)
  let points = (max * present.length) / expected.length
  const notes: string[] = []
  if (missing.length) notes.push(`Missing: ${missing.map(name).join(', ')}.`)
  if (extras.length) {
    const penalty = Math.min(points, 5 * extras.length)
    points -= penalty
    notes.push(`Not in the recipe: ${extras.map(name).join(', ')}${penalty > 0 ? ` (−${Math.round(penalty)} pts)` : ''}.`)
  }
  if (!missing.length && !extras.length) notes.push('Every ingredient is correct, nothing extra.')
  points = Math.max(0, Math.round(points))
  return { key: 'ingredients', label: 'Correct ingredients', points, max, status: status(points, max), notes }
}

function scoreAmounts(recipe: Recipe, got: Map<string, number>): CategoryScore {
  const max = MAX_POINTS.amounts
  const notes: string[] = []
  let share = 0
  for (const ri of recipe.ingredients) {
    const actual = got.get(ri.id) ?? 0
    const ing = INGREDIENT_MAP[ri.id]
    if (actual <= 0) continue
    if (amountWithinTolerance(ri.id, actual, ri.amount)) {
      share += 1
    } else {
      const unit = ing?.unit ?? 'ml'
      const loose = unit === 'ml' ? withinTolerance(actual, ri.amount, 0.3) : withinDiscreteTolerance(actual, ri.amount, 0.3)
      share += loose ? 0.5 : 0
      const direction = actual > ri.amount ? 'too much' : 'too little'
      notes.push(
        `${name(ri.id)}: ${direction} — you poured ${formatAmountShort(ing, actual)}, the recipe wants ${formatAmountShort(ing, ri.amount)} (±${Math.round(AMOUNT_TOLERANCE * 100)}%).`,
      )
    }
  }
  const points = Math.round((max * share) / recipe.ingredients.length)
  if (!notes.length && points === max) notes.push(`All amounts within ±${Math.round(AMOUNT_TOLERANCE * 100)}%.`)
  return { key: 'amounts', label: 'Amounts within tolerance', points, max, status: status(points, max), notes }
}

function scoreGlass(recipe: Recipe, glass: GlassType | null): CategoryScore {
  const max = MAX_POINTS.glass
  if (!glass) return { key: 'glass', label: 'Correct glass', points: 0, max, status: 'bad', notes: ['No glass was served.'] }
  if (glass === recipe.glass) {
    return { key: 'glass', label: 'Correct glass', points: max, max, status: 'ok', notes: [`${GLASS_MAP[glass].name} is right.`] }
  }
  const family = GLASS_FAMILIES.some((f) => f.includes(glass) && f.includes(recipe.glass))
  const points = family ? Math.round(max / 2) : 0
  return {
    key: 'glass',
    label: 'Correct glass',
    points,
    max,
    status: status(points, max),
    notes: [
      `You used a ${GLASS_MAP[glass].name}; this drink is served in a ${GLASS_MAP[recipe.glass].name}.${family ? ' Close enough for half marks.' : ''}`,
    ],
  }
}

function scoreMethod(recipe: Recipe, served: ServedDrink): CategoryScore {
  const max = MAX_POINTS.method
  const want = recipe.method
  const got = served.method
  const notes: string[] = []
  let points = 0
  if (want === got) {
    points = max
    if ((want === 'shake' || want === 'stir') && !served.chilledWithIce) {
      points = Math.round(max * 0.5)
      notes.push(`You ${want === 'shake' ? 'shook' : 'stirred'} without ice, so the drink was neither chilled nor diluted.`)
    } else {
      notes.push(`${METHOD_LABELS[want]} is the right technique.`)
    }
  } else if ((want === 'build' && got === 'layer') || (want === 'layer' && got === 'build')) {
    points = Math.round(max * 0.5)
    notes.push(`This drink should be ${want === 'layer' ? 'layered over a bar spoon' : 'built straight in the glass'}; you ${got === 'layer' ? 'layered it' : 'built it'}.`)
  } else {
    const explain: Record<Method, string> = {
      build: 'built directly in the glass',
      shake: 'shaken with ice and strained',
      stir: 'stirred with ice in a mixing glass and strained',
      blend: 'blended with crushed ice',
      layer: 'layered over the back of a bar spoon',
    }
    notes.push(`This drink should be ${explain[want]}; you ${got === 'build' ? 'built it in the glass' : explain[got].replace(/^(\w)/, (m) => m)}.`)
  }
  return { key: 'method', label: 'Correct method', points, max, status: status(points, max), notes }
}

function scoreIce(recipe: Recipe, ice: IceType): CategoryScore {
  const max = MAX_POINTS.ice
  if (ice === recipe.ice) {
    return { key: 'ice', label: 'Correct ice', points: max, max, status: 'ok', notes: [`${ICE_LABELS[recipe.ice]} — correct.`] }
  }
  const bothIce = ice !== 'none' && recipe.ice !== 'none'
  const points = bothIce ? Math.round(max / 2) : 0
  return {
    key: 'ice',
    label: 'Correct ice',
    points,
    max,
    status: status(points, max),
    notes: [`Served with ${ICE_LABELS[ice].toLowerCase()}; the recipe calls for ${ICE_LABELS[recipe.ice].toLowerCase()}.`],
  }
}

function scoreRim(recipe: Recipe, rim: RimType): CategoryScore {
  const max = MAX_POINTS.rim
  if (rim === recipe.rim) {
    return {
      key: 'rim',
      label: 'Correct rim',
      points: max,
      max,
      status: 'ok',
      notes: [recipe.rim === 'none' ? 'No rim, as it should be.' : `${recipe.rim === 'salt' ? 'Salt' : 'Sugar'} rim — correct.`],
    }
  }
  const note =
    recipe.rim === 'none'
      ? `This drink has no rim, but you added a ${rim} rim.`
      : rim === 'none'
        ? `Missing the ${recipe.rim} rim.`
        : `You rimmed with ${rim}; the recipe wants ${recipe.rim}.`
  return { key: 'rim', label: 'Correct rim', points: 0, max, status: 'bad', notes: [note] }
}

function scoreGarnish(recipe: Recipe, garnishes: GarnishId[]): CategoryScore {
  const max = MAX_POINTS.garnish
  const want = new Set(recipe.garnish)
  const got = new Set(garnishes)
  const matched = [...want].filter((g) => got.has(g))
  const missing = [...want].filter((g) => !got.has(g))
  const extras = [...got].filter((g) => !want.has(g))
  const gname = (g: GarnishId) => GARNISH_MAP[g]?.name ?? g
  const notes: string[] = []
  let points: number
  if (want.size === 0) {
    points = extras.length ? Math.round(max / 2) : max
    if (extras.length) notes.push(`This drink is served without garnish; you added ${extras.map(gname).join(', ')}.`)
    else notes.push('No garnish needed.')
  } else {
    points = (max * matched.length) / want.size - 2 * extras.length
    points = Math.max(0, Math.round(points))
    if (missing.length) notes.push(`Missing garnish: ${missing.map(gname).join(', ')}.`)
    if (extras.length) notes.push(`Extra garnish: ${extras.map(gname).join(', ')}.`)
    if (!missing.length && !extras.length) notes.push('Garnish is spot on.')
  }
  return { key: 'garnish', label: 'Correct garnish', points, max, status: status(points, max), notes }
}

export function scoreDrink(recipe: Recipe, served: ServedDrink): ScoreResult {
  const got = canonicalTotals(served.contents)
  const categories: CategoryScore[] = [
    scoreIngredients(recipe, got),
    scoreAmounts(recipe, got),
    scoreGlass(recipe, served.glass),
    scoreMethod(recipe, served),
    scoreIce(recipe, served.ice),
    scoreRim(recipe, served.rim),
    scoreGarnish(recipe, served.garnishes),
  ]
  const total = Math.max(0, Math.min(100, categories.reduce((s, c) => s + c.points, 0)))
  let verdict: string
  if (total >= MASTER_SCORE) verdict = 'Mastered! That is a professional pour.'
  else if (total >= 80) verdict = 'Excellent. A couple of details away from perfect.'
  else if (total >= PASS_SCORE) verdict = 'Good work. The drink is recognisable; tighten up the details.'
  else if (total >= 50) verdict = 'Getting there. Check the breakdown and try again.'
  else verdict = 'Not this time. Study the recipe and have another go.'
  return { total, categories, verdict, passed: total >= PASS_SCORE, mastered: total >= MASTER_SCORE }
}

/** Find the recipe that best matches a served drink (used by the free bar to name what you made). */
export function identifyDrink(recipes: Recipe[], served: ServedDrink): { recipe: Recipe; result: ScoreResult } | null {
  let best: { recipe: Recipe; result: ScoreResult } | null = null
  for (const recipe of recipes) {
    const result = scoreDrink(recipe, served)
    if (!best || result.total > best.result.total) best = { recipe, result }
  }
  return best
}
