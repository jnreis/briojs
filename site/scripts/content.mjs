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
            content: `---\ntitle: ${JSON.stringify(section.title)}\ndescription: ${JSON.stringify(`${section.title}: API contracts, usage examples, and guidance for Brio.js.`)}\nsidebar:\n  order: ${index + 1}\neditUrl: ${repo}DOCUMENTATION.md\n---\n\n<!-- Generated from DOCUMENTATION.md. Do not edit this copy. -->\n${body.trim()}\n`,
        };
    });
}

export function releasePage(markdown) {
    return `---\ntitle: Release notes\ndescription: Brio.js release history, features, and development milestones.\neditUrl: ${repo}CHANGELOG.md\n---\n\n${markdown.replace(/^# Changelog\s*/, '').replaceAll('](./ai/', `](${repo}ai/`)}`;
}
