import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';
import { evaluateFunction, hydrateRoot, hydrateNode } from 'briojs';

const bundle = readFileSync(new URL('../dist/brio.min.js', import.meta.url), 'utf8');

test('manual model page shows default strings versus explicit numeric conversion', t => {
    const markup = readFileSync(new URL('./directives/model.html', import.meta.url), 'utf8');
    const dom = new JSDOM(markup, { runScripts: 'outside-only' });
    const { window } = dom;
    window.eval(bundle);
    const app = window.brio.createApp();
    t.after(() => { try { app.dispose(); } finally { window.close(); } });
    app.mount('body');
    const { document } = window;
    const enter = (id, value) => {
        const input = document.getElementById(id);
        input.value = value;
        input.dispatchEvent(new window.Event('input', { bubbles: true }));
    };
    assert.equal(document.querySelector('[b-model\\.raw]'), null);
    for (const value of ['0042', 'true', 'null', '  spaces  ', '${$data.defaultNumber}', '']) {
        enter('default-model', value);
        assert.equal(document.getElementById('default-model').value, value);
        assert.equal(document.getElementById('default-model-value').textContent, JSON.stringify(value));
        assert.equal(document.getElementById('default-model-type').textContent, 'string');
    }
    enter('number-model', '0042');
    assert.equal(document.getElementById('number-model-value').textContent, '42');
    assert.equal(document.getElementById('number-model-type').textContent, 'number');
    enter('number-model', 'not numeric');
    assert.equal(document.getElementById('number-model-type').textContent, 'string');
});

test('b-text hydrates referenced text and authored strings without parsing HTML; raw skips interpolation', t => {
    const { app, root } = environment(t, `
        <p id="text" b-text="$data.text"></p>
        <p id="raw" b-text.raw="$data.text"></p>
        <p id="direct" b-text="'Count: \${$data.count}'"></p>
        <p id="expression" b-text="'Count: ' + $data.count"></p>
        <p id="raw-expression" b-text.raw="'Count: ' + $data.count"></p>`,
    { text: '<b>Count: ${$data.count}</b>', count: 1 });
    app.mount(root);
    assert.equal(root.querySelector('#text').textContent, '<b>Count: 1</b>');
    assert.equal(root.querySelector('#text').children.length, 0);
    assert.equal(root.querySelector('#raw').textContent, '<b>Count: ${$data.count}</b>');
    app.state.count = 2;
    for (const id of ['direct', 'expression', 'raw-expression'])
        assert.equal(root.querySelector(`#${id}`).textContent, 'Count: 2');
    assert.equal(root.querySelector('#text').textContent, '<b>Count: 2</b>');
    app.state.text = 'Other: ${$data.other}';
    app.state.other = 7;
    assert.equal(root.querySelector('#text').textContent, 'Other: 7');
    app.state.text = '${$data.missing}';
    assert.equal(root.querySelector('#text').textContent, '');
    app.state.text = null;
    assert.equal(root.querySelector('#raw').textContent, '');
    app.state.text = '${$data.count}';
    const oldText = root.querySelector('#text');
    app.unmount();
    app.state.count = 3;
    assert.equal(oldText.textContent, '2');
});

test('b-html.raw parses HTML without directives/interpolation while its source remains reactive', t => {
    const { app, root } = environment(t, `
        <div id="html" b-html="$data.html"></div>
        <div id="raw" b-html.raw="$data.html"></div>`,
    { html: '<button b-on-click="$data.count++">Count: ${$data.count}</button>', count: 1 });
    app.mount(root);
    const hydrated = root.querySelector('#html button');
    const raw = root.querySelector('#raw button');
    assert.equal(hydrated.textContent, 'Count: 1');
    assert.equal(raw.textContent, 'Count: ${$data.count}');
    assert.equal(raw.hasAttribute('b-on-click'), true);
    raw.click();
    assert.equal(app.state.count, 1);
    hydrated.click();
    assert.equal(app.state.count, 2);
    assert.equal(hydrated.textContent, 'Count: 2');
    app.state.html = '<i>${$data.count}</i>';
    assert.equal(root.querySelector('#html i').textContent, '2');
    assert.equal(root.querySelector('#raw i').textContent, '${$data.count}');
    hydrated.click();
    assert.equal(app.state.count, 2);
});

test('b-text interpolation failures are explicit and hydration performs only one interpolation pass', t => {
    const { app, root } = environment(t, '<p b-text="$data.text"></p>',
        { text: '${$data.nested}', nested: '${notEvaluated}' });
    app.mount(root);
    assert.equal(root.querySelector('p').textContent, '${notEvaluated}');
    assert.throws(() => { app.state.text = '${missingName}'; }, /reactive effects failed/);
});

test('manual HTML/text page demonstrates hydrated references and raw content', t => {
    const markup = readFileSync(new URL('./directives/html.html', import.meta.url), 'utf8');
    const dom = new JSDOM(markup, { runScripts: 'outside-only' });
    const { window } = dom;
    window.eval(bundle);
    const app = window.brio.createApp();
    t.after(() => {
        try { app.dispose(); } finally { window.close(); }
    });
    app.mount('body');
    const { document } = window;
    assert.equal(document.querySelector('#hydrated-html strong').textContent, 'Counter: 1');
    assert.equal(document.querySelector('#hydrated-text').textContent, '<strong>Counter: 1</strong>');
    assert.equal(document.querySelector('#hydrated-text strong'), null);
    assert.equal(document.querySelector('#raw-html strong').textContent, 'Counter: ${$data.counter}');
    assert.equal(document.querySelector('#raw-text').textContent, '<strong>Counter: ${$data.counter}</strong>');
    document.querySelectorAll('button')[1].click();
    assert.equal(document.querySelector('#hydrated-html strong').textContent, 'Counter: 2');
    assert.equal(document.querySelector('#hydrated-text').textContent, '<strong>Counter: 2</strong>');
});

function environment(t, markup, state = {}) {
    const dom = new JSDOM(`<main id="app">${markup}</main>`, {
        runScripts: 'outside-only',
        pretendToBeVisual: true,
    });
    const { window } = dom;
    window.eval(bundle);
    const errors = [];
    window.addEventListener('error', event => {
        errors.push(event.error);
        event.preventDefault();
    });
    const app = window.brio.createApp({ state: () => window.JSON.parse(JSON.stringify(state)) });
    t.after(() => {
        app.dispose();
        window.close();
        assert.deepEqual(errors, []);
    });
    return { window, app, root: window.document.querySelector('#app') };
}

function transitionClock(window) {
    let id = 0;
    const frames = new Map();
    const timers = new Map();
    window.requestAnimationFrame = callback => {
        frames.set(++id, callback);
        return id;
    };
    window.cancelAnimationFrame = id => frames.delete(id);
    window.setTimeout = (callback, delay) => {
        timers.set(++id, { callback, delay });
        return id;
    };
    window.clearTimeout = id => timers.delete(id);
    return {
        timers,
        frames,
        advanceFrames() {
            for (let i = 0; i < 2; i++) {
                const callbacks = [...frames.values()];
                frames.clear();
                for (const callback of callbacks) callback();
            }
        },
    };
}

test('$insert supports every placement, literal text, multiple roots and cloned fragments', t => {
    const { app, root, window } = environment(t, '<section id="target"><i>old</i></section><aside>end</aside>', { count: 1 });
    app.mount(root);
    const before = app.insert('#target', 'before', '<b>before</b>');
    const after = app.insert('#target', 'after', '<b>after</b>');
    app.insert('#target', 'prepend', '<u>first</u>');
    const appended = app.insert('#target', 'append', '<em b-text="$data.count"></em><span>last</span>');
    assert.equal(root.textContent, 'beforefirstold1lastafterend');
    app.state.count = 2;
    assert.equal(appended.nodes[0].textContent, '2');
    app.insert('#target', 'replaceChildren', '<strong>replacement</strong>');
    assert.equal(appended.removed, true);
    app.insert('#target', 'textContent', '<b>${$data.count}</b>');
    assert.equal(root.querySelector('#target').textContent, '<b>${$data.count}</b>');
    assert.equal(root.querySelector('#target').children.length, 0);
    const fragment = window.document.createDocumentFragment();
    const button = window.document.createElement('button');
    button.setAttribute('on-click', '$data.count++');
    fragment.append(button, window.document.createTextNode('${$data.count}'));
    const cloned = app.insert('#target', 'replaceWith', fragment);
    assert.equal(fragment.childNodes.length, 2);
    assert.equal(button.hasAttribute('on-click'), true);
    cloned.nodes[0].click();
    assert.equal(cloned.nodes[1].textContent, '3');
    assert.equal(root.querySelector('#target'), null);
    assert.equal(root.lastElementChild.textContent, 'end');
    cloned.remove();
    cloned.remove();
    assert.equal(cloned.removed, true);
    assert.equal(cloned.nodes.length, 0);
    before.remove();
    after.remove();
});

test('$insert replacement dehydrates original children without stopping siblings or the container', t => {
    const { app, root } = environment(t, `
        <section id="target"><button on-click="$data.count++"></button><span b-text="$data.count"></span></section>
        <aside b-text="$data.count"></aside>`, { count: 0 });
    const mount = app.mount(root);
    const oldButton = root.querySelector('button');
    const oldSpan = root.querySelector('span');
    const inserted = app.insert('#target', 'replaceChildren', '<button on-click="$data.count++">new</button>');
    oldButton.click();
    assert.equal(app.state.count, 0);
    root.querySelector('button').click();
    assert.equal(app.state.count, 1);
    assert.equal(oldSpan.textContent, '0');
    assert.equal(root.querySelector('aside').textContent, '1');
    const nested = app.insert(root.querySelector('button'), 'after', '<span b-text="$data.count"></span>');
    mount.unmount();
    assert.equal(inserted.removed, true);
    assert.equal(nested.removed, true);
});

test('$insert inherits destination data and loop context, and optional data adds one scope', t => {
    const { app, root, window } = environment(t, `
        <section b-data="{ local: 'parent' }"><div id="target" b-data="{ local: 'target' }"></div></section>
        <div b-for="item in $data.items"><div class="row"></div></div>`, { items: ['A'] });
    app.mount(root);
    app.insert('#target', 'append', '<span b-text="$data.local"></span>');
    app.insert('#target', 'before', '<em b-text="$data.local"></em>');
    app.insert('#target', 'append', '<b b-text="$data.local + $data.$parent.local"></b>',
        { data: window.JSON.parse('{"local":"child:"}') });
    app.insert('.row', 'append', '<u b-text="$for.item"></u>');
    assert.equal(root.querySelector('span').textContent, 'target');
    assert.equal(root.querySelector('em').textContent, 'parent');
    assert.equal(root.querySelector('b').textContent, 'child:target');
    assert.equal(root.querySelector('u').textContent, 'A');
    app.state.items[0] = 'B';
    assert.equal(root.querySelector('u').textContent, 'B');
});

test('contextual $insert is lexical, root-bound, and owned by the destination', t => {
    const { app, root, window } = environment(t, `
        <div class="target"></div>
        <button b-if="$data.visible" on-click="$insert('.target', 'append', '<span b-text=&quot;$data.count&quot;></span>')">insert</button>
        <script b-script>() => { $data.insert = $context.$insert; }</script>`, { visible: true, count: 0 });
    const otherRoot = window.document.createElement('main');
    otherRoot.innerHTML = '<div class="target"></div>';
    window.document.body.append(otherRoot);
    app.mount(root);
    app.mount(otherRoot);
    assert.throws(() => app.insert('.target', 'append', 'ambiguous'), /exactly one/);
    root.querySelector('button').click();
    assert.equal(otherRoot.querySelector('.target').textContent, '');
    app.state.visible = false;
    app.state.count = 4;
    assert.equal(root.querySelector('span').textContent, '4');
    const handle = app.state.insert('.target', 'append', 'script');
    const staleInsert = app.state.insert;
    assert.equal(handle.removed, false);
    app.unmount();
    assert.equal(handle.removed, true);
    assert.throws(() => app.state.insert('.target', 'append', 'late'), /active mounted/);
    app.mount(root);
    assert.throws(() => staleInsert('.target', 'append', 'stale'), /active mounted/);
    app.insert('.target', 'append', 'new mount');
    assert.equal(root.querySelector('.target').textContent, 'new mount');
});

test('$insert owns structural regions, teleports, hidden nodes and enclosing branch cleanup', t => {
    const { app, root } = environment(t, '<div id="target"></div><aside id="portal"></aside>', { visible: false, items: [1, 2] });
    app.mount(root);
    const region = app.insert('#target', 'append', `
        <template b-template><span b-for="item in $data.items" b-text="$for.item"></span></template>
        <div id="hidden" b-if.detach="$data.visible"></div>
        <div b-if="$data.visible"><section id="branch"></section></div>
        <div b-teleport="'#portal'"><button on-click="$data.items.push(3)">teleported</button></div>`);
    const hidden = region.nodes.find(node => node.nodeType === 8 && node.nodeValue === 'brio:if:branch');
    assert.ok(hidden);
    app.state.visible = true;
    const hiddenElement = root.querySelector('#hidden');
    app.state.visible = false;
    const hiddenInsertion = app.insert(hiddenElement, 'append', '<b b-text="$data.items.length"></b>');
    app.state.visible = true;
    assert.equal(root.querySelector('#hidden b').textContent, '2');
    const branch = app.insert('#branch', 'append', '<em>child</em>');
    app.state.visible = false;
    assert.equal(branch.removed, true);
    const teleportedButton = root.querySelector('#portal button');
    region.remove();
    assert.equal(hiddenInsertion.removed, true);
    assert.equal(root.querySelector('#portal button'), null);
    teleportedButton.click();
    assert.equal(app.state.items.length, 2);
    assert.equal(root.querySelector('#target').textContent, '');
});

test('$insert errors are explicit, preserve content on invalid input, and clean failed hydration', t => {
    const { app, root, window } = environment(t, '<div id="target">old</div><div b-text="$data.count"></div>', { count: 0 });
    app.mount(root);
    assert.throws(() => app.insert('#missing', 'append', ''), /exactly one/);
    assert.throws(() => app.insert('#target', 'invalid', ''), /placement/);
    assert.throws(() => app.insert('#target', 'replaceChildren', 42), /content/);
    assert.throws(() => app.insert('#target', 'append', '', null), /options/);
    assert.throws(() => app.insert(root, 'before', ''), /mount root/);
    assert.throws(() => app.insert(root.lastElementChild, 'append', ''), /controlled/);
    assert.throws(() => app.insert('#target', 'replaceChildren', '', { data: null }), /state|object|data/i);
    assert.equal(root.querySelector('#target').textContent, 'old');
    let cleanups = 0;
    app.state.cleanup = () => cleanups++;
    assert.throws(() => app.insert('#target', 'append',
        '<script b-script>() => { onCleanup($data.cleanup); }</script><b b-text="missing.name"></b>'), /expression/i);
    assert.equal(cleanups, 1);
    assert.equal(root.querySelector('#target').textContent, 'old');
    const outside = window.document.createElement('div');
    assert.throws(() => app.insert(outside, 'append', ''), /exactly one/);
    window.document.body.append(outside);
    const otherApp = window.brio.createApp();
    outside.innerHTML = '<div b-teleport="\'#target\'">foreign</div>';
    otherApp.mount(outside);
    try {
        assert.throws(() => app.insert(outside, 'append', ''), /exactly one/);
        const foreign = root.querySelector('#target div');
        assert.throws(() => app.insert(foreign, 'before', ''), /another Brio app/);
        const externalInsertion = otherApp.insert(foreign, 'append', '<span>owned</span>');
        assert.equal(foreign.textContent, 'foreignowned');
        externalInsertion.remove();
    } finally {
        otherApp.dispose();
    }
});

test('$insert replacements clean original structural controllers, including teleported and hidden children', t => {
    const { app, root } = environment(t, `
        <section id="target">
            <div b-if="$data.visible"><button on-click="$data.count++">if</button></div>
            <div b-for="item in $data.items"><button on-click="$data.count++">for</button></div>
            <div b-if.detach="$data.hidden"><button on-click="$data.count++">preserved</button></div>
            <div b-teleport="'#portal'"><button on-click="$data.count++">teleport</button></div>
        </section><aside id="portal"></aside>`, { visible: true, hidden: false, count: 0, items: [1] });
    app.mount(root);
    const buttons = [...root.querySelectorAll('button')];
    assert.throws(() => app.insert(root.querySelector('#target div'), 'replaceWith', ''), /managed by b-if/);
    app.insert('#target', 'replaceChildren', '<b>new</b>');
    assert.equal(root.querySelector('#portal').textContent, '');
    assert.equal(root.querySelector('#target').textContent, 'new');
    app.state.visible = false;
    app.state.hidden = true;
    app.state.items.push(2);
    assert.equal(root.querySelector('#target').textContent, 'new');
    buttons.forEach(button => button.click());
    assert.equal(app.state.count, 0);
});

test('$insert uses component state at hosts and retains slot contexts', t => {
    const { app, root, window } = environment(t, `
        <test-component><div id="projected"></div></test-component>`, { label: 'root' });
    app.component('test-component', {
        template: '<div id="internal"></div><slot></slot>',
        setup: () => window.JSON.parse('{"label":"component"}'),
    });
    app.mount(root);
    app.insert('test-component', 'append', '<b b-text="$data.label"></b>');
    app.insert('#internal', 'append', '<i b-text="$data.label"></i>');
    app.insert('#projected', 'append', '<em b-text="$data.label"></em>');
    assert.equal(root.querySelector('b').textContent, 'component');
    assert.equal(root.querySelector('i').textContent, 'component');
    assert.equal(root.querySelector('em').textContent, 'root');
});

function transitionEvent(window, element, type, propertyName) {
    const event = new window.Event(type, { bubbles: true });
    Object.defineProperties(event, {
        propertyName: { value: propertyName },
        pseudoElement: { value: '' },
    });
    element.dispatchEvent(event);
}

test('browser app.insert replaces global hydration methods while ESM keeps the low-level API', t => {
    const { window, app, root } = environment(t, '', { count: 0 });
    assert.equal(typeof hydrateRoot, 'function');
    assert.equal(typeof hydrateNode, 'function');
    assert.equal(window.brio.hydrateRoot, undefined);
    assert.equal(window.brio.hydrateNode, undefined);
    assert.equal(app.$insert, undefined);
    app.mount(root);
    const handle = app.insert(root, 'append',
        '<button on-click="$data.count++">Increment</button><span b-text="$data.count"></span>');
    const [button, span] = handle.nodes;
    button.click();
    assert.equal(span.textContent, '1');
    handle.remove();
    button.click();
    app.state.count++;
    assert.equal(app.state.count, 2);
    assert.equal(span.textContent, '1');
});

test('b-if recreates local b-data, disposes listeners/effects, and preserves parent state', t => {
    const { app, root } = environment(t, `
        <section b-if="$data.visible" b-data="{ count: 0 }">
            <button on-click="$data.count++; $data.$parent.total++">Increment</button>
            <span b-text="$data.count"></span>
            <em b-text="$data.$parent.total"></em>
        </section>`, { visible: true, total: 0 });
    app.mount(root);
    const old = root.querySelector('section');
    old.querySelector('button').click();
    assert.equal(old.querySelector('span').textContent, '1');
    app.state.visible = false;
    assert.equal(old.isConnected, false);
    old.querySelector('button').click();
    assert.equal(app.state.total, 1);
    app.state.total = 4;
    assert.equal(old.querySelector('em').textContent, '1');
    app.state.visible = true;
    assert.notEqual(root.querySelector('section'), old);
    assert.equal(root.querySelector('span').textContent, '0');
    assert.equal(root.querySelector('em').textContent, '4');
});

test('b-else-if chains mount only the first match and recreate branch state', t => {
    const { app, root } = environment(t, `
        <div b-if="$data.score >= 80" b-data="{ count: 0 }">
            <button on-click="$data.count++"></button><span b-text="$data.count"></span>
        </div>
        <!-- adjacent branches -->
        <div b-else-if="$data.score >= 50">middle</div>
        <div b-else>fallback</div>`, { score: 90 });
    app.mount(root);
    root.querySelector('button').click();
    assert.equal(root.querySelector('span').textContent, '1');
    app.state.score = 60;
    assert.equal(root.querySelectorAll('div').length, 1);
    assert.equal(root.querySelector('div').textContent, 'middle');
    app.state.score = 10;
    assert.equal(root.querySelector('div').textContent, 'fallback');
    app.state.score = 90;
    assert.equal(root.querySelector('span').textContent, '0');
});

test('orphan and nonadjacent else directives fail explicitly', t => {
    for (const markup of ['<div b-else></div>', '<div b-if="false"></div>text<div b-else></div>']) {
        const { app, root } = environment(t, markup);
        assert.throws(() => app.mount(root), /adjacent preceding b-if/);
    }
});

test('data ancestry is reactive, scope-specific, read-only and absent from serialized state', t => {
    const { app, root, window } = environment(t, `
        <div b-data="{ label: 'one' }"><section>
            <div b-data="$data.$parent.shared">
                <script b-script>($context) => { $data.$parent.$parent.capture($context.$data); }</script>
                <button on-click="$data.increment(); $data.$parent.label = 'changed'"></button>
                <span b-text="$data.value + ':' + $data.$parent.label + ':' + $data.$parent.$parent.count"></span>
            </div>
        </section></div>
        <div b-data="{ label: 'two' }"><div b-data="$data.$parent.shared">
            <script b-script>($context) => { $data.$parent.$parent.capture($context.$data); }</script>
            <span b-text="$data.value + ':' + $data.$parent.label"></span>
        </div></div>`, { shared: { value: 0 }, count: 1 });
    const views = [];
    app.state.capture = view => views.push(view);
    app.state.shared.increment = function () { this.value++; };
    app.mount(root);
    root.querySelector('button').click();
    app.state.count = 2;
    assert.deepEqual([...root.querySelectorAll('span')].map(el => el.textContent), ['1:changed:2', '1:two']);
    assert.notEqual(views[0], views[1]);
    assert.notEqual(views[0].$parent, views[1].$parent);
    assert.equal(app.state.shared.$parent, undefined);
    assert.equal(views[0].$parent.label, 'changed');
    assert.equal(views[1].$parent.label, 'two');
    const contexts = [];
    const other = environment(t, '<div b-data="{ value: 1 }"><script b-script>($context) => { $data.$parent.capture($context); }</script></div>');
    other.app.state.capture = $context => contexts.push($context);
    other.app.mount(other.root);
    const $context = contexts[0];
    assert.equal($context.$parent, undefined);
    assert.equal($context.$data.$parent.$parent, undefined);
    assert.deepEqual(Object.keys($context.$data), ['value']);
    assert.deepEqual({ ...$context.$data }, { value: 1 });
    assert.equal(JSON.stringify($context.$data), '{"value":1}');
    assert.throws(() => { $context.$data.$parent = {}; }, /read-only/);
    assert.throws(() => { delete $context.$data.$parent; }, /read-only/);
    assert.throws(() => window.Object.defineProperty($context.$data, '$parent', { value: {} }), /read-only/);
});

test('nested loop ancestry survives wrappers, data scopes, reused names and keyed row updates', t => {
    const { app, root, window } = environment(t, `
        <section b-for="item in $data.items" b-key="$for.item.id">
            <div b-data="{ local: true }"><article>
                <i b-for="item in $for.item.children">
                    <span b-text="$for.item + ':' + $for.$parent.item.name"></span>
                    <b b-for="n in 1" b-text="$for.n + ':' + $for.$parent.item + ':' + $for.$parent.$parent.item.name"></b>
                    <button on-click="$for.$parent.item.name += '!'"></button>
                </i>
            </article></div>
        </section>`, { items: [{ id: 1, name: 'first', children: ['child'] }, { id: 2, name: 'second', children: ['other'] }] });
    app.mount(root);
    const first = root.querySelector('section');
    first.querySelector('button').click();
    assert.equal(first.querySelector('b').textContent, '1:child:first!');
    app.state.items.reverse();
    assert.equal(root.querySelectorAll('section')[1], first);
    app.state.items[1] = window.JSON.parse('{"id":1,"name":"updated","children":["replacement"]}');
    assert.equal(first.querySelector('span').textContent, 'replacement:updated');
    assert.equal(first.querySelector('b').textContent, '1:replacement:updated');
});

test('reserved ancestry fields and loop names fail explicitly', t => {
    for (const markup of [
        '<div b-data="{ $parent: {} }"></div>',
        '<div b-for="$parent in 1"></div>',
        '<div b-for="item, $parent in 1"></div>',
    ]) {
        const { app, root } = environment(t, markup);
        assert.throws(() => app.mount(root), /reserved/);
    }
});

test('loop ancestry metadata is read-only and standalone $parent is no longer supplied', t => {
    const { app, root, window } = environment(t, `
        <section b-for="n in 1"><div b-for="child in 1">
            <script b-script>($context) => { $data.capture($context); }</script>
        </div></section>`);
    const contexts = [];
    app.state.capture = $context => contexts.push($context);
    app.mount(root);
    const $context = contexts[0];
    assert.equal($context.$parent, undefined);
    assert.equal($context.$for.$parent.n, 1);
    assert.equal($context.$for.$parent.$parent, undefined);
    assert.equal($context.$data.$parent, undefined);
    assert.equal(window.JSON.stringify($context.$for), '{"child":1,"$index":0}');
    assert.throws(() => { $context.$for.$parent = {}; }, /read-only/);
    assert.throws(() => { delete $context.$for.$parent; }, /read-only/);
});

test('explicit loop values update keyed rows and nested loop contexts without losing reactivity', t => {
    const { app, root, window } = environment(t, `
        <section b-for="item, index in $data.items" b-key="$for.item.id">
            <span b-text="$for.index + ':' + $for.item.name"></span>
            <button on-click="const suffix = '!'; $for.item.name += suffix;"></button>
            <div b-data="{ local: 0 }">
                <em b-text="$for.item.name + ':' + $data.$parent.label"></em>
            </div>
            <i b-for="child in $for.item.children" b-text="$for.child"></i>
        </section>`, {
        label: 'parent',
        items: [
            { id: 1, name: 'first', children: ['a'] },
            { id: 2, name: 'second', children: ['b'] },
        ],
    });
    app.mount(root);
    const first = root.querySelector('section');
    first.querySelector('button').click();
    assert.equal(app.state.items[0].name, 'first!');
    assert.equal(first.querySelector('em').textContent, 'first!:parent');
    app.state.items.reverse();
    assert.equal(root.querySelectorAll('section')[1], first);
    assert.equal(first.querySelector('span').textContent, '1:first!');
    app.state.items[1] = window.JSON.parse('{"id":1,"name":"replacement","children":["c"]}');
    assert.equal(root.querySelectorAll('section')[1], first);
    assert.equal(first.querySelector('span').textContent, '1:replacement');
    assert.equal(first.querySelector('i').textContent, 'c');
});

test('component setup exposes $data, $props and $emit while slots and events keep parent context', t => {
    const { window, app, root } = environment(t, `
        <count-widget b-bind-label="$data.label" on-change="$data.last = $event.detail">
            <span class="projected" b-text="$data.label"></span>
        </count-widget>`, { label: 'parent', last: 0 });
    app.component('count-widget', {
        template: `<button on-click="$data.count++; $emit('change', $data.count)">
            <span class="count" b-text="$data.count"></span>
            <em b-text="$props.label"></em>
        </button><button class="notify" on-click="$data.notify()"></button>
        <slot></slot><p b-text="$data.$parent.label"></p>`,
        setup({ $props, $emit }) {
            assert.equal($props.label, 'parent');
            const local = window.JSON.parse('{"count":0}');
            local.notify = () => $emit('change', $props.label);
            return local;
        },
    });
    app.mount(root);
    root.querySelector('button').click();
    assert.equal(root.querySelector('.count').textContent, '1');
    assert.equal(app.state.last, 1);
    app.state.label = 'updated';
    assert.equal(root.querySelector('em').textContent, 'updated');
    assert.equal(root.querySelector('p').textContent, 'updated');
    assert.equal(root.querySelector('.projected').textContent, 'updated');
    root.querySelector('.notify').click();
    assert.equal(app.state.last, 'updated');
});

test('b-if preserves the same state and reactive node in detach and hide modes', t => {
    for (const modifier of ['.detach', '.hide']) {
        const { app, root } = environment(t, `
            <section b-if${modifier}="$data.visible" b-data="{ count: 0 }">
                <button on-click="$data.count++"></button><span b-text="$data.count"></span>
                <em b-text="$data.$parent.total"></em>
            </section>`, { visible: true, total: 0 });
        app.mount(root);
        const section = root.querySelector('section');
        section.querySelector('button').click();
        app.state.visible = false;
        assert.equal(section.isConnected, modifier === '.hide');
        if (modifier === '.hide') assert.equal(section.style.display, 'none');
        app.state.total = 5;
        assert.equal(section.querySelector('em').textContent, '5');
        app.state.visible = true;
        assert.equal(root.querySelector('section'), section);
        assert.equal(section.querySelector('span').textContent, '1');
    }
});

test('conditional chains use one parent-context mode, eager preserved setup, and first-match selection', t => {
    for (const mode of ['', '.hide', '.detach']) {
        const { app, root } = environment(t, `
            <section id="a" b-if${mode}="$data.choice === 1" b-data="{ count: 0, choice: 99 }" style="display: flex;">
                <script b-script>() => { $data.$parent.capture($el.parentElement); }</script>
                <button on-click="$data.count++"></button><span b-text="$data.count"></span>
                <em b-text="$data.$parent.total"></em>
            </section>
            <!-- adjacency allows comments and whitespace -->
            <section id="b" b-else-if="$data.choice >= 1" b-data="{ count: 0 }">
                <script b-script>() => { $data.$parent.capture($el.parentElement); }</script>
                <button on-click="$data.count++"></button><span b-text="$data.count"></span>
            </section>
            <section id="c" b-else b-data="{ count: 0 }">
                <script b-script>() => { $data.$parent.capture($el.parentElement); }</script>
                <button on-click="$data.count++"></button><span b-text="$data.count"></span>
            </section>`, { choice: 1, total: 0 });
        const created = [];
        app.state.capture = element => created.push(element);
        app.mount(root);
        const a = root.querySelector('#a');
        assert.equal(created.length, mode ? 3 : 1);
        a.querySelector('button').click();
        const activeIds = () => [...root.querySelectorAll('section')]
            .filter(node => node.style.display !== 'none').map(node => node.id);
        assert.deepEqual(activeIds(), ['a']);
        app.state.choice = 2;
        assert.deepEqual(activeIds(), ['b']);
        app.state.total = 4;
        assert.equal(a.querySelector('em').textContent, mode ? '4' : '0');
        app.state.choice = 0;
        assert.deepEqual(activeIds(), ['c']);
        app.state.choice = 1;
        const nextA = root.querySelector('#a');
        assert.equal(nextA === a, Boolean(mode));
        assert.equal(nextA.querySelector('span').textContent, mode ? '1' : '0');
        assert.equal(nextA.style.display, 'flex');
        assert.equal(created.length, mode ? 3 : 4);
        assert.equal(root.querySelectorAll('section').length, mode === '.hide' ? 3 : 1);
        assert.throws(() => app.insert(nextA, 'replaceWith', ''), /managed by b-if/);
    }
});

test('initially inactive preserved branches retain listeners/effects until all branches are disposed', t => {
    for (const mode of ['hide', 'detach']) {
        const { app, root } = environment(t, `
            <section b-if.${mode}="$data.visible" b-data="{ count: 0 }">
                <script b-script>() => {
                    $data.$parent.capture($el.parentElement);
                    onCleanup($data.$parent.cleaned);
                }</script>
                <button on-click="$data.count++"></button><span b-text="$data.count"></span>
                <em b-text="$data.$parent.total"></em>
            </section>
            <article b-else><script b-script>() => { onCleanup($data.cleaned); }</script></article>`,
        { visible: false, total: 0 });
        let section;
        let cleaned = 0;
        app.state.capture = element => { section = element; };
        app.state.cleaned = () => cleaned++;
        const mount = app.mount(root);
        assert.ok(section);
        assert.equal(section.isConnected, mode === 'hide');
        section.querySelector('button').click();
        app.state.total = 3;
        assert.equal(section.querySelector('span').textContent, '1');
        assert.equal(section.querySelector('em').textContent, '3');
        app.state.visible = true;
        assert.equal(root.querySelector('section'), section);
        app.state.visible = false;
        mount.unmount();
        assert.equal(cleaned, 2);
        const oldText = section.textContent;
        section.querySelector('button').click();
        app.state.total = 9;
        assert.equal(section.textContent, oldText);
        assert.equal(section.isConnected, false);
        app.dispose();
        assert.equal(cleaned, 2);
    }
});

test('initially hidden branches remain queryable during setup while detached branches stay off-document', t => {
    for (const mode of ['hide', 'detach']) {
        const { app, root } = environment(t, `
            <section id="inactive" b-if.${mode}="false">
                <script b-script>() => { $data.capture($el.parentElement, document.querySelector('#inactive')); }</script>
            </section>`);
        let connected;
        let queryMatches;
        app.state.capture = (element, queried) => {
            connected = element.isConnected;
            queryMatches = element === queried;
        };
        app.mount(root);
        assert.equal(connected, mode === 'hide');
        assert.equal(queryMatches, mode === 'hide');
    }
});

test('conditional validation rejects obsolete syntax, conflicting modes and modified else branches', t => {
    const invalid = [
        ['<div b-show="true"></div>', /removed/],
        ['<div show.display="true"></div>', /removed/],
        ['<div b-if.display="true"></div>', /only .hide and .detach/],
        ['<div b-if.hide.detach="true"></div>', /cannot be combined/],
        ['<div b-if="true" b-if.hide="true"></div>', /only one conditional/],
        ['<div b-if="true"></div><div b-else.hide></div>', /leading b-if/],
        ['<div b-if="true"></div><div b-else-if.detach="false"></div>', /leading b-if/],
        ['<div b-if="true"></div><div b-else b-else-if="false"></div>', /only one conditional/],
        ['<div b-if="true"></div><div b-else></div><div b-else-if="false"></div>', /last branch/],
        ['<div b-else-if.hide="true"></div>', /adjacent preceding/],
        ['<div b-if="false"></div>text<div b-else></div>', /adjacent preceding/],
    ];
    for (const mode of ['hide', 'detach']) {
        invalid.push(
            [`<div b-if.${mode}="false" b-for="n in 2"></div>`, /concrete branch/],
            [`<template b-if.${mode}="true" b-template></template>`, /concrete branch/],
            [`<div b-if.${mode}="true"></div><div b-else b-for="n in 2"></div>`, /concrete branch/],
        );
        const { app, root } = environment(t, '');
        root.setAttribute(`b-if.${mode}`, 'true');
        assert.throws(() => app.mount(root), /container root/);
    }
    for (const [markup, message] of invalid) {
        const { app, root } = environment(t, markup);
        const original = root.innerHTML;
        assert.throws(() => app.mount(root), message);
        assert.equal(root.innerHTML, original);
    }
});

test('preserved branches own nested components, providers, loops, templates, teleports and insertion cleanup', t => {
    for (const mode of ['hide', 'detach']) {
        const { app, root, window } = environment(t, `
            <section b-if.${mode}="$data.visible" b-provide="{ label: $data.label }">
                <owned-counter></owned-counter>
                <template b-template><span b-for="n in $data.items" b-text="$for.n"></span></template>
                <div b-teleport="'#portal'"><em b-text="$provided.label"></em></div>
                <div id="destination"></div>
            </section><aside id="portal"></aside>`, { visible: true, label: 'first', items: [1] });
        let setups = 0;
        let cleanups = 0;
        app.component('owned-counter', {
            template: '<button on-click="$data.count++" b-text="$data.count"></button><b b-text="$provided.label"></b>',
            setup() {
                setups++;
                window.brio.onCleanup(() => cleanups++);
                return window.eval('({ count: 0 })');
            },
        });
        app.mount(root);
        const section = root.querySelector('section');
        const button = section.querySelector('button');
        button.click();
        app.state.visible = false;
        const insertion = app.insert(section.querySelector('#destination'), 'append', '<i b-text="$provided.label"></i>');
        app.state.label = 'second';
        app.state.items.push(2);
        assert.equal(section.querySelector('b').textContent, 'second');
        assert.equal(root.querySelector('#portal em').textContent, 'second');
        assert.equal(section.querySelector('#destination i').textContent, 'second');
        assert.deepEqual([...section.querySelectorAll('span')].map(node => node.textContent), ['1', '2']);
        app.state.visible = true;
        assert.equal(root.querySelector('section'), section);
        assert.equal(section.querySelector('button'), button);
        assert.equal(button.textContent, '1');
        assert.equal(setups, 1);
        app.state.visible = false;
        app.insert(root, 'replaceChildren', '<p>replacement</p>');
        assert.equal(cleanups, 1);
        assert.equal(insertion.removed, true);
        assert.equal(root.textContent, 'replacement');
        app.state.visible = true;
        assert.equal(root.textContent, 'replacement');
        button.click();
        assert.equal(button.textContent, '1');
    }
});

test('preserved component-host chains set up inactive components exactly once', t => {
    for (const mode of ['hide', 'detach']) {
        const { app, root, window } = environment(t, `
            <owned-counter id="first" b-if.${mode}="$data.visible"></owned-counter>
            <owned-counter id="second" b-else></owned-counter>`, { visible: false });
        let setups = 0;
        let cleanups = 0;
        app.component('owned-counter', {
            template: '<button on-click="$data.count++" b-text="$data.count"></button>',
            setup() {
                setups++;
                window.brio.onCleanup(() => cleanups++);
                return window.eval('({ count: 0 })');
            },
        });
        const mount = app.mount(root);
        assert.equal(setups, 2);
        const second = root.querySelector('#second');
        second.querySelector('button').click();
        app.state.visible = true;
        app.state.visible = false;
        assert.equal(root.querySelector('#second'), second);
        assert.equal(second.textContent, '1');
        assert.equal(setups, 2);
        mount.unmount();
        assert.equal(cleanups, 2);
    }
});

test('failed eager conditional hydration cleans inactive scopes and restores mount markup', t => {
    for (const mode of ['hide', 'detach']) {
        const { app, root } = environment(t, `
            <section b-if.${mode}="true"><script b-script>() => { onCleanup($data.cleaned); }</script></section>
            <section b-else><script b-script>() => { onCleanup($data.cleaned); }</script>
                <b b-text="missing.value"></b></section>`);
        let cleaned = 0;
        app.state.cleaned = () => cleaned++;
        const original = root.innerHTML;
        assert.throws(() => app.mount(root), /expression/i);
        assert.equal(cleaned, 2);
        assert.equal(root.innerHTML, original);
    }
});

test('conditional cleanup stops selection before user cleanup mutates condition state', t => {
    for (const mode of ['', '.hide', '.detach']) {
        const { app, root } = environment(t, `
            <section b-if${mode}="$data.visible">
                <script b-script>() => { onCleanup($data.cleaned); }</script>
            </section>`, { visible: true });
        app.state.cleaned = () => { app.state.visible = false; };
        const mount = app.mount(root);
        assert.doesNotThrow(() => mount.unmount());
    }
});

test('b-if.hide restores visible display from initially authored display:none', t => {
    const { app, root } = environment(t, '<section b-if.hide="$data.visible" style="display: none;"></section>', { visible: true });
    app.mount(root);
    const section = root.querySelector('section');
    assert.equal(section.style.display, '');
    app.state.visible = false;
    assert.equal(section.style.display, 'none');
    app.state.visible = true;
    assert.equal(section.style.display, '');
});

test('preserved teleported branch hosts keep their destination and chain source positions', t => {
    for (const mode of ['hide', 'detach']) {
        const { app, root } = environment(t, `
            <section id="teleported" b-if.${mode}="$data.visible" b-teleport="'#portal'">remote</section>
            <article b-else>fallback</article>
            <footer>end</footer>
            <aside id="portal"><b>existing</b><i>after</i></aside>`, { visible: true });
        app.mount(root);
        const section = root.querySelector('#teleported');
        const portal = root.querySelector('#portal');
        app.state.visible = false;
        assert.equal(section.isConnected, mode === 'hide');
        assert.equal(root.querySelector('article').nextElementSibling.tagName, 'FOOTER');
        app.state.visible = true;
        assert.equal(section.parentNode, portal);
        assert.equal(root.querySelector('article')?.style.display, mode === 'hide' ? 'none' : undefined);
        assert.equal(root.querySelector('footer').nextElementSibling, portal);
        app.unmount();
        assert.equal(section.isConnected, false);
    }
});

test('preserved chain initial selection reflects synchronous setup writes', t => {
    for (const mode of ['hide', 'detach']) {
        const { app, root } = environment(t, `
            <section b-if.${mode}="$data.visible">
                <script b-script>() => { $data.visible = false; }</script>
            </section><article b-else>selected after setup</article>`, { visible: true });
        app.mount(root);
        assert.equal(root.querySelector('article').style.display, '');
        const section = root.querySelector('section');
        if (mode === 'hide') assert.equal(section.style.display, 'none');
        else assert.equal(section, null);
    }
});

test('manual conditional page covers hide/detach chains, eager setup and preserved counters', t => {
    const markup = readFileSync(new URL('./directives/if.html', import.meta.url), 'utf8');
    const dom = new JSDOM(markup, { runScripts: 'outside-only' });
    const { window } = dom;
    window.eval(bundle);
    const app = window.brio.createApp();
    t.after(() => { try { app.dispose(); } finally { window.close(); } });
    app.mount('body');
    const { document } = window;
    assert.equal(document.querySelector('#setup-count').textContent, '6');
    const hidden = document.querySelector('#hidden-dashboard');
    assert.equal(hidden.style.display, 'none');
    document.querySelector('#toggle-hide').click();
    assert.equal(hidden.style.display, 'flex');
    const detached = document.querySelector('#detached-dashboard');
    detached.querySelector('button').click();
    document.querySelector('#toggle-detach').click();
    assert.equal(detached.isConnected, false);
    document.querySelector('#toggle-detach').click();
    assert.equal(document.querySelector('#detached-dashboard'), detached);
    assert.equal(detached.querySelector('strong').textContent, '1');
    const first = document.querySelector('#detach-one');
    first.querySelector('button').click();
    document.querySelector('#tab-two').click();
    assert.equal(first.isConnected, false);
    assert.equal(document.querySelector('#hide-one').style.display, 'none');
    const message = document.querySelector('#live-message');
    message.value = 'updated';
    message.dispatchEvent(new window.Event('input', { bubbles: true }));
    assert.equal(first.querySelector('span').textContent, 'updated');
    document.querySelector('#tab-other').click();
    assert.ok(document.querySelector('#detach-other'));
    document.querySelector('#tab-one').click();
    assert.equal(document.querySelector('#detach-one'), first);
    assert.equal(first.querySelector('button').textContent, 'Detached tab 1: 1');
    assert.equal(document.querySelector('#setup-count').textContent, '6');
});

test('money options reach the formatter and b-model in either attribute order', t => {
    for (const attributes of [
        `b-mask="money($data.options)" b-model="$data.amount"`,
        `b-model="$data.amount" b-mask.money="$data.options"`,
    ]) {
        const { app, root, window } = environment(t, `<input ${attributes}>`, {
            amount: '', options: { thousands: '.', decimal: ',', precision: 3 },
        });
        app.mount(root);
        const input = root.querySelector('input');
        input.value = '1234567';
        input.dispatchEvent(new window.Event('input', { bubbles: true }));
        assert.equal(input.value, '1.234,567');
        assert.equal(app.state.amount, '1.234,567');
        app.state.options.thousands = ' ';
        assert.equal(input.value, '1 234,567');
        assert.equal(app.state.amount, '1 234,567');
    }
});

test('money defaults, zero precision, and invalid options', t => {
    for (const [attributes, value] of [
        ['b-mask.money', '1,234.56'],
        [`b-mask="'money'"`, '1,234.56'],
        [`b-mask.money="{ precision: 0 }"`, '123,456'],
    ]) {
        const { app, root, window } = environment(t, `<input ${attributes}>`);
        app.mount(root);
        const input = root.querySelector('input');
        input.value = '123456';
        input.dispatchEvent(new window.Event('input'));
        assert.equal(input.value, value);
    }
    const { app, root } = environment(t, `<input b-mask="money({ precision: -1 })">`);
    assert.throws(() => app.mount(root), error => /precision must be an integer/.test(error.cause?.message));
});

test('pattern deletions restore the caret after the preceding editable character', t => {
    const { app, root, window } = environment(t, `<input b-mask="'##/##/####'">`);
    app.mount(root);
    const input = root.querySelector('input');
    input.focus();
    for (const [raw, caret, type, expected, position] of [
        ['12/25/987', 6, 'deleteContentForward', '12/25/987', 5],
        ['12/251987', 5, 'deleteContentBackward', '12/25/1987', 5],
        ['1225/1987', 2, 'deleteContentForward', '12/25/1987', 2],
        ['12/29/1987', 5, 'insertText', '12/29/1987', 5],
    ]) {
        input.value = raw;
        input.setSelectionRange(caret, caret);
        input.dispatchEvent(new window.InputEvent('input', { bubbles: true, inputType: type }));
        assert.equal(input.value, expected);
        assert.equal(input.selectionStart, position);
        assert.equal(input.selectionEnd, position);
    }
});

test('money edits preserve caret and selection in either model attribute order', t => {
    for (const attributes of [
        `b-mask.money b-model="$data.amount"`,
        `b-model="$data.amount" b-mask.money`,
    ]) {
        const { app, root, window } = environment(t, `<input ${attributes}>`, { amount: '' });
        app.mount(root);
        const input = root.querySelector('input');
        input.focus();
        for (const [raw, caret, type, expected, position] of [
            ['1,24.56', 3, 'deleteContentForward', '124.56', 2],
            ['1234.56', 1, 'deleteContentBackward', '1,234.56', 1],
            ['1,23456', 5, 'deleteContentForward', '1,234.56', 5],
            ['1,2934.56', 4, 'insertText', '12,934.56', 4],
            ['1', 1, 'insertText', '0.01', 4],
        ]) {
            input.value = raw;
            input.setSelectionRange(caret, caret);
            input.dispatchEvent(new window.InputEvent('input', { bubbles: true, inputType: type }));
            assert.equal(input.value, expected);
            assert.equal(app.state.amount, expected);
            assert.equal(input.selectionStart, position);
        }
        input.value = '1234.56';
        input.setSelectionRange(1, 3, 'backward');
        input.dispatchEvent(new window.InputEvent('input', { bubbles: true, inputType: 'insertFromPaste' }));
        assert.equal(input.selectionStart, 1);
        assert.equal(input.selectionEnd, 4);
        assert.equal(input.selectionDirection, 'backward');
    }
});

test('money caret mapping handles custom separators, negative values and zero precision', t => {
    const { app, root, window } = environment(t, `<input b-mask.money="{ thousands: ' ', decimal: ',', precision: 0 }">`);
    app.mount(root);
    const input = root.querySelector('input');
    input.focus();
    input.value = '-123456';
    input.setSelectionRange(4, 4);
    input.dispatchEvent(new window.InputEvent('input', { bubbles: true, inputType: 'deleteContentForward' }));
    assert.equal(input.value, '-123 456');
    assert.equal(input.selectionStart, 4);
});

test('b-script receives $context, lexical helpers, destructuring, async closures, and the script element', async t => {
    const { app, root } = environment(t, `
        <div b-data="{ count: 0, status: '' }">
            <script b-script>
                async ({ $data, $el }) => {
                    $data.count = 1;
                    $data.$parent.parentCount++;
                    $data.tag = $el.tagName;
                    await new Promise(resolve => setTimeout(resolve, 5));
                    $data.status = 'done';
                }
            </script>
            <span b-text="$data.count"></span><em b-text="$data.status"></em>
        </div>
        <script b-script>
            ($context) => {
                $data.lexical = true;
                $context.$data.direct = true;
            };
        </script>`, { parentCount: 0 });
    app.mount(root);
    assert.equal(app.state.parentCount, 1);
    assert.equal(app.state.lexical, true);
    assert.equal(app.state.direct, true);
    assert.equal(root.querySelector('span').textContent, '1');
    await new Promise(resolve => setTimeout(resolve, 25));
    assert.equal(root.querySelector('em').textContent, 'done');
});

test('function factory accepts named, anonymous, arrow, and async functions without with', async () => {
    const $context = { $data: { count: 0 }, $event: { type: 'test' } };
    for (const source of [
        'function ($context) { $context.$data.count++; }',
        'function named($context) { $context.$data.count++; }',
        '($context) => { $context.$data.count++; }',
        'async ($context) => { await Promise.resolve(); $context.$data.count++; }',
        'async function named({ $data }) { $data.count++; }',
        '() => { $data.count++; }',
    ]) await evaluateFunction(source, $context)($context);
    assert.equal($context.$data.count, 6);
    assert.equal(evaluateFunction('($context) => $context.$event.type', $context)($context), 'test');
    assert.throws(() => evaluateFunction('42', $context), /function expression/);
});

test('script failures run once, do not fall back, and unmarked scripts are left untouched', t => {
    const { app, root } = environment(t, `
        <script>window.shouldNotRun = true; \${notAnInterpolation}</script>
        <script script>() => { $data.ran = true; }</script>`);
    app.mount(root);
    assert.equal(app.state.ran, undefined);
    const failed = environment(t, `<script b-script>
        ($context) => { $context.$data.calls++; throw new Error('failure'); }
    </script>`, { calls: 0 });
    assert.throws(() => failed.app.mount(failed.root), /b-script execution failed/);
    assert.equal(failed.app.state.calls, 1);
});

test('leave waits for every own property and dehydrates b-if only after completion', t => {
    const { window, app, root } = environment(t, `
        <section b-if="$data.visible" b-transition="'fade'"
            style="transition-property: opacity, transform; transition-duration: 0.2s, 1.6s; transition-delay: 0s, 0.2s">
            <button on-click="$data.count++"></button><span b-text="$data.count"></span>
        </section>`, { visible: true, count: 0 });
    const clock = transitionClock(window);
    app.mount(root);
    clock.advanceFrames();
    const section = root.querySelector('section');
    app.state.visible = false;
    clock.advanceFrames();
    assert.equal([...clock.timers.values()][0].delay, 1850);
    section.querySelector('button').click();
    assert.equal(app.state.count, 1);
    app.state.count = 4;
    assert.equal(section.querySelector('span').textContent, '4');
    for (const property of ['opacity', 'transform'])
        transitionEvent(window, section, 'transitionrun', property);
    transitionEvent(window, section.querySelector('span'), 'transitionend', 'transform');
    transitionEvent(window, section, 'transitionend', 'opacity');
    assert.equal(section.isConnected, true);
    transitionEvent(window, section, 'transitionend', 'transform');
    clock.advanceFrames();
    assert.equal(section.isConnected, false);
    assert.equal(clock.timers.size, 0);
    assert.equal(section.className, '');
    section.querySelector('button').click();
    assert.equal(app.state.count, 4);
    app.state.count = 5;
    assert.equal(section.querySelector('span').textContent, '4');
});

test('plain b-if reverses the same live instance and resets state only after a completed leave', t => {
    for (const attributes of [
        `b-if="$data.visible" b-transition="'fade'"`,
        `b-transition="'fade'" b-if="$data.visible"`,
    ]) {
        const { window, app, root } = environment(t, `
            <style>
                .fade-enter-active, .fade-leave-active {
                    transition-property: opacity; transition-duration: 1.3s; transition-delay: 0s;
                }
                .fade-enter, .fade-leave-to { opacity: 0; }
                .fade-enter-to, .fade-leave { opacity: 1; }
            </style>
            <section ${attributes} b-data="{ local: 0, count: 0 }">
                <button on-click="$data.count++"></button><span b-text="$data.count"></span>
                <button class="local" on-click="$data.local++" b-text="$data.local"></button>
                <script b-script>() => { onCleanup($data.$parent.cleaned); }</script>
            </section>`, { visible: false, count: 0 });
        let cleaned = 0;
        app.state.cleaned = () => cleaned++;
        const clock = transitionClock(window);
        const mount = app.mount(root);
        app.state.visible = true;
        clock.advanceFrames();
        const section = root.querySelector('section');
        assert.ok(section.classList.contains('fade-enter-to'));
        const staleEnter = [...clock.timers.values()][0].callback;
        app.state.visible = false;
        assert.equal(cleaned, 0);
        assert.ok(section.classList.contains('fade-leave-to'));
        assert.equal(section.classList.contains('fade-leave'), false);
        staleEnter();
        assert.ok(section.classList.contains('fade-leave-to'));
        section.querySelector('button').click();
        assert.equal(section.querySelector('span').textContent, '1');
        section.querySelector('.local').click();
        const staleLeave = [...clock.timers.values()][0].callback;
        app.state.visible = true;
        assert.equal(root.querySelector('section'), section);
        assert.equal(root.querySelectorAll('section').length, 1);
        assert.equal(section.querySelector('.local').textContent, '1');
        assert.ok(section.classList.contains('fade-enter-to'));
        staleLeave();
        assert.equal(section.isConnected, true);
        assert.equal(cleaned, 0);
        app.state.visible = false;
        transitionEvent(window, section, 'transitionrun', 'opacity');
        transitionEvent(window, section, 'transitionend', 'opacity');
        clock.advanceFrames();
        assert.equal(section.isConnected, false);
        assert.equal(cleaned, 1);
        app.state.visible = true;
        const fresh = root.querySelector('section');
        assert.notEqual(fresh, section);
        assert.equal(fresh.querySelector('.local').textContent, '0');
        mount.unmount();
        assert.equal(cleaned, 2);
        assert.equal(clock.timers.size, 0);
        assert.equal(clock.frames.size, 0);
    }
});

test('conditional transitions reverse safely in all modes and attribute orders', t => {
    for (const modifier of ['', '.detach', '.hide']) {
        for (const attributes of [
            `b-transition="'fade'" b-if${modifier}="$data.visible"`,
            `b-if${modifier}="$data.visible" b-transition="'fade'"`,
        ]) {
            const { window, app, root } = environment(t, `
                <section ${attributes} style="transition-property: opacity; transition-duration: 2s; transition-delay: 0s"></section>`,
            { visible: true });
            const clock = transitionClock(window);
            app.mount(root);
            clock.advanceFrames();
            const section = root.querySelector('section');
            app.state.visible = false;
            clock.advanceFrames();
            const staleTimer = [...clock.timers.values()][0].callback;
            app.state.visible = true;
            assert.equal(section.classList.contains('fade-enter'), false);
            assert.equal(section.classList.contains('fade-enter-to'), true);
            clock.advanceFrames();
            staleTimer();
            assert.equal(section.isConnected, true);
            assert.equal(section.style.display, '');
            assert.equal(section.classList.contains('fade-enter-to'), true);
            app.state.visible = false;
            assert.equal(section.classList.contains('fade-leave'), false);
            clock.advanceFrames();
            transitionEvent(window, section, 'transitionrun', 'opacity');
            transitionEvent(window, section, 'transitioncancel', 'opacity');
            clock.advanceFrames();
            assert.equal(section.isConnected, modifier === '.hide');
            if (modifier === '.hide') assert.equal(section.style.display, 'none');
            app.state.visible = true;
            if (modifier) assert.equal(root.querySelector('section'), section);
            else assert.notEqual(root.querySelector('section'), section);
        }
    }
});

test('completed b-if leave can reactivate from cleanup without reusing a disposed branch', t => {
    const { window, app, root } = environment(t, `
        <section b-if="$data.visible" b-transition="'fade'" style="transition-property: opacity; transition-duration: 1s; transition-delay: 0s">
            <script b-script>() => { onCleanup($data.reopen); }</script>
            <button on-click="$data.count++" b-text="$data.count"></button>
        </section>`, { visible: true, count: 0 });
    let cleanups = 0;
    app.state.reopen = () => { cleanups++; app.state.visible = true; };
    const clock = transitionClock(window);
    const mount = app.mount(root);
    clock.advanceFrames();
    const old = root.querySelector('section');
    app.state.visible = false;
    clock.advanceFrames();
    transitionEvent(window, old, 'transitionrun', 'opacity');
    transitionEvent(window, old, 'transitionend', 'opacity');
    clock.advanceFrames();
    const fresh = root.querySelector('section');
    assert.notEqual(fresh, old);
    assert.equal(old.isConnected, false);
    assert.equal(root.querySelectorAll('section').length, 1);
    fresh.querySelector('button').click();
    assert.equal(app.state.count, 1);
    assert.equal(cleanups, 1);
    mount.unmount();
    assert.equal(cleanups, 2);
    assert.equal(clock.frames.size, 0);
    assert.equal(clock.timers.size, 0);
});

test('conditional chain transitions cancel stale removals across rapid branch switches and unmount', t => {
    for (const mode of ['', '.hide', '.detach']) {
        const { window, app, root } = environment(t, `
            <section id="a" b-if${mode}="$data.choice === 1" b-transition="'fade'"
                style="transition-property: opacity; transition-duration: 2s; transition-delay: 0s">a</section>
            <section id="b" b-else-if="$data.choice === 2" b-transition="'fade'"
                style="transition-property: opacity; transition-duration: 2s; transition-delay: 0s">b</section>
            <section id="c" b-else b-transition="'fade'"
                style="transition-property: opacity; transition-duration: 2s; transition-delay: 0s">c</section>`,
        { choice: 1 });
        const clock = transitionClock(window);
        const mount = app.mount(root);
        clock.advanceFrames();
        const a = root.querySelector('#a');
        const stale = [];
        for (const choice of [2, 3, 1, 2, 1]) {
            app.state.choice = choice;
            clock.advanceFrames();
            stale.push(...[...clock.timers.values()].map(timer => timer.callback));
        }
        stale.forEach(callback => callback());
        assert.equal(root.querySelector('#a'), a);
        assert.equal(a.style.display, '');
        assert.deepEqual([...root.querySelectorAll('section')]
            .filter(section => section.style.display !== 'none').map(section => section.id), ['a']);
        app.state.choice = 2;
        clock.advanceFrames();
        const pending = [...clock.timers.values()].map(timer => timer.callback);
        mount.unmount();
        pending.forEach(callback => callback());
        assert.equal(clock.frames.size, 0);
        assert.equal(clock.timers.size, 0);
        assert.equal(a.isConnected, false);
    }
});

test('a cancelled transition can be replaced before completion is committed', t => {
    const { window, app, root } = environment(t, `
        <section b-if.detach="$data.visible" b-transition="'fade'"
            style="transition-property: transform; transition-duration: 2s; transition-delay: 0s"></section>`,
    { visible: true });
    const clock = transitionClock(window);
    app.mount(root);
    clock.advanceFrames();
    const section = root.querySelector('section');
    app.state.visible = false;
    clock.advanceFrames();
    transitionEvent(window, section, 'transitionrun', 'transform');
    transitionEvent(window, section, 'transitioncancel', 'transform');
    transitionEvent(window, section, 'transitionrun', 'transform');
    clock.advanceFrames();
    assert.equal(section.isConnected, true);
    transitionEvent(window, section, 'transitionend', 'transform');
    clock.advanceFrames();
    assert.equal(section.isConnected, false);
});

test('initially inactive preserved branches do not animate; no-CSS leave completes and unmount cancels pending work', t => {
    for (const modifier of ['.detach', '.hide']) {
        const { window, app, root } = environment(t, `<section b-transition="'fade'" b-if${modifier}="$data.visible">
            <div b-transition="'fade'"></div></section>`,
            { visible: false });
        const clock = transitionClock(window);
        const mount = app.mount(root);
        assert.equal(clock.frames.size, 0);
        app.state.visible = true;
        clock.advanceFrames();
        app.state.visible = false;
        clock.advanceFrames();
        assert.equal(clock.timers.size, 0);
        app.state.visible = true;
        mount.unmount();
        assert.equal(clock.frames.size, 0);
    }
    const { window, app, root } = environment(t, `
        <section b-if="$data.visible" b-transition="'fade'"
            style="transition-property: opacity; transition-duration: 2s; transition-delay: 0s"></section>`,
    { visible: true });
    const clock = transitionClock(window);
    const mount = app.mount(root);
    clock.advanceFrames();
    const section = root.querySelector('section');
    app.state.visible = false;
    clock.advanceFrames();
    app.state.visible = true;
    assert.equal(root.querySelector('section'), section);
    assert.equal(root.querySelectorAll('section').length, 1);
    mount.unmount();
    assert.equal(clock.timers.size, 0);
    assert.equal(clock.frames.size, 0);
    assert.equal(section.isConnected, false);
});
