import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { examples } from '../../site/src/parts/examples.js';

const names = { disclosure: 'Disclosure & accordion', tabs: 'Tabs', dialog: 'Dialog', menu: 'Action menu' };
const frame = (page, id) => page.frameLocator(`iframe[data-part="${id}"]`);

test('parts gallery is a three-column directory; details provide previews, source, theme and copying', async ({ page, context }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/parts/');
    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(page.locator('.part-card')).toHaveCount(4);
    await expect(page.locator('iframe')).toHaveCount(0);
    expect(await page.locator('.parts-grid').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length)).toBe(3);
    await page.getByRole('heading', { name: 'Tabs', exact: true }).getByRole('link').click();
    await expect(frame(page, 'tabs').locator('.part-root')).toBeVisible();
    await page.getByRole('button', { name: 'Switch color theme' }).click();
    const theme = await page.locator('html').getAttribute('data-theme');
    await expect(frame(page, 'tabs').locator('html')).toHaveAttribute('data-theme', theme);
    await page.getByRole('tab', { name: 'Source', exact: true }).click();
    await expect(page.locator('#part-preview-panel')).toBeHidden();
    const templateCopy = page.locator('.part-source').first().locator('[data-copy-source]');
    const clockTime = new Date('2026-10-26T00:00:00Z');
    await page.clock.install({ time: clockTime });
    await page.clock.pauseAt(new Date(clockTime.getTime() + 1000));
    await expect(templateCopy).toHaveText('Copy');
    await expect(templateCopy.locator('svg[aria-hidden="true"]')).toBeVisible();
    await templateCopy.click();
    await expect(templateCopy).toHaveText('Copied!');
    await expect(templateCopy.locator('svg')).toBeVisible();
    await page.clock.runFor(1999);
    await expect(templateCopy).toHaveText('Copied!');
    await page.clock.runFor(1);
    await expect(templateCopy).toHaveText('Copy');
    await expect(templateCopy.locator('svg')).toBeVisible();
    await page.clock.resume();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toContain('id="brio-tabs-template"');
    expect(copied).toContain('@scope');
    expect(copied).toContain('b-on-keydown="$data.onKey($event)"');
    expect(copied).toBe(await templateCopy.getAttribute('data-copy-source'));
    await page.locator('.part-source').nth(1).locator('[data-copy-source]').click();
    await expect(page.locator('.part-source').nth(1).locator('[data-copy-source]')).toHaveText('Copied!');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toContain("setup({ el, $props })");
    await page.locator('.part-source').filter({ has: page.getByRole('heading', { name: 'Example parent data', exact: true }) }).locator('[data-copy-source]').click();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('"label": "Travel"');
    await page.locator('.part-source').filter({ has: page.getByRole('heading', { name: 'Use in your app', exact: true }) }).locator('[data-copy-source]').click();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('b-prop-content="$data.content"');
    await page.getByRole('tab', { name: 'Source', exact: true }).focus();
    await page.keyboard.press('Home');
    await expect(page.getByRole('tab', { name: 'Preview', exact: true })).toBeFocused();
    await expect(page.locator('#source')).toBeHidden();
    await page.getByRole('link', { name: 'View source', exact: true }).click();
    await expect(page.locator('#source')).toBeVisible();
    await page.reload();
    await expect(page.locator('#source')).toBeVisible();
    await page.setViewportSize({ width: 375, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Parts', exact: true })).toBeVisible();
    expect(errors).toEqual([]);
});

test('source copy failures preserve the label and icon and offer manual copying', async ({ page }) => {
    await page.addInitScript(() => {
        Object.defineProperty(navigator, 'clipboard', {
            value: { writeText: async () => { throw new Error('Clipboard denied'); } },
        });
    });
    await page.goto('/parts/tabs/#source');
    const source = page.locator('.part-source').first();
    const copy = source.locator('[data-copy-source]');
    await copy.click();
    await expect(source.getByRole('status')).toHaveText('Unable to copy: Clipboard denied. Select the source below and copy it manually.');
    await expect(copy).toHaveText('Copy');
    await expect(copy).toBeEnabled();
    await expect(copy.locator('svg')).toBeVisible();
});

test('disclosure is native, keyboard operable, and keeps expanded controls in sync', async ({ page }) => {
    await page.goto('/parts/disclosure/');
    const demo = frame(page, 'disclosure');
    const summary = demo.locator('summary').first();
    await summary.focus();
    await summary.press('Enter');
    await expect(demo.locator('details').first()).toHaveAttribute('open', '');
    await expect(demo.getByRole('status')).toHaveText('1 of 3 expanded');
    await demo.getByRole('button', { name: 'Expand all' }).click();
    await expect(demo.locator('details[open]')).toHaveCount(3);
    await expect(demo.getByRole('status')).toHaveText('3 of 3 expanded');
    await demo.getByRole('button', { name: 'Collapse all' }).click();
    await expect(demo.locator('details[open]')).toHaveCount(0);
    await expect(demo.getByRole('status')).toHaveText('0 of 3 expanded');
    await summary.focus();
    await summary.press('Space');
    await expect(demo.locator('details[open]')).toHaveCount(1);
});

test('tabs maintain ARIA relationships, roving focus and automatic keyboard activation', async ({ page }) => {
    await page.goto('/parts/tabs/');
    const demo = frame(page, 'tabs');
    const pack = demo.getByRole('tab', { name: 'Pack', exact: true });
    const enjoy = demo.getByRole('tab', { name: 'Enjoy', exact: true });
    await expect(pack).toHaveAttribute('aria-selected', 'true');
    await expect(demo.getByRole('tabpanel')).toHaveCount(1);
    await pack.focus();
    await pack.press('ArrowLeft');
    await expect(enjoy).toBeFocused();
    await expect(enjoy).toHaveAttribute('aria-selected', 'true');
    await expect(pack).toHaveAttribute('tabindex', '-1');
    await expect(demo.getByRole('tabpanel', { name: 'Enjoy' })).toBeVisible();
    await enjoy.press('ArrowRight');
    await expect(pack).toBeFocused();
    await pack.press('End');
    await expect(enjoy).toBeFocused();
    await enjoy.press('Home');
    await expect(pack).toBeFocused();
    await pack.press('Tab');
    await expect(demo.getByRole('tabpanel', { name: 'Pack' })).toBeFocused();
    await demo.getByRole('tab', { name: 'Travel', exact: true }).click();
    await expect(demo.getByRole('tabpanel', { name: 'Travel' })).toBeVisible();
});

test('native dialog contains focus, saves explicitly, and cancels without retaining drafts', async ({ page }) => {
    await page.goto('/parts/dialog/');
    await page.locator('iframe').scrollIntoViewIfNeeded();
    const demo = frame(page, 'dialog');
    const trigger = demo.getByRole('button', { name: 'Edit display name' });
    const dialog = demo.getByRole('dialog', { name: 'What should we call you?' });
    await expect(demo.getByRole('heading', { name: 'Make room for a pause.' })).toHaveCSS('font-size', '24px');
    await expect(trigger).toHaveCSS('border-radius', '7px');
    await expect(trigger).toHaveCSS('padding', '8px 14px');
    await expect(demo.getByRole('status')).toHaveCSS('margin-top', '16px');
    await trigger.click();
    await expect(dialog).toBeVisible();
    const input = demo.getByRole('textbox', { name: 'Display name' });
    await expect(input).toBeFocused();
    await expect(dialog.getByRole('button', { name: 'Cancel', exact: true })).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await input.fill('Mochi');
    await input.press('Enter');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    await expect(demo.getByRole('status')).toHaveText('Hello, Mochi.');
    await trigger.click();
    await input.fill('Unsaved');
    await input.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    await trigger.click();
    await expect(input).toHaveValue('Mochi');
    for (let index = 0; index < 5; index++) {
        await page.keyboard.press('Tab');
        expect(await dialog.evaluate(el => !el.ownerDocument.hasFocus() || el.contains(el.ownerDocument.activeElement))).toBe(true);
    }
    for (let index = 0; index < 5; index++) {
        await page.keyboard.press('Shift+Tab');
        expect(await dialog.evaluate(el => !el.ownerDocument.hasFocus() || el.contains(el.ownerDocument.activeElement))).toBe(true);
    }
    await demo.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(trigger).toBeFocused();
});

test('action menu supports arrows, typeahead, actions, outside dismissal and Tab exit', async ({ page }) => {
    await page.goto('/parts/menu/');
    const demo = frame(page, 'menu');
    const trigger = demo.getByRole('button', { name: 'Note actions' });
    const menu = demo.getByRole('menu', { name: 'Note actions' });
    const first = demo.getByRole('menuitem', { name: 'Duplicate' });
    const last = demo.getByRole('menuitem', { name: 'Archive' });
    await trigger.focus();
    await trigger.press('ArrowUp');
    await expect(last).toBeFocused();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await last.press('ArrowDown');
    await expect(first).toBeFocused();
    await first.press('End');
    await expect(last).toBeFocused();
    await last.press('Home');
    await expect(first).toBeFocused();
    await first.press('e');
    await expect(demo.getByRole('menuitem', { name: 'Export' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(menu).toBeHidden();
    await expect(trigger).toBeFocused();
    await expect(demo.getByRole('status')).toContainText('Export selected');
    await trigger.press('Space');
    await expect(first).toBeFocused();
    await first.press('Escape');
    await expect(trigger).toBeFocused();
    await trigger.press('ArrowDown');
    await expect(first).toBeFocused();
    await first.press('Tab');
    await expect(menu).toBeHidden();
    await expect(demo.getByRole('link', { name: 'Back to heading' })).toBeFocused();
    const previewDocument = await demo.locator('html').elementHandle();
    await demo.getByRole('link', { name: 'Back to heading' }).press('Enter');
    await expect(demo.getByRole('heading', { name: 'A few things you can do.' })).toBeFocused();
    expect(await previewDocument.evaluate(el => el.isConnected)).toBe(true);
    await expect(demo.locator('iframe')).toHaveCount(0);
    await expect(trigger).toBeVisible();
    await trigger.click();
    await expect(first).toBeFocused();
    await page.getByRole('link', { name: 'All parts' }).focus();
    await expect(menu).toBeHidden();
});

for (const [id, name] of Object.entries(names)) {
    test(`${name} opens its exact recipe in the playground without automatic execution`, async ({ page }) => {
        await page.goto(`/parts/${id}/`);
        const html = await page.locator('#code-html').textContent();
        await page.getByRole('link', { name: 'Open in Playground' }).click();
        await expect(page.getByRole('status')).toContainText('It has not executed');
        await expect(page.locator('iframe')).toHaveCount(0);
        await page.getByRole('button', { name: 'Run', exact: true }).click();
        const demo = page.frameLocator('iframe[title="Brio playground preview"]');
        if (id === 'dialog') await expect(demo.getByRole('button', { name: 'Edit display name' })).toBeVisible();
        else await expect(demo.locator(`brio-${id} .part-root`)).toBeVisible();
        expect(html).toContain(`id="brio-${id}-template"`);
        if (id === 'dialog') {
            await demo.getByRole('button', { name: 'Edit display name' }).click();
            await expect(demo.getByRole('dialog')).toBeVisible();
        } else if (id === 'menu') {
            await demo.getByRole('button', { name: 'Note actions' }).click();
            await expect(demo.getByRole('menu')).toBeVisible();
        } else if (id === 'tabs') {
            await demo.getByRole('tab', { name: 'Travel' }).click();
            await expect(demo.getByRole('tabpanel', { name: 'Travel' })).toBeVisible();
        } else {
            await demo.getByRole('button', { name: 'Expand all' }).click();
            await expect(demo.locator('details[open]')).toHaveCount(3);
        }
        await expect(page.locator('#play-console-errors')).toBeHidden();
    });
}

test('parts source remains readable without JavaScript and docs expose every integration', async ({ browser, page, baseURL }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const reader = await context.newPage();
    await reader.goto(new URL('/parts/tabs/', baseURL).href);
    await expect(reader.locator('#code-html')).toContainText('brio-tabs-template');
    await expect(reader.getByRole('heading', { name: 'Keyboard & focus' })).toBeVisible();
    await context.close();
    await page.goto('/integrations/overview/');
    for (const path of ['plain-html', 'rails', 'laravel', 'django', 'wordpress']) {
        await expect(page.locator(`main a[href="/integrations/${path}/"]`).first()).toBeVisible();
    }
    await page.goto('/integrations/counter.html');
    await page.getByRole('button', { name: 'Add one' }).click();
    await expect(page.locator('output')).toHaveText('4');
});

test('every recipe fits a narrow screen and the modal remains usable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 900 });
    for (const id of Object.keys(names)) {
        await page.goto(`/parts/${id}/`);
        await page.locator('iframe').scrollIntoViewIfNeeded();
        const demo = frame(page, id);
        if (id === 'dialog') await expect(demo.getByRole('button', { name: 'Edit display name' })).toBeVisible();
        else await expect(demo.locator('.part-root')).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        expect(await demo.locator('html').evaluate(el => el.scrollWidth <= innerWidth)).toBe(true);
        if (id === 'dialog') {
            await demo.getByRole('button', { name: 'Edit display name' }).click();
            await demo.getByRole('textbox', { name: 'Display name' }).fill('Mobile');
            await demo.getByRole('button', { name: 'Save name', exact: true }).click();
            await expect(demo.getByRole('status')).toHaveText('Hello, Mobile.');
        }
    }
});

test('dialog slots keep parent form ownership, independent instances, validation, and controlled closing', async ({ page }) => {
    const html = readFileSync(new URL('../../site/src/parts/recipes/dialog.html', import.meta.url), 'utf8');
    const js = readFileSync(new URL('../../site/src/parts/recipes/dialog.js', import.meta.url), 'utf8');
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/integrations/counter.html');
    await page.evaluate(({ html, js }) => {
        document.body.insertAdjacentHTML('beforeend', html);
        const region = document.createElement('main');
        region.id = 'dialog-slot-test';
        region.innerHTML = `
          <button id="first-opener" b-on-click="$data.firstOpen = true">Edit profile</button>
          <button id="second-opener" b-on-click="$data.secondOpen = true">Read notice</button>
          <p id="parent-value" b-text="$data.saved"></p>
          <div b-if="$data.visible">
            <brio-dialog b-prop-open="$data.firstOpen" b-prop-accent="$data.accent"
              b-on-request-close="$data.requested++" b-on-closed="$data.closed++">
              <strong slot="title" b-text="$data.heading"></strong>
              <form b-on-submit.prevent="$data.save()">
                <label>Profile name <input required b-model="$data.draft"></label>
                <label>About you <textarea b-model="$data.about"></textarea></label>
                <button type="submit">Save profile</button>
              </form>
              <button type="button" slot="footer" b-on-click="$data.firstOpen = false">Dismiss</button>
            </brio-dialog>
            <brio-dialog b-prop-open="$data.secondOpen" title="Notice" close-label="Close notice"
              b-on-request-close="$data.secondOpen = false">
              <p b-text="$data.notice"></p>
            </brio-dialog>
          </div>`;
        document.body.append(region);
        const app = brio.createApp({ state: () => ({
            firstOpen: false, secondOpen: false, visible: true, accent: '#7844aa',
            heading: 'Custom profile', notice: 'Custom notice', draft: '', about: '',
            saved: 'Not saved', requested: 0, closed: 0,
            save() { this.saved = this.draft + ': ' + this.about; this.firstOpen = false; },
        }) });
        app.component('brio-dialog', new Function(`${js}\nreturn dialogComponent;`)());
        app.mount(region);
        window.componentTestApp = app;
    }, { html, js });
    const region = page.locator('#dialog-slot-test');
    const first = region.locator('brio-dialog').first();
    const second = region.locator('brio-dialog').nth(1);
    await expect(region.locator('dialog[open]')).toHaveCount(0);
    await region.locator('#first-opener').click();
    await expect(first.getByRole('dialog', { name: 'Custom profile' })).toBeVisible();
    await expect(second.getByRole('dialog')).toHaveCount(0);
    await expect(first.locator('.part-root')).toHaveCSS('--part-accent', '#7844aa');
    await first.getByRole('button', { name: 'Save profile' }).click();
    await expect(first.getByRole('textbox', { name: 'Profile name' })).toBeFocused();
    await expect(region.locator('#parent-value')).toHaveText('Not saved');
    await first.getByRole('textbox', { name: 'Profile name' }).fill('Ada');
    await first.getByRole('textbox', { name: 'About you' }).fill('Likes native HTML');
    await page.evaluate(() => { window.componentTestApp.state.heading = 'Updated profile'; });
    await expect(first.getByRole('dialog', { name: 'Updated profile' })).toBeVisible();
    await first.getByRole('textbox', { name: 'Profile name' }).press('Enter');
    await expect(first.locator('dialog')).not.toHaveAttribute('open');
    await expect(region.locator('#parent-value')).toHaveText('Ada: Likes native HTML');
    await expect(region.locator('#first-opener')).toBeFocused();
    await region.locator('#first-opener').click();
    await first.getByRole('textbox', { name: 'Profile name' }).press('Escape');
    await expect.poll(() => page.evaluate(() => window.componentTestApp.state.requested)).toBe(1);
    await expect(first.locator('dialog')).toHaveAttribute('open', '');
    await first.getByRole('button', { name: 'Dismiss' }).click();
    await expect(first.locator('dialog')).not.toHaveAttribute('open');
    await expect.poll(() => page.evaluate(() => window.componentTestApp.state.closed)).toBe(2);
    await region.locator('#second-opener').click();
    await expect(second.getByRole('dialog', { name: 'Notice' })).toBeVisible();
    await expect(second.getByText('Custom notice')).toBeVisible();
    await second.getByRole('button', { name: 'Close notice' }).click();
    await expect(second.locator('dialog')).not.toHaveAttribute('open');
    const ids = await region.locator('[id]').evaluateAll(nodes => nodes.map(node => node.id));
    expect(new Set(ids).size).toBe(ids.length);
    await region.locator('#first-opener').click();
    await page.evaluate(() => { window.componentTestApp.state.visible = false; });
    await expect(region.locator('dialog')).toHaveCount(0);
    await page.evaluate(() => {
        window.componentTestApp.state.firstOpen = false;
        window.componentTestApp.state.visible = true;
    });
    await region.locator('#second-opener').click();
    await expect(second.getByRole('dialog')).toBeVisible();
    await page.evaluate(() => window.componentTestApp.dispose());
    await expect(region.locator('dialog[open]')).toHaveCount(0);
    expect(errors).toEqual([]);
});

for (const id of Object.keys(names).filter(id => id !== 'dialog')) {
    test(`${id} registers on an existing app with independent instances and scoped styles`, async ({ page }) => {
        const html = readFileSync(new URL(`../../site/src/parts/recipes/${id}.html`, import.meta.url), 'utf8');
        const js = readFileSync(new URL(`../../site/src/parts/recipes/${id}.js`, import.meta.url), 'utf8');
        await page.goto('/integrations/counter.html');
        await page.evaluate(({ html, js, id, content }) => {
            const template = document.createElement('div');
            template.innerHTML = html;
            document.body.append(template);
            const region = document.createElement('main');
            region.id = 'component-test';
            region.innerHTML = `<button id="parent-counter" b-on-click="$data.count++" b-text="$data.count"></button>
                <button id="remove-parts" b-on-click="$data.visible = false">Remove</button>
                <button id="add-parts" b-on-click="$data.visible = true">Add</button>
                <p id="outside-style">Outside</p>
                <div b-if="$data.visible" b-bind-style="{ '--part-accent': $data.accent }">
                  <brio-${id} title="First" b-prop-content="$data.first" b-prop-accent="$data.accent"
                    b-on-action="$data.act($event.detail)">
                    ${id === 'menu' ? '<span slot="trigger"><span aria-hidden="true">+</span> <span b-text="$data.first.triggerLabel"></span></span>'
                        : `<div${id === 'tabs' ? ' slot="panel"' : ''}><button type="button"
                            b-on-click="$data.projectedClicks++" b-text="$data.projectedLabel"></button>
                            <strong b-if="$slot.item.id === '${id === 'tabs' ? 'pack' : 'build'}'" b-text="$slot.item.body"></strong>
                            <p b-else b-text="$slot.item.body"></p></div>`}
                  </brio-${id}>
                  <brio-${id} title="Static title" b-prop-title="'Named title'"
                    b-props="{ title: 'Second', content: $data.second }"></brio-${id}>
                </div>`;
            document.body.append(region);
            const definition = new Function(`${js}\nreturn ${id}Component;`)();
            const app = brio.createApp({ state: () => ({
                count: 7, visible: true, accent: '#7844aa', projectedClicks: 0, projectedLabel: 'Parent slot',
                first: structuredClone(content), second: structuredClone(content),
                save({ value }) { this.first.value = value; this.first.message = value; },
                act({ label }) { this.first.message = label; },
            }) });
            app.component(`brio-${id}`, definition);
            app.mount(region);
            window.componentTestApp = app;
            window.partEvents = [];
            region.addEventListener('action', event => window.partEvents.push(event.detail));
        }, { html, js, id, content: examples[id] });
        const region = page.locator('#component-test');
        const first = region.locator(`brio-${id}`).first();
        const second = region.locator(`brio-${id}`).nth(1);
        await expect(first.getByRole('heading', { name: 'First', exact: true })).toBeVisible();
        await expect(second.getByRole('heading', { name: 'Second', exact: true })).toBeVisible();
        await expect(first.locator('.part-root')).toHaveCSS('--part-accent', '#7844aa');
        await page.evaluate(() => { window.componentTestApp.state.accent = '#226655'; });
        await expect(first.locator('.part-root')).toHaveCSS('--part-accent', '#226655');
        const ids = await region.locator('[id]').evaluateAll(els => els.map(el => el.id));
        expect(new Set(ids).size).toBe(ids.length);
        expect(await region.locator('#outside-style').evaluate(el => getComputedStyle(el).marginBottom)).toBe('16px');
        if (id === 'tabs') {
            await first.getByRole('button', { name: 'Parent slot' }).first().click();
            expect(await page.evaluate(() => window.componentTestApp.state.projectedClicks)).toBe(1);
            await expect(second.getByRole('button', { name: 'Parent slot' })).toHaveCount(0);
            await first.getByRole('tab', { name: 'Travel', exact: true }).click();
            await expect(first.getByRole('tabpanel', { name: 'Travel' })).toBeVisible();
            await expect(second.getByRole('tabpanel', { name: 'Pack' })).toBeVisible();
            await expect(first.getByRole('tab', { name: 'Travel', exact: true })).toHaveClass('is-selected');
            await expect(first.getByRole('tab', { name: 'Travel', exact: true })).toHaveCSS('border-top-color', 'rgb(34, 102, 85)');
        } else if (id === 'disclosure') {
            await first.getByRole('button', { name: 'Expand all' }).click();
            await first.getByRole('button', { name: 'Parent slot' }).first().click();
            expect(await page.evaluate(() => window.componentTestApp.state.projectedClicks)).toBe(1);
            await expect(first.locator('details[open]')).toHaveCount(3);
            await expect(second.locator('details[open]')).toHaveCount(0);
        } else {
            await first.getByRole('button', { name: 'Note actions', exact: true }).click();
            await first.getByRole('menuitem', { name: 'Archive' }).click();
            await expect(second.getByRole('status')).toContainText('Choose an action.');
            expect(await page.evaluate(() => window.partEvents)).toEqual([{ id: 'archive', label: 'Archive' }]);
            await first.getByRole('button', { name: 'Note actions', exact: true }).click();
        }
        await region.locator('#parent-counter').click();
        await expect(region.locator('#parent-counter')).toHaveText('8');
        await region.locator('#remove-parts').click();
        await expect(region.locator(`brio-${id}`)).toHaveCount(0);
        await region.locator('#add-parts').click();
        await expect(region.locator(`brio-${id}`)).toHaveCount(2);
        await page.evaluate(id => {
            const state = window.componentTestApp.state;
            state.first = {
                ...state.first, title: 'Custom title', description: '<b>Plain text, not markup</b>',
                label: 'Custom list', expandLabel: 'Show answers', collapseLabel: 'Hide answers',
                countLabel: '{expanded}/{total} open', triggerLabel: 'Custom trigger',
                dialogTitle: 'Custom editor', body: 'Custom body', inputLabel: 'Custom field',
                cancelLabel: 'Discard', saveLabel: 'Apply', maxLength: 12, value: 'Initial',
                message: 'Custom status', backLabel: 'Return',
                items: [
                    { id: 'a / 1', label: 'Alpha', heading: 'Alpha heading', body: 'Alpha body' },
                    { id: 'b', label: 'Beta', heading: 'Beta heading', body: 'Beta body' },
                ],
            };
            window.partEvents = [];
        }, id);
        await expect(second.getByRole('heading', { name: 'Second', exact: true })).toBeVisible();
        if (id === 'tabs') {
            await expect(first.getByRole('tab')).toHaveCount(2);
            await first.getByRole('tab', { name: 'Beta' }).click();
            await page.evaluate(() => { window.componentTestApp.state.first.items.reverse(); });
            await expect(first.getByRole('tab').first()).toHaveText('Beta');
            await expect(first.getByRole('tabpanel', { name: 'Beta' })).toBeVisible();
            const relationships = await first.locator('[role="tab"]').evaluateAll(tabs => tabs.every(tab => {
                const panel = document.getElementById(tab.getAttribute('aria-controls'));
                return panel?.getAttribute('aria-labelledby') === tab.id;
            }));
            expect(relationships).toBe(true);
            await first.getByRole('tab', { name: 'Beta' }).press('End');
            await expect(first.getByRole('tab', { name: 'Alpha' })).toBeFocused();
            await page.evaluate(() => { window.componentTestApp.state.first.items.pop(); });
            await expect(first.getByRole('tab', { name: 'Beta' })).toHaveAttribute('aria-selected', 'true');
            await expect(second.getByRole('tab')).toHaveCount(3);
        } else if (id === 'disclosure') {
            await expect(first.locator('details')).toHaveCount(2);
            await first.getByRole('button', { name: 'Show answers' }).click();
            await expect(first.getByRole('status')).toHaveText('2/2 open');
            await page.evaluate(() => { window.componentTestApp.state.first.items.shift(); });
            await expect(first.getByRole('status')).toHaveText('1/1 open');
            await first.getByRole('button', { name: 'Hide answers' }).click();
            await expect(first.getByRole('status')).toHaveText('0/1 open');
            await expect(second.locator('details')).toHaveCount(3);
        } else if (id === 'menu') {
            await first.getByRole('button', { name: 'Custom trigger', exact: true }).click();
            await expect(first.getByRole('menuitem')).toHaveCount(2);
            await first.getByRole('menuitem', { name: 'Alpha' }).press('b');
            await expect(first.getByRole('menuitem', { name: 'Beta' })).toBeFocused();
            await first.getByRole('menuitem', { name: 'Beta' }).press('Enter');
            expect(await page.evaluate(() => window.partEvents)).toEqual([{ id: 'b', label: 'Beta' }]);
            await expect(first.getByRole('status')).toHaveText('Beta');
            await expect(second.getByRole('status')).toContainText('Choose an action.');
            const focused = await first.evaluate(async host => {
                host.querySelector('[data-trigger]').click();
                await new Promise(resolve => queueMicrotask(resolve));
                [...host.querySelectorAll('[role="menuitem"]')].at(-1).focus();
                await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
                return document.activeElement.textContent;
            });
            expect(focused, 'opening focus must not override a later user move').toBe('Beta');
            await page.keyboard.press('Escape');
        }
        if (id !== 'dialog') {
            await page.evaluate(() => { window.componentTestApp.state.first.items = []; });
            if (id === 'tabs') {
                await expect(first.getByRole('tab')).toHaveCount(0);
                await expect(first.getByRole('tabpanel')).toHaveCount(0);
            } else if (id === 'disclosure') {
                await expect(first.locator('details')).toHaveCount(0);
                await expect(first.getByRole('status')).toHaveText('0/0 open');
            } else {
                await first.getByRole('button', { name: 'Custom trigger', exact: true }).click();
                await expect(first.getByRole('button', { name: 'Custom trigger', exact: true })).toHaveAttribute('aria-expanded', 'false');
            }
        }
        await page.evaluate(() => window.componentTestApp.dispose());
    });
}
