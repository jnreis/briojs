import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { referencePages } from '../site/scripts/content.mjs';

test('site reference splits actual headings, not fenced code, and preserves Brio expressions', () => {
    const pages = referencePages('# Docs\n\n## First\n\n```html\n## Not a heading\n<p>${$data.name}</p>\n```\n\n[Next](#second)\n\n## Second\n\n### Details\n\n[Back](#first) [Source](./ai/README.md)\n');
    assert.deepEqual(pages.map(page => page.slug), ['first', 'second']);
    assert.ok(pages[0].content.includes('<p>${$data.name}</p>'));
    assert.ok(pages[0].content.includes('](/reference/second/)'));
    assert.ok(pages[1].content.includes('](/reference/first/)'));
    assert.ok(pages[1].content.includes('](https://github.com/jnreis/briojs/blob/main/ai/README.md)'));
});

test('site reference rejects duplicate headings and unresolved links explicitly', () => {
    assert.throws(() => referencePages('## Same\n## Same\n'), /Duplicate/);
    assert.throws(() => referencePages('## First\n[Missing](#unknown)'), /Unresolved/);
    assert.throws(() => referencePages('# Empty'), /no reference sections/);
});

test('site reference includes every canonical major section exactly once', () => {
    const source = readFileSync(new URL('../DOCUMENTATION.md', import.meta.url), 'utf8');
    const sections = unified().use(remarkParse).parse(source).children.filter(node => node.type === 'heading' && node.depth === 2);
    const pages = referencePages(source);
    assert.equal(pages.length, sections.length - 1, 'Only the canonical contents section is omitted');
    assert.equal(new Set(pages.map(page => page.slug)).size, pages.length);
    assert.ok(pages.every(page => page.content.includes('editUrl: https://github.com/jnreis/briojs/blob/main/DOCUMENTATION.md')));
});
