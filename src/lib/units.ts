import type { Ingredient, Unit } from '../data/types'
import { UNIT_ML } from '../data/ingredients'

/** Bar convention: 1 oz = 30 ml (exactly 29.57 ml, but every jigger in the world rounds). */
export const ML_PER_OZ = 30

export function mlToOz(ml: number): number {
  return ml / ML_PER_OZ
}

export function ozToMl(oz: number): number {
  return oz * ML_PER_OZ
}

/** Round to a sensible number of decimals and strip trailing zeros. */
export function round(value: number, decimals = 1): number {
  const f = 10 ** decimals
  return Math.round(value * f) / f
}

export function formatMl(ml: number): string {
  return `${round(ml, ml < 10 ? 1 : 0)} ml`
}

/** One decimal, for live counters where the learner watches the number climb. */
export function formatMlPrecise(ml: number): string {
  return `${round(ml, 1)} ml`
}

export function formatOz(ml: number): string {
  const oz = mlToOz(ml)
  return `${round(oz, 2)} oz`
}

/** "45 ml · 1.5 oz" */
export function formatMlOz(ml: number): string {
  return `${formatMl(ml)} · ${formatOz(ml)}`
}

export function unitToMl(unit: Unit, amount: number): number {
  return amount * UNIT_ML[unit]
}

function plural(n: number, singular: string, pluralWord: string): string {
  return n === 1 ? singular : pluralWord
}

/**
 * Format an amount in an ingredient's native unit, always including an
 * approximate ml/oz figure for liquids so the learner sees both systems.
 */
export function formatAmount(ingredient: Ingredient, amount: number): string {
  switch (ingredient.unit) {
    case 'ml':
      return formatMlOz(amount)
    case 'dash': {
      const n = round(amount, 1)
      return `${n} ${plural(n, 'dash', 'dashes')} (≈ ${formatMlOz(unitToMl('dash', amount))})`
    }
    case 'tsp': {
      const n = round(amount, 1)
      return `${n} tsp (≈ ${formatMlOz(unitToMl('tsp', amount))})`
    }
    case 'piece': {
      const n = round(amount, 0)
      const [s, p] = ingredient.pieceName ?? ['piece', 'pieces']
      return `${n} ${plural(n, s, p)}`
    }
  }
}

/** Short form used in compact lists: "45 ml", "2 dashes", "4 wedges". */
export function formatAmountShort(ingredient: Ingredient, amount: number): string {
  switch (ingredient.unit) {
    case 'ml':
      return formatMl(amount)
    case 'dash': {
      const n = round(amount, 1)
      return `${n} ${plural(n, 'dash', 'dashes')}`
    }
    case 'tsp':
      return `${round(amount, 1)} tsp`
    case 'piece': {
      const n = round(amount, 0)
      const [s, p] = ingredient.pieceName ?? ['piece', 'pieces']
      return `${n} ${plural(n, s, p)}`
    }
  }
}
