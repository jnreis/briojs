import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { JSDOM } from 'jsdom';

const runtime = readFileSync(new URL('../dist/brio.min.js', import.meta.url), 'utf8');
const helper = readFileSync(new URL('../site/public/integrations/widgets.js', import.meta.url), 'utf8');
const widget = count => `<section data-brio-counter data-start="${count}"><output b-text="$data.count">${count}</output><button b-on-click="$data.count++">Add</button></section>`;

function setup(t, html) {
    const dom = new JSDOM(html, { runScripts: 'outside-only' });
    const { window } = dom;
    window.eval(runtime);
    window.eval(helper.replace('export function', 'function') + '\nwindow.widgets = createWidgetManager(brio.createApp);');
    t.after(() => { window.widgets.disposeWithin(window.document); window.close(); });
    return { window, document: window.document, manager: window.widgets };
}

test('integration helper mounts each root once with independent state and restores markup on disposal', t => {
    const { document, manager, window } = setup(t, `<main>${widget(3)}${widget(9)}</main>`);
    manager.mountWithin(document);
    manager.mountWithin(document);
    const roots = document.querySelectorAll('section');
    roots[0].querySelector('button').click();
    window.brio.flush();
    assert.equal(roots[0].querySelector('output').textContent, '4');
    assert.equal(roots[1].querySelector('output').textContent, '9');
    manager.disposeWithin(roots[0]);
    assert.equal(roots[0].querySelector('output').textContent, '3');
    roots[0].querySelector('button').click();
    window.brio.flush();
    assert.equal(roots[0].querySelector('output').textContent, '3', 'disposed listeners are gone');
    manager.mountWithin(roots[0]);
    roots[0].querySelector('button').click();
    window.brio.flush();
    assert.equal(roots[0].querySelector('output').textContent, '4', 'a root passed directly is mounted');
    manager.disposeWithin(document.querySelector('main'));
    assert.ok(document.querySelector('output').hasAttribute('b-text'));
});

test('integration helper supports host replacement and rejects invalid server data explicitly', t => {
    const { document, manager, window } = setup(t, `<main>${widget(3)}</main>`);
    const host = document.querySelector('main');
    manager.mountWithin(host);
    manager.disposeWithin(host);
    host.innerHTML = widget(12);
    manager.mountWithin(host);
    host.querySelector('button').click();
    window.brio.flush();
    assert.equal(host.querySelector('output').textContent, '13');
    manager.disposeWithin(host);
    for (const invalid of ['not-a-number', '', ' ', '1.5', '9007199254740992']) {
        host.innerHTML = widget(invalid);
        assert.throws(() => manager.mountWithin(host), /safe integer/);
    }
});
