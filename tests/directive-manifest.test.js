import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';
import GithubSlugger from 'github-slugger';
import { directives, customData, docsUrl } from '../scripts/directives.mjs';

const root = new URL('../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');
const names = new Set(directives.map(directive => directive.name));
const modifiersOf = name => directives.find(directive => directive.name === name).modifiers?.map(modifier => modifier.name) ?? [];
const source = readdirSync(new URL('src/', root), { recursive: true })
    // The plugin registry names reserved stems and examples; the reserved-name test below covers it.
    .filter(file => file.endsWith('.ts') && !file.endsWith('registry.ts'))
    .map(file => read(`src/${file}`))
    .join('\n');

test('every b- attribute the runtime reads is in the directive manifest', () => {
    const literals = new Set([...source.matchAll(/['"`](b-[a-z-]+)['"`]/g)].map(match => match[1]));
    const prefixes = ['b-on-', 'b-bind-', 'b-prop-', 'b-ref-', 'b-attr-'];
    // Removed directives the runtime still detects only to throw a migration error.
    const removed = new Set(['b-options']);
    const missing = [...literals].filter(name =>
        !prefixes.some(prefix => name.startsWith(prefix)) && !names.has(name) && !removed.has(name));
    assert.deepEqual(missing, []);
    for (const prefix of ['b-on-', 'b-bind-', 'b-prop-']) assert.ok(names.has(`${prefix}*`), prefix);
});

test('plugins cannot claim any built-in directive name', () => {
    const registry = read('src/dom/directives/registry.ts');
    const reserved = registry.match(/reservedDirectives = \(\s*'([^']+)' \+\s*'([^']+)'/).slice(1).join('').split(' ');
    const stems = [...registry.match(/reservedPrefixes = \[([^\]]+)\]/)[1].matchAll(/'([a-z-]+)'/g)].map(match => match[1]);
    const covered = name => stems.some(stem => name === stem || name.startsWith(`${stem}-`));
    // Directives shipped as official plugins register through the public API, so they must stay claimable.
    const official = new Set(directives.filter(directive => directive.plugin).map(directive => directive.name));
    assert.deepEqual([...reserved].sort(), [...names].filter(name => !covered(name) && !name.endsWith('*') && !official.has(name)).sort());
    for (const prefix of ['b-on-', 'b-bind-', 'b-prop-', 'b-router-']) assert.ok(covered(prefix + 'x'), prefix);
});

test('event modifiers match the runtime list exactly', () => {
    const list = read('src/dom/directives/on.ts').match(/const eventModifiers = \[([^\]]+)\]/)[1];
    const runtime = [...list.matchAll(/'([a-z]+)'/g)].map(match => match[1]);
    assert.deepEqual([...modifiersOf('b-on-*')].sort(), runtime.sort());
});

test('directive modifiers match the modifiers each handler reads', () => {
    const used = file => [...new Set([...read(`src/dom/directives/${file}`).matchAll(/modifiers\.([a-z]+)/g)].map(match => match[1]))].sort();
    assert.deepEqual(modifiersOf('b-model').sort(), used('model.ts'));
    assert.deepEqual(modifiersOf('b-if').sort(), used('if.ts'));
    assert.deepEqual(modifiersOf('b-html').sort(), used('html.ts'));
    assert.deepEqual(modifiersOf('b-bind-*').sort(), used('bind.ts'));
    for (const name of ['b-teleport', 'b-mask', 'b-data', 'b-ref', 'b-else', 'b-for'])
        assert.deepEqual(modifiersOf(name), [], name);
});

test('every directive is documented and links to a real docs anchor', () => {
    const docs = read('DOCUMENTATION.md');
    const anchors = new Set();
    const slugger = new GithubSlugger();
    let page;
    for (const [, hashes, title] of docs.matchAll(/^(#{2,6}) (.+)$/gm)) {
        const slug = slugger.slug(title.replace(/`/g, ''));
        if (hashes.length === 2) anchors.add(`${page = slug}/`);
        else anchors.add(`${page}/#${slug}`);
    }
    for (const directive of directives) {
        const documented = directive.name.endsWith('*')
            ? docs.includes(`\`${directive.name}\``) || docs.includes(`\`${directive.name.slice(0, -1)}`)
            : docs.includes(`\`${directive.name}`);
        assert.ok(documented, `${directive.name} missing from DOCUMENTATION.md`);
        assert.ok(anchors.has(directive.docs), `${directive.name}: unknown docs anchor ${directive.docs}`);
        assert.match(docsUrl(directive), /^https:\/\/briojs\.com\/reference\//);
        assert.ok(directive.description && directive.example, directive.name);
    }
});

test('the packaged editor files are generated from the manifest', () => {
    const data = JSON.parse(read('dist/html-custom-data.json'));
    assert.deepEqual(data, JSON.parse(JSON.stringify(customData())));
    assert.equal(data.version, 1.1);
    const attributes = new Map(data.globalAttributes.map(attribute => [attribute.name, attribute]));
    assert.equal(attributes.size, data.globalAttributes.length, 'duplicate attribute names');
    for (const name of ['b-data', 'b-text', 'b-model.number', 'b-on-click', 'b-on-submit.prevent', 'b-bind-class', 'b-if.hide'])
        assert.ok(attributes.has(name), name);
    assert.equal(attributes.get('b-else').valueSet, 'v');
    assert.ok(![...attributes.keys()].some(name => name.includes('*')));

    const manifest = JSON.parse(read('dist/directives.json'));
    assert.equal(manifest.directives.length, directives.length);
    assert.ok(manifest.directives.every(directive => directive.docs.startsWith('https://briojs.com/reference/')));

    const files = JSON.parse(read('package.json')).files;
    assert.ok(files.includes('dist'));
});
