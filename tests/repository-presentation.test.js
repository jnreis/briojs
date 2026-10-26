import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { unified } from 'unified';
import remarkParse from 'remark-parse';

const root = fileURLToPath(new URL('../', import.meta.url));
const documents = [
    'README.md', 'CONTRIBUTING.md', 'SECURITY.md', 'CODE_OF_CONDUCT.md',
    'docs/README.md', 'docs/history/DEVPATH.md', 'docs/history/TEMPNOTES.md',
    'docs/history/DOCUMENTATION-v3.md',
];

for (const document of documents) test(`${document} has resolvable local links and images`, () => {
    const path = resolve(root, document);
    const tree = unified().use(remarkParse).parse(readFileSync(path, 'utf8'));
    function visit(node) {
        if (['link', 'image', 'definition'].includes(node.type)) {
            const url = node.url;
            if (!/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(url)) {
                const target = decodeURIComponent(url.split('#')[0]);
                assert.ok(existsSync(resolve(dirname(path), target)), `${document}: missing ${url}`);
            }
        }
        for (const child of node.children ?? []) visit(child);
    }
    visit(tree);
    for (const [, url] of readFileSync(path, 'utf8').matchAll(/\b(?:src|srcset|href)="(\.{1,2}\/[^"#\s]+)/g))
        assert.ok(existsSync(resolve(dirname(path), decodeURIComponent(url))), `${document}: missing ${url}`);
});

test('repository preview PNGs have the intended dimensions and bounded file sizes', () => {
    for (const [name, width, height] of [
        ['social-preview.png', 1280, 640],
    ]) {
        const image = readFileSync(resolve(root, 'docs/assets', name));
        assert.equal(image.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
        assert.equal(image.readUInt32BE(16), width);
        assert.equal(image.readUInt32BE(20), height);
        assert.ok(image.length < 1024 * 1024, `${name} should stay under 1 MiB`);
    }
});

test('README creature builder animations loop in both themes at the same size', () => {
    for (const theme of ['light', 'dark']) {
        const name = `creature-builder-${theme}.webp`;
        const image = readFileSync(resolve(root, 'docs/assets', name));
        assert.equal(image.toString('latin1', 0, 4), 'RIFF');
        assert.equal(image.toString('latin1', 8, 16), 'WEBPVP8X');
        assert.ok(image[20] & 0x02, `${name} should be animated`);
        assert.equal(image.readUIntLE(24, 3) + 1, 1120);
        assert.equal(image.readUIntLE(27, 3) + 1, 557);
        const animation = image.indexOf('ANIM', 30, 'latin1');
        assert.ok(animation > 0, `${name} should have animation settings`);
        assert.equal(image.readUInt16LE(animation + 12), 0, `${name} should loop forever`);
        assert.ok(image.length < 512 * 1024, `${name} should stay under 512 KiB`);
    }
});
