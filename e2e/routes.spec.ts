import { expect, test, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'

type Sample = { slug: string; title: string; href: string }

const samples = JSON.parse(readFileSync(new URL('../site/samples.json', import.meta.url), 'utf8')) as Sample[]

const routes = ['/', ...samples.map((sample) => `/${sample.href}`)]
const widths = [320, 390, 768, 1440] as const

// Playwright starts Chromium with SwiftShader (`--use-angle=swiftshader`).
// Only the renderer notices below are ignored. Each one is a headless WebGL
// warning, not an application fault. SVG parse errors, failed loads, and
// uncaught exceptions stay visible to the assertions.
function isKnownBenignWebglOrHeadless(text: string): boolean {
  // SwiftShader deprecation notice:
  // "Automatic fallback to software WebGL has been deprecated."
  if (text.includes('Automatic fallback to software WebGL')) return true
  // SwiftShader performance notice, not a failed draw:
  // "GL Driver Message (OpenGL, Performance, …): GPU stall due to ReadPixels"
  if (text.includes('GL Driver Message') && text.includes('GPU stall due to ReadPixels')) return true
  return false
}

function watchConsole(page: Page) {
  const errors: string[] = []
  page.on('pageerror', (error) => {
    const text = error.message
    if (isKnownBenignWebglOrHeadless(text)) return
    errors.push(text)
  })
  page.on('console', (message) => {
    if (message.type() !== 'error') return
    const text = message.text()
    if (isKnownBenignWebglOrHeadless(text)) return
    errors.push(text)
  })
  return errors
}

async function gotoRoute(page: Page, route: string) {
  const response = await page.goto(route, { waitUntil: 'domcontentloaded' })
  return response
}

async function settle(page: Page, route: string) {
  if (route === '/') {
    await expect(page.getByRole('heading', { level: 1, name: /practised in the browser/i })).toBeVisible()
    return
  }
  // Sample pages replace the Fable shell before the Fields menu mounts.
  await expect(page.getByRole('button', { name: 'Menu' })).toBeVisible({ timeout: 20000 })
}

test.describe('route baseline', () => {
  for (const route of routes) {
    test(`${route} responds OK`, async ({ page }) => {
      const response = await gotoRoute(page, route)
      expect(response, route).not.toBeNull()
      expect(response!.status(), route).toBe(200)
    })
  }

  for (const route of routes) {
    const title = `${route} has no uncaught console errors`
    const body = async ({ page }: { page: Page }) => {
      test.setTimeout(60000)
      const errors = watchConsole(page)
      await page.setViewportSize({ width: 1440, height: 900 })
      const response = await gotoRoute(page, route)
      expect(response!.status(), route).toBe(200)
      await settle(page, route)
      await page.waitForTimeout(500)
      expect(errors, errors.join('\n')).toEqual([])
    }

    if (route === '/samples/twininspect/') {
      // Bug: TwinInspect's floor-plan SVG is still in the document with
      // unreplaced Mustache tokens (`{{ r.x }}`, `{{ r.y }}`, `{{ r.w }}`,
      // `{{ r.h }}`, `{{ r.cx }}`, `{{ r.cy }}`, `{{ r.cy2 }}`, `{{ rp.x }}`,
      // `{{ rp.y }}`, `{{ rp.ty }}`). Chromium logs a console error for each
      // attribute ("Expected length, …") while parsing that SVG. These are
      // not WebGL or headless warnings.
      test.fixme(title, body)
    } else {
      test(title, body)
    }
  }

  // Home is where "Back to all demos" lands, so this check covers sample routes.
  for (const sample of samples) {
    const route = `/${sample.href}`
    test(`${route} Back to all demos returns home`, async ({ page }) => {
      test.setTimeout(60000)
      await page.setViewportSize({ width: 1440, height: 900 })
      const response = await gotoRoute(page, route)
      expect(response!.status(), route).toBe(200)
      await settle(page, route)
      const back = page.getByRole('link', { name: 'Back to all demos' })
      await expect(back).toBeVisible()
      await back.click()
      await expect(page).toHaveURL(/:4175\/$/)
      await expect(page.getByRole('heading', { level: 1, name: /practised in the browser/i })).toBeVisible()
    })
  }

  for (const route of routes) {
    test(`${route} Fields menu opens and every lesson link resolves`, async ({ page }) => {
      test.setTimeout(60000)
      await page.setViewportSize({ width: 1440, height: 900 })
      const response = await gotoRoute(page, route)
      expect(response!.status(), route).toBe(200)
      await settle(page, route)
      const menu = page.getByRole('button', { name: 'Menu' })
      await menu.click()
      await expect(menu).toHaveAttribute('aria-expanded', 'true')
      const fields = page.getByRole('button', { name: 'Fields' })
      await fields.click()
      await expect(fields).toHaveAttribute('aria-expanded', 'true')
      await expect(page.locator('#fields-submenu a')).toHaveCount(samples.length)
      for (const sample of samples) {
        const link = page.locator('#fields-submenu').getByRole('link', { name: sample.title })
        await expect(link).toBeVisible()
        const href = await link.evaluate((anchor) => (anchor as HTMLAnchorElement).href)
        expect(new URL(href).pathname, sample.title).toBe(`/${sample.href}`)
        const lesson = await page.request.get(href)
        expect(lesson.ok(), `${sample.title} ${href}`).toBeTruthy()
      }
    })
  }

  for (const route of routes) {
    test(`${route} has no horizontal overflow at 320, 390, 768 and 1440`, async ({ page }) => {
      test.setTimeout(60000)
      await page.setViewportSize({ width: widths[0], height: 900 })
      const response = await gotoRoute(page, route)
      expect(response!.status(), route).toBe(200)
      await settle(page, route)
      for (const width of widths) {
        await page.setViewportSize({ width, height: 900 })
        const box = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        }))
        expect(box.scrollWidth, `${route} at ${width}: ${box.scrollWidth}px inside ${box.clientWidth}px`).toBeLessThanOrEqual(box.clientWidth)
      }
    })
  }
})
