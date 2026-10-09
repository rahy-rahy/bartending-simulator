import type { GarnishId } from '../../data/types'
import { GARNISH_SVG } from '../../lib/glassShapes'

export function GarnishIcon({ id, size = 48 }: { id: GarnishId; size?: number }) {
  return (
    <svg viewBox="-30 -50 60 70" width={size} height={size * (70 / 60)} role="img" aria-label={id}>
      <g dangerouslySetInnerHTML={{ __html: GARNISH_SVG[id] }} />
    </svg>
  )
}
