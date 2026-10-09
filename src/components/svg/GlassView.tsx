import { useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { GarnishId, GlassType, IceType, RimType } from '../../data/types'
import { GLASS_SHAPES, GARNISH_SVG } from '../../lib/glassShapes'
import { fillLevel } from '../../lib/pouring'
import { lighten, darken, type LiquidLayer } from '../../lib/colors'
import { stackLayers } from './stackLayers'

export interface GlassViewProps {
  type: GlassType
  layers: LiquidLayer[]
  capacityMl: number
  ice: IceType
  rim: RimType
  rimWet: boolean
  garnishes: GarnishId[]
  spilled?: boolean
  width?: number
  className?: string
  /** Show foam cap (egg white / cream float). */
  foam?: boolean
  animateLiquid?: boolean
}

const SURFACE_GARNISH = new Set<GarnishId>(['nutmeg', 'coffee-beans', 'berries'])

export function GlassView({
  type,
  layers,
  capacityMl,
  ice,
  rim,
  rimWet,
  garnishes,
  spilled,
  width = 160,
  className,
  foam,
  animateLiquid = true,
}: GlassViewProps) {
  const uid = useId()
  const s = GLASS_SHAPES[type]
  const totalMl = layers.reduce((a, l) => a + l.ml, 0)
  const level = fillLevel(totalMl, capacityMl, ice)
  const liquidHeight = (s.liquid.bottom - s.liquid.top) * level
  const liquidTop = s.liquid.bottom - liquidHeight

  // Layer heights share the visual liquid height proportionally to volume.
  const rects = stackLayers(layers, s.liquid.bottom, liquidHeight)

  const iceTop = s.liquid.bottom - (s.liquid.bottom - s.liquid.top) * Math.max(level, 0.6)
  const cx = (s.rim.x1 + s.rim.x2) / 2
  const iceWidth = (s.rim.x2 - s.rim.x1) * 0.55

  return (
    <svg
      viewBox="-12 -34 124 204"
      width={width}
      height={width * (204 / 124)}
      className={className}
      role="img"
      aria-label={`${type} glass`}
      data-level={level.toFixed(2)}
    >
      <defs>
        <clipPath id={`${uid}-bowl`}>
          <path d={s.bowl} />
        </clipPath>
        <linearGradient id={`${uid}-glass`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.32" />
          <stop offset="0.22" stopColor="#ffffff" stopOpacity="0.04" />
          <stop offset="0.78" stopColor="#ffffff" stopOpacity="0.06" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.36" />
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="160" rx="40" ry="5" fill="#000" opacity="0.35" />
      {s.material ? (
        <path d={s.outline} fill={s.material} opacity="0.8" />
      ) : (
        <path d={s.outline} fill={`url(#${uid}-glass)`} opacity="0.6" />
      )}
      <g clipPath={`url(#${uid}-bowl)`}>
        {rects.map((r) => {
          const common = {
            x: 0,
            width: 100,
            fill: r.color,
            opacity: Math.max(0.35, r.opacity),
          }
          return animateLiquid ? (
            <motion.rect
              key={r.key}
              {...common}
              initial={{ y: r.y + r.h, height: 0 }}
              animate={{ y: r.y, height: r.h + 0.6 }}
              transition={{ type: 'tween', duration: 0.12, ease: 'linear' }}
            />
          ) : (
            <rect key={r.key} {...common} y={r.y} height={r.h + 0.6} />
          )
        })}
        {rects.length > 0 && (
          <rect x="0" y={liquidTop} width="100" height={liquidHeight} fill={`url(#${uid}-glass)`} opacity="0.9" />
        )}
        {foam && rects.length > 0 && <rect x="0" y={liquidTop - 1} width="100" height="6" fill="#fff8e6" opacity="0.9" />}
        {rects.length > 0 && (
          <path d={`M${s.rim.x1 + 4} ${liquidTop.toFixed(1)} H${s.rim.x2 - 4}`} stroke={lighten(rects[rects.length - 1].color, 0.5)} strokeOpacity="0.8" strokeWidth="1" />
        )}
        <AnimatePresence>
          {ice === 'cubes' && (
            <motion.g key="cubes" initial={{ y: -70, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 16 }}>
              {[
                [cx - iceWidth * 0.3, s.liquid.bottom - 14, -12],
                [cx + iceWidth * 0.25, s.liquid.bottom - 18, 15],
                [cx - iceWidth * 0.05, s.liquid.bottom - 36, 5],
                [cx + iceWidth * 0.22, Math.max(iceTop + 10, s.liquid.bottom - 54), -20],
              ].map(([x, y, r], i) => (
                <g key={i} transform={`rotate(${r} ${x} ${y})`}>
                  <rect x={x - 8} y={y - 8} width="16" height="16" rx="3" fill="#ffffff" opacity="0.42" stroke="#ffffff" strokeOpacity="0.85" strokeWidth="1" />
                  <path d={`M${x - 5} ${y - 5} L${x + 2} ${y - 5}`} stroke="#ffffff" strokeWidth="1.6" opacity="0.95" />
                </g>
              ))}
            </motion.g>
          )}
          {ice === 'crushed' && (
            <motion.g key="crushed" initial={{ y: -70, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 18 }}>
              {Array.from({ length: 7 }).flatMap((_, i) =>
                Array.from({ length: 5 }).map((__, j) => {
                  const x = cx - iceWidth / 2 + (j + (i % 2) * 0.5) * (iceWidth / 5)
                  const y = iceTop + 4 + i * ((s.liquid.bottom - iceTop - 8) / 7)
                  return (
                    <rect key={`${i}-${j}`} x={x} y={y} width="5" height="4" rx="1" fill="#ffffff" opacity="0.55" transform={`rotate(${((i * 37 + j * 23) % 40) - 20} ${x + 2.5} ${y + 2})`} />
                  )
                }),
              )}
            </motion.g>
          )}
        </AnimatePresence>
      </g>
      <path d={s.outline} fill="none" stroke="#f3f3f3" strokeOpacity="0.85" strokeWidth="1.6" />
      {s.extras.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="#f3f3f3" strokeOpacity="0.8" strokeWidth="1.6" />
      ))}
      <path d={s.outline} fill="none" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="4" strokeDasharray="0 18 22 200" strokeLinecap="round" />
      {rimWet && rim === 'none' && (
        <path d={`M${s.rim.x1} ${s.rim.y} H${s.rim.x2}`} stroke="#bfe8ff" strokeWidth="2.5" strokeOpacity="0.8" strokeLinecap="round" />
      )}
      <AnimatePresence>
        {rim !== 'none' && (
          <motion.g key={rim} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            <path d={`M${s.rim.x1} ${s.rim.y} H${s.rim.x2}`} stroke={rim === 'salt' ? '#ffffff' : '#fff3c4'} strokeWidth="3" strokeOpacity="0.9" />
            {Array.from({ length: Math.round((s.rim.x2 - s.rim.x1) / 3) + 1 }).map((_, i, arr) => {
              const x = s.rim.x1 + ((s.rim.x2 - s.rim.x1) * i) / (arr.length - 1)
              return <circle key={i} cx={x} cy={s.rim.y + ((i * 7) % 3) - 1} r={1.2 + ((i * 3) % 2) * 0.5} fill={rim === 'salt' ? '#ffffff' : '#fff3c4'} opacity="0.95" />
            })}
          </motion.g>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {garnishes.map((g, i) => {
          const surface = SURFACE_GARNISH.has(g)
          const x = surface ? cx : s.garnishAnchor.x - i * 16
          const y = surface ? Math.min(liquidTop, s.rim.y + 12) : s.garnishAnchor.y
          return (
            <motion.g
              key={g}
              initial={{ opacity: 0, scale: 0.2, y: -30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18 }}
              style={{ transformOrigin: `${x}px ${y}px` }}
            >
              <g transform={`translate(${x} ${y})`} dangerouslySetInnerHTML={{ __html: GARNISH_SVG[g] }} />
            </motion.g>
          )
        })}
      </AnimatePresence>
      {spilled && rects.length > 0 && (
        <g>
          <path d={`M${s.rim.x2 - 2} ${s.rim.y} C${s.rim.x2 + 2} ${s.rim.y + 20} ${s.rim.x2 + 4} ${s.rim.y + 40} ${s.rim.x2 + 1} ${s.rim.y + 60}`} fill="none" stroke={darken(rects[rects.length - 1].color, 0.1)} strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
          <ellipse cx="50" cy="158" rx="46" ry="6" fill={rects[rects.length - 1].color} opacity="0.55" />
        </g>
      )}
    </svg>
  )
}
