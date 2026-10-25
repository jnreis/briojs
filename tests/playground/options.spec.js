import { test, expect } from '@playwright/test';
import { readdirSync } from 'node:fs';

test('directory shares the home footer on desktop and mobile', async ({ page }) => {
    for (const width of [1280, 375]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto('/');
        const footer = page.getByRole('contentinfo');
        const markup = await footer.innerHTML();
        const styles = () => footer.evaluate(element => {
            const css = getComputedStyle(element);
            return [css.display, css.flexDirection, css.gap, css.borderTop, css.paddingTop, css.fontSize, css.color];
        });
        const homeStyles = await styles();
        await page.goto('/tests/');
        await expect(footer).toHaveCount(1);
        expect(await footer.innerHTML()).toBe(markup);
        expect(await styles()).toEqual(homeStyles);
        await expect(footer.getByRole('link')).toHaveAttribute('href', 'https://briojs.com/');
    }
});

test('directory shares the home header with Experiments highlighted', async ({ page }) => {
    for (const width of [1280, 375]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto('/');
        const headerStyles = () => page.locator('.lab-header').evaluate(header =>
            [header, header.querySelector('.lab-label'), header.querySelector('nav')].map(element => {
                const css = getComputedStyle(element);
                return [css.display, css.alignItems, css.gap, css.paddingBottom, css.marginBottom, css.borderBottom, css.fontWeight];
            }));
        const home = await headerStyles();
        await page.goto('/tests/');
        expect(await headerStyles()).toEqual(home);
        const nav = page.getByRole('navigation', { name: 'Lab navigation' });
        await expect(nav.getByRole('link')).toHaveText(['Experiments', 'Reference']);
        await expect(nav.getByRole('link', { name: 'Experiments', exact: true })).toHaveAttribute('aria-current', 'page');
        await expect(page.locator('[aria-current="page"]')).toHaveCount(1);
        await expect(nav.getByRole('link', { name: 'Reference', exact: true }))
            .toHaveAttribute('href', 'https://briojs.com/reference/html-directives/');
        await expect(nav.getByRole('button', { name: 'Switch color theme' })).toBeVisible();
        await expect(page.locator('#theme-toggle')).toHaveCount(1);
        await expect(page.locator('.brio-demo-nav')).toHaveCount(0);
    }
});

test('directory lists every directive and method page once, grouped by purpose', async ({ page }) => {
    await page.goto('/tests/index.html');
    for (const folder of ['directives', 'methods']) {
        const files = readdirSync(new URL(`../${folder}/`, import.meta.url)).filter(file => file.endsWith('.html'));
        for (const file of files) {
            await expect(page.locator(`a.test-link[href="/tests/${folder}/${file}"]`)).toHaveCount(1);
        }
    }
    await expect(page.locator('.catalog-group')).toHaveText([
        'State and bindings', 'Rendering and placement', 'Events and behavior',
        'Observers add-on', 'Hydration boundaries', 'DOM and data', 'Forms and flows',
    ]);
});

test('directory has directive labels, responsive cards, and aligned search controls', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/tests/');
    const input = await page.getByLabel('Find an experiment').boundingBox();
    for (const button of await page.locator('.catalog-filters button').all()) {
        const box = await button.boundingBox();
        expect(box.height).toBe(input.height);
        expect(box.y + box.height).toBe(input.y + input.height);
    }
    const titles = await page.locator('a.test-link[href*="/directives/"] h3').allTextContents();
    expect(titles.every(title => title.includes('b-'))).toBe(true);
    await page.getByLabel('Find an experiment').fill('b-on-enter');
    await expect(page.locator('a.test-link:visible')).toHaveCount(1);
    await expect(page.locator('a.test-link:visible h3')).toHaveText('b-on-enter / b-on-exit');
    await expect(page.getByRole('heading', { name: 'Complete apps', exact: true })).toBeHidden();
    await expect(page.locator('.catalog-group:visible')).toHaveText(['Observers add-on']);
    await page.getByLabel('Find an experiment').fill('');
    expect(await page.locator('.grid').first().evaluate(element =>
        getComputedStyle(element).gridTemplateColumns.split(' ').length)).toBe(3);
    await expect(page.locator('.astro-launch code')).toHaveText('npm run dev:astro');
    await expect(page.locator('.astro-launch a')).toHaveAttribute('href', /:4321\/\?lab=http/);
    for (const width of [800, 375]) {
        await page.setViewportSize({ width, height: 900 });
        const grid = page.locator('.grid').first();
        expect(await grid.evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length))
            .toBe(width === 800 ? 2 : 1);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
});

test('options page demonstrates delays, modifier overrides, and plugin options', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
    await page.goto('/tests/directives/options.html');
    await page.clock.pauseAt(new Date('2026-01-01T00:01:00Z'));
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
