/**
 * Shared scene UI for lesson simulations.
 * - Skippable briefing in a native <dialog>
 * - Compact status panel (collapses to a drawer on small screens)
 * No npm dependencies. Oil & Gas is the first lesson that uses this.
 */

const STORAGE_PREFIX = 'xr-scene-briefing:'

/**
 * @param {object} options
 * @param {HTMLElement} options.host - Empty element inside the simulation overlay
 * @param {string} options.lessonId - Used for sessionStorage, e.g. "oil-gas"
 * @param {string} [options.accent]
 * @param {string} options.siteName - Short fictional-site label
 * @param {string} options.objective
 * @param {{ mouse: string, touch: string, keyboard: string }} options.controls
 * @param {string} options.howToFinish
 * @param {() => void} [options.focusAfterBriefing] - Focus the scene when the first-load briefing closes
 */
export function createSceneUi(options) {
  const {
    host,
    lessonId,
    accent = '#F2B544',
    siteName,
    objective,
    controls,
    howToFinish,
    focusAfterBriefing,
  } = options

  if (!host) throw new Error('createSceneUi needs a host element')

  const storageKey = STORAGE_PREFIX + lessonId
  let lastFocus = null
  let active = false

  const root = document.createElement('div')
  root.className = 'scene-ui-root'
  root.hidden = true
  root.style.setProperty('--scene-accent', accent)

  // —— Briefing dialog ——
  const dialog = document.createElement('dialog')
  dialog.className = 'scene-briefing'
  dialog.setAttribute('aria-labelledby', 'scene-briefing-title')
  dialog.style.setProperty('--scene-accent', accent)
  dialog.innerHTML = `
    <div class="scene-briefing-inner">
      <p class="eyebrow">Briefing</p>
      <h2 id="scene-briefing-title">Before you start</h2>
      <h3>Fictional site</h3>
      <p class="site-name"></p>
      <h3>Objective</h3>
      <p class="objective"></p>
      <h3>Controls</h3>
      <ul class="controls-list">
        <li data-control="mouse"></li>
        <li data-control="touch"></li>
        <li data-control="keyboard"></li>
      </ul>
      <h3>How to finish</h3>
      <p class="how-finish"></p>
      <div class="scene-briefing-actions">
        <button type="button" class="scene-btn scene-btn-primary" data-action="start">Start</button>
        <button type="button" class="scene-btn scene-btn-secondary" data-action="skip">Skip</button>
      </div>
    </div>
  `
  dialog.querySelector('.site-name').textContent = siteName
  dialog.querySelector('.objective').textContent = objective
  dialog.querySelector('[data-control="mouse"]').textContent = `Mouse: ${controls.mouse}`
  dialog.querySelector('[data-control="touch"]').textContent = `Touch: ${controls.touch}`
  dialog.querySelector('[data-control="keyboard"]').textContent = `Keyboard: ${controls.keyboard}`
  dialog.querySelector('.how-finish').textContent = howToFinish

  // —— Status panel ——
  const status = document.createElement('section')
  status.className = 'scene-status'
  status.setAttribute('aria-label', 'Scenario status')
  status.dataset.collapsed = 'false'
  status.innerHTML = `
    <div class="scene-status-bar">
      <strong>Status</strong>
      <div class="scene-status-tools">
        <button type="button" class="scene-icon-btn" data-action="help" aria-label="Open briefing" title="Briefing">?</button>
        <button type="button" class="scene-icon-btn" data-action="toggle" aria-expanded="true" aria-controls="scene-status-body" aria-label="Collapse status panel">▾</button>
      </div>
    </div>
    <div class="scene-status-body" id="scene-status-body">
      <dl>
        <div>
          <dt>Objective</dt>
          <dd data-field="objective"></dd>
        </div>
        <div>
          <dt>Progress</dt>
          <dd data-field="progress"></dd>
        </div>
        <div>
          <dt>Selected</dt>
          <dd data-field="selected" class="muted"></dd>
        </div>
        <div>
          <dt>Actions</dt>
          <dd><ul class="scene-actions" data-field="actions"></ul></dd>
        </div>
      </dl>
    </div>
  `

  // Keep the status panel inside the sim host. Put the native <dialog> on
  // document.body so it is not trapped under pointer-events: none ancestors.
  root.append(status)
  host.replaceChildren(root)
  document.body.append(dialog)

  const objectiveEl = status.querySelector('[data-field="objective"]')
  const progressEl = status.querySelector('[data-field="progress"]')
  const selectedEl = status.querySelector('[data-field="selected"]')
  const actionsEl = status.querySelector('[data-field="actions"]')
  const toggleBtn = status.querySelector('[data-action="toggle"]')
  const helpBtn = status.querySelector('[data-action="help"]')

  objectiveEl.textContent = objective

  function remembered() {
    try {
      return sessionStorage.getItem(storageKey) === '1'
    } catch {
      return false
    }
  }

  function remember() {
    try {
      sessionStorage.setItem(storageKey, '1')
    } catch {
      /* private mode — briefing can still be skipped for this visit */
    }
  }

  function setCollapsed(collapsed) {
    status.dataset.collapsed = collapsed ? 'true' : 'false'
    toggleBtn.setAttribute('aria-expanded', collapsed ? 'false' : 'true')
    toggleBtn.setAttribute('aria-label', collapsed ? 'Expand status panel' : 'Collapse status panel')
    toggleBtn.textContent = collapsed ? '▸' : '▾'
  }

  // On phone-width viewports, start collapsed so the drawer does not cover the scene.
  const narrow = window.matchMedia('(max-width: 430px)')
  function syncNarrow() {
    if (narrow.matches) setCollapsed(true)
  }
  syncNarrow()
  narrow.addEventListener('change', syncNarrow)

  function focusIsUseful(el) {
    if (!(el instanceof HTMLElement)) return false
    if (el === document.body || el === document.documentElement) return false
    if (!document.contains(el)) return false
    if (el.closest('.scene-briefing')) return false
    // Hidden intro controls (display:none) must not keep focus after Start/Skip.
    if (el.offsetParent === null && el.getClientRects().length === 0) return false
    return true
  }

  function restoreFocus() {
    const target = lastFocus
    lastFocus = null
    // Re-opened from "?" → put focus back on that control.
    if (target === helpBtn || (target && status.contains(target))) {
      helpBtn.focus()
      return
    }
    if (focusIsUseful(target)) {
      target.focus()
      return
    }
    // First-load briefing (no opener): hand focus to the 3D canvas or 2D list.
    focusAfterBriefing?.()
  }

  function closeBriefing() {
    if (!dialog.open) return
    dialog.close()
    restoreFocus()
  }

  function openBriefing() {
    lastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    if (!dialog.open) dialog.showModal()
    // On small screens the dialog can open scrolled mid-way; pin to the top label.
    const inner = dialog.querySelector('.scene-briefing-inner')
    if (inner) inner.scrollTop = 0
    dialog.querySelector('.eyebrow')?.scrollIntoView({ block: 'start', inline: 'nearest' })
    const start = dialog.querySelector('[data-action="start"]')
    start?.focus()
  }

  function finishBriefing() {
    remember()
    closeBriefing()
  }

  dialog.querySelector('[data-action="start"]').addEventListener('click', finishBriefing)
  dialog.querySelector('[data-action="skip"]').addEventListener('click', finishBriefing)
  helpBtn.addEventListener('click', () => openBriefing())
  toggleBtn.addEventListener('click', () => {
    setCollapsed(status.dataset.collapsed !== 'true')
  })

  // Native Esc fires "cancel" then closes. Restore focus on the next frame.
  dialog.addEventListener('cancel', () => {
    requestAnimationFrame(() => restoreFocus())
  })

  // The lesson page also listens for Escape (to exit the sim). Stop that while we are open.
  document.addEventListener(
    'keydown',
    (event) => {
      if (event.key === 'Escape' && dialog.open) event.stopPropagation()
    },
    true,
  )

  // Clicks/drags on the panel must not rotate the 3D camera underneath.
  for (const name of ['pointerdown', 'pointermove', 'pointerup', 'wheel', 'touchstart', 'mousedown']) {
    status.addEventListener(name, (event) => event.stopPropagation())
  }

  function setActive(next) {
    active = !!next
    root.hidden = !active
    if (!active && dialog.open) closeBriefing()
  }

  function showBriefingIfNeeded() {
    if (!active) return
    if (remembered()) return
    openBriefing()
  }

  /**
   * @param {{ progressText: string, selected: string, actions: string[], objective?: string }} state
   */
  function updateStatus(state) {
    if (state.objective) objectiveEl.textContent = state.objective
    progressEl.textContent = state.progressText
    selectedEl.textContent = state.selected || 'None selected'
    selectedEl.classList.toggle('muted', !state.selected || state.selected === 'None selected')
    actionsEl.replaceChildren()
    for (const line of state.actions || []) {
      const li = document.createElement('li')
      li.textContent = line
      actionsEl.append(li)
    }
  }

  function destroy() {
    narrow.removeEventListener('change', syncNarrow)
    if (dialog.open) dialog.close()
    dialog.remove()
    root.remove()
  }

  return {
    setActive,
    showBriefingIfNeeded,
    openBriefing,
    closeBriefing,
    updateStatus,
    destroy,
    /** @returns {boolean} */
    get briefingOpen() {
      return dialog.open
    },
  }
}

if (typeof window !== 'undefined') {
  window.createSceneUi = createSceneUi
}
