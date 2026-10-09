import type { GarnishId, GlassType, IceType, Recipe, RimType } from '../data/types'
import { GLASS_SHAPES, GARNISH_SVG } from './glassShapes'
import { mixColor, lighten, darken } from './colors'
import { fillLevel } from './pouring'
import { INGREDIENT_MAP, UNIT_ML } from '../data/ingredients'
import { GLASS_MAP } from '../data/glasses'

export interface DrinkSvgOptions {
  glass: GlassType
  color: string
  opacity: number
  level: number
  ice: IceType
  rim: RimType
  garnishes: GarnishId[]
  title?: string
  /** Pale foam cap on the drink (egg white, cream). */
  foam?: boolean
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function iceSvg(glass: GlassType, ice: IceType, level: number): string {
  const s = GLASS_SHAPES[glass]
  if (ice === 'none') return ''
  const top = s.liquid.bottom - (s.liquid.bottom - s.liquid.top) * Math.max(level, 0.35)
  const cx = (s.rim.x1 + s.rim.x2) / 2
  const width = (s.rim.x2 - s.rim.x1) * 0.6
  if (ice === 'crushed') {
    let out = ''
    const rows = 7
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < 5; j++) {
        const x = cx - width / 2 + (j + (i % 2) * 0.5) * (width / 5)
        const y = top + 4 + i * ((s.liquid.bottom - top - 8) / rows)
        out += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="5" height="4" rx="1" fill="#ffffff" opacity="0.55" transform="rotate(${((i * 37 + j * 23) % 40) - 20} ${(x + 2.5).toFixed(1)} ${(y + 2).toFixed(1)})"/>`
      }
    }
    return out
  }
  const cubes = [
    [cx - width * 0.3, top + 10, -12],
    [cx + width * 0.2, top + 16, 15],
    [cx - width * 0.05, top + 34, 5],
    [cx + width * 0.22, top + 44, -20],
  ]
  return cubes
    .map(
      ([x, y, r]) =>
        `<g transform="rotate(${r} ${x.toFixed(1)} ${y.toFixed(1)})"><rect x="${(x - 8).toFixed(1)}" y="${(y - 8).toFixed(1)}" width="16" height="16" rx="3" fill="#ffffff" opacity="0.45" stroke="#ffffff" stroke-opacity="0.8" stroke-width="1"/><path d="M${(x - 5).toFixed(1)} ${(y - 5).toFixed(1)} L${(x + 2).toFixed(1)} ${(y - 5).toFixed(1)}" stroke="#ffffff" stroke-width="1.5" opacity="0.9"/></g>`,
    )
    .join('')
}

function rimSvg(glass: GlassType, rim: RimType): string {
  if (rim === 'none') return ''
  const s = GLASS_SHAPES[glass]
  const fill = rim === 'salt' ? '#ffffff' : '#fff3c4'
  let dots = ''
  const n = Math.round((s.rim.x2 - s.rim.x1) / 3)
  for (let i = 0; i <= n; i++) {
    const x = s.rim.x1 + ((s.rim.x2 - s.rim.x1) * i) / n
    const y = s.rim.y + ((i * 7) % 3) - 1
    dots += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${1.2 + ((i * 3) % 2) * 0.5}" fill="${fill}" opacity="0.95"/>`
  }
  return `<path d="M${s.rim.x1} ${s.rim.y} H${s.rim.x2}" stroke="${fill}" stroke-width="3" opacity="0.9"/>${dots}`
}

function garnishSvg(glass: GlassType, garnishes: GarnishId[]): string {
  const s = GLASS_SHAPES[glass]
  return garnishes
    .map((g, i) => {
      const svg = GARNISH_SVG[g]
      if (!svg) return ''
      const surface = ['nutmeg', 'coffee-beans', 'berries'].includes(g)
      const x = surface ? (s.rim.x1 + s.rim.x2) / 2 : s.garnishAnchor.x - i * 18
      const y = surface ? s.rim.y + 10 : s.garnishAnchor.y
      return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})">${svg}</g>`
    })
    .join('')
}

/**
 * Render a finished drink as a standalone SVG string: the glass, the liquid
 * at the right level and colour, ice, rim and garnish. Used both as the
 * fallback recipe image and for previews inside the app.
 */
export function renderDrinkSvg(opts: DrinkSvgOptions, size = 500): string {
  const s = GLASS_SHAPES[opts.glass]
  const level = Math.max(0, Math.min(1, opts.level))
  const liquidTop = s.liquid.bottom - (s.liquid.bottom - s.liquid.top) * level
  const id = `g${Math.abs(hash(opts.glass + opts.color + opts.garnishes.join()))}`
  const hi = lighten(opts.color, 0.35)
  const lo = darken(opts.color, 0.25)
  const foam = opts.foam && level > 0
    ? `<rect x="0" y="${(liquidTop - 2).toFixed(1)}" width="100" height="7" fill="#fff8e6" opacity="0.9" clip-path="url(#${id}-bowl)"/>`
    : ''
  const material = s.material
    ? `<path d="${s.outline}" fill="${s.material}" opacity="0.85"/>`
    : `<path d="${s.outline}" fill="url(#${id}-glass)" opacity="0.55"/>`
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-10 -30 120 200" width="${size}" height="${size}" role="img" aria-label="${esc(opts.title ?? 'Cocktail')}">
  <title>${esc(opts.title ?? 'Cocktail')}</title>
  <defs>
    <clipPath id="${id}-bowl"><path d="${s.bowl}"/></clipPath>
    <linearGradient id="${id}-liq" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stop-color="${lo}"/>
      <stop offset="0.35" stop-color="${opts.color}"/>
      <stop offset="0.7" stop-color="${hi}"/>
      <stop offset="1" stop-color="${opts.color}"/>
    </linearGradient>
    <linearGradient id="${id}-glass" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.35"/>
      <stop offset="0.25" stop-color="#ffffff" stop-opacity="0.05"/>
      <stop offset="0.75" stop-color="#ffffff" stop-opacity="0.08"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0.4"/>
    </linearGradient>
    <radialGradient id="${id}-bg" cx="0.5" cy="0.45" r="0.7">
      <stop offset="0" stop-color="#4a2f1b"/>
      <stop offset="1" stop-color="#1a110b"/>
    </radialGradient>
  </defs>
  <rect x="-10" y="-30" width="120" height="200" fill="url(#${id}-bg)"/>
  <ellipse cx="50" cy="158" rx="42" ry="5" fill="#000" opacity="0.35"/>
  ${material}
  <g clip-path="url(#${id}-bowl)">
    <rect x="0" y="${liquidTop.toFixed(1)}" width="100" height="${(s.liquid.bottom - liquidTop + 10).toFixed(1)}" fill="url(#${id}-liq)" opacity="${Math.max(0.35, opts.opacity).toFixed(2)}"/>
    ${foam}
    ${level > 0 ? iceSvg(opts.glass, opts.ice, level) : ''}
  </g>
  <path d="${s.outline}" fill="none" stroke="#f3f3f3" stroke-opacity="0.85" stroke-width="1.6"/>
  ${s.extras.map((d) => `<path d="${d}" fill="none" stroke="#f3f3f3" stroke-opacity="0.8" stroke-width="1.6"/>`).join('')}
  <path d="${s.outline}" fill="none" stroke="#ffffff" stroke-opacity="0.35" stroke-width="4" stroke-dasharray="0 18 22 200" stroke-linecap="round"/>
  ${rimSvg(opts.glass, opts.rim)}
  ${garnishSvg(opts.glass, opts.garnishes)}
</svg>`
}

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return h
}

/** Build the options for a recipe's finished-drink preview from its ingredient list. */
export function drinkSvgOptionsForRecipe(recipe: Recipe): DrinkSvgOptions {
  const contents = recipe.ingredients.map((i) => ({ id: i.id, amount: i.amount }))
  const mixed = mixColor(contents)
  const ml = recipe.ingredients.reduce((sum, i) => {
    const ing = INGREDIENT_MAP[i.id]
    return sum + (ing ? i.amount * UNIT_ML[ing.unit] : 0)
  }, 0)
  const cap = GLASS_MAP[recipe.glass].capacityMl
  const foam = recipe.ingredients.some((i) => i.id === 'egg-white' || (i.id === 'cream' && i.top))
  return {
    glass: recipe.glass,
    color: mixed.color,
    opacity: mixed.opacity,
    level: Math.max(0.3, fillLevel(ml, cap, recipe.ice)),
    ice: recipe.ice,
    rim: recipe.rim,
    garnishes: recipe.garnish,
    title: recipe.name,
    foam,
  }
}

export function recipeSvg(recipe: Recipe, size = 500): string {
  return renderDrinkSvg(drinkSvgOptionsForRecipe(recipe), size)
}
