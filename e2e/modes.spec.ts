import { test, expect } from '@playwright/test'
import { addGarnish, addIce, dragTo, openShelf, pickGlass, pourUntil, screenshot, trackErrors } from './helpers'

test.describe('guided and challenge modes', () => {
  test('complete a guided Margarita step by step, including the salt rim', async ({ page }) => {
    const errors = trackErrors(page)
    await page.goto('/bar/guided/margarita')
    await expect(page.getByTestId('guided-title')).toHaveText('Margarita')
    await expect(page.getByTestId('step-glass')).toHaveAttribute('data-current', 'true')
    await expect(page.getByTestId('rack-margarita')).toHaveClass(/guided-target/)

    await pickGlass(page, 'margarita')
    await expect(page.getByTestId('step-glass')).toHaveAttribute('data-status', 'done')
    await expect(page.getByTestId('step-rim-wet')).toHaveAttribute('data-current', 'true')

    await dragTo(page, page.getByTestId('counter-glass'), page.locator('[data-drop="lime-dish"]'))
    await expect(page.getByTestId('step-rim-wet')).toHaveAttribute('data-status', 'done', { timeout: 5000 })
    await dragTo(page, page.getByTestId('counter-glass'), page.locator('[data-drop="salt-dish"]'))
    await expect(page.getByTestId('step-rim-dip')).toHaveAttribute('data-status', 'done', { timeout: 5000 })

    await expect(page.getByTestId('step-ice-shaker')).toHaveAttribute('data-current', 'true')
    await addIce(page, 'cubes', 'shaker')
    await expect(page.getByTestId('step-ice-shaker')).toHaveAttribute('data-status', 'done')

    // Guided mode opens the right shelf and highlights the bottle.
    await expect(page.getByTestId('bottle-tequila')).toHaveClass(/guided-target/)
    await pourUntil(page, 'tequila', 'shaker', 50)
    await expect(page.getByTestId('step-pour-0-tequila')).toHaveAttribute('data-status', 'done')
    await expect(page.getByTestId('bottle-triple-sec')).toHaveClass(/guided-target/)
    await pourUntil(page, 'triple-sec', 'shaker', 20)
    await expect(page.getByTestId('step-pour-1-triple-sec')).toHaveAttribute('data-status', 'done')
    await expect(page.getByTestId('bottle-lime-juice')).toHaveClass(/guided-target/)
    await pourUntil(page, 'lime-juice', 'shaker', 15)
    await expect(page.getByTestId('step-pour-2-lime-juice')).toHaveAttribute('data-status', 'done')

    await expect(page.getByTestId('btn-shake')).toHaveClass(/guided-target/)
    await page.getByTestId('btn-shake').click()
    await expect(page.getByTestId('step-shake')).toHaveAttribute('data-status', 'done', { timeout: 5000 })
    await page.getByTestId('btn-strain-shaker').click()
    await expect(page.getByTestId('step-strain')).toHaveAttribute('data-status', 'done', { timeout: 5000 })

    await addGarnish(page, 'lime-wedge')
    await expect(page.getByTestId('step-garnish-lime-wedge')).toHaveAttribute('data-status', 'done')
    await expect(page.getByTestId('guided-progress')).toContainText('10 / 11')
    await screenshot(page, '12-guided-margarita-built')

    await page.getByTestId('btn-serve').click()
    await expect(page.getByTestId('serve-modal')).toBeVisible()
    await expect(page.getByTestId('serve-title')).toContainText('Margarita')
    const scoreText = await page.getByTestId('serve-modal').locator('svg[aria-label^="Score"]').getAttribute('aria-label')
    const score = parseInt(scoreText?.match(/Score (\d+)/)?.[1] ?? '0', 10)
    expect(score).toBeGreaterThanOrEqual(90)
    await expect(page.getByTestId('comparison')).toBeVisible()
    await expect(page.getByTestId('score-rim')).toContainText('5 / 5')
    await screenshot(page, '13-guided-result')
    expect(errors).toEqual([])
  })

  test('challenge: build a Negroni from memory and get scored, progress is saved', async ({ page }) => {
    const errors = trackErrors(page)
    await page.goto('/bar/challenge/negroni?difficulty=easy')
    await expect(page.getByTestId('challenge-title')).toHaveText('Negroni')
    // Only the name and image are shown: no ingredient list in the panel.
    await expect(page.getByTestId('challenge-panel')).not.toContainText('Campari')
    await expect(page.getByTestId('recipe-image-negroni')).toBeVisible()
    await screenshot(page, '14-challenge-bar')

    await pickGlass(page, 'rocks')
    await addIce(page, 'cubes', 'glass')
    await openShelf(page, 'gin')
    await pourUntil(page, 'gin', 'glass', 30)
    await openShelf(page, 'vermouth-bitters')
    await pourUntil(page, 'campari', 'glass', 30)
    await pourUntil(page, 'sweet-vermouth', 'glass', 30)
    await addGarnish(page, 'orange-slice')
    await page.getByTestId('btn-serve').click()
    await expect(page.getByTestId('serve-modal')).toBeVisible()
    await expect(page.getByTestId('serve-title')).toContainText('Negroni')
    for (const key of ['ingredients', 'amounts', 'glass', 'method', 'ice', 'rim', 'garnish']) {
      await expect(page.getByTestId(`score-${key}`)).toBeVisible()
    }
    const scoreText = await page.getByTestId('serve-modal').locator('svg[aria-label^="Score"]').getAttribute('aria-label')
    const score = parseInt(scoreText?.match(/Score (\d+)/)?.[1] ?? '0', 10)
    expect(score).toBeGreaterThanOrEqual(90)
    await expect(page.getByTestId('recipe-spec')).toContainText('Campari')
    await screenshot(page, '15-challenge-result')

    // Next challenge picks another easy recipe.
    await page.getByTestId('btn-next').click()
    await expect(page).toHaveURL(/\/bar\/challenge\/.+difficulty=easy/)
    await expect(page.getByTestId('challenge-title')).not.toHaveText('Negroni')

    await page.goto('/progress')
    await expect(page.getByTestId('stat-mastered')).toContainText('1 /')
    await expect(page.getByTestId('stat-challenges')).toContainText('1')
    await expect(page.getByTestId('progress-easy')).toContainText('1 /')
    await expect(page.getByTestId('history-list')).toContainText('Negroni')
    await screenshot(page, '16-progress')

    // The saved progress survives a reload (localStorage).
    await page.reload()
    await expect(page.getByTestId('stat-mastered')).toContainText('1 /')
    expect(errors).toEqual([])
  })

  test('challenge explains what went wrong', async ({ page }) => {
    await page.goto('/bar/challenge/margarita?difficulty=medium')
    await pickGlass(page, 'highball')
    await openShelf(page, 'vodka')
    await pourUntil(page, 'vodka', 'glass', 40)
    await page.getByTestId('btn-serve').click()
    await expect(page.getByTestId('serve-modal')).toBeVisible()
    await expect(page.getByTestId('score-ingredients')).toContainText('Missing')
    await expect(page.getByTestId('score-ingredients')).toContainText('Not in the recipe: Vodka')
    await expect(page.getByTestId('score-glass')).toContainText('Margarita')
    await expect(page.getByTestId('score-method')).toContainText('shaken')
    await expect(page.getByTestId('score-rim')).toContainText('Missing the salt rim')
    await expect(page.getByTestId('score-garnish')).toContainText('Lime Wedge')
    await screenshot(page, '17-challenge-wrong')
  })
})
