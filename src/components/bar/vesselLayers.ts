import type { Vessel } from '../../store/barStore'
import { INGREDIENT_MAP } from '../../data/ingredients'
import { layerColors, mixColor, type LiquidLayer } from '../../lib/colors'
import { totalMl } from '../../lib/pouring'

/** Visual layers of a vessel: the blended part first, then anything poured after it. */
export function vesselLayers(v: Vessel | null): LiquidLayer[] {
  if (!v) return []
  const mixed = v.contents.slice(0, v.mixedUpTo)
  const rest = v.contents.slice(v.mixedUpTo)
  const out: LiquidLayer[] = []
  if (mixed.length) {
    const c = mixColor(mixed)
    out.push({ id: 'mixed', ml: totalMl(mixed, (id) => INGREDIENT_MAP[id]?.unit ?? 'ml'), color: c.color, opacity: c.opacity })
  }
  return out.concat(layerColors(rest))
}
