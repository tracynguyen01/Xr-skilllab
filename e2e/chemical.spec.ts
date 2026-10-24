import { expect, test } from '@playwright/test'

test('Chemical explainable results, missed list, and confirm reset', async ({ page }) => {
  test.setTimeout(120000)
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/samples/chemical-processing/')
  // Skip the first-load briefing so the 2D keyboard path stays focused.
  await page.evaluate(() => sessionStorage.setItem('xr-scene-briefing:chemical-processing', '1'))
  await page.getByRole('button', { name: 'Start the Simulation' }).click()
  await expect(page.getByRole('heading', { name: 'Batch Plant Challenge' })).toBeVisible({ timeout: 20000 })
  await page.getByRole('button', { name: /Use 2D Inspector|Begin in 2D/i }).click()

  const list = page.locator('[data-screen-label="2D Inspector"]')
  await expect(list.getByRole('heading', { name: '2D Inspector' })).toBeVisible({ timeout: 10000 })
  const objectList = list.getByRole('heading', { name: 'Objects to inspect' }).locator('..').getByRole('list')

  // Wait until the play HUD is live so focus2D's delayed autofocus cannot steal Enter.
  await expect(page.locator('.scene-status').getByText('0 of 4 reviewed')).toBeVisible({ timeout: 10000 })

  /** Open a hazard from the list, pick the preferred option, Submit — keyboard where it matters. */
  async function answerByKeyboard(label: string) {
    const dialog = page.locator('[role="dialog"][aria-labelledby="panelTitle"]')
    await expect(dialog).toBeHidden()

    // Close an Info card from a prior decoy inspect so it cannot sit over the list.
    const closeInfo = page.locator('.scene-status [data-action="close-inspect"]')
    if (await closeInfo.isVisible()) await closeInfo.click()

    const row = objectList.getByRole('listitem').filter({ hasText: label }).getByRole('button')
    // press() focuses the row then sends Enter — avoids a race with the canvas autofocus.
    await row.press('Enter')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('heading', { name: label })).toBeVisible()
    // Preferred response is option B (index 1) for every chemical hazard.
    await dialog.getByRole('radio').nth(1).click()
    const submit = dialog.getByRole('button', { name: 'Submit' })
    await expect(submit).toBeVisible()
    await submit.click()
    await expect(dialog.getByText(/Matches the scenario guidance/i)).toBeVisible()
    await expect(dialog.getByRole('radio').nth(0)).toBeDisabled()
    await dialog.getByRole('button', { name: 'Back to the scene' }).click()
    await expect(dialog).toBeHidden()
  }

  await answerByKeyboard('Drum bay (south)')
  await answerByKeyboard('Safety shower (north)')
  await answerByKeyboard('Valve manifold')
  await answerByKeyboard('Relief header')

  await page.getByRole('button', { name: 'Finish Assessment' }).click()
  const results = page.locator('[data-screen-label="Results"]')
  await expect(results.getByText('Scenario Coach — rules-based guided feedback')).toBeVisible({ timeout: 10000 })
  await expect(results.getByText(/Points: 15 \+ 10 = 25/)).toHaveCount(4)
  await expect(results.getByRole('button', { name: /Not found/i })).toHaveCount(0)
  await expect(results.getByText(/personalised|\bAI\b/i)).toHaveCount(0)

  await results.getByRole('button', { name: 'Try Again' }).click()
  const confirm = page.getByRole('dialog', { name: /Reset this attempt/i })
  await expect(confirm).toBeVisible()
  await expect(results.getByText('Scenario Coach — rules-based guided feedback')).toBeVisible()
  await confirm.getByRole('button', { name: 'Keep summary' }).click()
  await expect(confirm).toBeHidden()
  await expect(results.getByText(/Points: 15 \+ 10 = 25/).first()).toBeVisible()

  await results.getByRole('button', { name: 'Try Again' }).click()
  await expect(confirm).toBeVisible()
  await confirm.getByRole('button', { name: 'Reset attempt' }).click()
  await expect(confirm).toBeHidden()
  await expect(page.getByRole('button', { name: 'Finish Assessment' })).toBeVisible()
  await expect(page.locator('.scene-status').getByText('0 of 4 reviewed')).toBeVisible()

  await page.getByRole('button', { name: 'Finish Assessment' }).click()
  await expect(results.getByText('Scenario Coach — rules-based guided feedback')).toBeVisible({ timeout: 10000 })
  await expect(results.getByRole('button', { name: /Not found/i })).toHaveCount(4)
  await expect(results.getByText(/Next practice step:/i).first()).toBeVisible()
})
