/// <reference types="vitest/config" />
import {defineConfig, loadEnv} from 'vite'
import react from '@vitejs/plugin-react'
import {readFileSync} from 'node:fs'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'))

// https://vitejs.dev/config/
export default defineConfig(({mode}) => {
    // Keep the CRA-style REACT_APP_* contract: the app reads
    // process.env.REACT_APP_API_PREFIX / _VERSION everywhere, so we statically
    // replace those at build time from the .env[.mode] files (prefix) and the
    // package version (injected the way the old react-scripts script did).
    const env = loadEnv(mode, process.cwd(), 'REACT_APP_')

    return {
        plugins: [react()],
        // The Express API serves the static bundle from build/ and the CORS
        // allow-list / e2e / dev.sh all assume the web app on :3000.
        build: {outDir: 'build'},
        server: {port: 3000, strictPort: true},
        define: {
            'process.env.REACT_APP_API_PREFIX': JSON.stringify(env.REACT_APP_API_PREFIX ?? ''),
            'process.env.REACT_APP_VERSION': JSON.stringify(pkg.version),
        },
        test: {
            globals: true,
            environment: 'jsdom',
            setupFiles: './src/setupTests.ts',
            css: false,
            // Mirror CRA's Jest `resetMocks: true` so mock implementations are
            // reset between tests (see App.test.tsx / withAuth.test.tsx).
            mockReset: true,
        },
    }
})
