/**
 * Verifies that every recipe has a valid local image and regenerates SVG
 * fallbacks for any that fail. Never touches the network.
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { RECIPES } from '../src/data/recipes.ts'
import { recipeSvg } from '../src/lib/drinkSvg.ts'
import { isValidRasterImage, isValidSvg } from './imageCheck.ts'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = join(ROOT, 'public', 'drinks')
const MAP_FILE = join(ROOT, 'src', 'data', 'recipeImages.json')

interface ImageEntry {
  src: string
  source: 'cocktaildb' | 'svg'
  bytes: number
  dbName?: string
}

mkdirSync(OUT_DIR, { recursive: true })
const map: Record<string, ImageEntry> = existsSync(MAP_FILE) ? JSON.parse(readFileSync(MAP_FILE, 'utf8')) : {}
let fixed = 0
let ok = 0

for (const recipe of RECIPES) {
  const entry = map[recipe.id]
  const file = entry ? join(ROOT, 'public', entry.src) : ''
  let valid = false
  if (entry && existsSync(file)) {
    if (entry.source === 'cocktaildb') valid = isValidRasterImage(readFileSync(file))
    else valid = isValidSvg(readFileSync(file, 'utf8'))
  }
  if (valid) {
    ok++
    continue
  }
  const svgPath = join(OUT_DIR, `${recipe.id}.svg`)
  const svg = recipeSvg(recipe)
  writeFileSync(svgPath, svg)
  map[recipe.id] = { src: `/drinks/${recipe.id}.svg`, source: 'svg', bytes: Buffer.byteLength(svg) }
  fixed++
  console.log(`regenerated SVG for ${recipe.id}`)
}

writeFileSync(MAP_FILE, JSON.stringify(map, null, 2) + '\n')
console.log(`${ok} valid, ${fixed} regenerated.`)
