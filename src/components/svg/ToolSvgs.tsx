import { useId } from 'react'
import { motion } from 'framer-motion'
import type { IceType } from '../../data/types'
import type { LiquidLayer } from '../../lib/colors'
import { fillLevel } from '../../lib/pouring'
import { stackLayers } from './stackLayers'

interface VesselProps {
  layers: LiquidLayer[]
  capacityMl: number
  ice: IceType
  width?: number
  className?: string
}

function LiquidStack({ layers, top, bottom, capacityMl, ice, clip }: { layers: LiquidLayer[]; top: number; bottom: number; capacityMl: number; ice: IceType; clip: string }) {
  const total = layers.reduce((a, l) => a + l.ml, 0)
  const level = fillLevel(total, capacityMl, ice)
  const h = (bottom - top) * level
  const rects = stackLayers(layers, bottom, h)
  return (
    <g clipPath={clip}>
      {rects.map((r) => (
        <motion.rect
          key={r.key}
          x="0"
          width="100"
          fill={r.color}
          opacity={Math.max(0.35, r.opacity)}
          initial={false}
          animate={{ y: r.y, height: r.h + 0.6 }}
          transition={{ type: 'tween', duration: 0.12, ease: 'linear' }}
        />
      ))}
      {ice === 'cubes' && (
        <g>
          {[
            [40, bottom - 12, -10],
            [60, bottom - 16, 12],
            [48, bottom - 32, 5],
          ].map(([x, y, r], i) => (
            <rect key={i} x={x - 7} y={y - 7} width="14" height="14" rx="3" fill="#ffffff" opacity="0.5" stroke="#ffffff" strokeOpacity="0.9" transform={`rotate(${r} ${x} ${y})`} />
          ))}
        </g>
      )}
      {ice === 'crushed' && (
        <g>
          {Array.from({ length: 24 }).map((_, i) => (
            <rect key={i} x={32 + (i % 6) * 6.5} y={bottom - 40 + Math.floor(i / 6) * 9} width="5" height="4" rx="1" fill="#ffffff" opacity="0.55" transform={`rotate(${((i * 29) % 40) - 20} ${34 + (i % 6) * 6.5} ${bottom - 38 + Math.floor(i / 6) * 9})`} />
          ))}
        </g>
      )}
    </g>
  )
}

export function ShakerSvg({ layers, capacityMl, ice, width = 90, className, closed, shaking }: VesselProps & { closed: boolean; shaking: boolean }) {
  const uid = useId()
  const bowl = 'M30 40 H70 L66 140 H34 Z'
  return (
    <motion.svg
      viewBox="0 0 100 160"
      width={width}
      height={width * 1.6}
      className={className}
      role="img"
      aria-label="Cocktail shaker"
      animate={shaking ? { rotate: [0, -18, 18, -18, 18, -12, 12, 0], y: [0, -8, 6, -8, 6, -4, 4, 0] } : { rotate: 0, y: 0 }}
      transition={shaking ? { duration: 1.4, ease: 'easeInOut' } : { duration: 0.3 }}
    >
      <defs>
        <clipPath id={`${uid}-c`}>
          <path d={bowl} />
        </clipPath>
        <linearGradient id={`${uid}-m`} x1="0" x2="1">
          <stop offset="0" stopColor="#b9c0c7" />
          <stop offset="0.3" stopColor="#f2f5f7" />
          <stop offset="0.6" stopColor="#9aa3ab" />
          <stop offset="1" stopColor="#d7dde2" />
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="148" rx="30" ry="5" fill="#000" opacity="0.35" />
      <path d={bowl} fill={`url(#${uid}-m)`} opacity="0.55" />
      <LiquidStack layers={layers} top={44} bottom={138} capacityMl={capacityMl} ice={ice} clip={`url(#${uid}-c)`} />
      <path d={bowl} fill="none" stroke="#f3f3f3" strokeOpacity="0.9" strokeWidth="1.8" />
      <path d="M34 130 H66" stroke="#f3f3f3" strokeOpacity="0.5" />
      {/* cap */}
      <motion.g initial={false} animate={closed ? { y: 0 } : { y: -26 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}>
        <path d="M28 40 H72 L70 28 H30 Z" fill={`url(#${uid}-m)`} stroke="#f3f3f3" strokeOpacity="0.9" strokeWidth="1.6" />
        <rect x="40" y="16" width="20" height="12" rx="3" fill={`url(#${uid}-m)`} stroke="#f3f3f3" strokeOpacity="0.9" strokeWidth="1.6" />
      </motion.g>
    </motion.svg>
  )
}

export function MixingGlassSvg({ layers, capacityMl, ice, width = 90, className, stirring }: VesselProps & { stirring: boolean }) {
  const uid = useId()
  const bowl = 'M26 36 H74 L70 142 H30 Z'
  return (
    <svg viewBox="0 0 100 160" width={width} height={width * 1.6} className={className} role="img" aria-label="Mixing glass">
      <defs>
        <clipPath id={`${uid}-c`}>
          <path d={bowl} />
        </clipPath>
      </defs>
      <ellipse cx="50" cy="150" rx="30" ry="5" fill="#000" opacity="0.35" />
      <path d={bowl} fill="#ffffff" opacity="0.08" />
      <LiquidStack layers={layers} top={40} bottom={140} capacityMl={capacityMl} ice={ice} clip={`url(#${uid}-c)`} />
      <path d={bowl} fill="none" stroke="#f3f3f3" strokeOpacity="0.85" strokeWidth="1.6" />
      <path d="M74 36 C84 36 86 44 80 48" fill="none" stroke="#f3f3f3" strokeOpacity="0.85" strokeWidth="1.6" />
      <path d="M30 42 V130" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="3" strokeLinecap="round" />
      {stirring && (
        <motion.g
          animate={{ x: [-10, 10, -10], rotate: [-8, 8, -8] }}
          transition={{ duration: 0.7, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '50px 60px' }}
        >
          <path d="M58 0 L48 132" stroke="#d9b25a" strokeWidth="3" strokeLinecap="round" />
          <path d="M58 0 C64 6 52 10 58 16 C64 22 52 26 58 32" fill="none" stroke="#d9b25a" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="48" cy="134" rx="7" ry="4" fill="#d9b25a" />
        </motion.g>
      )}
    </svg>
  )
}

export function BlenderSvg({ layers, capacityMl, ice, width = 90, className, blending }: VesselProps & { blending: boolean }) {
  const uid = useId()
  const jar = 'M28 20 H72 L66 112 H34 Z'
  return (
    <svg viewBox="0 0 100 160" width={width} height={width * 1.6} className={className} role="img" aria-label="Blender">
      <defs>
        <clipPath id={`${uid}-c`}>
          <path d={jar} />
        </clipPath>
      </defs>
      <ellipse cx="50" cy="154" rx="34" ry="5" fill="#000" opacity="0.35" />
      <motion.g animate={blending ? { x: [0, -2, 2, -2, 2, 0], y: [0, 1, -1, 1, -1, 0] } : { x: 0, y: 0 }} transition={blending ? { duration: 0.25, repeat: Infinity } : {}}>
        <path d={jar} fill="#ffffff" opacity="0.08" />
        <LiquidStack layers={layers} top={24} bottom={110} capacityMl={capacityMl} ice={ice} clip={`url(#${uid}-c)`} />
        {blending && (
          <g clipPath={`url(#${uid}-c)`}>
            {Array.from({ length: 14 }).map((_, i) => (
              <motion.circle key={i} cx={36 + ((i * 17) % 30)} cy={100 - ((i * 23) % 70)} r="2" fill="#ffffff" opacity="0.6" animate={{ y: [0, -30, 0], opacity: [0.2, 0.8, 0.2] }} transition={{ duration: 0.5 + (i % 3) * 0.2, repeat: Infinity }} />
            ))}
          </g>
        )}
        <path d={jar} fill="none" stroke="#f3f3f3" strokeOpacity="0.85" strokeWidth="1.6" />
        <path d="M26 20 H74" stroke="#f3f3f3" strokeOpacity="0.85" strokeWidth="2" />
        <path d="M72 30 C82 32 84 60 72 62" fill="none" stroke="#f3f3f3" strokeOpacity="0.85" strokeWidth="1.6" />
        <path d="M44 104 L56 104 M50 100 L50 108" stroke="#c0c6cc" strokeWidth="2" />
      </motion.g>
      <path d="M30 112 H70 L74 148 H26 Z" fill="#2a2a2a" stroke="#555" strokeWidth="1" />
      <rect x="40" y="124" width="20" height="8" rx="2" fill={blending ? '#f2d03b' : '#7a7a7a'} />
      <rect x="30" y="112" width="40" height="4" fill="#3f3f3f" />
    </svg>
  )
}

export function JiggerSvg({ ml, sizeMl, color, width = 60, className }: { ml: number; sizeMl: number; color: string; width?: number; className?: string }) {
  const uid = useId()
  const top = 'M20 20 H80 L50 72 Z'
  const level = sizeMl > 0 ? Math.min(1, ml / sizeMl) : 0
  const h = 52 * level
  return (
    <svg viewBox="0 0 100 150" width={width} height={width * 1.5} className={className} role="img" aria-label="Jigger">
      <defs>
        <clipPath id={`${uid}-c`}>
          <path d={top} />
        </clipPath>
        <linearGradient id={`${uid}-m`} x1="0" x2="1">
          <stop offset="0" stopColor="#b9c0c7" />
          <stop offset="0.35" stopColor="#f2f5f7" />
          <stop offset="0.7" stopColor="#9aa3ab" />
          <stop offset="1" stopColor="#d7dde2" />
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="140" rx="24" ry="4" fill="#000" opacity="0.35" />
      <path d={top} fill={`url(#${uid}-m)`} opacity="0.6" />
      <g clipPath={`url(#${uid}-c)`}>
        <motion.rect x="0" width="100" fill={color} opacity="0.85" initial={false} animate={{ y: 72 - h, height: h + 1 }} transition={{ duration: 0.12 }} />
      </g>
      <path d={top} fill="none" stroke="#f3f3f3" strokeOpacity="0.9" strokeWidth="1.8" />
      <path d="M50 72 L30 118 H70 Z" fill={`url(#${uid}-m)`} stroke="#f3f3f3" strokeOpacity="0.9" strokeWidth="1.8" />
      <path d="M26 20 H74" stroke="#ffffff" strokeOpacity="0.6" strokeWidth="2" />
      <text x="50" y="134" textAnchor="middle" fontSize="12" fill="#f0d48a" fontFamily="Georgia, serif" fontWeight="700">
        {sizeMl} ml
      </text>
    </svg>
  )
}

export function BarSpoonSvg({ width = 24, className }: { width?: number; className?: string }) {
  return (
    <svg viewBox="0 0 30 160" width={width} height={width * (160 / 30)} className={className} role="img" aria-label="Bar spoon">
      <path d="M15 4 C21 10 9 14 15 20 C21 26 9 30 15 36 C21 42 9 46 15 52 C21 58 9 62 15 68 C21 74 9 78 15 84 L15 140" fill="none" stroke="#d9b25a" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M15 8 L15 80" stroke="#fff2c4" strokeOpacity="0.5" strokeWidth="1" />
      <ellipse cx="15" cy="148" rx="9" ry="6" fill="#d9b25a" stroke="#a8822f" strokeWidth="1" />
      <ellipse cx="13" cy="146" rx="4" ry="2" fill="#ffffff" opacity="0.4" />
    </svg>
  )
}

export function StrainerSvg({ width = 70, className }: { width?: number; className?: string }) {
  return (
    <svg viewBox="0 0 120 100" width={width} height={width * (100 / 120)} className={className} role="img" aria-label="Hawthorne strainer">
      <circle cx="54" cy="46" r="34" fill="#d7dde2" stroke="#8b949c" strokeWidth="2" />
      <circle cx="54" cy="46" r="26" fill="#eef1f3" />
      {Array.from({ length: 19 }).map((_, i) => (
        <circle key={i} cx={54 + ((i % 5) - 2) * 9} cy={46 + (Math.floor(i / 5) - 1.5) * 9} r="2.2" fill="#9aa3ab" />
      ))}
      <path d="M22 60 C14 70 18 82 30 86 C42 90 48 80 46 70" fill="none" stroke="#8b949c" strokeWidth="5" strokeLinecap="round" strokeDasharray="1 4" />
      <path d="M86 40 L116 30" stroke="#d7dde2" strokeWidth="7" strokeLinecap="round" />
      <path d="M86 40 L116 30" stroke="#9aa3ab" strokeWidth="2" strokeLinecap="round" />
      <path d="M54 12 L54 20 M30 24 L36 30" stroke="#8b949c" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export function MuddlerSvg({ width = 24, className }: { width?: number; className?: string }) {
  return (
    <svg viewBox="0 0 30 150" width={width} height={width * 5} className={className} role="img" aria-label="Muddler">
      <rect x="9" y="4" width="12" height="100" rx="5" fill="#7a4f2e" stroke="#4a2a12" strokeWidth="1.5" />
      <rect x="6" y="100" width="18" height="44" rx="6" fill="#5a3a22" stroke="#3a2010" strokeWidth="1.5" />
      <rect x="12" y="8" width="3" height="90" rx="1.5" fill="#ffffff" opacity="0.25" />
      <path d="M8 140 H22" stroke="#2a1a0c" strokeWidth="2" />
    </svg>
  )
}

export function IceCubeIcon({ width = 36 }: { width?: number }) {
  return (
    <svg viewBox="0 0 40 40" width={width} height={width} role="img" aria-label="Ice cubes">
      <rect x="4" y="10" width="22" height="22" rx="4" fill="#dff3ff" opacity="0.85" stroke="#ffffff" strokeWidth="1.5" transform="rotate(-8 15 21)" />
      <rect x="16" y="6" width="20" height="20" rx="4" fill="#eaf8ff" opacity="0.9" stroke="#ffffff" strokeWidth="1.5" transform="rotate(12 26 16)" />
      <path d="M8 14 L14 14 M20 10 L26 10" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function CrushedIceIcon({ width = 36 }: { width?: number }) {
  return (
    <svg viewBox="0 0 40 40" width={width} height={width} role="img" aria-label="Crushed ice">
      <path d="M4 34 C6 16 14 8 20 6 C26 8 34 16 36 34 Z" fill="#e8f7ff" opacity="0.9" />
      {Array.from({ length: 16 }).map((_, i) => (
        <rect key={i} x={8 + (i % 4) * 7} y={12 + Math.floor(i / 4) * 6} width="5" height="4" rx="1" fill="#ffffff" stroke="#b8e2f7" strokeWidth="0.6" transform={`rotate(${((i * 31) % 50) - 25} ${10 + (i % 4) * 7} ${14 + Math.floor(i / 4) * 6})`} />
      ))}
    </svg>
  )
}

export function IceBucketSvg({ width = 110, className }: { width?: number; className?: string }) {
  const uid = useId()
  return (
    <svg viewBox="0 0 120 110" width={width} height={width * (110 / 120)} className={className} role="img" aria-label="Ice bucket">
      <defs>
        <linearGradient id={`${uid}-m`} x1="0" x2="1">
          <stop offset="0" stopColor="#9aa3ab" />
          <stop offset="0.3" stopColor="#eef1f3" />
          <stop offset="0.7" stopColor="#a9b1b8" />
          <stop offset="1" stopColor="#d7dde2" />
        </linearGradient>
      </defs>
      <ellipse cx="60" cy="102" rx="44" ry="5" fill="#000" opacity="0.35" />
      <path d="M14 34 H106 L96 100 H24 Z" fill={`url(#${uid}-m)`} stroke="#f3f3f3" strokeOpacity="0.8" strokeWidth="1.5" />
      <ellipse cx="60" cy="34" rx="46" ry="9" fill="#7f8992" stroke="#f3f3f3" strokeOpacity="0.8" strokeWidth="1.5" />
      <ellipse cx="60" cy="34" rx="40" ry="6" fill="#dff3ff" />
      {Array.from({ length: 9 }).map((_, i) => (
        <rect key={i} x={26 + (i % 5) * 14 + (i > 4 ? 7 : 0)} y={22 + (i > 4 ? 6 : 0)} width="13" height="13" rx="3" fill="#eaf8ff" stroke="#ffffff" strokeWidth="1.2" transform={`rotate(${((i * 29) % 40) - 20} ${32 + (i % 5) * 14} ${28})`} />
      ))}
      <path d="M14 48 C4 48 4 60 14 60 M106 48 C116 48 116 60 106 60" fill="none" stroke="#c0c6cc" strokeWidth="3" />
    </svg>
  )
}

export function BinSvg({ width = 80, className, open }: { width?: number; className?: string; open?: boolean }) {
  return (
    <svg viewBox="0 0 100 130" width={width} height={width * 1.3} className={className} role="img" aria-label="Garbage bin">
      <ellipse cx="50" cy="124" rx="36" ry="5" fill="#000" opacity="0.35" />
      <path d="M20 30 H80 L74 120 H26 Z" fill="#3b3f44" stroke="#8b949c" strokeWidth="1.5" />
      <path d="M32 40 V110 M50 40 V110 M68 40 V110" stroke="#2a2d31" strokeWidth="4" />
      <motion.g initial={false} animate={open ? { rotate: -35, x: -6, y: -8 } : { rotate: 0, x: 0, y: 0 }} style={{ transformOrigin: '18px 30px' }} transition={{ type: 'spring', stiffness: 200, damping: 16 }}>
        <rect x="14" y="20" width="72" height="12" rx="3" fill="#4a4f55" stroke="#8b949c" strokeWidth="1.5" />
        <rect x="40" y="12" width="20" height="8" rx="3" fill="#4a4f55" stroke="#8b949c" strokeWidth="1.5" />
      </motion.g>
    </svg>
  )
}

export function RimDishSvg({ kind, width = 70, className }: { kind: 'lime' | 'salt' | 'sugar'; width?: number; className?: string }) {
  const fill = kind === 'lime' ? '#9ccc3a' : kind === 'salt' ? '#ffffff' : '#fff0c4'
  return (
    <svg viewBox="0 0 100 60" width={width} height={width * 0.6} className={className} role="img" aria-label={`${kind} dish`}>
      <ellipse cx="50" cy="52" rx="40" ry="5" fill="#000" opacity="0.35" />
      <path d="M8 30 C8 50 92 50 92 30 Z" fill="#dcdcdc" stroke="#9aa3ab" strokeWidth="1.5" />
      <ellipse cx="50" cy="30" rx="42" ry="10" fill="#f3f3f3" stroke="#9aa3ab" strokeWidth="1.5" />
      {kind === 'lime' ? (
        <g>
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${30 + i * 20} 28) rotate(${i * 25 - 20})`}>
              <path d="M-12 0 A12 12 0 0 1 12 0 Z" fill="#8fc93a" stroke="#3f6f12" strokeWidth="1" />
              <path d="M-8 0 A8 8 0 0 1 8 0 Z" fill="#d8ec9a" />
            </g>
          ))}
        </g>
      ) : (
        <g>
          <ellipse cx="50" cy="28" rx="34" ry="6" fill={fill} />
          {Array.from({ length: 30 }).map((_, i) => (
            <circle key={i} cx={20 + ((i * 37) % 60)} cy={24 + ((i * 13) % 9)} r={kind === 'salt' ? 1 : 1.3} fill={kind === 'salt' ? '#ffffff' : '#ffe9a8'} stroke="#cfcfcf" strokeWidth="0.3" />
          ))}
        </g>
      )}
    </svg>
  )
}
