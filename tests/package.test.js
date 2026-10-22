import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { JSDOM } from 'jsdom';
import ts from 'typescript';

const root = new URL('../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');
const manifest = JSON.parse(read('package.json'));

test('release metadata identifies the public package and builds before packing', () => {
    assert.equal(manifest.name, 'briojs');
    assert.equal(manifest.private, undefined);
    assert.equal(manifest.repository.url, 'git+https://github.com/jnreis/briojs.git');
    assert.equal(manifest.bugs.url, 'https://github.com/jnreis/briojs/issues');
    assert.equal(manifest.publishConfig.registry, 'https://registry.npmjs.org/');
    assert.equal(manifest.publishConfig.access, 'public');
    assert.equal(manifest.scripts.prepack, 'npm run build');
    for (const file of ['README.md', 'DOCUMENTATION.md', 'CHANGELOG.md', 'LICENSE'])
        assert.ok(manifest.files.includes(file), file);
});

test('every ESM package entry resolves, imports, and supplies declarations', async () => {
    for (const [subpath, entry] of Object.entries(manifest.exports)) {
        if (typeof entry === 'string') continue;
        const specifier = subpath === '.' ? manifest.name : manifest.name + subpath.slice(1);
        const resolved = import.meta.resolve(specifier);
        assert.equal(fileURLToPath(resolved), fileURLToPath(new URL(entry.import, root)), specifier);
        assert.ok(read(entry.types).length, `${specifier} declarations`);
        const exports = await import(specifier);
        assert.ok(Object.keys(exports).length, `${specifier} exports`);
    }
});

test('standalone browser scripts are exported for self-hosting', () => {
    for (const suffix of ['', '.dev', '.router', '.persistence', '.http', '.forms', '.step', '.money-mask']) {
        const path = `dist/brio${suffix}.min.js`;
        assert.equal(fileURLToPath(import.meta.resolve(`briojs/${path}`)),
            fileURLToPath(new URL(path, root)));
        assert.ok(read(path).length, path);
    }
});

test('published declarations type-check for strict NodeNext and bundler consumers', () => {
    for (const [module, moduleResolution] of [
        [ts.ModuleKind.NodeNext, ts.ModuleResolutionKind.NodeNext],
        [ts.ModuleKind.ESNext, ts.ModuleResolutionKind.Bundler],
    ]) {
        const program = ts.createProgram([fileURLToPath(new URL('types/package.ts', import.meta.url))], {
            target: ts.ScriptTarget.ES2022,
            module,
            moduleResolution,
            strict: true,
            noEmit: true,
            types: [],
            lib: ['lib.es2022.d.ts', 'lib.dom.d.ts'],
        });
        const diagnostics = ts.getPreEmitDiagnostics(program);
        assert.equal(diagnostics.length, 0, ts.formatDiagnostics(diagnostics, {
            getCurrentDirectory: () => fileURLToPath(root),
            getCanonicalFileName: path => path,
            getNewLine: () => '\n',
        }));
    }
});

test('README browser quick start uses the release version and works unchanged', t => {
    const markup = /```html\n(<!doctype[\s\S]+?)```/i.exec(read('README.md'))?.[1];
    assert.ok(markup, 'Complete HTML quick start');
    const dom = new JSDOM(markup, { runScripts: 'outside-only' });
    const { window } = dom;
    const errors = [];
    window.addEventListener('error', event => errors.push(event.error));
    t.after(() => {
        try {
            window.__exampleApp?.dispose();
            assert.deepEqual(errors, []);
        } finally {
            window.close();
        }
    });
    const source = window.document.querySelector('script[src]').getAttribute('src');
    assert.equal(source, `https://cdn.jsdelivr.net/npm/briojs@${manifest.version}/dist/brio.min.js`);
    window.eval(read('dist/brio.min.js'));
    const bootstrap = window.document.querySelector('script:not([src])').textContent;
    window.eval(`${bootstrap}\nwindow.__exampleApp = app;`);
    assert.equal(window.document.querySelector('[b-cloak]'), null);
    const button = window.document.querySelector('button');
    assert.equal(button.querySelector('span').textContent, '0');
    button.click();
    assert.equal(button.querySelector('span').textContent, '1');
});
