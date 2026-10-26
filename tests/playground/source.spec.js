import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

test('Lab source highlighting preserves exact source and colors HTML and JavaScript in both themes', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/');
    await page.locator('.bench-source > summary').click();
    const html = page.locator('#specimen-html');
    const js = page.locator('#specimen-js');
    await expect(html).toHaveClass('lab-source-code');
    expect(await html.textContent()).toBe(await page.locator('#specimen-template').innerHTML().then(source => source.trim()));
    expect(await js.textContent()).toBe(readFileSync(new URL('../../lab/workbench.js', import.meta.url), 'utf8').trim());
    for (const theme of ['light', 'dark']) {
        await page.evaluate(theme => document.documentElement.dataset.theme = theme, theme);
        await expect(html.locator('.token.tag').first()).toHaveCSS('color', 'rgb(196, 181, 253)');
        await expect(html.locator('.token.attr-name').first()).toHaveCSS('color', 'rgb(147, 197, 253)');
        await expect(js.locator('.token.string').first()).toHaveCSS('color', 'rgb(167, 243, 208)');
        await expect(js.locator('.token.keyword').first()).toHaveCSS('color', 'rgb(196, 181, 253)');
    }
    expect(errors).toEqual([]);
});

test('manual source panels highlight embedded CSS and JavaScript without changing or executing the source', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/tests/directives/slot.html');
    const example = page.locator('.example-source code').first();
    await expect(example).toHaveClass('lab-source-code');
    const source = await example.textContent();
    expect(source).toContain('b-prop-items');
    expect(source).toContain('$slot');
    expect(source).not.toContain('class="token');
    const setup = page.locator('.example-source-setup');
    await setup.locator('summary').filter({ hasText: 'JavaScript and script imports' }).click();
    await setup.locator('summary').filter({ hasText: 'Page CSS' }).click();
    for (const theme of ['light', 'dark']) {
        await page.evaluate(theme => document.documentElement.dataset.theme = theme, theme);
        await expect(setup.locator('.language-javascript .token.keyword').first()).toHaveCSS('color', 'rgb(196, 181, 253)');
        await expect(setup.locator('.language-css .token.property').first()).toHaveCSS('color', 'rgb(147, 197, 253)');
    }
    await page.locator('#reverse').click();
    expect(await example.textContent()).toBe(source);
    await expect(page.locator('.example-source code script')).toHaveCount(0);
    expect(errors).toEqual([]);
});
