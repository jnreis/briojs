// npm ignores GitHub's #gh-*-mode-only image links and shows both themes, so the
// packed README keeps only the light images. `prepack` strips; `postpack` restores.
import { existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs';

const readme = new URL('../README.md', import.meta.url);
const backup = new URL('../.README.github.md', import.meta.url);

export const forNpm = source => source
    .split('\n')
    .filter(line => !line.includes('#gh-dark-mode-only'))
    .join('\n')
    .replaceAll('#gh-light-mode-only', '');

const mode = process.argv[2];
if (mode === 'strip') {
    if (existsSync(backup)) throw new Error('.README.github.md already exists; run `node scripts/npm-readme.mjs restore` first.');
    const source = readFileSync(readme, 'utf8');
    renameSync(readme, backup);
    writeFileSync(readme, forNpm(source));
} else if (mode === 'restore') {
    if (existsSync(backup)) renameSync(backup, readme);
} else if (mode) {
    throw new Error(`Unknown mode "${mode}". Use strip or restore.`);
}
