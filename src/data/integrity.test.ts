import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { RECIPES } from './recipes'
import { INGREDIENT_MAP, INGREDIENTS, UNIT_ML, CATEGORY_ORDER } from './ingredients'
import { GLASS_MAP, GLASSES } from './glasses'
import { GARNISH_MAP, GARNISHES } from './garnishes'
import type { RecipeImage } from './types'
import recipeImages from './recipeImages.json'
import { isValidRasterImage, isValidSvg } from '../../scripts/imageCheck'

const VALID_METHODS = ['build', 'shake', 'stir', 'blend', 'layer']
const VALID_DIFFICULTIES = ['easy', 'medium', 'hard']
const VALID_ICE = ['cubes', 'crushed', 'none']
const VALID_RIMS = ['none', 'salt', 'sugar']

/** IBA official specs (ml) used to cross-check amounts. */
const IBA_SPECS: Record<string, Record<string, number>> = {
  margarita: { tequila: 50, 'triple-sec': 20, 'lime-juice': 15 },
  daiquiri: { 'white-rum': 60, 'lime-juice': 20, 'simple-syrup': 10 },
  negroni: { gin: 30, campari: 30, 'sweet-vermouth': 30 },
  'dry-martini': { gin: 60, 'dry-vermouth': 10 },
  manhattan: { rye: 50, 'sweet-vermouth': 20, angostura: 1 },
  'whiskey-sour': { bourbon: 45, 'lemon-juice': 25, 'simple-syrup': 20 },
  cosmopolitan: { 'citron-vodka': 40, 'triple-sec': 15, 'lime-juice': 15, 'cranberry-juice': 30 },
  sidecar: { cognac: 50, 'triple-sec': 20, 'lemon-juice': 20 },
  'white-lady': { gin: 40, 'triple-sec': 30, 'lemon-juice': 20 },
  'last-word': { gin: 22.5, 'green-chartreuse': 22.5, maraschino: 22.5, 'lime-juice': 22.5 },
  aviation: { gin: 45, maraschino: 15, 'lemon-juice': 15 },
  'old-fashioned': { bourbon: 45, 'sugar-cube': 1, angostura: 2 },
  'espresso-martini': { vodka: 50, 'coffee-liqueur': 30, espresso: 30 },
  'moscow-mule': { vodka: 45, 'ginger-beer': 120 },
  'cuba-libre': { 'white-rum': 50, cola: 120, 'lime-juice': 10 },
  'pina-colada': { 'white-rum': 50, 'coconut-cream': 30, 'pineapple-juice': 50 },
  'tequila-sunrise': { tequila: 45, 'orange-juice': 90, grenadine: 15 },
  'sex-on-the-beach': { vodka: 40, 'peach-schnapps': 20, 'orange-juice': 40, 'cranberry-juice': 40 },
  'bloody-mary': { vodka: 45, 'tomato-juice': 90, 'lemon-juice': 15 },
  'long-island-iced-tea': { vodka: 15, tequila: 15, 'white-rum': 15, gin: 15, 'triple-sec': 15, 'lemon-juice': 30, 'simple-syrup': 20 },
  'singapore-sling': { gin: 30, 'cherry-liqueur': 15, 'triple-sec': 7.5, benedictine: 7.5, 'pineapple-juice': 120, 'lime-juice': 15, grenadine: 10, angostura: 1 },
  'french-75': { gin: 30, 'lemon-juice': 15, 'simple-syrup': 15, champagne: 60 },
  mojito: { 'white-rum': 45, 'lime-juice': 20, sugar: 2, 'mint-leaves': 6 },
  caipirinha: { cachaca: 60, 'lime-wedges': 4, sugar: 4 },
  'mai-tai': { 'orange-curacao': 15, orgeat: 15, 'lime-juice': 30 },
  boulevardier: { bourbon: 45, campari: 30, 'sweet-vermouth': 30 },
  americano: { campari: 30, 'sweet-vermouth': 30 },
  'hanky-panky': { gin: 45, 'sweet-vermouth': 45, fernet: 7.5 },
  'clover-club': { gin: 45, 'raspberry-syrup': 15, 'lemon-juice': 15 },
  'bees-knees': { gin: 52.5, 'lemon-juice': 22.5, 'orange-juice': 22.5 },
  'paper-plane': { bourbon: 22.5, aperol: 22.5, 'amaro-nonino': 22.5, 'lemon-juice': 22.5 },
  'naked-and-famous': { mezcal: 22.5, 'yellow-chartreuse': 22.5, aperol: 22.5, 'lime-juice': 22.5 },
  penicillin: { scotch: 60, 'lemon-juice': 22.5, 'honey-ginger-syrup': 22.5, 'islay-scotch': 7.5 },
  'tommys-margarita': { tequila: 45, 'lime-juice': 15, 'agave-syrup': 10 },
  'brandy-alexander': { cognac: 30, 'creme-de-cacao-dark': 30, cream: 30 },
  grasshopper: { 'creme-de-menthe-green': 20, 'creme-de-cacao-white': 20, cream: 20 },
  'b-52': { 'coffee-liqueur': 20, 'irish-cream': 20, 'grand-marnier': 20 },
  'between-the-sheets': { 'white-rum': 30, cognac: 30, 'triple-sec': 30, 'lemon-juice': 20 },
  'hemingway-special': { 'white-rum': 60, 'grapefruit-juice': 40, maraschino: 15, 'lime-juice': 15 },
  'pisco-sour': { pisco: 60, 'lemon-juice': 30, 'simple-syrup': 20, 'egg-white': 30 },
  'corpse-reviver-2': { gin: 30, 'triple-sec': 30, 'lillet-blanc': 30, 'lemon-juice': 30 },
  vesper: { gin: 45, vodka: 15, 'lillet-blanc': 7.5 },
  'rusty-nail': { scotch: 45, drambuie: 25 },
  'french-connection': { cognac: 35, amaretto: 35 },
  'black-russian': { vodka: 50, 'coffee-liqueur': 20 },
  'sea-breeze': { vodka: 40, 'cranberry-juice': 120, 'grapefruit-juice': 30 },
  'irish-coffee': { 'irish-whiskey': 50, 'hot-coffee': 120, cream: 50 },
  bellini: { prosecco: 100, 'peach-puree': 50 },
  mimosa: { champagne: 75, 'orange-juice': 75 },
  kir: { 'creme-de-cassis': 10, 'white-wine': 90 },
  spritz: { prosecco: 90, aperol: 60 },
  'lemon-drop': { 'citron-vodka': 25, 'triple-sec': 20, 'lemon-juice': 15 },
  'french-martini': { vodka: 45, 'raspberry-liqueur': 15, 'pineapple-juice': 15 },
  'mint-julep': { bourbon: 60 },
  sazerac: { rye: 50, 'sugar-cube': 1, peychauds: 2 },
  'vieux-carre': { rye: 30, cognac: 30, 'sweet-vermouth': 30 },
  stinger: { cognac: 50, 'creme-de-menthe-white': 20 },
  'golden-dream': { galliano: 20, 'triple-sec': 20, 'orange-juice': 20, cream: 10 },
  'yellow-bird': { 'white-rum': 30, galliano: 15, 'triple-sec': 15, 'lime-juice': 15 },
  'mary-pickford': { 'white-rum': 60, 'pineapple-juice': 60, grenadine: 10, maraschino: 5 },
  'planters-punch': { 'dark-rum': 45, 'orange-juice': 35, 'pineapple-juice': 35, 'lemon-juice': 20, grenadine: 10 },
  'gin-fizz': { gin: 45, 'lemon-juice': 30, 'simple-syrup': 10, 'soda-water': 80 },
  'ramos-gin-fizz': { gin: 45, 'lime-juice': 15, 'lemon-juice': 15, 'simple-syrup': 30, cream: 60, 'egg-white': 30 },
  'dark-n-stormy': { 'dark-rum': 60, 'ginger-beer': 100 },
  paloma: { tequila: 50, 'grapefruit-soda': 100 },
  bramble: { gin: 40, 'lemon-juice': 15, 'simple-syrup': 10, 'creme-de-mure': 15 },
  southside: { gin: 60, 'lemon-juice': 30, 'simple-syrup': 15 },
  'new-york-sour': { rye: 60, 'lemon-juice': 30, 'simple-syrup': 22.5, 'red-wine': 15 },
  tipperary: { 'irish-whiskey': 50, 'sweet-vermouth': 25, 'green-chartreuse': 15 },
  'champagne-cocktail': { champagne: 90, cognac: 10, angostura: 2, 'sugar-cube': 1 },
  'porto-flip': { cognac: 15, port: 45, 'egg-yolk': 10 },
  'brandy-crusta': { cognac: 52.5, maraschino: 7.5, 'lemon-juice': 15, angostura: 2 },
  'russian-spring-punch': { vodka: 25, 'creme-de-cassis': 15, 'lemon-juice': 25, 'simple-syrup': 10 },
  barracuda: { 'gold-rum': 45, galliano: 15, 'pineapple-juice': 60 },
  'old-cuban': { 'gold-rum': 45, 'lime-juice': 22.5, 'simple-syrup': 30, 'mint-leaves': 6, angostura: 2 },
  illegal: { mezcal: 30, 'overproof-rum': 15, falernum: 15, 'lime-juice': 22.5, 'simple-syrup': 15, maraschino: 7.5 },
  canchanchara: { 'white-rum': 60, 'honey-syrup': 15, 'lime-juice': 15 },
  'suffering-bastard': { cognac: 30, gin: 30, 'lime-juice': 15, angostura: 2 },
  fernandito: { fernet: 50 },
  martinez: { 'old-tom-gin': 45, 'sweet-vermouth': 45, maraschino: 5, 'orange-bitters': 2 },
  casino: { 'old-tom-gin': 40, maraschino: 10, 'lemon-juice': 10 },
  tuxedo: { 'old-tom-gin': 30, 'dry-vermouth': 30 },
  'monkey-gland': { gin: 50, 'orange-juice': 30 },
  paradise: { gin: 35, 'apricot-brandy': 20, 'orange-juice': 15 },
  'angel-face': { gin: 30, 'apricot-brandy': 30, 'apple-brandy': 30 },
  'horses-neck': { cognac: 40, 'ginger-ale': 120 },
  'pornstar-martini': { 'vanilla-vodka': 50, 'passion-fruit-liqueur': 15, 'passion-fruit-puree': 30, 'vanilla-syrup': 15, 'lime-juice': 15 },
}

const STIR_FORBIDDEN_CATEGORIES = new Set(['juices', 'dairy'])

describe('recipe data integrity', () => {
  it('has at least 150 recipes with unique ids and names', () => {
    expect(RECIPES.length).toBeGreaterThanOrEqual(150)
    const ids = new Set(RECIPES.map((r) => r.id))
    const names = new Set(RECIPES.map((r) => r.name.toLowerCase()))
    expect(ids.size).toBe(RECIPES.length)
    expect(names.size).toBe(RECIPES.length)
  })

  it('only uses ingredients that exist on the shelves', () => {
    const problems: string[] = []
    for (const r of RECIPES) {
      for (const i of r.ingredients) {
        const ing = INGREDIENT_MAP[i.id]
        if (!ing) problems.push(`${r.id}: unknown ingredient "${i.id}"`)
        else if (ing.equivalentTo) problems.push(`${r.id}: "${i.id}" is a brand alias; use "${ing.equivalentTo}"`)
      }
    }
    expect(problems).toEqual([])
  })

  it('only uses garnishes, glasses, methods, ice, rims and difficulties that exist', () => {
    for (const r of RECIPES) {
      for (const g of r.garnish) expect(GARNISH_MAP[g], `${r.id} garnish ${g}`).toBeDefined()
      expect(GLASS_MAP[r.glass], `${r.id} glass ${r.glass}`).toBeDefined()
      expect(VALID_METHODS, `${r.id} method`).toContain(r.method)
      expect(VALID_DIFFICULTIES, `${r.id} difficulty`).toContain(r.difficulty)
      expect(VALID_ICE, `${r.id} ice`).toContain(r.ice)
      expect(VALID_RIMS, `${r.id} rim`).toContain(r.rim)
      expect(r.description.length, `${r.id} description`).toBeGreaterThan(20)
      expect(new Set(r.garnish).size, `${r.id} duplicate garnish`).toBe(r.garnish.length)
    }
  })

  it('has at least one ingredient with a positive amount and no duplicates', () => {
    for (const r of RECIPES) {
      expect(r.ingredients.length, r.id).toBeGreaterThan(0)
      expect(r.ingredients.some((i) => i.amount > 0), r.id).toBe(true)
      for (const i of r.ingredients) expect(i.amount, `${r.id} ${i.id}`).toBeGreaterThan(0)
      const ids = r.ingredients.map((i) => i.id)
      expect(new Set(ids).size, `${r.id} duplicate ingredient`).toBe(ids.length)
    }
  })

  it('uses realistic bar amounts and fits in the glass', () => {
    for (const r of RECIPES) {
      let ml = 0
      for (const i of r.ingredients) {
        const ing = INGREDIENT_MAP[i.id]
        if (ing.unit === 'ml') {
          expect(i.amount, `${r.id} ${i.id} ml`).toBeGreaterThanOrEqual(2.5)
          expect(i.amount, `${r.id} ${i.id} ml`).toBeLessThanOrEqual(200)
        } else if (ing.unit === 'dash') {
          expect(i.amount, `${r.id} ${i.id} dashes`).toBeLessThanOrEqual(6)
        } else if (ing.unit === 'tsp') {
          expect(i.amount, `${r.id} ${i.id} tsp`).toBeLessThanOrEqual(4)
        } else {
          expect(i.amount, `${r.id} ${i.id} pieces`).toBeLessThanOrEqual(10)
        }
        ml += i.amount * UNIT_ML[ing.unit]
      }
      expect(ml, `${r.id} total ${ml} ml exceeds ${r.glass}`).toBeLessThanOrEqual(GLASS_MAP[r.glass].capacityMl)
      expect(ml, `${r.id} is tiny`).toBeGreaterThanOrEqual(40)
    }
  })

  it('never stirs juices, cream or eggs and always blends with crushed ice', () => {
    for (const r of RECIPES) {
      if (r.method === 'stir') {
        for (const i of r.ingredients) {
          const ing = INGREDIENT_MAP[i.id]
          expect(STIR_FORBIDDEN_CATEGORIES.has(ing.category), `${r.id} stirs ${i.id}`).toBe(false)
        }
      }
      if (r.method === 'blend') expect(r.ice, `${r.id} blend ice`).toBe('crushed')
      if (r.method === 'layer') {
        expect(r.ingredients.length, `${r.id} layers`).toBeGreaterThanOrEqual(2)
        expect(r.ingredients.some((i) => i.top), `${r.id} layered drinks have no toppers`).toBe(false)
      }
      if (r.method === 'shake' || r.method === 'stir') {
        expect(r.ingredients.filter((i) => !i.top).length, `${r.id} nothing to ${r.method}`).toBeGreaterThan(0)
      }
      if (r.muddle) {
        expect(
          r.ingredients.some((i) => ['piece', 'tsp'].includes(INGREDIENT_MAP[i.id].unit) || i.id === 'sugar-cube'),
          `${r.id} muddles nothing solid`,
        ).toBe(true)
      }
    }
  })

  it('keeps rims where real recipes have them', () => {
    const rimmed = RECIPES.filter((r) => r.rim !== 'none').map((r) => r.id)
    expect(rimmed).toContain('margarita')
    expect(rimmed).toContain('salty-dog')
    expect(rimmed).toContain('lemon-drop')
    expect(rimmed).toContain('brandy-crusta')
    expect(rimmed).not.toContain('daiquiri')
    expect(rimmed).not.toContain('negroni')
    expect(rimmed).not.toContain('old-fashioned')
    for (const r of RECIPES) {
      if (r.rim !== 'none') expect(['margarita', 'highball', 'rocks', 'martini', 'coupe', 'shot', 'collins']).toContain(r.glass)
    }
  })

  it('matches IBA specifications where they exist', () => {
    const problems: string[] = []
    for (const [id, spec] of Object.entries(IBA_SPECS)) {
      const r = RECIPES.find((x) => x.id === id)
      if (!r) {
        problems.push(`missing IBA recipe ${id}`)
        continue
      }
      for (const [ing, amount] of Object.entries(spec)) {
        const got = r.ingredients.find((i) => i.id === ing)
        if (!got) problems.push(`${id}: missing ${ing}`)
        else if (Math.abs(got.amount - amount) > 1e-9) problems.push(`${id}: ${ing} is ${got.amount}, IBA says ${amount}`)
      }
    }
    expect(problems).toEqual([])
  })

  it('assigns difficulty sensibly', () => {
    for (const r of RECIPES) {
      if (r.difficulty === 'easy') {
        expect(r.ingredients.length, `${r.id} easy with many ingredients`).toBeLessThanOrEqual(4)
        expect(r.rim, `${r.id} easy with rim`).toBe('none')
        expect(r.muddle ?? false, `${r.id} easy with muddle`).toBe(false)
        expect(r.ingredients.some((i) => i.id === 'egg-white'), `${r.id} easy with egg`).toBe(false)
      }
      if (r.difficulty === 'hard') {
        const complex =
          r.ingredients.length >= 5 ||
          (r.ingredients.length >= 4 && r.method !== 'build') ||
          r.rim !== 'none' ||
          r.muddle ||
          r.method === 'layer' ||
          r.method === 'blend' ||
          r.ingredients.some((i) => ['egg-white', 'egg-yolk', 'absinthe'].includes(i.id))
        expect(complex, `${r.id} hard but simple`).toBe(true)
      }
    }
    const counts = { easy: 0, medium: 0, hard: 0 }
    for (const r of RECIPES) counts[r.difficulty]++
    expect(counts.easy).toBeGreaterThanOrEqual(20)
    expect(counts.medium).toBeGreaterThanOrEqual(20)
    expect(counts.hard).toBeGreaterThanOrEqual(20)
  })

  it('covers the required classics', () => {
    const ids = new Set(RECIPES.map((r) => r.id))
    for (const id of [
      'vodka-7up', 'rum-and-coke', 'gin-and-tonic', 'screwdriver',
      'ramos-gin-fizz', 'clover-club', 'aviation', 'last-word', 'zombie', 'mai-tai',
      'margarita', 'negroni', 'old-fashioned', 'manhattan', 'daiquiri', 'mojito',
    ]) expect(ids.has(id), id).toBe(true)
    expect(RECIPES.filter((r) => r.iba).length).toBeGreaterThanOrEqual(70)
  })
})

describe('bar inventory integrity', () => {
  it('has unique ingredient ids and valid aliases, colours and bottle shapes', () => {
    const ids = new Set(INGREDIENTS.map((i) => i.id))
    expect(ids.size).toBe(INGREDIENTS.length)
    for (const i of INGREDIENTS) {
      expect(i.color, i.id).toMatch(/^#[0-9a-f]{6}$/i)
      expect(i.opacity, i.id).toBeGreaterThan(0)
      expect(i.opacity, i.id).toBeLessThanOrEqual(1)
      expect(i.label.length, i.id).toBeLessThanOrEqual(15)
      expect(CATEGORY_ORDER, i.id).toContain(i.category)
      if (i.equivalentTo) {
        expect(INGREDIENT_MAP[i.equivalentTo], `${i.id} alias target`).toBeDefined()
        expect(INGREDIENT_MAP[i.equivalentTo].equivalentTo, `${i.id} chained alias`).toBeUndefined()
      }
      if (i.unit === 'piece') expect(i.pieceName, `${i.id} pieceName`).toBeDefined()
    }
  })

  it('has every category stocked with several bottles', () => {
    for (const c of CATEGORY_ORDER) {
      expect(INGREDIENTS.filter((i) => i.category === c).length, c).toBeGreaterThanOrEqual(3)
    }
  })

  it('uses realistic liquid colours', () => {
    const clear = ['vodka', 'gin', 'white-rum', 'tequila', 'soda-water', 'simple-syrup']
    for (const id of clear) expect(INGREDIENT_MAP[id].opacity, id).toBeLessThan(0.3)
    const dark = ['cola', 'coffee-liqueur', 'dark-rum', 'espresso', 'angostura']
    for (const id of dark) {
      const n = parseInt(INGREDIENT_MAP[id].color.slice(1), 16)
      const r = (n >> 16) & 255
      const g = (n >> 8) & 255
      const b = n & 255
      expect((r + g + b) / 3, id).toBeLessThan(110)
      expect(INGREDIENT_MAP[id].opacity, id).toBeGreaterThan(0.8)
    }
    expect(INGREDIENT_MAP['blue-curacao'].color).toMatch(/^#1e6fd9$/)
    expect(INGREDIENT_MAP['grenadine'].color).toMatch(/^#c8102e$/)
    expect(INGREDIENT_MAP['orange-juice'].color).toMatch(/^#f5a623$/)
  })

  it('defines every glass and garnish once', () => {
    expect(new Set(GLASSES.map((g) => g.id)).size).toBe(GLASSES.length)
    expect(new Set(GARNISHES.map((g) => g.id)).size).toBe(GARNISHES.length)
    for (const g of GLASSES) expect(g.capacityMl).toBeGreaterThan(40)
  })
})

describe('recipe images', () => {
  const images = recipeImages as Record<string, RecipeImage>
  const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'public')

  it('has a local, valid image for every recipe', () => {
    const problems: string[] = []
    for (const r of RECIPES) {
      const entry = images[r.id]
      if (!entry) {
        problems.push(`${r.id}: no image entry`)
        continue
      }
      const file = join(root, entry.src)
      if (!existsSync(file)) {
        problems.push(`${r.id}: ${entry.src} missing`)
        continue
      }
      const buf = readFileSync(file)
      if (entry.source === 'cocktaildb') {
        if (!isValidRasterImage(buf)) problems.push(`${r.id}: ${entry.src} is not a valid JPEG/PNG over 5 KB`)
      } else if (!isValidSvg(buf.toString('utf8'))) {
        problems.push(`${r.id}: ${entry.src} is not a valid SVG`)
      }
      if (!entry.src.startsWith('/drinks/')) problems.push(`${r.id}: image must be bundled locally, got ${entry.src}`)
    }
    expect(problems).toEqual([])
  })
})
