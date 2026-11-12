import { expect, test, type Page } from '@playwright/test'

async function installProbe(page: Page) {
  await page.addInitScript(() => {
    type Api = { createView: (opts: unknown) => unknown; __hooked?: boolean }
    const w = window as unknown as { XRWarehouse?: Api; __xrViews?: unknown[] }
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
    let cur: Api | undefined
    Object.defineProperty(w, 'XRWarehouse', {
      configurable: true,
      get: () => cur,
      set: (v: Api) => {
        cur = wrap(v)
      },
    })
  })
}

async function interactiveView(page: Page) {
  return page.evaluate(() => {
    type Vec = { x: number; y: number; z: number; clone: () => Vec; set: (x: number, y: number, z: number) => Vec }
    type Anchor = { getWorldPosition: (out: Vec) => Vec; position: Vec }
    type View = {
      canvas: HTMLCanvasElement
      camera: { updateMatrixWorld: () => void }
      controls: { reduced: boolean; tween: unknown; enabled: boolean; cur: { theta: number; phi: number; r: number } }
      stageAnchors?: Record<string, Anchor>
      insp?: Record<string, { group: { localToWorld: (v: Vec) => Vec; position: Vec } }>
    }
    const views = (window as unknown as { __xrViews?: View[] }).__xrViews || []
    const view = views.find((v) => /Interactive 3D/i.test(v.canvas?.getAttribute('aria-label') || ''))
    if (!view) return null
    return {
      reduced: view.controls.reduced,
      tween: !!view.controls.tween,
      enabled: view.controls.enabled,
      theta: view.controls.cur.theta,
      phi: view.controls.cur.phi,
      r: view.controls.cur.r,
    }
  })
}

/** Click a station marker by projecting its sprite. Returns false if the hit isn't the canvas. */
async function clickStageMarker(page: Page, stageId: string) {
  const point = await page.evaluate((id) => {
    type Vec = { clone: () => Vec }
    type Anchor = { getWorldPosition: (out: Vec) => { x: number; y: number; z: number; project: (cam: unknown) => void } & { x: number; y: number; z: number }; position: Vec }
    type View = {
      canvas: HTMLCanvasElement
      camera: unknown
      stageAnchors?: Record<string, Anchor>
      controls: { tween: unknown; enabled: boolean }
    }
    const views = (window as unknown as { __xrViews?: View[] }).__xrViews || []
    const view = views.find((v) => /Interactive 3D/i.test(v.canvas?.getAttribute('aria-label') || ''))
    const anchor = view?.stageAnchors?.[id]
    if (!view || !anchor) return null
    const p = anchor.getWorldPosition(anchor.position.clone())
    p.project(view.camera)
    const rect = view.canvas.getBoundingClientRect()
    const x = rect.left + (p.x * 0.5 + 0.5) * rect.width
    const y = rect.top + (-p.y * 0.5 + 0.5) * rect.height
    const el = document.elementFromPoint(x, y)
    const onCanvas = el === view.canvas
    return { x, y, z: p.z, onCanvas, enabled: view.controls.enabled, tween: !!view.controls.tween }
  }, stageId)
  expect(point, `marker ${stageId} not projected`).toBeTruthy()
  expect(point!.z, `marker ${stageId} behind camera`).toBeLessThan(1)
  expect(point!.enabled, 'orbit picks disabled').toBe(true)
  expect(point!.tween, 'camera still tweening').toBe(false)
  expect(point!.onCanvas, `marker ${stageId} covered at ${point!.x},${point!.y}`).toBe(true)
  await page.mouse.click(point!.x, point!.y)
}

test('Oil & Gas process walk steps stations and does not score them', async ({ page }) => {
  test.setTimeout(120000)
  await installProbe(page)
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/samples/oil-gas/')
  await expect(page.getByRole('heading', { level: 1, name: /Learn by doing/i })).toBeVisible({ timeout: 20000 })

  const walk = page.locator('#demo [data-og-walk]')
  await expect(walk.getByRole('button', { name: 'Walk the process' })).toBeVisible()
  await expect(walk.getByRole('button', { name: 'Previous process stage' })).toHaveAttribute('aria-disabled', 'true')
  const headset = walk.getByRole('button', { name: 'Connect a WebXR headset to view in VR' })
  await expect(headset).toBeVisible()
  await expect(headset).toBeDisabled()

  await walk.getByRole('button', { name: 'Walk the process' }).click()
  const panel = walk.getByRole('region', { name: 'Process stage' })
  await expect(panel.getByRole('heading', { name: 'Inlet / wellhead' })).toBeVisible()
  await expect(panel.getByText(/illustrated inlet/i)).toBeVisible()
  await expect(panel.getByText(/not a real facility, a live digital twin, a certified procedure, or AI coaching/i)).toBeVisible()
  await expect(panel).toHaveAttribute('data-stage', 'stage-inlet')

  await walk.getByRole('button', { name: 'Next process stage' }).click()
  await expect(panel.getByRole('heading', { name: 'Separator' })).toBeVisible()
  await expect(panel.getByText(/split gas and liquids/i)).toBeVisible()
  await expect(walk.locator('.og-status')).toHaveText(/Station 2 of 6 · Separator/)

  await walk.getByRole('button', { name: 'Previous process stage' }).focus()
  await page.keyboard.press('Enter')
  await expect(panel.getByRole('heading', { name: 'Inlet / wellhead' })).toBeVisible()
  await walk.getByRole('button', { name: 'Next process stage' }).focus()
  await page.keyboard.press('ArrowRight')
  await expect(panel.getByRole('heading', { name: 'Separator' })).toBeVisible()

  await walk.getByRole('button', { name: 'Inspect station 6: Export' }).click()
  await expect(panel.getByRole('heading', { name: 'Export' })).toBeVisible()
  await expect(panel.getByText(/not a compressor, a meter, or a pipeline/i)).toBeVisible()
  await expect(walk.getByRole('button', { name: 'Next process stage' })).toHaveAttribute('aria-disabled', 'true')

  // Page-level industry stages stay context. Only the separation card is live.
  const section = page.locator('#process')
  await expect(section.getByRole('heading', { name: 'End-to-end process' })).toBeVisible()
  await expect(section.getByRole('heading', { name: 'Exploration and appraisal' })).toBeVisible()
  await expect(section.getByRole('heading', { name: 'Well planning and drilling' })).toBeVisible()
  await expect(section.getByText('In this 3D scene')).toHaveCount(1)
})

test('clicking a station marker inspects that stage and leaves the score alone', async ({ page }) => {
  test.setTimeout(120000)
  await installProbe(page)
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/samples/oil-gas/')
  await page.evaluate(() => sessionStorage.setItem('xr-scene-briefing:oil-gas', '1'))
  await page.getByRole('button', { name: 'Start the Simulation' }).click()
  await expect(page.getByRole('heading', { name: 'Gas Pad Challenge' })).toBeVisible({ timeout: 20000 })
  await page.getByRole('button', { name: 'Begin in 3D' }).click()

  const sim = page.locator('[data-screen-label="Simulation"]')
  const walk = sim.locator('[data-og-walk]')
  await expect(walk.getByRole('button', { name: 'Walk the process' })).toBeVisible({ timeout: 15000 })
  await expect(sim.getByRole('button', { name: 'Connect a WebXR headset to view in VR' })).toBeDisabled()
  await expect(sim.locator('.scene-status').getByText('0 of 4 reviewed')).toBeVisible()

  await walk.getByRole('button', { name: 'Inspect station 5: Flare' }).click()
  const panel = walk.getByRole('region', { name: 'Process stage' })
  await expect(panel.getByRole('heading', { name: 'Flare' })).toBeVisible()
  await panel.getByRole('button', { name: 'Close process stage' }).click()
  await expect(panel).toBeHidden()

  await expect.poll(async () => {
    const cam = await interactiveView(page)
    return !!(cam && cam.enabled && !cam.tween)
  }).toBe(true)

  await clickStageMarker(page, 'stage-flare')
  await expect(panel.getByRole('heading', { name: 'Flare' })).toBeVisible()
  await expect(panel.getByText(/not a real facility, a live digital twin/i)).toBeVisible()
  await expect(sim.getByText('Hazards assessed: 0 of 4')).toBeVisible()
  await expect(sim.locator('.scene-status').getByText('None selected')).toBeVisible()
  await expect(sim.locator('[role="dialog"][aria-labelledby="panelTitle"]')).toHaveCount(0)

  await panel.getByRole('button', { name: 'Close process stage' }).click()
  await walk.getByRole('button', { name: 'Inspect station 2: Separator' }).click()
  await expect(panel.getByRole('heading', { name: 'Separator' })).toBeVisible()
  await panel.getByRole('button', { name: 'Close process stage' }).click()
  await expect.poll(async () => {
    const cam = await interactiveView(page)
    return !!(cam && !cam.tween)
  }).toBe(true)

  const hazard = await page.evaluate(() => {
    type Vec = { x: number; y: number; z: number }
    type View = {
      canvas: HTMLCanvasElement
      camera: unknown
      insp?: { flange?: { group: { localToWorld: (v: Vec) => Vec; position: { constructor: new (x: number, y: number, z: number) => Vec } } } }
    }
    const views = (window as unknown as { __xrViews?: View[] }).__xrViews || []
    const view = views.find((v) => /Interactive 3D/i.test(v.canvas?.getAttribute('aria-label') || ''))
    const group = view?.insp?.flange?.group
    if (!view || !group) return null
    const local = new group.position.constructor(0, 1.35, 0)
    const p = group.localToWorld(local) as Vec & { project: (cam: unknown) => void }
    p.project(view.camera)
    const rect = view.canvas.getBoundingClientRect()
    const x = rect.left + ((p as unknown as { x: number }).x * 0.5 + 0.5) * rect.width
    const y = rect.top + (-(p as unknown as { y: number }).y * 0.5 + 0.5) * rect.height
    return { x, y, onCanvas: document.elementFromPoint(x, y) === view.canvas }
  })
  expect(hazard?.onCanvas, 'separator vessel is covered').toBe(true)
  await page.mouse.click(hazard!.x, hazard!.y)

  const dialog = sim.locator('[role="dialog"][aria-labelledby="panelTitle"]')
  await expect(dialog.getByRole('heading', { name: 'Separator' })).toBeVisible({ timeout: 10000 })
  await expect(dialog.getByText(/best response/i)).toBeVisible()
  await dialog.getByRole('radio').nth(1).click()
  await dialog.getByRole('button', { name: 'Submit' }).click()
  await expect(dialog.getByText(/Matches the scenario guidance/i)).toBeVisible()
  await expect(sim.getByText('Hazards assessed: 1 of 4')).toBeVisible()
})

test('reduced motion snaps the process camera without a tween', async ({ page }) => {
  test.setTimeout(90000)
  await installProbe(page)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/samples/oil-gas/')
  await expect(page.locator('#demo [data-og-walk]').getByRole('button', { name: 'Walk the process' })).toBeVisible({ timeout: 20000 })
  await expect.poll(async () => {
    const cam = await interactiveView(page)
    return !!(cam && cam.reduced)
  }).toBe(true)

  await page.locator('#demo [data-og-walk]').getByRole('button', { name: 'Walk the process' }).click()
  const cam = await interactiveView(page)
  expect(cam?.tween, 'reduced motion should not start a camera tween').toBe(false)
  expect(cam?.reduced).toBe(true)
  expect(Math.abs((cam?.theta || 0) - 0.85)).toBeLessThan(0.02)
  expect(Math.abs((cam?.r || 0) - 8)).toBeLessThan(0.05)
  await expect(page.locator('#demo [data-og-walk]').getByRole('heading', { name: 'Inlet / wellhead' })).toBeVisible()
})

test('Explore this stage in 3D starts the walk at the separator', async ({ page }) => {
  test.setTimeout(90000)
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/samples/oil-gas/')
  await expect(page.locator('#process')).toBeVisible({ timeout: 20000 })
  const cta = page.locator('#process').getByRole('link', { name: 'Explore this stage in 3D' })
  await expect(cta).toHaveAttribute('href', '#demo')
  await cta.click()
  const panel = page.locator('#demo [data-og-walk]').getByRole('region', { name: 'Process stage' })
  await expect(panel.getByRole('heading', { name: 'Separator' })).toBeVisible()
  await expect(panel).toHaveAttribute('data-stage', 'stage-separator')
  await expect(page.locator('#demo').getByRole('heading', { name: 'The Simulation' })).toBeInViewport()
  await expect(page.locator('#demo canvas')).toBeVisible()
  await expect(page.locator('#process').getByRole('heading', { name: 'Exploration and appraisal' })).toBeVisible()
})

test('Headset click reports a calm failure when the session is refused', async ({ page }) => {
  test.setTimeout(90000)
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'xr', {
      configurable: true,
      get() {
        return {
          isSessionSupported: async (mode: string) => mode === 'immersive-vr',
          requestSession: async () => {
            throw new DOMException('No headset', 'NotSupportedError')
          },
        }
      },
    })
  })
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/samples/oil-gas/')
  const headset = page.locator('#demo').getByRole('button', { name: 'View in Headset' })
  await expect(headset).toBeEnabled({ timeout: 20000 })
  await headset.click()
  await expect(page.getByRole('status').filter({ hasText: 'Could not start the headset session.' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Inlet / wellhead' })).toHaveCount(0)
})

test('process walk chrome fits at 320, 390, 768, 1024, and 1440', async ({ page }) => {
  test.setTimeout(90000)
  await page.goto('/samples/oil-gas/')
  await expect(page.locator('#demo [data-og-walk]')).toBeVisible({ timeout: 20000 })
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    const box = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }))
    expect(box.scrollWidth, `${width}: ${box.scrollWidth}px inside ${box.clientWidth}px`).toBeLessThanOrEqual(box.clientWidth)
    const bar = await page.locator('#demo .og-walk-bar').boundingBox()
    expect(bar, `${width}: walk bar missing`).toBeTruthy()
    expect(bar!.x).toBeGreaterThanOrEqual(-1)
    expect(bar!.x + bar!.width).toBeLessThanOrEqual(width + 1)
  }
})

test('2D inspector still runs and hides the 3D walk', async ({ page }) => {
  test.setTimeout(90000)
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/samples/oil-gas/')
  await page.evaluate(() => sessionStorage.setItem('xr-scene-briefing:oil-gas', '1'))
  await page.getByRole('button', { name: 'Start the Simulation' }).click()
  await expect(page.getByRole('heading', { name: 'Gas Pad Challenge' })).toBeVisible({ timeout: 20000 })
  await page.getByRole('button', { name: /Use 2D Inspector|Begin in 2D/i }).click()
  await expect(page.locator('[data-screen-label="2D Inspector"]')).toBeVisible({ timeout: 10000 })
  await expect(page.locator('[data-screen-label="Simulation"] [data-og-walk]')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Finish Assessment' })).toBeVisible()
})
