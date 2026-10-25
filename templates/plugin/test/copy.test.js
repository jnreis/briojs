import 'global-jsdom/register';
import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { renderBrio } from '@jnreis/briojs/testing';
import copyPlugin from '../src/index.js';

const copied = [];
beforeEach(() => {
    copied.length = 0;
    Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: async text => { copied.push(text); } },
        configurable: true,
    });
});

const settle = () => new Promise(resolve => setTimeout(resolve, 0));

test('b-copy copies the current value and marks the element', async t => {
    const view = renderBrio('<button b-copy="$data.link">Copy</button>', {
        plugins: [copyPlugin],
        state: () => ({ link: 'https://briojs.com' }),
    });
    t.after(view.cleanup);

    view.click('button');
    await settle();
    assert.deepEqual(copied, ['https://briojs.com']);
    assert.ok(view.get('button').hasAttribute('data-copied'));

    view.app.state.link = 'https://briojs.com/examples/';
    view.click('button');
    await settle();
    assert.equal(copied.at(-1), 'https://briojs.com/examples/');
});

test('$copy works in any expression', async t => {
    const view = renderBrio('<button b-on-click="$copy(\'hello\')">Copy</button>', { plugins: [copyPlugin] });
    t.after(view.cleanup);
    view.click('button');
    await settle();
    assert.deepEqual(copied, ['hello']);
});

test('b-copy rejects modifiers', () => {
    assert.throws(() => renderBrio('<button b-copy.fast="1"></button>', { plugins: [copyPlugin] }), /does not support modifiers/);
});
