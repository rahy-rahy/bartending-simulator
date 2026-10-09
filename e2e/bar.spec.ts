import { test, expect } from '@playwright/test'
import { addGarnish, addIce, amountOf, dragTo, openShelf, pickGlass, pourFor, pourUntil, screenshot, trackErrors } from './helpers'

test.describe('free bar', () => {
  test('make a Vodka 7Up: glass, ice, pour with live counter, garnish, serve', async ({ page }) => {
    const errors = trackErrors(page)
    await page.goto('/bar')
    await pickGlass(page, 'highball')
    await addIce(page, 'cubes', 'glass')
    await expect(page.getByTestId('contents-glass')).toContainText('Ice cubes')

    await openShelf(page, 'vodka')
    await pourUntil(page, 'vodka', 'glass', 50)
    await expect(amountOf(page, 'vodka')).toBeVisible()
    // Passing over the shaker on the way to the glass must not spill into it.
    await expect(page.getByTestId('contents-shaker')).toHaveCount(0)
    const vodkaText = (await amountOf(page, 'vodka').textContent()) ?? ''
    const vodkaMl = parseFloat(vodkaText.match(/(\d+(?:\.\d+)?) ml/)?.[1] ?? '0')
    expect(vodkaMl).toBeGreaterThanOrEqual(45)
    expect(vodkaMl).toBeLessThanOrEqual(57)
    expect(vodkaText).toContain('oz')

    await openShelf(page, 'sodas')
    await pourUntil(page, 'lemon-lime-soda', 'glass', 120)
    const sodaText = (await amountOf(page, 'lemon-lime-soda').textContent()) ?? ''
    const sodaMl = parseFloat(sodaText.match(/(\d+(?:\.\d+)?) ml/)?.[1] ?? '0')
    expect(sodaMl).toBeGreaterThanOrEqual(105)
    expect(sodaMl).toBeLessThanOrEqual(135)

    await addGarnish(page, 'lime-wedge')
    await expect(page.getByTestId('glass-garnish')).toContainText('Lime Wedge')
    await screenshot(page, '08-free-bar-vodka-7up')

    await page.getByTestId('btn-serve').click()
    await expect(page.getByTestId('serve-modal')).toBeVisible()
    await expect(page.getByTestId('serve-title')).toContainText('Vodka 7Up')
    await expect(page.getByTestId('score-breakdown')).toBeVisible()
    await screenshot(page, '09-free-bar-served')
    await page.getByTestId('btn-retry').click()
    await expect(page.getByTestId('serve-modal')).toBeHidden()
    await expect(page.getByTestId('empty-counter')).toBeVisible()
    expect(errors).toEqual([])
  })

  test('dump a drink in the garbage bin and the glass resets', async ({ page }) => {
    const errors = trackErrors(page)
    await page.goto('/bar')
    await pickGlass(page, 'rocks')
    await openShelf(page, 'whiskey')
    await pourUntil(page, 'bourbon', 'glass', 30)
    await expect(amountOf(page, 'bourbon')).toBeVisible()
    await dragTo(page, page.getByTestId('counter-glass'), page.locator('[data-drop="bin"]'))
    await expect(page.getByTestId('empty-counter')).toBeVisible({ timeout: 5000 })
    await expect(page.getByTestId('contents-glass')).toContainText('No glass on the counter')
    await screenshot(page, '10-after-dump')
    expect(errors).toEqual([])
  })

  test('salt rim only sticks on a wet rim', async ({ page }) => {
    const errors = trackErrors(page)
    await page.goto('/bar')
    await pickGlass(page, 'margarita')
    // Salt first: nothing sticks.
    await dragTo(page, page.getByTestId('counter-glass'), page.locator('[data-drop="salt-dish"]'))
    await expect(page.getByTestId('toast')).toContainText('does not stick')
    await expect(page.getByTestId('glass-rim')).toHaveCount(0)
    // Wet, then salt.
    await dragTo(page, page.getByTestId('counter-glass'), page.locator('[data-drop="lime-dish"]'))
    await expect(page.getByTestId('glass-rim')).toContainText('wet', { timeout: 5000 })
    await dragTo(page, page.getByTestId('counter-glass'), page.locator('[data-drop="salt-dish"]'))
    await expect(page.getByTestId('glass-rim')).toContainText('salt', { timeout: 5000 })
    await screenshot(page, '11-salt-rim')
    expect(errors).toEqual([])
  })

  test('shaker workflow: shake, strain and pouring too much is allowed', async ({ page }) => {
    const errors = trackErrors(page)
    await page.goto('/bar')
    await pickGlass(page, 'coupe')
    await addIce(page, 'cubes', 'shaker')
    await openShelf(page, 'rum')
    await pourUntil(page, 'white-rum', 'shaker', 60)
    await openShelf(page, 'juices')
    await pourUntil(page, 'lime-juice', 'shaker', 20)
    await openShelf(page, 'syrups')
    await pourUntil(page, 'simple-syrup', 'shaker', 10)
    await expect(page.getByTestId('contents-shaker')).toContainText('White Rum')
    await page.getByTestId('btn-shake').click()
    await expect(page.getByTestId('contents-shaker')).toContainText('Shaken with ice', { timeout: 5000 })
    await page.getByTestId('btn-strain-shaker').click()
    await expect(amountOf(page, 'white-rum')).toBeVisible({ timeout: 5000 })
    await expect(page.getByTestId('contents-glass')).toContainText('Strained from: shaker')
    await page.getByTestId('btn-serve').click()
    await expect(page.getByTestId('serve-title')).toContainText('Daiquiri')
    expect(errors).toEqual([])
  })

  test('jigger measures a pour and the overflow is capped', async ({ page }) => {
    const errors = trackErrors(page)
    await page.goto('/bar')
    await pickGlass(page, 'rocks')
    await page.getByTestId('jigger-size').selectOption('45')
    await openShelf(page, 'whiskey')
    // Hold for three seconds (about 70 ml worth): the jigger cannot hold more than 45.
    await pourFor(page, 'rye', 'jigger', 3000)
    await expect(page.getByTestId('contents-jigger')).toContainText('Rye Whiskey 45 ml')
    await expect(page.getByTestId('toast')).toContainText('jigger is full')
    await dragTo(page, page.locator('[data-drop="jigger"]'), page.locator('[data-drop="glass"]'))
    await expect(amountOf(page, 'rye')).toContainText('45 ml', { timeout: 5000 })
    expect(errors).toEqual([])
  })
})
