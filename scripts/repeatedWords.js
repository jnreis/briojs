
import { readFileSync } from 'fs';

const packageJsonPath = process.cwd() + '/package.json';
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

let brio = readFileSync(process.cwd() + `/dist/briojs.${packageJson.version}.min.js`, "utf8");

let words = brio
    .match(/\w+/g)
    .filter(word => word.length > 4);

let wordRepeats = Array.from(new Set(words))
    .map(word => [word, words.filter(w => w == word).length])
    .filter(array => array[1] > 1);

console.log(
    `
 Repeated words in dist/briojs.min.js:
 This can be useful to find repeated words in the bundle.
 Repeated words can be placed in the tools/constants.ts file.

`,
    wordRepeats
);