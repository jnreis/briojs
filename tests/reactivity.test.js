import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createApp } from 'briojs';
import { batch, computed, createScope, effect, onCleanup, signal, state } from 'briojs/reactivity';
import { persist } from 'briojs/persistence';
import { createRouter } from 'briojs/router';

test('state preserves cycles, shared references, and raw identity', () => {
    const shared = { value: 1 };
    const input = { left: shared, right: shared };
    input.self = input;

    const observed = state(input);

    assert.strictEqual(observed.self, observed);
    assert.strictEqual(observed.left, observed.right);
    assert.strictEqual(state(observed), observed);
});

test('effects recollect conditional dependencies and dispose cleanly', () => {
    const model = state({
        useFirst: true,
        first: { value: 'first' },
        second: { value: 'second' },
    });
    const values = [];
    const stop = effect(() => {
        values.push(model.useFirst ? model.first.value : model.second.value);
    });

    model.useFirst = false;
    model.first.value = 'ignored';
    model.second.value = 'updated';
    stop();
    model.second.value = 'disposed';

    assert.deepEqual(values, ['first', 'second', 'updated']);
    assert.equal(stop.active, false);
});

test('computed values are lazy, cached, and invalidated by source changes', () => {
    const model = state({ count: 2 });
    let calculations = 0;
    const doubled = computed(() => {
        calculations++;
        return model.count * 2;
    });

    assert.equal(calculations, 0);
    assert.equal(doubled.value, 4);
    assert.equal(doubled.value, 4);
    assert.equal(calculations, 1);
    model.count = 3;
    assert.equal(doubled.value, 6);
    assert.equal(calculations, 2);
    doubled.dispose();
    assert.throws(() => doubled.value, /disposed Brio computed/);
});

test('batch flushes dependent effects once after all writes', () => {
    const model = state({ first: 1, second: 1 });
    const values = [];
    effect(() => values.push(model.first + model.second));

    batch(() => {
        model.first = 2;
        model.second = 3;
    });

    assert.deepEqual(values, [2, 5]);
});

test('scopes dispose owned effects and nested scopes', () => {
    const root = createScope();
    const nested = root.run(() => createScope());
    const source = signal(1);
    const values = [];
    nested.run(() => effect(() => values.push(source.value)));

    source.value = 2;
    root.dispose();
    source.value = 3;

    assert.deepEqual(values, [1, 2]);
    assert.equal(root.disposed, true);
    assert.equal(nested.disposed, true);
});

test('cleanup handles and scope disposal are idempotent', () => {
    const scope = createScope();
    let cleanups = 0;
    let disposeCleanup;
    scope.run(() => disposeCleanup = onCleanup(() => cleanups++));
    disposeCleanup();
    disposeCleanup();
    scope.dispose();

    assert.equal(cleanups, 1);
});

test('array truncation notifies index and length subscribers', () => {
    const items = state(['a', 'b', 'c']);
    const values = [];
    effect(() => values.push(`${items.length}:${items[2]}`));

    items.length = 1;

    assert.deepEqual(values, ['3:c', '1:undefined']);
});

test('array mutators batch updates and property operations remain observable', () => {
    const items = state([1]);
    const values = [];
    effect(() => values.push(`${items.length}:${Object.keys(items).join(',')}`));

    items.push(2);
    Object.defineProperty(items, 'extra', {
        value: 3,
        writable: true,
        enumerable: true,
        configurable: true,
    });
    items.extra = 4;

    assert.deepEqual(values, ['1:0', '2:0,1', '2:0,1,extra']);
});

test('the in operator tracks property creation and deletion', () => {
    const model = state({});
    const values = [];
    effect(() => values.push('ready' in model));

    model.ready = true;
    delete model.ready;

    assert.deepEqual(values, [false, true, false]);
});

test('persistence binds reactive objects and primitive signals to a scope', () => {
    const values = new Map();
    const storage = {
        getItem(key) { return values.has(key) ? values.get(key) : null; },
        setItem(key, value) { values.set(key, String(value)); },
    };
    const scope = createScope();
    let persistedObject;
    let persistedCount;

    scope.run(() => {
        persistedObject = persist('profile', { name: 'Ada' }, { storage });
        persistedCount = persist('count', 1, { storage });
    });
    assert.equal(values.get('profile'), '{"name":"Ada"}');
    assert.equal(persistedCount.value, 1);

    persistedObject.name = 'Grace';
    persistedCount.value = 2;

    assert.equal(values.get('profile'), '{"name":"Grace"}');
    assert.equal(values.get('count'), '2');
    scope.dispose();
    persistedCount.value = 3;
    assert.equal(values.get('count'), '2');
});

test('persistence requires a cleanup scope', () => {
    const storage = { getItem: () => null, setItem: () => {} };
    assert.throws(() => persist('outside', 1, { storage }), /inside an app/);
});

test('router matches static and parameterized paths without requiring a DOM', () => {
    const router = createRouter([
        { path: '/items/:id', component: 'item-page' },
        { path: '/', component: 'home-page' },
        { path: '/items/new', component: 'new-item-page' },
        { path: '/café', component: 'cafe-page' },
    ]);

    assert.deepEqual(router.match('/items/abc'), {
        path: '/items/abc',
        params: { id: 'abc' },
        component: 'item-page',
    });
    assert.equal(router.match('/items/new').component, 'new-item-page');
    assert.equal(router.match('/caf%C3%A9').component, 'cafe-page');
    assert.equal(router.match('/missing'), null);
    assert.throws(() => createRouter([
        { path: '/items/:id', component: 'item-page' },
        { path: '/items/:slug', component: 'another-item-page' },
    ]), /Duplicate route pattern/);
});

test('app instances isolate state and enforce component names', () => {
    const first = createApp({ state: () => ({ count: 1 }) });
    const second = createApp({ state: () => ({ count: 10 }) });

    first.state.count++;

    assert.equal(first.state.count, 2);
    assert.equal(second.state.count, 10);
    first.component('user-card', { template: '<span></span>' });
    assert.throws(() => first.component('bad_component', { template: '<span></span>' }), /custom-element name/);
    first.dispose();
    assert.throws(() => first.mount('#missing'), /disposed Brio app/);
    second.dispose();
});

test('plugins are idempotent and app initialization cleans up plugin scopes on failure', () => {
    const source = signal(1);
    const values = [];
    const firstPlugin = () => effect(() => values.push(source.value));
    const app = createApp().plugin(firstPlugin).plugin(firstPlugin);

    assert.deepEqual(values, [1]);
    app.dispose();
    source.value = 2;
    assert.deepEqual(values, [1]);

    assert.throws(() => createApp({
        plugins: [
            firstPlugin,
            () => {
                throw new Error('plugin failed');
            },
        ],
    }), /plugin failed/);
    assert.deepEqual(values, [1, 2]);
    source.value = 3;
    assert.deepEqual(values, [1, 2]);
});
