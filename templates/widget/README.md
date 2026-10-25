# Brio widget starter

A [Brio.js](https://briojs.com) widget inside a page you already have. Brio
mounts on one element (`#packing-list`) and leaves everything else alone.

```sh
npm install
npm run dev
```

- `index.html`: the host page and the widget's markup, with `b-` directives.
- `src/main.js`: the widget's state and actions.
- `src/style.css`: plain CSS, including the recommended `[b-cloak]` rule.

## No build step?

Copy the widget markup into any page and load Brio from a CDN instead:

```html
<script src="https://cdn.jsdelivr.net/npm/@jnreis/briojs@5/dist/brio.min.js"></script>
<script>
  brio.createApp({ state: () => ({ /* … */ }) }).mount('#packing-list');
</script>
```

## Editor autocomplete

`.vscode/settings.json` already points VS Code at Brio's HTML custom data, so
`b-` directives autocomplete with docs after `npm install`.

[Docs](https://briojs.com/start/getting-started/) ·
[Directives](https://briojs.com/reference/html-directives/) ·
[Examples](https://briojs.com/examples/)
