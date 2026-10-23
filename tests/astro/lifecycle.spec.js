import { test, expect } from '@playwright/test';

test('shared theme survives Astro swaps, reloads, and full document navigation', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    await page.getByRole('button', { name: 'Switch color theme' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('[data-page]')).toHaveCSS('background-color', 'rgb(17, 30, 50)');
    await page.locator('a[href="/other"]').click();
    await expect(page).toHaveURL('/other');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.getByRole('button', { name: 'Switch color theme' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await page.locator('a[href="/away"]').click();
    await expect(page).toHaveURL('/away');
    await page.getByRole('button', { name: 'Switch color theme' }).click();
    await page.goBack({ waitUntil: 'commit' });
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.setViewportSize({ width: 390, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('Astro lab exposes real lifecycle data, lazy release, and a return address', async ({ page }) => {
    await page.goto('/?lab=http%3A%2F%2F127.0.0.1%3A4335');
    await expect(page.locator('#lab-return')).toHaveAttribute('href', 'http://127.0.0.1:4335/');
    await expect.poll(async () => JSON.parse(await page.locator('#lifecycle-readout').innerText()).islands.live).toBe(2);
    await page.getByRole('button', { name: 'Send window pulse' }).click();
    await expect.poll(async () => JSON.parse(await page.locator('#lifecycle-readout').innerText()).islands.pulses).toBe(2);
    await page.locator('a[href="/other"]').click();
    await expect.poll(async () => JSON.parse(await page.locator('#lifecycle-readout').innerText()).islands.disposed).toBe(1);
    await expect(page.locator('#lab-return')).toHaveAttribute('href', 'http://127.0.0.1:4335/');
    await page.locator('a[href="/lazy"]').click();
    await page.getByRole('button', { name: 'Release pending modules' }).click();
    await expect(page.locator('#retained b')).toHaveText('7');
    await expect.poll(async () => JSON.parse(await page.locator('#lifecycle-readout').innerText()).lazy.calls.length).toBe(2);
    await expect(page.getByRole('button', { name: 'Release pending modules' })).toBeHidden();
});

test('Astro swaps release local apps, preserve actual islands, and do not accumulate behavior', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/');
    const local = page.locator('[data-page] button');
    const player = page.locator('[data-player] button');
    await expect(local).toHaveText('0');
    await player.click();
    await player.click();
    await local.click();
    await page.evaluate(() => {
        window.savedPlayer = document.querySelector('[data-player]');
        window.oldLocal = document.querySelector('[data-page] button');
        document.dispatchEvent(new Event('astro:page-load'));
    });
    expect(await page.evaluate(() => window.brioLifecycle.mounted)).toBe(2);

    for (const destination of ['/other', '/', '/other']) {
        await page.locator(`a[href="${destination}"]`).click();
        await expect(page).toHaveURL(destination);
        await expect(local).toHaveText('0');
        await expect(player).toHaveText('2');
        expect(await page.evaluate(() => window.savedPlayer === document.querySelector('[data-player]'))).toBe(true);
        await page.evaluate(() => window.dispatchEvent(new Event('brio:pulse')));
    }
    expect(await page.evaluate(() => ({ ...window.brioLifecycle }))).toEqual({
        mounted: 5, disposed: 3, aborted: 3, pulses: 6, live: 2,
    });
    await page.evaluate(() => window.oldLocal.click());
    expect(await page.evaluate(() => window.oldLocal.textContent)).toBe('1');
    await page.goBack();
    await expect(page).toHaveURL('/');
    await expect(player).toHaveText('2');
    await page.locator('a[href="/plain"]').click();
    await expect(page).toHaveURL('/plain');
    await expect(page.locator('[data-player]')).toHaveCount(0);
    expect(await page.evaluate(() => window.brioLifecycle.live)).toBe(1);
    await page.locator('a[href="/"]').click();
    await expect(player).toHaveText('0');
    expect(await page.evaluate(() => window.savedPlayer === document.querySelector('[data-player]'))).toBe(false);
    expect(errors).toEqual([]);
    expect(await page.evaluate(() => window.lazyLifecycle)).toEqual({ loads: 0, calls: [], errors: [] });
});

test('freeze/restore lifecycle notifications do not dispose or duplicate mounts', async ({ page }) => {
    await page.goto('/');
    const player = page.locator('[data-player] button');
    await expect(player).toHaveText('0');
    await player.click();
    await page.evaluate(() => {
        window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true }));
        window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
        document.dispatchEvent(new Event('astro:page-load'));
        window.dispatchEvent(new Event('brio:pulse'));
    });

    await expect(player).toHaveText('1');
    expect(await page.evaluate(() => ({ ...window.brioLifecycle }))).toEqual({
        mounted: 2, disposed: 0, aborted: 0, pulses: 2, live: 2,
    });
});

test('a real document navigation restores a live island from browser back/forward cache', async ({ page }) => {
    const session = await page.context().newCDPSession(page);
    await session.send('Page.enable');
    const misses = [];
    session.on('Page.backForwardCacheNotUsed', event => misses.push(event));
    await page.goto('/');
    const player = page.locator('[data-player] button');
    await expect(player).toHaveText('0');
    await player.click();
    await page.evaluate(() => {
        window.savedPlayer = document.querySelector('[data-player]');
        window.addEventListener('pageshow', event => {
            window.restoredFromCache = event.persisted;
            console.debug(`brio:pageshow:${event.persisted}`);
        });
    });
    await page.locator('a[href="/away"]').click();
    await expect(page).toHaveURL('/away');
    const restored = page.waitForEvent('console', {
        predicate: message => message.text() === 'brio:pageshow:true',
        timeout: 5000,
    });
    await page.goBack({ waitUntil: 'commit' });
    await restored;
    await expect(page).toHaveURL('/');
    await expect.poll(() => page.evaluate(() => window.restoredFromCache), { message: JSON.stringify(misses) }).toBe(true);
    expect(await page.evaluate(() => window.savedPlayer === document.querySelector('[data-player]'))).toBe(true);
    await expect(player).toHaveText('1');
    await player.click();
    await expect(player).toHaveText('2');
    expect(await page.evaluate(() => window.brioLifecycle.mounted)).toBe(2);
});

test('lazy code loads only on discovery; pending retained roots finish while outgoing roots never create apps', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/lazy');
    await expect.poll(() => page.evaluate(() => window.lazyLifecycle?.loads)).toBe(1);
    await page.evaluate(() => { window.pendingRoot = document.getElementById('retained'); });
    await page.locator('a[href="/lazy-next"]').click();
    await expect(page).toHaveURL('/lazy-next');
    expect(await page.evaluate(() => window.pendingRoot === document.getElementById('retained'))).toBe(true);
    expect(await page.evaluate(() => window.lazyLifecycle.calls)).toEqual([]);
    await page.evaluate(() => window.releaseLazy());
    await expect(page.locator('#retained b')).toHaveText('7');
    await expect(page.locator('#incoming b')).toHaveText('11');
    expect(await page.evaluate(() => window.lazyLifecycle)).toEqual({
        loads: 1, calls: ['retained', 'incoming'], errors: [],
    });
    await page.locator('a[href="/other"]').click();
    await expect(page).toHaveURL('/other');
    expect(await page.evaluate(() => window.brioLifecycle.live)).toBe(2);
    expect(errors).toEqual([]);
});

test('island configuration and actual import failures reach onError while other apps work', async ({ page }) => {
    const uncaught = [];
    page.on('pageerror', error => uncaught.push(error.message));
    await page.goto('/errors');
    await expect.poll(() => page.evaluate(() => window.lazyLifecycle?.errors.length)).toBe(3);
    const errors = await page.evaluate(() => window.lazyLifecycle.errors);
    expect(errors.map(error => error.name).sort()).toEqual(['broken', 'counter', 'unknown']);
    expect(errors.find(error => error.name === 'broken').message).toContain('Deliberate fixture module failure');
    const local = page.locator('[data-page] button');
    await local.click();
    await expect(local).toHaveText('1');
    await page.evaluate(() => document.dispatchEvent(new Event('astro:page-load')));
    expect(await page.evaluate(() => window.lazyLifecycle.errors.length)).toBe(3);
    expect(uncaught).toEqual([]);
});
