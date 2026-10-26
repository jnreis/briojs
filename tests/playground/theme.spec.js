import { test, expect } from '@playwright/test';
import { readdirSync } from 'node:fs';
import { examples } from '../../site/data/examples.mjs';

const manual = ['directives', 'methods', 'reactivity'].flatMap(group =>
    readdirSync(new URL(`../${group}/`, import.meta.url))
        .filter(name => name.endsWith('.html')).map(name => `/tests/${group}/${name}`));
const pages = ['/', '/tests/index.html', ...manual, ...examples.map(example => `/tests/apps/${example.id}/index.html`)];

for (const path of pages) {
    test(`shared light/dark theme: ${path}`, async ({ page }) => {
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.emulateMedia({ colorScheme: 'light' });
        await page.goto(path);
        await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
        await expect(page.locator('body')).toHaveCSS('color', 'rgb(21, 33, 57)');
        if (path === '/tests/apps/large-table/index.html')
            await expect(page.locator('thead th').first()).toHaveCSS('background-color', 'rgb(249, 250, 251)');
        await expect(page.locator('#theme-toggle')).toHaveCount(1);
        await expect(page.locator('#theme-toggle')).toHaveText('◐');
        await expect(page.locator('link[rel="icon"]')).toHaveCount(1);
        await page.getByRole('button', { name: 'Switch color theme' }).click();
        await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
        await expect(page.locator('body')).toHaveCSS('color', 'rgb(237, 243, 255)');
        if (path === '/tests/apps/large-table/index.html')
            await expect(page.locator('thead th').first()).toHaveCSS('background-color', 'rgb(19, 44, 80)');
        await page.reload();
        await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
        if (path === '/tests/apps/temperature-converter/index.html') {
            await page.setViewportSize({ width: 320, height: 720 });
            const reading = page.getByRole('region', { name: 'Converter', exact: true });
            const panel = await reading.boundingBox();
            const unit = await page.locator('.unit').first().boundingBox();
            expect(unit.x + unit.width).toBeLessThanOrEqual(panel.x + panel.width - 20);
        }
        if (path.startsWith('/tests/apps/')) {
            await expect(page.locator('.brio-demo-nav')).toHaveCount(1);
            await expect(page.getByRole('link', { name: 'Lab', exact: true })).toHaveAttribute('href', '/');
            await expect(page.getByRole('link', { name: 'Experiments', exact: true })).toHaveAttribute('href', '/tests/index.html');
        } else if (manual.includes(path)) {
            await expect(page.locator('.example-source').first()).toBeVisible();
            await expect(page.locator('.example-source').first()).toHaveCSS('background-color', 'rgb(19, 44, 80)');
            const code = page.locator('.example-source code').first();
            await expect(code).toHaveClass('lab-source-code');
            await expect(code.locator('.token.tag').first()).toHaveCSS('color', 'rgb(196, 181, 253)');
            expect(await page.locator('.example-source code').evaluateAll(blocks =>
                blocks.every(block => block.classList.contains('lab-source-code') && block.querySelector('.token')))).toBe(true);
        }
        expect(errors).toEqual([]);
    });
}

test('lab preserves keyed node identity and exposes real mutations, state, and source', async ({ page }) => {
    await page.goto('/');
    const rows = page.locator('.task-queue li');
    await expect(rows).toHaveCount(3);
    await page.evaluate(() => {
        window.originalRows = [...document.querySelectorAll('.task-queue li')];
    });
    const firstIdentity = await page.locator('#node-map li').first().getAttribute('data-node-id');
    await page.getByRole('button', { name: 'Rotate queue' }).click();
    await expect(page.locator('#node-map li').last()).toHaveAttribute('data-node-id', firstIdentity);
    expect(await page.evaluate(() => {
        const rows = [...document.querySelectorAll('.task-queue li')];
        return rows.every(row => window.originalRows.includes(row)) && rows[2] === window.originalRows[0];
    })).toBe(true);
    await expect(page.locator('#dom-trace li').first()).toContainText('moved');
    await page.getByLabel('Task 1 label', { exact: true }).fill('Identity stays');
    await expect(page.locator('#state-snapshot')).toContainText('Identity stays');
    await page.getByRole('button', { name: 'Batch complete', exact: true }).click();
    await expect(page.locator('.task-queue .task-done')).toHaveCount(3);
    await expect(page.locator('.queue-total')).toHaveText('3 complete / 3 tasks');
    await expect(page.locator('#dom-trace li').first()).toContainText('attribute change');
    await page.getByLabel('New task', { exact: true }).fill('<script>not HTML</script>');
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    await expect(rows).toHaveCount(4);
    await expect(page.locator('.task-label').last()).toHaveValue('<script>not HTML</script>');
    await expect(page.locator('#specimen script')).toHaveCount(0);
    await expect(page.locator('#dom-trace li').first()).toContainText('inserted');
    await expect(page.getByLabel('New task', { exact: true })).toHaveValue('');
    await page.getByRole('button', { name: 'Remove task 4', exact: true }).click();
    await expect(rows).toHaveCount(3);
    await expect(page.locator('#dom-trace li').first()).toContainText('removed');
    await page.getByRole('button', { name: 'Reset specimen', exact: true }).click();
    await expect(page.locator('.task-queue .task-done')).toHaveCount(0);
    expect(await page.evaluate(() => [...document.querySelectorAll('.task-queue li')].every(row => !window.originalRows.includes(row)))).toBe(true);
    for (let i = 0; i < 15; i++) await page.getByRole('button', { name: 'Rotate queue' }).click();
    await expect(page.locator('#dom-trace li')).toHaveCount(12);
    await page.getByRole('button', { name: 'Clear trace', exact: true }).click();
    await expect(page.locator('#dom-trace')).toContainText('Trace cleared');
    await page.locator('.bench-source > summary').click();
    await expect(page.locator('#specimen-html')).toContainText('b-key="$for.task.id"');
    await expect(page.locator('#specimen-js')).toContainText('batch(');
    await expect(page.locator('#specimen-html .token.tag').first()).toHaveCSS('color', 'rgb(196, 181, 253)');
    await expect(page.locator('#specimen-js .token.keyword').first()).toHaveCSS('color', 'rgb(196, 181, 253)');
});

test('empty workbench remains usable and lab navigation works without JavaScript', async ({ page, browser }) => {
    await page.goto('/');
    for (const id of [1, 2, 3]) await page.getByRole('button', { name: `Remove task ${id}`, exact: true }).click();
    await expect(page.locator('.queue-empty')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Rotate queue' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Batch complete' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Add', exact: true })).toBeDisabled();
    await page.getByLabel('New task', { exact: true }).fill('Start again');
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    await expect(page.locator('.queue-empty')).toHaveCount(0);
    await expect(page.locator('.task-queue li')).toHaveCount(1);
    const context = await browser.newContext({ javaScriptEnabled: false });
    try {
        const staticPage = await context.newPage();
        await staticPage.goto(new URL('/', page.url()).href);
        await staticPage.getByRole('link', { name: 'Experiments', exact: true }).click();
        await expect(staticPage.locator('a.test-link')).toHaveCount(manual.length + examples.length);
        await expect(staticPage.locator('a.test-link:visible')).toHaveCount(manual.length + examples.length);
        await expect(staticPage.locator('.catalog-tools')).toBeHidden();
    } finally {
        await context.close();
    }
});

test('lab catalog search, categories, shortcuts, and navigation work', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.lab-catalog')).toHaveCount(0);
    await expect(page.getByRole('navigation', { name: 'Lab navigation' }).getByRole('link')).toHaveText(['Experiments', 'Reference']);
    await page.getByRole('link', { name: 'Experiments', exact: true }).click();
    await expect(page).toHaveURL(/\/tests\/$/);
    const cards = page.locator('a.test-link:visible');
    await expect(cards).toHaveCount(manual.length + examples.length);
    await page.getByRole('button', { name: 'Apps', exact: true }).click();
    await expect(cards).toHaveCount(examples.length);
    await page.getByLabel('Find an experiment').fill('concurrent');
    await expect(cards).toHaveCount(0);
    await expect(page.locator('#catalog-empty')).toBeVisible();
    await page.getByLabel('Find an experiment').fill('cursor');
    await expect(cards).toHaveCount(1);
    await expect(cards.first()).toHaveAttribute('href', '/tests/apps/collab-editor/index.html');
    await page.getByLabel('Find an experiment').fill('');
    await page.getByRole('button', { name: 'Directives', exact: true }).click();
    await expect(cards).toHaveCount(manual.filter(path => path.includes('/directives/')).length);
    await page.locator('h1').click();
    await page.keyboard.press('/');
    await expect(page.getByLabel('Find an experiment')).toBeFocused();
    await page.getByLabel('Find an experiment').fill('teleport');
    await expect(cards).toHaveCount(2);
    await page.locator('a.test-link[href="/tests/directives/teleport.html"]').click();
    await expect(page).toHaveURL(/\/tests\/directives\/teleport.html$/);
    await page.getByRole('link', { name: 'Lab', exact: true }).click();
    await expect(page).toHaveURL('/');
    await expect(page.locator('#astro-launch-link')).toHaveAttribute('href', /:4336\/\?lab=http/);
    await page.getByRole('link', { name: 'Experiments', exact: true }).click();
    const broken = await page.locator('a.test-link').evaluateAll(links =>
        Promise.all(links.map(async link => {
            const response = await fetch(link.href);
            return response.ok ? null : link.pathname;
        })));
    expect(broken.filter(Boolean)).toEqual([]);
});

test('lab theme handoff and mobile layout', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Switch color theme' }).click();
    const theme = await page.locator('html').getAttribute('data-theme');
    await page.getByRole('link', { name: 'Experiments', exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    for (const path of ['/', '/tests/index.html', '/tests/directives/on.html', '/tests/apps/temperature-converter/index.html']) {
        await page.setViewportSize({ width: 320, height: 844 });
        await page.goto(path);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await expect(page.getByRole('button', { name: 'Switch color theme' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Switch color theme' })).toHaveText('◐');
    }
});

test('system preference changes are followed until a preference is saved', async ({ page, context }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    await page.emulateMedia({ colorScheme: 'dark' });
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.getByRole('button', { name: 'Switch color theme' }).click();
    await page.emulateMedia({ colorScheme: 'light' });
    await page.emulateMedia({ colorScheme: 'dark' });
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    const other = await context.newPage();
    await other.goto('/tests/index.html');
    await other.getByRole('button', { name: 'Switch color theme' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('theme does not override native scoped CSS demonstrations', async ({ page }) => {
    await page.goto('/tests/directives/styles.html');
    for (const theme of ['light', 'dark']) {
        await page.evaluate(theme => {
            document.documentElement.dataset.theme = theme;
        }, theme);
        await expect(page.locator('#red-heading')).toHaveCSS('color', 'rgb(255, 0, 0)');
        await expect(page.locator('#green-heading')).toHaveCSS('color', 'rgb(0, 128, 0)');
        await expect(page.locator('#generated-heading')).toHaveCSS('color', 'rgb(255, 0, 0)');
        await expect(page.locator('#inclusive-heading')).toHaveCSS('color', 'rgb(128, 0, 128)');
    }
    await page.locator('#change-accent').click();
    await expect(page.locator('#variable-heading')).toHaveCSS('color', 'rgb(190, 18, 60)');
});
