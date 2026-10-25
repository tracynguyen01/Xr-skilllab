import { expect, test, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'

type Sample = { slug: string; title: string; href: string }

const samples = JSON.parse(readFileSync(new URL('../site/samples.json', import.meta.url), 'utf8')) as Sample[]
const widths = [320, 390, 768, 1024, 1440] as const

async function expectNoOverflow(page: Page, label: string) {
  const box = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }))
  expect(box.scrollWidth, `${label}: ${box.scrollWidth}px inside ${box.clientWidth}px`).toBeLessThanOrEqual(box.clientWidth)
}

/** True when the focused control shows an outline or ring (focus-visible styles). */
async function hasVisibleFocusRing(page: Page) {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null
    if (!el || el === document.body) return false
    const cs = getComputedStyle(el)
    const outline = Number.parseFloat(cs.outlineWidth || '0') > 0 && cs.outlineStyle !== 'none'
    const ring = (cs.boxShadow || '').includes('rgb') || (cs.boxShadow || '').includes('#')
    return outline || ring
  })
}

test.describe('a11y and responsive — all samples', () => {
  for (const sample of samples) {
    const route = `/${sample.href}`

    test(`${sample.title}: Tab shows a focus ring on essential controls`, async ({ page }) => {
      test.setTimeout(60000)
      await page.setViewportSize({ width: 1280, height: 900 })
      await page.goto(route)
      await expect(page.getByRole('button', { name: 'Menu' })).toBeVisible({ timeout: 20000 })

      // Skip → primary CTA path: keep Tabbing until we land on a named control.
      let found = false
      for (let i = 0; i < 12; i++) {
        await page.keyboard.press('Tab')
        const name = await page.evaluate(() => {
          const el = document.activeElement as HTMLElement | null
          if (!el) return ''
          return (el.getAttribute('aria-label') || el.textContent || el.tagName || '').trim().slice(0, 80)
        })
        if (!name || name === 'BODY') continue
        if (await hasVisibleFocusRing(page)) {
          found = true
          break
        }
      }
      expect(found, `${sample.title}: no focused control showed a visible focus ring`).toBe(true)
    })

    test(`${sample.title}: icon-only buttons have accessible names`, async ({ page }) => {
      test.setTimeout(60000)
      await page.setViewportSize({ width: 1280, height: 900 })
      await page.goto(route)
      await expect(page.getByRole('button', { name: 'Menu' })).toBeVisible({ timeout: 20000 })

      // Open the demo so toolbars / drawers mount their icon buttons.
      const start = page.getByRole('button', { name: /Start the (demo|Simulation)/i }).first()
      if (await start.isVisible()) await start.click()

      const unnamed = await page.evaluate(() => {
        const bad: string[] = []
        for (const btn of document.querySelectorAll('button')) {
          const label = (btn.getAttribute('aria-label') || '').trim()
          const text = (btn.textContent || '').replace(/\s+/g, ' ').trim()
          const title = (btn.getAttribute('title') || '').trim()
          // Icon-only: no visible text (or only a single glyph/symbol).
          const looksIconOnly = text.length <= 2
          if (!looksIconOnly) continue
          if (label || title) continue
          bad.push(btn.outerHTML.slice(0, 120))
        }
        return bad
      })
      expect(unnamed, unnamed.join('\n')).toEqual([])
    })

    test(`${sample.title}: no horizontal overflow at key widths`, async ({ page }) => {
      test.setTimeout(90000)
      await page.setViewportSize({ width: widths[0], height: 900 })
      await page.goto(route)
      await expect(page.getByRole('button', { name: 'Menu' })).toBeVisible({ timeout: 20000 })
      for (const width of widths) {
        await page.setViewportSize({ width, height: 900 })
        await expectNoOverflow(page, `${sample.title} ${width}`)
      }
    })
  }
})

test.describe('reduced motion', () => {
  test('portfolio carousel does not auto-advance', async ({ page }) => {
    test.setTimeout(60000)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/')
    const carousel = page.getByRole('region', { name: /try a lesson/i })
    await expect(carousel.locator('.slide.is-active').getByRole('heading', { level: 3, name: 'Warehouse Safety' })).toBeVisible()
    await page.mouse.click(10, 10)
    await page.waitForTimeout(6500)
    await expect(carousel.locator('.slide.is-active').getByRole('heading', { level: 3, name: 'Warehouse Safety' })).toBeVisible()
  })

  test('Oil & Gas Start keeps a focus ring under reduced motion', async ({ page }) => {
    test.setTimeout(60000)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/samples/oil-gas/')
    await expect(page.getByRole('button', { name: 'Menu' })).toBeVisible({ timeout: 20000 })
    const reduced = await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
    expect(reduced).toBe(true)
    // Landing still usable; demos call setReduced(true) from this media query.
    await page.getByRole('button', { name: 'Start the Simulation' }).focus()
    expect(await hasVisibleFocusRing(page)).toBe(true)
  })
})

test.describe('no WebGL → 2D path', () => {
  for (const sample of samples.filter((s) => s.slug !== 'twininspect')) {
    test(`${sample.title}: Begin in 2D without WebGL`, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== 'chromium-no-webgl', 'no-webgl project only')
      test.setTimeout(90000)
      await page.setViewportSize({ width: 1280, height: 900 })
      await page.goto(`/${sample.href}`)
      await page.evaluate((slug) => sessionStorage.setItem(`xr-scene-briefing:${slug}`, '1'), sample.slug)
      await page.getByRole('button', { name: 'Start the Simulation' }).click()
      // Without WebGL the intro primary CTA is Begin in 2D (or equivalent).
      const begin = page.getByRole('button', { name: /Begin in 2D|Use 2D Inspector/i })
      await expect(begin).toBeVisible({ timeout: 20000 })
      await begin.click()
      await expect(page.locator('[data-screen-label="2D Inspector"]')).toBeVisible({ timeout: 15000 })
      await expect(page.getByRole('heading', { name: '2D Inspector' })).toBeVisible()
    })
  }

  test('TwinInspect: Use 2D Floor Plan without WebGL', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium-no-webgl', 'no-webgl project only')
    test.setTimeout(90000)
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/samples/twininspect/')
    await page.getByRole('button', { name: /Start the demo/i }).first().click()
    const intro = page.getByRole('dialog', { name: /12 Wattle Lane/i })
    await expect(intro).toBeVisible({ timeout: 20000 })
    await intro.getByRole('button', { name: /Use 2D Floor Plan/i }).click()
    await expect(page.locator('[data-screen-label="Floor plan"]')).toBeVisible({ timeout: 15000 })
  })
})
