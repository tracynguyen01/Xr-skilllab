/** Lights the 3D ring that matches a focused inspection-list button. No-op in 2D. */
export function highlightHotspot(id: string | null) {
  document.querySelectorAll<HTMLElement>('[data-hotspot]').forEach((node) => {
    const match = id !== null && node.getAttribute('data-hotspot') === id
    node.setAttribute('scale', match ? '1.22 1.22 1.22' : '1 1 1')
  })
}
