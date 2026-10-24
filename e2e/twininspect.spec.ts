import { expect, test } from '@playwright/test'

test('TwinInspect room nav, finding lifecycle, report, and no raw templates', async ({ page }) => {
  test.setTimeout(120000)
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/samples/twininspect/')
  await page.getByRole('button', { name: /Start the demo/i }).first().click()
  const intro = page.getByRole('dialog', { name: /12 Wattle Lane/i })
  await expect(intro).toBeVisible({ timeout: 20000 })
  // Always take the 2D path so keyboard pinning is reliable.
  await intro.getByRole('button', { name: /Use 2D Floor Plan/i }).click()

  const rooms = page.getByRole('navigation', { name: 'Rooms' })
  await expect(rooms).toBeVisible({ timeout: 15000 })
  await rooms.getByRole('button', { name: 'Next room' }).click()
  await expect(rooms.getByRole('button', { name: /current room/i })).toBeVisible()

  // Pin tool → room centre pin buttons under the plan.
  await page.getByRole('button', { name: /Pin \(P\)/i }).click()
  const plan = page.locator('[data-screen-label="Floor plan"]')
  await expect(plan.getByText(/Keyboard: pin at a room/i)).toBeVisible({ timeout: 8000 })
  await plan.getByRole('button', { name: 'Living', exact: true }).click()

  const form = page.getByRole('dialog').filter({ has: page.getByLabel('Title') })
  await expect(form).toBeVisible({ timeout: 10000 })
  await form.getByLabel('Title').fill('Damp patch near skirting')
  await form.getByRole('radio', { name: /Medium/i }).click()
  await form.getByLabel('Evidence note').fill('Paint bloom on the lower west wall.')
  await form.getByLabel('Suggested follow-up').fill('Recheck after rain (illustrative only).')
  await form.getByRole('button', { name: /Save finding|Save changes/i }).click()
  await expect(form).toBeHidden()

  await page.getByRole('tab', { name: /Findings/i }).click()
  await page.getByRole('button', { name: /Edit Damp patch/i }).click()
  await expect(form).toBeVisible()
  await form.getByLabel('Title').fill('Damp patch near skirting (edited)')
  await form.getByRole('button', { name: /Save changes|Save finding/i }).click()
  await expect(form).toBeHidden()

  await page.getByRole('button', { name: /Finish.*Report/i }).click()
  const report = page.locator('[data-screen-label="Report"]')
  await expect(report.getByText('Fictional property, not a real inspection')).toBeVisible({ timeout: 10000 })
  await expect(report.getByText(/Damp patch near skirting \(edited\)/)).toBeVisible()
  await expect(report.getByText(/Severity:\s*Medium/)).toBeVisible()
  await expect(report.getByText(/Evidence note:/)).toBeVisible()
  await expect(report.locator('text={{')).toHaveCount(0)

  await report.getByRole('button', { name: 'Back to inspection' }).click()
  await page.getByRole('tab', { name: /Findings/i }).click()
  await page.getByRole('button', { name: /Delete Damp patch/i }).click()
  await expect(page.getByText(/No findings yet/i).first()).toBeVisible()

  await page.getByRole('button', { name: /Finish.*Report/i }).click()
  await expect(report.getByText('Fictional property, not a real inspection')).toBeVisible({ timeout: 10000 })
  await expect(report.getByText(/No findings yet/i)).toBeVisible()

  const bodyText = await page.locator('body').innerText()
  expect(bodyText.includes('{{')).toBe(false)
})
