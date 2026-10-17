import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';
import { moneyMask } from 'briojs/money-mask';
import { http } from 'briojs/http';
import { validate } from 'briojs/forms';
import { createStepEngine } from 'briojs/step';
import * as main from 'briojs';

function environment(t, bundle, markup, setup = '({})', money = false) {
    const dom = new JSDOM(`<main>${markup}</main>`, { runScripts: 'outside-only', pretendToBeVisual: true });
    const { window } = dom;
    window.eval(readFileSync(new URL(`../dist/${bundle}`, import.meta.url), 'utf8'));
    if (money) window.eval(readFileSync(new URL('../dist/brio.money-mask.min.js', import.meta.url), 'utf8'));
    const app = window.brio.createApp({ state: () => window.eval(setup) });
    const failures = [];
    window.addEventListener('error', event => { failures.push(event.error); event.preventDefault(); });
    t.after(() => { try { app.dispose(); } finally { window.close(); } });
    const root = window.document.querySelector('main');
    const enter = (value, start = value.length, end = start, inputType = 'insertText', isComposing = false) => {
        const input = root.querySelector('input,textarea');
        input.focus();
        input.value = value;
        input.setSelectionRange(start, end);
        input.dispatchEvent(new window.InputEvent('input', { bubbles: true, inputType, isComposing }));
        return input;
    };
    return { window, app, root, enter, failures };
}

for (const bundle of ['brio.min.js', 'brio.dev.min.js']) {
    test(`${bundle}: Unicode patterns match code points and preserve native caret offsets`, t => {
        const { app, root, enter, failures } = environment(t, bundle, '<input b-mask="$data.pattern">',
            '({pattern:"aa-##-AA-*"})');
        app.mount(root);
        // Unicode Nd includes full-width, Arabic-Indic and astral decimal digits.
        const input = enter('é中١２Ж7😀');
        assert.equal(input.value, 'é中-١２-Ж7-😀');
        assert.equal(input.selectionStart, input.value.length);
        app.state.pattern = 'a#A*';
        assert.equal(enter('𐐀𝟘é😀').value, '𐐀𝟘é😀');
        assert.equal(input.selectionStart, 7);
        app.state.pattern = 'aa';
        assert.equal(enter('e\u0301中').value, 'e中');
        app.state.pattern = '*';
        assert.equal(enter('\n😀').value, '😀'); // Text input removes newline natively.
        app.state.pattern = '9##';
        assert.equal(enter('12').value, '912');
        app.state.pattern = '\\A\\a\\#\\*\\\\##';
        assert.equal(enter('12').value, 'Aa#*\\12');
        assert.equal(enter('Aa#*\\12').value, 'Aa#*\\12');
        assert.throws(() => { app.state.pattern = 'abc\\'; }, /reactive effects failed/);
        assert.deepEqual(failures, []);
    });

    test(`${bundle}: custom formatters support reactive factories, caret results, IME and cleanup`, t => {
        const { app, root, window, enter, failures } = environment(t, bundle,
            '<input b-model="$data.value" b-mask="$data.make($data.upper)">',
            `({value:"",upper:true,calls:0,lastType:undefined,make(upper) {
                return ({value,selectionStart,selectionEnd,inputType}) => {
                    this.calls++; this.lastType=inputType;
                    return { value: upper ? value.toUpperCase() : value.toLowerCase(),
                        selectionStart, selectionEnd };
                };
            }})`);
        app.mount(root);
        const input = enter('abc', 1, 2, 'insertFromPaste');
        assert.equal(input.value, 'ABC');
        assert.equal(app.state.value, 'ABC');
        assert.equal(input.selectionStart, 1);
        assert.equal(input.selectionEnd, 2);
        assert.equal(app.state.lastType, 'insertFromPaste');
        app.state.upper = false;
        assert.equal(input.value, 'abc');
        input.dispatchEvent(new window.CompositionEvent('compositionstart'));
        const calls = app.state.calls;
        enter('HELLO', 5, 5, 'insertCompositionText', true);
        assert.equal(input.value, 'HELLO');
        assert.equal(app.state.calls, calls);
        input.dispatchEvent(new window.CompositionEvent('compositionend'));
        assert.equal(input.value, 'hello');
        assert.equal(app.state.value, 'hello');
        app.unmount();
        input.value = 'DISPOSED';
        input.dispatchEvent(new window.Event('input'));
        assert.equal(input.value, 'DISPOSED');
        assert.deepEqual(failures, []);
    });

    test(`${bundle}: string-returning formatters clamp selection and never recursively format synthetic input`, t => {
        const { app, root, enter, failures } = environment(t, bundle,
            '<input b-mask="$data.format" b-model="$data.value">',
            '({value:"",format:({value}) => value ? value.slice(0,3) + "!" : ""})');
        app.mount(root);
        const input = enter('abcdef');
        assert.equal(input.value, 'abc!');
        assert.equal(app.state.value, 'abc!');
        assert.equal(input.selectionStart, 4);
        assert.deepEqual(failures, []);
    });

    test(`${bundle}: wildcard masks accept newline code points in textareas`, t => {
        const { app, root, enter, failures } = environment(t, bundle, '<textarea b-mask="\'***\'"></textarea>');
        app.mount(root);
        const input = enter('😀\n中');
        assert.equal(input.value, '😀\n中');
        assert.equal(input.selectionStart, 4);
        assert.deepEqual(failures, []);
    });

    test(`${bundle}: unsupported configuration and invalid formatter results fail explicitly`, t => {
        for (const [directive, setup] of [
            ['b-mask.foo="{}"', '({})'],
            ['b-mask="null"', '({})'],
            ['b-mask="({value}) => Promise.resolve(value)"', '({})'],
            ['b-mask="() => ({value:1})"', '({})'],
            ['b-mask="() => ({value:\'x\',selectionStart:-1})"', '({})'],
            ['b-mask="() => ({value:\'x\',selectionEnd:3})"', '({})'],
            ['b-mask="() => ({value:\'x\',selectionEnd:0.5})"', '({})'],
        ]) {
            const { app, root } = environment(t, bundle, `<input ${directive}>`, setup);
            assert.throws(() => app.mount(root), /b-mask|Mask formatter/);
        }
    });
}

test('optional npm entries retain main exports without requiring browser globals', () => {
    assert.equal(http, main.http);
    assert.equal(validate, main.validate);
    assert.equal(createStepEngine, main.createStepEngine);
    assert.equal(moneyMask, main.moneyMask);
    const context = value => ({
        value, selectionStart: value.length, selectionEnd: value.length,
        selectionDirection: 'none', inputType: 'insertText',
    });
    const options = { precision: 3, thousands: '.', decimal: ',' };
    const mask = moneyMask(options);
    options.precision = 0;
    assert.equal(mask(context('-1234567')).value, '-1.234,567');
    assert.equal(moneyMask()(context('')).value, '');
    for (const options of [null, [], { precision: -1 }, { precision: 101 },
        { thousands: 1 }, { decimal: '' }, { thousands: '.', decimal: '.' }])
        assert.throws(() => moneyMask(options));
});

test('public plugin subpaths and formatter contract are typed', () => {
    execFileSync(fileURLToPath(new URL('../node_modules/.bin/tsc', import.meta.url)), [
        '--noEmit', '--strict', '--target', 'ES2022', '--module', 'ESNext',
        '--moduleResolution', 'bundler', 'tests/types/plugins.ts',
    ], { cwd: fileURLToPath(new URL('..', import.meta.url)), encoding: 'utf8', stdio: 'pipe' });
});
