import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';
import { evaluate, execute, assign } from '@jnreis/briojs/csp';

const dist = name => readFileSync(new URL(`../dist/${name}`, import.meta.url), 'utf8');
const cspBundle = dist('brio.csp.min.js');
const cspDevBundle = dist('brio.csp.dev.min.js');
const evalPattern = /new Function|\bFunction\(|\beval\(/;

test('CSP bundles and the CSP module graph never compile code', () => {
    assert.doesNotMatch(cspBundle, evalPattern);
    assert.doesNotMatch(cspDevBundle, evalPattern);
    const seen = new Set();
    const visit = file => {
        if (seen.has(file)) return;
        seen.add(file);
        const source = dist(file);
        assert.doesNotMatch(source, evalPattern, file);
        for (const [, imported] of source.matchAll(/(?:from|import)\s*["']\.\/([^"']+)["']/g)) visit(imported);
    };
    visit('csp-entry.js');
    assert.ok(seen.size > 3);
    assert.match(dist('index.js') + dist('brio.min.js'), /new Function/, 'the standard build keeps its engine');
});

test('CSP expressions cover the practical grammar', () => {
    const scope = {
        $data: {
            count: 2, items: [1, 2, 3], user: { name: 'Ann' }, none: null,
            greet(name) { return `${this.user.name} greets ${name}`; },
        },
        $el: { id: 'box' },
    };
    const cases = [
        ['$data.count * 2 + 1', 5],
        ['`Twice: ${$data.count * 2}`', 'Twice: 4'],
        ['$data.items.length', 3],
        ['$data.items.indexOf(2)', 1],
        ['$data.items.includes(4) ? "yes" : "no"', 'no'],
        ['$data.user?.name', 'Ann'],
        ['$data.none?.deep.chain', undefined],
        ['$data.none?.()', undefined],
        ['$data.none ?? "fallback"', 'fallback'],
        ['$data.greet("Bo")', 'Ann greets Bo'],
        ['$data["us" + "er"].name', 'Ann'],
        ['2 ** 3 ** 2', 512],
        ['-$data.count + +"3"', 1],
        ['!$data.none && typeof $data.count === "number"', true],
        ['"count" in $data', true],
        ['0x1f + 0b11 + 1_000', 1034],
        ['"a\\tb"', 'a\tb'],
        ['Math.max(1, $data.count)', 2],
        ['JSON.stringify([1, "b"])', '[1,"b"]'],
        ['$el.id', 'box'],
        ['$data.count > 1 && $data.count < 3', true],
    ];
    for (const [source, expected] of cases) assert.equal(evaluate(source, scope), expected, source);
    assert.deepEqual(evaluate('{ a: 1, [`k${1}`]: 2, count: $data.count }', scope), { a: 1, k1: 2, count: 2 });
    assert.deepEqual(evaluate('[1, [2], $data.count]', scope), [1, [2], 2]);
    assert.equal(evaluate('$data.missing', scope), undefined);
    assert.equal(evaluate('$event', scope), undefined, 'context names are optional');

    execute('$data.count++; $data.count += 10; $data.user.name = "Bob"', scope);
    assert.equal(scope.$data.count, 13);
    assert.equal(scope.$data.user.name, 'Bob');
    execute('$data.none ??= 5; $data.flag ||= "on"', scope);
    assert.equal(scope.$data.none, 5);
    assert.equal(scope.$data.flag, 'on');
    assign('$data.user.name', scope, 'Cy');
    assert.equal(scope.$data.user.name, 'Cy');
});

test('CSP expressions refuse eval gadgets, globals, and unsupported syntax with clear errors', () => {
    const scope = { $data: { items: [], fn() {} }, $el: { id: 'x' } };
    for (const [source, message] of [
        ['$data.constructor', /cannot access "constructor"/],
        ['$data.items.map.constructor("return 1")()', /cannot access "constructor"/],
        ['$data["__proto__"]', /cannot access "__proto__"/],
        ['$data.items["const" + "ructor"]', /cannot access "constructor"/],
        ['$data.fn.prototype', /cannot access "prototype"/],
        ['window', /window is not defined/],
        ['globalThis', /globalThis is not defined/],
        ['Function', /Function is not defined/],
        ['fetch("/x")', /fetch is not defined/],
        ['x => x', /Arrow functions are not supported in the Brio CSP build/],
        ['new Date()', /"new" is not supported/],
        ['this', /"this" is not supported/],
        ['[...$data.items]', /Spread syntax is not supported/],
        ['$data.a, $data.b', /comma operator is not supported/],
        ['$data.fn`x`', /Tagged templates are not supported/],
    ]) assert.throws(() => evaluate(source, scope), message, source);
    assert.throws(() => execute('count = 1', scope), /Cannot assign to "count"/);
    assert.throws(() => execute('if ($data.x) $data.y = 1', scope), /"if" statements are not supported/);
    assert.throws(() => evaluate('$data.fn.bind.constructor', scope), /cannot access "constructor"/);
});

function cspWindow(t, html, { bundle = cspBundle, addons = [] } = {}) {
    const dom = new JSDOM(`<!doctype html><body>${html}</body>`, { runScripts: 'outside-only', url: 'https://example.test/' });
    const { window } = dom;
    t.after(() => window.close());
    // The test loads scripts with eval, standing in for <script> tags.
    window.eval(bundle);
    for (const addon of addons) window.eval(dist(`brio.${addon}.min.js`));
    return window;
}

/** Copies a value into the page's realm, since Brio state only observes that realm's plain objects. */
const local = (window, value) => window.JSON.parse(JSON.stringify(value));

/** Creates options in the page's realm, then makes any later attempt to compile code fail, as a strict CSP would. */
function lockdown(window, options = '({})') {
    const created = window.eval(options);
    const refuse = () => { throw new Error('CSP violation: code compilation attempted'); };
    window.Function.prototype.constructor = refuse;
    window.eval = refuse;
    window.Function = refuse;
    return created;
}

test('page markup stays inert while registered components activate with static props', t => {
    const window = cspWindow(t, `
        <main id="app" b-data="{ evil: 1 }" b-effect="window.hit = 'b-effect'">
            <p id="text">Count: \${$data.count}</p>
            <button id="raw" b-on-click="window.hit = 'b-on-click'" b-text="'replaced'">raw</button>
            <div b-if="false" id="if">kept</div>
            <ul><li b-for="item in [1, 2]" id="for">item</li></ul>
            <counter-box id="host" label="Clicks" start="3" b-prop-label="'evil'" b-on-tick="window.hit = 'host'"
                b-bind-class="'evil'" b-props="{ label: 'evil' }">
                <em id="slotted" b-text="'evil'">\${$data.count}</em>
            </counter-box>
        </main>`);
    const { brio } = window;
    const app = brio.createApp(lockdown(window, '({ state: () => ({ count: 1 }) })'));
    app.component('counter-box', {
        props: window.Object.assign(new window.Object(), { start: window.Number }),
        template: `<section>
            <h2 id="label" b-text="$props.label"></h2>
            <button id="inc" b-on-click="$data.n++; $emit('tick', $data.n)">\${$props.label}: \${$data.n}</button>
            <slot></slot>
        </section>`,
        setup: ({ $props }) => local(window, { n: $props.start }),
    });
    const ticks = [];
    window.document.addEventListener('tick', event => ticks.push(event.detail));
    app.mount('#app');
    brio.flush();
    const $ = selector => window.document.querySelector(selector);

    assert.equal($('#text').textContent, 'Count: ${$data.count}');
    assert.equal($('#raw').textContent, 'raw');
    $('#raw').click();
    assert.equal($('#if').textContent, 'kept');
    assert.equal(window.document.querySelectorAll('#for').length, 1);
    assert.equal($('#label').textContent, 'Clicks');
    assert.equal($('#inc').textContent, 'Clicks: 3');
    assert.equal($('#host').className, '');
    $('#inc').click();
    brio.flush();
    assert.equal($('#inc').textContent, 'Clicks: 4');
    assert.deepEqual(ticks, [4]);
    assert.equal($('#slotted').textContent, '${$data.count}', 'page slot content stays inert');
    assert.equal(window.hit, undefined);
    app.dispose();
});

test('component templates may use slots, nested components, and dynamic props', t => {
    const window = cspWindow(t, '<div id="app"><outer-card></outer-card></div>');
    const { brio } = window;
    const app = brio.createApp(lockdown(window));
    app.helper('$shout', text => `${text}!`);
    app.component('inner-tag', { template: '<b id="inner" b-text="$shout($props.label)"></b><slot></slot>' });
    app.component('outer-card', {
        template: `<inner-tag b-prop-label="$data.name"><i id="trusted" b-text="$data.name.toUpperCase()"></i></inner-tag>
            <ul><li b-for="item in $data.items" b-text="$for.item"></li></ul>
            <button id="rename" b-on-click="$data.name = 'Bo'">Rename</button>`,
        setup: () => local(window, { name: 'Ann', items: ['a', 'b'] }),
    });
    app.mount('#app');
    brio.flush();
    const doc = window.document;
    assert.equal(doc.querySelector('#inner').textContent, 'Ann!');
    assert.equal(doc.querySelector('#trusted').textContent, 'ANN');
    assert.deepEqual([...doc.querySelectorAll('li')].map(li => li.textContent), ['a', 'b']);
    doc.querySelector('#rename').click();
    brio.flush();
    assert.equal(doc.querySelector('#inner').textContent, 'Bo!');
    app.dispose();
});

test('markup injected before a remount, inserted, or hydrated from HTML stays inert', t => {
    const window = cspWindow(t, '<div id="app"><tag-box></tag-box><div id="dest"></div></div>');
    const { brio } = window;
    const app = brio.createApp(lockdown(window));
    app.component('tag-box', {
        template: `<span id="tag" b-text="'tag ' + $props.kind"></span>
            <div id="html" b-html.hydrate="$data.markup"></div>`,
        setup: () => window.Object.assign(new window.Object(), { markup: brio.trustedHTML('<p id="h1">${1 + 1}</p><p id="h2" b-text="\'x\'">h</p><mini-tag kind="nested"></mini-tag>') }),
    });
    app.component('mini-tag', { template: '<span id="tag" b-text="\'tag \' + $props.kind"></span>' });
    const handle = app.mount('#app');
    brio.flush();
    const doc = window.document;
    assert.equal(doc.querySelector('#h1').textContent, '${1 + 1}');
    assert.equal(doc.querySelector('#h2').textContent, 'h');
    assert.ok([...doc.querySelectorAll('#tag')].some(tag => tag.textContent === 'tag nested'),
        'registered components still mount from runtime HTML');

    app.insert('#dest', 'append', '<p id="i1">${2 + 2}</p><p id="i2" b-on-click="window.hit = 1" b-text="\'x\'">i</p>');
    brio.flush();
    assert.equal(doc.querySelector('#i1').textContent, '${2 + 2}');
    doc.querySelector('#i2').click();
    assert.equal(doc.querySelector('#i2').textContent, 'i');

    handle.unmount();
    doc.querySelector('#app').insertAdjacentHTML('beforeend',
        '<p id="late" b-text="\'injected\'" b-on-click="window.hit = 2">${3 + 3}</p>');
    app.mount('#app');
    brio.flush();
    assert.equal(doc.querySelector('#late').textContent, '${3 + 3}');
    doc.querySelector('#late').click();
    assert.equal(window.hit, undefined);
    app.dispose();
});

test('scoped slot content from the page stays inert while the outlet itself renders', t => {
    const window = cspWindow(t, `<div id="app"><list-box><b id="page-slot" b-text="$slot.value">raw \${$slot.value}</b></list-box></div>`);
    const { brio } = window;
    const app = brio.createApp(lockdown(window));
    app.component('list-box', {
        template: '<p id="own" b-text="$data.value"></p><slot b-slot="{ value: $data.value }"></slot>',
        setup: () => local(window, { value: 'secret' }),
    });
    app.mount('#app');
    brio.flush();
    const doc = window.document;
    assert.equal(doc.querySelector('#own').textContent, 'secret');
    assert.equal(doc.querySelector('#page-slot').textContent, 'raw ${$slot.value}');
    app.dispose();
});

test('the CSP build rejects b-script and templates read from the page', t => {
    const window = cspWindow(t, '<div id="app"><script-box></script-box></div><template id="tpl"><b>x</b></template>');
    const { brio } = window;
    const app = brio.createApp(lockdown(window));
    assert.throws(() => app.component('page-tpl', { template: '#tpl' }), /needs a template string in the Brio CSP build/);
    assert.throws(() => app.component('page-el', { template: window.document.querySelector('#tpl') }),
        /needs a template string in the Brio CSP build/);
    assert.throws(() => brio.createApp(window.JSON.parse('{"components": {"page-opt": {"template": "#tpl"}}}')),
        /needs a template string in the Brio CSP build/, 'createApp({ components }) is checked too');
    app.component('script-box', { template: '<script b-script>() => console.log(1)</script>' });
    assert.throws(() => app.mount('#app'), /b-script is not available in the Brio CSP build/);
    app.dispose();
});

test('page markup can use b-ignore, b-cloak, and the router outlet', t => {
    const window = cspWindow(t, `<div id="app" b-cloak>
        <nav b-ignore><home-page></home-page></nav>
        <main b-router-outlet></main></div>`, { addons: ['router'] });
    const { brio } = window;
    const app = brio.createApp(lockdown(window, '({ router: brio.createRouter([{ path: "/", component: "home-page" }]) })'));
    app.component('home-page', { template: '<h1 b-text="\'Home \' + $route.path"></h1>' });
    app.mount('#app');
    brio.flush();
    const doc = window.document;
    assert.equal(doc.querySelector('#app').hasAttribute('b-cloak'), false);
    assert.equal(doc.querySelector('nav home-page').innerHTML, '');
    assert.equal(doc.querySelector('main h1').textContent, 'Home /');
    app.dispose();
});

test('official add-on scripts run on the CSP core', t => {
    const addons = ['router', 'persistence', 'http', 'inputs', 'observers', 'step'];
    for (const addon of addons) assert.doesNotMatch(dist(`brio.${addon}.min.js`), evalPattern, addon);
    const window = cspWindow(t, '<div id="app"><form-box></form-box></div>', { addons });
    const { brio } = window;
    for (const name of ['createRouter', 'persist', 'http', 'createStepEngine', 'inputsPlugin', 'observersPlugin'])
        assert.ok(brio[name], name);
    const app = brio.createApp(lockdown(window));
    app.component('form-box', {
        template: `<input id="masked" b-mask="'(###) ###-####'" b-model="$data.phone">
            <p id="phone" b-text="$data.phone"></p>`,
        setup: () => local(window, { phone: '' }),
    });
    app.mount('#app');
    const input = window.document.querySelector('#masked');
    input.value = '5551234567';
    input.dispatchEvent(new window.Event('input', { bubbles: true }));
    brio.flush();
    assert.equal(input.value, '(555) 123-4567');
    app.dispose();
});

test('the CSP dev bundle includes devtools and the same engine', t => {
    const window = cspWindow(t, '<div id="app"><x-y></x-y></div>', { bundle: cspDevBundle });
    const { brio } = window;
    assert.equal(typeof brio.devtoolsPanel, 'function');
    const app = brio.createApp(lockdown(window));
    app.component('x-y', { template: '<b id="b" b-text="[1, 2].join(\'-\')"></b>' });
    app.mount('#app');
    brio.flush();
    assert.equal(window.document.querySelector('#b').textContent, '1-2');
    app.dispose();
});
