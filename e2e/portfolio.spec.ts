import { expect, test, type Page } from '@playwright/test'

async function expectNoOverflow(page: Page, where: string) {
  const box = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }))
  expect(box.scrollWidth, `${where}: ${box.scrollWidth}px inside ${box.clientWidth}px`).toBeLessThanOrEqual(box.clientWidth + 1)
}

function watchConsole(page: Page) {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() !== 'error') return
    const text = message.text()
    if (text.includes('Failed to load resource') && text.includes('favicon')) return
    // The Fable floor-plan template is real SVG in the source. The browser
    // logs these while parsing {{ }} tokens, then the runtime draws the plan.
    if (text.includes('Expected length') && text.includes('{{')) return
    errors.push(text)
  })
  return errors
}

const demos = [
  { name: /Industry training XR SkillLab/i, heading: /learn by doing/i, where: 'skilllab' },
  { name: /Industry training Oil & Gas/i, heading: /learn by doing/i, where: 'oil-gas' },
  { name: /Industry training Mining/i, heading: /learn by doing/i, where: 'mining' },
  { name: /Industry training Chemical processing/i, heading: /learn by doing/i, where: 'chemical' },
  { name: /Inspection TwinInspect/i, heading: /inspect any home/i, where: 'twin' },
]

test('home lists every demo and each sample opens cleanly', async ({ page }) => {
  test.setTimeout(120000)
  const errors = watchConsole(page)
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1, name: /practised in the browser/i })).toBeVisible()
  await expect(page).toHaveTitle('XR Concept Lab')
  await expect(page.getByRole('banner').getByRole('link', { name: 'XR Concept Lab' })).toBeVisible()
  await expect(page.locator('footer')).toContainText('XR Concept Lab')
  await expect(page.getByRole('heading', { level: 2, name: /five ways to try the idea/i })).toBeVisible()
  for (const demo of demos) {
    await expect(page.getByRole('link', { name: demo.name })).toBeVisible()
  }
  await expect(page.getByRole('link', { name: 'Tracy Nguyen' })).toHaveAttribute('href', 'https://github.com/tracynguyen01')
  await expectNoOverflow(page, 'home 1280')

  await page.setViewportSize({ width: 390, height: 844 })
  for (const demo of demos) {
    await expect(page.getByRole('link', { name: demo.name })).toBeVisible()
  }
  await expectNoOverflow(page, 'home 390')

  for (const demo of demos) {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/')
    await page.getByRole('link', { name: demo.name }).click()
    await expect(page.getByRole('heading', { level: 1, name: demo.heading })).toBeVisible({ timeout: 20000 })
    await expect(page.getByRole('link', { name: 'Back to all demos' })).toBeVisible()
    await expectNoOverflow(page, `${demo.where} 1280`)
    await page.setViewportSize({ width: 390, height: 844 })
    await expectNoOverflow(page, `${demo.where} 390`)
    expect(errors, errors.join('\n')).toEqual([])
  }
})

test('old hash routes stay on the portfolio home', async ({ page }) => {
  await page.goto('/#/simulate')
  await expect(page.getByRole('heading', { level: 1, name: /practised in the browser/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /Industry training XR SkillLab/i })).toBeVisible()
})
