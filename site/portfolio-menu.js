const GROUP_ORDER = ['training', 'inspection']

function groupLabel(id) {
  if (id === 'training') return 'Industry training'
  if (id === 'inspection') return 'Inspection'
  return id
}

function lessonUrl(href) {
  return new URL(href, new URL('./', import.meta.url)).href
}

function grouped(samples) {
  const buckets = new Map()
  for (const sample of samples) {
    const id = sample.group || 'training'
    if (!buckets.has(id)) buckets.set(id, [])
    buckets.get(id).push(sample)
  }
  return [...buckets.keys()]
    .sort((a, b) => {
      const ia = GROUP_ORDER.indexOf(a)
      const ib = GROUP_ORDER.indexOf(b)
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
    })
    .map((id) => ({ id, title: groupLabel(id), items: buckets.get(id) }))
}

function chevron() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('width', '14')
  svg.setAttribute('height', '14')
  svg.setAttribute('viewBox', '0 0 14 14')
  svg.setAttribute('aria-hidden', 'true')
  svg.setAttribute('class', 'menu-chevron')
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  path.setAttribute('d', 'M5 3l4 4-4 4')
  path.setAttribute('fill', 'none')
  path.setAttribute('stroke', 'currentColor')
  path.setAttribute('stroke-width', '1.6')
  path.setAttribute('stroke-linecap', 'round')
  path.setAttribute('stroke-linejoin', 'round')
  svg.append(path)
  return svg
}

function narrow() {
  return window.matchMedia('(max-width: 720px)').matches
}

function canHover() {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
}

export function mountFieldsMenu(host, samples) {
  if (!host || host.dataset.mounted === 'true') return
  host.dataset.mounted = 'true'
  host.replaceChildren()

  const menuBtn = document.createElement('button')
  menuBtn.type = 'button'
  menuBtn.className = 'menu-toggle'
  menuBtn.setAttribute('aria-expanded', 'false')
  menuBtn.setAttribute('aria-controls', 'site-menu')
  menuBtn.setAttribute('aria-haspopup', 'true')
  const menuLabel = document.createElement('span')
  menuLabel.textContent = 'Menu'
  menuBtn.append(menuLabel, chevron())

  const panel = document.createElement('div')
  panel.id = 'site-menu'
  panel.className = 'menu-panel'
  panel.hidden = true

  const fields = document.createElement('div')
  fields.className = 'fields'

  const fieldsBtn = document.createElement('button')
  fieldsBtn.type = 'button'
  fieldsBtn.className = 'fields-toggle'
  fieldsBtn.setAttribute('aria-expanded', 'false')
  fieldsBtn.setAttribute('aria-controls', 'fields-submenu')
  fieldsBtn.setAttribute('aria-haspopup', 'true')
  const fieldsLabel = document.createElement('span')
  fieldsLabel.textContent = 'Fields'
  fieldsBtn.append(fieldsLabel, chevron())

  const submenu = document.createElement('div')
  submenu.id = 'fields-submenu'
  submenu.className = 'fields-panel'
  submenu.hidden = true
  submenu.setAttribute('role', 'navigation')
  submenu.setAttribute('aria-label', 'Fields')

  for (const group of grouped(samples)) {
    const block = document.createElement('div')
    block.className = 'field-group'
    const label = document.createElement('p')
    label.className = 'field-label'
    label.id = `field-${group.id}`
    label.textContent = group.title
    const list = document.createElement('ul')
    list.className = 'field-list'
    list.setAttribute('aria-labelledby', label.id)
    for (const sample of group.items) {
      const item = document.createElement('li')
      const link = document.createElement('a')
      link.className = 'field-link'
      link.href = lessonUrl(sample.href)
      // Title plus a one-line description (tagline) for every lesson.
      const title = document.createElement('span')
      title.className = 'field-title'
      title.textContent = sample.title
      const tagline = document.createElement('span')
      tagline.className = 'field-tagline'
      tagline.textContent = sample.tagline
      link.append(title, tagline)
      item.append(link)
      list.append(item)
    }
    block.append(label, list)
    submenu.append(block)
  }

  fields.append(fieldsBtn, submenu)
  panel.append(fields)
  host.append(menuBtn, panel)

  let menuOpen = false
  let fieldsOpen = false
  let pinned = false
  let armedByHover = false

  function layoutPanel() {
    if (!menuOpen || !narrow()) {
      panel.style.top = ''
      return
    }
    const header = [...document.querySelectorAll('header')].find((el) => el.getClientRects().length > 0)
    const bottom = header ? header.getBoundingClientRect().bottom : 62
    panel.style.top = `${Math.round(bottom + 8)}px`
  }

  function openFields({ pin = false } = {}) {
    if (pin) pinned = true
    fieldsOpen = true
    fields.classList.add('is-open')
    submenu.hidden = false
    fieldsBtn.setAttribute('aria-expanded', 'true')
  }

  function closeFields() {
    fieldsOpen = false
    pinned = false
    armedByHover = false
    fields.classList.remove('is-open')
    submenu.hidden = true
    fieldsBtn.setAttribute('aria-expanded', 'false')
  }

  function openMenu() {
    menuOpen = true
    panel.hidden = false
    menuBtn.setAttribute('aria-expanded', 'true')
    layoutPanel()
    fieldsBtn.focus()
  }

  function closeMenu({ focusToggle = false } = {}) {
    closeFields()
    menuOpen = false
    panel.hidden = true
    menuBtn.setAttribute('aria-expanded', 'false')
    panel.style.top = ''
    if (focusToggle) menuBtn.focus()
  }

  menuBtn.addEventListener('click', () => {
    if (menuOpen) closeMenu()
    else openMenu()
  })

  fieldsBtn.addEventListener('click', () => {
    if (armedByHover) {
      armedByHover = false
      openFields({ pin: true })
      return
    }
    if (fieldsOpen) closeFields()
    else openFields({ pin: true })
  })

  fields.addEventListener('pointerenter', () => {
    if (!menuOpen || !canHover() || narrow()) return
    if (fieldsOpen) return
    openFields()
    armedByHover = true
  })

  fields.addEventListener('pointerleave', () => {
    if (!canHover() || narrow() || pinned) return
    closeFields()
  })

  fieldsBtn.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowRight') return
    event.preventDefault()
    openFields({ pin: true })
    submenu.querySelector('a')?.focus()
  })

  submenu.addEventListener('keydown', (event) => {
    const links = [...submenu.querySelectorAll('a')]
    const index = links.indexOf(document.activeElement)
    if (event.key === 'ArrowDown' && links.length) {
      event.preventDefault()
      links[(index + 1 + links.length) % links.length].focus()
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (index <= 0) fieldsBtn.focus()
      else links[index - 1].focus()
    } else if (event.key === 'ArrowLeft' && !narrow()) {
      event.preventDefault()
      closeFields()
      fieldsBtn.focus()
    }
  })

  host.addEventListener('focusout', (event) => {
    if (!menuOpen) return
    if (host.contains(event.relatedTarget)) return
    closeMenu()
  })

  document.addEventListener('pointerdown', (event) => {
    if (!menuOpen || host.contains(event.target)) return
    closeMenu()
  })

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !menuOpen) return
    event.preventDefault()
    if (fieldsOpen) {
      closeFields()
      fieldsBtn.focus()
      return
    }
    closeMenu({ focusToggle: true })
  })

  window.addEventListener('resize', layoutPanel)
}

async function loadSamples() {
  const response = await fetch(new URL('samples.json', import.meta.url))
  if (!response.ok) throw new Error('missing list')
  const samples = await response.json()
  if (!Array.isArray(samples) || samples.length === 0) throw new Error('empty list')
  return samples
}

function ensureMenuCss() {
  if (document.querySelector('link[data-portfolio-menu]')) return
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = new URL('menu.css', import.meta.url).href
  link.setAttribute('data-portfolio-menu', '')
  document.head.append(link)
}

function bootSampleMenu() {
  // Sample pages replace the Fable shell before the header is ready.
  // Wait for that, mount the menu once, then stop watching.
  let started = false
  let poll = 0
  let observer = null

  const stopWaiting = () => {
    observer?.disconnect()
    window.clearInterval(poll)
  }

  const tryMount = () => {
    if (started) return true
    if (document.querySelector('x-dc')) return false
    if (!document.querySelector('header nav')) return false
    started = true
    const host = document.createElement('div')
    host.className = 'portfolio-menu is-sample'
    host.setAttribute('data-portfolio-menu-host', '')
    document.body.append(host)
    document.body.classList.add('portfolio-has-menu')
    ensureMenuCss()
    loadSamples().then((samples) => mountFieldsMenu(host, samples)).catch(() => {
      host.replaceChildren()
    })
    return true
  }

  if (tryMount()) return

  observer = new MutationObserver(() => {
    if (tryMount()) stopWaiting()
  })
  observer.observe(document.documentElement, { childList: true, subtree: true })
  poll = window.setInterval(() => {
    if (tryMount()) stopWaiting()
  }, 200)
  // Give up after 15 seconds so a stuck page does not keep polling.
  window.setTimeout(() => window.clearInterval(poll), 15000)
}

if (!document.querySelector('[data-portfolio-menu-host]')) bootSampleMenu()
