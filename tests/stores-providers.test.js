import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import { assign, createApp, evaluate, evaluateFunction, execute, state } from 'briojs';

const bundles = ['brio.min.js', 'brio.dev.min.js'].map(name => [
    name, readFileSync(new URL(`../dist/${name}`, import.meta.url), 'utf8'),
]);

function environment(t, markup, source = '({})', bundle = bundles[0][1]) {
    const dom = new JSDOM(`<main id="app">${markup}</main><aside id="other"></aside><div id="portal"></div>`, {
        runScripts: 'outside-only', url: 'https://brio.test/',
    });
    const { window } = dom;
    window.eval(bundle);
    window.eval(readFileSync(new URL('../dist/brio.router.min.js', import.meta.url), 'utf8'));
    const options = window.eval(source);
    const app = window.brio.createApp(options);
    const errors = [];
    window.addEventListener('error', event => {
        errors.push(event.error);
        event.preventDefault();
    });
    t.after(() => {
        try {
            app.dispose();
            assert.deepEqual(errors, []);
        } finally {
            window.close();
        }
    });
    return { app, window, root: window.document.querySelector('#app'), options };
}

test('store registration preserves exact references, safe names, fixed registration and optional values', () => {
    const session = state({ user: null });
    const plain = { value: 1 };
    const input = Object.assign(Object.create(null), { session, plain, optional: undefined });
    input.__proto__ = plain;
    input.constructor = session;
    const app = createApp({ stores: input });
    const other = createApp({ stores: { session } });
    try {
        assert.equal(Object.getPrototypeOf(app.stores), null);
        assert.equal(app.stores.session, session);
        assert.equal(app.stores.plain, plain);
        assert.equal(app.stores.__proto__, plain);
        assert.equal(app.stores.constructor, session);
        input.session = plain;
        delete input.plain;
        assert.equal(app.stores.session, session);
        assert.equal(app.stores.plain, plain);
        assert.equal(app.stores.absent, undefined);
        assert.equal('optional' in app.stores, true);
        assert.equal(Reflect.set(app.stores, 'session', plain), false);
        assert.equal(Reflect.deleteProperty(app.stores, 'session'), false);
        assert.throws(() => Object.defineProperty(app.stores, 'another', { value: plain }));
        assert.throws(() => { app.stores = {}; });
        app.dispose();
        session.user = 'shared';
        assert.equal(other.stores.session.user, 'shared');
    } finally {
        app.dispose();
        other.dispose();
    }
    const empty = createApp();
    assert.equal(empty.stores.absent, undefined);
    empty.dispose();
    for (const stores of [null, [], new Date(), Promise.resolve({}), { get bad() { return {}; } }])
        assert.throws(() => createApp({ stores }), /stores must/);
});

test('stores and providers work in every strict expression form without implicit names', () => {
    const $stores = Object.freeze({ cart: state({ count: 0 }) });
    const $provided = Object.freeze({ increment: 2 });
    const ctx = { $stores, $provided };
    assert.equal(evaluate('$stores.cart.count + $provided.increment', ctx), 2);
    execute('$stores.cart.count += $provided.increment;', ctx);
    assign('$stores.cart.count', ctx, 4);
    evaluateFunction('() => { $stores.cart.count += ctx.$provided.increment; }', ctx)(ctx);
    assert.equal($stores.cart.count, 6);
    assert.throws(() => evaluate('cart.count', ctx), error => error.cause instanceof ReferenceError);
});

for (const [name, bundle] of bundles) test(`${name} shares reactive stores across apps without making plain stores reactive`, t => {
    const { app, window, root, options } = environment(t, `
        <div b-data="{ local: true }" b-provide="{ count: $stores.session.count }">
        <span b-text="$stores.session.count"></span><em b-text="$provided.count"></em>
        <b b-text="$stores.plain.count"></b>
        <i b-for="n in 2" b-text="$stores.session.count"></i>
        <script b-script>(ctx) => { ctx.$stores.session.count++; }</script></div>`,
    `({ stores: { session: brio.state({ count: 0 }), plain: { count: 0 } } })`, bundle);
    const sharedApp = window.brio.createApp(window.Object.assign(new window.Object(), { stores: app.stores }));
    t.after(() => sharedApp.dispose());
    window.document.querySelector('#other').innerHTML = '<output b-text="$stores.session.count"></output>';
    app.mount(root);
    sharedApp.mount('#other');
    assert.equal(root.querySelector('span').textContent, '1');
    assert.equal(window.document.querySelector('output').textContent, '1');
    options.stores.plain.count = 7;
    assert.equal(root.querySelector('b').textContent, '0');
    options.stores.session.count = 3;
    assert.equal(root.querySelector('span').textContent, '3');
    assert.equal(root.querySelector('em').textContent, '3');
    assert.equal(root.querySelector('i').textContent, '3');
    assert.equal(window.document.querySelector('output').textContent, '3');
    app.dispose();
    options.stores.session.count = 4;
    assert.equal(window.document.querySelector('output').textContent, '4');
});

test('providers are live on their own element, preserve objects, and inherit independently of data scopes', t => {
    const { app, root, window } = environment(t, `
        <section b-data="{ theme: 'dark' }"
                 b-provide="{ theme: $data.theme, cart: $stores.cart }"
                 b-bind-title="$provided.theme">
          <input b-model="$data.theme"><span b-text="$provided.theme"></span>
          <div b-data="{ local: 0 }">
            <output b-text="$provided.cart.count"></output>
            <button b-on-click="$provided.cart.count++"></button>
            <script b-script>(ctx) => {
              ctx.$stores.cart.view = ctx.$provided;
              ctx.$stores.cart.reference = ctx.$provided.cart;
            }</script>
          </div>
        </section>`, `({ stores: { cart: brio.state({ count: 0 }) } })`);
    app.mount(root);
    assert.equal(root.querySelector('section').title, 'dark');
    assert.equal(app.stores.cart.reference, app.stores.cart);
    root.querySelector('button').click();
    assert.equal(root.querySelector('output').textContent, '1');
    const view = app.stores.cart.view;
    const input = root.querySelector('input');
    input.value = 'light';
    input.dispatchEvent(new window.Event('input'));
    assert.equal(root.querySelector('section').title, 'light');
    assert.equal(root.querySelector('span').textContent, 'light');
    assert.equal(view.theme, 'light');
    assert.equal(view.missing, undefined);
    assert.equal(Reflect.has(view, 'theme'), true);
    assert.deepEqual(Object.keys(view).sort(), ['cart', 'theme']);
    for (const mutate of [
        () => Reflect.set(view, 'theme', 'x'),
        () => Reflect.deleteProperty(view, 'theme'),
        () => Reflect.defineProperty(view, 'theme', { value: 'x' }),
        () => Reflect.setPrototypeOf(view, {}),
        () => Object.preventExtensions(view),
    ]) assert.throws(mutate, /read-only/);
});

test('nested providers shadow undefined, react to key removal, and retain inherited values and enumeration', t => {
    const { app, root } = environment(t, `
        <section b-provide="$data.outer">
          <div b-provide="$data.inner">
            <span b-text="JSON.stringify($provided)"></span>
            <b b-text="$provided.theme ?? 'undefined'"></b>
            <i b-text="'theme' in $provided"></i>
          </div>
        </section>`, `({ state: () => ({
          outer: { theme: 'dark', size: 10 }, inner: { theme: undefined }
        }) })`);
    app.mount(root);
    assert.equal(root.querySelector('b').textContent, 'undefined');
    assert.equal(root.querySelector('span').textContent, '{"size":10}');
    app.state.inner.theme = 'light';
    assert.equal(root.querySelector('b').textContent, 'light');
    delete app.state.inner.theme;
    assert.equal(root.querySelector('b').textContent, 'dark');
    app.state.outer.theme = 'blue';
    assert.equal(root.querySelector('b').textContent, 'blue');
    app.state.inner.size = 20;
    assert.equal(root.querySelector('span').textContent, '{"theme":"blue","size":20}');
    delete app.state.outer.theme;
    assert.equal(root.querySelector('i').textContent, 'false');
    assert.equal(root.querySelector('b').textContent, 'undefined');
});

test('provider expressions read inherited values and recollect conditional dependencies', t => {
    const { app, root } = environment(t, `
        <section b-provide="{ theme: $data.left }">
          <span b-provide="{ theme: $data.inherit ? $provided.theme : $data.right }"
                b-text="$provided.theme"></span>
        </section>`, `({ state: () => ({ left: 'left', right: 'right', inherit: true }) })`);
    app.mount(root);
    app.state.left = 'next';
    assert.equal(root.querySelector('span').textContent, 'next');
    app.state.inherit = false;
    app.state.left = 'unused';
    assert.equal(root.querySelector('span').textContent, 'right');
    app.state.right = 'changed';
    assert.equal(root.querySelector('span').textContent, 'changed');
});

test('component-host providers reach setup/templates while slots retain their author context', t => {
    const { app, root, window } = environment(t, `
        <section b-provide="{ theme: $data.theme }">
          <test-card b-provide="{ user: $stores.session.user }">
            <b b-text="$provided.theme + ':' + $provided.user"></b>
          </test-card>
        </section>`, `({ state: () => ({ theme: 'outer' }),
            stores: { session: brio.state({ user: 'Alice' }) },
            components: { 'test-card': {
              template: '<div b-provide="{ theme: \\'inner\\' }"><i b-text="$provided.theme"></i><slot></slot></div><em b-text="$provided.user"></em>',
              setup({ $stores, $provided }) {
                $stores.session.setupTheme = $provided.theme;
                return {};
              }
            } } })`);
    app.mount(root);
    assert.equal(app.stores.session.setupTheme, 'outer');
    assert.equal(root.querySelector('i').textContent, 'inner');
    assert.equal(root.querySelector('b').textContent, 'outer:Alice');
    app.state.theme = 'changed';
    app.stores.session.user = 'Bob';
    assert.equal(root.querySelector('b').textContent, 'changed:Bob');
    assert.equal(root.querySelector('em').textContent, 'Bob');
    const definition = window.eval(`({
        template: '<span b-text="$stores.session.user"></span>',
        setup({ $provided }) { if ($provided.missing !== undefined) throw Error('missing'); return {}; }
    })`);
    app.component('empty-card', definition);
    app.insert(root, 'append', '<empty-card></empty-card>');
    assert.equal(root.querySelector('empty-card').textContent, 'Bob');
});

test('row providers update with keyed reuse and conditions dispose and recreate providers', t => {
    const { app, root } = environment(t, `
        <div b-for="item, index in $data.items" b-key="$for.item.id"
             b-provide="{ item: $for.item, index: $for.index }">
          <span b-text="$provided.item.name + ':' + $provided.index"></span>
        </div>
        <section b-if="$data.visible" b-data="{ count: 0 }"
                 b-provide="{ theme: $data.$parent.theme }">
          <b b-text="$provided.theme"></b><button b-on-click="$data.count++"></button>
          <i b-text="$data.count"></i>
        </section>`, `({ state: () => ({
            items: [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }],
            theme: 'dark', visible: true
        }) })`);
    app.mount(root);
    const row = root.querySelector('div');
    app.state.items.reverse();
    assert.equal(root.querySelectorAll('div')[1], row);
    assert.equal(row.textContent.trim(), 'A:1');
    app.state.items[1] = { id: 'a', name: 'replacement' };
    assert.equal(row.textContent.trim(), 'replacement:1');
    const old = root.querySelector('b');
    root.querySelector('button').click();
    app.state.visible = false;
    app.state.theme = 'light';
    assert.equal(old.textContent, 'dark');
    app.state.visible = true;
    assert.equal(root.querySelector('b').textContent, 'light');
    assert.equal(root.querySelector('i').textContent, '0');
});

test('providers follow original contexts through show, teleport, templates and trusted HTML', t => {
    const { app, root, window } = environment(t, `
        <template b-provide="{ theme: $data.theme }" b-template>
          <span b-show="$data.visible" b-text="$provided.theme"></span>
          <div b-teleport="'#portal'"><b b-text="$provided.theme"></b></div>
          <article b-html="trustedHTML($data.html)"></article>
        </template>`, `({ state: () => ({
            theme: 'dark', visible: true, html: '<i b-text="$provided.theme"></i>'
        }) })`);
    app.mount(root);
    const span = root.querySelector('span');
    app.state.visible = false;
    app.state.theme = 'light';
    assert.equal(span.textContent, 'light');
    assert.equal(window.document.querySelector('#portal b').textContent, 'light');
    assert.equal(root.querySelector('i').textContent, 'light');
    app.state.visible = true;
    assert.equal(root.querySelector('span'), span);
    app.state.html = '<strong b-text="$provided.theme"></strong>';
    assert.equal(root.querySelector('strong').textContent, 'light');
});

test('insertion inherits destination providers for children and parent providers for siblings', t => {
    const { app, root, window } = environment(t, `
        <section b-provide="{ name: 'outer' }">
          <div id="target" b-provide="{ name: $data.name }"></div>
        </section>`, `({ state: () => ({ name: 'inner' }), stores: { config: { suffix: '!' } } })`);
    const mount = app.mount(root);
    const content = '<span b-text="$provided.name + $stores.config.suffix"></span>';
    const child = app.insert('#target', 'append', content, { data: window.eval('({})') });
    const before = app.insert('#target', 'before', content);
    const after = app.insert('#target', 'after', content);
    assert.equal(child.nodes[0].textContent, 'inner!');
    assert.equal(before.nodes[0].textContent, 'outer!');
    assert.equal(after.nodes[0].textContent, 'outer!');
    const first = app.insert('#target', 'prepend', content);
    assert.equal(first.nodes[0].textContent, 'inner!');
    app.state.name = 'changed';
    assert.equal(child.nodes[0].textContent, 'changed!');
    const replaced = app.insert('#target', 'replaceChildren', content);
    assert.equal(replaced.nodes[0].textContent, 'changed!');
    assert.equal(child.removed, true);
    assert.equal(first.removed, true);
    const sibling = app.insert('#target', 'replaceWith', content);
    assert.equal(sibling.nodes[0].textContent, 'outer!');
    mount.unmount();
    app.state.name = 'remounted';
    app.mount(root);
    const remounted = app.insert('#target', 'append', content);
    assert.equal(remounted.nodes[0].textContent, 'remounted!');
});

test('router-created component setup/templates inherit stores and live providers', t => {
    const { app, root } = environment(t, `
        <div b-provide="{ theme: $data.theme }"><div b-router-outlet></div></div>`,
    `({
        state: () => ({ theme: 'dark' }),
        stores: { session: brio.state({ user: 'Alice' }) },
        router: brio.createRouter([{ path: '/', component: 'home-page' }]),
        components: { 'home-page': {
            template: '<span b-text="$provided.theme + $stores.session.user"></span>',
            setup({ $stores, $provided }) { $stores.session.initialTheme = $provided.theme; return {}; }
        } }
    })`);
    app.mount(root);
    assert.equal(app.stores.session.initialTheme, 'dark');
    assert.equal(root.querySelector('span').textContent, 'darkAlice');
    app.state.theme = 'light';
    assert.equal(root.querySelector('span').textContent, 'lightAlice');
});

test('invalid initial or updated providers report errors and recover without resetting child state', t => {
    const { app, root, window } = environment(t, `
        <section b-provide="$data.values"><span b-text="$provided.name"></span></section>`,
    `({ state: () => ({ values: { name: 'valid' } }) })`);
    app.mount(root);
    const span = root.querySelector('span');
    assert.throws(() => { app.state.values = null; }, error => {
        assert.match(error.errors[0].message, /b-provide/);
        return true;
    });
    app.state.values = window.eval('({ name: "recovered" })');
    assert.equal(root.querySelector('span'), span);
    assert.equal(span.textContent, 'recovered');
    app.unmount();
    for (const expression of ['null', '[]', 'Promise.resolve({})', 'new Date()', '({ get value() { return 1; } })', '']) {
        root.innerHTML = `<div b-provide="${expression}"></div>`;
        assert.throws(() => app.mount(root), /b-provide|expression/);
        assert.equal(app.roots.size, 0);
    }
});

test('ignored providers never evaluate and provider effects are stopped by unmount', t => {
    const { app, root, window } = environment(t, `
        <aside b-ignore b-provide="missing"></aside>
        <div b-provide="$data.values()"><span b-text="$provided.theme"></span></div>`,
    `({ state: () => ({
        theme: 'dark',
        values() { window.providerRuns = (window.providerRuns ?? 0) + 1; return { theme: this.theme }; }
    }) })`);
    app.mount(root);
    const span = root.querySelector('span');
    assert.equal(window.providerRuns, 1);
    app.state.theme = 'light';
    assert.equal(window.providerRuns, 2);
    app.unmount();
    app.state.theme = 'stopped';
    assert.equal(window.providerRuns, 2);
    assert.equal(span.textContent, 'light');
    app.mount(root);
    assert.equal(root.querySelector('span').textContent, 'stopped');
});

test('root providers preserve plain object identity, safe keys, signals and setup consumers', t => {
    const { app, root, window } = environment(t, `
        <span b-text="$provided.plain.count"></span>
        <i b-text="$stores.counter.value"></i>
        <test-card></test-card>`, `({
            stores: { plain: { count: 0 }, counter: brio.signal(0) },
            components: { 'test-card': {
                template: '<b b-text="$stores.plain.count"></b>',
                setup({ $stores, $provided }) {
                    window.setupStores = $stores;
                    window.setupProvided = $provided;
                    return {};
                }
            } }
        })`);
    root.setAttribute('b-provide', `({
        plain: $stores.plain, ['__proto__']: 'safe', constructor: 'own'
    })`);
    app.mount(root);
    assert.equal(window.setupStores, app.stores);
    assert.equal(window.setupProvided.plain, app.stores.plain);
    assert.equal(window.setupProvided.__proto__, 'safe');
    assert.equal(window.setupProvided.constructor, 'own');
    assert.equal(window.setupProvided.toString, undefined);
    assert.equal(window.setupProvided.missing, undefined);
    app.stores.plain.count = 5;
    assert.equal(root.querySelector('span').textContent, '0');
    assert.equal(root.querySelector('b').textContent, '0');
    app.stores.counter.value = 3;
    assert.equal(root.querySelector('i').textContent, '3');
    assert.equal(root.querySelector('span').textContent, '0');
    assert.equal(root.querySelector('b').textContent, '0');
});

test('public declarations infer named stores and preserve existing state/component/plugin signatures', () => {
    const root = fileURLToPath(new URL('..', import.meta.url));
    execFileSync(fileURLToPath(new URL('../node_modules/.bin/tsc', import.meta.url)), [
        '--noEmit', '--strict', '--target', 'ES2022', '--module', 'ESNext',
        '--moduleResolution', 'bundler',
        'tests/types/stores-providers.ts',
    ], { cwd: root, encoding: 'utf8', stdio: 'pipe' });
});
