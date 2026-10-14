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
            rollupTypes: false,
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
