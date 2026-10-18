import { useEffect, useRef } from 'react'

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])'

/**
 * Moves focus into a dialog, traps Tab, closes on Escape, then returns focus
 * to the control that opened it. Mount-only so a parent re-render cannot
 * steal focus back to the page.
 */
export function useDialogFocus(onClose: () => void) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog.focus()

    function focusable(): HTMLElement[] {
      if (!dialog) return []
      return Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (element) => element.tabIndex !== -1,
      )
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()
        return
      }
      if (event.key !== 'Tab') return
      const items = focusable()
      if (items.length === 0) {
        event.preventDefault()
        return
      }
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement
      if (event.shiftKey && active === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first?.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
      if (previouslyFocused && document.contains(previouslyFocused)) previouslyFocused.focus()
    }
  }, [])

  return dialogRef
}
