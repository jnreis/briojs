import { test, expect } from '@playwright/test';
import { examples } from '../../site/data/examples.mjs';
import { readFileSync } from 'node:fs';

test('homepage creature builder, color theme, and mobile layout work', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Your HTML.');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('More interactive.');
    await expect(page.locator('.hero-description')).toContainText('Start small. See where it takes you.');
    const creature = page.locator('.creature');
    await expect(page.locator('.creature-name')).toHaveText('Blip');
    await expect(page.locator('.creature-greeting')).toHaveText('Blip is having a great day.');
    await expect(creature).toHaveClass(/is-happy/);
    await expect(page.locator('.creature-cheeks')).toHaveCount(1);
    await expect(creature).toHaveAttribute('aria-label', 'Blip is having a great day.');
    await page.getByLabel('😴 Sleepy').check();
    await expect(creature).toHaveClass(/is-sleepy/);
    await expect(page.locator('.creature-zzz')).toBeVisible();
    await expect(page.locator('.creature-cheeks')).toHaveCount(0);
    await page.getByLabel('😈 Mischievous').check();
    await expect(page.locator('.creature-horns')).toHaveCount(1);
    await expect(page.locator('.creature-zzz')).toHaveCount(0);
    await expect(page.locator('.creature-greeting')).toHaveText('Blip is up to something.');
    const theme = await page.locator('html').getAttribute('data-theme');
    await page.getByRole('button', { name: 'Switch color theme' }).click();
    expect(await page.locator('html').getAttribute('data-theme')).not.toBe(theme);
    await page.setViewportSize({ width: 375, height: 812 });
    await expect(page.getByRole('link', { name: 'Docs', exact: true })).toBeVisible();
    await expect(creature).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
});

test('homepage reveals its actual creature source and requested featured demos', async ({ page }) => {
    await page.goto('/');
    await page.locator('.mixer-source > summary').click();
    const snippet = await page.locator('.code-panels pre').first().innerText();
    const normalize = source => source.split('\n').map(line => line.trimEnd()).filter(line => line.length).join('\n');
    expect(normalize(snippet)).toBe(normalize(readFileSync(new URL('../../site/src/demos/creature.html', import.meta.url), 'utf8')));
    const js = await page.locator('.code-panels pre').nth(1).innerText();
    expect(normalize(js)).toContain(normalize(readFileSync(new URL('../../site/src/demos/creature.js', import.meta.url), 'utf8')));
    expect(js).toContain("createCreature().mount('#creature-builder')");
    const section = page.getByRole('region', { name: 'Go on. Pull a thread.' });
    for (const id of ['temperature-converter', 'dashboard', 'kanban']) {
        await expect(section.locator(`a[href="/demos/${id}/index.html"]`)).toBeVisible();
        await expect(section.locator(`a[href="https://github.com/jnreis/briojs/tree/main/tests/apps/${id}"]`)).toBeVisible();
    }
    await expect(section.locator('.card')).toHaveCount(3);
    await expect(section.locator('a[href="/examples/"]')).toHaveCount(0);
});

test('creature color, size, name, surprise, keyboard, and reduced motion stay in sync', async ({ page }) => {
    await page.goto('/');
    const creature = page.locator('.creature');
    const swatches = page.locator('.swatch');
    await expect(swatches).toHaveCount(6);
    await expect(swatches.first()).toHaveAttribute('aria-pressed', 'true');
    await swatches.nth(1).focus();
    await page.keyboard.press('Enter');
    await expect(swatches.nth(1)).toHaveAttribute('aria-pressed', 'true');
    await expect(swatches.first()).toHaveAttribute('aria-pressed', 'false');
    expect(await creature.evaluate(element => element.style.getPropertyValue('--body'))).toBe('#ff7aa8');
    const size = page.locator('.creature-controls input[type="range"]');
    await size.fill('130');
    await expect(page.locator('.creature-controls output')).toHaveText('130%');
    expect(await creature.evaluate(element => element.style.getPropertyValue('--size'))).toBe('1.3');
    const name = page.getByLabel('Name');
    await name.fill('Sir Wobbles');
    await expect(page.locator('.creature-name')).toHaveText('Sir Wobbles');
    await expect(page.locator('.creature-greeting')).toHaveText('Sir Wobbles is having a great day.');
    await name.fill('   ');
    await expect(page.locator('.creature-name')).toHaveText('Unnamed creature');
    await expect(page.locator('.creature-greeting')).toHaveText('This creature is having a great day.');
    await expect(name).toHaveAttribute('maxlength', '16');
    await name.fill('Blip');
    const before = await creature.evaluate(element => ({ className: element.className, color: element.style.getPropertyValue('--body') }));
    await page.getByRole('button', { name: '🎲 Surprise me' }).click();
    await expect(creature).not.toHaveClass(new RegExp(before.className.match(/is-\w+/)[0]));
    await expect(creature).toHaveClass(/wiggle-1/);
    await expect(page.locator('.creature-name')).not.toHaveText('Blip');
    expect(await creature.evaluate(element => element.style.getPropertyValue('--body'))).not.toBe(before.color);
    const surprised = Number((await page.locator('.creature-controls output').textContent()).replace('%', ''));
    expect(surprised).toBeGreaterThanOrEqual(70);
    expect(surprised).toBeLessThanOrEqual(130);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    expect(await creature.evaluate(element => getComputedStyle(element).animationName)).toBe('none');
    await page.setViewportSize({ width: 320, height: 720 });
    await page.locator('.mixer-source > summary').click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('gallery provides three approachable paths with every demo exactly once', async ({ page }) => {
    await page.goto('/examples/');
    await expect(page.locator('.example-group')).toHaveCount(3);
    await expect(page.locator('.gallery .card')).toHaveCount(examples.length);
    for (const example of examples)
        await expect(page.locator(`.gallery a[href="/demos/${example.id}/index.html"]`)).toHaveCount(1);
    await page.getByRole('link', { name: /Get a little ambitious/ }).click();
    await expect(page).toHaveURL(/#further$/);
    await page.setViewportSize({ width: 320, height: 720 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
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
    await page.locator('.mixer-source > summary').click();
    await expect(page.locator('.code-panels pre').first()).toContainText('b-model');
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
