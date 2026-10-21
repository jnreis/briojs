#!/usr/bin/env node
// Compiles the bench pages that need a build step (JSX and Svelte) into bench/dist/.
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { compile, compileModule } from 'svelte/compiler';

const here = path => fileURLToPath(new URL(path, import.meta.url));

const svelte = {
    name: 'svelte',
    setup(builder) {
        builder.onLoad({ filter: /\.svelte(\.js)?$/ }, async ({ path }) => {
            const source = await readFile(path, 'utf8');
            const options = { filename: path, generate: 'client', dev: false };
            const { js } = path.endsWith('.js') ? compileModule(source, options) : compile(source, options);
            return { contents: js.code, loader: 'js' };
        });
    },
};

const common = {
    bundle: true,
    format: 'esm',
    minify: true,
    target: 'es2022',
    logLevel: 'warning',
    define: { 'process.env.NODE_ENV': '"production"' },
};

export const compiledFrameworks = ['react', 'preact', 'svelte'];

export async function buildBench(frameworks = compiledFrameworks) {
    const configs = {
        react: { entryPoints: [here('./src/react.jsx')], jsx: 'automatic', jsxImportSource: 'react' },
        preact: { entryPoints: [here('./src/preact.jsx')], jsx: 'automatic', jsxImportSource: 'preact' },
        svelte: { entryPoints: [here('./src/svelte.js')], conditions: ['svelte', 'browser', 'production'], plugins: [svelte] },
    };
    await Promise.all(frameworks.filter(name => configs[name]).map(name =>
        build({ ...common, ...configs[name], outfile: here(`./dist/${name}.js`) })));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await buildBench();
