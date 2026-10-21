import { expect, test } from '@playwright/test'

test('Oil & Gas briefing dialog and status panel mount in play', async ({ page }) => {
  test.setTimeout(90000)
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/samples/oil-gas/')
  await page.getByRole('button', { name: 'Start the Simulation' }).click()
  await expect(page.getByRole('heading', { name: 'Gas Pad Challenge' })).toBeVisible({ timeout: 20000 })
  await page.getByRole('button', { name: /Begin in/i }).click()

  const briefing = page.locator('dialog.scene-briefing')
  await expect(briefing).toBeVisible({ timeout: 10000 })
  await expect(briefing.getByRole('heading', { name: 'Before you start' })).toBeVisible()
  await expect(briefing.getByText(/fictional onshore gas pad/i)).toBeVisible()
  await briefing.getByRole('button', { name: 'Start' }).click()
  await expect(briefing).toBeHidden()

  const status = page.locator('.scene-status')
  await expect(status).toBeVisible()
  await expect(status.getByText('0 of 4 reviewed')).toBeVisible()

  // Esc on a reopened briefing closes it and leaves the sim open.
  await status.getByRole('button', { name: 'Open briefing' }).click()
  await expect(briefing).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(briefing).toBeHidden()
  await expect(page.getByRole('button', { name: 'Finish Assessment' })).toBeVisible()
})

test('Oil & Gas status panel collapses as a drawer at 390px', async ({ page }) => {
  test.setTimeout(90000)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/samples/oil-gas/')
  await page.evaluate(() => sessionStorage.setItem('xr-scene-briefing:oil-gas', '1'))
  await page.getByRole('button', { name: 'Start the Simulation' }).click()
  await expect(page.getByRole('heading', { name: 'Gas Pad Challenge' })).toBeVisible({ timeout: 20000 })
  await page.getByRole('button', { name: /Begin in/i }).click()

  const status = page.locator('.scene-status')
  await expect(status).toBeVisible({ timeout: 10000 })
  await expect(status).toHaveAttribute('data-collapsed', 'true')

  const finish = page.getByRole('button', { name: 'Finish Assessment' })
  await expect(finish).toBeVisible()
  const finishBox = await finish.boundingBox()
  const statusBox = await status.boundingBox()
  if (!finishBox || !statusBox) throw new Error('missing boxes')
  // Drawer sits below the top task controls, not over them.
  expect(statusBox.y).toBeGreaterThan(finishBox.y + finishBox.height)

  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }))
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth)
})
