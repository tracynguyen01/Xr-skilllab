import { expect, test } from '@playwright/test'

const ANSWERS: Array<[RegExp, RegExp]> = [
  [/blocked emergency exit/i, /flag the obstruction/i],
  [/liquid spill/i, /isolate and mark/i],
  [/unstable pallet/i, /restrict access/i],
  [/forklift/i, /designated separated crossing/i],
]

test('3D scene loads and an attempt can be finished from the list', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/Xr-skilllab/#/simulate')
  await page.getByRole('button', { name: 'Begin in 3D' }).click()
  const loading = page.getByText('Loading the 3D warehouse…').first()
  const canvas = page.locator('.scene-3d-host canvas')
  await expect(loading.or(canvas)).toBeVisible()
  await expect(canvas).toBeVisible({ timeout: 20000 })
  await expect(page.getByText('0 / 4 hazards assessed')).toBeVisible()

  const list = page.getByRole('list', { name: 'Inspection list' })
  for (const [hazard, choice] of ANSWERS) {
    await list.getByRole('button', { name: hazard }).click()
    const dialog = page.getByRole('dialog')
    await dialog.getByRole('radio', { name: choice }).click()
    await dialog.getByRole('button', { name: 'Submit answer' }).click()
    await dialog.getByRole('button', { name: 'Back to warehouse' }).click()
  }

  await expect(page.getByText('4 / 4 hazards assessed')).toBeVisible()
  await page.getByRole('button', { name: 'Finish Assessment' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Score: 100 / 100' })).toBeVisible()

  const box = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }))
  expect(box.scrollWidth).toBeLessThanOrEqual(box.clientWidth)
})

test('missing WebGL falls back to the 2D exercise', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (type: string, ...args: unknown[]) {
      if (String(type).includes('webgl')) return null
      return original.call(this, type as never, ...(args as never[]))
    }
  })
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/Xr-skilllab/#/simulate')
  await expect(page.getByText("3D isn't available on this device. You can complete the full exercise in 2D.")).toBeVisible()
  await expect(page.getByRole('button', { name: 'Begin in 3D' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Try 3D' })).toHaveCount(0)
  await page.getByRole('button', { name: 'Use 2D Inspector' }).click()
  await expect(page.getByRole('list', { name: 'Inspection list' })).toBeVisible()
  await expect(page.locator('a-scene')).toHaveCount(0)
})

test('a narrow screen offers 2D first and an optional 3D try', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/Xr-skilllab/#/simulate')
  await expect(page.getByRole('button', { name: 'Use 2D Inspector' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Try 3D' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Begin in 3D' })).toHaveCount(0)
})
