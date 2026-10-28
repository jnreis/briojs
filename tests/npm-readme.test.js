import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { forNpm } from '../scripts/npm-readme.mjs';

test('the npm README keeps one image per light/dark pair', () => {
    const source = readFileSync(new URL('../README.md', import.meta.url), 'utf8');
    const pairs = source.match(/#gh-dark-mode-only/g)?.length ?? 0;
    assert.ok(pairs > 0, 'README uses theme fragments');
    assert.equal(source.match(/#gh-light-mode-only/g).length, pairs);
    const packed = forNpm(source);
    assert.doesNotMatch(packed, /#gh-(dark|light)-mode-only/);
    assert.equal(packed.match(/logo-dark|creature-builder-dark/g), null);
    assert.equal(packed.match(/logo-light|creature-builder-light/g).length, pairs);
});
