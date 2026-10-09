import type { IceType, Unit } from '../data/types'
import { UNIT_ML } from '../data/ingredients'

/** Free-pour speed through a speed pourer: 25 ml (just under 1 oz) per second. */
export const POUR_RATE_ML_PER_SEC = 25
/** The bottle has to hover over a vessel this long before it tilts and starts to flow. */
export const POUR_DELAY_MS = 250
/** A dasher bottle gives one dash every ~0.4 s while it is tipped. */
export const DASH_INTERVAL_MS = 400
/** A bar spoon of sugar every half second. */
export const TSP_INTERVAL_MS = 500

export interface ContentEntry {
  /** Bottle id as poured (not canonicalised). */
  id: string
  /** Amount in the ingredient's native unit. */
  amount: number
}

/** Millilitres that flow in `dtMs` of continuous pouring. */
export function mlForDuration(dtMs: number): number {
  if (dtMs <= 0) return 0
  return (dtMs / 1000) * POUR_RATE_ML_PER_SEC
}

/**
 * Number of discrete units (dashes, teaspoons) released between two elapsed
 * times. The first unit falls after one full interval.
 */
export function discreteUnitsBetween(prevElapsedMs: number, nextElapsedMs: number, intervalMs: number): number {
  if (nextElapsedMs <= prevElapsedMs) return 0
  return Math.floor(nextElapsedMs / intervalMs) - Math.floor(prevElapsedMs / intervalMs)
}

export function intervalForUnit(unit: Unit): number {
  return unit === 'tsp' ? TSP_INTERVAL_MS : DASH_INTERVAL_MS
}

/**
 * Advance a pour by `dtMs`. Returns the amount to add in the ingredient's
 * native unit and the new elapsed time for the pour.
 */
export function advancePour(unit: Unit, elapsedMs: number, dtMs: number, delayMs = POUR_DELAY_MS): { amount: number; elapsedMs: number } {
  const next = elapsedMs + Math.max(0, dtMs)
  // Nothing flows until the bottle has tilted.
  const flowStart = Math.max(elapsedMs, delayMs)
  const flowing = Math.max(0, next - flowStart)
  if (flowing <= 0 || unit === 'piece') return { amount: 0, elapsedMs: next }
  if (unit === 'ml') return { amount: mlForDuration(flowing), elapsedMs: next }
  return { amount: discreteUnitsBetween(flowStart - delayMs, next - delayMs, intervalForUnit(unit)), elapsedMs: next }
}

/** Append an amount to the contents, merging with the previous entry when it is the same bottle. */
export function addContent(contents: ContentEntry[], id: string, amount: number): ContentEntry[] {
  if (amount <= 0) return contents
  const last = contents[contents.length - 1]
  if (last && last.id === id) {
    return [...contents.slice(0, -1), { id, amount: last.amount + amount }]
  }
  return [...contents, { id, amount }]
}

/** Total amount per bottle id. */
export function aggregate(contents: ContentEntry[]): Map<string, number> {
  const m = new Map<string, number>()
  for (const c of contents) m.set(c.id, (m.get(c.id) ?? 0) + c.amount)
  return m
}

export function entryMl(entry: ContentEntry, unit: Unit): number {
  return entry.amount * UNIT_ML[unit]
}

/** Total liquid volume in ml given a unit lookup for each bottle id. */
export function totalMl(contents: ContentEntry[], unitOf: (id: string) => Unit): number {
  return contents.reduce((sum, c) => sum + entryMl(c, unitOf(c.id)), 0)
}

/** Fraction of the glass capacity that ice occupies visually. */
export const ICE_DISPLACEMENT: Record<IceType, number> = {
  none: 0,
  cubes: 0.3,
  crushed: 0.45,
}

/**
 * Visual fill level (0..1) of a vessel. Ice pushes the liquid up, but an
 * empty glass with ice still reads as empty.
 */
export function fillLevel(volumeMl: number, capacityMl: number, ice: IceType = 'none'): number {
  if (capacityMl <= 0 || volumeMl <= 0) return 0
  const displaced = volumeMl + ICE_DISPLACEMENT[ice] * capacityMl
  return Math.min(1, displaced / capacityMl)
}

/** Millilitres spilled over the rim, if any. */
export function overflowMl(volumeMl: number, capacityMl: number, ice: IceType = 'none'): number {
  const room = capacityMl * (1 - ICE_DISPLACEMENT[ice])
  return Math.max(0, volumeMl - room)
}

/** Standard jigger sides. */
export const JIGGER_SIZES_ML = [15, 22.5, 30, 45, 60] as const

/** Pour `addMl` into a jigger holding `currentMl`; the jigger cannot overfill. */
export function fillJigger(currentMl: number, addMl: number, capacityMl: number): { ml: number; overflowMl: number } {
  const total = currentMl + Math.max(0, addMl)
  if (total <= capacityMl) return { ml: total, overflowMl: 0 }
  return { ml: capacityMl, overflowMl: total - capacityMl }
}

/** Is `actual` within ±`tolerance` (fraction) of `expected`? */
export function withinTolerance(actual: number, expected: number, tolerance = 0.15): boolean {
  if (expected <= 0) return actual <= 0
  return Math.abs(actual - expected) <= expected * tolerance + 1e-9
}

/** Tolerance for discrete units: never stricter than ±1 unit. */
export function withinDiscreteTolerance(actual: number, expected: number, tolerance = 0.15): boolean {
  const allowed = Math.max(1, expected * tolerance)
  return Math.abs(actual - expected) <= allowed + 1e-9
}
