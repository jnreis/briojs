import { readFile, writeFile, mkdir, readdir, copyFile, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { examples } from '../data/examples.mjs';
import { referencePages, releasePage, llmsTxt, llmsFullTxt, guideInfo } from './content.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const site = resolve(root, 'site');
const write = async (path, content) => {
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, content);
};
const reference = resolve(site, 'src/content/docs/reference');
await rm(reference, { recursive: true, force: true });
const pages = referencePages(await readFile(resolve(root, 'DOCUMENTATION.md'), 'utf8'));
for (const page of pages) await write(resolve(reference, `${page.slug}.md`), page.content);
const guides = await Promise.all(['getting-started', 'how-brio-fits'].map(async slug =>
    guideInfo(slug, await readFile(resolve(site, `src/content/docs/start/${slug}.md`), 'utf8'))));
const documentation = await readFile(resolve(root, 'DOCUMENTATION.md'), 'utf8');
await write(resolve(site, 'public/llms.txt'), llmsTxt({ guides, pages, examples }));
await write(resolve(site, 'public/llms-full.txt'), llmsFullTxt({ guides, documentation }));
await write(resolve(site, 'src/content/docs/releases.md'), releasePage(await readFile(resolve(root, 'CHANGELOG.md'), 'utf8')));

const bundles = ['', '.router', '.http', '.persistence', '.inputs', '.observers', '.step'];
for (const suffix of bundles) {
    const file = `brio${suffix}.min.js`;
    const content = (await readFile(resolve(root, 'dist', file), 'utf8')).replace(/\/\/# sourceMappingURL=.*$/gm, '');
    await write(resolve(site, 'public/dist', file), content);
}
for (const file of ['directives.json', 'html-custom-data.json'])
    await copyFile(resolve(root, 'dist', file), resolve(site, 'public/dist', file));
const demoRoot = resolve(site, 'public/demos');
await rm(demoRoot, { recursive: true, force: true });
for (const example of examples) {
    const source = resolve(root, 'tests/apps', example.id);
    const output = resolve(demoRoot, example.id);
    await mkdir(output, { recursive: true });
    const files = await readdir(source);
    if (!files.includes('index.html')) throw new Error(`Missing demo: ${example.id}`);
    for (const file of files) {
        if (!/\.(html|css|js)$/.test(file) || file.endsWith('.test.js')) continue;
        if (file.endsWith('.html')) {
            let content = (await readFile(resolve(source, file), 'utf8'))
                .replaceAll('../../../dist/', '/dist/')
                .replaceAll('../../../site/public/', '/')
                .replaceAll('/site/public/', '/')
                .replace('aria-label="Brio lab"', 'aria-label="Brio website"')
                .replace('<a href="/">Lab</a><a href="/tests/index.html">Directory</a>', '<a href="/examples/">← Brio examples</a>');
            if (example.id === 'conduit')
                content = content.replace('<head>', '<head><script>window.conduitMode = "hash";</script>');
            await write(resolve(output, file), content);
        } else await copyFile(resolve(source, file), resolve(output, file));
    }
}
await mkdir(resolve(demoRoot, 'shared'), { recursive: true });
await copyFile(resolve(root, 'tests/apps/shared/app.css'), resolve(demoRoot, 'shared/app.css'));
console.log(`Prepared ${pages.length} reference pages, release notes, llms.txt and ${examples.length} demos.`);
