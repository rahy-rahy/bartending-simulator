import type { GlassSpec, GlassType } from './types'

export const GLASSES: GlassSpec[] = [
  { id: 'highball', name: 'Highball', capacityMl: 300, description: 'Tall straight glass for long drinks built over ice.' },
  { id: 'collins', name: 'Collins', capacityMl: 400, description: 'Taller, narrower than a highball. Collinses, fizzes and mojitos.' },
  { id: 'rocks', name: 'Rocks (Old Fashioned)', capacityMl: 300, description: 'Short, heavy tumbler for spirit-forward drinks over ice.' },
  { id: 'coupe', name: 'Coupe', capacityMl: 180, description: 'Stemmed, shallow bowl for drinks served up without ice.' },
  { id: 'martini', name: 'Martini', capacityMl: 200, description: 'The V-shaped cocktail glass for Martinis and Cosmopolitans.' },
  { id: 'margarita', name: 'Margarita', capacityMl: 350, description: 'Wide-rimmed stepped bowl, made to hold a salt rim.' },
  { id: 'shot', name: 'Shot', capacityMl: 60, description: 'Small glass for shooters and layered shots.' },
  { id: 'hurricane', name: 'Hurricane', capacityMl: 450, description: 'Big curvy glass for tiki and frozen drinks.' },
  { id: 'flute', name: 'Flute', capacityMl: 180, description: 'Tall narrow glass that keeps sparkling wine lively.' },
  { id: 'wine', name: 'Wine Glass', capacityMl: 450, description: 'Large bowl for spritzes and wine-based drinks.' },
  { id: 'mug', name: 'Copper Mug', capacityMl: 400, description: 'Copper mug that keeps a Mule ice-cold.' },
  { id: 'irish', name: 'Irish Coffee Mug', capacityMl: 250, description: 'Heat-proof stemmed glass mug for hot drinks.' },
]

export const GLASS_MAP: Record<GlassType, GlassSpec> = Object.fromEntries(
  GLASSES.map((g) => [g.id, g]),
) as Record<GlassType, GlassSpec>

export function getGlass(id: GlassType): GlassSpec {
  return GLASS_MAP[id]
}

/** Glasses that are close enough to earn partial credit for each other. */
export const GLASS_FAMILIES: GlassType[][] = [
  ['coupe', 'martini'],
  ['highball', 'collins'],
  ['hurricane', 'wine'],
]
