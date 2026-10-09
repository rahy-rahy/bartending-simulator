import { describe, expect, it } from 'vitest'
import { getRecipe } from '../data/recipes'
import { buildGuidedSteps, evaluateGuided, type BarSnapshot, type VesselSnapshot } from './guided'

function vessel(over: Partial<VesselSnapshot> = {}): VesselSnapshot {
  return { ice: 'none', history: [], muddled: false, shaken: false, stirred: false, blended: false, ...over }
}

function snapshot(over: Partial<BarSnapshot> = {}): BarSnapshot {
  return { glass: null, shaker: vessel(), mixing: vessel(), blender: vessel(), served: false, ...over }
}

describe('guided mode', () => {
  it('builds the right sequence for a shaken, rimmed drink', () => {
    const steps = buildGuidedSteps(getRecipe('margarita')!)
    expect(steps.map((s) => s.id)).toEqual([
      'glass',
      'rim-wet',
      'rim-dip',
      'ice-shaker',
      'pour-0-tequila',
      'pour-1-triple-sec',
      'pour-2-lime-juice',
      'shake',
      'strain',
      'garnish-lime-wedge',
      'serve',
    ])
  })

  it('puts muddled ingredients before the muddle step and the spirit after', () => {
    const steps = buildGuidedSteps(getRecipe('mojito')!)
    expect(steps.map((s) => s.id)).toEqual([
      'glass',
      'pour-0-mint-leaves',
      'pour-1-sugar',
      'pour-2-lime-juice',
      'muddle',
      'ice-glass',
      'pour-3-white-rum',
      'pour-4-soda-water',
      'garnish-mint-sprig',
      'garnish-lime-wheel',
      'serve',
    ])
  })

  it('adds glass ice before straining and toppers after', () => {
    const steps = buildGuidedSteps(getRecipe('tom-collins')!)
    expect(steps.map((s) => s.id)).toEqual([
      'glass',
      'ice-glass',
      'pour-0-gin',
      'pour-1-lemon-juice',
      'pour-2-simple-syrup',
      'pour-3-soda-water',
      'garnish-lemon-wheel',
      'garnish-cherry',
      'serve',
    ])
    const fizz = buildGuidedSteps(getRecipe('french-75')!).map((s) => s.id)
    expect(fizz.indexOf('strain')).toBeLessThan(fizz.indexOf('pour-3-champagne'))
    expect(fizz.indexOf('shake')).toBeLessThan(fizz.indexOf('strain'))
  })

  it('tracks progress against the bar state with a 15% tolerance', () => {
    const recipe = getRecipe('vodka-7up')!
    const steps = buildGuidedSteps(recipe)
    let p = evaluateGuided(steps, snapshot())
    expect(p.current).toBe(0)

    const glass = {
      type: 'highball' as const,
      ice: 'cubes' as const,
      history: [{ id: 'wheat-vodka', amount: 44 }],
      muddled: false,
      shaken: false,
      stirred: false,
      blended: false,
      rimWet: false,
      rim: 'none' as const,
      garnishes: [] as never[],
      layerMode: false,
      receivedFrom: [],
    }
    p = evaluateGuided(steps, snapshot({ glass }))
    expect(p.statuses.slice(0, 3)).toEqual(['done', 'done', 'done'])
    expect(p.current).toBe(3)

    glass.history = [{ id: 'wheat-vodka', amount: 70 }]
    p = evaluateGuided(steps, snapshot({ glass }))
    expect(p.statuses[2]).toBe('over')
    expect(p.overPoured.length).toBe(1)
    expect(p.current).toBe(3)

    glass.history = [{ id: 'wheat-vodka', amount: 50 }, { id: 'lemon-lime-soda', amount: 118 }]
    p = evaluateGuided(steps, snapshot({ glass: { ...glass, garnishes: ['lime-wedge'] as never[] }, served: true }))
    expect(p.current).toBe(steps.length)
  })
})
