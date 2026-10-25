#!/usr/bin/env node
import { cp, lstat, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline/promises';

const templates = ['widget', 'multi-page', 'spa', 'astro', 'plugin'];
const languages = ['js', 'ts'];
const managers = ['npm', 'pnpm', 'yarn', 'bun'];
const help = `Create a Brio.js app or plugin.

Usage: npm create brio@latest [directory] [-- options]

  --template <name>         widget, multi-page, spa, astro, plugin
  --language <js|ts>        JavaScript or TypeScript
  --package-manager <name>  npm, pnpm, yarn, bun
  --yes                    Use defaults for unanswered prompts
  --help                   Show this help
  --version                Show the scaffolder version

Defaults: brio-app, widget, js, and the invoking package manager (or npm).
No packages are installed and no git repository is initialized.
Nonempty directories are never overwritten.`;

function parse(args) {
    const options = {};
    for (let index = 0; index < args.length; index++) {
        const arg = args[index];
        if (arg === '--') continue;
        if (['--help', '--version', '--yes'].includes(arg)) options[arg.slice(2)] = true;
        else if (arg.startsWith('--')) {
            const [flag, inline] = arg.split(/=(.*)/s);
            const key = { '--template': 'template', '--language': 'language', '--package-manager': 'manager' }[flag];
            if (!key) throw new Error(`Unknown option "${flag}". Use --help for usage.`);
            const value = inline ?? args[++index];
            if (!value || value.startsWith('-')) throw new Error(`${flag} needs a value.`);
            if (options[key]) throw new Error(`${flag} was supplied more than once.`);
            options[key] = value;
        } else if (arg.startsWith('-')) throw new Error(`Unknown option "${arg}". Use --help for usage.`);
        else {
            if (options.directory) throw new Error('Supply only one project directory.');
            options.directory = arg;
        }
    }
    return options;
}

function choice(value, allowed, label) {
    if (!allowed.includes(value)) throw new Error(`Invalid ${label} "${value}". Choose: ${allowed.join(', ')}.`);
    return value;
}

async function main() {
    const options = parse(process.argv.slice(2));
    if (options.help) return console.log(help);
    if (options.version) {
        const manifest = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
        return console.log(manifest.version);
    }
    const detected = process.env.npm_config_user_agent?.split('/')[0];
    const defaults = { directory: 'brio-app', template: 'widget', language: 'js', manager: managers.includes(detected) ? detected : 'npm' };
    if (options.template) choice(options.template, templates, 'template');
    if (options.language) choice(options.language, languages, 'language');
    if (options.manager) choice(options.manager, managers, 'package manager');
    const missing = ['directory', 'template', 'language', 'manager'].filter(key => !options[key]);
    if (missing.length && !options.yes) {
        if (!process.stdin.isTTY || !process.stdout.isTTY)
            throw new Error('Missing project options. Supply directory, --template, --language and --package-manager, or use --yes for defaults.');
        const prompt = createInterface({ input: process.stdin, output: process.stdout });
        prompt.on('SIGINT', () => {
            prompt.close();
            console.error('\nProject creation cancelled.');
            process.exit(130);
        });
        try {
            for (const key of missing) {
                const labels = {
                    directory: 'Project directory',
                    template: `Template (${templates.join(', ')})`,
                    language: 'Language (js, ts)',
                    manager: `Package manager (${managers.join(', ')})`,
                };
                options[key] = (await prompt.question(`${labels[key]} [${defaults[key]}]: `)).trim() || defaults[key];
            }
        } finally {
            prompt.close();
        }
    }
    for (const key of missing) options[key] ??= defaults[key];
    choice(options.template, templates, 'template');
    choice(options.language, languages, 'language');
    choice(options.manager, managers, 'package manager');
    const destination = resolve(options.directory);
    const name = basename(destination).toLowerCase().replace(/\s+/g, '-');
    if (!/^[a-z0-9][a-z0-9._-]*$/.test(name) || name.length > 214)
        throw new Error('The project directory must yield a valid npm name (letters, numbers, dots, hyphens, or underscores).');
    let stat;
    try {
        stat = await lstat(destination);
    } catch (error) {
        if (error.code !== 'ENOENT') throw error;
    }
    if (stat && (!stat.isDirectory() || stat.isSymbolicLink() || (await readdir(destination)).length))
        throw new Error(`Destination "${destination}" must be an empty directory, not a file, symlink, or existing project.`);
    const source = fileURLToPath(new URL(`../templates/${options.template}-${options.language}/`, import.meta.url));
    const manifest = JSON.parse(await readFile(join(source, 'package.json'), 'utf8'));
    manifest.name = name;
    await mkdir(destination, { recursive: true });
    for (const entry of await readdir(source)) {
        if (entry === 'package.json') continue;
        await cp(join(source, entry), join(destination, entry === '_gitignore' ? '.gitignore' : entry), { recursive: true, force: false, errorOnExist: true });
    }
    await writeFile(join(destination, 'package.json'), JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' });
    const install = options.manager === 'yarn' ? 'yarn' : `${options.manager} install`;
    const run = options.manager === 'npm' ? 'npm run dev' : `${options.manager} dev`;
    const quoted = `'${destination.replaceAll("'", "'\\''")}'`;
    console.log(`\nCreated ${options.template} (${options.language}) in ${destination}.\n\nNext:\n  cd ${quoted}\n  ${install}\n  ${run}\n\nDependencies were not installed. Git was not initialized.`);
}

main().catch(error => {
    console.error(`create-brio: ${error.message}`);
    process.exitCode = 1;
});
