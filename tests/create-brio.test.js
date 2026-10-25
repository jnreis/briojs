import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync, mkdirSync, writeFileSync, symlinkSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { before, after, test } from 'node:test';

const root = fileURLToPath(new URL('../', import.meta.url));
let temporary, packed, cli;
const run = (args, env = {}) => spawnSync(process.execPath, [cli, ...args], {
    cwd: temporary, encoding: 'utf8', env: { ...process.env, ...env },
});

before(() => {
    temporary = mkdtempSync(join(tmpdir(), 'brio-create-test-'));
    const result = spawnSync('npm', ['pack', './packages/create-brio', '--json', '--pack-destination', temporary], {
        cwd: root, encoding: 'utf8',
    });
    assert.equal(result.status, 0, result.stderr);
    const tarball = join(temporary, JSON.parse(result.stdout)[0].filename);
    const unpack = spawnSync('tar', ['-xzf', tarball, '-C', temporary], { encoding: 'utf8' });
    assert.equal(unpack.status, 0, unpack.stderr);
    packed = join(temporary, 'package');
    cli = join(packed, 'bin/create-brio.js');
});
after(() => {
    if (temporary) rmSync(temporary, { recursive: true, force: true });
});

for (const template of ['widget', 'multi-page', 'spa', 'astro', 'plugin']) {
    for (const language of ['js', 'ts']) {
        test(`packed create-brio scaffolds ${template} in ${language}`, () => {
            const directory = `${template}-${language}`;
            const result = run([directory, '--template', template, '--language', language, '--package-manager', 'npm']);
            assert.equal(result.status, 0, result.stderr);
            const destination = join(temporary, directory);
            const manifest = JSON.parse(readFileSync(join(destination, 'package.json'), 'utf8'));
            assert.equal(manifest.name, directory);
            assert.ok(manifest.scripts.dev && manifest.scripts.build);
            assert.ok(existsSync(join(destination, '.gitignore')));
            assert.ok(existsSync(join(destination, '.vscode/settings.json')));
            assert.ok(!existsSync(join(destination, '_gitignore')));
            assert.ok(!existsSync(join(destination, 'node_modules')));
            assert.ok(!existsSync(join(destination, '.git')));
            assert.ok(!existsSync(join(destination, 'package-lock.json')));
            const source = readdirSync(join(destination, 'src'), { recursive: true });
            assert.ok(source.some(file => file.endsWith(`.${language}`)));
            assert.ok(!source.some(file => file.endsWith(language === 'js' ? '.ts' : '.js')));
            if (language === 'ts') assert.ok(manifest.scripts.typecheck);
            if (template === 'plugin' && language === 'ts') {
                assert.equal(manifest.exports, './lib/index.js');
                assert.equal(manifest.types, './lib/index.d.ts');
            }
            assert.match(result.stdout, /npm install/);
            assert.match(result.stdout, /npm run dev/);
        });
    }
}

test('help, version and invalid input never write a project', () => {
    const before = readdirSync(temporary);
    assert.match(run(['--help']).stdout, /Usage: npm create brio/);
    assert.equal(run(['--version']).stdout.trim(), JSON.parse(readFileSync(join(packed, 'package.json'))).version);
    for (const args of [
        ['bad', '--template', 'unknown', '--yes'],
        ['bad', '--language', 'coffee', '--yes'],
        ['bad', '--package-manager', 'other', '--yes'],
        ['--template'],
        ['--unknown'],
        ['one', 'two', '--yes'],
        ['--template', 'widget', '--template', 'spa', '--yes'],
        ['missing-choices'],
        ['bad$name', '--yes'],
    ]) {
        const result = run(args);
        assert.equal(result.status, 1, args.join(' '));
        assert.match(result.stderr, /create-brio:/);
        assert.deepEqual(readdirSync(temporary), before);
    }
});

test('packed CLI is executable and includes its license without development sources', () => {
    if (process.platform !== 'win32') {
        const result = spawnSync(cli, ['--version'], { encoding: 'utf8' });
        assert.equal(result.status, 0, result.stderr);
        assert.equal(result.stdout.trim(), '1.0.0');
    }
    assert.ok(existsSync(join(packed, 'LICENSE')));
    assert.ok(!existsSync(join(packed, 'scripts')));
    assert.ok(!existsSync(join(packed, 'variants')));
});

test('--yes supplies all defaults and explicit flags override the invoking manager', () => {
    const result = run(['--yes', '--package-manager=bun'], { npm_config_user_agent: 'pnpm/10.0.0' });
    assert.equal(result.status, 0, result.stderr);
    assert.ok(existsSync(join(temporary, 'brio-app/src/main.js')));
    assert.match(result.stdout, /bun install/);
    assert.match(result.stdout, /bun dev/);
    assert.doesNotMatch(result.stdout, /pnpm install/);
});

test('nonempty directories, files, and symlinks are never overwritten', () => {
    const protectedDirectory = join(temporary, 'protected');
    mkdirSync(protectedDirectory);
    writeFileSync(join(protectedDirectory, 'secret.txt'), 'keep me');
    writeFileSync(join(temporary, 'existing-file'), 'keep me too');
    symlinkSync(protectedDirectory, join(temporary, 'linked'));
    for (const target of ['protected', 'existing-file', 'linked']) {
        const result = run([target, '--yes']);
        assert.equal(result.status, 1);
        assert.match(result.stderr, /empty directory/);
    }
    assert.equal(readFileSync(join(protectedDirectory, 'secret.txt'), 'utf8'), 'keep me');
    assert.equal(readFileSync(join(temporary, 'existing-file'), 'utf8'), 'keep me too');
    assert.deepEqual(readdirSync(protectedDirectory), ['secret.txt']);
});

test('empty destinations and nested paths with spaces work; managers print correct commands', () => {
    mkdirSync(join(temporary, 'empty'));
    assert.equal(run(['empty', '--yes']).status, 0);
    for (const manager of ['npm', 'pnpm', 'yarn', 'bun']) {
        const result = run([`nested path/${manager} app`, '--yes'], { npm_config_user_agent: `${manager}/1.0.0` });
        assert.equal(result.status, 0, result.stderr);
        assert.match(result.stdout, new RegExp(manager === 'yarn' ? '\\n  yarn\\n' : `${manager} install`));
        const manifest = JSON.parse(readFileSync(join(temporary, `nested path/${manager} app/package.json`)));
        assert.equal(manifest.name, `${manager}-app`);
    }
});
