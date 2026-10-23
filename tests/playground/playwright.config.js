import { defineConfig } from '@playwright/test';
import { fileURLToPath } from 'node:url';

export default defineConfig({
    testDir: '.',
    testMatch: '*.spec.js',
    workers: 1,
    use: { baseURL: 'http://127.0.0.1:4335', browserName: 'chromium' },
    webServer: {
        cwd: fileURLToPath(new URL('../..', import.meta.url)),
        command: 'npm run dev -- --host 127.0.0.1 --port 4335 --strictPort',
        url: 'http://127.0.0.1:4335',
        reuseExistingServer: false,
    },
});
