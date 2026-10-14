import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';
import * as esm from 'briojs';

const production = readFileSync(new URL('../dist/brio.min.js', import.meta.url), 'utf8');
const development = readFileSync(new URL('../dist/brio.dev.min.js', import.meta.url), 'utf8');
const coreAPI = [
    'createApp', 'state', 'signal', 'computed', 'effect', 'batch',
    'createScope', 'onCleanup', 'persist', 'createRouter', 'createStepEngine',
    'validate', 'http', 'trustedHTML',
];
const developmentAPI = ['devtools', 'inspectDevtools', 'devtoolsPanel'];

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

test('ESM core does not snapshot state until the separate devtools entry is imported', async () => {
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
    const { inspectDevtools } = await import('briojs/devtools');
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
    assert.equal(esm.devtools, undefined);
    assert.equal('newStepEngine' in esm, false);
    const engine = esm.createStepEngine({
        intro: { active: true, next: 'details' },
        details: { back: 'intro' },
    });
    assert.equal(engine.getActiveStep(), 'intro');
    assert.equal(engine.nextStep('intro'), true);
    assert.equal(engine.getActiveStep(), 'details');
    assert.equal(engine.backStep('details'), true);
    assert.equal(engine.getActiveStep(), 'intro');
    assert.equal(typeof esm.hydrateNode, 'function');
});
