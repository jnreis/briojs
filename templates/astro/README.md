# Brio + Astro starter

[Astro](https://astro.build) renders the pages; [Brio.js](https://briojs.com)
brings the interactive islands to life with the `@jnreis/briojs/astro` adapter.

```sh
npm install
npm run dev
```

- `src/layouts/Layout.astro`: registers every island once with `enhanceAstro()`.
  `lazyApp()` loads an island's code only when it appears on a page.
- `src/apps/`: one factory per island. Each returns a fresh Brio app.
- `src/pages/`: mark island roots with `b-app="name"` and pass server data
  with `b-app-props={JSON.stringify(data)}`.

ClientRouter navigation is supported: outgoing islands are disposed and
incoming ones mounted on every page swap.

## Editor autocomplete

`.vscode/settings.json` points VS Code at Brio's HTML custom data, so `b-`
directives autocomplete with docs in HTML files after `npm install`. Whether
`.astro` files pick it up depends on your Astro editor extension.

[Astro islands guide](https://briojs.com/reference/app-and-lifecycle-api/#astro-islands) ·
[Directives](https://briojs.com/reference/html-directives/) ·
[Examples](https://briojs.com/examples/)
