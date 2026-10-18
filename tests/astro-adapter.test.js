import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import { createApp, onCleanup } from 'briojs';
import { enhanceAstro, lazyApp } from 'briojs/astro';

function environment(t, html) {
    const dom = new JSDOM(html, { url: 'https://brio.test/' });
    const keys = ['document', 'Document', 'Node', 'Element', 'HTMLElement', 'HTMLInputElement',
        'HTMLTextAreaElement', 'HTMLSelectElement', 'MutationObserver', 'Event', 'InputEvent'];
    const saved = new Map(keys.map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
    for (const key of keys) globalThis[key] = dom.window[key];
    let integration;
    t.after(() => {
        try { integration?.dispose(); } finally {
            dom.window.close();
            for (const [key, descriptor] of saved)
                if (descriptor) Object.defineProperty(globalThis, key, descriptor);
                else Reflect.deleteProperty(globalThis, key);
        }
    });
    const errors = [];
    return {
        document: dom.window.document, errors,
        install(apps) {
            integration = enhanceAstro({ apps, onError: (error, root) => errors.push({ error, root }) });
            return integration;
        },
        discover() { document.dispatchEvent(new Event('astro:page-load')); },
        swap(html, preserve) {
            const incoming = new dom.window.DOMParser().parseFromString(html, 'text/html');
            const event = new Event('astro:before-swap');
            Object.defineProperty(event, 'newDocument', { value: incoming });
            document.dispatchEvent(event);
            preserve?.(incoming);
            document.body.replaceWith(incoming.body);
            document.dispatchEvent(new Event('astro:page-load'));
        },
    };
}

const tick = () => new Promise(resolve => setImmediate(resolve));
const counter = (_root, props) => createApp({ state: () => ({ count: props.count ?? 0 }) });

test('Astro entry imports without a DOM and public declarations compile', () => {
    execFileSync(process.execPath, ['--input-type=module', '-e', `
        import { enhanceAstro, lazyApp } from 'briojs/astro';
        if (typeof enhanceAstro !== 'function' || typeof lazyApp !== 'function') throw Error('exports');
    `]);
    execFileSync(fileURLToPath(new URL('../node_modules/.bin/tsc', import.meta.url)), [
        '--noEmit', '--strict', '--target', 'ES2022', '--module', 'ESNext',
        '--moduleResolution', 'bundler', 'tests/types/astro.ts',
    ], { stdio: 'pipe' });
    for (const name of ['brio.min.js', 'brio.dev.min.js'])
        assert.equal(readFileSync(new URL(`../dist/${name}`, import.meta.url), 'utf8').includes('Astro enhancement'), false);
});

test('eager siblings read props once, own independent apps, and restore on shutdown/reinstall', t => {
    const env = environment(t, `<main b-app="counter" b-props="{count:Number($el.dataset.initial)}" data-initial="5"><button b-on-click="$data.count++" b-text="$data.count"></button></main>
        <aside b-app="counter"><b b-text="$data.count"></b></aside>`);
    let calls = 0;
    const apps = { counter: (root, props) => { calls++; return counter(root, props); } };
    const integration = env.install(apps);
    const root = document.querySelector('main');
    const button = root.firstChild;
    button.click();
    root.dataset.initial = '20';
    env.discover();
    assert.equal(button.textContent, '6');
    assert.equal(document.querySelector('aside').textContent, '0');
    assert.equal(calls, 2);
    assert.throws(() => enhanceAstro({ apps, onError() {} }), /already installed/);
    integration.dispose();
    integration.dispose();
    button.click();
    assert.equal(button.textContent, '6');
    assert.equal(root.firstChild.hasAttribute('b-text'), true);
    env.install(apps);
    assert.equal(root.textContent, '5');
    assert.equal(calls, 4);
    assert.deepEqual(env.errors, []);
});

test('invalid names, props, nesting and factories fail explicitly without blocking siblings or retrying', t => {
    const env = environment(t, `<main b-app="absent"></main><div b-app="ok" b-props="null"></div>
        <div b-app="ok" b-props="Promise.resolve({})"></div>
        <div b-app="ok" b-props="({get value(){return 1}})"></div>
        <div b-app="ok" b-props="$data.value"></div>
        <div b-app="ok" b-props=""></div>
        <div b-app="ok"><span b-app="ok"></span></div>
        <div b-app="bad"></div><aside b-app="ok"><b b-text="$data.count"></b></aside>`);
    let calls = 0;
    env.install({ ok: (root, props) => { calls++; return counter(root, props); }, bad: () => null });
    assert.equal(env.errors.length, 9);
    assert.equal(calls, 1);
    assert.equal(document.querySelector('aside').textContent, '0');
    env.discover();
    assert.equal(env.errors.length, 9);
    assert.equal(calls, 1);
});

test('own registry names work and validation rejects invalid installation configuration', t => {
    const env = environment(t, '<main b-app="constructor"></main>');
    assert.throws(() => enhanceAstro({ apps: {}, onError: null }), /onError/);
    assert.throws(() => enhanceAstro({ apps: { a: null }, onError() {} }), /registration/);
    assert.throws(() => lazyApp(null), /loader/);
    env.install({ constructor: counter });
    assert.deepEqual(env.errors, []);
});

test('lazy loaders deduplicate but create independent apps and read props before loading', async t => {
    const env = environment(t, '<main b-app="lazy" b-props="{count:Number($el.dataset.n)}" data-n="3"><b b-text="$data.count"></b></main><aside b-app="lazy"><b b-text="$data.count"></b></aside>');
    let resolve;
    let loads = 0;
    let calls = 0;
    env.install({ lazy: lazyApp(() => { loads++; return new Promise(done => { resolve = done; }); }) });
    await tick();
    document.querySelector('main').dataset.n = '9';
    env.discover();
    resolve({ default: (root, props) => { calls++; return counter(root, props); } });
    await tick();
    assert.equal(loads, 1);
    assert.equal(calls, 2);
    assert.equal(document.querySelector('main').textContent, '3');
    assert.equal(document.querySelector('aside').textContent, '0');
    assert.deepEqual(env.errors, []);
});

test('outgoing pending islands are abandoned; retained ancestor islands finish with original props', async t => {
    const env = environment(t, '<section data-astro-transition-persist="keep"><main b-app="lazy" b-props="{count:7}"><b b-text="$data.count"></b></main></section><aside b-app="lazy"></aside>');
    let resolve;
    const seen = [];
    env.install({ lazy: lazyApp(() => new Promise(done => { resolve = done; })) });
    await tick();
    const boundary = document.querySelector('section');
    env.swap('<section data-astro-transition-persist="keep"><main b-app="lazy" b-props="{count:99}"></main></section>',
        incoming => incoming.querySelector('section').replaceWith(boundary));
    resolve({ default: (root, props) => { seen.push(root); return counter(root, props); } });
    await tick();
    assert.equal(seen.length, 1);
    assert.equal(document.querySelector('main').textContent, '7');
    assert.deepEqual(env.errors, []);
});

test('disposal abandons lazy work and loader errors are reported once per live island', async t => {
    const env = environment(t, '<main b-app="lazy"></main>');
    let resolve;
    let calls = 0;
    const handle = env.install({ lazy: lazyApp(() => new Promise(done => { resolve = done; })) });
    await tick();
    handle.dispose();
    resolve({ default: () => { calls++; return createApp(); } });
    await tick();
    assert.equal(calls, 0);
    let loads = 0;
    env.install({ lazy: lazyApp(async () => { loads++; throw new Error('load failed'); }) });
    await tick();
    env.discover();
    await tick();
    assert.equal(loads, 1);
    assert.equal(env.errors.length, 1);
    assert.match(env.errors[0].error.message, /load failed/);
});

test('missing default export and throwing factories report errors without unhandled rejection', async t => {
    const env = environment(t, '<main b-app="missing"></main><aside b-app="throws"></aside>');
    env.install({
        missing: lazyApp(async () => ({})),
        throws: lazyApp(async () => ({ default() { throw new Error('factory failed'); } })),
    });
    await tick();
    assert.equal(env.errors.length, 2);
    assert.match(env.errors.map(entry => entry.error.message).join(), /default-export/);
    assert.match(env.errors.map(entry => entry.error.message).join(), /factory failed/);
});

test('mount failures dispose plugins, shared apps are rejected without disposing their owner', t => {
    const env = environment(t, '<main b-app="bad"><b b-text="missingName"></b></main><aside b-app="same"></aside><footer b-app="same"></footer>');
    let cleanups = 0;
    const shared = createApp();
    env.install({
        bad: () => createApp({ plugins: [() => onCleanup(() => { cleanups++; })] }),
        same: () => shared,
    });
    assert.equal(cleanups, 1);
    assert.equal(shared.roots.size, 1);
    assert.equal(env.errors.length, 2);
});

test('disposal releases every app and installer lock despite cleanup failures', t => {
    const env = environment(t, '<main b-app="a"></main><aside b-app="a"></aside>');
    let cleanups = 0;
    const handle = env.install({ a: () => createApp({ plugins: [() => onCleanup(() => {
        cleanups++;
        throw new Error('cleanup failure');
    })] }) });
    assert.throws(() => handle.dispose(), /Astro disposal failed/);
    assert.equal(cleanups, 2);
    handle.dispose();
    env.install({ a: () => createApp() });
});

test('outgoing cleanup failures report per root and do not prevent other roots from releasing', t => {
    const env = environment(t, '<main b-app="a"></main><aside b-app="a"></aside>');
    let cleanups = 0;
    env.install({ a: () => createApp({ plugins: [() => onCleanup(() => {
        cleanups++;
        throw new Error('outgoing cleanup');
    })] }) });
    env.swap('<footer>No islands</footer>');
    assert.equal(cleanups, 2);
    assert.equal(env.errors.length, 2);
    assert.equal(document.body.textContent, 'No islands');
});

test('a persistent root keeps its app and props until its boundary disappears', t => {
    const env = environment(t, '<main b-app="a" b-props="{count:4}" data-astro-transition-persist="a"><b b-text="$data.count"></b></main>');
    let calls = 0;
    let cleanups = 0;
    env.install({ a: (root, props) => {
        calls++;
        const app = counter(root, props);
        app.plugin(() => onCleanup(() => { cleanups++; }));
        return app;
    } });
    const original = document.querySelector('main');
    env.swap('<main b-app="a" b-props="{count:9}" data-astro-transition-persist="a"></main>',
        incoming => incoming.querySelector('main').replaceWith(original));
    assert.equal(document.querySelector('main'), original);
    assert.equal(original.textContent, '4');
    assert.equal(calls, 1);
    env.swap('<footer>Gone</footer>');
    assert.equal(cleanups, 1);
});

test('lazy factory reentrancy disposes a returned app when installation ended during creation', async t => {
    const env = environment(t, '<main b-app="a"></main>');
    let cleanups = 0;
    const handle = env.install({ a: lazyApp(async () => ({
        default() {
            handle.dispose();
            return createApp({ plugins: [() => onCleanup(() => { cleanups++; })] });
        },
    })) });
    await tick();
    assert.equal(cleanups, 1);
    assert.deepEqual(env.errors, []);
    env.install({ a: counter });
});

test('loader rejection after abandonment is handled without reporting an obsolete island error', async t => {
    const env = environment(t, '<main b-app="a"></main>');
    let reject;
    env.install({ a: lazyApp(() => new Promise((_resolve, fail) => { reject = fail; })) });
    await tick();
    env.swap('<footer>Gone</footer>');
    reject(new Error('obsolete load'));
    await tick();
    assert.deepEqual(env.errors, []);
});

test('cleanup errors remain visible if a lazy factory ends installation before returning its app', async t => {
    const env = environment(t, '<main b-app="a"></main>');
    const handle = env.install({ a: lazyApp(async () => ({
        default() {
            handle.dispose();
            return createApp({ plugins: [() => onCleanup(() => { throw new Error('late cleanup failed'); })] });
        },
    })) });
    await tick();
    assert.equal(env.errors.length, 1);
    assert.match(env.errors[0].error.message, /cleanup/);
});

test('already mounted apps are rejected without disposing unrelated mounts', t => {
    const env = environment(t, '<main b-app="a"></main><aside></aside>');
    const app = createApp();
    app.mount(document.querySelector('aside'));
    env.install({ a: () => app });
    assert.equal(env.errors.length, 1);
    assert.equal(app.roots.size, 1);
    app.dispose();
});

test('exceptions in onError remain visible rather than becoming swallowed promise rejections', () => {
    execFileSync(process.execPath, ['--input-type=module', '-e', `
        import { JSDOM } from 'jsdom';
        import { enhanceAstro } from 'briojs/astro';
        const dom = new JSDOM('<main b-app="missing"></main>');
        globalThis.document = dom.window.document;
        process.exitCode = 1;
        process.once('uncaughtException', error => {
            if (error.message === 'callback failed') process.exitCode = 0;
            handle.dispose();
            dom.window.close();
        });
        const handle = enhanceAstro({ apps: {}, onError() { throw Error('callback failed'); } });
    `], { stdio: 'pipe' });
});
