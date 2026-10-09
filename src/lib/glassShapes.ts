import type { GarnishId, GlassType } from '../data/types'

/**
 * Glass geometry shared by the React glass component and the static SVG
 * generator. Every glass lives in a 100 x 160 viewBox. `bowl` is the region
 * that holds liquid (used as a clip path), `outline` the full silhouette
 * drawn as glass, and `rim` the y coordinate and x extent of the lip.
 */
export interface GlassShape {
  bowl: string
  outline: string
  /** Extra decorative paths (stems, handles) drawn with the glass stroke. */
  extras: string[]
  rim: { y: number; x1: number; x2: number }
  /** Bottom of the liquid area (y) and top of liquid area (y). */
  liquid: { top: number; bottom: number }
  /** Where garnish sits (x at rim right side). */
  garnishAnchor: { x: number; y: number }
  /** Opaque material (copper mug) drawn under the liquid with this fill. */
  material?: string
}

export const GLASS_SHAPES: Record<GlassType, GlassShape> = {
  highball: {
    bowl: 'M31 22 H69 L67 150 H33 Z',
    outline: 'M30 20 H70 L68 152 H32 Z',
    extras: ['M33 146 H67'],
    rim: { y: 20, x1: 30, x2: 70 },
    liquid: { top: 24, bottom: 146 },
    garnishAnchor: { x: 68, y: 20 },
  },
  collins: {
    bowl: 'M35 12 H65 L64 152 H36 Z',
    outline: 'M34 10 H66 L65 154 H35 Z',
    extras: ['M36 148 H64'],
    rim: { y: 10, x1: 34, x2: 66 },
    liquid: { top: 14, bottom: 148 },
    garnishAnchor: { x: 64, y: 10 },
  },
  rocks: {
    bowl: 'M25 62 H75 L72 148 H28 Z',
    outline: 'M24 60 H76 L73 152 H27 Z',
    extras: ['M28 142 H72'],
    rim: { y: 60, x1: 24, x2: 76 },
    liquid: { top: 64, bottom: 142 },
    garnishAnchor: { x: 74, y: 60 },
  },
  coupe: {
    bowl: 'M19 52 C20 82 34 92 50 92 C66 92 80 82 81 52 Z',
    outline: 'M18 50 C19 82 34 94 50 94 C66 94 81 82 82 50 Z',
    extras: ['M48 94 L48 136 M52 94 L52 136', 'M30 140 C30 134 70 134 70 140 C70 145 30 145 30 140 Z'],
    rim: { y: 50, x1: 18, x2: 82 },
    liquid: { top: 54, bottom: 92 },
    garnishAnchor: { x: 78, y: 50 },
  },
  martini: {
    bowl: 'M16 42 H84 L50 94 Z',
    outline: 'M14 40 H86 L50 96 Z',
    extras: ['M48 96 L48 136 M52 96 L52 136', 'M30 140 C30 134 70 134 70 140 C70 145 30 145 30 140 Z'],
    rim: { y: 40, x1: 14, x2: 86 },
    liquid: { top: 44, bottom: 92 },
    garnishAnchor: { x: 80, y: 40 },
  },
  margarita: {
    bowl: 'M14 42 H86 L78 54 L64 60 L64 72 C64 90 56 96 50 96 C44 96 36 90 36 72 L36 60 L22 54 Z',
    outline: 'M12 40 H88 L80 54 L66 60 L66 72 C66 92 56 98 50 98 C44 98 34 92 34 72 L34 60 L20 54 Z',
    extras: ['M48 98 L48 136 M52 98 L52 136', 'M30 140 C30 134 70 134 70 140 C70 145 30 145 30 140 Z'],
    rim: { y: 40, x1: 12, x2: 88 },
    liquid: { top: 44, bottom: 96 },
    garnishAnchor: { x: 82, y: 40 },
  },
  shot: {
    bowl: 'M35 82 H65 L62 150 H38 Z',
    outline: 'M34 80 H66 L63 152 H37 Z',
    extras: ['M38 144 H62'],
    rim: { y: 80, x1: 34, x2: 66 },
    liquid: { top: 84, bottom: 144 },
    garnishAnchor: { x: 64, y: 80 },
  },
  hurricane: {
    bowl: 'M33 17 H67 C78 42 64 58 60 72 C56 86 60 100 66 112 C72 126 64 136 50 136 C36 136 28 126 34 112 C40 100 44 86 40 72 C36 58 22 42 33 17 Z',
    outline: 'M32 15 H68 C80 42 66 58 62 72 C58 86 62 100 68 112 C74 128 66 138 50 138 C34 138 26 128 32 112 C38 100 42 86 38 72 C34 58 20 42 32 15 Z',
    extras: ['M48 138 L48 146 M52 138 L52 146', 'M32 150 C32 144 68 144 68 150 C68 155 32 155 32 150 Z'],
    rim: { y: 15, x1: 32, x2: 68 },
    liquid: { top: 19, bottom: 134 },
    garnishAnchor: { x: 66, y: 15 },
  },
  flute: {
    bowl: 'M41 17 H59 C61 60 55 90 52 102 H48 C45 90 39 60 41 17 Z',
    outline: 'M40 15 H60 C62 60 56 92 53 104 H47 C44 92 38 60 40 15 Z',
    extras: ['M48 104 L48 138 M52 104 L52 138', 'M32 142 C32 136 68 136 68 142 C68 147 32 147 32 142 Z'],
    rim: { y: 15, x1: 40, x2: 60 },
    liquid: { top: 19, bottom: 100 },
    garnishAnchor: { x: 59, y: 15 },
  },
  wine: {
    bowl: 'M23 32 C18 72 30 96 50 100 C70 96 82 72 77 32 Z',
    outline: 'M22 30 C16 72 30 98 50 102 C70 98 84 72 78 30 Z',
    extras: ['M48 102 L48 138 M52 102 L52 138', 'M30 142 C30 136 70 136 70 142 C70 147 30 147 30 142 Z'],
    rim: { y: 30, x1: 22, x2: 78 },
    liquid: { top: 34, bottom: 98 },
    garnishAnchor: { x: 76, y: 30 },
  },
  mug: {
    bowl: 'M28 42 H72 V150 H28 Z',
    outline: 'M26 40 H74 V152 H26 Z',
    extras: ['M74 62 C94 62 94 118 74 118', 'M26 52 H74'],
    rim: { y: 40, x1: 26, x2: 74 },
    liquid: { top: 44, bottom: 148 },
    garnishAnchor: { x: 72, y: 40 },
    material: '#b87333',
  },
  irish: {
    bowl: 'M31 42 H69 L66 120 H34 Z',
    outline: 'M30 40 H70 L67 122 H33 Z',
    extras: ['M68 60 C86 62 86 100 67 104', 'M46 122 L46 136 M54 122 L54 136', 'M32 140 C32 134 68 134 68 140 C68 145 32 145 32 140 Z'],
    rim: { y: 40, x1: 30, x2: 70 },
    liquid: { top: 44, bottom: 118 },
    garnishAnchor: { x: 68, y: 40 },
  },
}

/**
 * Small garnish drawings as SVG fragments, each drawn around (0,0) so it can
 * be translated to the glass rim. Kept as plain strings so the static image
 * generator and the React view share them.
 */
export const GARNISH_SVG: Record<GarnishId, string> = {
  'lime-wedge': '<path d="M0 0 L-14 -12 A18 18 0 0 1 14 -12 Z" fill="#8fc93a" stroke="#3f6f12" stroke-width="1.5"/><path d="M0 -2 L-10 -10 A14 14 0 0 1 10 -10 Z" fill="#d8ec9a"/>',
  'lime-wheel': '<circle r="12" fill="#9ccc3a" stroke="#3f6f12" stroke-width="1.5"/><circle r="9" fill="#d8ec9a"/><path d="M0 -9 V9 M-9 0 H9 M-6.4 -6.4 L6.4 6.4 M6.4 -6.4 L-6.4 6.4" stroke="#8fc93a" stroke-width="1.2"/>',
  'lemon-twist': '<path d="M-2 -14 C8 -10 -8 -2 2 4 C10 8 -2 14 6 18" fill="none" stroke="#f5e34a" stroke-width="4" stroke-linecap="round"/><path d="M-2 -14 C8 -10 -8 -2 2 4 C10 8 -2 14 6 18" fill="none" stroke="#fff7b0" stroke-width="1.2" stroke-linecap="round"/>',
  'lemon-wheel': '<circle r="12" fill="#f5e34a" stroke="#c9a21a" stroke-width="1.5"/><circle r="9" fill="#fff7b0"/><path d="M0 -9 V9 M-9 0 H9 M-6.4 -6.4 L6.4 6.4 M6.4 -6.4 L-6.4 6.4" stroke="#f0d93a" stroke-width="1.2"/>',
  'lemon-wedge': '<path d="M0 0 L-14 -12 A18 18 0 0 1 14 -12 Z" fill="#f0d93a" stroke="#c9a21a" stroke-width="1.5"/><path d="M0 -2 L-10 -10 A14 14 0 0 1 10 -10 Z" fill="#fff7b0"/>',
  'orange-slice': '<path d="M-13 0 A13 13 0 0 1 13 0 Z" fill="#f7941d" stroke="#c96a00" stroke-width="1.5"/><path d="M-9 0 A9 9 0 0 1 9 0 Z" fill="#ffc97a"/><path d="M0 0 V-9 M-6.4 -6.4 L0 0 L6.4 -6.4" stroke="#f7941d" stroke-width="1.2"/>',
  'orange-twist': '<path d="M-2 -14 C8 -10 -8 -2 2 4 C10 8 -2 14 6 18" fill="none" stroke="#f7941d" stroke-width="4" stroke-linecap="round"/><path d="M-2 -14 C8 -10 -8 -2 2 4 C10 8 -2 14 6 18" fill="none" stroke="#ffd59a" stroke-width="1.2" stroke-linecap="round"/>',
  'mint-sprig': '<path d="M0 6 V-18" stroke="#2e8b57" stroke-width="1.5"/><path d="M0 -4 C-8 -6 -10 -14 -6 -16 C-1 -14 0 -8 0 -4 Z" fill="#3fa36b" stroke="#1f6b40" stroke-width="1"/><path d="M0 -4 C8 -6 10 -14 6 -16 C1 -14 0 -8 0 -4 Z" fill="#3fa36b" stroke="#1f6b40" stroke-width="1"/><path d="M0 -12 C-6 -14 -7 -22 -3 -24 C0 -22 0 -16 0 -12 Z" fill="#4fbf7c" stroke="#1f6b40" stroke-width="1"/><path d="M0 -12 C6 -14 7 -22 3 -24 C0 -22 0 -16 0 -12 Z" fill="#4fbf7c" stroke="#1f6b40" stroke-width="1"/>',
  cherry: '<path d="M0 -4 C2 -12 6 -16 10 -18" fill="none" stroke="#5a3a1a" stroke-width="1.5"/><circle r="6" fill="#8b1a2e" stroke="#4a0a14" stroke-width="1"/><circle cx="-2" cy="-2" r="1.6" fill="#ffffff" opacity="0.6"/>',
  olive: '<path d="M-14 -16 L8 8" stroke="#d9d9d9" stroke-width="1.5"/><ellipse cx="4" cy="4" rx="5.5" ry="7" fill="#6b7a2a" stroke="#3f4a12" stroke-width="1"/><circle cx="4" cy="2" r="1.8" fill="#c8102e"/>',
  cucumber: '<path d="M-10 -14 C6 -10 -8 0 8 6 C16 10 4 16 10 20" fill="none" stroke="#b5d99c" stroke-width="5" stroke-linecap="round"/><path d="M-10 -14 C6 -10 -8 0 8 6 C16 10 4 16 10 20" fill="none" stroke="#5a8f3a" stroke-width="1" stroke-linecap="round"/>',
  umbrella: '<path d="M0 0 L8 -28" stroke="#8b5a2b" stroke-width="1.5"/><path d="M-12 -24 A20 20 0 0 1 28 -32 L8 -28 Z" fill="#e0557a" stroke="#a02a4a" stroke-width="1"/><path d="M-2 -25 L8 -28 M10 -31 L8 -28 M22 -32 L8 -28" stroke="#ffffff" stroke-width="0.8"/>',
  straw: '<path d="M-6 10 L10 -34" stroke="#f2f2f2" stroke-width="3.5" stroke-linecap="round"/><path d="M-6 10 L10 -34" stroke="#c8102e" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="4 4"/>',
  nutmeg: '<circle cx="-8" cy="2" r="1" fill="#8b5a2b"/><circle cx="-3" cy="-1" r="1.2" fill="#8b5a2b"/><circle cx="3" cy="2" r="1" fill="#6b4a1b"/><circle cx="8" cy="-1" r="1.2" fill="#8b5a2b"/><circle cx="0" cy="4" r="0.8" fill="#6b4a1b"/><circle cx="-5" cy="5" r="0.8" fill="#8b5a2b"/><circle cx="6" cy="5" r="0.9" fill="#6b4a1b"/>',
  'pineapple-wedge': '<path d="M-6 0 L6 0 L0 -22 Z" fill="#f5d35a" stroke="#c9a21a" stroke-width="1.2"/><path d="M-4 -2 L4 -2 M-3 -8 L3 -8 M-2 -14 L2 -14" stroke="#e0b530" stroke-width="0.8"/><path d="M0 -22 L-6 -34 M0 -22 L0 -36 M0 -22 L6 -34" stroke="#2e8b57" stroke-width="2" stroke-linecap="round"/>',
  celery: '<path d="M-2 10 L2 10 L3 -34 L-3 -34 Z" fill="#9fcf6a" stroke="#4f8f2a" stroke-width="1"/><path d="M0 -34 C-8 -40 -10 -46 -4 -48 M0 -34 C8 -40 10 -46 4 -48 M0 -34 L0 -50" fill="none" stroke="#4f8f2a" stroke-width="1.5"/>',
  berries: '<circle cx="-6" cy="0" r="4.5" fill="#5b1133" stroke="#2a0a18" stroke-width="0.8"/><circle cx="4" cy="-3" r="4.5" fill="#7a1a44" stroke="#2a0a18" stroke-width="0.8"/><circle cx="0" cy="6" r="4" fill="#5b1133" stroke="#2a0a18" stroke-width="0.8"/>',
  'coffee-beans': '<ellipse cx="-7" cy="0" rx="4" ry="2.6" fill="#3b2412" transform="rotate(-20 -7 0)"/><ellipse cx="2" cy="-2" rx="4" ry="2.6" fill="#3b2412" transform="rotate(15 2 -2)"/><ellipse cx="9" cy="2" rx="4" ry="2.6" fill="#3b2412" transform="rotate(-30 9 2)"/><path d="M-9 0.5 L-5 -0.5 M0 -2.5 L4 -1.5 M7 2.5 L11 1.5" stroke="#8b5a2b" stroke-width="0.8"/>',
  'cocktail-onion': '<path d="M-14 -16 L8 8" stroke="#d9d9d9" stroke-width="1.5"/><circle cx="4" cy="4" r="6" fill="#f3ead8" stroke="#b9a98a" stroke-width="1"/><path d="M1 1 C3 3 5 3 7 1" stroke="#b9a98a" stroke-width="0.8" fill="none"/>',
  'candied-ginger': '<path d="M-14 -16 L8 8" stroke="#d9d9d9" stroke-width="1.5"/><rect x="-2" y="-2" width="12" height="11" rx="2" fill="#e9b65a" stroke="#a87a2a" stroke-width="1" transform="rotate(15 4 4)"/><circle cx="2" cy="1" r="0.8" fill="#ffffff"/><circle cx="7" cy="5" r="0.8" fill="#ffffff"/>',
  'apple-slice': '<path d="M-12 -4 A14 14 0 0 1 12 -4 L10 2 A11 11 0 0 0 -10 2 Z" fill="#f3f0d8" stroke="#9ad43a" stroke-width="2.5"/>',
  'cinnamon-stick': '<path d="M-6 10 L8 -34" stroke="#a0522d" stroke-width="5" stroke-linecap="round"/><path d="M-6 10 L8 -34" stroke="#7a3a1a" stroke-width="1" stroke-linecap="round" stroke-dasharray="3 5"/>',
}

/** Rough visual footprint height of each garnish above the rim, used to size the SVG margins. */
export const GARNISH_HEIGHT: Partial<Record<GarnishId, number>> = {
  'mint-sprig': 26,
  umbrella: 34,
  straw: 36,
  celery: 52,
  'pineapple-wedge': 38,
  'cinnamon-stick': 36,
}
