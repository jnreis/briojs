import { readFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { brotliCompressSync, constants, gzipSync } from 'node:zlib';
import ts from 'typescript';
import { build, version as viteVersion } from 'vite';

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = resolve(root, 'dist');
const require = createRequire(import.meta.url);
const viteRequire = createRequire(require.resolve('vite'));
const entries = {
    main: 'index.js', csp: 'csp-entry.js', reactivity: 'reactivity.js', router: 'router-entry.js',
    persistence: 'persistence-entry.js', http: 'http-entry.js',
    inputs: 'inputs-entry.js', observers: 'observers-entry.js', step: 'step-entry.js',
    astro: 'astro-entry.js', devtools: 'devtools-entry.js',
};

export function bytes(source) {
    const buffer = Buffer.from(source);
    return {
        raw: buffer.length,
        gzip: gzipSync(buffer, { level: 9 }).length,
        brotli: brotliCompressSync(buffer, {
            params: { [constants.BROTLI_PARAM_QUALITY]: 11 },
        }).length,
    };
}

export function staticImports(source) {
    const ast = ts.createSourceFile('bundle.js', source, ts.ScriptTarget.Latest, false, ts.ScriptKind.JS);
    return ast.statements.flatMap(statement => {
        if ((ts.isImportDeclaration(statement) || ts.isExportDeclaration(statement)) &&
            statement.moduleSpecifier && ts.isStringLiteral(statement.moduleSpecifier))
            return [statement.moduleSpecifier.text];
        return [];
    });
}

export function staticGraph(entryPaths, read = path => readFileSync(path, 'utf8')) {
    const files = new Map();
    const visit = path => {
        path = resolve(path);
        if (files.has(path)) return;
        const source = read(path);
        files.set(path, source);
        for (const imported of staticImports(source)) {
            if (!imported.startsWith('.'))
                throw new Error(`Unexpected external dependency in size graph: ${imported}`);
            visit(resolve(dirname(path), imported));
        }
    };
    for (const path of entryPaths) visit(path);
    return files;
}

function sumFiles(files) {
    const total = { raw: 0, gzip: 0, brotli: 0 };
    for (const source of files.values()) {
        const size = bytes(source);
        for (const key of Object.keys(total)) total[key] += size[key];
    }
    return total;
}

export async function consumerSize(imports) {
    const source = imports.map(([entry, names]) =>
        `import { ${names.join(', ')} } from ${JSON.stringify(resolve(dist, entries[entry]))};`).join('\n')
        + `\nglobalThis.__brioSize0 = [${imports.flatMap(([, names]) => names).join(', ')}];`;
    const result = await build({
        configFile: false, publicDir: false, logLevel: 'silent', root,
        plugins: [{
            name: 'brio-size-consumer',
            resolveId(id) { if (id === 'virtual:brio-size') return '\0brio-size'; },
            load(id) { if (id === '\0brio-size') return source; },
        }],
        build: {
            write: false, emptyOutDir: false, minify: 'esbuild', target: 'modules',
            sourcemap: false, reportCompressedSize: false,
            rollupOptions: { input: 'virtual:brio-size', output: { format: 'es' } },
        },
    });
    const chunks = [result].flat().flatMap(output => output.output)
        .filter(output => output.type === 'chunk');
    return {
        files: chunks.length,
        ...sumFiles(new Map(chunks.map(chunk => [chunk.fileName, chunk.code]))),
    };
}

export async function measure() {
    const browserNames = ['brio.min.js', 'brio.dev.min.js', 'brio.csp.min.js', 'brio.csp.dev.min.js',
        ...['router', 'persistence', 'http', 'inputs', 'observers', 'step']
            .map(plugin => `brio.${plugin}.min.js`)];
    const browser = Object.fromEntries(browserNames.map(name => [name, bytes(readFileSync(resolve(dist, name)))]));
    const esm = {};
    for (const [name, entry] of Object.entries(entries)) {
        const files = staticGraph([resolve(dist, entry)]);
        esm[name] = { files: [...files.keys()].map(path => relative(dist, path)), ...sumFiles(files) };
    }
    const shared = staticGraph(Object.values(entries).map(entry => resolve(dist, entry)));
    esm['all-entries-deduplicated'] = { files: shared.size, ...sumFiles(shared) };

    const scenarios = {
        'app-main': [['main', ['createApp']]],
        'app-csp': [['csp', ['createApp']]],
        'signal-main': [['main', ['signal', 'effect']]],
        'signal-subpath': [['reactivity', ['signal', 'effect']]],
        'resource-main': [['main', ['resource']]],
        'resource-subpath': [['reactivity', ['resource']]],
    };
    for (const [name, symbol] of Object.entries({
        router: 'createRouter', http: 'http',
        inputs: 'inputsPlugin', observers: 'observersPlugin', step: 'createStepEngine',
    })) {
        scenarios[`${name}-main`] = [['main', [symbol]]];
        scenarios[`${name}-subpath`] = [[name, [symbol]]];
    }
    scenarios['persistence-main'] = [['main', ['persist', 'createScope']]];
    scenarios['persistence-subpath'] = [['persistence', ['persist']], ['reactivity', ['createScope']]];
    scenarios['devtools-main'] = [['main', ['createApp', 'enableDevtools', 'inspectDevtools']]];
    scenarios['devtools-subpath'] = [['main', ['createApp']], ['devtools', ['enableDevtools', 'inspectDevtools']]];
    scenarios['astro-subpath'] = [['astro', ['enhanceAstro', 'lazyApp']]];
    scenarios['app-with-tools'] = [['main', ['createApp']], ['router', ['createRouter']],
        ['http', ['http']], ['inputs', ['inputsPlugin']]];
    const consumers = {};
    for (const [name, imports] of Object.entries(scenarios))
        consumers[name] = await consumerSize(imports);
    return {
        settings: {
            node: process.version, vite: viteVersion, typescript: ts.version,
            esbuild: viteRequire('esbuild').version, rollup: viteRequire('rollup').VERSION,
            gzipLevel: 9, brotliQuality: 11,
            consumerTarget: 'modules', consumerMinifier: 'esbuild',
            note: 'Compressed ESM graphs sum separately compressed files; consumers are minified application builds. Source maps excluded.',
        },
        browser, esm, consumers,
    };
}

export function compareReports(report, baseline) {
    const rows = {};
    for (const section of ['browser', 'esm', 'consumers']) {
        const names = Object.keys(report[section]);
        if (names.length !== Object.keys(baseline[section]).length)
            throw new Error(`Size baseline scenario count changed: ${section}`);
        for (const name of names) {
            const before = baseline[section][name];
            if (!before) throw new Error(`Missing size baseline: ${section}/${name}`);
            rows[`${section}/${name}`] = Object.fromEntries(['raw', 'gzip', 'brotli']
                .map(key => {
                    const after = report[section][name][key];
                    if (![before[key], after].every(value => Number.isSafeInteger(value) && value >= 0))
                        throw new Error(`Invalid size metric: ${section}/${name}/${key}`);
                    return [key, after - before[key]];
                }));
        }
    }
    return rows;
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
    const report = await measure();
    if (process.argv.includes('--check')) {
        const baseline = JSON.parse(readFileSync(resolve(root, 'scripts/size-baseline.json'), 'utf8'));
        if (JSON.stringify(report.settings) !== JSON.stringify(baseline.settings))
            console.warn('Size tool settings/versions differ from baseline; reproduce its environment before interpreting small deltas.');
        const rows = compareReports(report, baseline);
        console.log('Byte deltas from scripts/size-baseline.json (positive means larger):');
        console.table(rows);
        if (Object.values(rows).some(row => Object.values(row).some(delta => delta > 0))) {
            console.error('Size regression: review the change or deliberately update the baseline.');
            process.exitCode = 1;
        }
    } else if (process.argv.includes('--json')) console.log(JSON.stringify(report, null, 2));
    else {
        for (const section of ['browser', 'esm', 'consumers']) {
            console.log(`\n${section}: bytes (gzip level 9; Brotli quality 11)`);
            console.table(Object.fromEntries(Object.entries(report[section])
                .map(([name, { raw, gzip, brotli }]) => [name, { raw, gzip, brotli }])));
        }
        console.log(report.settings.note);
    }
}
