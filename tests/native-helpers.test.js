import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import { build } from 'vite';

const root = fileURLToPath(new URL('..', import.meta.url));

for (const minify of [false, 'esbuild']) {
    test(`shared native helpers preserve native behavior (${minify || 'unminified'})`, async t => {
        const result = await build({
            root, configFile: false, publicDir: false, logLevel: 'silent',
            plugins: [{
                name: 'native-helper-test',
                resolveId(id) { if (id === 'virtual:native') return '\0native.js'; },
                load(id) {
                    if (id === '\0native.js') return `
export * from ${JSON.stringify(fileURLToPath(new URL('../src/core/native.ts', import.meta.url)))};
export * from ${JSON.stringify(fileURLToPath(new URL('../src/dom/native.ts', import.meta.url)))};
`;
                },
            }],
            build: {
                write: false, emptyOutDir: false, minify,
                rollupOptions: {
                    input: 'virtual:native', preserveEntrySignatures: 'strict', output: { format: 'es' },
                },
            },
        });
        const chunk = [result].flat().flatMap(output => output.output).find(output => output.type === 'chunk');
        const native = await import(`data:text/javascript;base64,${Buffer.from(chunk.code).toString('base64')}`);
        const dom = new JSDOM('<main><span></span><i></i></main>');
        t.after(() => dom.window.close());
        const document = dom.window.document;
        const parent = document.querySelector('main');
        const child = parent.firstChild;
        const sibling = child.nextSibling;
        const fragment = document.createDocumentFragment();
        assert.strictEqual(native.getParent(child), parent);
        assert.strictEqual(native.getNextSibling(child), sibling);
        assert.strictEqual(native.getOwnerDocument(child), document);
        assert.strictEqual(native.getOwnerDocument(document), null);
        assert.strictEqual(native.getChildNodes(parent), parent.childNodes);
        assert.equal(native.getNodeType(fragment), dom.window.Node.DOCUMENT_FRAGMENT_NODE);
        const removable = document.createElement('aside');
        parent.append(removable);
        native.removeElement(removable);
        assert.equal(parent.contains(removable), false);
        native.removeElement(null);
        native.removeElement(undefined);
        const removableComment = document.createComment('remove me');
        parent.append(removableComment);
        native.removeElement(removableComment);
        assert.equal(parent.contains(removableComment), false);
        let removeReceiver;
        const removableObject = { remove() { removeReceiver = this; } };
        native.removeElement(removableObject);
        assert.strictEqual(removeReceiver, removableObject);
        assert.throws(() => native.removeElement({ remove() { throw new Error('remove failed'); } }), /remove failed/);
        const set = new Set([child]);
        assert.equal(native.deleteItem(set, child), true);
        assert.equal(native.deleteItem(set, child), false);
        const map = new Map([['key', child]]);
        assert.equal(native.deleteItem(map, 'key'), true);
        assert.equal(native.deleteItem(map, 'missing'), false);
        assert.equal(native.deleteItem(undefined, 'key'), undefined);
        assert.equal(native.deleteItem(null, 'key'), undefined);
        const deleteCalls = [];
        const deleteCollection = {
            delete(value) {
                assert.strictEqual(this, deleteCollection);
                deleteCalls.push(value);
                return true;
            },
        };
        assert.equal(native.deleteItem(deleteCollection, child), true);
        assert.deepEqual(deleteCalls, [child]);
        assert.throws(() => native.deleteItem({
            delete() { throw new Error('delete failed'); },
        }, child), /delete failed/);
        assert.equal(native.includesItem([1, 2, NaN], 2), true);
        assert.equal(native.includesItem([1, 2, NaN], NaN), true);
        assert.equal(native.includesItem([1, 2], 3), false);
        const includesCalls = [];
        const includesCollection = {
            includes(value) {
                assert.strictEqual(this, includesCollection);
                includesCalls.push(value);
                return true;
            },
        };
        assert.equal(native.includesItem(includesCollection, child), true);
        assert.deepEqual(includesCalls, [child]);
        assert.throws(() => native.includesItem({
            includes() { throw new Error('includes failed'); },
        }, child), /includes failed/);
        assert.equal(native.startsWith('briojs', 'brio'), true);
        assert.equal(native.startsWith('briojs', 'rio'), false);
        assert.equal(native.startsWith('', ''), true);
        const startsWithCalls = [];
        const stringLike = {
            startsWith(prefix) {
                assert.strictEqual(this, stringLike);
                startsWithCalls.push(prefix);
                return true;
            },
        };
        assert.equal(native.startsWith(stringLike, 'prefix'), true);
        assert.deepEqual(startsWithCalls, ['prefix']);
        assert.throws(() => native.startsWith({
            startsWith() { throw new Error('startsWith failed'); },
        }, 'prefix'), /startsWith failed/);
        const snapshot = native.arrayFrom(native.getChildNodes(parent));
        assert.strictEqual(native.removeChild(native.getParent(child), child), child);
        assert.equal(native.removeChild(native.getParent(child), child), undefined);
        assert.deepEqual(snapshot, [child, sibling]);
        assert.strictEqual(native.insertBefore(parent, child, sibling), child);
        assert.strictEqual(parent.firstChild, child);
        assert.throws(() => native.removeChild(sibling, child), { name: 'NotFoundError' });
        child.setAttribute('data-value', 'yes');
        assert.equal(native.getAttribute(child, 'data-value'), 'yes');
        native.removeAttribute(child, 'data-value');
        assert.equal(native.getAttribute(child, 'data-value'), null);

        let calls = 0;
        const listener = { handleEvent() { assert.strictEqual(this, listener); calls++; } };
        const options = { capture: true };
        native.addEventListener(parent, 'click', listener, options);
        child.dispatchEvent(new dom.window.Event('click', { bubbles: true }));
        native.removeEventListener(parent, 'click', listener, options);
        child.dispatchEvent(new dom.window.Event('click', { bubbles: true }));
        assert.equal(calls, 1);
        const eventCalls = [];
        const eventTarget = {
            addEventListener(...args) { assert.strictEqual(this, eventTarget); eventCalls.push(args); },
            removeEventListener(...args) { assert.strictEqual(this, eventTarget); eventCalls.push(args); },
        };
        native.addEventListener(eventTarget, 'event', listener);
        native.removeEventListener(eventTarget, 'event', listener, options);
        assert.deepEqual(eventCalls, [['event', listener], ['event', listener, options]]);

        const context = { multiplier: 3 };
        assert.deepEqual(native.arrayFrom(new Set([2, 4]), function(value, index) {
            assert.strictEqual(this, context);
            return value * this.multiplier + index;
        }, context), [6, 13]);
        assert.equal(native.isArray(snapshot), true);
        assert.equal(native.isArray(parent.childNodes), false);
        const key = Symbol('key');
        const values = { a: 1, [key]: 2 };
        assert.deepEqual(native.objectKeys(values), ['a']);
        assert.deepEqual(native.objectEntries(values), [['a', 1]]);
        assert.deepEqual(native.ownKeys(values), ['a', key]);
        assert.deepEqual(native.ObjectConstructor[native.GET_OWN_PROPERTY_DESCRIPTOR](values, 'a'),
            Object.getOwnPropertyDescriptor(values, 'a'));
        assert.strictEqual(native.ObjectConstructor, Object);
        assert.strictEqual(native.ReflectApi, Reflect);
        assert.equal(native.isInstanceOf(child, dom.window.HTMLElement), true);
        assert.equal(native.isInstanceOf({}, dom.window.HTMLElement), false);
        assert.equal(native.isInstanceOf(null, dom.window.HTMLElement), false);
        class Custom {
            static [Symbol.hasInstance](value) {
                assert.strictEqual(this, Custom);
                return value?.custom === true;
            }
        }
        assert.equal(native.isInstanceOf({ custom: true }, Custom), true);
        assert.equal(native.isInstanceOf({ custom: false }, Custom), false);
        for (const value of [undefined, null, false, true, 0, NaN, Infinity, '', 'hello', {}, [], () => {}, Symbol(), 1n]) {
            assert.equal(native.isString(value), typeof value === 'string');
            assert.equal(native.isObjectType(value), typeof value === 'object');
            assert.equal(native.isNumber(value), typeof value === 'number');
            assert.equal(native.isBoolean(value), typeof value === 'boolean');
            assert.equal(native.isFunction(value), typeof value === 'function');
        }
        assert.equal(native.getLength('a😀'), 3);
        assert.equal(native.getLength(snapshot), 2);
        assert.equal(native.getLength(parent.childNodes), 2);
        let reads = 0;
        const lengthOwner = {
            get length() { assert.strictEqual(this, lengthOwner); reads++; return 5; },
        };
        assert.equal(native.getLength(lengthOwner), 5);
        assert.equal(reads, 1);
        assert.throws(() => native.getLength(null), TypeError);

        const originalKeys = Object.keys;
        let keyReceiver;
        let keyInput;
        let keyResult;
        try {
            Object.keys = function(value) {
                keyReceiver = this;
                keyInput = value;
                return ['replacement'];
            };
            keyResult = native.objectKeys(values);
        } finally {
            Object.keys = originalKeys;
        }
        assert.strictEqual(keyReceiver, Object);
        assert.strictEqual(keyInput, values);
        assert.deepEqual(keyResult, ['replacement']);
        const originalGet = Reflect.get;
        let getReceiver;
        let getResult;
        try {
            Reflect.get = function(target, key) {
                getReceiver = this;
                return originalGet(target, key) + 10;
            };
            getResult = native.ReflectApi.get(values, 'a');
        } finally {
            Reflect.get = originalGet;
        }
        assert.strictEqual(getReceiver, Reflect);
        assert.equal(getResult, 11);
        for (const [factory, Constructor] of [
            ['createError', Error], ['createTypeError', TypeError], ['createSyntaxError', SyntaxError],
        ]) {
            const error = native[factory]('unchanged message');
            assert.ok(error instanceof Constructor);
            assert.equal(error.message, 'unchanged message');
            assert.equal(error.name, Constructor.name);
        }

        const original = Array.from;
        try {
            Array.from = function(...args) {
                assert.strictEqual(this, Array);
                assert.deepEqual(args, [values]);
                return ['replacement'];
            };
            assert.deepEqual(native.arrayFrom(values), ['replacement']);
        } finally {
            Array.from = original;
        }
    });
}

test('shared helper types retain inference, narrowing, and listener option types', () => {
    execFileSync(fileURLToPath(new URL('../node_modules/.bin/tsc', import.meta.url)), [
        '--noEmit', '--strict', '--skipLibCheck', '--target', 'ES2022', '--module', 'ESNext',
        '--moduleResolution', 'bundler', 'tests/types/native-helpers.ts',
    ], { cwd: root, stdio: 'pipe' });
});
