import { describe, expect, it } from 'vitest'
import { getRecipe, RECIPES } from '../data/recipes'
import { identifyDrink, scoreDrink, type ServedDrink } from './scoring'

function perfect(id: string): ServedDrink {
  const r = getRecipe(id)!
  return {
    glass: r.glass,
    contents: r.ingredients.map((i) => ({ id: i.id, amount: i.amount })),
    ice: r.ice,
    method: r.method,
    chilledWithIce: true,
    rim: r.rim,
    garnishes: [...r.garnish],
    muddled: !!r.muddle,
  }
}

describe('scoring', () => {
  it('gives a perfect drink 100', () => {
    for (const r of RECIPES) {
      const result = scoreDrink(r, perfect(r.id))
      expect(result.total, r.id).toBe(100)
      expect(result.mastered).toBe(true)
    }
  })

  it('accepts amounts within 15% and penalises those outside', () => {
    const r = getRecipe('margarita')!
    const ok = perfect('margarita')
    ok.contents = [
      { id: 'tequila', amount: 55 },
      { id: 'triple-sec', amount: 18 },
      { id: 'lime-juice', amount: 16 },
    ]
    expect(scoreDrink(r, ok).total).toBe(100)

    const over = perfect('margarita')
    over.contents = [
      { id: 'tequila', amount: 80 },
      { id: 'triple-sec', amount: 20 },
      { id: 'lime-juice', amount: 15 },
    ]
    const res = scoreDrink(r, over)
    const amounts = res.categories.find((c) => c.key === 'amounts')!
    expect(amounts.points).toBeLessThan(amounts.max)
    expect(amounts.notes.join(' ')).toMatch(/too much/)
    expect(res.categories.find((c) => c.key === 'ingredients')!.points).toBe(30)
  })

  it('treats a second brand of vodka as vodka', () => {
    const r = getRecipe('screwdriver')!
    const d = perfect('screwdriver')
    d.contents = [
      { id: 'wheat-vodka', amount: 50 },
      { id: 'orange-juice', amount: 120 },
    ]
    expect(scoreDrink(r, d).total).toBe(100)
  })

  it('penalises missing and extra ingredients', () => {
    const r = getRecipe('negroni')!
    const d = perfect('negroni')
    d.contents = [
      { id: 'gin', amount: 30 },
      { id: 'campari', amount: 30 },
      { id: 'orange-juice', amount: 30 },
    ]
    const res = scoreDrink(r, d)
    const ing = res.categories.find((c) => c.key === 'ingredients')!
    expect(ing.points).toBe(15)
    expect(ing.notes.join(' ')).toMatch(/Missing: Sweet Vermouth/)
    expect(ing.notes.join(' ')).toMatch(/Not in the recipe: Orange Juice/)
  })

  it('scores glass, method, ice, rim and garnish separately with explanations', () => {
    const r = getRecipe('margarita')!
    const d = perfect('margarita')
    d.glass = 'coupe'
    d.method = 'stir'
    d.rim = 'none'
    d.garnishes = ['lemon-twist']
    d.ice = 'cubes'
    const res = scoreDrink(r, d)
    const by = Object.fromEntries(res.categories.map((c) => [c.key, c]))
    expect(by.glass.points).toBe(0)
    expect(by.method.points).toBe(0)
    expect(by.method.notes[0]).toMatch(/shaken/)
    expect(by.rim.points).toBe(0)
    expect(by.rim.notes[0]).toMatch(/Missing the salt rim/)
    expect(by.garnish.points).toBe(0)
    expect(by.ice.points).toBe(0)
    expect(res.total).toBe(50)
    expect(res.passed).toBe(false)
  })

  it('gives partial credit for a close glass and for shaking without ice', () => {
    const r = getRecipe('daiquiri')!
    const d = perfect('daiquiri')
    d.glass = 'martini'
    d.chilledWithIce = false
    const res = scoreDrink(r, d)
    const by = Object.fromEntries(res.categories.map((c) => [c.key, c]))
    expect(by.glass.points).toBe(5)
    expect(by.method.points).toBe(8)
    expect(by.method.notes[0]).toMatch(/without ice/)
  })

  it('does not reward an unwanted garnish or rim', () => {
    const r = getRecipe('daiquiri')!
    const d = perfect('daiquiri')
    d.garnishes = ['lime-wheel']
    d.rim = 'sugar'
    const res = scoreDrink(r, d)
    const by = Object.fromEntries(res.categories.map((c) => [c.key, c]))
    expect(by.garnish.points).toBe(5)
    expect(by.rim.points).toBe(0)
  })

  it('identifies the closest recipe for a free-bar drink', () => {
    const d: ServedDrink = {
      glass: 'highball',
      contents: [
        { id: 'potato-vodka', amount: 48 },
        { id: 'lemon-lime-soda', amount: 125 },
      ],
      ice: 'cubes',
      method: 'build',
      chilledWithIce: false,
      rim: 'none',
      garnishes: ['lime-wedge'],
      muddled: false,
    }
    const best = identifyDrink(RECIPES, d)!
    expect(best.recipe.id).toBe('vodka-7up')
    expect(best.result.total).toBe(100)
  })
})
