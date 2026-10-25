import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';
import { templates } from '../site/data/templates.mjs';

const root = new URL('../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');
const version = JSON.parse(read('package.json')).version;
const folders = readdirSync(new URL('templates/', root), { withFileTypes: true })
    .filter(entry => entry.isDirectory()).map(entry => entry.name).sort();

test('every template folder is listed on the site and in the templates README', () => {
    assert.deepEqual(templates.map(template => template.id).sort(), folders);
    const readme = read('templates/README.md');
    const guide = read('site/src/content/docs/start/getting-started.md');
    for (const template of templates) {
        assert.ok(readme.includes(template.stackblitz), `${template.id} StackBlitz link`);
        assert.ok(guide.includes(template.stackblitz), `${template.id} getting-started link`);
        assert.ok(readme.includes(template.description), `${template.id} description`);
        assert.ok(existsSync(new URL(`templates/${template.id}/${template.file}`, root)), `${template.id} opens ${template.file}`);
        assert.match(template.stackblitz, /^https:\/\/stackblitz\.com\/github\/jnreis\/briojs\/tree\/main\/templates\//);
    }
});

test('templates are runnable projects on the current minor release', () => {
    for (const id of folders) {
        const manifest = JSON.parse(read(`templates/${id}/package.json`));
        assert.equal(manifest.private, true, id);
        assert.equal(manifest.type, 'module', id);
        assert.ok(manifest.scripts.dev && manifest.scripts.build, `${id} scripts`);
        const [major, minor] = version.split('.');
        // Plugins list Brio as a peer dependency so apps provide the one shared runtime.
        const range = (manifest.peerDependencies ?? manifest.dependencies)['@jnreis/briojs'];
        assert.equal(range, `^${major}.${minor}.0`, id);
        if (manifest.peerDependencies) assert.equal(manifest.devDependencies['@jnreis/briojs'], range, `${id} dev copy`);
        assert.ok(existsSync(new URL(`templates/${id}/README.md`, root)), `${id} README`);
        assert.ok(read(`templates/${id}/.gitignore`).includes('node_modules'), `${id} .gitignore`);
        const settings = JSON.parse(read(`templates/${id}/.vscode/settings.json`));
        assert.equal(settings['html.customData'][0], './node_modules/@jnreis/briojs/dist/html-custom-data.json', id);
        for (const file of settings['html.customData'].slice(1))
            assert.ok(existsSync(new URL(`templates/${id}/${file}`, root)), `${id} ${file}`);
    }
});

test('template markup only uses known directives', async () => {
    const { directives } = await import('../scripts/directives.mjs');
    const exact = new Set(directives.filter(directive => !directive.name.endsWith('*')).map(directive => directive.name));
    const prefixes = directives.filter(directive => directive.name.endsWith('*')).map(directive => directive.name.slice(0, -1));
    const files = readdirSync(new URL('templates/', root), { recursive: true })
        .filter(file => /\.(html|astro|js|ts)$/.test(file) && !file.includes('node_modules'));
    // A template may use directives it defines itself, such as the plugin starter's b-copy.
    const defined = id => new Set(files.filter(file => file.startsWith(`${id}/`))
        .flatMap(file => [...read(`templates/${file}`).matchAll(/name: '(b-[a-z-]+)'/g)].map(match => match[1])));
    let seen = 0;
    for (const file of files) {
        const own = defined(file.split('/')[0]);
        for (const [, name] of read(`templates/${file}`).matchAll(/\s(b-[a-z-]+)(?:\.[a-z.]+)?[=\s>]/g)) {
            const known = exact.has(name) || own.has(name) || prefixes.some(prefix => name.startsWith(prefix) && name.length > prefix.length);
            assert.ok(known, `${file}: unknown directive ${name}`);
            seen++;
        }
    }
    assert.ok(seen > 40, `only ${seen} directives found`);
});
