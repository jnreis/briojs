import { build } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve, dirname, extname } from 'node:path';
import ts from 'typescript';
import { writeFile } from 'node:fs/promises';
import { directives, customData, docsUrl } from './directives.mjs';

// 1. Build ES modules for npm distribution with TypeScript declarations
await build({
    publicDir: false,
    build: {
        emptyOutDir: true,
        lib: {
            entry: {
                index: 'src/index.ts',
                reactivity: 'src/reactivity-entry.ts',
                'persistence-entry': 'src/persistence-entry.ts',
                'router-entry': 'src/router-entry.ts',
                'devtools-entry': 'src/devtools-entry.ts',
                'http-entry': 'src/http-entry.ts',
                'inputs-entry': 'src/inputs-entry.ts',
                'observers-entry': 'src/observers-entry.ts',
                'step-entry': 'src/step-entry.ts',
                'astro-entry': 'src/astro-entry.ts',
                'testing-entry': 'src/testing-entry.ts',
            },
            formats: ['es'],
            fileName: (_format, entryName) => `${entryName}.js`,
        },
        minify: false,
        reportCompressedSize: false,
        sourcemap: true,
    },
    plugins: [
        dts({
            entryRoot: 'src',
            include: ['src/core', 'src/dom', 'src/plugins', 'src/reactivity', 'src/integrations', 'src/*.ts'],
            rollupTypes: false,
            beforeWriteFile(filePath, content) {
                if (!filePath.endsWith('.d.ts')) return;
                // NodeNext consumers require explicit ESM paths, including in type-only imports.
                const source = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest);
                const edits = [];
                const visit = node => {
                    const specifier = ts.isImportDeclaration(node) || ts.isExportDeclaration(node)
                        ? node.moduleSpecifier
                        : ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument)
                            ? node.argument.literal : undefined;
                    if (specifier && ts.isStringLiteral(specifier) && specifier.text.startsWith('.') && !extname(specifier.text)) {
                        const path = specifier.text === '.' || specifier.text === '..'
                            ? `${specifier.text}/index.js` : `${specifier.text}.js`;
                        edits.push({ start: specifier.getStart(source) + 1, end: specifier.end - 1, path });
                    }
                    ts.forEachChild(node, visit);
                };
                visit(source);
                for (const edit of edits.sort((a, b) => b.start - a.start))
                    content = content.slice(0, edit.start) + edit.path + content.slice(edit.end);
                return { filePath, content };
            },
        }),
    ],
});

// 2. Build standalone production and development browser bundles.
for (const development of [false, true]) {
    await build({
        publicDir: false,
        define: { __BRIO_DEVTOOLS__: JSON.stringify(development) },
        build: {
            emptyOutDir: false,
            lib: {
                entry: development ? 'src/browser-dev.ts' : 'src/browser.ts',
                name: 'brio',
                formats: ['iife'],
                fileName: () => development ? 'brio.dev.min.js' : 'brio.min.js',
            },
            minify: 'esbuild',
            reportCompressedSize: true,
            sourcemap: true,
        },
    });
}

// Optional scripts must use the host runtime's reactivity and cleanup scopes.
const sharedRuntimeModules = new Set([
    resolve('src/reactivity/state.ts'),
    resolve('src/reactivity/effect.ts'),
    resolve('src/core/scope.ts'),
]);
for (const plugin of ['router', 'persistence', 'http', 'inputs', 'observers', 'step']) {
    await build({
        publicDir: false,
        plugins: [{
            name: 'brio-shared-browser-runtime',
            enforce: 'pre',
            resolveId(source, importer) {
                if (importer && source.startsWith('.') &&
                    sharedRuntimeModules.has(resolve(dirname(importer), `${source}.ts`)))
                    return { id: 'brio:runtime', external: true };
            },
        }],
        build: {
            emptyOutDir: false,
            lib: {
                entry: `src/browser-${plugin}.ts`,
                name: `brio${plugin.replaceAll('-', '')}`,
                formats: ['iife'],
                fileName: () => `brio.${plugin}.min.js`,
            },
            rollupOptions: { output: { globals: { 'brio:runtime': 'globalThis.brio' } } },
            minify: 'esbuild',
            sourcemap: true,
        },
    });
}

// 3. Editor tooling: the directive manifest and VS Code HTML custom data.
const manifest = directives.map(({ docs: _docs, suggestions, ...directive }) => ({
    ...directive,
    ...(suggestions ? { suggestions } : {}),
    docs: docsUrl(directive),
}));
await writeFile('dist/directives.json', JSON.stringify({ version: 1, directives: manifest }, null, 2) + '\n');
await writeFile('dist/html-custom-data.json', JSON.stringify(customData(), null, 2) + '\n');
