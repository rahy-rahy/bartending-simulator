import type { LiquidLayer } from '../../lib/colors'

export interface StackedLayer extends LiquidLayer {
  key: string
  y: number
  h: number
}

/** Stack layers bottom-up inside a liquid column of `liquidHeight` ending at `bottom`. */
export function stackLayers(layers: LiquidLayer[], bottom: number, liquidHeight: number): StackedLayer[] {
  const totalMl = layers.reduce((a, l) => a + l.ml, 0)
  const out: StackedLayer[] = []
  let cursor = bottom
  layers.forEach((l, i) => {
    const h = totalMl > 0 ? (l.ml / totalMl) * liquidHeight : 0
    cursor -= h
    out.push({ ...l, key: `${i}-${l.id}`, y: cursor, h })
  })
  return out
}

