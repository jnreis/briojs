---
title: Your first Brio widget
description: Go from an HTML file to a reactive widget, without a required compiler.
editUrl: https://github.com/jnreis/briojs/blob/main/site/src/content/docs/start/getting-started.md
---

Brio adds reactive behavior to HTML you already own. Start with one element,
one piece of state, and one event.

Want to experiment without setup? Open the
[playground](/play/): edit HTML/CSS/JavaScript, run an isolated preview, and
share your code with a link. Shared code waits for you to click Run.

## Start with a script tag

Save this as `index.html`, then serve it with a local static server:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Hello Brio</title>
  <style>[b-cloak] { display: none; }</style>
</head>
<body>
  <main id="hello" b-cloak>
    <label>Your name <input b-model="$data.name"></label>
    <p>Hello, <span b-text="$data.name || 'friend'"></span>!</p>
  </main>
  <script src="https://cdn.jsdelivr.net/npm/@jnreis/briojs@5.1.0/dist/brio.min.js"></script>
  <script>
    const app = brio.createApp({ state: () => ({ name: '' }) });
    app.mount('#hello');
  </script>
</body>
</html>
```

Type in the input. `b-model` updates state; `b-text` updates the text.
`$data` is explicit: Brio doesn't guess where `name` lives.

`b-cloak` hides the uninitialized widget until it mounts. It is optional; don't
hide an entire article or page that should remain readable without JavaScript.

## Prefer npm?

```sh
npm install @jnreis/briojs
```

In your app's JavaScript, after the target element exists:

```js
import { createApp } from '@jnreis/briojs';

const app = createApp({ state: () => ({ name: '' }) });
app.mount('#hello');
```

Use the same HTML, without the CDN and inline bootstrap scripts. Your bundler
handles the ESM import; Brio does not require a template compiler.

## Or start from a template

Each starter is a complete project. Open one in your browser with StackBlitz,
or copy it locally with `npx degit jnreis/briojs/templates/<name> my-app`.

- [Widget](https://stackblitz.com/github/jnreis/briojs/tree/main/templates/widget?file=index.html):
  a Brio widget inside a page you already have.
- [Multi-page site](https://stackblitz.com/github/jnreis/briojs/tree/main/templates/multi-page?file=index.html):
  real pages and links, with Brio enhancing only the interactive parts.
- [Single-page app](https://stackblitz.com/github/jnreis/briojs/tree/main/templates/spa?file=src%2Fmain.js):
  components, the router, route parameters, and shared state.
- [Astro islands](https://stackblitz.com/github/jnreis/briojs/tree/main/templates/astro?file=src%2Fpages%2Findex.astro):
  Astro renders the pages; Brio brings the islands to life.
- [Plugin](https://stackblitz.com/github/jnreis/briojs/tree/main/templates/plugin?file=src%2Findex.js):
  a publishable plugin with a directive, a helper, tests, and editor autocomplete.

Every template turns on [editor autocomplete](/reference/install/#editor-autocomplete)
for `b-` directives.

### Project scaffolder

Run `npm create brio@latest` to choose any of these five templates in
JavaScript or TypeScript. You can also supply every choice:

```sh
npm create brio@latest my-app -- --template widget --language ts --package-manager npm
```

The command includes editor settings, refuses nonempty destinations, and prints
the installation and development commands. It does not install dependencies or
initialize git. See the
[scaffolder README](https://github.com/jnreis/briojs/tree/main/packages/create-brio)
for every option.

## The few ideas to learn first

- Read and write state with `$data.name`.
- Use `b-on-click="$data.count++"` for events and `b-model` for input.
- Render lists with `b-for="item in $data.items"` and `$for.item`; give mutable
  lists a stable `b-key`.
- Mount only the region you want Brio to own.
- When your host removes a widget, unmount it first. Raw DOM removal does not
  clean up Brio's effects or listeners.

```js
const mount = app.mount('#another-widget');
mount.unmount(); // Clean up this mount and restore the original markup.
app.dispose();  // Clean up all mounts and permanently close this app.
```

## Know the boundaries

Templates are trusted application code, not a sandbox. Runtime expressions need
a CSP that permits `unsafe-eval`, unless you use the
[CSP build](/reference/trusted-html-and-expression-security/#strict-csp-build)
(Brio 5.1+). Use `b-text` for user-provided text; `b-html` does not sanitize
HTML.

Read [installation](/reference/install/), explore
[directives](/reference/html-directives/), or try the [example gallery](/examples/).

Want a ready-made interaction? Browse [Brio Parts](/parts/) for copy-paste
disclosure, tabs, dialog, and action-menu recipes. Adding Brio to an existing
backend? Start with the [integration guides](/integrations/overview/).
