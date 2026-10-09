import { describe, expect, it } from 'vitest'
import {
  addContent,
  advancePour,
  aggregate,
  discreteUnitsBetween,
  fillJigger,
  fillLevel,
  mlForDuration,
  overflowMl,
  POUR_RATE_ML_PER_SEC,
  totalMl,
  withinDiscreteTolerance,
  withinTolerance,
} from './pouring'
import { INGREDIENT_MAP } from '../data/ingredients'

describe('pouring math', () => {
  it('pours at the free-pour rate', () => {
    expect(mlForDuration(1000)).toBe(POUR_RATE_ML_PER_SEC)
    expect(mlForDuration(1500)).toBeCloseTo(POUR_RATE_ML_PER_SEC * 1.5)
    expect(mlForDuration(2000)).toBeCloseTo(50)
    expect(mlForDuration(0)).toBe(0)
    expect(mlForDuration(-10)).toBe(0)
  })

  it('releases one dash per interval while held', () => {
    expect(discreteUnitsBetween(0, 399, 400)).toBe(0)
    expect(discreteUnitsBetween(0, 400, 400)).toBe(1)
    expect(discreteUnitsBetween(350, 850, 400)).toBe(2)
    expect(discreteUnitsBetween(450, 750, 400)).toBe(0)
    expect(discreteUnitsBetween(0, 1250, 400)).toBe(3)
    expect(discreteUnitsBetween(500, 400, 400)).toBe(0)
  })

  it('advances a pour by unit, after the bottle has tilted', () => {
    // No delay: pure flow maths.
    expect(advancePour('ml', 0, 400, 0)).toEqual({ amount: 10, elapsedMs: 400 })
    expect(advancePour('dash', 0, 450, 0)).toEqual({ amount: 1, elapsedMs: 450 })
    expect(advancePour('dash', 450, 400, 0)).toEqual({ amount: 1, elapsedMs: 850 })
    expect(advancePour('tsp', 0, 1000, 0)).toEqual({ amount: 2, elapsedMs: 1000 })
    expect(advancePour('piece', 0, 1000, 0).amount).toBe(0)
    // With the default delay nothing flows for the first 250 ms.
    expect(advancePour('ml', 0, 200)).toEqual({ amount: 0, elapsedMs: 200 })
    expect(advancePour('ml', 200, 100).amount).toBeCloseTo(mlForDuration(50))
    expect(advancePour('ml', 250, 400).amount).toBeCloseTo(10)
    expect(advancePour('dash', 0, 650).amount).toBe(1)
    expect(advancePour('dash', 650, 400).amount).toBe(1)
  })

  it('merges consecutive pours of the same bottle and aggregates totals', () => {
    let c = addContent([], 'vodka', 20)
    c = addContent(c, 'vodka', 25)
    c = addContent(c, 'orange-juice', 100)
    c = addContent(c, 'vodka', 5)
    expect(c).toEqual([
      { id: 'vodka', amount: 45 },
      { id: 'orange-juice', amount: 100 },
      { id: 'vodka', amount: 5 },
    ])
    expect(aggregate(c).get('vodka')).toBe(50)
    expect(addContent(c, 'vodka', 0)).toBe(c)
  })

  it('computes total volume using native units', () => {
    const unitOf = (id: string) => INGREDIENT_MAP[id].unit
    const c = [
      { id: 'bourbon', amount: 45 },
      { id: 'angostura', amount: 2 },
      { id: 'sugar', amount: 2 },
      { id: 'mint-leaves', amount: 6 },
    ]
    expect(totalMl(c, unitOf)).toBe(45 + 2 + 10)
  })

  it('fills the glass visually and spills past the rim', () => {
    expect(fillLevel(0, 300)).toBe(0)
    expect(fillLevel(150, 300)).toBe(0.5)
    expect(fillLevel(150, 300, 'cubes')).toBeCloseTo(0.8)
    expect(fillLevel(400, 300)).toBe(1)
    expect(overflowMl(100, 300)).toBe(0)
    expect(overflowMl(350, 300)).toBe(50)
    expect(overflowMl(250, 300, 'cubes')).toBeCloseTo(40)
  })

  it('never overfills a jigger', () => {
    expect(fillJigger(0, 20, 30)).toEqual({ ml: 20, overflowMl: 0 })
    expect(fillJigger(20, 20, 30)).toEqual({ ml: 30, overflowMl: 10 })
  })

  it('checks the 15% tolerance', () => {
    expect(withinTolerance(45, 45)).toBe(true)
    expect(withinTolerance(51.75, 45)).toBe(true)
    expect(withinTolerance(52, 45)).toBe(false)
    expect(withinTolerance(38.25, 45)).toBe(true)
    expect(withinTolerance(38, 45)).toBe(false)
    expect(withinDiscreteTolerance(3, 2)).toBe(true)
    expect(withinDiscreteTolerance(4, 2)).toBe(false)
    expect(withinDiscreteTolerance(1, 2)).toBe(true)
  })
})
