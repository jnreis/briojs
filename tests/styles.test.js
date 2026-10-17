import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { JSDOM, VirtualConsole } from 'jsdom';

const bundles = ['brio.min.js', 'brio.dev.min.js'].map(name => [
    name, readFileSync(new URL(`../dist/${name}`, import.meta.url), 'utf8'),
]);

function environment(t, markup, source = '({})', bundle = bundles[0][1]) {
    const errors = [];
    const console = new VirtualConsole();
    // jsdom cannot parse @scope; native matching is verified in a real browser.
    console.on('jsdomError', error => { if (error.type !== 'css parsing') errors.push(error); });
    const dom = new JSDOM(`<main id="app">${markup}</main><aside id="portal"></aside>`, {
        runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole: console,
    });
    const { window } = dom;
    window.eval(bundle);
    window.addEventListener('error', event => { errors.push(event.error); event.preventDefault(); });
    const app = window.brio.createApp(window.eval(source));
    t.after(() => {
        try { app.dispose(); assert.deepEqual(errors, []); } finally { window.close(); }
    });
    return { app, root: window.document.querySelector('#app'), window, document: window.document };
}

for (const [name, bundle] of bundles) test(`${name}: ordinary style text interpolates reactively without creating head sheets or classes`, t => {
    const { app, root, document } = environment(t, `
        <section b-id="['style']" b-bind-class="{ [$id.style]: true }"
            b-bind-style="{ '--accent': $data.accent }">
            <style>@scope (.\${$id.style}) to (.limit) { h2 { color: \${$data.accent}; } }</style>
            <h2>text</h2><div class="limit"></div>
        </section>`, '({ state: () => ({ accent: "green" }) })', bundle);
    app.mount(root);
    const section = root.querySelector('section');
    const style = section.querySelector('style');
    assert.match(section.className, /^brio-\d+$/);
    assert.ok(style.textContent.includes(`@scope (.${section.className}) to (.limit)`));
    assert.ok(style.textContent.includes('color: green'));
    app.state.accent = 'red';
    assert.ok(style.textContent.includes('color: red'));
    assert.equal(section.style.getPropertyValue('--accent'), 'red');
    assert.equal(document.head.querySelector('style'), null);
    assert.equal(root.className, '');
    app.unmount();
    const restored = root.querySelector('style').textContent;
    app.state.accent = 'blue';
    assert.equal(root.querySelector('style').textContent, restored);
    app.mount(root);
    assert.ok(root.querySelector('style').textContent.includes('color: blue'));
});

test('static CSS, ignored literal interpolation and raw HTML remain ordinary markup', t => {
    const { app, root, document } = environment(t, `
        <style>@scope { h2 {color:var(--accent)} } @keyframes pulse {to {opacity:1}}</style>
        <style b-ignore>p::before {content:"\${literal}"}</style>
        <div b-html="trustedHTML($data.html)"></div>`,
    '({ state: () => ({ html: "<style>p::before {content:\\"${literal}\\"}</style>" }) })');
    const original = root.querySelector('style').textContent;
    app.mount(root);
    assert.equal(root.querySelector('style').textContent, original);
    assert.ok(root.querySelectorAll('style')[1].textContent.includes('${literal}'));
    assert.ok(root.querySelectorAll('style')[2].textContent.includes('${literal}'));
    assert.equal(document.head.querySelector('style'), null);
});

test('components, loops, templates and slots use normal physical style placement and expression context', t => {
    const { app, root, document } = environment(t, `
        <color-card><style>@scope {p {color:\${$data.accent}}}</style><p>slot</p></color-card>
        <template b-template><style>@scope {h2 {color:\${$data.accent}}}</style></template>
        <section b-for="color in $data.colors" b-key="$for.color">
            <style>@scope {p {color:\${$for.color}}}</style><p b-text="$for.color"></p>
        </section>`, '({ state: () => ({ accent: "green", colors: ["red", "blue"] }) })');
    app.component('color-card', {
        template: '<style>@scope { :scope {display:block} p {font-weight:700} }</style><slot></slot>',
    });
    app.mount(root);
    assert.equal(root.querySelector('color-card style').parentElement.tagName, 'COLOR-CARD');
    assert.ok(root.querySelectorAll('color-card style')[1].textContent.includes('color:green'));
    assert.ok([...root.children].some(child => child.tagName === 'STYLE'));
    const styles = [...root.querySelectorAll('section style')];
    assert.ok(styles[0].textContent.includes('color:red'));
    assert.ok(styles[1].textContent.includes('color:blue'));
    app.state.accent = 'purple';
    assert.ok(root.querySelectorAll('color-card style')[1].textContent.includes('color:purple'));
    app.state.colors.reverse();
    assert.equal(root.querySelectorAll('section style')[0], styles[1]);
    assert.equal(document.head.querySelector('style'), null);
});

test('conditional style connectivity follows hide/detach/removal while preserved effects stay reactive', t => {
    for (const mode of ['', '.hide', '.detach']) {
        const { app, root, document } = environment(t, `
            <section b-if${mode}="$data.visible"><style>@scope {p {color:\${$data.color}}}</style><p>text</p></section>`,
        '({ state: () => ({ visible:true, color:"green" }) })');
        app.mount(root);
        const branch = root.querySelector('section');
        const style = branch.querySelector('style');
        app.state.visible = false;
        assert.equal(style.isConnected, mode === '.hide');
        app.state.color = 'red';
        assert.equal(style.textContent.includes('color:red'), Boolean(mode));
        app.state.visible = true;
        assert.equal(root.querySelector('style') === style, Boolean(mode));
        assert.ok(root.querySelector('style').textContent.includes('color:red'));
        assert.equal(document.head.querySelector('style'), null);
    }
});

test('managed insertion owns style interpolation and removal without relocating the sheet', t => {
    const { app, root, document } = environment(t, '<div id="target"></div>',
        '({ state: () => ({color:"green"}) })');
    app.mount(root);
    const handle = app.insert('#target', 'append', '<style>@scope {p {color:${$data.color}}}</style><p>text</p>');
    const style = handle.nodes[0];
    assert.equal(style.parentElement.id, 'target');
    app.state.color = 'red';
    assert.ok(style.textContent.includes('color:red'));
    handle.remove();
    app.state.color = 'blue';
    assert.equal(style.isConnected, false);
    assert.ok(style.textContent.includes('color:red'));
    assert.equal(document.head.querySelector('style'), null);
    assert.equal(root.querySelector('style'), null);
});

test('inline style nodes stay live through leave reversal and disconnect after completed leave', t => {
    const { app, root, window } = environment(t, `
        <section b-if="$data.visible" b-transition="'fade'"
            style="transition-property:opacity;transition-duration:1s;transition-delay:0s">
            <style>@scope {p {color:\${$data.color}}}</style><p>text</p>
        </section>`, '({ state: () => ({ visible:true, color:"green" }) })');
    const frames = new Map();
    const timers = new Map();
    let next = 0;
    window.requestAnimationFrame = callback => { frames.set(++next, callback); return next; };
    window.cancelAnimationFrame = id => frames.delete(id);
    window.setTimeout = callback => { timers.set(++next, callback); return next; };
    window.clearTimeout = id => timers.delete(id);
    const advance = () => {
        for (let i = 0; i < 2; i++) {
            const callbacks = [...frames.values()];
            frames.clear();
            callbacks.forEach(callback => callback());
        }
    };
    app.mount(root);
    advance();
    const style = root.querySelector('style');
    app.state.visible = false;
    advance();
    assert.equal(style.isConnected, true);
    app.state.color = 'red';
    assert.ok(style.textContent.includes('color:red'));
    const stale = [...timers.values()][0];
    app.state.visible = true;
    stale();
    assert.equal(root.querySelector('style'), style);
    app.state.visible = false;
    advance();
    [...timers.values()].forEach(callback => callback());
    assert.equal(style.isConnected, false);
    app.state.color = 'blue';
    assert.ok(style.textContent.includes('color:red'));
    assert.equal(timers.size, 0);
});

test('b-text binds complete style text without secondary interpolation', t => {
    const { app, root } = environment(t, '<style b-text="$data.css"></style>',
        '({ state: () => ({ css: \'p::before {content:"${literal}"}\' }) })');
    app.mount(root);
    assert.equal(root.querySelector('style').textContent, 'p::before {content:"${literal}"}');
    app.state.css = 'h2 {color:purple}';
    assert.equal(root.querySelector('style').textContent, 'h2 {color:purple}');
});

test('style interpolation errors roll back mounting like other text bindings', t => {
    const { app, root, document } = environment(t, '<style>@scope {p {color:${missing.value}}}</style>');
    const original = root.innerHTML;
    assert.throws(() => app.mount(root), /expression/);
    assert.equal(root.innerHTML, original);
    assert.equal(document.head.querySelector('style'), null);
});

test('native CSS manual page bootstraps and its existing bindings update', t => {
    let pageApp;
    t.after(() => pageApp?.dispose());
    const markup = readFileSync(new URL('./directives/styles.html', import.meta.url), 'utf8');
    const { app, root, window, document } = environment(t, markup.match(/<body>([\s\S]*)<\/body>/)[1]);
    const bootstrap = [...root.querySelectorAll('script')].at(-1).textContent;
    // The page registers its own components and app; capture that app for disposal.
    const create = window.brio.createApp;
    window.brio.createApp = (...args) => { pageApp = create(...args); return pageApp; };
    window.eval(bootstrap);
    window.dispatchEvent(new window.Event('DOMContentLoaded'));
    assert.equal(document.head.querySelector('[data-brio-scoped]'), null);
    document.querySelector('#change-accent').click();
    assert.equal(document.querySelector('#variables').style.getPropertyValue('--accent'), 'rgb(190, 18, 60)');
    assert.match(document.querySelector('#generated').className, /brio-\d+/);
    assert.ok(!document.querySelector('#generated style').textContent.includes('${'));
    app.dispose();
});
