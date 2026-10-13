import { build } from 'vite';
import dts from 'vite-plugin-dts';

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
            include: ['src/core', 'src/dom', 'src/plugins', 'src/reactivity', 'src/*.ts'],
            exclude: [
                'src/vnext/**',
                'src/directives/**',
                'src/methods/**',
                'src/tools/**',
                'src/app.ts',
                'src/briojs.core.min.ts',
                'src/briojs.min.ts',
            ],
            rollupTypes: false,
        }),
    ],
});

// 2. Build minified standalone bundle for browsers (dist/brio.min.js)
await build({
    publicDir: false,
    build: {
        emptyOutDir: false,
        lib: {
            entry: 'src/browser.ts',
            name: 'brio',
            formats: ['iife'],
            fileName: () => 'brio.min.js',
        },
        minify: 'esbuild',
        reportCompressedSize: true,
        sourcemap: true,
    },
});

