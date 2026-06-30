import {defineConfig, devices} from '@playwright/test'

// Acceptance tests drive the real stack: the Express API (4000) and the CRA
// dev server (3000), against a MongoDB on 127.0.0.1:27017 (see ./README.md).
// Playwright starts both servers itself (unless they are already running) so
// `npm test` is a single command on a clean machine that has Mongo up.

const WEB_URL = process.env.E2E_BASE_URL || 'http://localhost:3000'
const reuse = !process.env.CI

export default defineConfig({
    testDir: './tests',
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    workers: 1,
    reporter: process.env.CI ? [['list'], ['html', {open: 'never'}]] : 'list',
    timeout: 30_000,
    expect: {timeout: 10_000},

    use: {
        baseURL: WEB_URL,
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
    },

    projects: [
        {name: 'chromium', use: {...devices['Desktop Chrome']}},
    ],

    // Skip starting servers when pointing at an already-running stack.
    webServer: process.env.E2E_BASE_URL ? undefined : [
        {
            command: 'npm run dev',
            cwd: '../api',
            port: 4000,
            reuseExistingServer: reuse,
            timeout: 120_000,
            stdout: 'pipe',
            stderr: 'pipe',
        },
        {
            command: 'BROWSER=none npm start',
            cwd: '../web',
            url: WEB_URL,
            reuseExistingServer: reuse,
            timeout: 180_000,
            stdout: 'pipe',
            stderr: 'pipe',
        },
    ],
})
