/**
 * Development-only script.
 *
 * Downloads a photo for every recipe from TheCocktailDB (public test key "1")
 * into public/drinks/, validates each file (exists, > 5 KB, real JPEG/PNG
 * magic bytes) and writes src/data/recipeImages.json. Any recipe without a
 * valid photo gets a generated SVG of the finished drink instead, so the
 * site never shows a broken image and never calls the API at runtime.
 *
 * Run with:  npm run images:fetch
 * (behind a proxy on Node >= 22.21:  NODE_USE_ENV_PROXY=1 npm run images:fetch)
 */
import { mkdirSync, writeFileSync, existsSync, readFileSync, statSync, readdirSync, unlinkSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { RECIPES } from '../src/data/recipes.ts'
import { recipeSvg } from '../src/lib/drinkSvg.ts'
import { isValidRasterImage, MIN_IMAGE_BYTES } from './imageCheck.ts'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = join(ROOT, 'public', 'drinks')
const MAP_FILE = join(ROOT, 'src', 'data', 'recipeImages.json')
const API = 'https://www.thecocktaildb.com/api/json/v1/1/search.php?s='
const FORCE = process.argv.includes('--force')
const OFFLINE = process.argv.includes('--offline')

interface DbDrink {
  idDrink: string
  strDrink: string
  strDrinkThumb: string
}

interface ImageEntry {
  src: string
  source: 'cocktaildb' | 'svg'
  bytes: number
  dbName?: string
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’']/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function fetchJson(url: string): Promise<{ drinks: DbDrink[] | null } | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'user-agent': 'bartending-simulator-dev/1.0' } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return (await res.json()) as { drinks: DbDrink[] | null }
    } catch (err) {
      console.warn(`  retry ${attempt + 1} for ${url}: ${(err as Error).message}`)
      await sleep(500 * (attempt + 1))
    }
  }
  return null
}

async function fetchBytes(url: string): Promise<Buffer | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return Buffer.from(await res.arrayBuffer())
    } catch (err) {
      console.warn(`  retry ${attempt + 1} for ${url}: ${(err as Error).message}`)
      await sleep(500 * (attempt + 1))
    }
  }
  return null
}

async function findDrink(queries: string[]): Promise<DbDrink | null> {
  for (const q of queries) {
    // The API chokes on apostrophes, so search on a simplified form of the
    // name but insist on an exact (normalised) match of the result.
    const searchTerms = [...new Set([q, q.replace(/[\u2019']/g, ''), normalize(q)])]
    const want = normalize(q)
    for (const term of searchTerms) {
      const data = await fetchJson(API + encodeURIComponent(term))
      await sleep(120)
      const drinks = data?.drinks ?? []
      const exact = drinks.find((d) => normalize(d.strDrink) === want)
      if (exact) return exact
    }
  }
  return null
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true })
  const existing: Record<string, ImageEntry> = existsSync(MAP_FILE) ? JSON.parse(readFileSync(MAP_FILE, 'utf8')) : {}
  const out: Record<string, ImageEntry> = {}
  let photos = 0
  let svgs = 0
  const fallbacks: string[] = []

  for (const recipe of RECIPES) {
    const jpg = join(OUT_DIR, `${recipe.id}.jpg`)
    const prev = existing[recipe.id]

    // Reuse a previously validated photo unless --force.
    if (!FORCE && prev?.source === 'cocktaildb' && existsSync(jpg) && isValidRasterImage(readFileSync(jpg))) {
      out[recipe.id] = { ...prev, bytes: statSync(jpg).size }
      photos++
      continue
    }

    let buf: Buffer | null = null
    let dbName: string | undefined
    if (!OFFLINE) {
      const queries = [recipe.imageQuery, recipe.name].filter((q): q is string => !!q)
      const drink = await findDrink(queries)
      if (drink) {
        dbName = drink.strDrink
        buf = await fetchBytes(`${drink.strDrinkThumb}/large`)
        if (!buf || !isValidRasterImage(buf)) buf = await fetchBytes(drink.strDrinkThumb)
        await sleep(120)
      }
    }

    if (buf && isValidRasterImage(buf)) {
      writeFileSync(jpg, buf)
      out[recipe.id] = { src: `/drinks/${recipe.id}.jpg`, source: 'cocktaildb', bytes: buf.length, dbName }
      photos++
      console.log(`photo  ${recipe.id.padEnd(26)} <- ${dbName} (${buf.length} bytes)`)
    } else {
      const svgPath = join(OUT_DIR, `${recipe.id}.svg`)
      const svg = recipeSvg(recipe)
      writeFileSync(svgPath, svg)
      out[recipe.id] = { src: `/drinks/${recipe.id}.svg`, source: 'svg', bytes: Buffer.byteLength(svg) }
      svgs++
      fallbacks.push(recipe.id)
      console.log(`svg    ${recipe.id.padEnd(26)} (no valid photo${dbName ? `, db had "${dbName}" but file failed validation` : ''})`)
    }
  }

  writeFileSync(MAP_FILE, JSON.stringify(out, null, 2) + '\n')

  // Remove stale files (e.g. an SVG fallback for a recipe that now has a photo).
  const referenced = new Set(Object.values(out).map((e) => e.src.replace('/drinks/', '')))
  for (const f of readdirSync(OUT_DIR)) {
    if (!referenced.has(f)) {
      unlinkSync(join(OUT_DIR, f))
      console.log(`removed stale ${f}`)
    }
  }

  console.log(`\nDone: ${photos} photos, ${svgs} generated SVGs (min raster size ${MIN_IMAGE_BYTES} bytes).`)
  if (fallbacks.length) console.log('SVG fallbacks: ' + fallbacks.join(', '))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
