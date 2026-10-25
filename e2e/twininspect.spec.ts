import { expect, test } from '@playwright/test'

async function startTwinInspect2d(page: import('@playwright/test').Page) {
  await page.goto('/samples/twininspect/')
  await page.getByRole('button', { name: /Start the demo/i }).first().click()
  const intro = page.getByRole('dialog', { name: /12 Wattle Lane/i })
  await expect(intro).toBeVisible({ timeout: 20000 })
  // Always take the 2D path so keyboard pinning is reliable.
  await intro.getByRole('button', { name: /Use 2D Floor Plan/i }).click()
}

async function pinLivingFinding(page: import('@playwright/test').Page, title: string) {
  await page.getByRole('button', { name: /Pin \(P\)/i }).click()
  const plan = page.locator('[data-screen-label="Floor plan"]')
  await expect(plan.getByText(/Keyboard: pin at a room/i)).toBeVisible({ timeout: 8000 })
  await plan.getByRole('button', { name: 'Living', exact: true }).click()

  const form = page.getByRole('dialog').filter({ has: page.getByLabel('Title') })
  await expect(form).toBeVisible({ timeout: 10000 })
  await form.getByLabel('Title').fill(title)
  await form.getByRole('radio', { name: /Medium/i }).click()
  await form.getByLabel('Evidence note').fill('Paint bloom on the lower west wall.')
  await form.getByLabel('Suggested follow-up').fill('Recheck after rain (illustrative only).')
  await form.getByRole('button', { name: /Save finding|Save changes/i }).click()
  await expect(form).toBeHidden()
  return form
}

test('TwinInspect room nav, finding lifecycle, report, and no raw templates', async ({ page }) => {
  test.setTimeout(120000)
  await page.setViewportSize({ width: 1280, height: 900 })
  // Catch empty data:image CSS urls that used to log net::ERR_INVALID_URL on the report.
  const consoleErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  page.on('pageerror', (error) => {
    consoleErrors.push(error.message)
  })
  await startTwinInspect2d(page)

  const rooms = page.getByRole('navigation', { name: 'Rooms' })
  await expect(rooms).toBeVisible({ timeout: 15000 })

  // 2D room switch opens the 360° pane — must not log ERR_INVALID_URL from CSS data URLs.
  consoleErrors.length = 0
  await rooms.getByRole('button', { name: 'Next room' }).click()
  await expect(rooms.getByRole('button', { name: /current room/i })).toBeVisible()
  const plan = page.locator('[data-screen-label="Floor plan"]')
  await expect(plan.getByRole('button', { name: /Close 360 view/i })).toBeVisible({ timeout: 10000 })
  await page.waitForTimeout(500)
  expect(consoleErrors, `room-switch console errors: ${consoleErrors.join(' | ')}`).toEqual([])

  const form = await pinLivingFinding(page, 'Damp patch near skirting')

  await page.getByRole('tab', { name: /Findings/i }).click()
  await page.getByRole('button', { name: /Edit Damp patch/i }).click()
  await expect(form).toBeVisible()
  await form.getByLabel('Title').fill('Damp patch near skirting (edited)')
  await form.getByRole('button', { name: /Save changes|Save finding/i }).click()
  await expect(form).toBeHidden()

  consoleErrors.length = 0
  await page.getByRole('button', { name: /Finish.*Report/i }).click()
  const report = page.locator('[data-screen-label="Report"]')
  await expect(report.getByText('Fictional property, not a real inspection')).toBeVisible({ timeout: 10000 })
  await expect(report.getByText(/Damp patch near skirting \(edited\)/)).toBeVisible()
  await expect(report.getByText(/Severity:\s*Medium/)).toBeVisible()
  await expect(report.getByText(/Evidence note:/)).toBeVisible()
  await expect(report.locator('text={{')).toHaveCount(0)
  expect(consoleErrors, `report console errors: ${consoleErrors.join(' | ')}`).toEqual([])

  consoleErrors.length = 0
  await report.getByRole('button', { name: 'Back to inspection' }).click()
  await expect(page.getByRole('navigation', { name: 'Rooms' })).toBeVisible({ timeout: 10000 })
  await page.waitForTimeout(500)
  expect(consoleErrors, `back-to-inspection console errors: ${consoleErrors.join(' | ')}`).toEqual([])

  await page.getByRole('tab', { name: /Findings/i }).click()
  await page.getByRole('button', { name: /Delete Damp patch/i }).click()
  await expect(page.getByText(/No findings yet/i).first()).toBeVisible()

  await page.getByRole('button', { name: /Finish.*Report/i }).click()
  await expect(report.getByText('Fictional property, not a real inspection')).toBeVisible({ timeout: 10000 })
  await expect(report.getByText(/No findings yet/i)).toBeVisible()

  const bodyText = await page.locator('body').innerText()
  expect(bodyText.includes('{{')).toBe(false)
})

test('TwinInspect 390px: pointer Finish and finding add/edit/delete', async ({ page }) => {
  test.setTimeout(120000)
  await page.setViewportSize({ width: 390, height: 844 })
  await startTwinInspect2d(page)

  const rooms = page.getByRole('navigation', { name: 'Rooms' })
  await expect(rooms.getByRole('button', { name: /Room:/i })).toBeVisible({ timeout: 15000 })
  // Compact bar must not block Finish — click by pointer (not keyboard / not Enter).
  const finish = page.getByRole('button', { name: /Finish.*Report/i })
  await expect(finish).toBeVisible()
  await finish.click({ force: false, trial: false, timeout: 15000 })
  const report = page.locator('[data-screen-label="Report"]')
  await expect(report.getByText('Fictional property, not a real inspection')).toBeVisible({ timeout: 10000 })
  await expect(report.getByText(/No findings yet/i)).toBeVisible()
  await report.getByRole('button', { name: 'Back to inspection' }).click()

  const form = await pinLivingFinding(page, 'Narrow damp note')
  // saveForm already opens the panel — only tap Report if it is still closed.
  const panel = page.getByRole('complementary', { name: 'Report panel' })
  if (!(await panel.isVisible())) {
    await page.getByRole('button', { name: /Report \(/i }).click()
  }
  await expect(panel).toBeVisible()
  await page.getByRole('tab', { name: /Findings/i }).click()
  await page.getByRole('button', { name: /Edit Narrow damp/i }).click()
  await expect(form).toBeVisible({ timeout: 10000 })
  await form.getByLabel('Title').fill('Narrow damp note (edited)')
  await form.getByRole('button', { name: /Save changes|Save finding/i }).click()
  await expect(form).toBeHidden()

  // Edit already opened the findings panel — do not toggle Report closed.
  await page.getByRole('tab', { name: /Findings/i }).click()
  await expect(page.getByText(/Narrow damp note \(edited\)/)).toBeVisible()
  await page.getByRole('button', { name: /Delete Narrow damp/i }).click()
  await expect(page.getByText(/No findings yet/i).first()).toBeVisible()

  const bodyText = await page.locator('body').innerText()
  expect(bodyText.includes('{{')).toBe(false)
})
