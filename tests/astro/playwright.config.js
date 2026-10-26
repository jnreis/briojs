import { defineConfig } from '@playwright/test';
import { fileURLToPath } from 'node:url';

export default defineConfig({
    testDir: '.',
    testMatch: '*.spec.js',
    workers: 1,
    use: {
        baseURL: 'http://127.0.0.1:4322',
        browserName: 'chromium',
        channel: 'chromium',
        launchOptions: { ignoreDefaultArgs: ['--disable-back-forward-cache'] },
        trace: 'retain-on-failure',
    },
    webServer: {
        cwd: fileURLToPath(new URL('../..', import.meta.url)),
        command: 'npx astro build --root tests/fixtures/astro && npx astro preview --root tests/fixtures/astro --host 127.0.0.1 --port 4322',
        url: 'http://127.0.0.1:4322',
        reuseExistingServer: false,
    },
});
