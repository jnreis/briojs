import { test, expect } from '@playwright/test';
import { examples } from '../../site/data/examples.mjs';

for (const example of examples) {
    test(`gallery opens a working ${example.id} demo`, async ({ page, context }) => {
        const errors = [];
        context.on('weberror', error => errors.push(error.error().message));
        await page.goto('/examples/');
        await page.evaluate(() => localStorage.setItem('starlight-theme', 'dark'));
        await page.reload();
        const link = page.locator(`a[href="/demos/${example.id}/index.html"]`);
        await expect(link).not.toHaveAttribute('target', '_blank');
        await page.locator(`a[href="/demos/${example.id}/index.html"]`).click();
        const demo = page;
        await demo.waitForLoadState();
        await expect(demo).toHaveURL(url => url.pathname === `/demos/${example.id}/index.html`);
        expect(context.pages()).toHaveLength(1);
        await expect(demo.locator('html')).toHaveAttribute('data-theme', 'dark');
        expect(await demo.locator('body').evaluate(element => getComputedStyle(element).color)).toBe('rgb(237, 243, 255)');
        await expect(demo.getByRole('link', { name: '← Brio examples' })).toBeVisible();
        await expect(demo).not.toHaveTitle(/Page not found/);
        await expect(demo.locator('main')).toBeVisible();
        if (example.id === 'counter') {
            await expect(demo.getByTestId('count')).toHaveText('0');
            await demo.getByTestId('increment').click();
            await expect(demo.getByTestId('count')).toHaveText('1');
        }

        expect(errors).toEqual([]);
        await demo.getByRole('button', { name: 'Switch color theme' }).click();
        await expect(demo.locator('html')).toHaveAttribute('data-theme', 'light');
        await demo.reload();
        await expect(demo.locator('html')).toHaveAttribute('data-theme', 'light');
        await demo.getByRole('link', { name: '← Brio examples' }).click();
        await expect(demo).toHaveURL(/\/examples\/$/);
        await expect(demo.locator('html')).toHaveAttribute('data-theme', 'light');
    });
}

test('demos follow system theme until a preference is saved', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/demos/temperature-converter/index.html');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.getByRole('button', { name: 'Switch color theme' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await page.getByRole('link', { name: '← Brio examples' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await page.goBack();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});
