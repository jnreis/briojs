import { test, expect } from '@playwright/test';

const astro = 'http://127.0.0.1:4336';

test('Lab frames the Astro fixture with page swaps, sizing, and theme sync', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/');
    const section = page.locator('#astro-lab');
    await expect(section).toHaveAttribute('data-state', 'live', { timeout: 20_000 });
    const frame = page.frameLocator('#astro-frame');
    await expect(page.locator('#astro-frame-offline')).toBeHidden();
    await expect(page.locator('#astro-frame-address')).toHaveText('127.0.0.1:4336/');
    await expect(page.locator('#astro-launch-link')).toHaveAttribute('href', `${astro}/?lab=${encodeURIComponent('http://127.0.0.1:4335')}`);

    await expect(frame.locator('html')).toHaveAttribute('data-lab-embedded', '');
    await expect(frame.locator('body > .playground-header')).toBeHidden();
    await expect(frame.locator('body > .playground-footer')).toBeHidden();

    const player = frame.locator('[data-player] button');
    const local = frame.locator('[data-page] > button');
    await expect(player).toHaveText('0');
    await player.click();
    await player.click();
    await local.click();
    await expect(player).toHaveText('2');
    await expect(local).toHaveText('1');
    await frame.getByRole('link', { name: 'Other', exact: true }).click();
    await expect(frame.getByRole('heading', { name: 'Other', exact: true })).toBeVisible();
    await expect(page.locator('#astro-frame-address')).toHaveText('127.0.0.1:4336/other');
    await expect(page.locator('#astro-launch-link')).toHaveAttribute('href', /:4336\/other\?lab=/);
    await expect(player).toHaveText('2');
    await expect(local).toHaveText('0');
    await expect(frame.locator('html')).toHaveAttribute('data-lab-embedded', '');

    const height = await page.locator('#astro-frame').evaluate(element => element.getBoundingClientRect().height);
    expect(height).toBeGreaterThan(360);
    const astroFrame = page.frame({ url: /:4336\// });
    await expect.poll(() => astroFrame.evaluate(() => document.documentElement.scrollHeight - innerHeight)).toBeLessThanOrEqual(1);

    const labTheme = () => page.evaluate(() => document.documentElement.dataset.theme);
    await expect(frame.locator('html')).toHaveAttribute('data-theme', await labTheme());
    await page.locator('#theme-toggle').click();
    await expect(frame.locator('html')).toHaveAttribute('data-theme', await labTheme());

    await frame.getByRole('link', { name: 'Full navigation' }).click();
    await expect(frame.getByRole('heading', { name: 'A different document.' })).toBeVisible();
    await expect(page.locator('#astro-frame-address')).toHaveText('127.0.0.1:4336/away');
    await expect(frame.locator('body > .playground-header')).toBeHidden();
    await expect(frame.locator('html')).toHaveAttribute('data-theme', await labTheme());

    await page.getByRole('button', { name: 'Restart frame' }).click();
    await expect(page.locator('#astro-frame-address')).toHaveText('127.0.0.1:4336/');
    await expect(frame.locator('[data-player] button')).toHaveText('0');
    expect(errors).toEqual([]);
});

test('Lab explains how to start Astro and connects once the server answers', async ({ page }) => {
    await page.route(`${astro}/**`, route => route.abort());
    await page.goto('/');
    const offline = page.locator('#astro-frame-offline');
    await expect(offline).toBeVisible();
    await expect(offline).toContainText('npm run lab');
    await expect(page.locator('#astro-lab')).toHaveAttribute('data-state', 'offline');
    await expect(page.locator('#astro-frame')).toBeHidden();
    await page.unroute(`${astro}/**`);
    await expect(page.locator('#astro-lab')).toHaveAttribute('data-state', 'live', { timeout: 20_000 });
    await expect(offline).toBeHidden();
    await expect(page.frameLocator('#astro-frame').locator('[data-player] button')).toHaveText('0');
});
