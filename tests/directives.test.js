import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';
import { evaluateFunction } from 'briojs';

const bundle = readFileSync(new URL('../dist/brio.min.js', import.meta.url), 'utf8');

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

function transitionEvent(window, element, type, propertyName) {
    const event = new window.Event(type, { bubbles: true });
    Object.defineProperties(event, {
        propertyName: { value: propertyName },
        pseudoElement: { value: '' },
    });
    element.dispatchEvent(event);
}

test('b-if recreates local b-data, disposes listeners/effects, and preserves parent state', t => {
    const { app, root } = environment(t, `
        <section b-if="$data.visible" b-data="{ count: 0 }">
            <button on-click="$data.count++; $parent.$data.total++">Increment</button>
            <span b-text="$data.count"></span>
            <em b-text="$parent.$data.total"></em>
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

test('explicit loop values update keyed rows and nested loop contexts without losing reactivity', t => {
    const { app, root, window } = environment(t, `
        <section b-for="item, index in $data.items" b-key="$for.item.id">
            <span b-text="$for.index + ':' + $for.item.name"></span>
            <button on-click="const suffix = '!'; $for.item.name += suffix;"></button>
            <div b-data="{ local: 0 }">
                <em b-text="$for.item.name + ':' + $parent.$data.label"></em>
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
        <slot></slot><p b-text="$parent.$data.label"></p>`,
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

test('b-show preserves the same state and reactive node in detach and display modes', t => {
    for (const modifier of ['', '.display']) {
        const { app, root } = environment(t, `
            <section b-show${modifier}="$parent.$data.visible" b-data="{ count: 0 }">
                <button on-click="$data.count++"></button><span b-text="$data.count"></span>
                <em b-text="$parent.$data.total"></em>
            </section>`, { visible: true, total: 0 });
        app.mount(root);
        const section = root.querySelector('section');
        section.querySelector('button').click();
        app.state.visible = false;
        assert.equal(section.isConnected, Boolean(modifier));
        if (modifier) assert.equal(section.style.display, 'none');
        app.state.total = 5;
        assert.equal(section.querySelector('em').textContent, '5');
        app.state.visible = true;
        assert.equal(root.querySelector('section'), section);
        assert.equal(section.querySelector('span').textContent, '1');
    }
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

test('b-script receives ctx, lexical helpers, destructuring, async closures, and the script element', async t => {
    const { app, root } = environment(t, `
        <div b-data="{ count: 0, status: '' }">
            <script b-script>
                async ({ $data, $parent, $el }) => {
                    $data.count = 1;
                    $parent.$data.parentCount++;
                    $data.tag = $el.tagName;
                    await new Promise(resolve => setTimeout(resolve, 5));
                    $data.status = 'done';
                }
            </script>
            <span b-text="$data.count"></span><em b-text="$data.status"></em>
        </div>
        <script b-script>
            (ctx) => {
                $data.lexical = true;
                ctx.$data.direct = true;
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
    const ctx = { $data: { count: 0 }, $event: { type: 'test' } };
    for (const source of [
        'function (ctx) { ctx.$data.count++; }',
        'function named(ctx) { ctx.$data.count++; }',
        '(ctx) => { ctx.$data.count++; }',
        'async (ctx) => { await Promise.resolve(); ctx.$data.count++; }',
        'async function named({ $data }) { $data.count++; }',
        '() => { $data.count++; }',
    ]) await evaluateFunction(source, ctx)(ctx);
    assert.equal(ctx.$data.count, 6);
    assert.equal(evaluateFunction('(ctx) => ctx.$event.type', ctx)(ctx), 'test');
    assert.throws(() => evaluateFunction('42', ctx), /function expression/);
});

test('script failures run once, do not fall back, and unmarked scripts are left untouched', t => {
    const { app, root } = environment(t, `
        <script>window.shouldNotRun = true; \${notAnInterpolation}</script>
        <script script>() => { $data.ran = true; }</script>`);
    app.mount(root);
    assert.equal(app.state.ran, undefined);
    const failed = environment(t, `<script b-script>
        (ctx) => { ctx.$data.calls++; throw new Error('failure'); }
    </script>`, { calls: 0 });
    assert.throws(() => failed.app.mount(failed.root), /b-script execution failed/);
    assert.equal(failed.app.state.calls, 1);
});

test('leave waits for every own property, ignores child events, and dehydrates b-if immediately', t => {
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
    assert.equal(app.state.count, 0);
    app.state.count = 4;
    assert.equal(section.querySelector('span').textContent, '0');
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
});

test('show transitions reverse safely and re-enter in both modes and attribute orders', t => {
    for (const modifier of ['', '.display']) {
        for (const attributes of [
            `b-transition="'fade'" b-show${modifier}="$data.visible"`,
            `b-show${modifier}="$data.visible" b-transition="'fade'"`,
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
            assert.equal(section.isConnected, Boolean(modifier));
            if (modifier) assert.equal(section.style.display, 'none');
            app.state.visible = true;
            assert.equal(root.querySelector('section'), section);
        }
    }
});

test('a cancelled transition can be replaced before completion is committed', t => {
    const { window, app, root } = environment(t, `
        <section b-show="$data.visible" b-transition="'fade'"
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

test('initially hidden show nodes do not animate; no-CSS leave completes and unmount cancels pending work', t => {
    for (const modifier of ['', '.display']) {
        const { window, app, root } = environment(t, `<section b-transition="'fade'" b-show${modifier}="$data.visible"></section>`,
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
    app.state.visible = false;
    clock.advanceFrames();
    app.state.visible = true;
    const fresh = root.querySelector('section');
    const exiting = root.querySelectorAll('section')[1];
    assert.notEqual(fresh, exiting);
    mount.unmount();
    assert.equal(clock.timers.size, 0);
    assert.equal(clock.frames.size, 0);
    assert.equal(exiting.isConnected, false);
});
