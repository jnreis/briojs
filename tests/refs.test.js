import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';
import { assign, createScope, evaluate, evaluateFunction, execute, hydrateNode, hydrateRoot } from 'briojs';

function environment(t, markup, source = '({})', bundle = 'brio.min.js') {
    const dom = new JSDOM(`<main id="app">${markup}</main><aside id="other"></aside><div id="portal"></div>`, {
        runScripts: 'outside-only', url: 'https://brio.test/',
    });
    const { window } = dom;
    window.eval(readFileSync(new URL(`../dist/${bundle}`, import.meta.url), 'utf8'));
    const app = window.brio.createApp(window.eval(source));
    t.after(() => { try { app.dispose(); } finally { window.close(); } });
    return { app, window, root: window.document.querySelector('main') };
}

const capture = '<script b-script>() => { window.refs = $ref; }</script>';

for (const bundle of ['brio.min.js', 'brio.dev.min.js']) {
    test(`${bundle}: static refs expose raw native elements, safe literal keys and read-only names`, t => {
        const { app, root, window } = environment(t, `${capture}
            <input b-ref=" search "><button on-click="$ref.search.focus()"></button>
            <b b-ref="__proto__"></b><i b-ref="constructor"></i><em b-ref="toString"></em>
            <u b-ref="a-b"></u><s b-ref="$data.literal"></s>`, '({})', bundle);
        app.mount(root);
        const refs = window.refs;
        const input = root.querySelector('input');
        assert.equal(Object.getPrototypeOf(refs), null);
        assert.equal(refs.search, input);
        assert.equal(refs.__proto__, root.querySelector('b'));
        assert.equal(refs.constructor, root.querySelector('i'));
        assert.equal(refs.toString, root.querySelector('em'));
        assert.equal(refs['a-b'], root.querySelector('u'));
        assert.equal(refs['$data.literal'], root.querySelector('s'));
        assert.equal(refs.missing, undefined);
        root.querySelector('button').click();
        assert.equal(window.document.activeElement, input);
        assert.equal(input.hasAttribute('b-ref'), false);
        for (const mutate of [
            () => Reflect.set(refs, 'search', input),
            () => Reflect.deleteProperty(refs, 'search'),
            () => Object.defineProperty(refs, 'search', { value: null }),
            () => Object.setPrototypeOf(refs, {}),
            () => Object.preventExtensions(refs),
        ]) assert.throws(mutate, /read-only/);
        assert.equal(Object.getOwnPropertyDescriptor(refs, 'search').writable, false);
        app.unmount();
        assert.deepEqual(Object.keys(refs), []);
        app.mount(root);
        assert.notEqual(window.refs, refs);
        assert.notEqual(window.refs.search, input);
    });
}

test('ref reads, presence and enumeration react to membership, not DOM property mutations', t => {
    const { app, root, window } = environment(t, `${capture}
        <script b-script>() => {
            window.reads = []; window.keys = []; window.has = [];
            brio.effect(() => window.reads.push($ref.field));
            brio.effect(() => window.keys.push(Object.keys($ref).join(',')));
            brio.effect(() => window.has.push('field' in $ref));
        }</script><div id="destination"></div>`);
    app.mount(root);
    assert.deepEqual([...window.reads], [undefined]);
    const handle = app.insert('#destination', 'append', '<input b-ref="field">');
    const field = root.querySelector('input');
    assert.deepEqual([...window.reads], [undefined, field]);
    assert.deepEqual([...window.has], [false, true]);
    assert.deepEqual([...window.keys], ['', 'field']);
    field.value = 'not reactive';
    const unrelated = app.insert('#destination', 'append', '<b b-ref="other"></b>');
    assert.equal(window.reads.length, 2);
    handle.remove();
    assert.deepEqual([...window.reads], [undefined, field, undefined]);
    assert.equal(window.refs.other, root.querySelector('b'));
    unrelated.remove();
    assert.equal(window.keys.at(-1), '');
});

test('root, data and empty-data scopes have local-only refs, including their own boundary element', t => {
    const { app, root, window } = environment(t, `${capture}<b b-ref="outer"></b>
        <section b-data="" b-ref="self">
            <i b-ref="outer"></i>
            <script b-script>() => { window.inner = $ref; }</script>
            <div b-data="{ value: 1 }"><script b-script>() => { window.deep = $ref; }</script></div>
        </section>`);
    app.mount(root);
    assert.equal(window.refs.outer, root.querySelector('b'));
    assert.equal(window.refs.self, undefined);
    assert.equal(window.inner.self, root.querySelector('section'));
    assert.equal(window.inner.outer, root.querySelector('i'));
    assert.equal(window.deep.outer, undefined);
    assert.equal(window.deep.self, undefined);
    const otherRoot = window.document.querySelector('#other');
    otherRoot.innerHTML = '<b b-ref="outer"></b><script b-script>() => { window.other = $ref; }</script>';
    app.mount(otherRoot);
    assert.notEqual(window.refs, window.other);
    assert.equal(window.other.outer, otherRoot.querySelector('b'));
});

test('keyed concrete and wrapperless rows have private registries retained through reorder', t => {
    const { app, root, window } = environment(t, `${capture}
        <template b-for="item in $data.items" b-key="$for.item" b-template>
            <input b-ref="field">
            <script b-script>() => { $data.capture($for.item, $ref); }</script>
            <button on-click="$ref.field.value = String($for.item)"></button>
        </template>`, '({state:()=>({items:[1,2]})})');
    const rows = new Map();
    app.state.capture = (key, refs) => rows.set(key, refs);
    app.mount(root);
    const first = rows.get(1).field;
    assert.equal(window.refs.field, undefined);
    app.state.items.reverse();
    assert.equal(root.querySelectorAll('input')[1], first);
    assert.equal(rows.get(1).field, first);
    root.querySelectorAll('button')[1].click();
    assert.equal(first.value, '1');
    app.state.items.pop();
    assert.equal(rows.get(1).field, undefined);
    app.state.items.push(1);
    assert.notEqual(rows.get(1).field, first);
    const other = app.insert(root, 'append', '<input b-for="n in 2" b-ref="same">');
    assert.equal(root.querySelectorAll('input').length, 4);
    other.remove();
});

test('components get private reactive refs while host and projected refs stay in the caller scope', t => {
    const { app, root, window } = environment(t, `${capture}
        <ref-card b-ref="card"><input b-ref="projected"></ref-card>`, `({
            components: {'ref-card': {
                template: '<input b-ref="field"><template b-template><slot></slot></template>',
                setup({$ref}) {
                    window.privateRefs = $ref;
                    window.atSetup = $ref.field;
                    window.seen = [];
                    brio.effect(() => window.seen.push($ref.field));
                    return {};
                }
            }}
        })`);
    app.mount(root);
    assert.equal(window.refs.card, root.querySelector('ref-card'));
    assert.equal(window.refs.projected, root.querySelectorAll('input')[1]);
    assert.equal(window.refs.field, undefined);
    assert.equal(window.privateRefs.projected, undefined);
    assert.equal(window.privateRefs.card, undefined);
    assert.equal(window.atSetup, undefined);
    assert.deepEqual([...window.seen], [undefined, root.querySelector('input')]);
    app.unmount();
    assert.deepEqual(Object.keys(window.privateRefs), []);
    assert.deepEqual(Object.keys(window.refs), []);
    assert.equal(window.seen.length, 2);
});

test('conditional membership follows destructive lifecycle, hide/detach retain disconnected nodes and teleport ownership', t => {
    for (const mode of ['', '.hide', '.detach']) {
        const { app, root, window } = environment(t, `${capture}
            <input b-if${mode}="$data.visible" b-ref="field" b-teleport="['#portal', 'append']">
            <p b-effect="$data.capture($ref.field)"></p>`, '({state:()=>({visible:true})})');
        const seen = [];
        app.state.capture = element => seen.push(element);
        app.mount(root);
        const field = window.refs.field;
        assert.equal(field.parentElement.id, 'portal');
        app.state.visible = false;
        assert.equal(window.refs.field, mode ? field : undefined);
        assert.equal(field.isConnected, mode === '.hide');
        assert.equal(seen.at(-1), mode ? field : undefined);
        app.state.visible = true;
        assert.equal(window.refs.field === field, Boolean(mode));
        app.unmount();
        assert.equal(window.refs.field, undefined);
    }
});

test('duplicate/invalid refs fail explicitly; ignored and raw HTML stay unregistered', t => {
    for (const markup of [
        '<b b-ref="x"></b><i b-ref="x"></i>',
        '<b b-ref=""></b>',         '<b b-ref="   "></b>', '<b b-ref.foo="x"></b>', '<b b-ref-name="x"></b>',
        '<template b-ref="x"></template>', '<div b-template b-ref="x"></div>',
        '<b b-if.hide="true" b-ref="x"></b><i b-else b-ref="x"></i>',
        '<b b-if.detach="false" b-ref="x"></b><i b-else b-ref="x"></i>',
    ]) {
        const { app, root } = environment(t, markup);
        const original = root.innerHTML;
        assert.throws(() => app.mount(root), /b-ref/);
        assert.equal(root.innerHTML, original);
    }
    const { app, window } = environment(t, `${capture}
        <section b-ignore b-ref=""><b b-ref="ignored"></b></section>
        <div b-html.raw="'&lt;b b-ref=&quot;raw&quot;&gt;&lt;/b&gt;'"></div>`);
    app.mount('#app');
    assert.deepEqual(Object.keys(window.refs), []);
});

test('HTML replacement and managed insertion unregister exactly their own refs and recover from duplicates', t => {
    const { app, root, window } = environment(t, `${capture}
        <div id="target"></div><section b-html="$data.html"></section>`,
    '({state:()=>({html:\'<b b-ref="html"></b>\'})})');
    app.mount(root);
    const old = window.refs.html;
    app.state.html = '<i b-ref="html"></i>';
    assert.notEqual(window.refs.html, old);
    assert.equal(window.refs.html, root.querySelector('i'));
    const inserted = app.insert('#target', 'append', '<input b-ref="field">');
    const field = window.refs.field;
    assert.throws(() => app.insert('#target', 'append', '<b b-ref="field"></b>'), /Duplicate/);
    assert.equal(window.refs.field, field);
    inserted.remove();
    assert.equal(window.refs.field, undefined);
    const nested = app.insert('#target', 'append', '<div b-data="{}"><b b-ref="html"></b></div>');
    assert.equal(window.refs.html, root.querySelector('i'));
    nested.remove();
});

test('throwing registration/removal subscribers surface errors without stale ref ownership', t => {
    const { app, root, window } = environment(t, `${capture}<div id="target"></div>`);
    app.mount(root);
    const stop = window.brio.effect(() => {
        if (window.refs.field) throw new Error('registration subscriber failed');
    });
    assert.throws(() => app.insert('#target', 'append', '<input b-ref="field">'), /reactive effects failed/);
    assert.equal(window.refs.field, undefined);
    assert.equal(root.querySelector('#target').childNodes.length, 0);
    stop();
    const handle = app.insert('#target', 'append', '<input b-ref="field">');
    const stopRemoval = window.brio.effect(() => {
        if (!window.refs.field) throw new Error('removal subscriber failed');
    });
    assert.throws(() => handle.remove(), /cleanups failed/);
    assert.equal(window.refs.field, undefined);
    assert.equal(root.querySelector('#target').childNodes.length, 0);
    stopRemoval();
});

test('all strict expression forms expose $ref and bindings cannot be reassigned', () => {
    const target = { value: 'before' };
    const context = { $ref: { field: target } };
    assert.equal(evaluate('$ref.field', context), target);
    execute('$ref.field.value = "event"', context);
    assert.equal(target.value, 'event');
    assign('$ref.field.value', context, 'model');
    assert.equal(target.value, 'model');
    assert.equal(evaluateFunction('($context) => $ref === $context.$ref', context)(context), true);
    assert.throws(() => execute('$ref = {}', context), /event expression failed/);
});

test('public low-level hydration initializes refs when no registry is supplied', () => {
    const dom = new JSDOM('<main><input b-ref="field"><script b-script>() => {$data.capture($ref)}</script></main>');
    const previous = new Map(['Node', 'Element'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
    const scope = createScope();
    let refs;
    try {
        for (const key of previous.keys()) globalThis[key] = dom.window[key];
        const root = dom.window.document.querySelector('main');
        scope.run(() => hydrateRoot(root, { $data: { capture: value => { refs = value; } } },
            { app: {}, state: {}, components: new Map() }));
        assert.equal(refs.field, root.querySelector('input'));
        scope.dispose();
        assert.equal(refs.field, undefined);
        const other = dom.window.document.createElement('input');
        other.setAttribute('b-ref', 'direct');
        const context = { $data: {} };
        const nodeScope = createScope();
        try {
            nodeScope.run(() => hydrateNode(other, context, { app: {}, state: {}, components: new Map() }));
            assert.equal(other.hasAttribute('b-ref'), false);
            assert.equal(context.$ref, undefined);
        } finally {
            nodeScope.dispose();
        }
    } finally {
        scope.dispose();
        for (const [key, descriptor] of previous) {
            if (descriptor) Object.defineProperty(globalThis, key, descriptor);
            else delete globalThis[key];
        }
        dom.window.close();
    }
});

test('cloned projected refs keep caller scope through component template conditions', t => {
    const { app, root, window } = environment(t, `${capture}
        <slot-card><input b-ref="slot"></slot-card>`, `({
            state:()=>({show:true}),
            components: {'slot-card': {
                template:'<template b-if="$data.$parent.show" b-template><slot></slot></template>',
                setup({$ref}) { window.privateRefs=$ref; return {}; }
            }}
        })`);
    app.mount(root);
    const first = window.refs.slot;
    assert.equal(first, root.querySelector('input'));
    assert.equal(window.privateRefs.slot, undefined);
    app.state.show = false;
    assert.equal(window.refs.slot, undefined);
    app.state.show = true;
    assert.notEqual(window.refs.slot, first);
    assert.equal(window.privateRefs.slot, undefined);
});

test('duplicated projected refs throw in the author registry without leaving stale registrations', t => {
    const { app, root, window } = environment(t, `${capture}
        <slot-card><input b-ref="slot"></slot-card>`, `({
            components: {'slot-card': {
                template:'<template b-for="n in 2" b-template><slot></slot></template>'
            }}
        })`);
    assert.throws(() => app.mount(root), /Duplicate b-ref/);
    assert.deepEqual(Object.keys(window.refs), []);
});

test('direct effect subscribers in the same element are not rerun inside a disposing scope', t => {
    const { app, root, window } = environment(t, `${capture}<div id="target"></div>`);
    app.mount(root);
    let runs = 0;
    app.state.record = () => runs++;
    const inserted = app.insert('#target', 'append', '<input b-ref="self" b-effect="$data.record($ref.self)">');
    assert.equal(runs, 1);
    inserted.remove();
    assert.equal(runs, 1);
    assert.equal(window.refs.self, undefined);
    assert.equal(root.querySelector('#target').childNodes.length, 0);
});

test('refs remain during leave/reversal and unregister after completed transitions', t => {
    const { app, root, window } = environment(t, `${capture}
        <input b-if="$data.visible" b-ref="field" b-transition="'fade'"
               style="transition-property:opacity;transition-duration:1s;transition-delay:0s">`,
    '({state:()=>({visible:true})})');
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
    const field = window.refs.field;
    app.state.visible = false;
    advance();
    assert.equal(window.refs.field, field);
    const stale = [...timers.values()][0];
    app.state.visible = true;
    stale();
    assert.equal(window.refs.field, field);
    app.state.visible = false;
    advance();
    [...timers.values()].forEach(callback => callback());
    assert.equal(window.refs.field, undefined);
    assert.equal(field.isConnected, false);
});

test('separate data scopes allow repeated names in preservation branches and apps remain isolated', t => {
    const { app, root, window } = environment(t, `${capture}
        <input b-if.detach="false" b-data="" b-ref="field">
        <input b-else b-data="" b-ref="field">`);
    app.mount(root);
    assert.equal(window.refs.field, undefined);
    const other = window.brio.createApp();
    t.after(() => other.dispose());
    const target = window.document.querySelector('#other');
    target.innerHTML = '<input b-ref="field"><script b-script>()=>{window.otherRefs=$ref}</script>';
    other.mount(target);
    assert.equal(window.otherRefs.field, target.querySelector('input'));
    app.unmount();
    assert.equal(window.otherRefs.field, target.querySelector('input'));
});

test('router-created components receive private refs and setup effects see later hydration', t => {
    const { app, root, window } = environment(t, `${capture}<div b-ref="outlet" b-router-outlet></div>`);
    window.eval(readFileSync(new URL('../dist/brio.router.min.js', import.meta.url), 'utf8'));
    const routed = window.eval(`brio.createApp({
        router: brio.createRouter([{path:"/",component:"home-page"}]),
        components: {"home-page": {
            template: '<input b-ref="field">',
            setup({$ref}) {
                window.routeRefs = $ref;
                window.routeSeen = [];
                brio.effect(() => window.routeSeen.push($ref.field));
                return {};
            }
        }}
    })`);
    t.after(() => routed.dispose());
    routed.mount(root);
    assert.equal(window.refs.outlet, root.querySelector('[b-router-outlet]') ?? root.querySelector('div'));
    assert.equal(window.refs.field, undefined);
    assert.equal(window.routeRefs.field, root.querySelector('input'));
    assert.deepEqual([...window.routeSeen], [undefined, root.querySelector('input')]);
    routed.unmount();
    assert.equal(window.routeRefs.field, undefined);
    assert.equal(window.routeSeen.length, 2);
    app.dispose();
});

test('manual ref page demonstrates native focus, isolation, conditional membership and row retention', t => {
    const markup = readFileSync(new URL('./directives/ref.html', import.meta.url), 'utf8');
    const dom = new JSDOM(markup, { runScripts: 'outside-only' });
    const { window } = dom;
    t.after(() => { try { window.dispatchEvent(new window.Event('pagehide')); } finally { window.close(); } });
    window.eval(readFileSync(new URL('../dist/brio.min.js', import.meta.url), 'utf8'));
    window.eval([...window.document.querySelectorAll('script')].at(-1).textContent);
    window.dispatchEvent(new window.Event('DOMContentLoaded'));
    const document = window.document;
    const click = id => document.getElementById(id).click();
    click('focus');
    assert.equal(document.activeElement.id, 'search');
    click('local-focus');
    assert.equal(document.activeElement.id, 'local-search');
    assert.equal(document.getElementById('private').textContent, 'false');
    assert.equal(document.getElementById('component-private').textContent, 'false');
    assert.equal(document.getElementById('host-registered').textContent, 'true');
    click('component-focus');
    assert.equal(document.activeElement.id, 'component-input');
    const row = document.querySelector('#rows input');
    row.value = 'kept';
    click('reverse');
    assert.equal(document.querySelectorAll('#rows input')[1], row);
    document.querySelectorAll('.row-focus')[1].click();
    assert.equal(document.activeElement, row);
    click('toggle-conditional');
    assert.equal(document.getElementById('membership').textContent, 'false');
    assert.equal(document.getElementById('names').textContent.includes('conditional'), false);
    const remote = document.getElementById('remote');
    click('toggle-remote');
    assert.equal(remote.isConnected, false);
    assert.equal(document.getElementById('remote-registered').textContent, 'true');
    click('toggle-remote');
    assert.equal(document.getElementById('remote'), remote);
    const index = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
    assert.ok(index.includes('/tests/directives/ref.html'));
});
