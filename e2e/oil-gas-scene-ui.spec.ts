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

test('Oil & Gas briefing heading stays in view at 390px', async ({ page }) => {
  test.setTimeout(90000)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/samples/oil-gas/')
  await page.getByRole('button', { name: 'Start the Simulation' }).click()
  await expect(page.getByRole('heading', { name: 'Gas Pad Challenge' })).toBeVisible({ timeout: 20000 })
  await page.getByRole('button', { name: /Begin in/i }).click()

  const briefing = page.locator('dialog.scene-briefing')
  await expect(briefing).toBeVisible({ timeout: 10000 })
  const heading = briefing.getByRole('heading', { name: 'Before you start' })
  await expect(heading).toBeVisible()

  const inView = await page.evaluate(() => {
    const dialog = document.querySelector('dialog.scene-briefing')
    const h2 = dialog?.querySelector('h2')
    if (!dialog || !h2) return false
    const dialogBox = dialog.getBoundingClientRect()
    const headingBox = h2.getBoundingClientRect()
    return (
      headingBox.top >= dialogBox.top &&
      headingBox.bottom <= dialogBox.bottom &&
      headingBox.left >= dialogBox.left &&
      headingBox.right <= dialogBox.right
    )
  })
  expect(inView).toBe(true)
})

test('Oil & Gas hazard and decoy show the same inspected status', async ({ page }) => {
  test.setTimeout(90000)
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/samples/oil-gas/')
  await page.evaluate(() => sessionStorage.setItem('xr-scene-briefing:oil-gas', '1'))
  await page.getByRole('button', { name: 'Start the Simulation' }).click()
  await expect(page.getByRole('heading', { name: 'Gas Pad Challenge' })).toBeVisible({ timeout: 20000 })
  await page.getByRole('button', { name: /Use 2D Inspector|Begin in 2D/i }).click()

  const list = page.locator('[data-screen-label="2D Inspector"]')
  await expect(list.getByRole('heading', { name: '2D Inspector' })).toBeVisible({ timeout: 10000 })

  // Hazard candidate (Separator / flange) and decoy (Flare stack) must match after inspect.
  const objectList = list.getByRole('heading', { name: 'Objects to inspect' }).locator('..').getByRole('list')
  const sepRow = objectList.getByRole('listitem').filter({ hasText: 'Separator' }).getByRole('button')
  const flareRow = objectList.getByRole('listitem').filter({ hasText: 'Flare stack' }).getByRole('button')
  await sepRow.click()
  await expect(page.locator('[role="dialog"][aria-labelledby="panelTitle"]')).toBeVisible()
  await page.locator('[role="dialog"][aria-labelledby="panelTitle"]').getByRole('button', { name: 'Close' }).click()
  await expect(sepRow).toHaveAttribute('aria-label', /inspected/i)

  await flareRow.click()
  await expect(page.locator('.scene-status').getByRole('button', { name: 'Close' })).toBeVisible()
  await page.locator('.scene-status').getByRole('button', { name: 'Close' }).click()
  await expect(flareRow).toHaveAttribute('aria-label', /inspected/i)

  const sepStatus = sepRow.locator('span').last()
  const flareStatus = flareRow.locator('span').last()
  await expect(sepStatus).toHaveText('Inspected')
  await expect(flareStatus).toHaveText('Inspected')
  expect(await sepStatus.innerText()).toBe(await flareStatus.innerText())
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
