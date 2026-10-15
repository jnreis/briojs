import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { JSDOM, VirtualConsole } from 'jsdom';
import { createApp } from 'briojs';

const bundles = ['brio.min.js', 'brio.dev.min.js'].map(name => [
    name, readFileSync(new URL(`../dist/${name}`, import.meta.url), 'utf8'),
]);

function emulateInertCSSOM(window, virtualConsole = new VirtualConsole()) {
    const documents = [];
    const original = window.DOMImplementation.prototype.createHTMLDocument;
    // jsdom does not create stylesheets in createHTMLDocument documents; real browsers do.
    window.DOMImplementation.prototype.createHTMLDocument = () => {
        const dom = new JSDOM('', { virtualConsole, url: 'https://brio.test/' });
        documents.push(dom);
        return dom.window.document;
    };
    return () => {
        window.DOMImplementation.prototype.createHTMLDocument = original;
        documents.forEach(dom => dom.window.close());
    };
}

function environment(t, markup, source = '({})', bundle = bundles[0][1]) {
    const console = new VirtualConsole();
    const domErrors = [];
    console.on('jsdomError', error => {
        // jsdom cannot parse native nesting/layers; browsers verify those fixtures separately.
        if (error.type !== 'css parsing') domErrors.push(error);
    });
    const dom = new JSDOM(`<main id="app">${markup}</main><aside id="portal"></aside>`, {
        runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole: console, url: 'https://brio.test/',
    });
    const { window } = dom;
    const closeCSSOM = emulateInertCSSOM(window, console);
    window.eval(bundle);
    const app = window.brio.createApp(window.eval(source));
    const root = window.document.querySelector('#app');
    const errors = [];
    window.addEventListener('error', event => { errors.push(event.error); event.preventDefault(); });
    t.after(() => {
        try { app.dispose(); assert.deepEqual(errors, []); assert.deepEqual(domErrors, []); }
        finally { closeCSSOM(); window.close(); }
    });
    return { app, root, window, document: window.document };
}
const sheets = document => [...document.head.querySelectorAll('style[data-brio-scoped]')];
const scopeClass = element => [...element.classList].find(name => name.startsWith('brio-scope-'));

for (const [name, bundle] of bundles) test(`${name}: b-style scopes static selectors to concrete data/root boundaries`, t => {
    const { app, root, document, window } = environment(t, `
        <style b-style>.root { color: red; }</style>
        <section id="local" b-data="{}"><style b-style nonce="test-nonce" media="screen">
            :scope { border: 1px solid blue; }
            p, :is(.a, .b), [data-name="a,b"]::before { color: green; content: "\${notAnExpression}"; }
        </style><p>local</p><style b-style>.second {color:blue}</style></section>
        <p id="outside">outside</p>`, '({})', bundle);
    const mount = app.mount(root);
    const local = root.querySelector('#local');
    assert.ok(scopeClass(root));
    assert.ok(scopeClass(local));
    assert.notEqual(scopeClass(root), scopeClass(local));
    assert.equal(scopeClass(root.querySelector('p')), undefined);
    assert.equal(sheets(document).length, 3);
    const scoped = sheets(document)[1];
    assert.equal(scoped.nonce, 'test-nonce');
    assert.equal(scoped.media, 'screen');
    assert.ok(scoped.textContent.includes(`.${scopeClass(local)} p`));
    assert.ok(scoped.textContent.includes(`.${scopeClass(local)} :is(.a, .b)`));
    assert.ok(scoped.textContent.includes('[data-name="a,b"]::before'));
    assert.ok(scoped.textContent.includes('${notAnExpression}'));
    assert.equal(root.querySelector('style').textContent, '');
    mount.unmount();
    assert.equal(sheets(document).length, 0);
    assert.equal(scopeClass(local), undefined);
    assert.equal(scopeClass(root), undefined);
    app.mount(root);
    assert.equal(sheets(document).length, 3);
    assert.equal(window.document.querySelector('#outside').className, '');
});

test('style ownership reference counts survive class bindings and inserted local data does not create a CSS boundary', t => {
    const { app, root, document, window } = environment(t, `
        <section id="local" class="authored" b-data="{ active: true }" b-bind-class="{ active: $data.active }">
            <div id="target"></div><button b-on-click="$data.active = !$data.active">toggle</button>
        </section>`);
    app.mount(root);
    const local = root.querySelector('#local');
    const first = app.insert('#target', 'append', '<style b-style>p { color: red; }</style>', { data: window.eval('({ count: 0 })') });
    const second = app.insert('#target', 'append', '<style b-style>p { color: blue; }</style>');
    const generated = scopeClass(local);
    assert.ok(generated);
    assert.equal(sheets(document)[0].dataset.brioScoped, generated);
    local.querySelector('button').click();
    assert.ok(local.classList.contains(generated));
    assert.equal(local.classList.contains('active'), false);
    first.remove();
    assert.ok(local.classList.contains(generated));
    second.remove();
    assert.equal(scopeClass(local), undefined);
    assert.ok(local.classList.contains('authored'));
    local.querySelector('button').click();
    assert.equal(scopeClass(local), undefined);
    const third = app.insert('#target', 'append', '<style b-style>p { color: green; }</style>');
    assert.notEqual(scopeClass(local), generated);
    third.remove();
    assert.equal(sheets(document).length, 0);
});

test('separate mounts and apps do not share generated classes or stylesheet cleanup', t => {
    const { app, root, document, window } = environment(t,
        '<style b-style>p {color:red}</style><p class="brio-scope-1">first</p>');
    const portal = document.querySelector('#portal');
    portal.innerHTML = '<style b-style>p {color:blue}</style><p>second</p>';
    const otherApp = window.brio.createApp();
    t.after(() => otherApp.dispose());
    app.mount(root);
    otherApp.mount(portal);
    assert.notEqual(scopeClass(root), 'brio-scope-1');
    assert.notEqual(scopeClass(root), scopeClass(portal));
    assert.equal(sheets(document).length, 2);
    app.unmount();
    assert.equal(sheets(document).length, 1);
    assert.equal(sheets(document)[0].dataset.brioScoped, scopeClass(portal));
    otherApp.unmount();
    assert.equal(sheets(document).length, 0);
    assert.ok(root.querySelector('p').classList.contains('brio-scope-1'));
});

test('unavailable CSSOM reports an error and rolls back mounted styles and classes', t => {
    const { app, root, document, window } = environment(t, '<style b-style>p {color:red}</style>');
    document.implementation.createHTMLDocument = () =>
        new window.DOMParser().parseFromString('<title>no browsing context</title>', 'text/html');
    assert.throws(() => app.mount(root), /could not be parsed/);
    assert.equal(sheets(document).length, 0);
    assert.equal(scopeClass(root), undefined);
});

test('component hosts, slots, and nested data roots have physical CSS boundaries', t => {
    const { app, root, document } = environment(t, `
        <style b-style>.outside { color: red; }</style>
        <styled-card id="first"><style b-style>.slotted {color:blue}</style><p class="slotted">slot</p></styled-card>
        <styled-card id="second"></styled-card>`);
    app.component('styled-card', {
        template: `<style b-style>:scope {display:block} p {color:green}</style>
            <p>component</p><slot></slot>
            <section b-data="{}"><style b-style>p {color:purple}</style><p>inner</p></section>`,
    });
    app.mount(root);
    const first = root.querySelector('#first');
    const second = root.querySelector('#second');
    assert.notEqual(scopeClass(first), scopeClass(second));
    assert.notEqual(scopeClass(first), scopeClass(first.querySelector('section')));
    const slotted = sheets(document).find(sheet => sheet.textContent.includes('.slotted'));
    assert.equal(slotted.dataset.brioScoped, scopeClass(first));
    assert.equal(sheets(document).length, 6);
    assert.equal(root.querySelector('p').attributes.length, 0);
});

test('repeated data roots get unique classes; unwrapped templates fall back to the surviving boundary', t => {
    const { app, root, document } = environment(t, `
        <template b-template b-data="{}"><style b-style>.fallback {color:red}</style><p>fallback</p></template>
        <section b-for="n in 2" b-data="{}"><style b-style>p {color:green}</style><p b-text="$for.n"></p></section>`);
    app.mount(root);
    const rows = [...root.querySelectorAll('section')];
    assert.equal(rows.length, 2);
    assert.notEqual(scopeClass(rows[0]), scopeClass(rows[1]));
    assert.equal(sheets(document)[0].dataset.brioScoped, scopeClass(root));
    assert.equal(sheets(document).length, 3);
});

test('conditional modes retain or dispose styles with their branch lifecycle', t => {
    for (const mode of ['', '.hide', '.detach']) {
        const { app, root, document } = environment(t, `
            <section b-if${mode}="$data.visible" b-data="{}">
                <style b-style>p {color:red}</style><p>branch</p>
            </section>`, '({ state: () => ({ visible: true }) })');
        app.mount(root);
        const branch = root.querySelector('section');
        const generated = scopeClass(branch);
        app.state.visible = false;
        assert.equal(sheets(document).length, mode ? 1 : 0);
        assert.equal(scopeClass(branch), mode ? generated : undefined);
        app.state.visible = true;
        assert.equal(sheets(document).length, 1);
        assert.equal(root.querySelector('section') === branch, Boolean(mode));
        app.unmount();
        assert.equal(sheets(document).length, 0);
    }
});

test('plain b-if keeps owned transition CSS until leave finishes, and reversal keeps the same stylesheet', t => {
    const { app, root, document, window } = environment(t, `
        <section b-if="$data.visible" b-data="{}" b-transition="'fade'"
            style="transition-property: opacity; transition-duration: 1s; transition-delay: 0s">
            <style b-style>
                :scope.fade-enter-active, :scope.fade-leave-active {transition: opacity 1s}
                :scope.fade-enter, :scope.fade-leave-to {opacity:0}
            </style><p>branch</p>
        </section>`, '({ state: () => ({ visible: true }) })');
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
    const branch = root.querySelector('section');
    const stylesheet = sheets(document)[0];
    app.state.visible = false;
    advance();
    assert.equal(sheets(document)[0], stylesheet);
    const stale = [...timers.values()][0];
    app.state.visible = true;
    stale();
    assert.equal(root.querySelector('section'), branch);
    assert.equal(sheets(document)[0], stylesheet);
    app.state.visible = false;
    advance();
    [...timers.values()].forEach(callback => callback());
    assert.equal(branch.isConnected, false);
    assert.equal(sheets(document).length, 0);
    assert.equal(scopeClass(branch), undefined);
    assert.equal(frames.size, 0);
    assert.equal(timers.size, 0);
});

test('styles install into the boundary ownerDocument and clean up on failed insertion', t => {
    const { app, window, document } = environment(t, '');
    const otherDocument = new window.DOMParser().parseFromString('<title>other document</title>', 'text/html');
    otherDocument.body.innerHTML = '<style b-style>p {color:red}</style><p>other</p><div id="target"></div>';
    app.mount(otherDocument.body);
    assert.equal(sheets(document).length, 0);
    assert.equal(sheets(otherDocument).length, 1);
    const boundaryClass = scopeClass(otherDocument.body);
    assert.throws(() => app.insert(otherDocument.querySelector('#target'), 'append',
        '<style b-style>p {color:blue}</style><b b-text="missing.value"></b>'), /expression/);
    assert.equal(sheets(otherDocument).length, 1);
    assert.equal(scopeClass(otherDocument.body), boundaryClass);
    app.unmount();
    assert.equal(sheets(otherDocument).length, 0);
    assert.equal(window.document, document);
});

test('npm runtime uses the same native CSSOM lifecycle', () => {
    const dom = new JSDOM('<main><style b-style>:scope {color:red} p {color:blue}</style><p>text</p></main>');
    const closeCSSOM = emulateInertCSSOM(dom.window);
    const names = ['document', 'Node', 'Element', 'HTMLElement', 'HTMLInputElement', 'HTMLTextAreaElement',
        'HTMLSelectElement', 'MutationObserver', 'CustomEvent'];
    const previous = new Map(names.map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
    let app;
    try {
        for (const name of names) Object.defineProperty(globalThis, name, {
            configurable: true, writable: true, value: dom.window[name],
        });
        app = createApp();
        const root = dom.window.document.querySelector('main');
        app.mount(root);
        assert.ok(scopeClass(root));
        assert.equal(sheets(dom.window.document).length, 1);
        app.unmount();
        assert.equal(sheets(dom.window.document).length, 0);
    } finally {
        app?.dispose();
        for (const [name, descriptor] of previous) {
            if (descriptor) Object.defineProperty(globalThis, name, descriptor);
            else delete globalThis[name];
        }
        closeCSSOM();
        dom.window.close();
    }
});

test('initially detached boundaries, teleported content, and managed replacements retain correct ownership', t => {
    const { app, root, document } = environment(t, `
        <section b-if.detach="$data.visible" b-data="{}">
            <style b-style>.remote {color:red}</style>
            <p class="remote" b-teleport="'#portal'">remote</p>
        </section>`, '({ state: () => ({ visible: false }) })');
    app.mount(root);
    assert.equal(sheets(document).length, 1);
    const remote = document.querySelector('#portal p');
    const generated = sheets(document)[0].dataset.brioScoped;
    assert.equal(remote.closest(`.${generated}`), null);
    app.state.visible = true;
    assert.equal(scopeClass(root.querySelector('section')), generated);
    app.insert(root, 'replaceChildren', '<b>new</b>');
    assert.equal(sheets(document).length, 0);
    assert.equal(document.querySelector('#portal p'), null);
});

test('invalid scoped styles fail explicitly and roll back styles/classes', t => {
    const invalid = [
        ['<div b-style></div>', /<style>/],
        ['<style b-style="$data.css">p {color:red}</style>', /static CSS/],
        ['<style b-style.raw>p {color:red}</style>', /modifiers/],
        ['<style b-style b-text="$data.css"></style>', /content directives/],
        ['<style b-style>@import "remote.css";</style>', /global stylesheet/],
        ['<style b-style>@font-face {font-family:x;src:url(x)}</style>', /global stylesheet/],
        ['<style b-style>& p {color:red}</style>', /Top-level/],
    ];
    for (const [markup, message] of invalid) {
        const { app, root, document } = environment(t, `<style b-style>p {color:green}</style>${markup}`);
        const original = root.innerHTML;
        assert.throws(() => app.mount(root), message);
        assert.equal(sheets(document).length, 0);
        assert.equal(scopeClass(root), undefined);
        assert.equal(root.innerHTML, original);
    }
    const app = createApp();
    assert.throws(() => app.component('old-card', { style: 'p{}', template: '<p></p>' }), /style has been removed/);
    app.dispose();
});

test('ordinary styles, ignored/raw HTML and static literal CSS retain their intended semantics', t => {
    const { app, root, document } = environment(t, `
        <style>.global {color: red}</style>
        <div b-ignore><style b-style>.ignored {color:blue}</style></div>
        <div b-html.raw="trustedHTML($data.html)"></div>
        <style b-style>p::before {content: "\${$data.missing}"}</style>`,
    '({ state: () => ({ html: "<style b-style>.raw {color:green}</style>" }) })');
    app.mount(root);
    assert.equal(sheets(document).length, 1);
    assert.equal(root.querySelector('style').textContent, '.global {color: red}');
    assert.ok(sheets(document)[0].textContent.includes('${$data.missing}'));
});

test('CSSOM rewriting respects selector functions, strings, escapes, groups and keyframe steps', t => {
    const { app, root, document } = environment(t, `
        <style b-style>
            :scope.active > p::before {content:"x,y:{a}"; --literal: "\${untouched}";}
            :is(:scope, p), :not(:scope), :has(:scope), [data-x="a,b"], [data-label=":scope,a"] {color:red}
            .escaped\\,name, .x:not(.a,.b) {color:blue}
            @media (min-width: 0px) {
                @supports (display:grid) { p {display:grid} }
            }
            @keyframes demo { from {opacity:0} 50%, to {opacity:1} }
        </style>`);
    app.mount(root);
    const generated = scopeClass(root);
    const css = sheets(document)[0].textContent;
    assert.ok(css.includes(`.${generated}.active > p:where(`));
    assert.ok(css.includes(':is(') && css.includes(':not(') && css.includes(':has('));
    assert.ok(css.includes('[data-x="a,b"]'));
    assert.ok(css.includes('[data-label=":scope,a"]'));
    assert.ok(css.includes(`.${generated} .escaped\\,name`));
    assert.match(css, new RegExp(`\\.${generated} p \\{\\s*display:\\s*grid;?\\s*\\}`));
    assert.match(css, /@keyframes demo\s*\{\s*from\s*\{\s*opacity:\s*0;?\s*\}\s*50%,\s*to\s*\{\s*opacity:\s*1;?\s*\}\s*\}/);
    assert.ok(css.includes('${untouched}'));
});

test('actual scoped styles manual page mounts, updates custom properties and cleans owned sheets', t => {
    const markup = readFileSync(new URL('./directives/styles.html', import.meta.url), 'utf8');
    const dom = new JSDOM(markup, {
        runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole: new VirtualConsole(),
    });
    const { window } = dom;
    const closeCSSOM = emulateInertCSSOM(window);
    // jsdom cannot parse native nesting/layers/container queries. The full fixture is browser-tested.
    const modern = [...window.document.querySelectorAll('style[b-style]')].find(style => style.textContent.includes('@container'));
    modern.textContent = ':scope {border-color:var(--accent)} .local-example {color:var(--accent)}';
    window.eval(bundles[0][1]);
    let app;
    const create = window.brio.createApp;
    window.brio.createApp = (...args) => { app = create(...args); return app; };
    const bootstrap = window.document.scripts[window.document.scripts.length - 1].textContent;
    window.eval(bootstrap);
    window.dispatchEvent(new window.Event('DOMContentLoaded'));
    t.after(() => { try { app?.dispose(); } finally { closeCSSOM(); window.close(); } });
    const { document } = window;
    assert.equal(sheets(document).length, 10);
    assert.ok(scopeClass(document.body));
    document.querySelector('#change-accent').click();
    assert.equal(document.querySelector('#local').style.getPropertyValue('--accent'), 'rgb(190, 18, 60)');
    document.querySelector('#toggle-class').click();
    assert.ok(scopeClass(document.querySelector('#local')));
    document.querySelector('#toggle-branches').click();
    assert.equal(sheets(document).length, 9);
    document.querySelector('#toggle-branches').click();
    assert.equal(sheets(document).length, 10);
    app.unmount();
    assert.equal(sheets(document).length, 0);
    assert.equal(scopeClass(document.body), undefined);
});
