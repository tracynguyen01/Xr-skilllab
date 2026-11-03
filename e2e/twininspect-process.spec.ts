import { expect, test } from '@playwright/test'

const stages = [
  { title: 'Define inspection scope', text: 'Establish property areas and inspection questions.', live: false },
  { title: 'Capture property information', text: 'Gather permitted photos, scans, and relevant records.', live: false },
  { title: 'Explore the property', text: 'Review rooms and visible building elements.', live: true },
  { title: 'Record observations', text: 'Capture evidence and associate observations with locations.', live: true },
  { title: 'Build or align the 3D model', text: 'Organise captured information into a navigable visual representation.', live: false },
  { title: 'Review findings', text: 'Assess observations and identify items requiring further attention.', live: true },
  { title: 'Generate the report', text: 'Produce a traceable summary with evidence and limitations.', live: true },
  { title: 'Plan follow-up', text: 'Identify further investigation or maintenance actions as appropriate.', live: false },
]

test('TwinInspect end-to-end process journey sits above the demo', async ({ page }) => {
  test.setTimeout(90000)
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/samples/twininspect/')
  await expect(page.getByRole('heading', { level: 1, name: /inspecting a home remotely/i })).toBeVisible({ timeout: 20000 })

  const section = page.locator('#process')
  const demo = page.locator('#demo')
  await expect(section.getByRole('heading', { level: 2, name: 'End-to-end process' })).toBeVisible()
  await expect(section.getByText(/fictional illustrative educational overview of a residential house-inspection concept/i)).toBeVisible()
  await expect(section.getByText(/not a certified inspection, AI coaching, a live digital twin, or a verified property record/i)).toBeVisible()

  const items = section.getByRole('listitem')
  await expect(items).toHaveCount(8)
  for (const [index, stage] of stages.entries()) {
    const item = items.nth(index)
    await expect(item.getByRole('heading', { level: 3, name: stage.title })).toBeVisible()
    await expect(item.getByText(stage.text)).toBeVisible()
    if (stage.live) await expect(item.getByText('In this demo')).toBeVisible()
    else await expect(item.getByText('In this demo')).toHaveCount(0)
  }

  await expect(section.getByText(/pre-built 3D property model/i)).toBeVisible()
  await expect(section.getByText(/digital-twin concept/i)).toBeVisible()
  await expect(section.getByText(/scripted flags/i)).toBeVisible()
  await expect(section.getByText(/not a playable stage/i)).toBeVisible()
  await expect(section.getByText(/automatic defect detection/i)).toBeVisible()

  const img = section.locator('img')
  await expect(img).toHaveAttribute('alt', /Fictional illustrative overview of a residential house-inspection concept/i)
  await expect(img).toHaveAttribute('loading', 'lazy')
  const src = await img.getAttribute('src')
  const srcset = await section.locator('source').getAttribute('srcset')
  expect(src, 'PNG fallback must stay relative for GitHub Pages /Xr-skilllab/').toBe('../../assets/process/05-twininspect.png')
  expect(srcset, 'WebP must stay relative for GitHub Pages /Xr-skilllab/').toBe('../../assets/process/05-twininspect.webp')
  expect(src!.startsWith('/')).toBe(false)
  expect(srcset!.startsWith('/')).toBe(false)
  const png = await page.request.get(new URL(src!, page.url()).href)
  const webp = await page.request.get(new URL(srcset!, page.url()).href)
  expect(png.ok(), src!).toBeTruthy()
  expect(webp.ok(), srcset!).toBeTruthy()
  expect(png.headers()['content-type']).toContain('image/png')
  expect(webp.headers()['content-type'] || '').toMatch(/image\/webp|application\/octet-stream/)

  const contained = await img.evaluate((el) => getComputedStyle(el).objectFit)
  expect(contained).toBe('contain')

  const cta = section.getByRole('link', { name: 'Explore this stage in 3D' })
  await expect(cta).toHaveAttribute('href', '#demo')
  const processTop = await section.evaluate((el) => el.getBoundingClientRect().top)
  const demoTop = await demo.evaluate((el) => el.getBoundingClientRect().top)
  expect(processTop).toBeLessThan(demoTop)

  await cta.click()
  await expect(demo.getByRole('heading', { name: /12 Wattle Lane/i })).toBeInViewport()
  await expect(demo.locator('canvas')).toBeVisible({ timeout: 20000 })
})

test('TwinInspect process journey has no page overflow and stacks below 768', async ({ page }) => {
  test.setTimeout(90000)
  await page.goto('/samples/twininspect/')
  await expect(page.locator('#process')).toBeVisible({ timeout: 20000 })

  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    const box = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      columns: getComputedStyle(document.querySelector('#process .process-journey')!).gridTemplateColumns,
    }))
    expect(box.scrollWidth, `${width}: ${box.scrollWidth}px inside ${box.clientWidth}px`).toBeLessThanOrEqual(box.clientWidth)
    const tracks = box.columns.split(' ').filter(Boolean)
    expect(tracks.length, `${width} tracks: ${box.columns}`).toBe(width < 768 ? 1 : 8)
  }
})

test('TwinInspect process chevrons stay static under reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/samples/twininspect/')
  await expect(page.locator('#process')).toBeVisible({ timeout: 20000 })
  const motion = await page.locator('#process .process-stage').first().evaluate((el) => {
    const cs = getComputedStyle(el, '::after')
    return { name: cs.animationName, duration: cs.animationDuration, transition: cs.transitionDuration }
  })
  expect(motion.name === 'none' || motion.duration === '0s' || motion.duration === '0.01ms').toBe(true)
})
