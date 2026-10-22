# Brio.js

**Powerfully simple, HTML-first web development.**

Brio enhances the real DOM in place. Add a reactive widget to an existing app,
enhance a server-rendered multi-page site, or build a single-page application.
No virtual DOM, JSX, required compiler, or runtime dependencies.

Version **4.0.0** is Brio's first npm release.

The npm package is **`@jnreis/briojs`**; the framework is Brio.js and the
standalone browser API remains `brio`.

## Quick start

### With npm

```sh
npm install @jnreis/briojs
```

```html
<div id="counter">
  <button b-on-click="$data.count++">
    Count: <span b-text="$data.count"></span>
  </button>
</div>
```

```js
import { createApp } from '@jnreis/briojs';

const app = createApp({ state: () => ({ count: 0 }) });
app.mount('#counter');
```

Run the JavaScript after the element exists. Brio only owns the DOM you mount;
the rest of the page stays under its existing owner's control.

### With a script tag

Save this as an HTML file and serve it from any static server:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>My first Brio widget</title>
  <style>[b-cloak] { display: none; }</style>
</head>
<body>
  <div id="counter" b-cloak>
    <button b-on-click="$data.count++">
      Count: <span b-text="$data.count"></span>
    </button>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/@jnreis/briojs@4.0.0/dist/brio.min.js"></script>
  <script>
    const app = brio.createApp({ state: () => ({ count: 0 }) });
    app.mount('#counter');
  </script>
</body>
</html>
```

Use `brio.dev.min.js` instead during development for the live inspector.
To self-host, copy scripts from `node_modules/@jnreis/briojs/dist/` to your public assets.
Do not load both core builds on the same page.

## What Brio provides

- **HTML directives:** text and attribute bindings, events and key modifiers,
  two-way form models, keyed lists, conditional branches, transitions, refs,
  wrapperless templates, teleports, and DOM observers.
- **Fine-grained reactivity:** plain-object and array state, signals, computed
  values, synchronous effects, explicit batching, and cancellable async resources.
  Use these independently through `@jnreis/briojs/reactivity`, even without a DOM.
- **Explicit ownership:** app and component scopes clean up effects, listeners,
  observers, and resources when removed. Mount several independent apps on a page.
- **Reusable HTML components:** setup functions, reactive props, emitted events,
  slots, shared stores, and subtree-provided values.
- **Optional tools:** routing, persistence, HTTP, validation, step navigation,
  money formatting, devtools, and Astro island lifecycle integration.
- **Useful diagnostics:** template errors identify the expression, directive,
  element, enclosing component, and original cause.

State and props are explicit in expressions: `$data.count`, `$props.label`,
`$for.item`, `$ref.input`. Brio does not guess which scope a bare name belongs to.

## Add only what you need

The npm package is ESM with TypeScript declarations and tree-shakable exports.
There is no CommonJS build.

```js
import { createApp } from '@jnreis/briojs';
import { computed, effect, signal } from '@jnreis/briojs/reactivity';
import { createRouter } from '@jnreis/briojs/router';
import { persist } from '@jnreis/briojs/persistence';
import { http, HttpError } from '@jnreis/briojs/http';
import { validate } from '@jnreis/briojs/forms';
import { createStepEngine } from '@jnreis/briojs/step';
import { moneyMask } from '@jnreis/briojs/money-mask';
```

Most tools are also named exports from `@jnreis/briojs`; subpaths make intent explicit.
For standalone browser apps, load the matching optional scripts **after** core
and **before** your bootstrap:

```html
<script src="https://cdn.jsdelivr.net/npm/@jnreis/briojs@4.0.0/dist/brio.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@jnreis/briojs@4.0.0/dist/brio.router.min.js"></script>
<script src="/app.js"></script>
```

Keep core and plugin versions aligned. Optional scripts reuse core's reactive
engine rather than embedding another runtime.

## Learn and explore

- [Documentation](./DOCUMENTATION.md): directives, components, reactivity,
  routing, lifecycle, and every optional tool.
- [Changelog](./CHANGELOG.md): the consolidated 4.0 release and private history.
- [AI developer kit](./ai/README.md): a portable application guide, optional
  assistant skills, and tested widget, multi-page, and SPA recipes.
- [Contributing and release guide](https://github.com/jnreis/briojs/blob/main/CONTRIBUTING.md):
  development, tests, benchmarks, package checks, and publishing.

From a repository checkout:

```sh
npm install
npm run build
npm run dev -- --open /tests/index.html
```

The [example gallery](https://github.com/jnreis/briojs/tree/main/tests/apps)
includes a counter, temperature converter, registration form, TodoMVC, 7GUIs,
a 1,000-row table, analytics dashboard, Conduit blog, Kanban board, and
collaborative editor. Backend-dependent examples use in-memory mock servers;
they are demonstrations, not production backends.

## Browser and security considerations

Brio targets modern browsers. Optional observer directives and CSS features
depend on native browser support. It enhances client-side DOM; it does not
provide server rendering.

Expressions are trusted application JavaScript compiled with `new Function`,
not a sandbox. A CSP that forbids `unsafe-eval` is incompatible with runtime
expressions. Use `b-text` for user content. `b-html` is not a sanitizer, and
`trustedHTML()` is a trust assertion, not sanitization. See
[HTML and expression security](./DOCUMENTATION.md#trusted-html-and-expression-security).

## License

[MIT](./LICENSE) — Jonathan Reis.
