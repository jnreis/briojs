import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: '.',
    testMatch: '*.spec.js',
    use: {
        browserName: 'chromium',
        channel: 'chromium',
        trace: 'retain-on-failure',
    },
});
