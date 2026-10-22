import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { execFileSync } from 'node:child_process';
import { JSDOM } from 'jsdom';
import * as esm from '@jnreis/briojs';

const production = readFileSync(new URL('../dist/brio.min.js', import.meta.url), 'utf8');
const development = readFileSync(new URL('../dist/brio.dev.min.js', import.meta.url), 'utf8');
const coreAPI = [
    'createApp', 'state', 'signal', 'computed', 'effect', 'batch', 'flush',
    'untrack', 'resource', 'createScope', 'onCleanup', 'getCurrentScope', 'trustedHTML',
];
const developmentAPI = ['devtools', 'inspectDevtools', 'devtoolsPanel', 'enableDevtools'];
const pluginAPI = {
    router: ['createRouter'],
    persistence: ['persist'],
    http: ['http', 'HttpError'],
    forms: ['validate'],
    step: ['createStepEngine'],
    'money-mask': ['moneyMask'],
};

for (const [name, bundle, dev] of [
    ['production', production, false],
    ['development', development, true],
]) {
    test(`${name} browser bundle publishes the expected API before its ready event`, t => {
        const dom = new JSDOM(`
            <main id="app"><div id="target"></div>
            <button on-click="$insert('#target', 'append', '<span b-text=&quot;$data.count&quot;></span>')">Insert</button></main>
            <aside id="inspector"></aside>`, { runScripts: 'outside-only' });
        const { window } = dom;
        t.after(() => window.close());
        const errors = [];
        window.addEventListener('error', event => errors.push(event.error));
        let readyEvents = 0;
        window.addEventListener('brio', () => {
            readyEvents++;
            assert.equal(typeof window.brio.createApp, 'function');
            if (dev) assert.equal(typeof window.brio.devtoolsPanel, 'function');
        });
        window.eval(bundle);
        const brio = window.brio;
        assert.equal(readyEvents, 1);
        assert.deepEqual(Object.keys(brio).sort(), [...coreAPI, ...(dev ? developmentAPI : [])].sort());
        window.snapshotReads = 0;
        const initialState = window.eval('({ count: 0, get inspected() { window.snapshotReads++; return 1; } })');
        const app = brio.createApp({ state: () => initialState });
        t.after(() => app.dispose());
        assert.equal(app.$insert, undefined);
        assert.equal(typeof app.insert, 'function');
        app.mount('#app');
        window.document.querySelector('button').click();
        const inserted = app.insert('#target', 'append', '<b b-text="$data.count"></b>');
        app.state.count = 7;
        assert.equal(window.document.querySelector('span').textContent, '7');
        assert.equal(inserted.nodes[0].textContent, '7');
        assert.equal(window.snapshotReads > 0, dev);
        if (dev) {
            const snapshot = brio.inspectDevtools();
            assert.equal(snapshot.appCount, 1);
            assert.equal(snapshot.mountedRoots, 1);
            assert.equal(snapshot.apps[0].state.count, 7);
            assert.equal(snapshot.activeEffects, 3);
            assert.equal(brio.devtools.getSnapshot().activeEffects, snapshot.activeEffects);
            let notifications = 0;
            const unsubscribe = brio.devtools.subscribe(() => notifications++);
            const stopPanel = brio.devtoolsPanel(window.document.querySelector('#inspector'));
            app.state.count++;
            assert.ok(notifications > 1);
            assert.match(window.document.querySelector('#inspector').textContent, /"count": 8/);
            stopPanel();
            unsubscribe();
            assert.equal(window.document.querySelector('#inspector').childNodes.length, 0);
        }
        app.unmount();
        assert.equal(inserted.removed, true);
        app.dispose();
        if (dev) {
            assert.equal(brio.inspectDevtools().appCount, 0);
            assert.equal(brio.inspectDevtools().activeEffects, 0);
        }
        assert.deepEqual(errors, []);
    });
}

test('ESM main exports devtools without activating tracking; the devtools subpath activates it', async () => {
    let reads = 0;
    const create = () => esm.createApp({ state: () => ({
        get count() {
            reads++;
            return 0;
        },
    }) });
    const productionApp = create();
    productionApp.dispose();
    assert.equal(reads, 0);
    assert.equal(typeof esm.enableDevtools, 'function');
    const { inspectDevtools } = await import('@jnreis/briojs/devtools');
    const developmentApp = create();
    try {
        assert.ok(reads > 0);
        assert.equal(inspectDevtools().appCount, 1);
        assert.equal(inspectDevtools().apps[0].state.count, 0);
    } finally {
        developmentApp.dispose();
    }
    assert.equal(inspectDevtools().appCount, 0);
    assert.equal(inspectDevtools().activeEffects, 0);
});

test('production bundle excludes the inspector and tracking code; ESM tooling stays separate', () => {
    for (const marker of [
        'Unable to snapshot app state', 'data-brio-devtools', 'effectsCreated', 'devtoolsTracked',
    ]) {
        assert.equal(production.includes(marker), false, `Production contains ${marker}`);
        assert.equal(development.includes(marker), true, `Development is missing ${marker}`);
    }
    assert.ok(Buffer.byteLength(production) < Buffer.byteLength(development));
    assert.equal(typeof esm.devtools.getSnapshot, 'function');
    const engine = esm.createStepEngine({
        initial: 'intro',
        steps: { intro: { next: 'details' }, details: {} },
    });
    assert.equal(engine.current, 'intro');
    assert.equal(engine.next(), true);
    assert.equal(engine.current, 'details');
    assert.equal(engine.back(), true);
    assert.equal(engine.current, 'intro');
    assert.equal(typeof esm.hydrateNode, 'function');
});

for (const [name, bundle] of [['production', production], ['development', development]]) {
    test(`${name} optional browser plugins share the core's state and lifetime without replacing its API`, t => {
        const dom = new JSDOM('<main><span b-text="$stores.preferences.theme"></span></main>', {
            runScripts: 'outside-only', url: 'https://brio.test/',
        });
        const { window } = dom;
        let app;
        let routed;
        let scope;
        t.after(() => {
            try {
                routed?.dispose();
                app?.dispose();
                scope?.dispose();
            } finally {
                window.close();
            }
        });
        window.eval(bundle);
        const core = window.brio;
        for (const key of ['persist', 'createRouter', 'http', 'HttpError', 'validate', 'createStepEngine', 'moneyMask'])
            assert.equal(core[key], undefined);
        for (const plugin of ['router', 'persistence', 'http', 'forms', 'step', 'money-mask']) {
            const source = readFileSync(new URL(`../dist/brio.${plugin}.min.js`, import.meta.url), 'utf8');
            window.eval(source);
        }
        assert.equal(window.brio, core);
        assert.equal(typeof core.http.get, 'function');
        assert.equal(typeof core.HttpError, 'function');
        assert.equal(core.validate({ age: 18 }, { age: [{ name: 'min', value: 18 }] }), true);
        assert.equal(core.validate({ age: 20 }, { age: [{ name: 'even' }] },
            { even: value => value % 2 === 0 }), true);
        assert.equal(typeof core.moneyMask(), 'function');
        const wizard = core.createStepEngine(window.eval('({initial:"a",steps:{a:{next:"b"},b:{}}})'));
        const steps = [];
        const stopSteps = core.effect(() => steps.push(wizard.current));
        wizard.next();
        wizard.back();
        stopSteps();
        assert.deepEqual(steps, ['a', 'b', 'a']);
        let preferences;
        scope = core.createScope();
        scope.run(() => { preferences = core.persist('test', window.eval('({ theme: "dark" })')); });
        const markup = window.eval('({ value: null })');
        markup.value = core.trustedHTML('<em>authored</em>');
        app = core.createApp({ stores: window.Object.assign(new window.Object(), { preferences, markup }) });
        app.mount('main');
        preferences.theme = 'light';
        assert.equal(window.document.querySelector('span').textContent, 'light');
        assert.equal(window.localStorage.getItem('test'), '{"theme":"light"}');
        scope.dispose();
        preferences.theme = 'stopped';
        assert.equal(window.localStorage.getItem('test'), '{"theme":"light"}');
        const unscoped = core.persist('outside', 0);
        unscoped.value = 4;
        assert.equal(window.localStorage.getItem('outside'), '4', 'module-level persist lives for the page');
        const router = core.createRouter(window.eval('[{ path: "/", component: "home-page" }]'));
        const aside = window.document.createElement('aside');
        aside.innerHTML = '<div b-router-outlet></div>';
        window.document.body.append(aside);
        routed = core.createApp({
            router, state: () => window.eval('({})'),
            components: { 'home-page': { template: '<b>home</b>' } },
        });
        routed.mount(aside);
        assert.equal(aside.textContent, 'home');
        router.current.value = null;
        assert.equal(aside.textContent, '');
        router.current.value = window.eval('({ path: "/", params: {}, component: "home-page" })');
        assert.equal(aside.textContent, 'home');
        const validity = core.validate({ email: '' }, { email: [{ name: 'required' }] });
        assert.ok(Array.isArray(validity.email));
        const inserted = app.insert('main', 'append', '<div b-html="$stores.markup.value"></div>');
        assert.equal(inserted.nodes[0].innerHTML, '<em>authored</em>');
    });
}

test('optional scripts report missing core explicitly and contain no separate reactive engine', t => {
    const dom = new JSDOM('', { runScripts: 'outside-only' });
    t.after(() => dom.window.close());
    for (const plugin of ['router', 'persistence', 'http', 'forms', 'step', 'money-mask']) {
        const source = readFileSync(new URL(`../dist/brio.${plugin}.min.js`, import.meta.url), 'utf8');
        assert.throws(() => dom.window.eval(source), /Load the Brio core/);
        assert.equal(source.includes('Brio state() requires a plain object or array.'), false);
        assert.equal(source.includes('Cannot run a disposed Brio scope'), false);
    }
    for (const marker of ['persistence key', 'Duplicate route pattern', 'Unknown validation rule',
        'Step initial must', 'Money mask precision', 'Circular HTTP query']) {
        assert.equal(production.includes(marker), false);
        assert.equal(development.includes(marker), false);
    }
});

for (const [name, bundle, dev] of [['production', production, false], ['development', development, true]]) {
    test(`${name}: each plugin loads independently and extends only its own public API`, t => {
        for (const [plugin, keys] of Object.entries(pluginAPI)) {
            const dom = new JSDOM('', { runScripts: 'outside-only' });
            t.after(() => dom.window.close());
            const { window } = dom;
            let ready = 0;
            window.addEventListener('brio', () => ready++);
            window.eval(bundle);
            const core = window.brio;
            const before = Object.fromEntries(Object.entries(core));
            window.eval(readFileSync(new URL(`../dist/brio.${plugin}.min.js`, import.meta.url), 'utf8'));
            assert.equal(window.brio, core);
            assert.equal(ready, 1);
            assert.deepEqual(Object.keys(core).sort(), [...coreAPI, ...(dev ? developmentAPI : []), ...keys].sort());
            for (const key of Object.keys(before)) assert.equal(core[key], before[key]);
        }
    });
}

test('npm main entry exposes every plugin and enables devtools only on explicit request', () => {
    execFileSync(process.execPath, ['--input-type=module', '-e', `
        import assert from 'node:assert/strict';
        import * as brio from '@jnreis/briojs';
        for (const name of ['persist', 'createRouter', 'createStepEngine', 'validate',
            'resource', 'untrack', 'trustedHTML', 'enableDevtools', 'inspectDevtools', 'devtoolsPanel'])
            assert.equal(typeof brio[name], 'function', name);
        assert.equal(typeof brio.http.get, 'function');
        let reads = 0;
        const options = { state: () => ({ get value() { reads++; return 1; } }) };
        brio.createApp(options).dispose();
        assert.equal(reads, 0);
        brio.enableDevtools();
        brio.enableDevtools();
        const app = brio.createApp(options);
        assert.ok(reads > 0);
        assert.equal(brio.inspectDevtools().appCount, 1);
        app.dispose();
        assert.equal(brio.inspectDevtools().appCount, 0);
    `], { cwd: new URL('..', import.meta.url), stdio: 'pipe' });
});
