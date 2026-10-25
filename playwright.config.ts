import { defineConfig, devices } from '@playwright/test'

const webglArgs = [
  '--disable-dev-shm-usage',
  '--use-gl=angle',
  '--use-angle=swiftshader',
  '--enable-webgl',
  '--ignore-gpu-blocklist',
]

const noWebglArgs = ['--disable-dev-shm-usage', '--disable-webgl', '--disable-3d-apis']

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  workers: process.env.CI ? 1 : undefined,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: 'http://127.0.0.1:4175',
    ...devices['Desktop Chrome'],
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: { args: webglArgs },
      },
    },
    {
      // Forces the 2D fallback path — createView fails and demos set webgl:false.
      name: 'chromium-no-webgl',
      testMatch: /a11y-responsive\.spec\.ts/,
      grep: /without WebGL/,
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: { args: noWebglArgs },
      },
    },
  ],
  webServer: {
    command: 'npx serve dist -l 4175 --no-request-logging',
    url: 'http://127.0.0.1:4175',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
