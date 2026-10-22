import { readFile, readdir } from 'node:fs/promises';
import { resolve, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const documents = new Map();
const files = new Set();
async function walk(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
        const path = resolve(directory, entry.name);
        if (entry.isDirectory()) await walk(path);
        else {
            files.add(path);
            if (extname(path) === '.html') {
                const html = await readFile(path, 'utf8');
                const dom = new JSDOM(html);
                documents.set(path, { dom, html });
            }
        }
    }
}
await walk(root);
const errors = [];
for (const [path, { dom }] of documents) {
    const doc = dom.window.document;
    const route = '/' + relative(root, path).replace(/index\.html$/, '');
    const base = new URL(route, 'https://briojs.com');
    if (!doc.title) errors.push(`${route}: missing title`);
    if (!route.startsWith('/demos/')) {
        const canonical = doc.querySelector('link[rel="canonical"]')?.href;
        if (canonical !== base.href) errors.push(`${route}: invalid canonical ${canonical}`);
        if (!doc.querySelector('meta[name="description"]')?.content) errors.push(`${route}: missing description`);
    }
    for (const element of doc.querySelectorAll('a[href],script[src],link[href],img[src]')) {
        const value = element.getAttribute('href') ?? element.getAttribute('src');
        if (!value || /^(data:|mailto:|tel:|javascript:)/.test(value)) continue;
        const url = new URL(value, base);
        if (url.origin !== base.origin) continue;
        let target = resolve(root, '.' + decodeURIComponent(url.pathname));
        if (url.pathname.endsWith('/')) target = resolve(target, 'index.html');
        if (!files.has(target)) {
            if (files.has(resolve(target, 'index.html'))) target = resolve(target, 'index.html');
            else { errors.push(`${route}: missing ${value}`); continue; }
        }
        if (url.hash && !url.hash.startsWith('#/')) {
            const destination = documents.get(target)?.dom.window.document;
            if (destination && !destination.getElementById(decodeURIComponent(url.hash.slice(1))))
                errors.push(`${route}: missing anchor ${value}`);
        }
    }
}
for (const { dom } of documents.values()) dom.window.close();
if (errors.length) throw new Error(errors.join('\n'));
console.log(`Checked ${documents.size} static HTML pages, local links, anchors, assets and metadata.`);
