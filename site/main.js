import { mountFieldsMenu } from './portfolio-menu.js'

const mount = document.querySelector('#lesson-carousel')
const status = document.querySelector('#demo-status')
const menuHost = document.querySelector('[data-portfolio-menu-host]')
const DELAY = 5000

function groupLabel(sample) {
  return sample.group === 'inspection' ? 'Inspection' : 'Industry training'
}

function picture(sample) {
  const frame = document.createElement('picture')
  if (typeof sample.thumbnail === 'string' && sample.thumbnail.endsWith('.webp')) {
    const source = document.createElement('source')
    source.type = 'image/avif'
    source.srcset = sample.thumbnail.replace(/\.webp$/, '.avif')
    frame.append(source)
  }
  const image = document.createElement('img')
  image.src = sample.thumbnail
  image.alt = ''
  image.width = 1600
  image.height = 1000
  image.decoding = 'async'
  image.draggable = false
  frame.append(image)
  return frame
}

function arrow(direction) {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'carousel-arrow'
  button.dataset.dir = direction
  button.setAttribute('aria-label', direction === 'next' ? 'Next lesson' : 'Previous lesson')
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('width', '18')
  svg.setAttribute('height', '18')
  svg.setAttribute('viewBox', '0 0 18 18')
  svg.setAttribute('aria-hidden', 'true')
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  path.setAttribute('d', direction === 'next' ? 'M7 4l5 5-5 5' : 'M11 4 6 9l5 5')
  path.setAttribute('fill', 'none')
  path.setAttribute('stroke', 'currentColor')
  path.setAttribute('stroke-width', '1.8')
  path.setAttribute('stroke-linecap', 'round')
  path.setAttribute('stroke-linejoin', 'round')
  svg.append(path)
  button.append(svg)
  return button
}

function mountCarousel(samples) {
  const carousel = document.createElement('div')
  carousel.className = 'carousel is-forward'
  carousel.setAttribute('role', 'region')
  carousel.setAttribute('aria-roledescription', 'carousel')
  carousel.setAttribute('aria-labelledby', 'demos-title')

  const stage = document.createElement('div')
  stage.className = 'carousel-stage'

  const live = document.createElement('p')
  live.className = 'visually-hidden'
  live.setAttribute('aria-live', 'polite')

  const controls = document.createElement('div')
  controls.className = 'carousel-controls'
  const tabs = document.createElement('div')
  tabs.className = 'carousel-tabs'
  tabs.setAttribute('role', 'tablist')
  tabs.setAttribute('aria-label', 'Lessons')
  const prev = arrow('prev')
  const next = arrow('next')
  controls.append(prev, tabs, next)

  const slides = samples.map((sample, index) => {
    const slide = document.createElement('article')
    slide.className = 'slide'
    slide.id = `lesson-panel-${sample.slug}`
    slide.setAttribute('role', 'tabpanel')
    slide.setAttribute('aria-labelledby', `lesson-tab-${sample.slug}`)
    slide.style.setProperty('--accent', sample.accent)
    if (index !== 0) {
      slide.setAttribute('aria-hidden', 'true')
      slide.inert = true
    } else {
      slide.classList.add('is-active')
    }

    const link = document.createElement('a')
    link.className = 'slide-link'
    link.href = sample.href
    link.draggable = false

    const shot = document.createElement('div')
    shot.className = 'shot'
    shot.append(picture(sample))

    const copy = document.createElement('div')
    copy.className = 'copy'
    const kicker = document.createElement('span')
    kicker.className = 'eyebrow'
    kicker.textContent = groupLabel(sample)
    const title = document.createElement('h3')
    title.textContent = sample.title
    const tagline = document.createElement('p')
    tagline.className = 'tagline'
    tagline.textContent = sample.tagline
    const pitch = document.createElement('p')
    pitch.className = 'pitch'
    pitch.textContent = sample.pitch || sample.tagline
    const tagList = document.createElement('ul')
    tagList.className = 'tags'
    for (const tag of sample.tags || []) {
      const item = document.createElement('li')
      item.textContent = tag
      tagList.append(item)
    }
    const cta = document.createElement('span')
    cta.className = 'cta'
    cta.textContent = 'Open the demo'
    copy.append(kicker, title, tagline, pitch, tagList, cta)
    link.append(shot, copy)
    slide.append(link)

    const tab = document.createElement('button')
    tab.type = 'button'
    tab.className = 'carousel-tab'
    tab.id = `lesson-tab-${sample.slug}`
    tab.setAttribute('role', 'tab')
    tab.setAttribute('aria-controls', slide.id)
    tab.setAttribute('aria-selected', index === 0 ? 'true' : 'false')
    tab.tabIndex = index === 0 ? 0 : -1
    tab.textContent = sample.title
    tab.style.setProperty('--accent', sample.accent)
    tabs.append(tab)
    return { slide, tab, sample }
  })

  for (const { slide } of slides) stage.append(slide)
  carousel.append(stage, live, controls)
  mount.append(carousel)
  carousel.style.setProperty('--accent', samples[0].accent)

  let index = 0
  let timer = 0
  let hovering = false
  let focused = false
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)')

  function paused() {
    return hovering || focused || document.hidden || motion.matches
  }

  function announce() {
    const sample = slides[index].sample
    live.textContent = `Showing ${sample.title}, ${index + 1} of ${slides.length}`
  }

  function paint(next, direction) {
    const current = slides[index]
    const dest = slides[next]
    if (current === dest) return
    carousel.classList.toggle('is-back', direction === 'back')
    carousel.classList.toggle('is-forward', direction !== 'back')
    dest.slide.classList.add('is-prep')
    void dest.slide.offsetWidth
    current.slide.classList.remove('is-active')
    current.slide.classList.add('is-leaving')
    current.slide.setAttribute('aria-hidden', 'true')
    current.slide.inert = true
    current.tab.setAttribute('aria-selected', 'false')
    current.tab.tabIndex = -1
    dest.slide.classList.remove('is-prep')
    dest.slide.classList.add('is-active')
    dest.slide.removeAttribute('aria-hidden')
    dest.slide.inert = false
    dest.tab.setAttribute('aria-selected', 'true')
    dest.tab.tabIndex = 0
    carousel.style.setProperty('--accent', dest.sample.accent)
    const leaving = current.slide
    window.setTimeout(() => leaving.classList.remove('is-leaving'), motion.matches ? 0 : 600)
    index = next
    announce()
  }

  function schedule() {
    window.clearTimeout(timer)
    timer = 0
    if (paused()) return
    timer = window.setTimeout(() => go(index + 1), DELAY)
  }

  function go(next) {
    const count = slides.length
    const dest = (next % count + count) % count
    if (dest !== index) {
      const forward = (dest - index + count) % count <= count / 2
      paint(dest, forward ? 'forward' : 'back')
    }
    schedule()
  }

  function sync() {
    if (paused()) window.clearTimeout(timer)
    else schedule()
  }

  prev.addEventListener('click', () => go(index - 1))
  next.addEventListener('click', () => go(index + 1))
  slides.forEach(({ tab }, tabIndex) => {
    tab.addEventListener('click', () => go(tabIndex))
    tab.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft' && event.key !== 'Home' && event.key !== 'End') return
      event.preventDefault()
      if (event.key === 'Home') go(0)
      else if (event.key === 'End') go(slides.length - 1)
      else go(index + (event.key === 'ArrowRight' ? 1 : -1))
      slides[(index + slides.length) % slides.length].tab.focus()
    })
  })

  carousel.addEventListener('keydown', (event) => {
    if (event.target.closest('.carousel-tabs')) return
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
    event.preventDefault()
    go(index + (event.key === 'ArrowRight' ? 1 : -1))
  })

  carousel.addEventListener('pointerenter', () => {
    hovering = true
    sync()
  })
  carousel.addEventListener('pointerleave', () => {
    hovering = false
    sync()
  })
  // Pause auto-advance while a keyboard user is inside the carousel.
  carousel.addEventListener('focusin', () => {
    focused = true
    sync()
  })
  carousel.addEventListener('focusout', (event) => {
    if (carousel.contains(event.relatedTarget)) return
    focused = false
    sync()
  })
  document.addEventListener('visibilitychange', sync)
  motion.addEventListener('change', sync)

  let pointer = null
  const finishSwipe = (event) => {
    if (!pointer || pointer.id !== event.pointerId) return
    const dx = event.clientX - pointer.x
    const dy = event.clientY - pointer.y
    pointer = null
    if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy)) return
    const blockClick = (click) => {
      click.preventDefault()
      click.stopPropagation()
    }
    stage.addEventListener('click', blockClick, { capture: true, once: true })
    window.setTimeout(() => stage.removeEventListener('click', blockClick, true), 400)
    go(index + (dx < 0 ? 1 : -1))
  }
  stage.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY }
  })
  stage.addEventListener('pointerup', finishSwipe)
  window.addEventListener('pointerup', finishSwipe)
  stage.addEventListener('pointercancel', () => {
    pointer = null
  })

  announce()
  requestAnimationFrame(() => carousel.classList.add('is-ready'))
  schedule()
}

try {
  const response = await fetch('samples.json')
  if (!response.ok) throw new Error('missing list')
  const samples = await response.json()
  if (!Array.isArray(samples) || samples.length === 0) throw new Error('empty list')
  mountCarousel(samples)
  mountFieldsMenu(menuHost, samples)
} catch {
  status.classList.remove('visually-hidden')
  status.textContent = 'The lesson list could not be loaded.'
}
