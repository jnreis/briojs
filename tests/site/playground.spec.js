import { test, expect } from '@playwright/test';

async function setCode(page, language, code) {
    await page.getByRole('tab', { name: language, exact: true }).click();
    await page.getByRole('textbox', { name: `${language} code`, exact: true }).fill(code);
}

async function edit(page, { html = '<p id="result" b-text="$data.message"></p>', css = 'p { color: rgb(120, 30, 90); }',
    js = 'brio.createApp({ state: () => ({ message: "Hello 🌿" }) }).mount("body");' } = {}) {
    await setCode(page, 'HTML', html);
    await setCode(page, 'CSS', css);
    await setCode(page, 'JavaScript', js);
}
const preview = page => page.frameLocator('iframe[title="Brio playground preview"]');

test('playground runs the homepage creature and edits only run on request', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/play/');
    await expect(preview(page).locator('.creature-name')).toHaveText('Blip');
    const originalTheme = await page.locator('html').getAttribute('data-theme');
    await page.getByRole('button', { name: 'Switch color theme' }).click();
    await expect(preview(page).locator('html')).toHaveAttribute('data-theme', originalTheme === 'dark' ? 'light' : 'dark');
    await preview(page).getByLabel('Name', { exact: true }).fill('Mochi');
    await expect(preview(page).locator('.creature-name')).toHaveText('Mochi');
    await edit(page);
    await expect(preview(page).locator('.creature-name')).toHaveText('Mochi');
    await page.getByRole('button', { name: 'Run', exact: true }).click();
    await expect(preview(page).locator('#result')).toHaveText('Hello 🌿');
    await expect(preview(page).locator('#result')).toHaveCSS('color', 'rgb(120, 30, 90)');
    await expect(page.locator('#play-errors')).toBeHidden();
    expect(errors).toEqual([]);
});

test('shared Unicode code loads without executing and reproduces the project after Run', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/play/');
    await edit(page);
    await page.getByRole('button', { name: 'Copy link', exact: true }).click();
    await expect(page.getByRole('status')).toHaveText('Link copied. Recipients must click Run.');
    const link = await page.evaluate(() => navigator.clipboard.readText());
    await expect(page.getByRole('textbox', { name: 'Shareable URL', exact: true })).toBeHidden();
    expect(link).toContain('#v1=');
    const recipient = await context.newPage();
    await recipient.goto(link);
    await expect(recipient.getByRole('status')).toContainText('It has not executed');
    await expect(recipient.locator('iframe')).toHaveCount(0);
    await recipient.getByRole('tab', { name: 'JavaScript', exact: true }).click();
    await expect(recipient.getByRole('textbox', { name: 'JavaScript code' })).toContainText('Hello 🌿');
    expect(await recipient.getByRole('textbox', { name: 'JavaScript code' }).innerText()).toContain('\n');
    await recipient.getByRole('button', { name: 'Run', exact: true }).click();
    await expect(preview(recipient).locator('#result')).toHaveText('Hello 🌿');
    await recipient.getByRole('button', { name: 'Stop', exact: true }).click();
    await expect(recipient.locator('iframe')).toHaveCount(0);
    const initialCode = {};
    for (const language of ['HTML', 'CSS', 'JavaScript']) {
        await recipient.getByRole('tab', { name: language, exact: true }).click();
        initialCode[language] = await recipient.getByRole('textbox', { name: `${language} code`, exact: true }).innerText();
    }
    await edit(recipient, { html: '<p id="result">Changed</p>', css: 'p { color: blue; }', js: '' });
    await recipient.getByRole('button', { name: 'Copy link', exact: true }).click();
    await expect(recipient.getByRole('status')).toContainText('Link copied');
    expect(recipient.url()).not.toBe(link);
    recipient.once('dialog', async dialog => {
        expect(dialog.message()).toContain('initially loaded code');
        await dialog.accept();
    });
    await recipient.getByRole('button', { name: 'Reset', exact: true }).click();
    await expect(recipient).toHaveURL(link);
    await expect(preview(recipient).locator('#result')).toHaveText('Hello 🌿');
    await expect(preview(recipient).locator('#result')).toHaveCSS('color', 'rgb(120, 30, 90)');
    for (const language of ['HTML', 'CSS', 'JavaScript']) {
        await recipient.getByRole('tab', { name: language, exact: true }).click();
        expect(await recipient.getByRole('textbox', { name: `${language} code`, exact: true }).innerText()).toBe(initialCode[language]);
    }
    page.once('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'Reset', exact: true }).click();
    await expect(page).toHaveURL(/\/play\/$/);
    await expect(preview(page).locator('.creature-name')).toHaveText('Blip');
    await setCode(page, 'CSS', 'p { color: blue; }');
    await expect(page.getByRole('textbox', { name: 'Shareable URL', exact: true })).toBeHidden();
});

test('clipboard denial offers a manual link without claiming it was copied', async ({ page }) => {
    await page.addInitScript(() => {
        Object.defineProperty(navigator, 'clipboard', { value: {
            write: async () => { throw new Error('Clipboard permission denied'); },
        } });
    });
    await page.goto('/play/');
    await expect(preview(page).locator('.creature-name')).toHaveText('Blip');
    await page.getByRole('button', { name: 'Copy link', exact: true }).click();
    await expect(page.getByRole('status')).toContainText('Unable to copy link');
    const fallback = page.getByRole('textbox', { name: 'Shareable URL', exact: true });
    await expect(fallback).toBeVisible();
    expect(await fallback.inputValue()).toContain('#v1=');
    await setCode(page, 'HTML', '<p>New edit</p>');
    await expect(fallback).toBeHidden();
});

test('invalid source reports sharing and formatting failures without discarding shared code', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/play/');
    await expect(preview(page).locator('.creature-name')).toHaveText('Blip');
    await setCode(page, 'JavaScript', 'const = ;');
    await page.getByRole('button', { name: 'Copy link', exact: true }).click();
    await expect(page.locator('#play-errors')).toContainText('Unable to copy link');
    await expect(page.getByRole('textbox', { name: 'Shareable URL', exact: true })).toBeHidden();
    const fragment = await page.evaluate(async () => {
        const project = { version: 1, html: '<p>Keep original</p>', css: '', js: 'const = ;' };
        const bytes = new Uint8Array(await new Response(new Blob([JSON.stringify(project)]).stream()
            .pipeThrough(new CompressionStream('deflate'))).arrayBuffer());
        return '#v1=' + btoa(Array.from(bytes, byte => String.fromCharCode(byte)).join(''))
            .replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
    });
    await page.goto('/play/' + fragment);
    await expect(page.locator('#play-errors')).toContainText('Unable to format code');
    await expect(page.locator('iframe')).toHaveCount(0);
    await page.getByRole('tab', { name: 'JavaScript', exact: true }).click();
    await expect(page.getByRole('textbox', { name: 'JavaScript code' })).toHaveText('const = ;');
});

test('preview reports syntax, runtime and asynchronous errors and cannot access parent DOM or storage', async ({ page }) => {
    await page.goto('/play/');
    await expect(preview(page).locator('.creature-name')).toHaveText('Blip');
    await expect(page.locator('iframe')).toHaveAttribute('sandbox', 'allow-scripts');
    for (const [js, message] of [
        ['const = ;', /SyntaxError|Unexpected token/],
        ['throw new Error("runtime example")', /runtime example/],
        ['Promise.reject(new Error("async example"))', /async example/],
        ['document.body.textContent = parent.document.body.textContent', /Blocked|cross-origin|SecurityError/],
        ['localStorage.setItem("sandbox-test", "no")', /Access is denied|SecurityError|denied/],
        ['fetch("/").catch(error => console.error("Network blocked", error.message))', /Network blocked/],
    ]) {
        await edit(page, { html: '<p>Preview</p>', js });
        await page.getByRole('button', { name: 'Run', exact: true }).click();
        await expect(page.locator('#play-errors')).toContainText(message);
    }
    await edit(page, { js: 'document.body.textContent = "</script> still works 🌿";' });
    await page.getByRole('button', { name: 'Run', exact: true }).click();
    await expect(preview(page).locator('body')).toHaveText('</script> still works 🌿');
    await expect(page.locator('#play-errors')).toBeHidden();
});

test('invalid shares do not execute and reset recovers; workspace fills the viewport responsively', async ({ page }) => {
    await page.goto('/play/#invalid');
    await expect(page.locator('#play-errors')).toContainText('Unable to load shared code');
    await expect(page.locator('iframe')).toHaveCount(0);
    await page.getByRole('button', { name: 'Reset', exact: true }).click();
    await expect(preview(page).locator('.creature-name')).toHaveText('Blip');
    await setCode(page, 'HTML', '<p>Keep this draft</p>');
    page.once('dialog', dialog => dialog.dismiss());
    await page.getByRole('button', { name: 'Reset', exact: true }).click();
    await expect(page.getByRole('textbox', { name: 'HTML code', exact: true })).toHaveText('<p>Keep this draft</p>');
    await page.getByRole('button', { name: 'Switch color theme' }).click();
    for (const width of [1280, 375]) {
        await page.setViewportSize({ width, height: 900 });
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight)).toBe(true);
        const source = await page.locator('.play-source').boundingBox();
        const result = await page.locator('.play-result').boundingBox();
        if (width === 1280) {
            expect(result.x).toBeCloseTo(source.x + source.width, 0);
            expect(result.y).toBe(source.y);
            expect(source.height).toBeGreaterThan(600);
        } else {
            expect(result.x).toBe(source.x);
            expect(result.y).toBeCloseTo(source.y + source.height, 0);
            expect(source.height).toBeGreaterThan(200);
        }
        await expect(page.getByRole('textbox', { name: 'HTML code', exact: true })).toBeVisible();
        await expect(page.locator('footer')).toHaveCount(0);
    }
});

test('syntax-highlighted editor tabs preserve drafts and undo, support keyboard navigation and Run', async ({ page }) => {
    await page.goto('/play/');
    await expect(preview(page).locator('.creature-name')).toHaveText('Blip');
    await setCode(page, 'HTML', '<p id="result">Editor test</p>');
    const html = page.getByRole('textbox', { name: 'HTML code', exact: true });
    await expect(html.locator('span').first()).toBeVisible();
    const ink = await html.evaluate(el => getComputedStyle(el).color);
    expect(await html.locator('span').filter({ hasText: /^p$/ }).first().evaluate(el => getComputedStyle(el).color)).not.toBe(ink);
    await expect(page.locator('#play-html .cm-lineNumbers')).toBeVisible();
    await html.press('ControlOrMeta+End');
    await html.press('!');
    await setCode(page, 'CSS', 'p { color: rgb(120, 30, 90); }');
    await setCode(page, 'JavaScript', '// Your code here');
    await page.getByRole('tab', { name: 'JavaScript', exact: true }).press('Home');
    await expect(page.getByRole('tab', { name: 'HTML', exact: true })).toBeFocused();
    await expect(html).toHaveText('<p id="result">Editor test</p>!');
    await html.focus();
    await html.press('ControlOrMeta+z');
    await expect(html).toHaveText('<p id="result">Editor test</p>');
    await html.press('ControlOrMeta+Enter');
    await expect(preview(page).locator('#result')).toHaveText('Editor test');
    await expect(preview(page).locator('#result')).toHaveCSS('color', 'rgb(120, 30, 90)');
    await page.getByRole('tab', { name: 'HTML', exact: true }).focus();
    await page.keyboard.press('ArrowLeft');
    await expect(page.getByRole('tab', { name: 'JavaScript', exact: true })).toBeFocused();
    await expect(page.getByRole('tab', { selected: true })).toHaveText('JavaScript');
    await page.keyboard.press('ArrowLeft');
    await expect(page.getByRole('tab', { selected: true })).toHaveText('CSS');
    await page.keyboard.press('End');
    await expect(page.getByRole('tab', { selected: true })).toHaveText('JavaScript');
});
