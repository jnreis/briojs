import assert from 'node:assert/strict';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';

test('renderBrio mounts markup with plugins and cleans up', async t => {
    const dom = new JSDOM('<!doctype html><body></body>', { pretendToBeVisual: true });
    // What "global-jsdom" does: expose the window's globals that Node lacks.
    const names = ['window', ...Object.getOwnPropertyNames(dom.window).filter(name => !(name in globalThis))];
    for (const name of names)
        Object.defineProperty(globalThis, name, { value: name === 'window' ? dom.window : dom.window[name], configurable: true, writable: true });
    t.after(() => {
        for (const name of names) delete globalThis[name];
        dom.window.close();
    });

    const { renderBrio } = await import('@jnreis/briojs/testing');
    const { definePlugin } = await import('@jnreis/briojs');
    const shout = definePlugin({
        name: 'shout',
        directives: [{ name: 'b-shout', mount: (el, binding) => binding.effect(() => { el.textContent = String(binding.value()).toUpperCase(); }) }],
    });
    const view = renderBrio('<input b-model="$data.word"><p b-shout="$data.word"></p><button b-on-click="$data.word = \'reset\'">x</button>', {
        plugins: [shout],
        state: () => ({ word: 'hi' }),
    });
    assert.equal(view.get('p').textContent, 'HI');
    view.type('input', 'hello');
    assert.equal(view.get('p').textContent, 'HELLO');
    view.click('button');
    assert.equal(view.get('p').textContent, 'RESET');
    assert.throws(() => view.get('.missing'), /nothing matches "\.missing"/);
    assert.equal(document.body.contains(view.root), true);
    view.cleanup();
    view.cleanup();
    assert.equal(document.body.contains(view.root), false);

    assert.throws(() => renderBrio('<p b-text="nope("></p>'), /Invalid Brio expression/);
    assert.equal(document.body.children.length, 0, 'failed renders leave nothing behind');
});
