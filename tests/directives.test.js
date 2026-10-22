import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';
import { assign, evaluateFunction, execute, hydrateRoot, hydrateNode } from 'briojs';

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

test('b-text displays literal values; only the authored expression establishes dependencies', t => {
    const { app, root } = environment(t, `
        <p id="text" b-text="$data.text"></p>
        <p id="authored">\${$data.text}</p>
        <p id="direct" b-text="'Count: \${$data.count}'"></p>
        <p id="expression" b-text="'Count: ' + $data.count"></p>
        <p id="null" b-text="null"></p>`,
    { text: '<b>Count: ${$data.count}</b>', count: 1 });
    app.mount(root);
    assert.equal(root.querySelector('#text').textContent, '<b>Count: ${$data.count}</b>');
    assert.equal(root.querySelector('#text').children.length, 0);
    assert.equal(root.querySelector('#authored').textContent, '<b>Count: ${$data.count}</b>');
    assert.equal(root.querySelector('#null').textContent, '');
    app.state.count = 2;
    assert.equal(root.querySelector('#direct').textContent, 'Count: ${$data.count}');
    assert.equal(root.querySelector('#expression').textContent, 'Count: 2');
    assert.equal(root.querySelector('#text').textContent, '<b>Count: ${$data.count}</b>');
    app.state.text = 'Other: ${$data.other}';
    app.state.other = 7;
    assert.equal(root.querySelector('#text').textContent, 'Other: ${$data.other}');
    app.state.text = '${$data.missing}';
    assert.equal(root.querySelector('#text').textContent, '${$data.missing}');
    app.state.text = null;
    assert.equal(root.querySelector('#text').textContent, '');
    app.state.text = '${$data.count}';
    const oldText = root.querySelector('#text');
    app.unmount();
    app.state.count = 3;
    assert.equal(oldText.textContent, '${$data.count}');
});

test('b-html is inert by default; trusted b-html.hydrate activates content and disposes replacements', t => {
    const { app, root } = environment(t, `
        <div id="html" b-html.hydrate="trustedHTML($data.html)"></div>
        <div id="raw" b-html="$data.html"></div>`,
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

test('text results never execute interpolation; authored failures remain explicit', t => {
    const { app, root } = environment(t, '<p b-text="$data.text"></p><span>\${$data.nested}</span>',
        { text: '${$data.nested}', nested: '${notEvaluated}' });
    app.mount(root);
    assert.equal(root.querySelector('p').textContent, '${$data.nested}');
    assert.equal(root.querySelector('span').textContent, '${notEvaluated}');
    app.state.text = '${missingName}';
    assert.equal(root.querySelector('p').textContent, '${missingName}');
    const invalid = environment(t, '<p b-text="missingName"></p>');
    assert.throws(() => invalid.app.mount(invalid.root), /Brio expression failed/);
});

test('untrusted hydration fails before replacing content', t => {
    for (const markup of [
        '<div b-html.hydrate="null"></div>', '<div b-html.hydrate="\'&lt;b&gt;plain&lt;/b&gt;\'"></div>']) {
        const { app, root } = environment(t, markup);
        const original = root.innerHTML;
        assert.throws(() => app.mount(root), /requires a trustedHTML/);
        assert.equal(root.innerHTML, original);
    }
});

for (const distribution of ['brio.min.js', 'brio.dev.min.js']) {
    test(`${distribution}: hydrated content owns cleanup; invalid trust updates preserve live content`, t => {
        const source = readFileSync(new URL(`../dist/${distribution}`, import.meta.url), 'utf8');
        const { app, root, window } = environment(t, `
            <div id="inert" b-html="$data.markup"></div>
            <div id="active" b-html.hydrate="$data.markup"></div>`,
        { markup: '', count: 0, cleanups: 0 }, source);
        app.state.markup = window.brio.trustedHTML(
            '<button b-on-click="$data.count++" b-text="$data.count"></button>' +
            '<script b-script>({onCleanup,$data}) => { onCleanup(() => $data.cleanups++); }</script>');
        app.mount(root);
        const button = root.querySelector('#active button');
        assert.equal(root.querySelector('#inert button').textContent, '');
        assert.equal(root.querySelector('#inert script').hasAttribute('b-script'), true);
        button.click();
        assert.equal(button.textContent, '1');
        assert.throws(() => { app.state.markup = '<i>untrusted</i>'; }, /reactive effects failed/);
        assert.equal(root.querySelector('#active button'), button);
        assert.equal(app.state.cleanups, 0);
        button.click();
        assert.equal(button.textContent, '2');
        app.state.markup = window.brio.trustedHTML('<b b-text="$data.count"></b>');
        assert.equal(app.state.cleanups, 1);
        button.click();
        assert.equal(app.state.count, 2);
        app.state.count = 3;
        assert.equal(root.querySelector('#active b').textContent, '3');
        assert.equal(root.querySelector('#inert b').textContent, '');
        app.state.markup = window.brio.trustedHTML('');
        assert.equal(root.querySelector('#active').childNodes.length, 0);
    });
}

test('manual HTML/text page demonstrates explicit hydration and literal values', t => {
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
    assert.equal(document.querySelector('#literal-text').textContent, '<strong>Counter: ${$data.counter}</strong>');
    assert.equal(document.querySelector('#literal-text strong'), null);
    assert.equal(document.querySelector('#raw-html strong').textContent, 'Counter: ${$data.counter}');
    assert.equal(document.querySelector('#authored-text').textContent, '<strong>Counter: ${$data.counter}</strong>');
    document.querySelectorAll('button')[1].click();
    assert.equal(document.querySelector('#hydrated-html strong').textContent, 'Counter: 2');
    assert.equal(document.querySelector('#literal-text').textContent, '<strong>Counter: ${$data.counter}</strong>');
});

function environment(t, markup, state = {}, source = bundle) {
    const dom = new JSDOM(`<main id="app">${markup}</main>`, {
        runScripts: 'outside-only',
        pretendToBeVisual: true,
    });
    const { window } = dom;
    window.eval(source);
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
        <div b-teleport="['#portal', 'append']"><button on-click="$data.items.push(3)">teleported</button></div>`);
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
    outside.innerHTML = '<div b-teleport="[\'#target\', \'append\']">foreign</div>';
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
            <div b-teleport="['#portal', 'append']"><button on-click="$data.count++">teleport</button></div>
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

test('loop ancestry metadata is read-only and available through $for.$parent', t => {
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

test('keyed b-for reorders with the minimum number of row moves', t => {
    const ids = Array.from({ length: 200 }, (_, index) => index + 1);
    const { app, root, window } = environment(t, `
        <ul><li b-for="item in $data.items" b-key="$for.item" b-text="$for.item"></li></ul>`, { items: ids });
    app.mount(root);
    const list = root.querySelector('ul');
    const rows = () => [...list.children];
    const order = () => rows().map(row => Number(row.textContent));
    const original = new Map(rows().map(row => [row.textContent, row]));
    const insertBefore = window.Node.prototype.insertBefore;
    let moved = new Set();
    window.Node.prototype.insertBefore = function (node, reference) {
        if (node.nodeType === 1 && node.parentNode === this) moved.add(node.textContent);
        return insertBefore.call(this, node, reference);
    };
    t.after(() => { window.Node.prototype.insertBefore = insertBefore; });
    const reorder = update => {
        moved = new Set();
        window.brio.batch(() => update(app.state.items));
        return [...moved].map(Number).sort((a, b) => a - b);
    };

    assert.deepEqual(reorder(items => {
        [items[1], items[198]] = [items[198], items[1]];
    }), [2, 199], 'a swap moves only the two swapped rows');
    assert.deepEqual(order().slice(0, 3), [1, 199, 3]);
    assert.deepEqual(reorder(items => items.unshift(items.pop())), [200], 'moving the last row to the front moves one row');
    assert.deepEqual(reorder(items => items.push(items.shift())), [200], 'and back again');
    assert.deepEqual(reorder(items => items.splice(10, 0, ...items.splice(50, 3))), [51, 52, 53]);
    assert.equal(reorder(items => items.reverse()).length, 199, 'a reversal keeps one row in place');
    assert.deepEqual(order(), [...app.state.items]);
    assert.ok(rows().every(row => original.get(row.textContent) === row), 'every row element is reused');
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

test('conditional validation rejects unsupported modifiers, conflicting modes and modified else branches', t => {
    const invalid = [
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
    invalid.push(
        ['<div b-if.hide="false" b-for="n in 2"></div>', /concrete branch/],
        ['<template b-if.hide="true" b-template></template>', /concrete branch/],
        ['<div b-if.hide="true"></div><div b-else b-for="n in 2"></div>', /concrete branch/],
    );
    for (const mode of ['hide', 'detach']) {
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
                <div b-teleport="['#portal', 'append']"><em b-text="$provided.label"></em></div>
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
            <section id="teleported" b-if.${mode}="$data.visible" b-teleport="['#portal', 'append']">remote</section>
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
        `b-mask="brio.moneyMask($data.options)" b-model="$data.amount"`,
        `b-model="$data.amount" b-mask="brio.moneyMask($data.options)"`,
    ]) {
        const { app, root, window } = environment(t, `<input ${attributes}>`, {
            amount: '', options: { thousands: '.', decimal: ',', precision: 3 },
        });
        window.eval(readFileSync(new URL('../dist/brio.money-mask.min.js', import.meta.url), 'utf8'));
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
        ['b-mask="brio.moneyMask()"', '1,234.56'],
        [`b-mask="brio.moneyMask({ precision: 0 })"`, '123,456'],
    ]) {
        const { app, root, window } = environment(t, `<input ${attributes}>`);
        window.eval(readFileSync(new URL('../dist/brio.money-mask.min.js', import.meta.url), 'utf8'));
        app.mount(root);
        const input = root.querySelector('input');
        input.value = '123456';
        input.dispatchEvent(new window.Event('input'));
        assert.equal(input.value, value);
    }
    const { app, root, window } = environment(t, `<input b-mask="brio.moneyMask({ precision: -1 })">`);
    window.eval(readFileSync(new URL('../dist/brio.money-mask.min.js', import.meta.url), 'utf8'));
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
        `b-mask="brio.moneyMask()" b-model="$data.amount"`,
        `b-model="$data.amount" b-mask="brio.moneyMask()"`,
    ]) {
        const { app, root, window } = environment(t, `<input ${attributes}>`, { amount: '' });
        window.eval(readFileSync(new URL('../dist/brio.money-mask.min.js', import.meta.url), 'utf8'));
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
    const { app, root, window } = environment(t, `<input b-mask="brio.moneyMask({ thousands: ' ', decimal: ',', precision: 0 })">`);
    window.eval(readFileSync(new URL('../dist/brio.money-mask.min.js', import.meta.url), 'utf8'));
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

test('b-bind serializes ARIA booleans as enumerated strings', t => {
    const { app, root } = environment(t, `
        <button id="toggle" b-bind-aria-pressed="$data.on" b-bind-aria-expanded="$data.on"
                b-bind-aria-invalid="$data.missing ?? null" b-bind-hidden="!$data.on"></button>`, { on: false });
    app.mount(root);
    const button = root.querySelector('#toggle');

    assert.equal(button.getAttribute('aria-pressed'), 'false', 'false is a meaningful ARIA state, not removal');
    assert.equal(button.getAttribute('aria-expanded'), 'false');
    assert.equal(button.hasAttribute('aria-invalid'), false, 'null still removes ARIA attributes');
    assert.equal(button.hidden, true, 'non-ARIA booleans keep property/attribute semantics');
    app.state.on = true;
    assert.equal(button.getAttribute('aria-pressed'), 'true', 'true is not serialized as an empty string');
    assert.equal(button.hidden, false);
    app.state.missing = 'spelling';
    assert.equal(button.getAttribute('aria-invalid'), 'spelling', 'token values pass through');
});

test('b-model.number checks radios and checkbox groups that hold numbers', t => {
    const { app, root } = environment(t, `
        <input type="radio" name="step" value="1" b-model.number="$data.step">
        <input type="radio" name="step" value="5" b-model.number="$data.step">
        <input type="checkbox" value="1" b-model.number="$data.ids">
        <input type="checkbox" value="2" b-model.number="$data.ids">`, { step: 5, ids: [2] });
    app.mount(root);
    const [one, five] = root.querySelectorAll('[type="radio"]');
    const [first, second] = root.querySelectorAll('[type="checkbox"]');

    assert.deepEqual([one.checked, five.checked, first.checked, second.checked], [false, true, false, true]);
    one.click();
    first.click();
    assert.equal(app.state.step, 1);
    assert.deepEqual([...app.state.ids], [2, 1], 'clicking adds the number once');
    assert.deepEqual([one.checked, five.checked, first.checked, second.checked], [true, false, true, true],
        'clicked controls stay checked');
    second.click();
    assert.deepEqual([...app.state.ids], [1]);
    assert.equal(second.checked, false);
});

test('b-bind-value on select selects options rendered by b-for and survives option changes', async t => {
    const { app, root, window } = environment(t, `
        <select b-bind-value="$data.size" b-on-change="$data.size = $event.target.value">
            <option b-for="size in $data.sizes" b-key="$for.size" b-bind-value="$for.size" b-text="$for.size"></option>
        </select>`, { size: 'L', sizes: ['S', 'M', 'L'] });
    app.mount(root);
    const select = root.querySelector('select');
    assert.equal(select.value, 'L', 'applied after the options render, not to an empty select');
    app.state.size = 'M';
    assert.equal(select.value, 'M');
    app.state.sizes.unshift('XS');
    await new Promise(resolve => window.setTimeout(resolve, 0));
    assert.equal(select.value, 'M', 'new options do not reset the bound selection');
});

test('b-model on select applies its value synchronously to options rendered by b-for', t => {
    const { app, root } = environment(t, `
        <div b-if="$data.visible">
            <select id="size" b-model="$data.size">
                <option value="">Choose</option>
                <option b-for="size in $data.sizes" b-key="$for.size" b-bind-value="$for.size" b-text="$for.size"></option>
            </select>
        </div>
        <select id="many" multiple b-model="$data.many">
            <option b-for="size in $data.sizes" b-key="$for.size" b-bind-value="$for.size" b-text="$for.size"></option>
        </select>`, { visible: true, size: 'L', many: ['S', 'L'], sizes: ['S', 'M', 'L'] });
    app.mount(root);
    const select = () => root.querySelector('#size');
    const original = select();

    assert.equal(select().value, 'L', 'no microtask gap before the bound option is selected');
    assert.deepEqual([...root.querySelector('#many').selectedOptions].map(option => option.value), ['S', 'L']);
    app.state.size = 'M';
    assert.equal(select().value, 'M');
    assert.equal(select(), original, 'model reads do not subscribe the enclosing branch');
    app.state.visible = false;
    app.state.size = 'S';
    app.state.visible = true;
    assert.equal(select().value, 'S', 'a re-rendered branch restores the selection');
});

test('event handlers are batched and flush() exposes the updated DOM inside the handler', t => {
    const { app, root, window } = environment(t, `
        <section b-data="{ open: false, seen: [] }">
            <button id="batched" b-on-click="$data.open = true; $data.seen.push(Boolean($ref.panel))">Batched</button>
            <button id="flushed" b-on-click="$data.open = true; flush(); $data.seen.push(Boolean($ref.panel)); $ref.panel.focus()">Flushed</button>
            <button id="close" b-on-click="$data.open = false">Close</button>
            <div tabindex="-1" b-ref="panel" b-if="$data.open">Panel</div>
            <output b-text="$data.seen.join()"></output>
        </section>`);
    app.mount(root);

    root.querySelector('#batched').click();
    assert.equal(root.querySelector('output').textContent, 'false', 'writes are batched until the handler returns');
    root.querySelector('#close').click();
    root.querySelector('#flushed').click();
    assert.equal(root.querySelector('output').textContent, 'false,true');
    assert.equal(window.document.activeElement?.textContent, 'Panel');
    assert.equal(typeof window.brio.flush, 'function', 'browser global exposes flush');
});

test('b-bind restores SVG attribute casing, binds getter-only properties as attributes, and resolves .prop casing', t => {
    const { app, root } = environment(t, `
        <svg id="chart" b-bind-viewBox="'0 0 ' + $data.width + ' 10'" b-bind-preserveAspectRatio="'none'">
            <circle id="dot" cy="5" b-bind-r="$data.radius" b-bind-cx="$data.radius"></circle>
        </svg>
        <input id="field" b-bind-form="$data.form" b-bind-list="'choices'">
        <div id="focusable" b-bind-tabIndex.prop="$data.tab"></div>`, { width: 40, radius: 3, form: 'signup', tab: 2 });
    app.mount(root);
    const svg = root.querySelector('#chart');
    const dot = root.querySelector('#dot');
    const field = root.querySelector('#field');

    assert.equal(svg.getAttribute('viewBox'), '0 0 40 10', 'the parser lowercases b-bind-viewBox; Brio restores the SVG name');
    assert.equal(svg.getAttribute('preserveAspectRatio'), 'none');
    assert.equal(svg.hasAttribute('viewbox'), false, 'no inert lowercase attribute is written');
    assert.equal(dot.getAttribute('r'), '3');
    assert.equal(field.getAttribute('form'), 'signup', 'getter-only input.form is bound as an attribute');
    assert.equal(field.getAttribute('list'), 'choices');
    assert.equal(root.querySelector('#focusable').tabIndex, 2, '.prop resolves tabindex to the tabIndex property');

    app.state.width = 80;
    app.state.radius = 6;
    app.state.form = null;
    app.state.tab = 5;
    assert.equal(svg.getAttribute('viewBox'), '0 0 80 10');
    assert.equal(dot.getAttribute('cx'), '6');
    assert.equal(field.hasAttribute('form'), false);
    assert.equal(root.querySelector('#focusable').getAttribute('tabindex'), '5');
});

test('b-bind surfaces failing property setters instead of silently writing an attribute', t => {
    const { app, root } = environment(t, `<input id="upload" type="file" b-bind-value="'C:/fake.txt'">`);
    assert.throws(() => app.mount(root), error => {
        assert.match(error.message, /Unable to bind property "value" on <input>: .*\(at <input#upload>\)/);
        assert.equal(error.element.id, 'upload');
        return true;
    });
});

test('b-cloak is removed as each element hydrates and restored with the root on unmount', t => {
    const { app, root, window } = environment(t, `
        <section id="panel" b-cloak>
            <p id="hidden" b-cloak b-if="$data.show">Shown later</p>
            <ul><li b-for="item in $data.items" b-cloak b-text="$for.item"></li></ul>
            <div b-ignore><span id="ignored" b-cloak></span></div>
        </section>`, { show: false, items: ['a', 'b'] });
    root.setAttribute('b-cloak', '');
    const handle = app.mount(root);
    assert.equal(root.hasAttribute('b-cloak'), false, 'the mount root is revealed');
    assert.equal(root.querySelector('#panel').hasAttribute('b-cloak'), false);
    assert.equal(root.querySelectorAll('li[b-cloak]').length, 0, 'rows hydrate without the attribute');
    assert.equal(root.querySelector('#ignored').hasAttribute('b-cloak'), true, 'b-ignore content is never hydrated');
    app.state.show = true;
    assert.equal(root.querySelector('#hidden').hasAttribute('b-cloak'), false, 'conditional branches hydrate without it');
    app.unmount();
    assert.equal(root.hasAttribute('b-cloak'), true, 'unmount restores the original attributes');
    assert.ok(handle && window);
});

test('error messages name the expression, directive, element, enclosing component, and original error', t => {
    const dom = new JSDOM(`
        <main id="app">
            <section><user-card></user-card></section>
            <b class="total" b-text="$data.order.total.toFixed(2)"></b>
            <i b-bind-title="$data.order.label.trim()"></i>
            <button id="pay" b-on-click="$data.gateway.charge()">Pay</button>
        </main>`, { runScripts: 'outside-only' });
    const { window } = dom;
    window.eval(bundle);
    t.after(() => window.close());
    const errors = [];
    window.addEventListener('error', event => { errors.push(event.error); event.preventDefault(); });
    const app = window.eval(`brio.createApp({
        state: () => ({ order: { total: 2, label: ' A ' }, gateway: {} }),
        components: { 'user-card': { template: '<p class="name" b-text="$data.user.profile.name"></p>', setup: () => ({ user: { profile: {} } }) } },
    })`);
    t.after(() => app.dispose());
    app.mount('#app');

    window.document.querySelector('#pay').click();
    assert.equal(errors.length, 1);
    assert.equal(errors[0].message,
        `Brio event expression failed: "$data.gateway.charge()" in b-on-click on <button#pay>: TypeError: $data.gateway.charge is not a function`);
    assert.equal(errors[0].directive, 'b-on-click');
    assert.equal(errors[0].element.id, 'pay');
    assert.equal(errors[0].cause.name, 'TypeError');

    assert.throws(() => { app.state.order = null; }, error => {
        assert.match(error.message, /^One or more reactive effects failed\.\n  - Error: Brio expression failed: "\$data\.order\.total\.toFixed\(2\)" in b-text on <b\.total>: TypeError: .*\n  - Error: Brio expression failed: "\$data\.order\.label\.trim\(\)" in b-bind-title on <i>: TypeError: /);
        assert.equal(error.errors.length, 2);
        assert.equal(error.errors[0].element.className, 'total');
        return true;
    });

    const broken = new JSDOM(`<main id="app"><section><user-card></user-card></section><p b-ref=""></p></main>`, { runScripts: 'outside-only' }).window;
    t.after(() => broken.close());
    broken.eval(bundle);
    assert.throws(() => broken.eval(`brio.createApp({ components: { 'user-card': {
        template: '<span class="name" b-text="$data.user.name"></span>', setup: () => ({}) } } }).mount('#app')`),
    error => {
        assert.match(error.message, /in b-text on <span\.name> inside <user-card>: TypeError: Cannot read properties of undefined \(reading 'name'\)$/);
        return true;
    });
    const structural = new JSDOM(`<main id="app"><p class="note" b-ref=""></p></main>`, { runScripts: 'outside-only' }).window;
    t.after(() => structural.close());
    structural.eval(bundle);
    assert.throws(() => structural.eval(`brio.createApp().mount('#app')`),
        error => error.message === 'b-ref requires a nonempty literal name. (at <p.note>)' && error.element.className === 'note');
    assert.throws(() => structural.eval(`brio.createApp().mount(Object.assign(document.createElement('div'), { innerHTML: '<span b-text="$data.(x"></span>' }))`),
        error => error.name === 'SyntaxError' && /^Invalid Brio expression "\$data\.\(x" in b-text on <span>: SyntaxError: /.test(error.message));
});

test('manual cloak page hides templates until its delayed bootstrap mounts them', async t => {
    const markup = readFileSync(new URL('./directives/cloak.html', import.meta.url), 'utf8');
    const bootstrap = [...markup.matchAll(/<script>([\s\S]*?)<\/script>/g)].at(-1)[1];
    const dom = new JSDOM(markup.replace(/<script\b[\s\S]*?<\/script>/g, ''), {
        runScripts: 'outside-only',
        pretendToBeVisual: true,
        url: 'http://localhost/tests/directives/cloak.html?delay=20',
    });
    const { window } = dom;
    const { document } = window;
    t.after(() => {
        try { window.teardown(); } finally { window.close(); }
    });
    window.eval(bundle);
    window.eval(`${bootstrap}\nwindow.teardown = () => { cloakObserver.disconnect(); app.dispose(); };`);
    const cloaked = () => document.querySelectorAll('[b-cloak]').length;
    assert.equal(cloaked(), 7);
    assert.equal(document.getElementById('cloaked').textContent, '7');
    assert.equal(document.getElementById('status').dataset.phase, 'waiting');
    assert.ok(document.querySelector('#demo [b-cloak]').textContent.includes('${$data.user.name}'));

    await new Promise(resolve => setTimeout(resolve, 60));
    assert.equal(document.getElementById('status').dataset.phase, 'mounted');
    assert.deepEqual([...document.querySelectorAll('[b-cloak]')].map(element => element.id), ['ignored-cloak']);
    assert.equal(document.getElementById('cloaked').textContent, '1');
    assert.ok(document.querySelector('#demo .stage + .stage').textContent.includes('Signed in as Ada Lovelace (Pro)'));
    const rows = () => [...document.querySelectorAll('[data-cloak-row]')];
    assert.deepEqual(rows().map(row => row.textContent), ['1. Review pull request', '2. Write release notes', '3. Ship 1.0']);

    const buttons = [...document.querySelectorAll('#demo button')];
    buttons.find(button => button.textContent === 'Add task').click();
    assert.equal(rows().length, 4);
    assert.ok(rows().every(row => !row.hasAttribute('b-cloak')));
    assert.ok(document.querySelector('#demo').textContent.includes('More than three tasks: 4'));
    assert.equal(cloaked(), 1);

    const widget = document.getElementById('widget');
    widget.querySelector('button').click();
    assert.ok(widget.textContent.includes('1 clicks'));
    document.getElementById('widget-unmount').click();
    assert.ok(widget.hasAttribute('b-cloak'));
    assert.ok(widget.textContent.includes('${$data.clicks}'));
    assert.equal(document.getElementById('widget-mount').disabled, false);
    document.getElementById('widget-mount').click();
    assert.equal(widget.hasAttribute('b-cloak'), false);
    assert.ok(widget.textContent.includes('0 clicks'));
});

test('a <template> with Brio directives renders in place as if it had b-template', t => {
    const render = (markup, state = {}) => {
        const { app, root } = environment(t, markup, state);
        app.mount(root);
        return { app, root, html: () => root.innerHTML.replace(/<!--\/?brio:range-->/g, '') };
    };
    const state = { items: [{ id: 1, name: 'a' }, { id: 2, name: 'b' }], on: true, n: 3 };

    const loop = render('<ul><template b-for="item in $data.items" b-key="$for.item.id"><li b-text="$for.item.name"></li><li>-</li></template></ul>', state);
    assert.equal(loop.html(), '<ul><li>a</li><li>-</li><li>b</li><li>-</li></ul>');
    loop.app.state.items.reverse();
    assert.equal(loop.html(), '<ul><li>b</li><li>-</li><li>a</li><li>-</li></ul>');

    const chain = render('<template b-if="$data.n > 5"><b>big</b></template><template b-else-if="$data.on"><i>on</i></template><template b-else><u>off</u></template>', state);
    assert.equal(chain.html(), '<i>on</i>');
    chain.app.state.on = false;
    assert.equal(chain.html(), '<u>off</u>');

    assert.equal(render('<template b-data="{ label: \'local\' }"><p>${$data.label}</p></template>').html(), '<p>local</p>');
    assert.equal(render('<template b-id="[\'f\']"><label b-bind-for="$id.f">L</label></template>').html(), '<label for="brio-1">L</label>');
    assert.equal(render('<template b-template><p>explicit</p></template>').html(), '<p>explicit</p>', 'explicit b-template is still accepted');

    const inner = render('<template b-if="$data.on"><template id="stash"><p b-text="nope"></p></template></template>', state);
    assert.equal(inner.html(), '<template id="stash"><p b-text="nope"></p></template>', 'directive-free templates stay inert, even inside fragments');
    assert.equal(render('<template id="row" slot="x" class="c"><p b-text="nope"></p></template>').html(),
        '<template id="row" slot="x" class="c"><p b-text="nope"></p></template>');
    assert.equal(render('<template b-ignore b-if="nope"><p>${nope}</p></template>').html(),
        '<template b-ignore="" b-if="nope"><p>${nope}</p></template>', 'b-ignore keeps a template inert');
    assert.equal(render('<template b-cloak><p>x</p></template>').html(), '<template><p>x</p></template>', 'b-cloak alone does not expand');
});

test('fragment wrappers reject directives that need a concrete element instead of dropping them', t => {
    for (const [markup, message] of [
        ['<template b-bind-class="\'x\'"><i></i></template>', /b-bind-class needs a concrete element, but <template> renders its contents in place/],
        ['<template b-if="true" b-on-click="1"><i></i></template>', /b-on-click needs a concrete element/],
        ['<template b-for="x in 2" b-text="\'t\'"><i></i></template>', /b-text needs a concrete element/],
        ['<template b-show="false"><i></i></template>', /b-show needs a concrete element/],
        ['<div b-template b-bind-class="\'x\'"><i></i></div>', /b-bind-class needs a concrete element, but b-template renders/],
        ['<template b-if.hide="true"><i></i></template>', /b-if.hide requires a concrete branch element/],
        ['<template b-ref="row"><i></i></template>', /b-ref requires a concrete element/],
    ]) {
        const { app, root } = environment(t, markup);
        assert.throws(() => app.mount(root), message, markup);
    }
});

test('component slots inside implicit template fragments are filled', t => {
    const { app, root } = environment(t, '<info-box><b slot="extra">projected</b></info-box>', { open: true });
    app.component('info-box', { template: '<template b-if="$data.$parent.open"><p><slot name="extra">fallback</slot></p></template>' });
    app.mount(root);
    assert.equal(root.querySelector('info-box').innerHTML.replace(/<!--\/?brio:range-->/g, ''), '<p><b slot="extra">projected</b></p>');
});

test('reference errors suggest $for, $data and $props paths for bare names', t => {
    const cases = [
        ['<ul><li b-for="item in $data.items" b-text="item"></li></ul>', /item is not defined\. Loop variables are read through \$for: use \$for\.item\./],
        ['<div b-for="group in $data.groups"><i b-for="x in $for.group.items" b-text="group"></i></div>', /use \$for\.\$parent\.group\./],
        ['<p b-text="items"></p>', /items is not defined\. Use \$data\.items\./],
        ['<p b-text="missing"></p>', /missing is not defined$/],
    ];
    for (const [markup, message] of cases) {
        const { app, root } = environment(t, markup, { items: [1], groups: [{ items: [1] }], count: 0 });
        try {
            app.mount(root);
            assert.fail(`expected ${markup} to throw`);
        } catch (error) {
            assert.match(error.message, message);
        }
    }
    const { app, root } = environment(t, '<name-tag b-bind-label="\'Ada\'"></name-tag>');
    app.component('name-tag', { template: '<b b-text="label"></b>' });
    assert.throws(() => app.mount(root), /label is not defined\. Use \$props\.label\./);
    assert.throws(() => execute('count++', { $data: { count: 0 } }, undefined, 'b-on-click'),
        /count is not defined\. Use \$data\.count\./);
    assert.throws(() => assign('total', { $data: { total: 0 } }, 1, 'b-model'),
        /total is not defined\. Use \$data\.total\./);
});

test('component hosts bind native attributes with b-attr-* and evaluate bound props once', t => {
    const { app, root, window } = environment(t, `
        <status-pill class="pill" b-attr-class="{ busy: $data.busy }" b-attr-data-testid="'pill-' + $data.id"
            b-attr-aria-busy="$data.busy" b-attr-style="{ '--hue': $data.hue }"
            b-bind-label="$data.read()"></status-pill>
        <status-pill b-bind-label="'second'"></status-pill>`, { busy: false, id: 'a', hue: 10 });
    let reads = 0;
    app.state.read = () => { reads++; return app.state.id; };
    let parses = 0;
    const createElement = window.document.createElement;
    window.document.createElement = function (name, ...rest) {
        if (name === 'template') parses++;
        return createElement.call(this, name, ...rest);
    };
    app.component('status-pill', { template: '<span b-text="$props.label"></span>' });
    app.mount(root);
    window.document.createElement = createElement;
    const [first, second] = root.querySelectorAll('status-pill');
    assert.equal(reads, 1, 'the bound prop expression ran once at mount');
    assert.equal(first.textContent, 'a');
    assert.equal(second.textContent, 'second');
    assert.equal(first.className, 'pill');
    assert.equal(first.getAttribute('data-testid'), 'pill-a');
    assert.equal(first.getAttribute('aria-busy'), 'false');
    assert.equal(first.style.getPropertyValue('--hue'), '10');
    assert.ok(!first.hasAttribute('b-attr-class'));
    app.state.busy = true;
    app.state.id = 'b';
    assert.equal(first.className, 'pill busy');
    assert.equal(first.getAttribute('aria-busy'), 'true');
    assert.equal(first.getAttribute('data-testid'), 'pill-b');
    assert.equal(first.textContent, 'b');
    assert.equal(reads, 2);
    assert.equal(parses, 1, 'the template markup was parsed per definition, not per instance');
    assert.ok(window.document.contains(first));
});

test('component templates resolve "#id" selectors and <template> elements; props declarations coerce static attributes', t => {
    const { window, app, root } = environment(t, `
        <fav-button compact count="3" label="Likes" title=""></fav-button>
        <fav-button count="x" compact="false"></fav-button>
        <plain-card></plain-card>`);
    const page = window.document.createElement('template');
    page.id = 'tpl-fav';
    page.innerHTML = '<b b-text="[$props.compact, $props.count, $props.label, $props.title, $props.missing].join(\'|\')"></b>';
    window.document.body.append(page);
    const element = window.document.createElement('template');
    element.innerHTML = '<i>plain</i>';
    app.component('fav-button', { template: '#tpl-fav', props: { compact: window.Boolean, count: window.Number, missing: window.Boolean } });
    app.component('plain-card', { template: element });
    app.mount(root);
    const [first, second] = root.querySelectorAll('b');
    assert.equal(first.textContent, 'true|3|Likes||false', 'valueless Boolean is true, Number coerces, undeclared stay strings');
    assert.equal(second.textContent, 'false|NaN|||false', '"false" is false for declared Boolean props');
    assert.equal(root.querySelector('i').textContent, 'plain');
    assert.throws(() => app.component('bad-props', { template: '<b></b>', props: { x: window.Date } }), /Boolean, Number, or String/);
    assert.throws(() => app.component('bad-template', { template: window.document.createElement('div') }), /template/);
});

test('a missing "#id" component template is a clear error', t => {
    const { app, root } = environment(t, '<missing-tpl></missing-tpl>');
    app.component('missing-tpl', { template: '#nope' });
    assert.throws(() => app.mount(root), /<missing-tpl> template "#nope" does not match a <template> element/);
});

test('.outside ignores the click that created it and closes on later outside clicks', t => {
    const { window, app, root } = environment(t, `
        <button id="toggle" b-on-click="$data.open = !$data.open"></button>
        <button id="plain"></button>
        <div id="menu" b-if="$data.open" b-on-click.outside="$data.open = false"><button id="inside"></button></div>
        <p id="elsewhere"></p>`, { open: false });
    app.mount(root);
    const click = id => {
        root.querySelector(`#${id}`).click();
        window.brio.flush();
    };
    click('toggle');
    assert.ok(root.querySelector('#menu'), 'the opening click does not count as an outside click');
    click('inside');
    assert.ok(root.querySelector('#menu'));
    click('elsewhere');
    assert.equal(root.querySelector('#menu'), null);
    click('toggle');
    click('toggle');
    assert.equal(root.querySelector('#menu'), null, 'the toggle still closes it');

    // Opened by a plain listener rather than a Brio handler.
    root.querySelector('#plain').addEventListener('click', () => {
        app.state.open = true;
        window.brio.flush();
    });
    click('plain');
    assert.ok(root.querySelector('#menu'));
    click('elsewhere');
    assert.equal(root.querySelector('#menu'), null);
});

test('key and system modifiers filter keyboard and mouse events; unknown modifiers throw', t => {
    const { window, app, root } = environment(t, `
        <input b-on-keydown.enter.prevent="$data.log.push('enter')"
               b-on-keydown.esc="$data.log.push('esc')"
               b-on-keydown.up.down="$data.log.push($event.key)"
               b-on-keydown.delete="$data.log.push('delete')"
               b-on-keydown.space.prevent="$data.log.push('space')"
               b-on-keydown.ctrl.enter="$data.log.push('ctrl+enter')">
        <button b-on-click.shift="$data.log.push('shift-click')"></button>`, { log: [] });
    app.mount(root);
    const input = root.querySelector('input');
    const key = (key, options = {}) => {
        const event = new window.KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...options });
        input.dispatchEvent(event);
        return event.defaultPrevented;
    };
    assert.equal(key('Enter'), true, '.prevent applies only after the key filter matches');
    assert.equal(key('a'), false);
    key('Escape');
    key('ArrowUp');
    key('ArrowDown');
    key('Backspace');
    key('Delete');
    assert.equal(key(' '), true, '.space matches the " " key');
    assert.equal(key('Spacebar'), false);
    key('Enter', { ctrlKey: true });
    root.querySelector('button').click();
    root.querySelector('button').dispatchEvent(new window.MouseEvent('click', { bubbles: true, shiftKey: true }));
    assert.deepEqual([...app.state.log], ['enter', 'esc', 'ArrowUp', 'ArrowDown', 'delete', 'delete', 'space', 'enter', 'ctrl+enter', 'shift-click']);

    const typo = environment(t, '<button b-on-click.prevnt="$data.x = 1"></button>');
    assert.throws(() => typo.app.mount(typo.root), /Unknown event modifier "\.prevnt" on "b-on-click"/);
});

test('component host listeners honor event modifiers', t => {
    const { window, app, root } = environment(t, `
        <section b-on-remove="$data.log.push('bubbled')">
            <row-actions b-on-remove.stop.once="$data.log.push('host:' + $event.detail)"
                         b-on-keydown.enter="$data.log.push('host-enter')"></row-actions>
        </section>`, { log: [] });
    app.component('row-actions', {
        template: '<button b-on-click="$emit(\'remove\', 7)">Delete</button>',
    });
    app.mount(root);
    const button = root.querySelector('button');
    button.click();
    button.click();
    button.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    button.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'x', bubbles: true }));
    assert.deepEqual([...app.state.log], ['host:7', 'bubbled', 'host-enter'],
        '.stop keeps the first emit from bubbling; .once lets the second bubble past');
    const typo = environment(t, '<row-x b-on-remove.sotp="0"></row-x>');
    typo.app.component('row-x', { template: '<b></b>' });
    assert.throws(() => typo.app.mount(typo.root), /Unknown event modifier "\.sotp"/);
});

test('.once waits for an event that passes key and target filters', t => {
    const { window, app, root } = environment(t, `
        <input b-on-keydown.enter.once="$data.log.push('enter')">
        <div b-on-click.self.once="$data.log.push('self')"><span>child</span></div>`, { log: [] });
    app.mount(root);
    const input = root.querySelector('input');
    const press = key => input.dispatchEvent(new window.KeyboardEvent('keydown', { key, bubbles: true }));
    press('a');
    press('Enter');
    press('Enter');
    root.querySelector('span').click();
    root.querySelector('div').click();
    root.querySelector('div').click();
    assert.deepEqual([...app.state.log], ['enter', 'self']);
});

function stubRowLayout(window) {
    const reads = { count: 0 };
    window.HTMLElement.prototype.getBoundingClientRect = function () {
        reads.count++;
        const index = this.parentNode ? [...this.parentNode.children].indexOf(this) : 0;
        return { left: 0, top: index * 20, right: 100, bottom: index * 20 + 20, width: 100, height: 20 };
    };
    return reads;
}

test('keyed b-for reorders keep focus and caret inside moved rows', t => {
    const { window, app, root } = environment(t, `
        <ul><li b-for="item in $data.items" b-key="$for.item"><input b-bind-value="$for.item"></li></ul>`,
    { items: ['alpha', 'beta', 'gamma'] });
    app.mount(root);
    const input = root.querySelectorAll('input')[1];
    input.focus();
    input.setSelectionRange(1, 3);
    app.state.items = ['gamma', 'alpha', 'beta'];
    app.state.items.reverse();
    window.brio.flush?.();
    assert.deepEqual([...root.querySelectorAll('input')].map(field => field.value), ['beta', 'alpha', 'gamma']);
    assert.equal(window.document.activeElement, input);
    assert.deepEqual([input.selectionStart, input.selectionEnd], [1, 3]);
});

test('keyed b-for prefers native moveBefore and falls back when it throws', t => {
    const { window, app, root } = environment(t, `
        <ul><li b-for="item in $data.items" b-key="$for.item" b-text="$for.item"></li></ul>`, { items: ['a', 'b', 'c'] });
    let calls = 0;
    let fail = false;
    window.Element.prototype.moveBefore = function (node, reference) {
        calls++;
        if (fail) throw new window.DOMException('nope', 'HierarchyRequestError');
        this.insertBefore(node, reference);
    };
    app.mount(root);
    app.state.items = ['c', 'b', 'a'];
    assert.ok(calls > 0);
    assert.equal(root.querySelector('ul').textContent, 'cba');
    fail = true;
    app.state.items = ['a', 'c', 'b'];
    assert.equal(root.querySelector('ul').textContent, 'acb');
    delete window.Element.prototype.moveBefore;
});

test('b-for rows with b-transition animate position changes with a -move class', t => {
    const { window, app, root } = environment(t, `
        <ul><li b-for="item in $data.items" b-key="$for.item" b-text="$for.item" b-transition="'slide'"
            style="transition-property: transform; transition-duration: 0.3s"></li></ul>`, { items: ['a', 'b', 'c'] });
    const clock = transitionClock(window);
    stubRowLayout(window);
    app.mount(root);
    clock.advanceFrames();
    const [a, b, c] = root.querySelectorAll('li');
    const transforms = new Map();
    for (const row of [a, b, c]) {
        const style = row.style;
        let value = '';
        Object.defineProperty(style, 'transform', {
            configurable: true,
            get: () => value,
            set: next => {
                value = next;
                if (next) transforms.set(row.textContent, next);
            },
        });
    }
    app.state.items = ['c', 'b', 'a', 'd'];
    assert.equal(root.querySelector('ul').textContent, 'cbad');
    assert.equal(transforms.get('a'), 'translate(0px, -40px)');
    assert.equal(transforms.get('c'), 'translate(0px, 40px)');
    assert.equal(transforms.has('b'), false);
    assert.ok(a.classList.contains('slide-move') && c.classList.contains('slide-move'));
    assert.equal(b.classList.contains('slide-move'), false);
    const d = root.querySelectorAll('li')[3];
    assert.equal(d.classList.contains('slide-move'), false);
    assert.equal(a.style.transform, '');
    assert.equal(a.style.transitionDuration, '0.3s');
    transitionEvent(window, a, 'transitionend', 'transform');
    assert.equal(a.classList.contains('slide-move'), false);
    assert.ok(c.classList.contains('slide-move'));
    for (const timer of [...clock.timers.values()]) timer.callback();
    assert.equal(c.classList.contains('slide-move'), false);
});

test('b-for without b-transition never reads layout', t => {
    const { window, app, root } = environment(t, `
        <ul><li b-for="item in $data.items" b-key="$for.item" b-text="$for.item"></li></ul>`, { items: ['a', 'b', 'c'] });
    const reads = stubRowLayout(window);
    app.mount(root);
    app.state.items = ['c', 'b', 'a'];
    assert.equal(root.querySelector('ul').textContent, 'cba');
    assert.equal(reads.count, 0);
});

test('component hosts accept b-transition and animate keyed moves', t => {
    const { window, app, root } = environment(t, `
        <ul><item-row b-for="item in $data.items" b-key="$for.item" b-bind-label="$for.item"
            b-transition="'slide'" style="transition-property: transform; transition-duration: 0.2s"></item-row></ul>`, { items: ['a', 'b'] });
    app.component('item-row', { template: '<span b-text="$props.label"></span>' });
    const clock = transitionClock(window);
    stubRowLayout(window);
    app.mount(root);
    clock.advanceFrames();
    const [a, b] = root.querySelectorAll('item-row');
    assert.equal(a.textContent, 'a');
    app.state.items = ['b', 'a'];
    assert.equal(root.querySelector('ul').textContent, 'ba');
    assert.ok(a.classList.contains('slide-move') && b.classList.contains('slide-move'));
});

test('class bindings change only their own names and keep classes added elsewhere', t => {
    const { app, root } = environment(t, `<p class="base" b-bind-class="{ active: $data.on, 'is-big': $data.big }"></p>`,
        { on: true, big: false });
    app.mount(root);
    const p = root.querySelector('p');
    assert.equal(p.className, 'base active');
    p.classList.add('slide-move');
    app.state.big = true;
    assert.deepEqual([...p.classList].sort(), ['active', 'base', 'is-big', 'slide-move']);
    app.state.on = false;
    p.classList.remove('slide-move');
    assert.equal(p.className, 'base is-big');
});
