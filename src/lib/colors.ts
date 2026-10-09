import { INGREDIENT_MAP, UNIT_ML } from '../data/ingredients'
import type { ContentEntry } from './pouring'

export interface RGB {
  r: number
  g: number
  b: number
}

export interface LiquidColor {
  color: string
  opacity: number
}

export function hexToRgb(hex: string): RGB {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const n = parseInt(full, 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

export function rgbToHex({ r, g, b }: RGB): string {
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')
  return `#${c(r)}${c(g)}${c(b)}`
}

export function liquidColorOf(id: string): LiquidColor {
  const ing = INGREDIENT_MAP[id]
  if (!ing) return { color: '#cccccc', opacity: 0.5 }
  return { color: ing.color, opacity: ing.opacity }
}

/**
 * Blend the contents of a vessel into one colour, weighting each ingredient
 * by its volume and how opaque it is. Clear spirits barely tint juices;
 * grenadine dominates soda.
 */
export function mixColor(contents: ContentEntry[]): LiquidColor {
  let r = 0
  let g = 0
  let b = 0
  let weight = 0
  let volume = 0
  let opacitySum = 0
  for (const c of contents) {
    const ing = INGREDIENT_MAP[c.id]
    if (!ing) continue
    const ml = c.amount * (UNIT_ML[ing.unit] || (ing.unit === 'piece' ? 2 : 0))
    if (ml <= 0) continue
    const w = ml * ing.opacity
    const rgb = hexToRgb(ing.color)
    r += rgb.r * w
    g += rgb.g * w
    b += rgb.b * w
    weight += w
    volume += ml
    opacitySum += ing.opacity * ml
  }
  if (weight === 0 || volume === 0) return { color: '#e9f2f6', opacity: 0.15 }
  return {
    color: rgbToHex({ r: r / weight, g: g / weight, b: b / weight }),
    opacity: Math.min(0.98, Math.max(0.12, opacitySum / volume)),
  }
}

export interface LiquidLayer extends LiquidColor {
  id: string
  ml: number
}

/** One visual layer per poured entry, bottom first, as they went in. */
export function layerColors(contents: ContentEntry[]): LiquidLayer[] {
  const out: LiquidLayer[] = []
  for (const c of contents) {
    const ing = INGREDIENT_MAP[c.id]
    if (!ing) continue
    const ml = c.amount * UNIT_ML[ing.unit]
    if (ml <= 0) continue
    out.push({ id: c.id, ml, color: ing.color, opacity: ing.opacity })
  }
  return out
}

/** Slightly lighten a hex colour for highlights. */
export function lighten(hex: string, amount = 0.2): string {
  const { r, g, b } = hexToRgb(hex)
  return rgbToHex({ r: r + (255 - r) * amount, g: g + (255 - g) * amount, b: b + (255 - b) * amount })
}

export function darken(hex: string, amount = 0.2): string {
  const { r, g, b } = hexToRgb(hex)
  return rgbToHex({ r: r * (1 - amount), g: g * (1 - amount), b: b * (1 - amount) })
}
