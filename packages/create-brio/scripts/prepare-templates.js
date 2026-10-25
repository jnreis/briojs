import { cp, mkdir, readdir, readFile, writeFile, unlink } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const packageRoot = fileURLToPath(new URL('../', import.meta.url));
const ids = ['widget', 'multi-page', 'spa', 'astro', 'plugin'];

async function files(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    return (await Promise.all(entries.map(entry => entry.isDirectory()
        ? files(join(directory, entry.name)) : join(directory, entry.name)))).flat();
}

for (const id of ids) for (const language of ['js', 'ts']) {
    const target = join(packageRoot, 'templates', `${id}-${language}`);
    await mkdir(target, { recursive: true });
    // Remove only known generated files, preserving directories and avoiding broad recursive removal.
    for (const path of await files(target)) await unlink(path);
    await cp(join(root, 'templates', id), target, {
        recursive: true,
        filter: path => !['node_modules', 'dist', '.astro', 'package-lock.json', 'pnpm-lock.yaml', 'yarn.lock', 'bun.lock'].includes(basename(path)),
    });
    // npm excludes .gitignore from tarballs; restore the name when scaffolding.
    await cp(join(target, '.gitignore'), join(target, '_gitignore'));
    await unlink(join(target, '.gitignore'));
    const overlays = join(packageRoot, 'variants', `${id}-${language}`);
    try {
        await cp(overlays, target, { recursive: true });
    } catch (error) {
        if (error.code !== 'ENOENT') throw error;
    }
    if (id === 'astro' && language === 'js') {
        await unlink(join(target, 'src/apps/counter.ts'));
        await unlink(join(target, 'src/apps/poll.ts'));
    }
    if (id === 'astro' && language === 'ts') {
        const manifestPath = join(target, 'package.json');
        const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
        manifest.devDependencies = { '@astrojs/check': '^0.9.4', typescript: '^5.7.3' };
        manifest.scripts.typecheck = 'astro check';
        manifest.scripts.build = 'astro check && astro build';
        await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
    }
    if (language === 'ts' && id !== 'astro') {
        for (const path of await files(join(target, 'src'))) {
            if (!path.endsWith('.js')) continue;
            const typedPath = path.slice(0, -3) + '.ts';
            let typed;
            try {
                typed = await readFile(typedPath, 'utf8');
            } catch (error) {
                if (error.code !== 'ENOENT') throw error;
                typed = await readFile(path, 'utf8');
            }
            await writeFile(typedPath, typed);
            await unlink(path);
        }
        for (const path of await files(target)) {
            if (path.endsWith('.html')) {
                const source = await readFile(path, 'utf8');
                await writeFile(path, source.replace(/(src="[^"]*\/src\/[^"]+)\.js"/g, '$1.ts"').replace(/(src="\/src\/[^"]+)\.js"/g, '$1.ts"'));
            }
        }
        const manifestPath = join(target, 'package.json');
        const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
        manifest.devDependencies.typescript = '^5.7.3';
        manifest.scripts.typecheck = 'tsc --noEmit';
        manifest.scripts.build = 'tsc --noEmit && vite build';
        if (id === 'plugin') {
            manifest.exports = './lib/index.js';
            manifest.types = './lib/index.d.ts';
            manifest.files = ['lib', 'html-custom-data.json'];
            manifest.scripts.build = 'tsc -p tsconfig.build.json && vite build';
            manifest.scripts.test = 'tsc -p tsconfig.build.json && node --test';
            await writeFile(join(target, '_gitignore'), (await readFile(join(target, '_gitignore'), 'utf8')) + '\nlib/\n');
            const testPath = join(target, 'test/copy.test.js');
            await writeFile(testPath, (await readFile(testPath, 'utf8')).replace('../src/index.js', '../lib/index.js'));
        }
        await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
        await writeFile(join(target, 'tsconfig.json'), JSON.stringify({
            compilerOptions: {
                target: 'ES2022', module: 'ESNext', moduleResolution: 'Bundler',
                lib: ['ES2022', 'DOM', 'DOM.Iterable'], strict: true, noEmit: true,
                skipLibCheck: true, types: ['vite/client'],
            },
            include: ['src'],
        }, null, 2) + '\n');
    }
    const readme = join(target, 'README.md');
    let readmeSource = await readFile(readme, 'utf8');
    if (language === 'ts' && id !== 'astro')
        readmeSource = readmeSource.replace(/(src\/[\w/-]+)\.js/g, '$1.ts');
    if (id === 'plugin' && language === 'ts')
        readmeSource = readmeSource.replace('4. Remove `"private": true` and run `npm publish`.',
            '4. Run `npm run build` and `npm test`. The package exports `lib/index.js` and `lib/index.d.ts`.\n' +
            '   Remove `"private": true` and run `npm publish` when ready.');
    await writeFile(readme, readmeSource +
        `\n## Generated project\n\nTemplate: ${id}. Language: ${language === 'ts' ? 'TypeScript' : 'JavaScript'}.\n` +
        'Install dependencies with your chosen package manager, then run its `dev` script.\n' +
        (language === 'ts' ? 'Run the `typecheck` script to check your application types.\n' : ''));
}
await cp(join(root, 'LICENSE'), join(packageRoot, 'LICENSE'));
