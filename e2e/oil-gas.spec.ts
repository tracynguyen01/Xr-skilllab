import { expect, test } from '@playwright/test'

test('Oil & Gas explainable results, missed list, and confirm reset', async ({ page }) => {
  test.setTimeout(120000)
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/samples/oil-gas/')
  // Skip the first-load briefing so the 2D keyboard path stays focused.
  await page.evaluate(() => sessionStorage.setItem('xr-scene-briefing:oil-gas', '1'))
  await page.getByRole('button', { name: 'Start the Simulation' }).click()
  await expect(page.getByRole('heading', { name: 'Gas Pad Challenge' })).toBeVisible({ timeout: 20000 })
  await page.getByRole('button', { name: /Use 2D Inspector|Begin in 2D/i }).click()

  const list = page.locator('[data-screen-label="2D Inspector"]')
  await expect(list.getByRole('heading', { name: '2D Inspector' })).toBeVisible({ timeout: 10000 })
  const objectList = list.getByRole('heading', { name: 'Objects to inspect' }).locator('..').getByRole('list')

  /** Open a hazard from the list, pick the preferred option, Submit — keyboard where it matters. */
  async function answerByKeyboard(label: string) {
    const dialog = page.locator('[role="dialog"][aria-labelledby="panelTitle"]')
    await expect(dialog).toBeHidden()

    const row = objectList.getByRole('listitem').filter({ hasText: label }).getByRole('button')
    await row.focus()
    await page.keyboard.press('Enter')
    await expect(dialog).toBeVisible()
    // Confirm we opened this hazard (not a stale panel from the previous row).
    await expect(dialog.getByRole('heading', { name: label })).toBeVisible()
    // Preferred response is option B (index 1) for every oil-gas hazard.
    await dialog.getByRole('radio').nth(1).click()
    const submit = dialog.getByRole('button', { name: 'Submit' })
    await expect(submit).toBeVisible()
    await submit.click()
    await expect(dialog.getByText(/Matches the scenario guidance/i)).toBeVisible()
    await expect(dialog.getByRole('radio').nth(0)).toBeDisabled()
    await dialog.getByRole('button', { name: 'Back to the scene' }).click()
    await expect(dialog).toBeHidden()
  }

  await answerByKeyboard('Separator')
  await answerByKeyboard('Pipe rack')
  await answerByKeyboard('Transfer pump')
  await answerByKeyboard('Muster gate')

  await page.getByRole('button', { name: 'Finish Assessment' }).click()
  const results = page.locator('[data-screen-label="Results"]')
  await expect(results.getByText('Scenario Coach — rules-based guided feedback')).toBeVisible({ timeout: 10000 })
  await expect(results.getByText(/Points: 15 \+ 10 = 25/)).toHaveCount(4)
  await expect(results.getByRole('button', { name: /Not found/i })).toHaveCount(0)
  await expect(results.getByText(/personalised|\bAI\b/i)).toHaveCount(0)

  // Retry asks for confirmation; the summary stays until the user confirms.
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

  // Missed list: finish with nothing assessed → every hazard card says Not found.
  await page.getByRole('button', { name: 'Finish Assessment' }).click()
  await expect(results.getByText('Scenario Coach — rules-based guided feedback')).toBeVisible({ timeout: 10000 })
  await expect(results.getByRole('button', { name: /Not found/i })).toHaveCount(4)
  await expect(results.getByText(/Next practice step:/i).first()).toBeVisible()
})
