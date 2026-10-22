---
title: Your first Brio widget
description: Go from an HTML file to a reactive widget, without a required compiler.
editUrl: https://github.com/jnreis/briojs/blob/main/site/src/content/docs/start/getting-started.md
---

Brio adds reactive behavior to HTML you already own. Start with one element,
one piece of state, and one event.

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
  <script src="https://cdn.jsdelivr.net/npm/@jnreis/briojs@4.0.0/dist/brio.min.js"></script>
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
a CSP that permits `unsafe-eval`. Use `b-text` for user-provided text; `b-html`
does not sanitize HTML.

Read [installation](/reference/install/), explore
[directives](/reference/html-directives/), or try the [example gallery](/examples/).
