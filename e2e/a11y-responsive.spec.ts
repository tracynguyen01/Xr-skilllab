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

async function activeControlLabel(page: Page) {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null
    if (!el || el === document.body) return ''
    return (el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim()
  })
}

/**
 * True when the focused control shows a real focus indicator: an outline or a
 * box-shadow that only appears while focused (drop shadows alone do not count).
 */
async function hasVisibleFocusRing(page: Page) {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null
    if (!el || el === document.body) return false

    const read = () => {
      const cs = getComputedStyle(el)
      return {
        outlineWidth: cs.outlineWidth,
        outlineStyle: cs.outlineStyle,
        outlineColor: cs.outlineColor,
        boxShadow: cs.boxShadow,
      }
    }

    const focused = read()
    const hadFocusVisible = el.matches(':focus-visible')
    el.blur()
    const blurred = read()
    // Put keyboard-style focus back so later assertions still see the control.
    try {
      el.focus({ focusVisible: true } as FocusOptions)
    } catch {
      el.focus()
    }

    const outlineVisible =
      Number.parseFloat(focused.outlineWidth || '0') > 0 && focused.outlineStyle !== 'none'
    const outlineChanged =
      focused.outlineWidth !== blurred.outlineWidth ||
      focused.outlineStyle !== blurred.outlineStyle ||
      focused.outlineColor !== blurred.outlineColor
    const shadowChanged =
      focused.boxShadow !== blurred.boxShadow && focused.boxShadow !== 'none'

    // Prefer :focus-visible when the engine supports it; still accept a clear outline delta.
    if (hadFocusVisible && (outlineVisible || shadowChanged)) return true
    return (outlineVisible && outlineChanged) || shadowChanged
  })
}

/**
 * Tab until a control whose accessible name matches, then assert a focus ring.
 * @param opts.requireTab — when false, keyboard focus is enough (dense scenes like TwinInspect).
 */
async function expectFocusRingOn(
  page: Page,
  name: RegExp,
  label: string,
  opts: { requireTab?: boolean; maxTabs?: number } = {},
) {
  const requireTab = opts.requireTab !== false
  const maxTabs = opts.maxTabs ?? 48
  const target = page.getByRole('button', { name }).first()
  await expect(target, `${label}: control missing`).toBeVisible({ timeout: 20000 })

  await page.evaluate(() => {
    const a = document.activeElement as HTMLElement | null
    if (a && a !== document.body) a.blur()
  })

  let reached = false
  for (let i = 0; i < maxTabs; i++) {
    await page.keyboard.press('Tab')
    const current = await activeControlLabel(page)
    if (name.test(current)) {
      reached = true
      break
    }
  }

  // Re-apply keyboard-style focus so :focus-visible styles apply even when a
  // prior mouse click left the page in mouse modality (common after Start).
  await target.evaluate((el: HTMLElement) => {
    try {
      el.focus({ focusVisible: true } as FocusOptions)
    } catch {
      el.focus()
    }
  })

  const current = await activeControlLabel(page)
  expect(name.test(current), `${label}: focused “${current}” instead of ${name}`).toBe(true)
  if (requireTab) {
    expect(reached, `${label}: not reachable by Tab`).toBe(true)
  }
  // One retry: under parallel load a re-render can drop :focus-visible mid-check.
  let ring = await hasVisibleFocusRing(page)
  if (!ring) {
    await target.evaluate((el: HTMLElement) => {
      try {
        el.focus({ focusVisible: true } as FocusOptions)
      } catch {
        el.focus()
      }
    })
    ring = await hasVisibleFocusRing(page)
  }
  expect(ring, `${label}: no focus-only ring`).toBe(true)
}

/** Hook createView so tests can read controls.reduced / camera pose. */
async function installXrViewProbe(page: Page) {
  await page.addInitScript(() => {
    const hook = () => {
      const api = (window as unknown as { XRWarehouse?: { createView: Function; __hooked?: boolean } }).XRWarehouse
      if (!api?.createView || api.__hooked) return
      const orig = api.createView.bind(api)
      api.createView = (opts: unknown) => {
        const view = orig(opts)
        if (view) {
          const w = window as unknown as { __xrViews?: unknown[] }
          ;(w.__xrViews ||= []).push(view)
        }
        return view
      }
      api.__hooked = true
    }
    setInterval(hook, 30)
    window.addEventListener('xrwarehouse-ready', hook)
  })
}

type CamSnap = {
  reduced: boolean
  auto: number
  theta: number
  phi: number
  r: number
  x: number
  y: number
  z: number
}

async function readInteractiveCam(page: Page): Promise<(CamSnap & { settling: boolean }) | null> {
  return page.evaluate(() => {
    const views = (window as unknown as { __xrViews?: Array<{
      canvas: HTMLCanvasElement
      controls: {
        reduced: boolean
        auto: number
        tween: unknown
        cur: { theta: number; phi: number; r: number }
        goal: { theta: number; phi: number; r: number }
      }
      camera: { position: { x: number; y: number; z: number } }
    }> }).__xrViews
    if (!views?.length) return null
    const v = views.find((view) => /Interactive 3D/i.test(view.canvas?.getAttribute('aria-label') || '')) || views[views.length - 1]
    const { theta, phi, r } = v.controls.cur
    const g = v.controls.goal
    const { x, y, z } = v.camera.position
    const settling =
      !!v.controls.tween ||
      Math.abs(theta - g.theta) > 1e-4 ||
      Math.abs(phi - g.phi) > 1e-4 ||
      Math.abs(r - g.r) > 1e-4
    return { reduced: v.controls.reduced, auto: v.controls.auto, theta, phi, r, x, y, z, settling }
  })
}

test.describe('a11y and responsive — all samples', () => {
  for (const sample of samples) {
    const route = `/${sample.href}`

    test(`${sample.title}: essential controls show a focus ring`, async ({ page }) => {
      test.setTimeout(90000)
      await page.setViewportSize({ width: 1280, height: 900 })
      await page.goto(route)
      await expect(page.getByRole('button', { name: 'Menu' })).toBeVisible({ timeout: 20000 })

      await expectFocusRingOn(page, /^Menu$/i, `${sample.title} Menu`)

      const startName = sample.slug === 'twininspect' ? /Start the demo/i : /Start the Simulation/i
      await expectFocusRingOn(page, startName, `${sample.title} Start`)

      // Open the intro so Begin in 2D (or TwinInspect’s 2D plan) is on the page.
      await page.getByRole('button', { name: startName }).first().click()
      const beginName =
        sample.slug === 'twininspect'
          ? /Use 2D Floor Plan/i
          : /Begin in 2D|Use 2D Inspector/i
      await expect(page.getByRole('button', { name: beginName }).first()).toBeVisible({ timeout: 20000 })
      // Let the intro overlay finish mounting before Tabbing its CTAs.
      await page.waitForTimeout(300)
      await expectFocusRingOn(page, beginName, `${sample.title} Begin in 2D`)

      // Finish only appears once play has started — check it when present.
      await page.getByRole('button', { name: beginName }).first().click()
      const finish = page.getByRole('button', { name: /Finish/i }).first()
      if (await finish.isVisible({ timeout: 8000 }).catch(() => false)) {
        // TwinInspect has many plan markers in the Tab order; still require a focus ring.
        await expectFocusRingOn(page, /Finish/i, `${sample.title} Finish`, {
          requireTab: sample.slug !== 'twininspect',
          maxTabs: 64,
        })
      }
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

  test('Oil & Gas 3D camera stays still under reduced motion', async ({ page }) => {
    test.setTimeout(90000)
    await installXrViewProbe(page)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/samples/oil-gas/')
    await page.evaluate(() => sessionStorage.setItem('xr-scene-briefing:oil-gas', '1'))

    await expect(page.getByRole('button', { name: 'Menu' })).toBeVisible({ timeout: 20000 })
    expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true)

    await page.getByRole('button', { name: 'Start the Simulation' }).click()
    await expect(page.getByRole('heading', { name: 'Gas Pad Challenge' })).toBeVisible({ timeout: 20000 })
    // 3D path: reduced mode should snap the glide and leave auto-turn off in play.
    await page.getByRole('button', { name: 'Begin in 3D' }).click()

    // Wait until glideIn has snapped to the inspection pose and the orbit has settled.
    await expect.poll(async () => {
      const snap = await readInteractiveCam(page)
      if (!snap || !snap.reduced || snap.auto !== 0 || snap.settling) return false
      // inspection preset theta is 0.4 — avoid sampling the pre-glide hero pose (0.55).
      return Math.abs(snap.theta - 0.4) < 0.02 && Math.abs(snap.r - 16) < 0.5
    }, { timeout: 15000 }).toBeTruthy()

    const first = await readInteractiveCam(page)
    expect(first, 'interactive 3D view missing').toBeTruthy()
    expect(first!.reduced, 'controls.reduced should follow prefers-reduced-motion').toBe(true)
    // Play clears auto; the engine also skips auto turns while reduced is on.
    expect(first!.auto, 'play mode must not add an auto sideways turn').toBe(0)

    await page.waitForTimeout(2000)

    const second = await readInteractiveCam(page)
    expect(second!.reduced).toBe(true)
    expect(second!.auto).toBe(0)
    expect(second!.settling).toBe(false)
    // Angle + position should be frozen (allow tiny float noise only).
    expect(Math.abs(second!.theta - first!.theta)).toBeLessThan(1e-4)
    expect(Math.abs(second!.phi - first!.phi)).toBeLessThan(1e-4)
    expect(Math.abs(second!.r - first!.r)).toBeLessThan(1e-4)
    expect(Math.abs(second!.x - first!.x)).toBeLessThan(1e-3)
    expect(Math.abs(second!.y - first!.y)).toBeLessThan(1e-3)
    expect(Math.abs(second!.z - first!.z)).toBeLessThan(1e-3)
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
