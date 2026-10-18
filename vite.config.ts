import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// GitHub Pages project sites use the repository name as the path.
// The name is case-sensitive: https://tracynguyen01.github.io/Xr-skilllab/
const pagesBase = '/Xr-skilllab/'

export default defineConfig({
  base: pagesBase,
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
    css: true,
    restoreMocks: true,
  },
})
