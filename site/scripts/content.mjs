import { unified } from 'unified';
import remarkParse from 'remark-parse';
import GithubSlugger from 'github-slugger';

const parser = unified().use(remarkParse);
const repo = 'https://github.com/jnreis/briojs/blob/main/';
const plain = node => node.value ?? (node.children ?? []).map(plain).join('');

export function referencePages(markdown) {
    const tree = parser.parse(markdown);
    const slugger = new GithubSlugger();
    const anchors = new Map();
    const sections = [];
    let section;
    for (const node of tree.children) {
        if (node.type === 'paragraph' && section && !section.summary)
            section.summary = markdown.slice(node.position.start.offset, node.position.end.offset)
                .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\s+/g, ' ').trim();
        if (node.type !== 'heading') continue;
        const title = plain(node);
        const slug = slugger.slug(title);
        if (slug !== new GithubSlugger().slug(title))
            throw new Error(`Duplicate documentation heading: ${title}`);
        if (node.depth === 2) {
            section = { title, slug, start: node.position.end.offset, end: markdown.length };
            if (sections.length) sections.at(-1).end = node.position.start.offset;
            sections.push(section);
        }
        anchors.set(slug, section?.slug);
    }
    const published = sections.filter(section => section.slug !== 'contents');
    if (!published.length) throw new Error('Documentation has no reference sections.');
    const edits = [];
    const visit = node => {
        if (node.type === 'link' || node.type === 'definition') {
            let url = node.url;
            if (url.startsWith('#') || url.startsWith('./DOCUMENTATION.md#')) {
                const anchor = url.slice(url.indexOf('#') + 1);
                const target = anchors.get(anchor);
                if (!target || target === 'contents') throw new Error(`Unresolved documentation link: ${url}`);
                url = `/reference/${target}/` + (target === anchor ? '' : `#${anchor}`);
            } else if (url.startsWith('./')) {
                url = repo + url.slice(2);
            }
            if (url !== node.url) {
                const source = markdown.slice(node.position.start.offset, node.position.end.offset);
                const index = source.lastIndexOf(node.url);
                if (index < 0) throw new Error(`Cannot rewrite documentation link: ${node.url}`);
                edits.push({ start: node.position.start.offset + index, end: node.position.start.offset + index + node.url.length, url });
            }
        }
        for (const child of node.children ?? []) visit(child);
    };
    visit(tree);
    return published.map((section, index) => {
        let body = markdown.slice(section.start, section.end);
        for (const edit of edits.filter(edit => edit.start >= section.start && edit.end <= section.end).sort((a, b) => b.start - a.start))
            body = body.slice(0, edit.start - section.start) + edit.url + body.slice(edit.end - section.start);
        return {
            slug: section.slug,
            title: section.title,
            summary: section.summary ?? '',
            content: `---\ntitle: ${JSON.stringify(section.title)}\ndescription: ${JSON.stringify(`${section.title}: API contracts, usage examples, and guidance for Brio.js.`)}\nsidebar:\n  order: ${index + 1}\neditUrl: ${repo}DOCUMENTATION.md\n---\n\n<!-- Generated from DOCUMENTATION.md. Do not edit this copy. -->\n${body.trim()}\n`,
        };
    });
}

export function releasePage(markdown) {
    return `---\ntitle: Release notes\ndescription: Brio.js release history, features, and development milestones.\neditUrl: ${repo}CHANGELOG.md\n---\n\n${markdown.replace(/^# Changelog\s*/, '').replaceAll('](./ai/', `](${repo}ai/`)}`;
}

const site = 'https://briojs.com';
const absolute = markdown => markdown
    .replace(/\]\(\/(?!\/)/g, `](${site}/`)
    .replace(/\]\(\.\/(?!DOCUMENTATION\.md)/g, `](${repo}`)
    .replace(/\]\(\.\/DOCUMENTATION\.md#/g, '](#');
const stripFrontmatter = markdown => markdown.replace(/^---\n[\s\S]*?\n---\n/, '').trim();
const frontmatter = (markdown, key) => {
    const value = markdown.match(new RegExp(`^${key}: (.+)$`, 'm'))?.[1] ?? '';
    return value.startsWith('"') ? JSON.parse(value) : value;
};

const intro = `> Brio.js (npm: \`@jnreis/briojs\`) is an HTML-first JavaScript framework. It enhances the real DOM in place: add a reactive widget to an existing app, enhance a server-rendered multi-page site, or build a single-page app. No virtual DOM, JSX, required compiler, or runtime dependencies.

Key facts for writing Brio code:

- Directives are \`b-\` attributes: \`b-text\`, \`b-bind-*\`, \`b-on-*\`, \`b-model\`, \`b-if\`/\`b-else-if\`/\`b-else\`, \`b-for\` with \`b-key\`, and more.
- State is explicit in expressions: \`$data.count\`, \`$props.label\`, \`$for.item\`, \`$ref.input\`. Brio never guesses which scope a bare name belongs to.
- Mount with \`createApp({ state: () => ({ … }) }).mount('#root')\`; Brio owns only the DOM you mount. Unmount before a host removes it.
- Browser bundle: \`<script src="https://cdn.jsdelivr.net/npm/@jnreis/briojs@5.0.0/dist/brio.min.js">\` exposes \`window.brio\`. Add-on scripts load after it: \`brio.inputs.min.js\` (\`b-mask\`, \`b-form\`, \`validate\`), \`brio.observers.min.js\` (\`b-on-enter\`, \`b-on-resize\`, …), \`brio.router.min.js\`, and others. With npm, install add-on directives with \`plugins: [inputsPlugin]\`. ESM: \`import { createApp } from '@jnreis/briojs'\`.
- Custom directives and \`$helpers\` come only from plugins registered before mount (\`app.directive()\`, \`app.helper()\`, \`app.use({ name, directives, helpers })\`). Never invent \`b-\` attributes that no installed plugin defines.
- Expressions are trusted JavaScript (CSP needs \`unsafe-eval\`). Use \`b-text\` for user content; \`b-html\` does not sanitize.`;

/** The llms.txt index: https://llmstxt.org */
export function llmsTxt({ guides, pages, examples }) {
    const link = (title, url, description) => `- [${title}](${url})${description ? `: ${description}` : ''}`;
    return [
        '# Brio.js',
        '',
        intro,
        '',
        '## Start here',
        '',
        ...guides.map(guide => link(guide.title, `${site}/start/${guide.slug}/`, guide.description)),
        link('Full documentation as one file', `${site}/llms-full.txt`, 'every guide and reference page in a single Markdown file.'),
        '',
        '## Reference',
        '',
        ...pages.map(page => link(page.title, `${site}/reference/${page.slug}/`, page.summary)),
        '',
        '## AI developer kit',
        '',
        link('Kit overview and installation', `${repo}ai/README.md`, 'a portable, tool-neutral kit for building Brio apps with an assistant.'),
        link('Brio v4 application guide', `${repo}ai/brio-apps/references/guide.md`, 'the rules and patterns an assistant should follow.'),
        link('Application recipes', `${repo}ai/brio-apps/references/recipes.md`, 'tested widget, multi-page, and SPA recipes.'),
        link('Brio apps skill', `${repo}ai/brio-apps/SKILL.md`, 'an on-demand skill for assistants that support skills.'),
        link('Directive manifest', `${site}/dist/directives.json`, 'every directive, its value, modifiers, example, and docs link as JSON.'),
        '',
        '## Examples',
        '',
        ...examples.map(example => link(example.title, `${site}/demos/${example.id}/index.html`,
            `${example.description} Source: ${repo.replace('/blob/', '/tree/')}tests/apps/${example.id}`)),
        '',
        '## Optional',
        '',
        link('Migrating from Brio 1.1.5', `${repo}ai/brio-migrate-1-1-5/SKILL.md`, 'a migration skill and guide for older apps.'),
        link('Release notes', `${site}/releases/`),
        link('Source code', 'https://github.com/jnreis/briojs'),
        '',
    ].join('\n');
}

/** Every guide and the full reference in one Markdown file, with links made absolute. */
export function llmsFullTxt({ guides, documentation }) {
    return [
        '# Brio.js documentation',
        '',
        intro,
        '',
        ...guides.flatMap(guide => [`# ${guide.title}`, '', `Source: ${site}/start/${guide.slug}/`, '', absolute(stripFrontmatter(guide.markdown)), '']),
        `# Reference`,
        '',
        `Source: ${site}/reference/install/`,
        '',
        absolute(documentation.replace(/^# .+\n/, '')).trim(),
        '',
    ].join('\n');
}

export const guideInfo = (slug, markdown) => ({
    slug,
    title: frontmatter(markdown, 'title'),
    description: frontmatter(markdown, 'description'),
    markdown,
});
