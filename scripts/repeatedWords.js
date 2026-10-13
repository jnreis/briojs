import { readFileSync } from 'node:fs';

const brio = readFileSync(
    `${process.cwd()}/dist/brio.min.js`,
    'utf8'
);

const words = brio.match(/\w{5,}/g) ?? [];

const counts = new Map();

for (const word of words) {
    counts.set(word, (counts.get(word) ?? 0) + 1);
}

const wordRepeats = [...counts]
    .filter(([, count]) => count > 10)
    .sort((a, b) => b[1] - a[1]);

console.log(`
Repeated words in dist/briojs.min.js:
This can be useful to find repeated words in the bundle.
Repeated words can be placed in the tools/constants.ts file.
`, wordRepeats);