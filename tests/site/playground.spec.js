import { test, expect } from '@playwright/test';

async function setCode(page, language, code) {
    await page.getByRole('tab', { name: language, exact: true }).click();
    const editor = page.getByRole('textbox', { name: `${language} code`, exact: true });
    await editor.press('ControlOrMeta+a');
    await editor.evaluate((element, value) => {
        const data = new DataTransfer();
        data.setData('text/plain', value);
        element.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: data }));
    }, code);
}

async function getCode(page, language) {
    const editor = page.getByRole('textbox', { name: `${language} code`, exact: true });
    await editor.press('ControlOrMeta+a');
    return editor.inputValue();
}

async function expectCode(page, language, code) {
    await expect.poll(() => getCode(page, language)).toBe(code);
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
    expect(await getCode(recipient, 'JavaScript')).toContain('Hello 🌿');
    expect(await getCode(recipient, 'JavaScript')).toContain('\n');
    await recipient.getByRole('button', { name: 'Run', exact: true }).click();
    await expect(preview(recipient).locator('#result')).toHaveText('Hello 🌿');
    await recipient.getByRole('button', { name: 'Stop', exact: true }).click();
    await expect(recipient.locator('iframe')).toHaveCount(0);
    const initialCode = {};
    for (const language of ['HTML', 'CSS', 'JavaScript']) {
        await recipient.getByRole('tab', { name: language, exact: true }).click();
        initialCode[language] = await getCode(recipient, language);
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
        await expectCode(recipient, language, initialCode[language]);
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
    await expectCode(page, 'JavaScript', 'const = ;');
});

test('preview reports syntax, runtime and asynchronous errors and cannot access parent DOM or storage', async ({ page }) => {
    await page.goto('/play/');
    await expect(preview(page).locator('.creature-name')).toHaveText('Blip');
    await expect(page.locator('iframe')).toHaveAttribute('sandbox', 'allow-scripts allow-forms');
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

test('preview supports native submit handlers but CSP blocks form navigation', async ({ page }) => {
    await page.goto('/play/');
    await edit(page, {
        html: `<form id="local" b-on-submit.prevent="$data.submits++">
          <label>Name <input required></label><button type="submit">Save</button>
        </form><p id="submits" b-text="$data.submits"></p>
        <form id="blocked" action="/blocked-form-target" target="_self"><button type="submit">Navigate</button></form>`,
        css: '',
        js: `brio.createApp({ state: () => ({ submits: 0 }) }).mount('body');
          document.addEventListener('securitypolicyviolation', event => {
            if (event.violatedDirective === 'form-action') document.body.dataset.formBlocked = 'true';
          });`,
    });
    await page.getByRole('button', { name: 'Run', exact: true }).click();
    const demo = preview(page);
    await demo.getByRole('textbox', { name: 'Name', exact: true }).fill('Ada');
    await demo.getByRole('textbox', { name: 'Name', exact: true }).press('Enter');
    await expect(demo.locator('#submits')).toHaveText('1');
    await demo.getByRole('button', { name: 'Navigate', exact: true }).click();
    await expect(demo.locator('body')).toHaveAttribute('data-form-blocked', 'true');
    await expect(demo.locator('#submits')).toHaveText('1');
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
    await expectCode(page, 'HTML', '<p>Keep this draft</p>');
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
    const tokens = page.locator('#play-html .view-lines span span');
    await expect(tokens.first()).toBeVisible();
    const ink = await page.locator('.monaco-editor').evaluate(el => getComputedStyle(el).color);
    expect(await tokens.filter({ hasText: /^p$/ }).first().evaluate(el => getComputedStyle(el).color)).not.toBe(ink);
    await expect(page.locator('#play-html .margin-view-overlays .line-numbers').first()).toBeVisible();
    await html.press('ControlOrMeta+End');
    await html.press('!');
    await setCode(page, 'CSS', 'p { color: rgb(120, 30, 90); }');
    await setCode(page, 'JavaScript', '// Your code here');
    await page.getByRole('tab', { name: 'JavaScript', exact: true }).press('Home');
    await expect(page.getByRole('tab', { name: 'HTML', exact: true })).toBeFocused();
    await expectCode(page, 'HTML', '<p id="result">Editor test</p>!');
    await html.focus();
    await html.press('ControlOrMeta+z');
    await expectCode(page, 'HTML', '<p id="result">Editor test</p>');
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

test('all editor languages retain syntax colors in light and dark themes', async ({ page }) => {
    await page.goto('/play/');
    await expect(preview(page).locator('.creature-name')).toHaveText('Blip');
    const samples = [
        ['HTML', '<p class="note">Hello</p>', /^p$/],
        ['CSS', 'p { color: red; margin: 12px; }', /^color:/],
        ['JavaScript', 'const greeting = "Hello";', /^const/],
    ];
    for (const [language, code, token] of samples) {
        await setCode(page, language, code);
        const editor = page.locator('.monaco-editor');
        const highlighted = editor.locator('.view-lines span span').filter({ hasText: token }).first();
        await expect(highlighted).toBeVisible();
        const ink = await editor.evaluate(node => getComputedStyle(node).color);
        await expect.poll(() => highlighted.evaluate(node => getComputedStyle(node).color)).not.toBe(ink);
        const color = await highlighted.evaluate(node => getComputedStyle(node).color);
        await page.getByRole('button', { name: 'Switch color theme' }).click();
        await expect.poll(() => highlighted.evaluate(node => getComputedStyle(node).color)).not.toBe(color);
    }
});

test('editors indent with Tab, outdent with Shift-Tab, and provide an accessible keyboard exit', async ({ page }) => {
    await page.goto('/play/');
    await expect(preview(page).locator('.creature-name')).toHaveText('Blip');
    await setCode(page, 'JavaScript', 'const value = 1;');
    const editor = page.getByRole('textbox', { name: 'JavaScript code', exact: true });
    await editor.press('ControlOrMeta+a');
    await editor.press('ArrowLeft');
    await editor.press('Tab');
    await expect(editor).toBeFocused();
    await expectCode(page, 'JavaScript', '  const value = 1;');
    await editor.press('Shift+Tab');
    await expectCode(page, 'JavaScript', 'const value = 1;');
    await setCode(page, 'JavaScript', 'const first = 1;\nconst second = 2;');
    await editor.press('ControlOrMeta+a');
    await editor.press('Tab');
    await expectCode(page, 'JavaScript', '  const first = 1;\n  const second = 2;');
    await editor.press('Shift+Tab');
    await expectCode(page, 'JavaScript', 'const first = 1;\nconst second = 2;');
    await editor.press(process.platform === 'darwin' ? 'Control+Shift+m' : 'Control+m');
    await editor.press('Tab');
    await expect(editor).not.toBeFocused();
    await editor.focus();
    await editor.press('ControlOrMeta+f');
    await expect(page.locator('.find-widget')).toBeVisible();
});

test('Shift-Alt-F formats the active document only, preserves undo, and never runs code', async ({ page }) => {
    await page.goto('/play/');
    await expect(preview(page).locator('.creature-name')).toHaveText('Blip');
    await setCode(page, 'CSS', 'p{color:red}');
    await setCode(page, 'JavaScript', 'const value={hello:"world"};');
    const editor = page.getByRole('textbox', { name: 'JavaScript code', exact: true });
    await editor.press('Shift+Alt+f');
    await expect(page.getByRole('status')).toHaveText('Document formatted. Click Run to update the preview.');
    await expectCode(page, 'JavaScript', 'const value = { hello: "world" };\n');
    await expect(preview(page).locator('.creature-name')).toHaveText('Blip');
    await editor.focus();
    await editor.press('ControlOrMeta+z');
    await expectCode(page, 'JavaScript', 'const value={hello:"world"};');
    await editor.press('Shift+Alt+f');
    await expect(page.getByRole('status')).toHaveText('Document formatted. Click Run to update the preview.');
    await expectCode(page, 'JavaScript', 'const value = { hello: "world" };\n');
    await page.getByRole('tab', { name: 'CSS', exact: true }).click();
    await expectCode(page, 'CSS', 'p{color:red}');
    await page.getByRole('textbox', { name: 'CSS code', exact: true }).press('Shift+Alt+f');
    await expect.poll(() => getCode(page, 'CSS')).toContain('color: red;');
    await setCode(page, 'JavaScript', 'const = ;');
    await editor.press('Shift+Alt+f');
    await expect(page.getByRole('status')).toHaveText('Formatting failed. Your code has not changed.');
    await expectCode(page, 'JavaScript', 'const = ;');
    await expect(page.locator('#play-errors')).toContainText('Unable to format JavaScript');
});

test('a pending format cannot overwrite a newer Run or edits', async ({ page }) => {
    await page.goto('/play/');
    await expect(preview(page).locator('.creature-name')).toHaveText('Blip');
    await setCode(page, 'JavaScript', 'const value={hello:"world"};');
    await page.evaluate(() => {
        document.querySelector('.play-workspace').dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyF', shiftKey: true, altKey: true, bubbles: true }));
        document.querySelector('#play-run').click();
    });

    await expectCode(page, 'JavaScript', 'const value={hello:"world"};');
    await expect(page.getByRole('status')).toHaveText('Preview running.');
    await page.evaluate(() => {
        document.querySelector('.play-workspace').dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyF', shiftKey: true, altKey: true, bubbles: true }));
        const editor = document.querySelector('#play-js textarea');
        editor.value = 'const newer = 2;';
        editor.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: 'const newer = 2;' }));
    });
    await expectCode(page, 'JavaScript', 'const newer = 2;');
    await expect(page.getByRole('status')).toHaveText('Code changed while formatting. Format again to apply it.');
});

test('Monaco uses self-hosted language workers and offers Brio API completion and JavaScript diagnostics', async ({ page }) => {
    const workerErrors = [];
    page.on('console', message => {
        if (/Could not create web worker|Unexpected usage|worker.*error/i.test(message.text()))
            workerErrors.push(message.text());
    });
    await page.goto('/play/');
    await expect(preview(page).locator('.creature-name')).toHaveText('Blip');
    await setCode(page, 'CSS', 'p { color: red; }');
    await setCode(page, 'HTML', '<p>Workers</p>');
    await setCode(page, 'JavaScript', 'brio.');
    const editor = page.getByRole('textbox', { name: 'JavaScript code', exact: true });
    await editor.press('Control+Space');
    await expect(page.getByRole('option', { name: 'createApp, Field', exact: true })).toBeVisible();
    await editor.press('Escape');
    await setCode(page, 'JavaScript', 'const = ;');
    await expect(page.locator('.squiggly-error').first()).toBeVisible();
    await expect.poll(() => page.workers().filter(worker =>
        /(?:html|css|ts|editor)\.worker/.test(worker.url())).length).toBe(4);
    for (const worker of page.workers())
        expect(new URL(worker.url()).origin).toBe(new URL(page.url()).origin);
    expect(workerErrors).toEqual([]);
});

test('Monaco command-palette Format Document uses Prettier and remains undoable', async ({ page }) => {
    await page.goto('/play/');
    await expect(preview(page).locator('.creature-name')).toHaveText('Blip');
    await setCode(page, 'JavaScript', 'const value={hello:"world"};');
    const editor = page.getByRole('textbox', { name: 'JavaScript code', exact: true });
    await editor.press('F1');
    await page.getByRole('textbox', { name: 'Type to narrow down results.' }).fill('>Format Document');
    await page.getByRole('option', { name: /^Format Document,/ }).click();
    await expect(page.getByRole('status')).toHaveText('Document formatted. Click Run to update the preview.');
    await expectCode(page, 'JavaScript', 'const value = { hello: "world" };\n');
    await editor.press('ControlOrMeta+z');
    await expectCode(page, 'JavaScript', 'const value={hello:"world"};');
});

test('Monaco context menus and search controls have themed opaque surfaces without site layout interference', async ({ page }) => {
    await page.goto('/play/');
    await expect(preview(page).locator('.creature-name')).toHaveText('Blip');
    await expect(page.getByRole('button', { name: 'Format', exact: true })).toHaveCount(0);
    for (const theme of ['light', 'dark']) {
        await page.evaluate(theme => { document.documentElement.dataset.theme = theme; }, theme);
        await setCode(page, 'HTML', '<p>Menu formatting</p>');
        const box = await page.locator('.monaco-editor').boundingBox();
        await page.mouse.click(box.x + 150, box.y + 40, { button: 'right' });
        await expect(page.getByRole('menu')).toBeVisible();
        const menu = page.locator('.monaco-menu-container > .monaco-scrollable-element');
        await expect(menu).toHaveCSS('background-color', theme === 'dark' ? 'rgb(17, 30, 50)' : 'rgb(255, 255, 255)');
        // Monaco enables menu mouse-up handlers after a 100 ms accidental-click guard.
        await page.waitForTimeout(150);
        await page.getByRole('menuitem', { name: /^Format Document/ }).click();
        await expect(page.getByRole('status')).toContainText('Document formatted');
        await page.getByRole('textbox', { name: 'HTML code', exact: true }).press('ControlOrMeta+f');
        await expect(page.getByRole('textbox', { name: 'Find', exact: true })).toBeVisible();
        await expect(page.locator('.find-widget')).toHaveCSS('background-color', theme === 'dark' ? 'rgb(17, 30, 50)' : 'rgb(255, 255, 255)');
        await expect(page.locator('.find-widget .monaco-inputbox').first()).toHaveCSS('background-color', theme === 'dark' ? 'rgb(11, 19, 34)' : 'rgb(250, 251, 253)');
        await expect(page.locator('.find-widget')).not.toHaveCSS('box-shadow', 'none');
        const controls = page.locator('.find-widget .button');
        for (const control of await controls.all()) {
            await expect(control).toHaveCSS('border-top-width', '0px');
            await expect(control).toHaveCSS('padding', '3px');
            await expect(control).toHaveCSS('transform', 'none');
            await expect(control).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
        }
        const close = page.getByRole('button', { name: 'Close (Escape)', exact: true });
        await close.hover();
        await expect(close).toHaveCSS('transform', 'none');
        await expect(close).toHaveCSS('border-top-width', '0px');
        await page.getByRole('textbox', { name: 'Find', exact: true }).fill('Menu');
        await page.getByRole('button', { name: 'Toggle Replace', exact: true }).click();
        const replacement = page.getByRole('textbox', { name: 'Replace', exact: true });
        await expect(replacement).toBeVisible();
        await replacement.fill('Search');
        await page.getByRole('button', { name: /^Replace All \(/ }).click();
        await expect.poll(() => getCode(page, 'HTML')).toContain('Search formatting');
        await page.keyboard.press('Escape');
    }
});

test('one Monaco instance preserves each document selection, scroll position, and undo history', async ({ page }) => {
    await page.goto('/play/');
    await expect(preview(page).locator('.creature-name')).toHaveText('Blip');
    const source = Array.from({ length: 40 }, (_, index) => `const v${index} = "${'x'.repeat(110)}";`).join('\n');
    await setCode(page, 'JavaScript', source);
    const editor = page.getByRole('textbox', { name: 'JavaScript code', exact: true });
    await editor.press('ControlOrMeta+a');
    await editor.press('ArrowRight');
    await editor.press(';');
    await editor.press('Shift+ArrowLeft');
    await editor.press('Shift+ArrowLeft');
    const selection = () => editor.evaluate(element => ({
        value: element.value,
        start: element.selectionStart,
        end: element.selectionEnd,
    }));
    const originalSelection = await selection();
    const scrollbar = page.locator('.monaco-editor .scrollbar.vertical .slider');
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const originalScroll = await scrollbar.evaluate(element => element.style.top);
    await setCode(page, 'CSS', 'p { color: red; }');
    await page.getByRole('tab', { name: 'JavaScript', exact: true }).click();
    await editor.focus();
    expect(await selection()).toEqual(originalSelection);
    await expect.poll(() => scrollbar.evaluate(element => element.style.top)).toBe(originalScroll);
    await expect(page.locator('.monaco-editor')).toHaveCount(1);
    await editor.press('ControlOrMeta+z');
    await expect.poll(() => getCode(page, 'JavaScript')).toMatch(/const v39 = "x{110}";$/);
});
