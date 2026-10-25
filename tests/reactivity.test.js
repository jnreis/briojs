import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createApp } from '@jnreis/briojs';
import { batch, computed, createScope, effect, flush, onCleanup, signal, state, untrack } from '@jnreis/briojs/reactivity';
import { persist } from '@jnreis/briojs/persistence';
import { createRouter } from '@jnreis/briojs/router';
import { validate } from '@jnreis/briojs/inputs';

test('state preserves cycles, shared references, and raw identity', () => {
    const shared = { value: 1 };
    const input = { left: shared, right: shared };
    input.self = input;

    const observed = state(input);

    assert.strictEqual(observed.self, observed);
    assert.strictEqual(observed.left, observed.right);
    assert.strictEqual(state(observed), observed);
});

test('symbol-keyed state properties preserve values and reactive dependencies', () => {
    const key = Symbol.for('brio.raw');
    const model = state({ [key]: 'initial' });
    const values = [];
    const stop = effect(() => values.push(model[key]));

    model[key] = 'updated';
    delete model[key];
    stop();
    model[key] = 'disposed';

    assert.deepEqual(values, ['initial', 'updated', undefined]);
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

test('flush applies pending effects inside a batch without ending it', () => {
    const model = state({ first: 1, second: 1 });
    const values = [];
    effect(() => values.push(model.first + model.second));

    batch(() => {
        model.first = 2;
        flush();
        assert.deepEqual(values, [2, 3], 'earlier writes are visible after flush');
        model.second = 3;
        assert.deepEqual(values, [2, 3], 'later writes stay batched');
    });

    assert.deepEqual(values, [2, 3, 5]);
    flush();
    assert.deepEqual(values, [2, 3, 5], 'flush is a no-op without pending effects');
});

test('computed values reject circular reads and recover when the cycle is broken', () => {
    const cells = state({ a: '=b', b: '=a' });
    const values = {};
    const evaluate = name => {
        const formula = cells[name];
        if (!formula.startsWith('=')) return Number(formula);
        try {
            return values[formula.slice(1)].value + 1;
        } catch (error) {
            return error.message;
        }
    };
    values.a = computed(() => evaluate('a'));
    values.b = computed(() => evaluate('b'));

    assert.equal(values.b.value, 'Circular Brio computed dependency.1', 'the error surfaces instead of a stale undefined');
    assert.equal(values.a.value, 'Circular Brio computed dependency.', 'the re-entered value reports the cycle');
    cells.b = '1';
    assert.equal(values.a.value, 2);
    assert.equal(values.b.value, 1);
    assert.throws(() => {
        const self = computed(() => self.value);
        return self.value;
    }, /Circular Brio computed dependency/);
});

test('computed values read inside a batch reflect earlier writes', () => {
    const source = state({ count: 1 });
    const doubled = computed(() => source.count * 2);
    const seen = [];
    effect(() => seen.push(doubled.value));

    batch(() => {
        source.count = 2;
        assert.equal(doubled.value, 4, 'no stale cached value inside the batch');
        source.count = 3;
    });
    assert.deepEqual(seen, [2, 6], 'the effect still runs once per batch');
});

test('a dependency cycle formed under live effects settles instead of ping-ponging', () => {
    const cells = state({ a: '', b: '' });
    const values = {};
    let evaluations = 0;
    const evaluate = name => {
        assert.ok(++evaluations < 50, 'evaluation must terminate');
        const formula = cells[name];
        if (!formula.startsWith('=')) return formula === '' ? 0 : Number(formula);
        try {
            const value = values[formula.slice(1)].value;
            return typeof value === 'number' ? value + 1 : '#CYCLE!';
        } catch {
            return '#CYCLE!';
        }
    };
    values.a = computed(() => evaluate('a'));
    values.b = computed(() => evaluate('b'));
    const rendered = { a: [], b: [] };
    // Subscribe b's effects first so b is re-read before a would otherwise be invalidated.
    for (const name of ['b', 'a']) for (let copy = 0; copy < 2; copy++) effect(() => rendered[name].push(values[name].value));

    cells.a = '=b';
    cells.b = '=a';
    assert.equal(values.a.value, '#CYCLE!');
    assert.equal(values.b.value, '#CYCLE!');
    evaluations = 0;
    cells.b = '10';
    assert.equal(values.a.value, 11);
    assert.equal(values.b.value, 10);
    assert.ok(evaluations <= 2, `each cell re-evaluates once after the cycle breaks (${evaluations})`);
    assert.deepEqual(rendered.a.slice(-1), [11]);
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

test('persistence outside a scope lives for the page (module-level state)', () => {
    const values = new Map();
    const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
    const token = persist('outside', '', { storage });
    assert.equal(values.get('outside'), '""');
    token.value = 'jwt.ada';
    assert.equal(values.get('outside'), '"jwt.ada"');
    assert.equal(persist('outside', '', { storage }).value, 'jwt.ada', 'a later read restores the stored value');
});

test('persistence applies cross-tab updates and keeps saving local changes afterwards', t => {
    const values = new Map();
    const storage = {
        getItem(key) { return values.has(key) ? values.get(key) : null; },
        setItem(key, value) { values.set(key, String(value)); },
    };
    const previousWindow = globalThis.window;
    globalThis.window = new EventTarget();
    const scope = createScope();
    t.after(() => {
        scope.dispose();
        globalThis.window = previousWindow;
    });
    const remote = (key, value) => window.dispatchEvent(Object.assign(new Event('storage'), {
        key, newValue: JSON.stringify(value), storageArea: storage,
    }));
    let list;
    let profile;
    scope.run(() => {
        list = persist('list', ['a', 'b', 'c'], { storage });
        profile = persist('profile', { name: 'Ada', role: 'admin' }, { storage });
    });

    remote('list', ['z']);
    assert.deepEqual([...list], ['z'], 'a shorter remote array replaces contents without holes');
    assert.equal(list.length, 1);
    remote('profile', { name: 'Grace' });
    assert.deepEqual({ ...profile }, { name: 'Grace' });
    remote('profile', ['not', 'an', 'object']);
    assert.deepEqual({ ...profile }, { name: 'Grace' }, 'a remote value of a different shape is ignored');

    list.push('y');
    profile.name = 'Hopper';
    assert.equal(values.get('list'), '["z","y"]', 'local changes still persist after a remote update');
    assert.equal(values.get('profile'), '{"name":"Hopper"}');
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
        query: {},
        hash: '',
        fullPath: '/items/abc',
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
    const app = createApp().use(firstPlugin).use(firstPlugin);

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

test('onCleanup in an effect body runs before each re-run and when the effect stops', () => {
    const source = signal(1);
    const log = [];
    const stop = effect(() => {
        const value = source.value;
        log.push(`run ${value}`);
        onCleanup(() => log.push(`cleanup ${value}`));
    });
    source.value = 2;
    source.value = 3;
    assert.deepEqual(log, ['run 1', 'cleanup 1', 'run 2', 'cleanup 2', 'run 3']);
    stop();
    stop();
    assert.deepEqual(log.slice(-1), ['cleanup 3']);
    assert.equal(log.length, 6);
});

test('per-run effect cleanups work in owned and unowned effects and never adopt the triggering scope', () => {
    const source = signal(0);
    let cleanups = 0;
    const scope = createScope();
    scope.run(() => effect(() => {
        source.value;
        onCleanup(() => cleanups++);
    }));
    const unrelated = createScope();
    let unowned = 0;
    const stopUnowned = effect(() => {
        source.value;
        onCleanup(() => unowned++);
    });
    unrelated.run(() => { source.value = 1; });
    assert.equal(cleanups, 1);
    assert.equal(unowned, 1);
    unrelated.dispose();
    assert.equal(unowned, 1, 'the unowned cleanup was not registered on the writing scope');
    source.value = 2;
    assert.equal(unowned, 2);
    scope.dispose();
    assert.equal(cleanups, 3);
    stopUnowned();
    assert.equal(unowned, 3);
});

test('onCleanup inside a nested scope created by an effect keeps that scope lifetime', () => {
    const source = signal(0);
    const log = [];
    const outer = createScope();
    outer.run(() => effect(() => {
        const value = source.value;
        const child = createScope();
        child.run(() => onCleanup(() => log.push(`child ${value}`)));
        onCleanup(() => child.dispose());
    }));
    assert.deepEqual(log, []);
    source.value = 1;
    assert.deepEqual(log, ['child 0']);
    outer.dispose();
    assert.deepEqual(log, ['child 0', 'child 1']);
});

test('a per-run cleanup handle runs it early once and failing cleanups surface after the run', () => {
    const source = signal(0);
    let calls = 0;
    const stop = effect(() => {
        source.value;
        const runNow = onCleanup(() => calls++);
        if (source.value === 1) {
            runNow();
            runNow();
        }
    });
    source.value = 1;
    assert.equal(calls, 2, 'run 0 cleaned up, then run 1 cleaned up early');
    source.value = 2;
    assert.equal(calls, 2, 'the early cleanup did not run again');
    stop();
    assert.equal(calls, 3);

    const failing = signal(0);
    let runs = 0;
    const stopFailing = effect(() => {
        failing.value;
        runs++;
        onCleanup(() => { throw new Error('cleanup broke'); });
    });
    assert.throws(() => { failing.value = 1; }, /effect cleanups failed|cleanup broke/);
    assert.equal(runs, 2, 'the effect still re-ran after its cleanup failed');
    assert.throws(() => stopFailing(), /effect cleanups failed|cleanup broke/);
});

test('untrack reads values without subscribing the current effect or computed', () => {
    const tracked = signal(1);
    const ignored = signal(10);
    let runs = 0;
    let seen;
    const stop = effect(() => {
        runs++;
        seen = tracked.value + untrack(() => ignored.value);
    });
    ignored.value = 20;
    assert.equal(runs, 1);
    tracked.value = 2;
    assert.equal(runs, 2);
    assert.equal(seen, 22);
    stop();

    const sum = computed(() => tracked.value + untrack(() => ignored.value));
    assert.equal(sum.value, 22);
    ignored.value = 30;
    assert.equal(sum.value, 22);
    tracked.value = 3;
    assert.equal(sum.value, 33);
    assert.equal(untrack(() => 'plain'), 'plain');
});

test('an effect re-runs when a nested effect or untracked code changes what it read during the run', () => {
    const route = signal('/settings');
    const seen = [];
    const scope = createScope();
    scope.run(() => effect(() => {
        const path = route.value;
        seen.push(path);
        // A guard created by the rendered "page" redirects while the outer effect is still running.
        if (path === '/settings') effect(() => untrack(() => { route.value = '/login'; }));
    }));
    assert.deepEqual(seen, ['/settings', '/login']);
    assert.equal(route.value, '/login');

    const count = signal(0);
    const runs = [];
    effect(() => {
        runs.push(count.value);
        if (count.value < 3) untrack(() => count.value++);
    });
    assert.deepEqual(runs, [0, 1, 2, 3]);

    const loop = signal(0);
    assert.throws(() => effect(() => {
        loop.value;
        untrack(() => loop.value++);
    }), /keeps re-triggering itself/);
    scope.dispose();
});

test('effects run in creation order so an owner disposes stale child effects before they run', () => {
    const source = signal({ page: 1, items: ['a'] });
    // A computed first read by an unrelated, earlier effect subscribes ahead of the owner below.
    const page = computed(() => source.value.page);
    const header = [];
    effect(() => header.push(page.value));
    const childRuns = [];
    let mounts = 0;
    const scope = createScope();
    // Like a router outlet or b-if: each run mounts a child scope and disposes the previous one.
    scope.run(() => effect(() => {
        source.value;
        const mount = ++mounts;
        const child = createScope();
        onCleanup(() => child.dispose());
        child.run(() => effect(() => childRuns.push(`${mount}:${page.value}`)));
    }));
    source.value = { page: 2, items: ['b'] };
    assert.deepEqual(childRuns, ['1:1', '2:2'], 'the old child never runs with the new page');
    assert.deepEqual(header, [1, 2]);

    // Re-subscribing on every run used to move the owner behind its children in the dependency set.
    source.value = { page: 3, items: ['c'] };
    assert.deepEqual(childRuns, ['1:1', '2:2', '3:3']);
    scope.dispose();
});

test('validate throws on an unknown rule name instead of silently passing', () => {
    assert.equal(validate({ name: 'Ada' }, { name: [{ name: 'required' }] }), true);
    assert.throws(() => validate({ name: '' }, { name: [{ name: 'requird' }] }),
        /Unknown validation rule "requird" for field "name"\. Known rules: required, min/);
    assert.equal(validate({ age: 4 }, { age: [{ name: 'even' }] }, { even: value => value % 2 === 0 }), true);
});
