import { describe, expect, it } from 'vitest'
import { formatAmount, formatMlOz, formatOz, mlToOz, ozToMl, round } from './units'
import { getIngredient } from '../data/ingredients'

describe('units', () => {
  it('converts ml to oz with the 30 ml bar convention', () => {
    expect(mlToOz(30)).toBe(1)
    expect(mlToOz(45)).toBe(1.5)
    expect(ozToMl(2)).toBe(60)
    expect(ozToMl(0.75)).toBe(22.5)
  })

  it('rounds and formats cleanly', () => {
    expect(round(1.2345, 2)).toBe(1.23)
    expect(formatOz(45)).toBe('1.5 oz')
    expect(formatOz(22.5)).toBe('0.75 oz')
    expect(formatMlOz(60)).toBe('60 ml · 2 oz')
  })

  it('formats native units with an ml/oz hint', () => {
    expect(formatAmount(getIngredient('angostura'), 2)).toBe('2 dashes (≈ 2 ml · 0.07 oz)')
    expect(formatAmount(getIngredient('angostura'), 1)).toBe('1 dash (≈ 1 ml · 0.03 oz)')
    expect(formatAmount(getIngredient('sugar'), 2)).toBe('2 tsp (≈ 10 ml · 0.33 oz)')
    expect(formatAmount(getIngredient('lime-wedges'), 4)).toBe('4 wedges')
    expect(formatAmount(getIngredient('lime-wedges'), 1)).toBe('1 wedge')
    expect(formatAmount(getIngredient('vodka'), 50)).toBe('50 ml · 1.67 oz')
  })
})
