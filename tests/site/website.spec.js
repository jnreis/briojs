import { test, expect } from '@playwright/test';
import { examples } from '../../site/data/examples.mjs';

test('homepage demo, color theme, and mobile layout work', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Less ceremony.');
    await page.getByRole('button', { name: 'Count: 0' }).click();
    await expect(page.getByRole('button', { name: 'Count: 1' })).toBeVisible();
    await page.getByRole('button', { name: 'Reset', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Count: 0' })).toBeVisible();
    const theme = await page.locator('html').getAttribute('data-theme');
    await page.getByRole('button', { name: 'Switch color theme' }).click();
    expect(await page.locator('html').getAttribute('data-theme')).not.toBe(theme);
    await page.setViewportSize({ width: 375, height: 812 });
    await expect(page.getByRole('link', { name: 'Docs', exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
});

test('homepage shows the exact counter markup and three curated examples', async ({ page }) => {
    await page.goto('/');
    const snippet = await page.locator('.code-panels pre').first().innerText();
    const matches = await page.locator('#counter').evaluate((counter, markup) => {
        const template = document.createElement('template');
        template.innerHTML = markup;
        const expected = template.content.firstElementChild;
        for (const element of [expected, ...expected.querySelectorAll('*')]) {
            for (const attribute of [...element.attributes]) {
                if (attribute.name.startsWith('b-')) element.removeAttribute(attribute.name);
            }
        }
        return { expected: expected.outerHTML, actual: counter.outerHTML };
    }, snippet);
    expect(matches.actual).toBe(matches.expected);
    const section = page.getByRole('region', { name: 'Try something real.' });
    for (const id of ['temperature-converter', 'kanban', 'collab-editor']) {
        await expect(section.locator(`a[href="/demos/${id}/index.html"]`)).toBeVisible();
        await expect(section.locator(`a[href="https://github.com/jnreis/briojs/tree/main/tests/apps/${id}"]`)).toBeVisible();
    }
});

test('search, docs code and mobile navigation work in production', async ({ page }) => {
    await page.goto('/reference/html-directives/');
    await expect(page.locator('main')).toContainText('$data.query');
    await page.getByRole('button', { name: /search/i }).click();
    await page.getByRole('textbox', { name: 'Search', exact: true }).fill('persistence');
    await expect(page.locator('.pagefind-ui__result-link').first()).toBeVisible();
    await page.locator('.pagefind-ui__result-link').first().click();
    await expect(page).toHaveURL(/reference/);
    await page.setViewportSize({ width: 375, height: 812 });
    await page.getByRole('button', { name: /menu/i }).click();
    await expect(page.locator('#starlight__sidebar')).toBeVisible();
});

test('reading works without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.goto('/start/getting-started/');
    await expect(page.locator('main')).toContainText('npm install @jnreis/briojs');
    await context.close();
});

test('unknown pages remain real 404 responses', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist/');
    expect(response.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

for (const example of examples) {
    test(`static demo loads: ${example.id}`, async ({ page }) => {
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        page.on('response', response => {
            if (response.status() >= 400 && new URL(response.url()).origin === 'http://127.0.0.1:4330')
                errors.push(`${response.status()} ${response.url()}`);
        });
        await page.goto(`/demos/${example.id}/`);
        await page.waitForTimeout(700);
        await expect(page.getByRole('link', { name: '← Brio examples' })).toBeVisible();
        expect(errors).toEqual([]);
    });
}

test('temperature edits preserve the cursor from the first keystroke', async ({ page }) => {
    await page.goto('/demos/temperature-converter/index.html');
    for (const scale of ['celsius', 'fahrenheit', 'kelvin', 'celsius']) {
        const field = page.getByTestId(scale);
        await field.focus();
        await field.evaluate(element => element.setSelectionRange(1, 1));
        const before = await field.inputValue();
        await field.press('1');
        await expect(field).toHaveValue(before.slice(0, 1) + '1' + before.slice(1));
        expect(await field.evaluate(element => [element.selectionStart, element.selectionEnd])).toEqual([2, 2]);
        await field.press('2');
        await expect(field).toHaveValue(before.slice(0, 1) + '12' + before.slice(1));
        expect(await field.evaluate(element => [element.selectionStart, element.selectionEnd])).toEqual([3, 3]);
        await field.blur();
    }
});

test('Conduit hash routes survive reloads and browser history', async ({ page }) => {
    await page.goto('/demos/conduit/');
    await page.getByTestId('nav-login').click();
    await expect(page).toHaveURL(/#\/login/);
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
    await page.goBack();
    await expect(page).not.toHaveURL(/#\/login/);
    await page.goForward();
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
});

for (const [app, route] of [['kanban', 'card'], ['collab-editor', 'd']]) {
    test(`${app} deep hash links survive reload and history`, async ({ page }) => {
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.goto(`/demos/${app}/`);
        await page.locator(`a[href*="#/${route}/"]`).first().click();
        await expect(page).toHaveURL(new RegExp(`#/${route}/`));
        const deepLink = page.url();
        await page.reload();
        await expect(page).toHaveURL(deepLink);
        await expect(page.locator(`[b-cloak]`)).toHaveCount(0);
        await page.goBack();
        await expect(page).not.toHaveURL(deepLink);
        await page.goForward();
        await expect(page).toHaveURL(deepLink);
        expect(errors).toEqual([]);
    });
}
