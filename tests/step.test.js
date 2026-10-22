import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';
import * as npm from '@jnreis/briojs';

function environment(t, bundle) {
    if (!bundle) return { api: npm, realm: value => value };
    const dom = new JSDOM('<main></main><aside></aside>', { runScripts: 'outside-only' });
    t.after(() => dom.window.close());
    dom.window.eval(readFileSync(new URL(`../dist/${bundle}`, import.meta.url), 'utf8'));
    dom.window.eval(readFileSync(new URL('../dist/brio.step.min.js', import.meta.url), 'utf8'));
    return {
        api: dom.window.brio, window: dom.window,
        realm: value => dom.window.JSON.parse(JSON.stringify(value)),
    };
}

const config = () => ({
    initial: 'intro',
    steps: { intro: { next: 'details' }, details: { next: 'review' }, review: {} },
});

for (const bundle of [undefined, 'brio.min.js', 'brio.dev.min.js']) {
    const label = bundle ?? 'npm';
    test(`${label}: single current, terminal boundaries, history branches and reset`, t => {
        const { api, realm } = environment(t, bundle);
        const wizard = api.createStepEngine(realm(config()));
        assert.equal(wizard.current, 'intro');
        assert.equal(wizard.canGoNext, true);
        assert.equal(wizard.canGoBack, false);
        assert.equal(wizard.back(), false);
        assert.equal(wizard.reset(), false);
        assert.equal(wizard.isActive('missing'), false);
        assert.equal(wizard.next(), true);
        assert.equal(wizard.current, 'details');
        wizard.next();
        assert.equal(wizard.current, 'review');
        assert.equal(wizard.canGoNext, false);
        assert.equal(wizard.next(), false);
        assert.equal(wizard.back(), true);
        assert.equal(wizard.current, 'details');
        wizard.go('intro');
        assert.equal(wizard.canGoBack, true);
        assert.equal(wizard.back(), true);
        assert.equal(wizard.current, 'details');
        wizard.back();
        assert.equal(wizard.current, 'intro');
        assert.equal(wizard.canGoBack, false);
        wizard.go('review');
        wizard.go('intro');
        assert.equal(wizard.reset(), true);
        assert.equal(wizard.current, 'intro');
        assert.equal(wizard.canGoBack, false);
        assert.equal(wizard.reset(), false);
    });

    test(`${label}: queries react atomically; mutation methods do not subscribe effects`, t => {
        const { api, realm } = environment(t, bundle);
        const wizard = api.createStepEngine(realm(config()));
        const scope = api.createScope();
        const snapshots = [];
        scope.run(() => api.effect(() => snapshots.push([
            wizard.current, wizard.canGoNext, wizard.canGoBack, wizard.isActive('review'),
        ])));
        assert.equal(wizard.go('intro'), true);
        wizard.back();
        wizard.reset();
        assert.equal(snapshots.length, 1);
        wizard.next();
        wizard.next();
        wizard.back();
        wizard.reset();
        assert.deepEqual(snapshots, [
            ['intro', true, false, false],
            ['details', true, true, false],
            ['review', false, true, true],
            ['details', true, true, false],
            ['intro', true, false, false],
        ]);
        let runs = 0;
        const stop = api.effect(() => { runs++; wizard.next(); });
        wizard.go('review');
        assert.equal(runs, 1);
        stop();
        scope.dispose();
        wizard.reset();
        assert.equal(snapshots.length, 7);
    });

    test(`${label}: cycles, self-links and copied immutable configuration`, t => {
        const { api, realm } = environment(t, bundle);
        const options = realm({ initial: 'a', steps: { a: { next: 'b' }, b: { next: 'a' }, self: { next: 'self' } } });
        const wizard = api.createStepEngine(options);
        options.initial = 'b';
        options.steps.a.next = 'self';
        delete options.steps.b;
        wizard.next();
        assert.equal(wizard.current, 'b');
        wizard.next();
        assert.equal(wizard.current, 'a');
        wizard.next();
        wizard.back();
        wizard.back();
        assert.equal(wizard.current, 'b');
        wizard.back();
        assert.equal(wizard.current, 'a');
        assert.equal(wizard.canGoBack, false);
        wizard.go('self');
        assert.equal(wizard.canGoNext, true);
        assert.equal(wizard.next(), true);
        wizard.back();
        assert.equal(wizard.current, 'a');
        for (const mutate of [
            () => { wizard.current = 'b'; },
            () => { wizard.canGoNext = false; },
            () => { wizard.canGoBack = true; },
            () => { wizard.go = () => false; },
            () => { delete wizard.next; },
            () => Object.defineProperty(wizard, 'current', { value: 'b' }),
        ]) assert.throws(mutate);
        assert.equal(Object.isFrozen(wizard), true);
        for (const target of ['missing', 'constructor', null, undefined, 1, '', ' '])
            assert.throws(() => wizard.go(target));
        assert.equal(wizard.current, 'a');
        assert.equal(wizard.canGoBack, false);
    });
}

test('invalid configurations, removed fields, accessors and dangling links fail before engine creation', () => {
    for (const value of [
        null, undefined, [], new Date(), {}, { initial: 'a' },
        { initial: 'a', steps: {} }, { steps: { a: {} } },
        { initial: 'missing', steps: { a: {} } },
        { initial: 'constructor', steps: { a: {} } },
        { initial: 'a', steps: { a: null } },
        { initial: 'a', steps: { a: [] } },
        { initial: 'a', steps: { a: { next: undefined } } },
        { initial: 'a', steps: { a: { next: 1 } } },
        { initial: 'a', steps: { a: { next: 'missing' } } },
        { initial: 'a', steps: { a: { next: 'constructor' } } },
        { initial: ' ', steps: { ' ': {} } },
        { ...config(), extra: true },
        ...['active', 'keep', 'back', 'origin', 'label'].map(key =>
            ({ initial: 'a', steps: { a: { [key]: true } } })),
    ]) assert.throws(() => npm.createStepEngine(value));
    let reads = 0;
    const accessor = () => { reads++; throw Error('Accessor must not run'); };
    const options = Object.defineProperty({}, 'initial', { get: accessor });
    const definitions = Object.defineProperty({}, 'a', { get: accessor });
    const step = Object.defineProperty({}, 'next', { get: accessor });
    for (const value of [options, { initial: 'a', steps: definitions }, { initial: 'a', steps: { a: step } },
        { ...config(), [Symbol('extra')]: true }])
        assert.throws(() => npm.createStepEngine(value), /data properties/);
    assert.equal(reads, 0);
});

test('safe own names and exact identifiers do not collide with object prototypes', () => {
    const steps = Object.create(null);
    steps.__proto__ = { next: 'constructor' };
    steps.constructor = { next: 'toString' };
    steps.toString = { next: ' spaced ' };
    steps[' spaced '] = {};
    const wizard = npm.createStepEngine({ initial: '__proto__', steps });
    wizard.next();
    assert.equal(wizard.current, 'constructor');
    wizard.next();
    assert.equal(wizard.current, 'toString');
    wizard.next();
    assert.equal(wizard.current, ' spaced ');
    assert.throws(() => wizard.go('spaced'));
});

test('local data and shared stores consume engine reactivity without caller wrapping or lifetime coupling', t => {
    const { api, realm, window } = environment(t, 'brio.min.js');
    const wizard = api.createStepEngine(realm(config()));
    const first = api.createApp(window.eval('({ state: () => ({}) })'));
    first.state.wizard = wizard;
    const root = window.document.querySelector('main');
    root.innerHTML = '<b b-text="$data.wizard.current"></b><button on-click="$data.wizard.next()">next</button>';
    const sharedOptions = window.eval('({stores:{}})');
    sharedOptions.stores.wizard = wizard;
    const second = api.createApp(sharedOptions);
    const aside = window.document.querySelector('aside');
    aside.innerHTML = '<b b-text="$stores.wizard.current"></b>';
    t.after(() => { first.dispose(); second.dispose(); });
    first.mount(root);
    second.mount(aside);
    root.querySelector('button').click();
    assert.equal(root.querySelector('b').textContent, 'details');
    assert.equal(aside.querySelector('b').textContent, 'details');
    first.dispose();
    assert.equal(wizard.current, 'details');
    wizard.next();
    assert.equal(aside.querySelector('b').textContent, 'review');
    const independent = api.createStepEngine(realm(config()));
    assert.equal(independent.current, 'intro');
});
