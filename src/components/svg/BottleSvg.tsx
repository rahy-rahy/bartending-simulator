import { useId } from 'react'
import type { BottleShape, Ingredient } from '../../data/types'

interface ShapeDef {
  /** Closed silhouette (neck + body) */
  body: string
  cap: { x: number; y: number; w: number; h: number; r?: number }
  label: { x: number; y: number; w: number; h: number }
  /** Highlight stroke along the left side */
  highlight: string
  /** Liquid area top (y) so empty neck shows above liquid */
  liquidTop: number
}

const SHAPES: Record<BottleShape, ShapeDef> = {
  tall: {
    body: 'M24 6 H36 V30 C36 36 50 38 50 46 V128 C50 134 46 136 40 136 H20 C14 136 10 134 10 128 V46 C10 38 24 36 24 30 Z',
    cap: { x: 22, y: 0, w: 16, h: 10, r: 2 },
    label: { x: 13, y: 66, w: 34, h: 40 },
    highlight: 'M14 50 V126',
    liquidTop: 34,
  },
  round: {
    body: 'M23 6 H37 V28 C37 34 52 38 52 50 V128 C52 134 48 136 42 136 H18 C12 136 8 134 8 128 V50 C8 38 23 34 23 28 Z',
    cap: { x: 21, y: 0, w: 18, h: 10, r: 2 },
    label: { x: 12, y: 70, w: 36, h: 40 },
    highlight: 'M12 54 V126',
    liquidTop: 32,
  },
  square: {
    body: 'M24 6 H36 V26 C36 30 52 30 52 36 V130 C52 134 50 136 46 136 H14 C10 136 8 134 8 130 V36 C8 30 24 30 24 26 Z',
    cap: { x: 22, y: 0, w: 16, h: 10, r: 1 },
    label: { x: 12, y: 60, w: 36, h: 44 },
    highlight: 'M12 40 V128',
    liquidTop: 30,
  },
  flask: {
    body: 'M25 6 H35 V40 C35 46 50 52 50 72 V126 C50 132 46 136 40 136 H20 C14 136 10 132 10 126 V72 C10 52 25 46 25 40 Z',
    cap: { x: 23, y: 0, w: 14, h: 10, r: 2 },
    label: { x: 14, y: 78, w: 32, h: 38 },
    highlight: 'M14 76 V124',
    liquidTop: 44,
  },
  dasher: {
    body: 'M26 26 H34 V44 C34 48 44 50 44 58 V126 C44 132 40 136 34 136 H26 C20 136 16 132 16 126 V58 C16 50 26 48 26 44 Z',
    cap: { x: 24, y: 18, w: 12, h: 12, r: 2 },
    label: { x: 19, y: 72, w: 22, h: 36 },
    highlight: 'M20 60 V124',
    liquidTop: 48,
  },
  carton: {
    body: 'M12 36 L30 20 L48 36 V134 H12 Z',
    cap: { x: 34, y: 24, w: 10, h: 8, r: 2 },
    label: { x: 14, y: 54, w: 32, h: 54 },
    highlight: 'M16 44 V128',
    liquidTop: 38,
  },
  soda: {
    body: 'M23 6 H37 V22 C37 28 48 32 48 42 V128 C48 134 44 136 40 136 H20 C16 136 12 134 12 128 V42 C12 32 23 28 23 22 Z',
    cap: { x: 21, y: 0, w: 18, h: 10, r: 3 },
    label: { x: 15, y: 62, w: 30, h: 40 },
    highlight: 'M16 46 V126',
    liquidTop: 26,
  },
  jar: {
    body: 'M14 34 H46 V128 C46 134 42 136 36 136 H24 C18 136 14 134 14 128 Z',
    cap: { x: 12, y: 24, w: 36, h: 12, r: 3 },
    label: { x: 17, y: 60, w: 26, h: 44 },
    highlight: 'M18 42 V126',
    liquidTop: 36,
  },
  can: {
    body: 'M14 22 H46 V130 C46 134 42 136 38 136 H22 C18 136 14 134 14 130 Z',
    cap: { x: 14, y: 16, w: 32, h: 8, r: 3 },
    label: { x: 14, y: 46, w: 32, h: 60 },
    highlight: 'M18 30 V128',
    liquidTop: 24,
  },
  wine: {
    body: 'M24 6 H36 V44 C36 52 50 56 50 68 V128 C50 134 46 136 40 136 H20 C14 136 10 134 10 128 V68 C10 56 24 52 24 44 Z',
    cap: { x: 22, y: 0, w: 16, h: 14, r: 2 },
    label: { x: 13, y: 80, w: 34, h: 40 },
    highlight: 'M14 70 V126',
    liquidTop: 46,
  },
  cup: {
    body: 'M10 44 H46 L42 130 C42 134 38 136 34 136 H20 C16 136 12 134 12 130 Z',
    cap: { x: 0, y: 0, w: 0, h: 0 },
    label: { x: 14, y: 70, w: 28, h: 34 },
    highlight: 'M16 52 V124',
    liquidTop: 48,
  },
  bowl: {
    body: 'M6 78 H54 C54 110 44 130 30 130 C16 130 6 110 6 78 Z',
    cap: { x: 0, y: 0, w: 0, h: 0 },
    label: { x: 14, y: 92, w: 32, h: 20 },
    highlight: 'M12 90 C12 108 18 120 24 124',
    liquidTop: 70,
  },
}

const GLASS_TINT: Record<Ingredient['bottle']['glass'], { fill: string; opacity: number }> = {
  clear: { fill: '#ffffff', opacity: 0.1 },
  green: { fill: '#2f6b3a', opacity: 0.45 },
  brown: { fill: '#5a3414', opacity: 0.5 },
  frosted: { fill: '#ffffff', opacity: 0.4 },
  black: { fill: '#111111', opacity: 0.8 },
  blue: { fill: '#1e4e8a', opacity: 0.45 },
}

interface Props {
  ingredient: Ingredient
  width?: number
  tilt?: number
  className?: string
}

export function BottleSvg({ ingredient, width = 56, className }: Props) {
  const uid = useId()
  const def = SHAPES[ingredient.bottle.shape]
  const b = ingredient.bottle
  const tint = GLASS_TINT[b.glass]
  const lines = splitLabel(ingredient.label)
  const fontSize = lines.length > 1 ? 6 : ingredient.label.length > 9 ? 5.4 : 6.5
  const liquidOpacity = Math.max(0.35, ingredient.opacity)
  const isBowl = b.shape === 'bowl'
  const isPiece = ingredient.unit === 'piece'

  return (
    <svg
      viewBox="0 0 60 140"
      width={width}
      height={width * (140 / 60)}
      className={className}
      role="img"
      aria-label={ingredient.name}
    >
      <defs>
        <clipPath id={`${uid}-clip`}>
          <path d={def.body} />
        </clipPath>
        <linearGradient id={`${uid}-glass`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="0.3" stopColor="#ffffff" stopOpacity="0.02" />
          <stop offset="0.8" stopColor="#000000" stopOpacity="0.12" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      {/* liquid */}
      <g clipPath={`url(#${uid}-clip)`}>
        <rect x="0" y="0" width="60" height="140" fill={tint.fill} opacity={isBowl ? 0.25 : tint.opacity} />
        {isPiece ? (
          <g>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <ellipse
                key={i}
                cx={14 + (i % 3) * 16}
                cy={88 + Math.floor(i / 3) * 14}
                rx="6"
                ry="4.5"
                fill={ingredient.color}
                opacity="0.95"
                transform={`rotate(${(i * 37) % 60} ${14 + (i % 3) * 16} ${88 + Math.floor(i / 3) * 14})`}
              />
            ))}
          </g>
        ) : (
          <rect x="0" y={def.liquidTop} width="60" height={140 - def.liquidTop} fill={ingredient.color} opacity={liquidOpacity} />
        )}
        <rect x="0" y="0" width="60" height="140" fill={`url(#${uid}-glass)`} />
      </g>
      {/* outline */}
      <path d={def.body} fill="none" stroke="#f8f4ea" strokeOpacity="0.55" strokeWidth="1.2" />
      <path d={def.highlight} fill="none" stroke="#ffffff" strokeOpacity="0.45" strokeWidth="2" strokeLinecap="round" />
      {/* label */}
      {!isPiece && (
        <g>
          <rect x={def.label.x} y={def.label.y} width={def.label.w} height={def.label.h} rx="2" fill={b.labelColor} stroke="#000" strokeOpacity="0.15" />
          <rect x={def.label.x + 2} y={def.label.y + 2} width={def.label.w - 4} height={def.label.h - 4} rx="1" fill="none" stroke={b.textColor} strokeOpacity="0.35" strokeWidth="0.6" />
          {lines.map((line, i) => (
            <text
              key={i}
              x={def.label.x + def.label.w / 2}
              y={def.label.y + def.label.h / 2 + (i - (lines.length - 1) / 2) * 8 + 2.5}
              textAnchor="middle"
              fontSize={fontSize}
              fontFamily="Georgia, serif"
              fontWeight="700"
              fill={b.textColor}
              style={{ letterSpacing: 0.3 }}
            >
              {line}
            </text>
          ))}
        </g>
      )}
      {isPiece && (
        <text x="30" y="72" textAnchor="middle" fontSize="6.5" fontFamily="Georgia, serif" fontWeight="700" fill="#f8f4ea">
          {lines[0]}
        </text>
      )}
      {/* cap */}
      {def.cap.w > 0 && (
        <g>
          <rect x={def.cap.x} y={def.cap.y} width={def.cap.w} height={def.cap.h} rx={def.cap.r ?? 2} fill={b.capColor} />
          <rect x={def.cap.x + 2} y={def.cap.y + 1.5} width={def.cap.w - 4} height={2} rx="1" fill="#ffffff" opacity="0.35" />
        </g>
      )}
      {b.shape === 'cup' && (
        <path d="M46 56 C58 58 58 96 44 100" fill="none" stroke="#f8f4ea" strokeOpacity="0.55" strokeWidth="2" />
      )}
    </svg>
  )
}

function splitLabel(label: string): string[] {
  if (label.length <= 8) return [label]
  const parts = label.split(' ')
  if (parts.length === 1) return [label]
  const first: string[] = []
  const second: string[] = []
  for (const p of parts) {
    if (first.join(' ').length + p.length <= 8 && second.length === 0) first.push(p)
    else second.push(p)
  }
  return second.length ? [first.join(' '), second.join(' ')] : [first.join(' ')]
}
