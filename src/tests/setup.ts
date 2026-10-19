import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach } from 'vitest'

const hasWindow = typeof window !== 'undefined'

beforeEach(() => {
  if (!hasWindow) return
  sessionStorage.clear()
  window.location.hash = '#/'
  window.scrollTo = () => {}
})

afterEach(() => {
  if (!hasWindow) return
  cleanup()
})
