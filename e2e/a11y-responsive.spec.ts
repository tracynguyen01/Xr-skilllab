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

/** Hook XRWarehouse / TwinHome createView so tests can read camera pose. */
async function installXrViewProbe(page: Page) {
  await page.addInitScript(() => {
    type Api = { createView: (opts: unknown) => unknown; __hooked?: boolean }
    const w = window as unknown as Window & {
      XRWarehouse?: Api
      TwinHome?: Api
      __xrViews?: unknown[]
    }
    const wrap = (api: Api) => {
      if (!api?.createView || api.__hooked) return api
      const orig = api.createView.bind(api)
      api.createView = (opts: unknown) => {
        const view = orig(opts)
        if (view) (w.__xrViews ||= []).push(view)
        return view
      }
      api.__hooked = true
      return api
    }
    // Intercept assignment so we wrap before the lesson calls createView.
    for (const key of ['XRWarehouse', 'TwinHome'] as const) {
      let cur: Api | undefined
      Object.defineProperty(w, key, {
        configurable: true,
        get() {
          return cur
        },
        set(v: Api) {
          cur = wrap(v)
        },
      })
    }
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
  settling: boolean
  label: string
}

/** Read orbit pose from a warehouse-style (controls) or TwinInspect (cam) view. */
async function readViewCam(
  page: Page,
  prefer: 'hero' | 'interactive',
): Promise<CamSnap | null> {
  return page.evaluate((which) => {
    type Orbit = {
      reduced: boolean
      auto: number
      tween: unknown
      cur?: { theta: number; phi: number; r: number }
      goal?: { theta: number; phi: number; r: number }
      orbit?: { theta: number; phi: number; r: number; gtheta: number; gphi: number; gr: number }
    }
    type View = {
      active?: boolean
      canvas: HTMLCanvasElement
      controls?: Orbit
      cam?: Orbit
      camera: { position: { x: number; y: number; z: number } }
    }
    const views = (window as unknown as { __xrViews?: View[] }).__xrViews
    if (!views?.length) return null

    const labelOf = (v: View) => v.canvas?.getAttribute('aria-label') || ''
    const isHero = (v: View) =>
      /preview|Live 3D|Rotating dollhouse|hero/i.test(labelOf(v)) ||
      (!/Interactive 3D/i.test(labelOf(v)) && !!v.active)
    const isInteractive = (v: View) => /Interactive 3D/i.test(labelOf(v))

    let v: View | undefined
    if (which === 'hero') {
      v = views.find(isHero) || views.find((view) => view.active) || views[0]
    } else {
      v = views.find(isInteractive) || views[views.length - 1]
    }
    if (!v) return null

    const orbit = v.controls || v.cam
    if (!orbit) return null
    const { x, y, z } = v.camera.position

    // TwinInspect Cam uses orbit.theta / gtheta; warehouse Orbit uses cur/goal.
    if (orbit.orbit) {
      const o = orbit.orbit
      const settling =
        !!orbit.tween ||
        Math.abs(o.theta - o.gtheta) > 1e-4 ||
        Math.abs(o.phi - o.gphi) > 1e-4 ||
        Math.abs(o.r - o.gr) > 1e-4
      return {
        reduced: orbit.reduced,
        auto: orbit.auto,
        theta: o.theta,
        phi: o.phi,
        r: o.r,
        x,
        y,
        z,
        settling,
        label: labelOf(v).slice(0, 48),
      }
    }

    if (!orbit.cur || !orbit.goal) return null
    const { theta, phi, r } = orbit.cur
    const g = orbit.goal
    const settling =
      !!orbit.tween ||
      Math.abs(theta - g.theta) > 1e-4 ||
      Math.abs(phi - g.phi) > 1e-4 ||
      Math.abs(r - g.r) > 1e-4
    return {
      reduced: orbit.reduced,
      auto: orbit.auto,
      theta,
      phi,
      r,
      x,
      y,
      z,
      settling,
      label: labelOf(v).slice(0, 48),
    }
  }, prefer)
}

async function expectCamFrozen(page: Page, prefer: 'hero' | 'interactive', label: string) {
  await expect
    .poll(async () => {
      const snap = await readViewCam(page, prefer)
      return !!(snap && snap.reduced === true && !snap.settling)
    }, { timeout: 20000, message: `${label}: waiting for reduced + settled camera` })
    .toBeTruthy()

  const first = await readViewCam(page, prefer)
  expect(first, `${label}: camera view missing`).toBeTruthy()
  expect(first!.reduced, `${label}: controls/cam.reduced should be true`).toBe(true)

  await page.waitForTimeout(2000)

  const second = await readViewCam(page, prefer)
  expect(second!.reduced).toBe(true)
  expect(second!.settling, `${label}: still settling after wait`).toBe(false)
  expect(Math.abs(second!.theta - first!.theta), `${label}: theta moved`).toBeLessThan(1e-4)
  expect(Math.abs(second!.phi - first!.phi), `${label}: phi moved`).toBeLessThan(1e-4)
  expect(Math.abs(second!.r - first!.r), `${label}: r moved`).toBeLessThan(1e-4)
  expect(Math.abs(second!.x - first!.x), `${label}: x moved`).toBeLessThan(1e-3)
  expect(Math.abs(second!.y - first!.y), `${label}: y moved`).toBeLessThan(1e-3)
  expect(Math.abs(second!.z - first!.z), `${label}: z moved`).toBeLessThan(1e-3)
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

      // Finish must appear once play/inspect has started — fail if missing.
      await page.getByRole('button', { name: beginName }).first().click()
      const finish = page.getByRole('button', { name: /Finish/i }).first()
      await expect(finish, `${sample.title}: Finish missing after Start`).toBeVisible({ timeout: 15000 })
      // TwinInspect has many plan markers — allow a longer Tab walk, but still require Tab.
      await expectFocusRingOn(page, /Finish/i, `${sample.title} Finish`, {
        requireTab: true,
        maxTabs: sample.slug === 'twininspect' ? 120 : 64,
      })
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

  // Intro/hero auto-turn must freeze under reduced motion (before Start/play).
  for (const sample of samples) {
    test(`${sample.title}: hero camera stays still under reduced motion`, async ({ page }) => {
      test.setTimeout(90000)
      await installXrViewProbe(page)
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.setViewportSize({ width: 1280, height: 900 })
      await page.goto(`/${sample.href}`)
      await expect(page.getByRole('button', { name: 'Menu' })).toBeVisible({ timeout: 20000 })
      expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true)

      // Do not click Start — the landing hero must already be frozen.
      await expect
        .poll(async () => {
          const snap = await readViewCam(page, 'hero')
          return !!(snap && snap.reduced === true)
        }, { timeout: 20000, message: `${sample.title}: hero view not ready` })
        .toBeTruthy()

      await expectCamFrozen(page, 'hero', `${sample.title} hero`)
    })
  }

  test('Oil & Gas play camera stays still under reduced motion', async ({ page }) => {
    test.setTimeout(90000)
    await installXrViewProbe(page)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/samples/oil-gas/')
    await page.evaluate(() => sessionStorage.setItem('xr-scene-briefing:oil-gas', '1'))

    await expect(page.getByRole('button', { name: 'Menu' })).toBeVisible({ timeout: 20000 })
    await page.getByRole('button', { name: 'Start the Simulation' }).click()
    await expect(page.getByRole('heading', { name: 'Gas Pad Challenge' })).toBeVisible({ timeout: 20000 })
    await page.getByRole('button', { name: 'Begin in 3D' }).click()

    // Wait until glideIn has snapped to the inspection pose.
    await expect
      .poll(async () => {
        const snap = await readViewCam(page, 'interactive')
        if (!snap || !snap.reduced || snap.auto !== 0 || snap.settling) return false
        return Math.abs(snap.theta - 0.4) < 0.02 && Math.abs(snap.r - 16) < 0.5
      }, { timeout: 15000 })
      .toBeTruthy()

    const first = await readViewCam(page, 'interactive')
    expect(first!.auto, 'play mode must not add an auto sideways turn').toBe(0)
    await expectCamFrozen(page, 'interactive', 'Oil & Gas play')
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
