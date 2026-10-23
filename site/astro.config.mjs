import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
    site: 'https://briojs.com',
    trailingSlash: 'always',
    vite: { ssr: { noExternal: ['nanoid'] } },
    integrations: [starlight({
        title: 'Brio.js',
        logo: { src: './public/favicon.svg', replacesTitle: false },
        description: 'Powerfully simple, HTML-first web development.',
        social: [
            { icon: 'github', label: 'GitHub', href: 'https://github.com/jnreis/briojs' },
            { icon: 'npm', label: 'npm', href: 'https://www.npmjs.com/package/@jnreis/briojs' },
        ],
        customCss: ['./src/styles/docs.css'],
        sidebar: [
            { label: 'Home', link: '/' },
            { label: 'Start here', items: [
                { label: 'Getting started', slug: 'start/getting-started' },
                { label: 'How Brio fits', slug: 'start/how-brio-fits' },
            ] },
            { label: 'Reference', autogenerate: { directory: 'reference' } },
            { label: 'Examples', link: '/examples/' },
            { label: 'Releases', slug: 'releases' },
        ],
        head: [
            { tag: 'meta', attrs: { property: 'og:image', content: 'https://briojs.com/social.png' } },
        ],
    })],
});
