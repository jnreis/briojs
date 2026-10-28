import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const origin = 'https://brio.test';
const policy = "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'";
const dist = name => readFileSync(new URL(`../../dist/${name}`, import.meta.url), 'utf8');

const page = (core, app) => `<!doctype html>
<html><head><meta charset="utf-8"><title>Brio CSP</title></head>
<body>
<main id="app">
    <p id="page-text">Page: \${$data.count}</p>
    <button id="page-button" b-on-click="$data.count++" b-text="'replaced'">page button</button>
    <counter-box id="host" label="Clicks" start="2"><em id="slotted">\${$data.count}</em></counter-box>
</main>
<script src="/${core}"></script>
<script src="/app.js"></script>
${app}
</body></html>`;

const appScript = `
const app = brio.createApp({ state: () => ({ count: 0 }) });
app.component('counter-box', {
    props: { start: Number },
    template: \`<section>
        <button id="inc" b-on-click="$data.n++; $emit('tick', $data.n)"
            b-bind-class="{ active: $data.n > 2 }" b-bind-style="{ color: $data.n > 2 ? 'red' : 'blue' }">
            \\\${$props.label}: \\\${$data.n}</button>
        <p id="styled" b-bind-style="'font-weight: 700; margin-left: ' + $data.n + 'px'">styled</p>
        <p id="double" b-text="\\\`Double: \\\${$data.n * 2}\\\`"></p>
        <slot></slot>
    </section>\`,
    setup: ({ $props }) => ({ n: $props.start }),
});
document.addEventListener('tick', event => { document.body.dataset.ticks = String(event.detail); });
app.mount('#app');
window.brioApp = app;
`;

async function open(browserPage, core) {
    const violations = [];
    await browserPage.exposeFunction('reportViolation', text => violations.push(text));
    await browserPage.addInitScript(() => document.addEventListener('securitypolicyviolation',
        event => window.reportViolation(`${event.violatedDirective} ${event.blockedURI} ${event.sample}`)));
    const errors = [];
    browserPage.on('pageerror', error => errors.push(error.message));
    await browserPage.route(`${origin}/**`, route => {
        const path = new URL(route.request().url()).pathname;
        if (path === '/') return route.fulfill({
            contentType: 'text/html', headers: { 'content-security-policy': policy }, body: page(core, ''),
        });
        if (path === '/app.js') return route.fulfill({ contentType: 'text/javascript', body: appScript });
        return route.fulfill({ contentType: 'text/javascript', body: dist(path.slice(1)) });
    });
    await browserPage.goto(`${origin}/`);
    return { violations, errors };
}

test('the CSP bundle runs under script-src self without violations', async ({ page: browserPage }) => {
    const { violations, errors } = await open(browserPage, 'brio.csp.min.js');
    const inc = browserPage.locator('#inc');
    await expect(inc).toHaveText('Clicks: 2');
    await expect(browserPage.locator('#double')).toHaveText('Double: 4');
    await expect(inc).toHaveCSS('color', 'rgb(0, 0, 255)');
    await expect(browserPage.locator('#styled')).toHaveCSS('font-weight', '700');
    await expect(browserPage.locator('#styled')).toHaveCSS('margin-left', '2px');
    await inc.click();
    await expect(inc).toHaveText('Clicks: 3');
    await expect(inc).toHaveClass('active');
    await expect(inc).toHaveCSS('color', 'rgb(255, 0, 0)');
    await expect(browserPage.locator('body')).toHaveAttribute('data-ticks', '3');

    await expect(browserPage.locator('#page-text')).toHaveText('Page: ${$data.count}');
    await expect(browserPage.locator('#page-button')).toHaveText('page button');
    await expect(browserPage.locator('#slotted')).toHaveText('${$data.count}');
    expect(errors).toEqual([]);
    expect(violations).toEqual([]);
});

test('the standard bundle is blocked by the same policy', async ({ page: browserPage }) => {
    const { violations, errors } = await open(browserPage, 'brio.min.js');
    await expect.poll(() => violations.length + errors.length).toBeGreaterThan(0);
    expect([...violations, ...errors].join('\n')).toMatch(/eval|unsafe-eval|Content Security Policy/i);
});
