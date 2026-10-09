import type { GarnishId, GlassType, IceType, Recipe, RecipeIngredient, RimType } from '../data/types'
import { INGREDIENT_MAP, canonicalId } from '../data/ingredients'
import { GLASS_MAP } from '../data/glasses'
import { GARNISH_MAP } from '../data/garnishes'
import { formatAmount } from './units'
import { amountWithinTolerance } from './scoring'
import type { ContentEntry } from './pouring'

export type VesselId = 'glass' | 'shaker' | 'mixing' | 'blender'

export const VESSEL_LABELS: Record<VesselId, string> = {
  glass: 'the glass',
  shaker: 'the shaker',
  mixing: 'the mixing glass',
  blender: 'the blender',
}

export interface VesselSnapshot {
  ice: IceType
  /** Everything ever poured into this vessel for the current build (survives straining). */
  history: ContentEntry[]
  muddled: boolean
  shaken: boolean
  stirred: boolean
  blended: boolean
}

export interface GlassSnapshot extends VesselSnapshot {
  type: GlassType
  rimWet: boolean
  rim: RimType
  garnishes: GarnishId[]
  layerMode: boolean
  /** Vessels whose contents were strained / poured into this glass. */
  receivedFrom: VesselId[]
}

export interface BarSnapshot {
  glass: GlassSnapshot | null
  shaker: VesselSnapshot
  mixing: VesselSnapshot
  blender: VesselSnapshot
  served: boolean
}

export type StepTarget =
  | { kind: 'glass'; id: GlassType }
  | { kind: 'bottle'; id: string; vessel: VesselId }
  | { kind: 'ice'; id: Exclude<IceType, 'none'>; vessel: VesselId }
  | { kind: 'tool'; id: 'muddler' | 'spoon' | 'strainer' | 'shaker' | 'mixing' | 'blender'; vessel: VesselId }
  | { kind: 'rim'; id: 'lime' | 'salt' | 'sugar' }
  | { kind: 'garnish'; id: GarnishId }
  | { kind: 'action'; id: 'shake' | 'stir' | 'blend' | 'strain' | 'pour-out' | 'layer-mode' | 'serve' }

export interface GuidedStep {
  id: string
  text: string
  detail?: string
  target: StepTarget
  check: (s: BarSnapshot) => StepStatus
}

export type StepStatus = 'pending' | 'done' | 'over'

const SPIRIT_CATEGORIES = new Set(['vodka', 'gin', 'rum', 'tequila', 'whiskey', 'brandy', 'liqueurs', 'wine-sparkling'])

function isSpirit(id: string): boolean {
  const ing = INGREDIENT_MAP[id]
  if (!ing) return false
  if (SPIRIT_CATEGORIES.has(ing.category)) return true
  return ing.category === 'vermouth-bitters' && ing.unit === 'ml'
}

function vesselOf(s: BarSnapshot, v: VesselId): VesselSnapshot | null {
  if (v === 'glass') return s.glass
  return s[v]
}

function amountIn(s: BarSnapshot, v: VesselId, id: string): number {
  const vessel = vesselOf(s, v)
  if (!vessel) return 0
  let total = 0
  for (const c of vessel.history) if (canonicalId(c.id) === id) total += c.amount
  return total
}

function pourStep(ri: RecipeIngredient, vessel: VesselId, index: number): GuidedStep {
  const ing = INGREDIENT_MAP[ri.id]
  const verb = ing.unit === 'piece' ? 'Add' : ing.unit === 'dash' ? 'Dash' : ing.unit === 'tsp' ? 'Spoon' : 'Pour'
  const amount = formatAmount(ing, ri.amount)
  const note = ri.note ? ` (${ri.note})` : ''
  return {
    id: `pour-${index}-${ri.id}`,
    text: `${verb} ${amount} of ${ing.name} into ${VESSEL_LABELS[vessel]}${note}`,
    detail: ing.unit === 'ml' ? `Hold the bottle over ${VESSEL_LABELS[vessel]} until the counter reads ${amount}. Tolerance ±15%.` : undefined,
    target: { kind: 'bottle', id: ri.id, vessel },
    check: (s) => {
      const got = amountIn(s, vessel, ri.id)
      if (got <= 0) return 'pending'
      const unit = ing.unit
      const tooMuch = unit === 'ml' ? got > ri.amount * 1.15 + 1e-9 : got > ri.amount + Math.max(1, ri.amount * 0.15) + 1e-9
      if (tooMuch) return 'over'
      const enough = unit === 'ml' ? got >= ri.amount * 0.85 - 1e-9 : got >= ri.amount - Math.max(1, ri.amount * 0.15) - 1e-9
      if (enough && amountWithinTolerance(ri.id, got, ri.amount)) return 'done'
      return enough ? 'done' : 'pending'
    },
  }
}

function iceStep(vessel: VesselId, ice: Exclude<IceType, 'none'>): GuidedStep {
  const label = ice === 'cubes' ? 'ice cubes' : 'crushed ice'
  return {
    id: `ice-${vessel}`,
    text: `Add ${label} to ${VESSEL_LABELS[vessel]}`,
    detail: `Drag ${label} from the ice bucket into ${VESSEL_LABELS[vessel]}.`,
    target: { kind: 'ice', id: ice, vessel },
    check: (s) => (vesselOf(s, vessel)?.ice === ice ? 'done' : 'pending'),
  }
}

/** Build the ordered checklist for making a recipe. */
export function buildGuidedSteps(recipe: Recipe): GuidedStep[] {
  const steps: GuidedStep[] = []
  const glassName = GLASS_MAP[recipe.glass].name

  steps.push({
    id: 'glass',
    text: `Take a ${glassName}`,
    detail: 'Pick it from the glass rack and place it on the counter.',
    target: { kind: 'glass', id: recipe.glass },
    check: (s) => (s.glass?.type === recipe.glass ? 'done' : 'pending'),
  })

  if (recipe.rim !== 'none') {
    steps.push({
      id: 'rim-wet',
      text: 'Wet the rim on the lime wedge',
      detail: 'Drag the empty glass onto the lime dish to moisten the rim.',
      target: { kind: 'rim', id: 'lime' },
      check: (s) => (s.glass && (s.glass.rimWet || s.glass.rim !== 'none') ? 'done' : 'pending'),
    })
    steps.push({
      id: 'rim-dip',
      text: `Dip the rim in ${recipe.rim}`,
      detail: `Drag the wet glass onto the ${recipe.rim} dish.`,
      target: { kind: 'rim', id: recipe.rim },
      check: (s) => (s.glass?.rim === recipe.rim ? 'done' : 'pending'),
    })
  }

  const vessel: VesselId =
    recipe.method === 'shake' ? 'shaker' : recipe.method === 'stir' ? 'mixing' : recipe.method === 'blend' ? 'blender' : 'glass'

  const rinses = recipe.ingredients.filter((i) => i.note === 'rinse the glass')
  const main = recipe.ingredients.filter((i) => !i.top && i.note !== 'rinse the glass')
  const tops = recipe.ingredients.filter((i) => i.top)

  let index = 0
  for (const ri of rinses) steps.push(pourStep(ri, 'glass', index++))

  let muddleSet: RecipeIngredient[] = []
  let rest = main
  if (recipe.muddle) {
    const firstSpirit = main.findIndex((i) => isSpirit(i.id))
    muddleSet = firstSpirit < 0 ? main : main.slice(0, firstSpirit)
    rest = firstSpirit < 0 ? [] : main.slice(firstSpirit)
  }

  if (recipe.method === 'layer') {
    steps.push({
      id: 'layer-mode',
      text: 'Hook the bar spoon over the glass to pour over it',
      detail: 'Drag the bar spoon onto the glass so each pour runs gently down the spoon and floats on the last layer.',
      target: { kind: 'tool', id: 'spoon', vessel: 'glass' },
      check: (s) => (s.glass?.layerMode ? 'done' : 'pending'),
    })
  }

  for (const ri of muddleSet) steps.push(pourStep(ri, vessel, index++))
  if (recipe.muddle) {
    steps.push({
      id: 'muddle',
      text: `Muddle in ${VESSEL_LABELS[vessel]}`,
      detail: 'Drag the muddler onto the vessel and press to release the oils and dissolve the sugar.',
      target: { kind: 'tool', id: 'muddler', vessel },
      check: (s) => (vesselOf(s, vessel)?.muddled ? 'done' : 'pending'),
    })
  }

  if (recipe.method === 'shake' || recipe.method === 'stir') {
    steps.push(iceStep(vessel, 'cubes'))
  } else if (recipe.method === 'build' && recipe.ice !== 'none') {
    steps.push(iceStep('glass', recipe.ice))
  }

  for (const ri of rest) steps.push(pourStep(ri, vessel, index++))

  if (recipe.method === 'blend') {
    steps.push(iceStep('blender', 'crushed'))
    steps.push({
      id: 'blend',
      text: 'Blend until smooth',
      detail: 'Press Blend on the blender.',
      target: { kind: 'action', id: 'blend' },
      check: (s) => (s.blender.blended ? 'done' : 'pending'),
    })
    steps.push({
      id: 'pour-out',
      text: `Pour the blender into the ${glassName}`,
      detail: 'Press Pour on the blender with the glass on the counter.',
      target: { kind: 'action', id: 'pour-out' },
      check: (s) => (s.glass?.receivedFrom.includes('blender') ? 'done' : 'pending'),
    })
  }

  if (recipe.method === 'shake') {
    steps.push({
      id: 'shake',
      text: 'Shake hard for 10–12 seconds',
      detail: 'Press Shake on the shaker. The cap closes and the shaker chills the drink.',
      target: { kind: 'action', id: 'shake' },
      check: (s) => (s.shaker.shaken ? 'done' : 'pending'),
    })
  }
  if (recipe.method === 'stir') {
    steps.push({
      id: 'stir',
      text: 'Stir with the bar spoon for 20–30 seconds',
      detail: 'Press Stir on the mixing glass or drag the bar spoon onto it.',
      target: { kind: 'action', id: 'stir' },
      check: (s) => (s.mixing.stirred ? 'done' : 'pending'),
    })
  }
  if (recipe.method === 'shake' || recipe.method === 'stir') {
    if (recipe.ice !== 'none') steps.push(iceStep('glass', recipe.ice))
    const from: VesselId = recipe.method === 'shake' ? 'shaker' : 'mixing'
    steps.push({
      id: 'strain',
      text: `Strain into the ${glassName}`,
      detail: `Press Strain on ${VESSEL_LABELS[from]} (or drag the strainer onto it) with the glass on the counter.`,
      target: { kind: 'action', id: 'strain' },
      check: (s) => (s.glass?.receivedFrom.includes(from) ? 'done' : 'pending'),
    })
  }

  for (const ri of tops) steps.push(pourStep(ri, 'glass', index++))

  for (const g of recipe.garnish) {
    steps.push({
      id: `garnish-${g}`,
      text: `Garnish with ${GARNISH_MAP[g].name.toLowerCase()}`,
      detail: 'Drag it from the garnish tray onto the glass.',
      target: { kind: 'garnish', id: g },
      check: (s) => (s.glass?.garnishes.includes(g) ? 'done' : 'pending'),
    })
  }

  steps.push({
    id: 'serve',
    text: 'Serve the drink',
    detail: 'Press Serve to finish and compare your drink with the recipe.',
    target: { kind: 'action', id: 'serve' },
    check: (s) => (s.served ? 'done' : 'pending'),
  })

  return steps
}

export interface GuidedProgress {
  statuses: StepStatus[]
  /** Index of the first pending step, or steps.length when everything is done. */
  current: number
  overPoured: string[]
}

export function evaluateGuided(steps: GuidedStep[], snapshot: BarSnapshot): GuidedProgress {
  const statuses = steps.map((st) => st.check(snapshot))
  const current = statuses.findIndex((s) => s === 'pending')
  const overPoured = steps.filter((_, i) => statuses[i] === 'over').map((st) => st.text)
  return { statuses, current: current < 0 ? steps.length : current, overPoured }
}
