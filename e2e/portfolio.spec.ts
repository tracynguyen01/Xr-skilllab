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

async function blurAndLeave(page: Page) {
  await page.mouse.move(8, 8)
  await page.evaluate(() => {
    const el = document.activeElement
    if (el instanceof HTMLElement) el.blur()
  })
}

const lessons = [
  { title: 'Warehouse Safety', heading: /learn by doing/i },
  { title: 'Oil & Gas', heading: /learn by doing/i },
  { title: 'Mining', heading: /learn by doing/i },
  { title: 'Chemical processing', heading: /learn by doing/i },
  { title: /TwinInspect/, heading: /inspect any home/i },
]

test('carousel advances and the fields menu reaches every lesson', async ({ page }) => {
  test.setTimeout(180000)
  const errors = watchConsole(page)
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1, name: /better decisions/i })).toBeVisible()
  await expect(page).toHaveTitle('XR Concept Lab')
  await expect(page.getByRole('banner').getByRole('link', { name: 'XR Concept Lab' })).toBeVisible()
  await expect(page.locator('footer')).toContainText('XR Concept Lab')
  await expect(page.getByRole('heading', { level: 2, name: /try a lesson/i })).toBeVisible()

  const carousel = page.getByRole('region', { name: /try a lesson/i })
  const active = carousel.locator('.slide.is-active')
  await expect(active.getByRole('heading', { level: 3, name: 'Warehouse Safety' })).toBeVisible()
  await expect(active.getByRole('link', { name: /Open the demo/ })).toHaveAttribute('href', /xr-skilllab/)

  await carousel.getByRole('button', { name: 'Next lesson' }).click()
  await expect(carousel.locator('.slide.is-active').getByRole('heading', { level: 3, name: 'Oil & Gas' })).toBeVisible()
  await carousel.getByRole('button', { name: 'Previous lesson' }).click()
  await expect(carousel.locator('.slide.is-active').getByRole('heading', { level: 3, name: 'Warehouse Safety' })).toBeVisible()

  await carousel.getByRole('tab', { name: 'Mining' }).click()
  await expect(carousel.locator('.slide.is-active').getByRole('heading', { level: 3, name: 'Mining' })).toBeVisible()
  await carousel.getByRole('tab', { name: 'Mining' }).focus()
  await page.keyboard.press('ArrowRight')
  await expect(carousel.locator('.slide.is-active').getByRole('heading', { level: 3, name: 'Chemical processing' })).toBeVisible()

  await carousel.locator('.slide.is-active .slide-link').focus()
  await page.keyboard.press('ArrowRight')
  await expect(carousel.locator('.slide.is-active').getByRole('heading', { level: 3, name: /TwinInspect/ })).toBeVisible()

  const stage = carousel.locator('.carousel-stage')
  await stage.scrollIntoViewIfNeeded()
  const box = await stage.boundingBox()
  if (!box) throw new Error('carousel stage has no box')
  await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.4)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.4, { steps: 12 })
  await page.mouse.up()
  await expect(page).toHaveURL(/\/$/)
  await expect(carousel.locator('.slide.is-active').getByRole('heading', { level: 3, name: 'Warehouse Safety' })).toBeVisible()

  await carousel.getByRole('tab', { name: 'Warehouse Safety' }).click()
  await blurAndLeave(page)
  await expect(carousel.locator('.slide.is-active').getByRole('heading', { level: 3, name: 'Oil & Gas' })).toBeVisible({ timeout: 8000 })
  await carousel.hover()
  await page.waitForTimeout(6500)
  await expect(carousel.locator('.slide.is-active').getByRole('heading', { level: 3, name: 'Oil & Gas' })).toBeVisible()

  await page.mouse.move(8, 8)
  const menu = page.getByRole('button', { name: 'Menu' })
  await expect(menu).toHaveAttribute('aria-expanded', 'false')
  await menu.click()
  await expect(menu).toHaveAttribute('aria-expanded', 'true')
  const fields = page.getByRole('button', { name: 'Fields' })
  await fields.hover()
  await expect(fields).toHaveAttribute('aria-expanded', 'true')
  await expect(page.locator('#fields-submenu a')).toHaveCount(5)
  const hrefs: string[] = []
  for (const lesson of lessons) {
    const link = page.locator('#fields-submenu').getByRole('link', { name: lesson.title })
    await expect(link).toBeVisible()
    const href = await link.evaluate((anchor) => (anchor as HTMLAnchorElement).href)
    expect(href, lesson.title).toBeTruthy()
    hrefs.push(href)
    const response = await page.request.get(href)
    expect(response.ok(), href).toBeTruthy()
  }
  await expectNoOverflow(page, 'home menu 1280')
  await page.keyboard.press('Escape')
  await expect(fields).toHaveAttribute('aria-expanded', 'false')
  await expect(menu).toHaveAttribute('aria-expanded', 'true')
  await page.keyboard.press('Escape')
  await expect(menu).toHaveAttribute('aria-expanded', 'false')
  await menu.click()
  await page.locator('.lede').click()
  await expect(menu).toHaveAttribute('aria-expanded', 'false')
  await expectNoOverflow(page, 'home 1280')

  await page.setViewportSize({ width: 390, height: 844 })
  await expectNoOverflow(page, 'home 390')
  await menu.click()
  await fields.click()
  await expect(fields).toHaveAttribute('aria-expanded', 'true')
  await expect(page.locator('#fields-submenu').getByRole('link', { name: /TwinInspect/ })).toBeVisible()
  for (const lesson of lessons) {
    const link = page.locator('#fields-submenu').getByRole('link', { name: lesson.title })
    await expect(link.locator('.field-tagline')).toBeVisible()
    await expect(link.locator('.field-tagline')).not.toHaveText('')
  }
  await expectNoOverflow(page, 'home menu 390')
  await page.keyboard.press('Escape')
  await page.keyboard.press('Escape')

  await page.setViewportSize({ width: 1280, height: 900 })
  await menu.click()
  await fields.click()
  await page.locator('#fields-submenu').getByRole('link', { name: 'Warehouse Safety' }).click()
  await expect(page.getByRole('heading', { level: 1, name: /learn by doing/i })).toBeVisible({ timeout: 20000 })
  await expect(page.getByRole('link', { name: 'Back to all demos' })).toBeVisible()

  for (const [index, lesson] of lessons.entries()) {
    await page.goto(hrefs[index])
    await expect(page.getByRole('heading', { level: 1, name: lesson.heading })).toBeVisible({ timeout: 20000 })
    await expect(page.getByRole('link', { name: 'Back to all demos' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Menu' })).toBeVisible({ timeout: 20000 })
    await expectNoOverflow(page, `${lesson.title} 1280`)
    await page.setViewportSize({ width: 390, height: 844 })
    await expect(page.getByRole('button', { name: 'Menu' })).toBeVisible()
    await expectNoOverflow(page, `${lesson.title} 390`)
    await page.setViewportSize({ width: 1280, height: 900 })
    expect(errors, errors.join('\n')).toEqual([])
  }
})

test('keyboard focus inside the carousel pauses rotation', async ({ page }) => {
  test.setTimeout(60000)
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/')
  const carousel = page.getByRole('region', { name: /try a lesson/i })
  await expect(carousel.locator('.slide.is-active').getByRole('heading', { level: 3, name: 'Warehouse Safety' })).toBeVisible()
  await carousel.getByRole('tab', { name: 'Warehouse Safety' }).focus()
  await page.waitForTimeout(6500)
  await expect(carousel.locator('.slide.is-active').getByRole('heading', { level: 3, name: 'Warehouse Safety' })).toBeVisible()
})

test('the menu opens and closes with Enter and Escape', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/')
  const menu = page.getByRole('button', { name: 'Menu' })
  await menu.focus()
  await page.keyboard.press('Enter')
  await expect(menu).toHaveAttribute('aria-expanded', 'true')
  // Escape closes the panel and puts focus back on Menu.
  await page.keyboard.press('Escape')
  await expect(menu).toHaveAttribute('aria-expanded', 'false')
  await expect(menu).toBeFocused()
  // Enter toggles the same button open, then closed again.
  await page.keyboard.press('Enter')
  await expect(menu).toHaveAttribute('aria-expanded', 'true')
  await menu.focus()
  await page.keyboard.press('Enter')
  await expect(menu).toHaveAttribute('aria-expanded', 'false')
})

test('the carousel stays put when reduced motion is requested', async ({ page }) => {
  test.setTimeout(60000)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/')
  const carousel = page.getByRole('region', { name: /try a lesson/i })
  await expect(carousel.locator('.slide.is-active').getByRole('heading', { level: 3, name: 'Warehouse Safety' })).toBeVisible()
  await blurAndLeave(page)
  await page.waitForTimeout(6500)
  await expect(carousel.locator('.slide.is-active').getByRole('heading', { level: 3, name: 'Warehouse Safety' })).toBeVisible()
  await carousel.getByRole('button', { name: 'Next lesson' }).click()
  await expect(carousel.locator('.slide.is-active').getByRole('heading', { level: 3, name: 'Oil & Gas' })).toBeVisible()
})

test('How it works scrolls to the section', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/')
  const link = page.getByRole('link', { name: 'How it works' })
  await expect(link).toHaveAttribute('href', '#how-it-works')
  await link.click()
  await expect(page).toHaveURL(/#how-it-works$/)
  const section = page.locator('#how-it-works')
  await expect(section.getByRole('heading', { level: 2, name: 'How it works' })).toBeVisible()
  const top = await section.evaluate((el) => el.getBoundingClientRect().top)
  expect(top).toBeGreaterThanOrEqual(50)
  expect(top).toBeLessThanOrEqual(100)
})

test('old hash routes stay on the portfolio home', async ({ page }) => {
  await page.goto('/#/simulate')
  await expect(page.getByRole('heading', { level: 1, name: /better decisions/i })).toBeVisible()
  await page.getByRole('button', { name: 'Menu' }).click()
  await page.getByRole('button', { name: 'Fields' }).click()
  await expect(page.locator('#fields-submenu').getByRole('link', { name: /Warehouse Safety/ })).toBeVisible()
})
