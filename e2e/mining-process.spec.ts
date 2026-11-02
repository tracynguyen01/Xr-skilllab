import { expect, test } from '@playwright/test'

const stages = [
  { title: 'Exploration and mine planning', text: 'Assess the deposit and plan the mine layout.', live: false },
  { title: 'Drill and blast', text: 'Prepare rock for excavation under an approved mine plan.', live: false },
  { title: 'Load and haul', text: 'Move excavated material from the pit.', live: true },
  {
    title: 'Crush and process',
    text: 'Reduce and process material to recover the target product; exact processing varies by commodity.',
    live: true,
  },
  { title: 'Stockpile and transport', text: 'Store and move product to the next stage or market.', live: false },
  { title: 'Rehabilitation and closure', text: 'Progressively rehabilitate disturbed areas and plan for closure.', live: false },
]

test('Mining end-to-end process journey sits above the 3D demo', async ({ page }) => {
  test.setTimeout(90000)
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/samples/mining/')
  await expect(page.getByRole('heading', { level: 1, name: /Learn by doing/i })).toBeVisible({ timeout: 20000 })

  const section = page.locator('#process')
  const demo = page.locator('#demo')
  await expect(section.getByRole('heading', { level: 2, name: 'End-to-end process' })).toBeVisible()
  await expect(section.getByText(/fictional illustrative educational overview of an open-cut mining concept/i)).toBeVisible()
  await expect(section.getByText(/not a real mine procedure, a certification, AI coaching, or a live digital twin/i)).toBeVisible()

  const items = section.getByRole('listitem')
  await expect(items).toHaveCount(6)
  for (const [index, stage] of stages.entries()) {
    const item = items.nth(index)
    await expect(item.getByRole('heading', { level: 3, name: stage.title })).toBeVisible()
    await expect(item.getByText(stage.text)).toBeVisible()
    if (stage.live) await expect(item.getByText('In this 3D scene')).toBeVisible()
    else await expect(item.getByText('In this 3D scene')).toHaveCount(0)
  }

  const img = section.locator('img')
  await expect(img).toHaveAttribute('alt', /Fictional illustrative overview of an open-cut mining concept/i)
  await expect(img).toHaveAttribute('loading', 'lazy')
  const src = await img.getAttribute('src')
  const srcset = await section.locator('source').getAttribute('srcset')
  expect(src, 'PNG fallback must stay relative for GitHub Pages /Xr-skilllab/').toBe('../../assets/process/03-mining.png')
  expect(srcset, 'WebP must stay relative for GitHub Pages /Xr-skilllab/').toBe('../../assets/process/03-mining.webp')
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
  await expect(demo.getByRole('heading', { name: 'The Simulation' })).toBeInViewport()
  await expect(demo.locator('canvas')).toBeVisible({ timeout: 20000 })
})

test('Mining process journey has no page overflow and stacks below 768', async ({ page }) => {
  test.setTimeout(90000)
  await page.goto('/samples/mining/')
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
    expect(tracks.length, `${width} tracks: ${box.columns}`).toBe(width < 768 ? 1 : 6)
  }
})

test('Mining process chevrons stay static under reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/samples/mining/')
  await expect(page.locator('#process')).toBeVisible({ timeout: 20000 })
  const motion = await page.locator('#process .process-stage').first().evaluate((el) => {
    const cs = getComputedStyle(el, '::after')
    return { name: cs.animationName, duration: cs.animationDuration, transition: cs.transitionDuration }
  })
  expect(motion.name === 'none' || motion.duration === '0s' || motion.duration === '0.01ms').toBe(true)
})
