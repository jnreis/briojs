import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, symlinkSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const temporary = mkdtempSync(join(tmpdir(), 'brio-scaffold-build-'));

function run(command, args, cwd) {
    const result = spawnSync(command, args, { cwd, encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    if (result.status !== 0)
        throw new Error(`${command} ${args.join(' ')} failed in ${cwd}\n${result.stdout}\n${result.stderr}`);
    return result.stdout;
}

try {
    run('npm', ['run', 'build'], root);
    const brioPack = JSON.parse(run('npm', ['pack', '--ignore-scripts', '--json', '--pack-destination', temporary], root))[0];
    const cliPack = JSON.parse(run('npm', ['pack', './packages/create-brio', '--json', '--pack-destination', temporary], root))[0];
    const cliRoot = join(temporary, 'cli');
    mkdirSync(cliRoot);
    run('tar', ['-xzf', join(temporary, cliPack.filename), '-C', cliRoot], temporary);
    const cli = join(cliRoot, 'package/bin/create-brio.js');
    const tools = join(temporary, 'tools');
    mkdirSync(tools);
    writeFileSync(join(tools, 'package.json'), JSON.stringify({
        name: 'brio-scaffold-validation', private: true, type: 'module',
        dependencies: {
            '@jnreis/briojs': `file:${join(temporary, brioPack.filename)}`,
            vite: '^7.0.0', typescript: '^5.7.3', astro: '^5.18.2',
            '@astrojs/check': '^0.9.4', 'global-jsdom': '^30.0.0', jsdom: '^30.0.0',
        },
    }, null, 2));
    // This intentionally installs only into an isolated temporary validation project.
    run('npm', ['install', '--no-audit', '--no-fund'], tools);
    for (const template of ['widget', 'multi-page', 'spa', 'astro', 'plugin']) {
        for (const language of ['js', 'ts']) {
            const destination = join(temporary, `${template}-${language}`);
            run(process.execPath, [cli, destination, '--template', template, '--language', language, '--package-manager', 'npm'], temporary);
            symlinkSync(join(tools, 'node_modules'), join(destination, 'node_modules'), 'junction');
            run('npm', ['run', 'build'], destination);
            if (template === 'plugin') {
                run('npm', ['test'], destination);
                if (language === 'ts' && !existsSync(join(destination, 'lib/index.d.ts')))
                    throw new Error('The TypeScript plugin did not emit declarations.');
            }
            const manifest = JSON.parse(readFileSync(join(destination, 'package.json'), 'utf8'));
            console.log(`PASS ${template}-${language}: ${manifest.scripts.build}${template === 'plugin' ? ' + plugin tests' : ''}`);
        }
    }
} finally {
    rmSync(temporary, { recursive: true, force: true });
}
