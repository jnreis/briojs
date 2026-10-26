import { defineConfig } from '@playwright/test';
import { fileURLToPath } from 'node:url';

export default defineConfig({
    testDir: '.',
    testMatch: '*.spec.js',
    workers: 1,
    use: { baseURL: 'http://127.0.0.1:4330', browserName: 'chromium' },
    projects: [
        { name: 'production' },
        {
            name: 'development',
            testMatch: ['demo-links.spec.js', 'playground.spec.js', 'parts.spec.js'],
            use: { baseURL: 'http://127.0.0.1:4334' },
        },
    ],
    webServer: [{
        cwd: fileURLToPath(new URL('../..', import.meta.url)),
        command: 'npm run site:preview -- --host 127.0.0.1 --port 4330',
        url: 'http://127.0.0.1:4330',
        reuseExistingServer: false,
    }, {
        cwd: fileURLToPath(new URL('../..', import.meta.url)),
        command: 'npm exec astro -- dev --root site --host 127.0.0.1 --port 4334',
        url: 'http://127.0.0.1:4334',
        reuseExistingServer: false,
    }],
});
