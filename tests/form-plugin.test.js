import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';
import { inputsPlugin as esmInputsPlugin } from '@jnreis/briojs/inputs';
import { inputsPlugin as mainInputsPlugin } from '@jnreis/briojs';

const markup = `
<form b-form="{ rules: $data.rules, submit: $data.save }" novalidate>
    <input name="email">
    <input name="age" type="number" value="30">
    <input name="terms" type="checkbox">
    <input name="tags" type="checkbox" value="a" checked><input name="tags" type="checkbox" value="b">
    <input name="size" type="radio" value="s"><input name="size" type="radio" value="m" checked>
    <select name="colors" multiple><option selected>red</option><option>blue</option></select>
    <p class="email-error" b-text="$form.error('email')"></p>
    <p class="state" b-text="[$form.valid, $form.submitting, $form.submitted].join()"></p>
    <button>Send</button>
</form>`;

function environment(t, html = markup) {
    const dom = new JSDOM(`<main>${html}</main>`, { runScripts: 'outside-only', pretendToBeVisual: true });
    const { window } = dom;
    window.eval(readFileSync(new URL('../dist/brio.min.js', import.meta.url), 'utf8'));
    window.eval(readFileSync(new URL('../dist/brio.inputs.min.js', import.meta.url), 'utf8'));
    const saved = [];
    window.saved = saved;
    const app = window.eval(`brio.createApp({ state: () => ({
        rules: { email: [{ name: 'required', message: 'Email is required' }, { name: 'email', message: 'Enter a valid email' }] },
        save: async values => { saved.push(values); await new Promise(resolve => setTimeout(resolve, 5)); },
    }) })`);
    t.after(() => { try { app.dispose(); } finally { window.close(); } });
    const root = window.document.querySelector('main');
    const type = (name, value) => {
        const input = root.querySelector(`[name="${name}"]`);
        input.value = value;
        input.dispatchEvent(new window.Event('input', { bubbles: true }));
        return input;
    };
    const submit = () => root.querySelector('form').dispatchEvent(new window.SubmitEvent('submit', { bubbles: true, cancelable: true }));
    return { window, app, root, type, submit, saved, brio: window.brio };
}

test('inputsPlugin is exported from the inputs subpath and the main entry, and attaches b-mask and b-form', () => {
    assert.equal(esmInputsPlugin, mainInputsPlugin);
    assert.equal(esmInputsPlugin.name, 'brio-inputs');
    assert.deepEqual(esmInputsPlugin.directives.map(directive => directive.name), ['b-mask', 'b-form']);
});

test('b-form reads typed values and validates them reactively', t => {
    const { app, root, type, brio } = environment(t);
    app.mount(root);
    const form = root.querySelector('form');
    assert.equal(form.hasAttribute('b-form'), false);
    const text = () => root.querySelector('.state').textContent;
    assert.equal(text(), 'false,false,false');
    type('email', 'ada@example.com');
    brio.flush();
    assert.equal(text(), 'true,false,false');
    type('email', 'not an email');
    brio.flush();
    assert.equal(text(), 'false,false,false');
});

test('b-form shows errors after touch or submit and sets aria-invalid', t => {
    const { app, root, type, submit, brio, saved } = environment(t);
    app.mount(root);
    const email = root.querySelector('[name="email"]');
    const error = root.querySelector('.email-error');
    assert.equal(error.textContent, '');
    type('email', 'nope');
    brio.flush();
    assert.equal(error.textContent, '', 'untouched fields stay quiet');
    email.dispatchEvent(new root.ownerDocument.defaultView.FocusEvent('focusout', { bubbles: true }));
    brio.flush();
    assert.equal(error.textContent, 'Enter a valid email');
    assert.equal(email.getAttribute('aria-invalid'), 'true');
    type('email', '');
    assert.equal(submit(), false, 'invalid submissions are prevented');
    brio.flush();
    assert.equal(error.textContent, 'Email is required');
    assert.equal(root.ownerDocument.activeElement, email);
    assert.deepEqual(saved, []);
});

test('b-form calls submit with typed values and tracks submitting', async t => {
    const { app, root, type, submit, brio, saved } = environment(t);
    app.mount(root);
    type('email', 'ada@example.com');
    assert.equal(submit(), false, 'handled submissions prevent navigation');
    brio.flush();
    assert.equal(root.querySelector('.state').textContent, 'true,true,true');
    assert.equal(submit(), false, 'a second submit while pending is ignored');
    await new Promise(resolve => setTimeout(resolve, 20));
    brio.flush();
    assert.equal(root.querySelector('.state').textContent, 'true,false,true');
    assert.equal(saved.length, 1);
    assert.deepEqual(JSON.parse(JSON.stringify(saved[0])), {
        email: 'ada@example.com', age: 30, terms: false, tags: ['a'], size: 'm', colors: ['red'],
    });
});

test('b-form stores submit failures and resets with the form', async t => {
    const { app, root, type, submit, brio } = environment(t,
        '<form b-form="{ submit: () => Promise.reject(new Error(\'offline\')) }"><input name="q"><output b-text="$form.submitError?.message ?? \'\'"></output></form>');
    app.mount(root);
    type('q', 'x');
    submit();
    await new Promise(resolve => setTimeout(resolve, 0));
    brio.flush();
    assert.equal(root.querySelector('output').textContent, 'offline');
    root.querySelector('form').reset();
    await new Promise(resolve => setTimeout(resolve, 0));
    brio.flush();
    assert.equal(root.querySelector('output').textContent, '');
    assert.equal(root.querySelector('[name="q"]').value, '');
});

test('b-form without a submit function lets the browser submit natively', t => {
    const { app, root, submit } = environment(t, '<form b-form=""><input name="q"></form>');
    app.mount(root);
    assert.equal(submit(), true);
});

test('b-form only works on forms', t => {
    const { app, root } = environment(t, '<div b-form=""></div>');
    assert.throws(() => app.mount(root), /b-form only works on a <form> element, not <div>/);
});
