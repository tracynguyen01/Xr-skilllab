import { expect, test } from '@playwright/test'

const ANSWERS: Array<[RegExp, RegExp]> = [
  [/blocked emergency exit/i, /flag the obstruction/i],
  [/liquid spill/i, /isolate and mark/i],
  [/unstable pallet/i, /restrict access/i],
  [/forklift/i, /designated separated crossing/i],
]

test('3D scene loads and an attempt can be finished from the list', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/Xr-skilllab/#/simulate')
  await page.getByRole('button', { name: 'Begin in 3D' }).click()
  const loading = page.getByText('Loading the 3D warehouse…').first()
  const canvas = page.locator('.scene-3d-host canvas')
  await expect(loading.or(canvas)).toBeVisible()
  await expect(canvas).toBeVisible({ timeout: 20000 })
  await expect(page.getByText('0 / 4 hazards assessed')).toBeVisible()

  const list = page.getByRole('list', { name: 'Inspection list' })
  for (const [hazard, choice] of ANSWERS) {
    await list.getByRole('button', { name: hazard }).click()
    const dialog = page.getByRole('dialog')
    await dialog.getByRole('radio', { name: choice }).click()
    await dialog.getByRole('button', { name: 'Submit answer' }).click()
    await dialog.getByRole('button', { name: 'Back to warehouse' }).click()
  }

  await expect(page.getByText('4 / 4 hazards assessed')).toBeVisible()
  await page.getByRole('button', { name: 'Finish Assessment' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Score: 100 / 100' })).toBeVisible()
  await expect(page.getByText('Scenario Coach · offline rules')).toBeVisible()
  await expect(page.getByText('AI coaching (beta)')).toHaveCount(0)

  const box = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }))
  expect(box.scrollWidth).toBeLessThanOrEqual(box.clientWidth)
})

test('missing WebGL falls back to the 2D exercise', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (type: string, ...args: unknown[]) {
      if (String(type).includes('webgl')) return null
      return original.call(this, type as never, ...(args as never[]))
    }
  })
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/Xr-skilllab/#/simulate')
  await expect(page.getByText("3D isn't available on this device. You can complete the full exercise in 2D.")).toBeVisible()
  await expect(page.getByRole('button', { name: 'Begin in 3D' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Try 3D' })).toHaveCount(0)
  await page.getByRole('button', { name: 'Use 2D Inspector' }).click()
  await expect(page.getByRole('list', { name: 'Inspection list' })).toBeVisible()
  await expect(page.locator('a-scene')).toHaveCount(0)
})

test('the opening shot looks down and keeps every marker on screen', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/Xr-skilllab/#/simulate')
  await page.getByRole('button', { name: 'Begin in 3D' }).click()
  await expect(page.locator('.scene-3d-host canvas')).toBeVisible({ timeout: 20000 })
  await waitForSettledShot(page)

  const opening = await readFraming(page)
  expect(opening.pitch, `pitch ${opening.pitch}`).toBeLessThan(0)
  expectMarkersInside(opening)

  await page.keyboard.down('w')
  try {
    await page.waitForFunction((startZ) => {
      const rig = document.querySelector('[data-rig]') as (HTMLElement & { object3D?: { position: { z: number } } }) | null
      const z = rig?.object3D?.position.z
      return typeof z === 'number' && z < startZ - 0.4
    }, opening.position.z)
  } finally {
    await page.keyboard.up('w')
  }
  const walked = await readFraming(page)
  expect(walked.position.z).toBeLessThan(opening.position.z - 0.4)

  const glidesBefore = await armGlideCounter(page)
  await page.getByRole('button', { name: 'Reset view' }).click()
  // pose-glide deletes data-gliding when it finishes. A stalled CI frame can
  // start and finish that 900ms glide before the next poll, so wait for the
  // event that stays counted instead of the flag.
  await page.waitForFunction((before) => {
    const count = (window as Window & { __xrGlides?: number }).__xrGlides ?? 0
    return count > before
  }, glidesBefore)
  await waitForSettledShot(page)

  const reset = await readFraming(page)
  expect(reset.pitch, `pitch ${reset.pitch}`).toBeLessThan(0)
  expect(reset.position.x).toBeCloseTo(opening.position.x, 1)
  expect(reset.position.y).toBeCloseTo(opening.position.y, 1)
  expect(reset.position.z).toBeCloseTo(opening.position.z, 1)
  expectMarkersInside(reset)
})

test('a narrow screen offers 2D first and an optional 3D try', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/Xr-skilllab/#/simulate')
  await expect(page.getByRole('button', { name: 'Use 2D Inspector' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Try 3D' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Begin in 3D' })).toHaveCount(0)
})

type Framing = {
  pitch: number
  width: number
  height: number
  position: { x: number; y: number; z: number }
  markers: Array<{ id: string; x: number; y: number; behind: boolean }>
}

async function waitForSettledShot(page: import('@playwright/test').Page) {
  await page.waitForFunction(() => {
    const rig = document.querySelector('[data-rig]')
    const camera = document.querySelector('[data-camera]') as (HTMLElement & { getObject3D?: (name: string) => unknown }) | null
    if (!rig || !camera?.getObject3D?.('camera')) return false
    // pose-glide removes itself only after the ease finishes. "Not gliding yet"
    // is also true before the component starts, so the attribute is the signal.
    return !rig.hasAttribute('pose-glide') && rig.dataset.gliding !== 'true'
  })
  // look-controls is re-enabled on glide-ended. Give it real frames, not wall
  // clock, so a slow runner still lets it overwrite pitch if that bug returns.
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        let frames = 0
        function tick() {
          frames += 1
          if (frames >= 8) resolve()
          else requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }),
  )
}

async function armGlideCounter(page: import('@playwright/test').Page): Promise<number> {
  return page.evaluate(() => {
    const record = window as Window & { __xrGlides?: number }
    record.__xrGlides = record.__xrGlides ?? 0
    if (record.__xrGlides === 0 && !document.querySelector('a-scene')?.hasAttribute('data-glide-counter')) {
      document.querySelector('a-scene')?.setAttribute('data-glide-counter', 'on')
      document.querySelector('a-scene')?.addEventListener('glide-ended', () => {
        record.__xrGlides = (record.__xrGlides ?? 0) + 1
      })
    }
    return record.__xrGlides
  })
}

async function readFraming(page: import('@playwright/test').Page): Promise<Framing> {
  return page.evaluate(() => {
    const aframe = (window as Window & { AFRAME: { THREE: { Vector3: new () => { x: number; y: number; z: number; clone: () => { project: (camera: unknown) => { x: number; y: number; z: number } } } } } }).AFRAME
    const cameraEl = document.querySelector('[data-camera]') as HTMLElement & {
      getObject3D: (name: string) => { getWorldDirection: (out: { x: number; y: number; z: number }) => void }
    }
    const rig = document.querySelector('[data-rig]') as HTMLElement & { object3D: { position: { x: number; y: number; z: number } } }
    const camera = cameraEl.getObject3D('camera')
    const dir = new aframe.THREE.Vector3()
    camera.getWorldDirection(dir)
    const canvas = document.querySelector('.scene-3d-host canvas') as HTMLCanvasElement
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    const markers = [...document.querySelectorAll('[data-hotspot]')].map((node) => {
      const el = node as HTMLElement & { object3D: { getWorldPosition: (out: { clone: () => { project: (camera: unknown) => { x: number; y: number; z: number } } }) => void } }
      const pos = new aframe.THREE.Vector3()
      el.object3D.getWorldPosition(pos)
      const ndc = pos.clone().project(camera)
      return {
        id: el.getAttribute('data-hotspot') ?? '',
        x: (ndc.x * 0.5 + 0.5) * width,
        y: (-ndc.y * 0.5 + 0.5) * height,
        behind: ndc.z > 1,
      }
    })
    return {
      pitch: Math.atan2(dir.y, Math.hypot(dir.x, dir.z)),
      width,
      height,
      position: { x: rig.object3D.position.x, y: rig.object3D.position.y, z: rig.object3D.position.z },
      markers,
    }
  })
}

function expectMarkersInside(frame: Framing) {
  expect(frame.markers).toHaveLength(6)
  for (const marker of frame.markers) {
    expect(marker.behind, marker.id).toBe(false)
    expect(marker.x, marker.id).toBeGreaterThan(0)
    expect(marker.x, marker.id).toBeLessThan(frame.width)
    expect(marker.y, marker.id).toBeGreaterThan(0)
    expect(marker.y, marker.id).toBeLessThan(frame.height)
  }
}
