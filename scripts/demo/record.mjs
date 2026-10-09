/**
 * Records the demo video clips with Playwright (one WebM per scene) at 1920x1080,
 * driving the production build like a person would: smooth mouse moves, a
 * visible cursor overlay and pauses so the animations can be seen.
 *
 *   node scripts/demo/record.mjs <output-dir>
 *
 * Requires the site to be served on http://127.0.0.1:4173 (npm run preview).
 */
import { chromium } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const BASE = 'http://127.0.0.1:4173'
const OUT = process.argv[2] ?? 'demo-clips'
const W = 1920
const H = 1080
/** Height of the caption band reserved at the top of every scene (px). */
const CAPTION_BAND = 56
const SITE_URL = 'bartending-simulator.pages.dev'
/** Math.random value that makes the Easy challenge pick the Rusty Nail. */
const EASY_SEED = 0.6044776119402985

mkdirSync(OUT, { recursive: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/** A visible mouse cursor that follows pointer events (headless video has no cursor). */
const CURSOR_SCRIPT = `(() => {
  const css = '#__demo_cursor{position:fixed;left:0;top:0;width:30px;height:30px;z-index:2147483647;pointer-events:none;transform:translate(-3px,-2px);filter:drop-shadow(0 2px 3px rgba(0,0,0,.7))}#__demo_cursor.down svg{transform:scale(.88);transform-origin:4px 2px}';
  const mount = () => {
    if (document.getElementById('__demo_cursor')) return;
    const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);
    const c = document.createElement('div'); c.id = '__demo_cursor';
    c.innerHTML = '<svg viewBox="0 0 30 30" width="30" height="30"><path d="M4 2 L4 23 L9.5 18 L13.2 26.5 L17 24.8 L13.3 16.5 L21 16.5 Z" fill="#ffffff" stroke="#111" stroke-width="1.7" stroke-linejoin="round"/></svg>';
    document.body.appendChild(c);
  };
  window.addEventListener('pointermove', (e) => { const c = document.getElementById('__demo_cursor'); if (c) { c.style.left = e.clientX + 'px'; c.style.top = e.clientY + 'px'; } }, true);
  window.addEventListener('pointerdown', () => document.getElementById('__demo_cursor')?.classList.add('down'), true);
  window.addEventListener('pointerup', () => document.getElementById('__demo_cursor')?.classList.remove('down'), true);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();`

/** Leaves a band above the page where the demo caption is drawn in post-production. */
const CAPTION_BAND_SCRIPT = `(() => {
  const apply = () => { const s = document.createElement('style'); s.textContent = 'body{padding-top:${CAPTION_BAND}px !important}'; document.head.appendChild(s); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply); else apply();
})();`

let cur = { x: W / 2, y: H / 2 }

/** Ease the mouse from the current point to `to` over `ms` of wall-clock time. */
async function glide(page, to, ms = 600) {
  const from = { ...cur }
  const start = Date.now()
  for (;;) {
    const t = Math.min(1, (Date.now() - start) / ms)
    const e = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
    await page.mouse.move(from.x + (to.x - from.x) * e, from.y + (to.y - from.y) * e)
    if (t >= 1) break
    await sleep(12)
  }
  cur = { ...to }
}

async function center(page, locator) {
  await locator.first().waitFor({ state: 'visible', timeout: 10000 })
  await locator.first().scrollIntoViewIfNeeded()
  const box = await locator.first().boundingBox()
  if (!box) throw new Error('no bounding box')
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 }
}

async function click(page, locator, pauseAfter = 600) {
  await glide(page, await center(page, locator), 480)
  await sleep(90)
  await page.mouse.down()
  await sleep(80)
  await page.mouse.up()
  await sleep(pauseAfter)
}

async function drag(page, source, target, pauseAfter = 900) {
  await glide(page, await center(page, source), 480)
  await sleep(100)
  await page.mouse.down()
  await sleep(120)
  const to = await center(page, target)
  await glide(page, { x: cur.x + 6, y: cur.y + 6 }, 60)
  await glide(page, to, 650)
  await sleep(220)
  await page.mouse.up()
  await sleep(pauseAfter)
}

async function pour(page, bottleId, target, amount, pauseAfter = 500) {
  await glide(page, await center(page, page.getByTestId(`bottle-${bottleId}`)), 480)
  await sleep(100)
  await page.mouse.down()
  await sleep(120)
  const to = await center(page, page.locator(`[data-drop="${target}"]`))
  await glide(page, { x: cur.x + 6, y: cur.y + 6 }, 60)
  await glide(page, to, 650)
  const total = page.getByTestId('pour-total')
  await total.waitFor({ state: 'visible', timeout: 8000 })
  const releaseAt = amount - Math.min(2.5, amount * 0.1)
  const deadline = Date.now() + 15000
  while (Date.now() < deadline) {
    const v = parseFloat((await total.textContent()) ?? '0')
    if (v >= releaseAt) break
  }
  await page.mouse.up()
  await sleep(pauseAfter)
}

async function scene(browser, name, run, options = {}) {
  const context = await browser.newContext({
    viewport: { width: W, height: H },
    deviceScaleFactor: 1,
    recordVideo: { dir: OUT, size: { width: W, height: H } },
    storageState: options.storageState,
  })
  await context.addInitScript(CURSOR_SCRIPT)
  await context.addInitScript(CAPTION_BAND_SCRIPT)
  if (options.initScript) await context.addInitScript(options.initScript)
  const page = await context.newPage()
  cur = { x: W / 2, y: H / 2 }
  const started = Date.now()
  await run(page, context)
  const video = page.video()
  await page.close()
  const file = join(OUT, `${name}.webm`)
  await video.saveAs(file)
  await context.close()
  console.log(`${name}: ${((Date.now() - started) / 1000).toFixed(1)} s -> ${file}`)
}

async function titleCard(browser) {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 })
  await page.setContent(`<!doctype html><html><head><style>
    body{margin:0;width:${W}px;height:${H}px;display:flex;align-items:center;justify-content:center;font-family:Georgia,'DejaVu Serif',serif;color:#f7efe0;
      background:#1a110b;background-image:radial-gradient(ellipse at 50% 20%, rgba(240,212,138,.22), transparent 55%),radial-gradient(ellipse at 10% 100%, rgba(122,79,46,.4), transparent 50%),linear-gradient(180deg,#241509,#1a110b 60%,#120b06)}
    .card{text-align:center}
    .eyebrow{letter-spacing:.42em;text-transform:uppercase;font-size:28px;color:#d9b25a;font-family:'DejaVu Sans',Arial,sans-serif}
    h1{font-size:118px;margin:18px 0 10px;font-weight:700;letter-spacing:.01em;text-shadow:0 8px 30px rgba(0,0,0,.6)}
    .tag{font-size:40px;color:#e9dcc3;margin-bottom:46px}
    .url{display:inline-block;font-family:'DejaVu Sans',Arial,sans-serif;font-size:36px;color:#1a110b;background:linear-gradient(180deg,#e2c062,#b88d2e);padding:14px 34px;border-radius:14px;border:2px solid #f0d48a;box-shadow:0 6px 24px rgba(217,178,90,.45)}
    .glasses{display:flex;justify-content:center;gap:40px;margin-bottom:30px}
  </style></head><body><div class="card">
    <div class="glasses">
      <svg viewBox="0 0 100 160" width="110" height="176"><path d="M14 40 H86 L50 96 Z" fill="#e8f1f5" fill-opacity=".35" stroke="#f3f3f3" stroke-width="2"/><path d="M48 96 V136 M52 96 V136" stroke="#f3f3f3" stroke-width="2"/><path d="M30 140 C30 134 70 134 70 140 C70 145 30 145 30 140 Z" fill="none" stroke="#f3f3f3" stroke-width="2"/><circle cx="60" cy="60" r="6" fill="#6b7a2a"/></svg>
      <svg viewBox="0 0 100 160" width="110" height="176"><path d="M30 20 H70 L68 152 H32 Z" fill="#f5a623" fill-opacity=".85" stroke="#f3f3f3" stroke-width="2"/><rect x="38" y="60" width="16" height="16" rx="3" fill="#fff" opacity=".5"/><rect x="48" y="90" width="16" height="16" rx="3" fill="#fff" opacity=".5"/><path d="M57 20 A13 13 0 0 1 83 20 Z" fill="#f7941d" stroke="#c96a00"/></svg>
      <svg viewBox="0 0 100 160" width="110" height="176"><path d="M12 40 H88 L80 54 L66 60 L66 72 C66 92 56 98 50 98 C44 98 34 92 34 72 L34 60 L20 54 Z" fill="#dfe9a8" fill-opacity=".8" stroke="#f3f3f3" stroke-width="2"/><path d="M48 98 V136 M52 98 V136" stroke="#f3f3f3" stroke-width="2"/><path d="M30 140 C30 134 70 134 70 140 C70 145 30 145 30 140 Z" fill="none" stroke="#f3f3f3" stroke-width="2"/><path d="M12 40 H88" stroke="#fff" stroke-width="5"/></svg>
    </div>
    <div class="eyebrow">A realistic bar simulator</div>
    <h1>Bartending Simulator</h1>
    <div class="tag">Pour, shake, stir and garnish 212 cocktails. Then get scored like a pro.</div>
    <div class="url">${SITE_URL}</div>
  </div></body></html>`)
  await page.screenshot({ path: join(OUT, 'title.png') })
  await page.close()
}

const browser = await chromium.launch()
await titleCard(browser)

// 1. Home
await scene(browser, '01-home', async (page) => {
  await page.goto(`${BASE}/`)
  await page.waitForSelector('[data-testid="home-free-bar"]')
  await sleep(800)
  await glide(page, await center(page, page.getByTestId('home-free-bar')), 800)
  await sleep(500)
  await glide(page, await center(page, page.getByTestId('home-recipes')), 600)
  await sleep(450)
  await glide(page, await center(page, page.getByTestId('home-challenge')), 600)
  await sleep(800)
})

// 2. Recipe library + detail
await scene(browser, '02-library', async (page) => {
  await page.goto(`${BASE}/recipes`)
  await page.waitForSelector('[data-testid="recipe-grid"]')
  await sleep(700)
  await click(page, page.getByTestId('recipe-search'), 250)
  await page.keyboard.type('marga', { delay: 130 })
  await sleep(900)
  await click(page, page.getByTestId('recipe-card-margarita'), 300)
  await page.waitForSelector('[data-testid="recipe-detail"]')
  await sleep(700)
  await glide(page, await center(page, page.getByTestId('spec-tequila')), 800)
  await sleep(400)
  await glide(page, await center(page, page.getByTestId('spec-lime-juice')), 600)
  await sleep(1100)
})

// 3. Free bar: Vodka 7Up then dump
await scene(browser, '03-freebar', async (page) => {
  await page.goto(`${BASE}/bar`)
  await page.waitForSelector('[data-testid="glass-rack"]')
  await sleep(700)
  await click(page, page.getByTestId('rack-highball'), 600)
  await drag(page, page.getByTestId('ice-cubes'), page.locator('[data-drop="glass"]'), 800)
  await pour(page, 'vodka', 'glass', 45, 600)
  await click(page, page.getByTestId('shelf-tab-sodas'), 300)
  await pour(page, 'lemon-lime-soda', 'glass', 70, 600)
  await click(page, page.getByTestId('shelf-tab-garnishes'), 300)
  await drag(page, page.getByTestId('garnish-lime-wedge'), page.locator('[data-drop="glass"]'), 1100)
  await drag(page, page.getByTestId('counter-glass'), page.locator('[data-drop="bin"]'), 1400)
})

// 4. Guided Margarita
await scene(browser, '04-guided', async (page) => {
  await page.goto(`${BASE}/bar/guided/margarita`)
  await page.waitForSelector('[data-testid="guided-steps"]')
  await sleep(800)
  await click(page, page.getByTestId('rack-margarita'), 500)
  await drag(page, page.getByTestId('counter-glass'), page.locator('[data-drop="lime-dish"]'), 1100)
  await drag(page, page.getByTestId('counter-glass'), page.locator('[data-drop="salt-dish"]'), 1100)
  await drag(page, page.getByTestId('ice-cubes'), page.locator('[data-drop="shaker"]'), 700)
  await pour(page, 'tequila', 'shaker', 50, 350)
  await pour(page, 'triple-sec', 'shaker', 20, 350)
  await pour(page, 'lime-juice', 'shaker', 15, 350)
  await click(page, page.getByTestId('btn-shake'), 1800)
  await click(page, page.getByTestId('btn-strain-shaker'), 1600)
  await drag(page, page.getByTestId('garnish-lime-wedge'), page.locator('[data-drop="glass"]'), 1300)
})

// 5. Challenge: pick Easy, build the Rusty Nail, serve
const storage = join(OUT, 'storage.json')
await scene(
  browser,
  '05-challenge',
  async (page, context) => {
    await page.goto(`${BASE}/challenge`)
    await page.waitForSelector('[data-testid="challenge-easy"]')
    await sleep(800)
    await click(page, page.getByTestId('challenge-easy'), 250)
    await page.waitForSelector('[data-testid="challenge-title"]')
    await sleep(1300)
    await click(page, page.getByTestId('rack-rocks'), 500)
    await drag(page, page.getByTestId('ice-cubes'), page.locator('[data-drop="glass"]'), 600)
    await click(page, page.getByTestId('shelf-tab-whiskey'), 250)
    await pour(page, 'scotch', 'glass', 45, 350)
    await click(page, page.getByTestId('shelf-tab-liqueurs'), 250)
    await pour(page, 'drambuie', 'glass', 25, 350)
    await click(page, page.getByTestId('shelf-tab-garnishes'), 250)
    await drag(page, page.getByTestId('garnish-lemon-twist'), page.locator('[data-drop="glass"]'), 600)
    await click(page, page.getByTestId('btn-serve'), 200)
    await page.waitForSelector('[data-testid="serve-modal"]')
    await sleep(2500)
    await context.storageState({ path: storage })
  },
  { initScript: `Math.random = () => ${EASY_SEED};` },
)

// 6. Progress
await scene(
  browser,
  '06-progress',
  async (page) => {
    await page.goto(`${BASE}/progress`)
    await page.waitForSelector('[data-testid="progress-page"]')
    await sleep(800)
    await glide(page, await center(page, page.getByTestId('stat-mastered')), 700)
    await sleep(400)
    await glide(page, await center(page, page.getByTestId('progress-easy')), 700)
    await sleep(500)
    await glide(page, await center(page, page.getByTestId('history-list')), 600)
    await sleep(1100)
  },
  { storageState: storage },
)

await browser.close()
writeFileSync(join(OUT, 'done.txt'), new Date().toISOString())
console.log('All scenes recorded.')
