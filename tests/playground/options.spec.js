import { test, expect } from '@playwright/test';
import { readdirSync } from 'node:fs';

test('directory lists every directive and method page once, grouped by purpose', async ({ page }) => {
    await page.goto('/tests/index.html');
    for (const folder of ['directives', 'methods']) {
        const files = readdirSync(new URL(`../${folder}/`, import.meta.url)).filter(file => file.endsWith('.html'));
        for (const file of files) {
            await expect(page.locator(`a.test-link[href="/tests/${folder}/${file}"]`)).toHaveCount(1);
        }
    }
    await expect(page.getByRole('heading', { level: 3 })).toHaveText([
        'State and bindings', 'Rendering and placement', 'Events and behavior',
        'Observers add-on', 'Hydration boundaries', 'DOM and data', 'Forms and flows',
    ]);
});

test('options page demonstrates delays, modifier overrides, and plugin options', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.clock.install();
    await page.goto('/tests/directives/options.html');
    await expect(page.locator('#literal-tip')).toHaveAttribute('title', 'Options from a literal');
    await expect(page.locator('#reference-tip')).toHaveAttribute('title', 'Options from a state object');

    await page.locator('#search').fill('first');
    await page.clock.runFor(200);
    await page.locator('#search').fill('Brio');
    await page.clock.runFor(399);
    await expect(page.locator('#searches')).toHaveText('0');
    await page.clock.runFor(1);
    await expect(page.locator('#searches')).toHaveText('1');
    await expect(page.locator('#query')).toHaveText('Brio');

    await page.locator('#throttled').dispatchEvent('click');
    await page.locator('#throttled').dispatchEvent('click');
    await expect(page.locator('#clicks')).toHaveText('1');
    await page.clock.runFor(600);
    await page.locator('#throttled').dispatchEvent('click');
    await expect(page.locator('#clicks')).toHaveText('2');

    await page.locator('#keys').press('Enter');
    await page.locator('#keys').press('a');
    await page.locator('#keys').press('Enter');
    await expect(page.locator('#key-count')).toHaveText('2');
    expect(errors).toEqual([]);
});
