# Brio SPA starter

A [Brio.js](https://briojs.com) single-page app with components, the optional
router, route parameters, shared reactive state, and a not-found page.

```sh
npm install
npm run dev
```

- `index.html`: the app shell, navigation, and `<main b-router-outlet>`.
- `src/main.js`: routes and component registration.
- `src/pages/`: one component per page. `$route.params` holds `:id`.
- `src/plants.js`: shared `state()` that every page reads and updates.

## Deploying

History-mode routing needs your host to serve `index.html` for unknown paths
(Vite's dev and preview servers already do). On a static host that can't
rewrite URLs, use `createRouter(routes, { mode: 'hash' })`.

## Editor autocomplete

`.vscode/settings.json` already points VS Code at Brio's HTML custom data, so
`b-` directives autocomplete with docs after `npm install`.

[Docs](https://briojs.com/reference/three-ways-to-use-brio/#single-page-app) ·
[Components](https://briojs.com/reference/components/) ·
[Examples](https://briojs.com/examples/)
