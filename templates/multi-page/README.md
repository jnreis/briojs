# Brio multi-page starter

A [Brio.js](https://briojs.com) site where every page is real HTML with real
links, and Brio enhances only the interactive parts.

```sh
npm install
npm run dev
```

- `index.html`, `pricing.html`: the pages. Add more and list them in
  `vite.config.js`.
- `src/widgets/`: one file per widget. Each exports a function that returns a
  fresh Brio app.
- `src/main.js`: the site-wide registry. Any element with
  `data-widget="name"` gets its own app, on whichever page it appears.

Server-rendered pages (Rails, Django, Laravel, PHP, .NET…) work the same way:
render the markup with `data-widget` attributes, then load the built
`main.js`.

## Editor autocomplete

`.vscode/settings.json` already points VS Code at Brio's HTML custom data, so
`b-` directives autocomplete with docs after `npm install`.

[Docs](https://briojs.com/reference/three-ways-to-use-brio/#multi-page-site) ·
[Directives](https://briojs.com/reference/html-directives/) ·
[Examples](https://briojs.com/examples/)
