const repo = 'https://github.com/jnreis/briojs/tree/main/templates/';
const stackblitz = 'https://stackblitz.com/github/jnreis/briojs/tree/main/templates/';

export const templates = [
    { id: 'widget', title: 'Widget', description: 'A Brio widget inside a page you already have.', file: 'index.html' },
    { id: 'multi-page', title: 'Multi-page site', description: 'Real pages and links, with Brio enhancing only the interactive parts.', file: 'index.html' },
    { id: 'spa', title: 'Single-page app', description: 'Components, the router, route parameters, and shared state.', file: 'src/main.js' },
    { id: 'astro', title: 'Astro islands', description: 'Astro renders the pages; Brio brings the islands to life.', file: 'src/pages/index.astro' },
].map(template => ({
    ...template,
    source: repo + template.id,
    stackblitz: `${stackblitz}${template.id}?file=${encodeURIComponent(template.file)}`,
}));
