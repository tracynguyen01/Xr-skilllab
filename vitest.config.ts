import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['worker/test/**/*.ts', 'site/samples/**/*.test.js'],
    environment: 'node',
  },
})
