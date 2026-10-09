import { expect, type Page, type Locator } from '@playwright/test'

export const SCREENSHOT_DIR = 'docs/screenshots'

/** Collects console errors, page errors and failed requests for the lifetime of the page. */
export function trackErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console: ${m.text()}`)
  })
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  page.on('requestfailed', (r) => errors.push(`requestfailed: ${r.url()} ${r.failure()?.errorText ?? ''}`))
  page.on('response', (r) => {
    if (r.status() >= 400) errors.push(`http ${r.status()}: ${r.url()}`)
  })
  return errors
}

/** Every <img> on the page must have loaded real pixels. */
export async function expectNoBrokenImages(page: Page) {
  await page.evaluate(() => document.querySelectorAll('img').forEach((i) => (i.loading = 'eager')))
  await page.waitForFunction(() => Array.from(document.querySelectorAll('img')).every((i) => i.complete), null, { timeout: 30_000 })
  const broken = await page.evaluate(() =>
    Array.from(document.querySelectorAll('img'))
      .filter((i) => !(i.naturalWidth > 0 && i.naturalHeight > 0))
      .map((i) => i.getAttribute('src')),
  )
  expect(broken, 'broken images').toEqual([])
}

async function center(locator: Locator): Promise<{ x: number; y: number }> {
  await locator.scrollIntoViewIfNeeded()
  const box = await locator.boundingBox()
  if (!box) throw new Error('element has no bounding box')
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 }
}

/** Drag with the mouse from one element to another (pointer events). */
export async function dragTo(page: Page, source: Locator, target: Locator) {
  const from = await center(source)
  const to = await center(target)
  await page.mouse.move(from.x, from.y)
  await page.mouse.down()
  await page.mouse.move(from.x + 5, from.y + 5, { steps: 3 })
  await page.mouse.move(to.x, to.y, { steps: 12 })
  await page.waitForTimeout(80)
  await page.mouse.up()
}

export async function openShelf(page: Page, category: string) {
  await page.getByTestId(`shelf-tab-${category}`).click()
}

/**
 * Hold a bottle over a vessel until the live counter shows at least `amount`
 * (in the ingredient's native unit), then release. Mirrors how a person pours.
 */
export async function pourUntil(page: Page, bottleId: string, targetDrop: 'glass' | 'shaker' | 'mixing' | 'blender' | 'jigger', amount: number) {
  const bottle = page.getByTestId(`bottle-${bottleId}`)
  const target = page.locator(`[data-drop="${targetDrop}"]`)
  const from = await center(bottle)
  const to = await center(target)
  await page.mouse.move(from.x, from.y)
  await page.mouse.down()
  await page.mouse.move(from.x + 5, from.y + 5, { steps: 2 })
  await page.mouse.move(to.x, to.y, { steps: 10 })
  const total = page.getByTestId('pour-total')
  await expect(total).toBeVisible()
  // The round trip to release the mouse takes a few frames, so let go a
  // little early (never more than 10% under) and let the last frames land.
  const releaseAt = amount - Math.min(2.5, amount * 0.1)
  const deadline = Date.now() + 20_000
  while (Date.now() < deadline) {
    const text = await total.textContent()
    const value = parseFloat(text ?? '0')
    if (value >= releaseAt) break
  }
  await page.mouse.up()
  await expect(page.getByTestId('pour-counter')).toBeHidden()
}

/** Hold a bottle over a vessel for a fixed time regardless of the counter. */
export async function pourFor(page: Page, bottleId: string, targetDrop: 'glass' | 'shaker' | 'mixing' | 'blender' | 'jigger', ms: number) {
  const from = await center(page.getByTestId(`bottle-${bottleId}`))
  const to = await center(page.locator(`[data-drop="${targetDrop}"]`))
  await page.mouse.move(from.x, from.y)
  await page.mouse.down()
  await page.mouse.move(from.x + 5, from.y + 5, { steps: 2 })
  await page.mouse.move(to.x, to.y, { steps: 10 })
  await expect(page.getByTestId('pour-counter')).toBeVisible()
  await page.waitForTimeout(ms)
  await page.mouse.up()
  await expect(page.getByTestId('pour-counter')).toBeHidden()
}

export async function pickGlass(page: Page, glass: string) {
  await page.getByTestId(`rack-${glass}`).click()
  await expect(page.getByTestId('counter-glass')).toHaveAttribute('data-glass', glass)
}

export async function addIce(page: Page, kind: 'cubes' | 'crushed', target: 'glass' | 'shaker' | 'mixing' | 'blender') {
  await dragTo(page, page.getByTestId(`ice-${kind}`), page.locator(`[data-drop="${target}"]`))
  await page.waitForTimeout(700)
}

export async function addGarnish(page: Page, id: string) {
  await openShelf(page, 'garnishes')
  await dragTo(page, page.getByTestId(`garnish-${id}`), page.locator('[data-drop="glass"]'))
  await page.waitForTimeout(600)
}

export function amountOf(page: Page, ingredientId: string) {
  return page.getByTestId('contents-glass').getByTestId(`content-${ingredientId}`)
}

export async function screenshot(page: Page, name: string) {
  await page.screenshot({ path: `${SCREENSHOT_DIR}/${name}.jpg`, type: 'jpeg', quality: 72 })
}
