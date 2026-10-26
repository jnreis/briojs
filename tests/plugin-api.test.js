import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';

const addonSource = name => readFileSync(new URL(`../dist/brio.${name}.min.js`, import.meta.url), 'utf8');

function environment(t, bundle, markup, state = {}, addons = []) {
    const dom = new JSDOM(`<main>${markup}</main>`, {
        runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://brio.test/',
    });
    const { window } = dom;
    const warnings = [];
    window.console.warn = (...args) => warnings.push(String(args[0]));
    window.eval(readFileSync(new URL(`../dist/${bundle}`, import.meta.url), 'utf8'));
    for (const name of addons) window.eval(addonSource(name));
    const app = window.brio.createApp({ state: () => window.eval(`(${JSON.stringify(state)})`) });
    t.after(() => { try { app.dispose(); } finally { window.close(); } });
    return { window, brio: window.brio, app, root: window.document.querySelector('main'), warnings };
}

for (const bundle of ['brio.min.js', 'brio.dev.min.js']) {
    test(`${bundle}: hooks run in phase order around the element's children`, t => {
        const { app, root } = environment(t, bundle, '<div b-trace="1"><span b-trace-child=""></span></div>');
        const log = [];
        app.directive({
            name: 'b-trace',
            scope: el => { log.push(`scope ${el.localName}`); },
            mount: el => { log.push(`mount ${el.localName}`); },
            ready: el => { log.push(`ready ${el.localName}`); },
        });
        app.directive({ name: 'b-trace-child', mount: el => { log.push(`mount ${el.localName}`); } });
        app.mount(root);
        assert.deepEqual(log, ['scope div', 'mount div', 'mount span', 'ready div']);
        assert.equal(root.querySelector('div').hasAttribute('b-trace'), false);
    });

    test(`${bundle}: scope hooks add reactive names for siblings and descendants`, t => {
        const { app, root, brio, window } = environment(t, bundle,
            '<section b-counter="" b-text="$counter.count"></section><p b-counter=""><button b-on-click="$counter.count++" b-text="$counter.count"></button></p>');
        app.directive({ name: 'b-counter', value: 'none', scope: () => ({ $counter: brio.state(window.eval('({ count: 7 })')) }) });
        app.mount(root);
        assert.equal(root.querySelector('section').textContent, '7');
        const button = root.querySelector('button');
        button.click();
        brio.flush();
        assert.equal(button.textContent, '8');
    });

    test(`${bundle}: bindings evaluate, run, assign, and track the attribute value`, t => {
        const { app, root, brio } = environment(t, bundle,
            '<output b-show-value="$data.n * 2"></output><button b-tap="$data.n += $step"></button><input b-reset-to="$data.n">',
            { n: 1 });
        app.directive({
            name: 'b-show-value',
            mount: (el, binding) => binding.effect(() => { el.textContent = String(binding.value()); }),
        });
        app.directive({
            name: 'b-tap',
            value: 'statement',
            mount: (el, binding) => binding.on(el, 'click', () => binding.run({ $step: 10 })),
        });
        app.directive({ name: 'b-reset-to', mount: (_el, binding) => { binding.assign(0); } });
        app.mount(root);
        assert.equal(app.state.n, 0);
        root.querySelector('button').click();
        brio.flush();
        assert.equal(app.state.n, 10);
        assert.equal(root.querySelector('output').textContent, '20');
    });

    test(`${bundle}: args, modifiers, and text values reach the binding`, t => {
        const { app, root } = environment(t, bundle, '<p b-tip-top.fast.delay="Hello"></p><p b-tip="Hi"></p>');
        const seen = [];
        app.directive({
            name: 'b-tip',
            arg: true,
            value: 'text',
            modifiers: ['fast', 'delay'],
            mount: (_el, binding) => {
                seen.push([binding.directive, binding.name, binding.arg, Object.keys(binding.modifiers), binding.value()]);
            },
        });
        app.mount(root);
        assert.deepEqual(seen, [
            ['b-tip', 'b-tip-top.fast.delay', 'top', ['fast', 'delay'], 'Hello'],
            ['b-tip', 'b-tip', undefined, [], 'Hi'],
        ]);
    });

    test(`${bundle}: unsupported modifiers and unexpected values fail with the attribute name`, t => {
        const { app, root, window } = environment(t, bundle, '<p b-tip.slow="x"></p>');
        app.directive({ name: 'b-tip', modifiers: ['fast'], mount() {} });
        assert.throws(() => app.mount(root), /b-tip\.slow does not support the "slow" modifier\. Supported: fast/);
        root.innerHTML = '<p b-plain="value"></p>';
        const other = window.brio.createApp();
        t.after(() => other.dispose());
        other.directive({ name: 'b-plain', value: 'none', mount() {} });
        assert.throws(() => other.mount(root), /b-plain does not take a value/);
    });

    test(`${bundle}: children: false keeps Brio out of the subtree`, t => {
        const { app, root } = environment(t, bundle, '<div b-own=""><span b-text="1 + 1">raw</span></div>');
        app.directive({ name: 'b-own', children: false, mount() {} });
        app.mount(root);
        assert.equal(root.querySelector('span').textContent, 'raw');
    });

    test(`${bundle}: cleanups run when b-if removes the element and on unmount`, t => {
        const { app, root, brio } = environment(t, bundle, '<template b-if="$data.on"><i b-life=""></i></template><b b-life=""></b>', { on: true });
        const log = [];
        app.directive({
            name: 'b-life',
            mount(el, binding) {
                binding.onCleanup(() => log.push(`binding ${el.localName}`));
                binding.on(el, 'click', () => log.push(`click ${el.localName}`));
                return () => log.push(`returned ${el.localName}`);
            },
        });
        const handle = app.mount(root);
        const italic = root.querySelector('i');
        app.state.on = false;
        brio.flush();
        italic.click();
        assert.deepEqual(log.sort(), ['binding i', 'returned i']);
        handle.unmount();
        assert.deepEqual(log.sort(), ['binding b', 'binding i', 'returned b', 'returned i']);
    });

    test(`${bundle}: hook failures name the attribute; non-cleanup returns are rejected`, t => {
        const { app, root } = environment(t, bundle, '<p b-broken=""></p>');
        app.directive({ name: 'b-broken', mount() { throw new Error('boom'); } });
        assert.throws(() => app.mount(root), error => /b-broken/.test(error.message) && error.cause?.message === 'boom');
        const second = environment(t, bundle, '<p b-async=""></p>');
        second.app.directive({ name: 'b-async', async mount() {} });
        assert.throws(() => second.app.mount(second.root), /b-async mount and ready hooks may only return a cleanup function/);
    });

    test(`${bundle}: plugin directives are rejected on component hosts and fragments`, t => {
        const { app, root } = environment(t, bundle, '<x-card b-tip=""></x-card>');
        app.component('x-card', { template: '<p>card</p>' });
        app.directive({ name: 'b-tip', mount() {} });
        assert.throws(() => app.mount(root), /b-tip cannot be used on a component host/);
        const second = environment(t, bundle, '<template b-if="true" b-tip=""><p></p></template>');
        second.app.directive({ name: 'b-tip', mount() {} });
        assert.throws(() => second.app.mount(second.root), /b-tip/);
    });

    test(`${bundle}: registration validates names, built-ins, and conflicts`, t => {
        const { app } = environment(t, bundle, '');
        assert.throws(() => app.directive({ name: 'tooltip', mount() {} }), /must be "b-" followed by lowercase kebab-case/);
        assert.throws(() => app.directive({ name: 'b-Tip', mount() {} }), /kebab-case/);
        for (const name of ['b-text', 'b-mask', 'b-on-hover', 'b-bind-title', 'b-router-link', 'b-ref', 'b-on-enter'])
            assert.throws(() => app.directive({ name, mount() {} }), /reserved by (a built-in Brio directive|the official Brio \w+ add-on)/, name);
        assert.throws(() => app.directive({ name: 'b-else', arg: true, mount() {} }), /reserved/);
        assert.throws(() => app.directive({ name: 'b-tip' }), /needs a scope, mount, or ready function/);
        app.directive({ name: 'b-tip', arg: true, mount() {} });
        assert.throws(() => app.directive({ name: 'b-tip', mount() {} }), /"b-tip" from the app conflicts with "b-tip" from the app/);
        assert.throws(() => app.directive({ name: 'b-tip-top', mount() {} }), /conflicts with "b-tip"/);
        app.directive({ name: 'b-tipsy', mount() {} });
        app.directive({ name: 'b-drag-x', mount() {} });
        assert.throws(() => app.use({ name: 'drag', directives: [{ name: 'b-drag', arg: true, mount() {} }] }),
            /"b-drag" from plugin "drag" conflicts with "b-drag-x" from the app/);
    });

    test(`${bundle}: helpers join every expression and validate their names`, t => {
        const { app, root } = environment(t, bundle, '<p b-text="$money(2)"></p><template b-for="n in [1]"><i b-text="$money($for.n)"></i></template>');
        app.helper('$money', value => `$${value.toFixed(2)}`);
        assert.throws(() => app.helper('money', () => {}), /must start with "\$"/);
        assert.throws(() => app.helper('$data', () => {}), /already defined by Brio/);
        assert.throws(() => app.helper('$money', () => {}), /"\$money" is already defined\./);
        app.mount(root);
        assert.equal(root.querySelector('p').textContent, '$2.00');
        assert.equal(root.querySelector('i').textContent, '$1.00');
        assert.throws(() => app.helper('$late', 1), /before the app mounts/);
        assert.throws(() => app.directive({ name: 'b-late', mount() {} }), /before the app mounts/);
    });

    test(`${bundle}: misspelled $names still throw a ReferenceError`, t => {
        const { app, root } = environment(t, bundle, '<p b-text="$mony(2)"></p>');
        app.helper('$money', String);
        assert.throws(() => app.mount(root), /\$mony is not defined/);
    });

    test(`${bundle}: object plugins install everything or nothing`, t => {
        const { app, root, brio } = environment(t, bundle, '<x-badge></x-badge><p b-badge="" b-text="$badge"></p>');
        const broken = {
            name: 'broken',
            directives: [{ name: 'b-badge', mount() {} }],
            helpers: { $badge: 'nope' },
            components: { 'x-badge': { template: '<b>broken</b>' } },
            setup() { throw new Error('setup failed'); },
        };
        assert.throws(() => app.use(broken), /setup failed/);
        const log = [];
        const plugin = brio.definePlugin({
            name: 'badge',
            directives: [brio.defineDirective({ name: 'b-badge', mount: el => el.classList.add('badge') })],
            helpers: { $badge: 'ok' },
            components: { 'x-badge': { template: '<b>badge</b>' } },
            setup: installed => log.push(installed === app ? 'setup' : 'wrong app'),
            onMount: mounted => {
                log.push(`mount ${mounted.localName}`);
                return () => log.push('unmount');
            },
        });
        app.use(plugin);
        app.use(plugin);
        assert.throws(() => app.use({ ...plugin }), /A different Brio plugin named "badge" is already installed/);
        assert.throws(() => app.use({ directives: [] }), /needs a name/);
        assert.throws(() => app.use(42), /must be a function or a plugin object/);
        const handle = app.mount(root);
        assert.equal(root.querySelector('x-badge').textContent, 'badge');
        assert.equal(root.querySelector('p').className, 'badge');
        assert.equal(root.querySelector('p').textContent, 'ok');
        handle.unmount();
        assert.deepEqual(log, ['setup', 'mount main', 'unmount']);
    });

    test(`${bundle}: function plugins keep working and can register directives`, t => {
        const { app, root } = environment(t, bundle, '<p b-hello=""></p>');
        app.use(instance => instance.directive({ name: 'b-hello', mount: el => { el.textContent = 'hi'; } }));
        app.mount(root);
        assert.equal(root.textContent, 'hi');
    });

    test(`${bundle}: .options configures observers before or after their attribute`, async t => {
        const markup = `<p id="watched"></p>
            <i b-on-attrs.options="{ target: '#watched' }" b-on-attrs="$data.before++"></i>
            <i b-on-attrs="$data.after++" b-on-attrs.options="$data.watchOptions"></i>`;
        const { app, root, window } = environment(t, bundle, markup,
            { before: 0, after: 0, watchOptions: { target: '#watched' } }, ['observers']);
        app.mount(root);
        assert.equal(root.querySelector('i').attributes.length, 0);
        window.document.querySelector('#watched').title = 'changed';
        await new Promise(resolve => setTimeout(resolve, 0));
        assert.deepEqual([app.state.before, app.state.after], [1, 1]);
    });

    test(`${bundle}: .options errors explain what is wrong`, t => {
        for (const [markup, pattern] of [
            [`<i b-on-attrs.options="null" b-on-attrs="1"></i>`, /b-on-attrs\.options must evaluate to an object/],
            [`<i b-on-enter.options="{ rootmargin: '1px' }" b-on-enter="1"></i>`, /b-on-enter\.options has an unknown option "rootmargin"\. Supported: root, rootMargin, threshold, once, debounce\./],
            [`<i b-on-enter.options="{}"></i>`, /b-on-enter\.options needs a b-on-enter attribute on the same element/],
            [`<i b-on-enter.once.options="{}" b-on-enter="1"></i>`, /\.options cannot be combined with other modifiers/],
            [`<i b-text.options="{}" b-text="1"></i>`, /b-text does not take options/],
            [`<button b-on-click.options="{ debounce: -1 }" b-on-click="1"></button>`, /b-on-click\.options debounce must be a boolean or non-negative milliseconds/],
            [`<button b-on-click.options="{ prevent: 1 }" b-on-click="1"></button>`, /b-on-click\.options prevent must be a boolean/],
            [`<button b-on-click.options="{ delay: 1 }" b-on-click="1"></button>`, /b-on-click\.options has an unknown option "delay"/],
            [`<i b-options="{}" b-on-enter="1"></i>`, /b-options was removed in Brio 5\. Configure each observer with b-on-enter\.options/],
        ]) {
            const { app, root } = environment(t, bundle, markup, {}, ['observers']);
            assert.throws(() => app.mount(root), pattern, markup);
        }
    });

    test(`${bundle}: event .options set debounce and throttle delays and override modifiers`, async t => {
        const markup = `<input b-on-input.debounce="$data.typed++" b-on-input.options="{ debounce: 20 }">
            <button b-on-click.prevent="$data.clicks++" b-on-click.options="{ throttle: 30, prevent: false }"></button>`;
        const { app, root, window } = environment(t, bundle, markup, { typed: 0, clicks: 0 });
        app.mount(root);
        const input = root.querySelector('input');
        input.dispatchEvent(new window.Event('input'));
        input.dispatchEvent(new window.Event('input'));
        await new Promise(resolve => setTimeout(resolve, 5));
        assert.equal(app.state.typed, 0);
        await new Promise(resolve => setTimeout(resolve, 40));
        assert.equal(app.state.typed, 1);
        const button = root.querySelector('button');
        const first = new window.MouseEvent('click', { cancelable: true });
        button.dispatchEvent(first);
        button.dispatchEvent(new window.MouseEvent('click'));
        assert.equal(app.state.clicks, 1);
        assert.equal(first.defaultPrevented, false);
        await new Promise(resolve => setTimeout(resolve, 50));
        button.dispatchEvent(new window.MouseEvent('click'));
        assert.equal(app.state.clicks, 2);
    });

    test(`${bundle}: component host events accept .options`, t => {
        const { app, root, window } = environment(t, bundle,
            `<x-card b-on-pinged.options="{ once: true }" b-on-pinged="$data.pings++"></x-card>`, { pings: 0 });
        app.component('x-card', { template: '<p>card</p>' });
        app.mount(root);
        const host = root.querySelector('x-card');
        host.dispatchEvent(new window.CustomEvent('pinged'));
        host.dispatchEvent(new window.CustomEvent('pinged'));
        assert.equal(app.state.pings, 1);
        const orphan = environment(t, bundle, `<x-card b-on-pinged.options="{}"></x-card>`);
        orphan.app.component('x-card', { template: '<p>card</p>' });
        assert.throws(() => orphan.app.mount(orphan.root), /b-on-pinged\.options needs a b-on-pinged attribute/);
    });

    test(`${bundle}: plugin directives read declared .options from binding.options`, t => {
        const { app, root } = environment(t, bundle,
            `<p b-tip.options="{ delay: 300 }" b-tip=""></p><p b-tip=""></p><p b-plain.options="{}" b-plain=""></p>`);
        const seen = [];
        app.directive({ name: 'b-tip', options: ['delay'], mount: (el, binding) => { seen.push({ ...binding.options }); } });
        app.directive({ name: 'b-plain', mount: () => {} });
        assert.throws(() => app.directive({ name: 'b-bad', modifiers: ['options'], mount() {} }), /options/);
        assert.throws(() => app.mount(root), /b-plain does not take options/);
        assert.deepEqual(seen, [{ delay: 300 }, {}]);
    });

    test(`${bundle}: attributes without the b- prefix are left alone`, t => {
        const markup = `<button on-click="$data.n++" bind-title="'x'" text="'t'" html="'h'" model="$data.n"
            mask="'##'" teleport="['body', 'append']" transition="'fade'" effect="$data.n++">keep</button>
            <p on-enter="$data.n++" on-resize="$data.n++"></p>`;
        const { app, root } = environment(t, bundle, markup, { n: 0 }, ['inputs', 'observers']);
        app.mount(root);
        const button = root.querySelector('button');
        button.click();
        assert.equal(app.state.n, 0);
        assert.equal(button.textContent, 'keep');
        assert.equal(button.parentElement, root);
        for (const name of ['on-click', 'bind-title', 'text', 'html', 'model', 'mask', 'teleport', 'transition', 'effect'])
            assert.equal(button.getAttribute(name) !== null, true, name);
        assert.equal(button.hasAttribute('title'), false);
        assert.equal(root.querySelector('p').hasAttribute('on-enter'), true);
    });
}

test('brio.dev.min.js: unknown b-* attributes warn once in development', t => {
    const { app, root, warnings } = environment(t, 'brio.dev.min.js',
        '<p b-tooltip="x"></p><p b-tooltip="y"></p><p b-txt="1"></p><p b-key="1" b-text="1"></p>');
    app.mount(root);
    assert.equal(warnings.length, 2);
    assert.match(warnings[0], /unknown directive "b-tooltip" on <p>.*install the plugin/);
    assert.match(warnings[1], /"b-txt"/);
});

test('brio.min.js: unknown b-* attributes are silent in production', t => {
    const { app, root, warnings } = environment(t, 'brio.min.js', '<p b-tooltip="x"></p>');
    app.mount(root);
    assert.deepEqual(warnings, []);
});

for (const bundle of ['brio.min.js', 'brio.dev.min.js']) {
    test(`${bundle}: directives moved to add-ons explain which script or plugin to load`, t => {
        for (const [markup, pattern] of [
            [`<input b-mask="'##'">`, /^Error: b-mask needs the Brio inputs add-on\. Load brio\.inputs\.min\.js after brio\.min\.js, or call app\.use\(inputsPlugin\) with inputsPlugin from @jnreis\/briojs\/inputs\./],
            ['<form b-form="{}"></form>', /^Error: b-form needs the Brio inputs add-on/],
            ['<p b-on-enter="1"></p>', /^Error: b-on-enter needs the Brio observers add-on\. Load brio\.observers\.min\.js .*observersPlugin from @jnreis\/briojs\/observers\./],
            ['<p b-on-text.subtree="1"></p>', /^Error: b-on-text\.subtree needs the Brio observers add-on/],
            ['<main b-router-outlet></main>', /^Error: b-router-outlet requires a router on the Brio app\./],
        ]) {
            const { app, root } = environment(t, bundle, markup);
            assert.throws(() => app.mount(root), pattern, markup);
        }
    });

    test(`${bundle}: add-on scripts attach to every app created after they load`, t => {
        const { window, brio } = environment(t, bundle, '', {}, ['inputs', 'observers']);
        // Loading a script twice replaces its global plugin instead of breaking later apps.
        window.eval(addonSource('inputs'));
        const apps = [];
        t.after(() => apps.forEach(app => app.dispose()));
        const markup = `<section><input b-mask="'##-##'"><p b-on-attrs="1"></p></section>`;
        for (const id of ['one', 'two']) {
            window.document.body.insertAdjacentHTML('beforeend', `<div id="${id}">${markup}</div>`);
            const app = brio.createApp();
            apps.push(app);
            assert.doesNotThrow(() => app.mount(`#${id}`));
            const input = window.document.querySelector(`#${id} input`);
            input.value = '1234';
            input.dispatchEvent(new window.Event('input', { bubbles: true }));
            assert.equal(input.value, '12-34');
        }
        assert.equal(brio.use(brio.inputsPlugin), brio);
        assert.throws(() => brio.use(1), /must be a function or a plugin object/);
    });

    test(`${bundle}: official add-on names are reserved for their plugins`, t => {
        const { app, brio } = environment(t, bundle, '', {}, ['inputs']);
        for (const name of ['b-mask', 'b-form', 'b-on-enter', 'b-on-attrs', 'b-router-outlet'])
            assert.throws(() => app.directive({ name, mount() {} }), /reserved by the official Brio \w+ add-on/, name);
        assert.throws(() => app.use({ name: 'masks', directives: [{ name: 'b-mask', mount() {} }] }),
            /reserved by the official Brio inputs add-on/);
        assert.deepEqual([...brio.inputsPlugin.directives].map(directive => directive.name), ['b-mask', 'b-form']);
    });

    test(`${bundle}: use() installs a plugin object once and rejects a different plugin with the same name`, t => {
        const { app, brio } = environment(t, bundle, '');
        let setups = 0;
        const plugin = { name: 'counter', setup() { setups++; } };
        assert.equal(app.use(plugin).use(plugin), app);
        assert.equal(setups, 1);
        assert.throws(() => app.use({ name: 'counter' }), /different Brio plugin named "counter"/);
        const other = brio.createApp({ plugins: [plugin] });
        t.after(() => other.dispose());
        other.use(plugin);
        assert.equal(setups, 2);
    });

    test(`${bundle}: binding.hydrate brings inserted content into the directive's scope`, t => {
        const { app, root } = environment(t, bundle, '<div b-custom-content="1"></div>', { label: 'one' });
        app.directive({
            name: 'b-custom-content', children: false,
            mount(element, binding) {
                element.innerHTML = '<b b-text="$data.label"></b>';
                binding.hydrate(element.firstChild);
            },
        });
        const mounted = app.mount(root);
        assert.equal(root.querySelector('b').textContent, 'one');
        app.state.label = 'two';
        assert.equal(root.querySelector('b').textContent, 'two');
        mounted.unmount();
        app.state.label = 'three';
        assert.notEqual(root.querySelector('b')?.textContent, 'three');
    });

    test(`${bundle}: errors thrown by add-on directives keep their own message`, t => {
        const { app, root } = environment(t, bundle, '<input b-mask="null">', {}, ['inputs']);
        assert.throws(() => app.mount(root), error => !/^Brio directive failed/.test(error.message) && /b-mask/.test(error.message));
    });

    test(`${bundle}: a router on the app provides b-router-outlet`, t => {
        const { window, brio } = environment(t, bundle, '', {}, ['router']);
        window.document.body.innerHTML = '<main b-router-outlet></main>';
        const router = brio.createRouter(window.eval('[{ path: "/", component: "home-page" }]'));
        assert.equal(router.plugin.name, 'brio-router');
        const app = brio.createApp({ router, components: { 'home-page': { template: '<b>home</b>' } } });
        try {
            app.mount('main');
            assert.equal(window.document.querySelector('main').textContent, 'home');
        } finally {
            app.dispose();
        }
    });
}
