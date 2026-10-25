import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { bytes, compareReports, consumerSize, staticGraph, staticImports } from '../scripts/size.js';

test('size graphs follow imports/reexports once even through cycles and shared entries', () => {
    const sources = new Map([
        [resolve('entry.js'), 'import "./shared.js"; export {value} from "./other.js";'],
        [resolve('second.js'), 'export * from "./shared.js";'],
        [resolve('shared.js'), 'import "./entry.js"; export const value = 1;'],
        [resolve('other.js'), 'export * from "./shared.js";'],
    ]);
    const graph = staticGraph([resolve('entry.js'), resolve('second.js')], path => {
        assert.ok(sources.has(path), path);
        return sources.get(path);
    });
    assert.equal(graph.size, 4);
    assert.deepEqual(staticImports('// import "./fake.js"\nconst text = "import x"; export {x} from "./real.js";'), ['./real.js']);
    assert.throws(() => staticGraph(['entry.js'], () => 'import "external";'), /external dependency/);
    const size = bytes('export const value = 1;\n'.repeat(100));
    assert.equal(size.raw, Buffer.byteLength('export const value = 1;\n'.repeat(100)));
    assert.ok(size.gzip < size.raw);
    assert.ok(size.brotli < size.raw);
});

test('minified npm consumers tree-shake main exports as effectively as their utility subpaths', async () => {
    for (const [entry, symbols] of [['reactivity', ['signal', 'effect']], ['http', ['http']], ['inputs', ['validate']]]) {
        const main = await consumerSize([['main', symbols]]);
        const subpath = await consumerSize([[entry, symbols]]);
        assert.deepEqual(main, subpath, symbols.join(','));
        assert.ok(main.raw > 0);
        assert.equal(main.files, 1);
    }
});

test('size comparisons report every metric independently and reject missing scenarios', () => {
    const baseline = Object.fromEntries(['browser', 'esm', 'consumers']
        .map(section => [section, { entry: { raw: 100, gzip: 50, brotli: 40 } }]));
    const current = structuredClone(baseline);
    current.browser.entry = { raw: 90, gzip: 48, brotli: 41 };
    const comparison = compareReports(current, baseline);
    assert.deepEqual(comparison['browser/entry'], { raw: -10, gzip: -2, brotli: 1 });
    assert.deepEqual(comparison['consumers/entry'], { raw: 0, gzip: 0, brotli: 0 });
    assert.throws(() => compareReports({ ...current, browser: {} }, baseline), /scenario count/);
    assert.throws(() => compareReports({
        ...current, browser: { renamed: current.browser.entry },
    }, baseline), /Missing size baseline/);
    const invalid = structuredClone(baseline);
    delete invalid.browser.entry.brotli;
    assert.throws(() => compareReports(current, invalid), /Invalid size metric/);
});
