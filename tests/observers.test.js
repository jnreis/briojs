import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';

const bundle = readFileSync(new URL('../dist/brio.min.js', import.meta.url), 'utf8');

function setup(t, markup) {
    const dom = new JSDOM(`<main>${markup}</main>`, { runScripts: 'outside-only' });
    const { window } = dom;
    const observers = { intersection: [], mutation: [], resize: [] };
    for (const [name, key] of [['IntersectionObserver', 'intersection'], ['MutationObserver', 'mutation'], ['ResizeObserver', 'resize']]) {
        window[name] = class {
            constructor(callback, options) {
                Object.assign(this, { callback, options, disconnected: false });
                observers[key].push(this);
            }
            observe(target, options) { Object.assign(this, { target, observeOptions: options }); }
            disconnect() { this.disconnected = true; }
        };
    }
    const timers = new Map();
    let timerId = 0;
    window.setTimeout = (fn, delay) => { timers.set(++timerId, { fn, delay }); return timerId; };
    window.clearTimeout = id => timers.delete(id);
    window.eval(bundle);
    const app = window.brio.createApp({ state: () => window.eval('({ logs: [] })') });
    t.after(() => { try { app.dispose(); } finally { window.close(); } });
    const flush = () => {
        const tasks = [...timers.values()];
        timers.clear();
        tasks.forEach(task => task.fn());
    };
    return { window, app, observers, timers, flush, mount: () => app.mount('main') };
}

test('intersection forwards selector/node/document/viewport roots, margins and scalar/array thresholds', t => {
    const { app, observers, window, mount } = setup(t, `
        <div id="root"><i b-options="{ 'on-enter': { root: '#root', rootMargin: '20px', threshold: [0, 0.5, 1] } }"
            on-enter="$data.logs.push($entry.intersectionRatio)"></i></div>
        <i b-options="{ 'on-exit': { root: document, threshold: 0.5 } }" on-exit="$data.logs.push('exit')"></i>
        <i b-options="{ 'on-enter': { root: $el.parentElement } }" on-enter="$data.logs.push('node')"></i>
        <i on-enter="$data.logs.push('viewport')"></i>`);
    mount();
    const [selector, documentRoot, nodeRoot, viewport] = observers.intersection;
    assert.equal(selector.options.root, window.document.querySelector('#root'));
    assert.equal(selector.options.rootMargin, '20px');
    assert.deepEqual(Array.from(selector.options.threshold), [0, 0.5, 1]);
    assert.equal(documentRoot.options.root, window.document);
    assert.equal(documentRoot.options.threshold, 0.5);
    assert.equal(nodeRoot.options.root, window.document.querySelector('main'));
    assert.equal(viewport.options.root, null);
    selector.callback([{ isIntersecting: false }, { isIntersecting: true, intersectionRatio: 0.5 }]);
    documentRoot.callback([{ isIntersecting: true }, { isIntersecting: false }]);
    assert.deepEqual(Array.from(app.state.logs), [0.5, 'exit']);
});

test('intersection once/debounce respects full-name overrides, dot precedence and disposal', t => {
    const { app, observers, timers, flush, mount } = setup(t, `
        <i b-options="{ 'on-enter': { threshold: 0, debounce: 300 }, 'on-enter.once.debounce': { threshold: 1 } }"
           on-enter.once.debounce="$data.logs.push($entry.intersectionRatio)"></i>`);
    const handle = mount();
    const observer = observers.intersection[0];
    assert.equal(observer.options.threshold, 1);
    observer.callback([{ isIntersecting: true, intersectionRatio: 0.5 }]);
    observer.callback([{ isIntersecting: true, intersectionRatio: 1 }]);
    assert.equal(timers.size, 1);
    assert.equal([...timers.values()][0].delay, 100);
    flush();
    assert.deepEqual(Array.from(app.state.logs), [1]);
    assert.equal(observer.disconnected, true);
    observer.callback([{ isIntersecting: true, intersectionRatio: 1 }]);
    assert.equal(timers.size, 0);
    handle.unmount();
});

test('mutation options forward target, subtree, filters and old values and debounce accumulates records', t => {
    const { app, window, observers, timers, flush, mount } = setup(t, `
        <div id="target"></div>
        <i b-options="{ 'on-attrs': { target: '#target', subtree: false, attributeOldValue: true, attributeFilter: ['title'], debounce: 25 } }"
           on-attrs="$data.logs.push($mutations.length)"></i>
        <i b-options="{ 'on-text': { target: $el.previousElementSibling.previousElementSibling, characterDataOldValue: true } }"
           on-text.subtree="$data.logs.push($mutations[0].oldValue)"></i>
        <i on-addednodes="$data.logs.push('added')"></i>
        <i on-removednodes="$data.logs.push('removed')"></i>`);
    const handle = mount();
    const [attrs, text, added, removed] = observers.mutation;
    assert.equal(attrs.target, window.document.querySelector('#target'));
    assert.equal(attrs.observeOptions.subtree, false);
    assert.equal(attrs.observeOptions.attributeOldValue, true);
    assert.deepEqual(Array.from(attrs.observeOptions.attributeFilter), ['title']);
    assert.equal(text.target, attrs.target);
    assert.equal(text.observeOptions.characterDataOldValue, true);
    assert.equal(text.observeOptions.subtree, true);
    assert.equal(added.observeOptions.subtree, true);
    attrs.callback([{ type: 'attributes' }]);
    attrs.callback([{ type: 'attributes' }]);
    assert.equal([...timers.values()][0].delay, 25);
    flush();
    assert.equal(app.state.logs[0], 2);
    text.callback([{ type: 'characterData', oldValue: 'old' }]);
    added.callback([{ addedNodes: [1], removedNodes: [] }]);
    removed.callback([{ addedNodes: [], removedNodes: [1] }]);
    assert.deepEqual(Array.from(app.state.logs), [2, 'old', 'added', 'removed']);
    attrs.callback([{ type: 'attributes' }]);
    handle.unmount();
    assert.equal(timers.size, 0);
    assert.ok(observers.mutation.every(observer => observer.disconnected));
});

test('resize forwards every box, document target, selected measurements and debounce', t => {
    const { window, app, observers, flush, timers, mount } = setup(t, `
        <i on-resize="$data.logs.push($size)"></i>
        <i b-options="{ 'on-resize': { box: 'border-box' } }" on-resize.document="$data.logs.push($size)"></i>
        <i b-options="{ 'on-resize': { box: 'device-pixel-content-box', document: true, debounce: 30 } }"
           on-resize="$data.logs.push($size)"></i>`);
    const handle = mount();
    const [content, border, device] = observers.resize;
    assert.equal(content.observeOptions.box, 'content-box');
    assert.equal(border.observeOptions.box, 'border-box');
    assert.equal(device.observeOptions.box, 'device-pixel-content-box');
    assert.equal(border.target, window.document.documentElement);
    assert.equal(device.target, border.target);
    const entry = target => ({
        target, contentRect: { width: 10, height: 20 },
        contentBoxSize: [{ inlineSize: 10, blockSize: 20 }],
        borderBoxSize: [{ inlineSize: 14, blockSize: 24 }],
        devicePixelContentBoxSize: [{ inlineSize: 20, blockSize: 40 }],
    });
    for (const observer of observers.resize) observer.callback([entry(observer.target)]);
    assert.equal([...timers.values()][0].delay, 30);
    flush();
    assert.equal(JSON.stringify(app.state.logs), '[{"width":10,"height":20},{"width":14,"height":24},{"width":20,"height":40}]');
    border.target.style.writingMode = 'vertical-rl';
    border.callback([entry(border.target)]);
    assert.equal(JSON.stringify(app.state.logs.at(-1)), '{"width":24,"height":14}');
    assert.throws(() => border.callback([{ target: border.target, contentRect: { width: 1, height: 2 } }]), /requested border-box/);
    device.callback([entry(device.target)]);
    handle.unmount();
    assert.equal(timers.size, 0);
    assert.ok(observers.resize.every(observer => observer.disconnected));
});

test('invalid observer settings throw during mounting without leaving an owned root', t => {
    for (const [directive, options] of [
        ['on-enter', "{ root: '#missing' }"], ['on-enter', '{ threshold: 2 }'],
        ['on-enter', '{ rootMargin: 1 }'], ['on-attrs', '{ target: null }'],
        ['on-attrs', '{ subtree: 1 }'], ['on-attrs', '{ attributeFilter: [1] }'],
        ['on-resize', "{ box: 'bad' }"], ['on-resize', '{ document: 1 }'],
        ['on-resize', '{ debounce: -1 }'],
    ]) {
        const { app, mount } = setup(t, `<i b-options="{ '${directive}': ${options} }" ${directive}=""></i>`);
        assert.throws(mount);
        assert.equal(app.roots.size, 0);
    }
});

test('native mutation observers distinguish direct/subtree targets, filtered attributes and character data', async t => {
    const dom = new JSDOM(`<main>
        <div id="target" b-ignore><span title="old">original</span></div>
        <i b-options="{ 'on-attrs': { target: '#target', subtree: false, attributeFilter: ['title'] } }"
           on-attrs="$data.direct += $mutations.length"></i>
        <i b-options="{ 'on-attrs': { target: '#target', subtree: true, attributeFilter: ['title'], attributeOldValue: true } }"
           on-attrs="$data.attributes.push(...$mutations.map(record => record.oldValue))"></i>
        <i b-options="{ 'on-text': { target: '#target', subtree: true, characterDataOldValue: true } }"
           on-text="$data.text.push(...$mutations.map(record => record.oldValue))"></i>
    </main>`, { runScripts: 'outside-only' });
    const { window } = dom;
    window.eval(bundle);
    const app = window.brio.createApp({
        state: () => window.eval('({ direct: 0, attributes: [], text: [] })'),
    });
    t.after(() => { try { app.dispose(); } finally { window.close(); } });
    app.mount('main');
    const target = window.document.querySelector('#target');
    const child = target.querySelector('span');
    target.setAttribute('title', 'direct');
    child.setAttribute('title', 'new');
    child.setAttribute('data-excluded', 'ignored');
    child.firstChild.data = 'updated';
    await new Promise(resolve => window.setTimeout(resolve, 0));
    assert.equal(app.state.direct, 1);
    assert.deepEqual(Array.from(app.state.attributes), [null, 'old']);
    assert.deepEqual(Array.from(app.state.text), ['original']);
    app.unmount();
    child.setAttribute('title', 'after unmount');
    await new Promise(resolve => window.setTimeout(resolve, 0));
    assert.equal(app.state.attributes.length, 2);
});

test('pending debounced intersection callbacks are cancelled by scope disposal', t => {
    const { app, observers, timers, flush, mount } = setup(t,
        '<i b-options="{ \'on-enter\': { debounce: 25, once: true } }" on-enter="$data.logs.push(1)"></i>');
    const handle = mount();
    observers.intersection[0].callback([{ isIntersecting: true }]);
    assert.equal(timers.size, 1);
    handle.unmount();
    flush();
    assert.equal(app.state.logs.length, 0);
    assert.equal(observers.intersection[0].disconnected, true);
});

for (const name of ['intersection', 'mutation', 'resize']) test(`${name} manual page mounts its actual observer scenarios`, t => {
    const markup = readFileSync(new URL(`./directives/${name}.html`, import.meta.url), 'utf8');
    const { window, app, observers } = setup(t, '');
    window.document.body.innerHTML = markup;
    app.mount('body');
    assert.ok(observers[name].length >= 4);
});
