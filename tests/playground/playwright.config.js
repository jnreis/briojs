import { defineConfig } from '@playwright/test';
import { fileURLToPath } from 'node:url';

export default defineConfig({
    testDir: '.',
    testMatch: '*.spec.js',
    workers: 1,
    use: { baseURL: 'http://127.0.0.1:4335', browserName: 'chromium', trace: 'retain-on-failure' },
    webServer: [{
        cwd: fileURLToPath(new URL('../..', import.meta.url)),
        command: 'npm run dev -- --host 127.0.0.1 --port 4335 --strictPort',
        url: 'http://127.0.0.1:4335',
        env: { VITE_LAB_ASTRO_PORT: '4336' },
        reuseExistingServer: false,
    }, {
        cwd: fileURLToPath(new URL('../..', import.meta.url)),
        command: 'npx astro dev --root tests/fixtures/astro --host 127.0.0.1 --port 4336',
        url: 'http://127.0.0.1:4336',
        reuseExistingServer: false,
    }],
});
