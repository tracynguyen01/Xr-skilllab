import { expect, test, type Page } from '@playwright/test'

const WIDTHS = [360, 390, 768, 1024, 1280, 1440]

const ANSWERS: Array<[RegExp, RegExp]> = [
  [/blocked emergency exit/i, /flag the obstruction/i],
  [/liquid spill/i, /isolate and mark/i],
  [/unstable pallet/i, /restrict access/i],
  [/forklift/i, /designated separated crossing/i],
]

async function expectNoOverflow(page: Page, where: string) {
  await page.evaluate(() => document.fonts.ready)
  const box = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }))
  expect(
    box.scrollWidth,
    `${where}: document is ${box.scrollWidth}px wide inside a ${box.clientWidth}px viewport`,
  ).toBeLessThanOrEqual(box.clientWidth)
}

test.describe('horizontal overflow', () => {
  for (const width of WIDTHS) {
    test(`pages stay within the viewport at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })

      await page.goto('/Xr-skilllab/')
      await expectNoOverflow(page, `home ${width}`)

      const alignment = await page.evaluate(() => {
        const hero = document.querySelector('.hero')?.getBoundingClientRect()
        const strip = document.querySelector('.strip')?.getBoundingClientRect()
        const copy = document.querySelector('.hero-copy')?.getBoundingClientRect()
        const visual = document.querySelector('.hero-visual')?.getBoundingClientRect()
        if (!hero || !strip || !copy || !visual) return null
        return {
          heroLeft: hero.left,
          heroRight: hero.right,
          stripLeft: strip.left,
          stripRight: strip.right,
          gapBelowHeroContent: strip.top - Math.max(copy.bottom, visual.bottom),
        }
      })
      expect(alignment, 'homepage feature chips').not.toBeNull()
      if (!alignment) return
      expect(alignment.stripLeft).toBeGreaterThanOrEqual(alignment.heroLeft - 1)
      expect(alignment.stripRight).toBeLessThanOrEqual(alignment.heroRight + 1)
      expect(alignment.stripLeft).toBeGreaterThan(8)
      // The chip row follows the hero. It should not sit a viewport below the content.
      expect(alignment.gapBelowHeroContent).toBeLessThan(120)

      await page.goto('/Xr-skilllab/#/simulate')
      await expectNoOverflow(page, `simulate ${width}`)

      await page.getByRole('button', { name: 'Use 2D Inspector' }).click()
      await expectNoOverflow(page, `inspector ${width}`)

      const list = page.getByRole('list', { name: 'Inspection list' })
      for (const [hazard, choice] of ANSWERS) {
        await list.getByRole('button', { name: hazard }).click()
        const dialog = page.getByRole('dialog')
        await expectNoOverflow(page, `dialog ${width}`)
        await dialog.getByRole('radio', { name: choice }).click()
        await dialog.getByRole('button', { name: 'Submit answer' }).click()
        await dialog.getByRole('button', { name: 'Back to warehouse' }).click()
      }

      await page.getByRole('button', { name: 'Finish Assessment' }).click()
      await expect(page.getByRole('heading', { level: 1, name: 'Score: 100 / 100' })).toBeVisible()
      await expectNoOverflow(page, `results ${width}`)

      await page.goto('/Xr-skilllab/#/about')
      await expectNoOverflow(page, `about ${width}`)

      await page.goto('/Xr-skilllab/#/how-it-works')
      await expectNoOverflow(page, `how it works ${width}`)

      await page.goto('/Xr-skilllab/#/project')
      await expectNoOverflow(page, `project ${width}`)

      await page.goto('/Xr-skilllab/#/missing-page')
      await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible()
      await expectNoOverflow(page, `404 ${width}`)
    })
  }
})
