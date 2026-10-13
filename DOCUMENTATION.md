# Brio.js vNext

Brio is a petite, HTML-first framework for reactive widgets and web apps. It enhances real DOM nodes in place; there is no virtual DOM, JSX transform, or required compiler. Use it for one small island on a server-rendered page, several independent widgets, or a client-side application.

**Version 4 is a clean break from the v3 API.** The package entry point now exposes the vNext runtime. The old v3 sources are not part of the published package API.

## Install

```sh
npm install briojs
```

```js
import { createApp } from 'briojs';
```

The package publishes tree-shakable ESM entry points. Import only the capabilities you use:

```js
import { createApp } from 'briojs';
import { state, effect, computed, batch } from 'briojs/reactivity';
import { persist } from 'briojs/persistence';
import { createRouter } from 'briojs/router';
```

The development tools are deliberately separate:

```js
import { devtoolsPanel } from 'briojs/devtools';
```

Import that entry before creating apps to register apps and effects with the development inspector. Production applications that do not import `briojs/devtools` do not include the inspector UI or its instrumentation.

## First app

```js
import { createApp } from 'briojs';

const app = createApp({
  state: () => ({ count: 0 }),
});

app.mount('#counter');
```

```html
<section id="counter">
  <button b-on-click="count++">
    Count: <span b-text="count"></span>
  </button>
  <p b-text="`Twice: ${count * 2}`"></p>
</section>
```

Expressions see the nearest `b-data` scope, component setup values, and app state, in that order. Missing names can resolve to JavaScript globals. Event expressions also receive `$event`.

## HTML directives

Directive names use **letters and hyphens only**. There is no colon/modifier syntax. Arguments are part of the directive name: `b-on-click`, `b-bind-href`. Unknown directives and malformed expressions throw errors with the expression or element context.

| Directive | Purpose |
| --- | --- |
| `b-data` | Create a nested state scope from an object expression. |
| `b-text` | Reactively set an element's text content. |
| `b-bind-name` | Reactively bind an attribute or DOM property, e.g. `b-bind-href="url"`. |
| `b-on-event` | Listen for a DOM event, e.g. `b-on-submit="save($event)"`. |
| `b-model` | Two-way bind a text-like input, checkbox, radio, or select. |
| `b-if` | Insert or remove an element and its owned effects. |
| `b-show` | Toggle visibility while keeping the element mounted. |
| `b-for` | Render an array, iterable, object, or integer. |
| `b-key` | Give a repeated item a stable string or number identity. Used with `b-for`. |
| `b-html` | Insert explicitly trusted HTML created by `trustedHTML()`. |
| `b-ignore` | Skip hydration for this element and its descendants. |
| `b-router-outlet` | Render the component matching the current optional route. |

```html
<div b-data="{ query: '', visible: true, results: ['Brio', 'HTML'] }">
  <label>
    Search
    <input b-model="query">
  </label>

  <button b-on-click="visible = !visible">Toggle results</button>
  <ul b-if="visible">
    <li b-for="result, index in results" b-key="result">
      <span b-text="`${index + 1}. ${result}`"></span>
    </li>
  </ul>
</div>
```

`b-for` uses `item in items` or `item, index in items`. Without `b-key`, the index is the key; provide a stable key when items can be inserted, removed, or reordered. Duplicate keys are errors.

`b-bind-*` binds a DOM property when one exists; otherwise it sets or removes the corresponding attribute. `false`, `null`, and `undefined` remove attributes. `class` accepts a string, array, or object of class names and booleans. `style` accepts a style object.

## Components

Components are a first-party feature. Define them with a hyphenated custom-element name, an HTML template, and an optional setup function:

```js
import { createApp } from 'briojs';

const app = createApp({ state: () => ({ label: 'Clicks' }) });

app.component('click-counter', {
  template: `
    <button b-on-click="count.value++">
      <span b-text="props.label"></span>:
      <span b-text="count.value"></span>
      <slot></slot>
    </button>
  `,
  setup({ props, emit }) {
    return {
      count: { value: 0 },
      notify() { emit('change', props.label); },
    };
  },
});

app.mount('#widgets');
```

```html
<main id="widgets">
  <click-counter b-bind-label="label" b-on-change="console.log($event.detail)">
    Tap to increment
  </click-counter>
</main>
```

Static host attributes become string props; `b-bind-name` supplies a reactive prop. Setup also receives the host element as `el`. Component events are bubbling `CustomEvent`s emitted with `emit(name, detail)`. Named slots use `slot="name"` on projected content and `<slot name="name">` in the template. Component setup runs in an owned scope; effects, persistence, and listeners registered during setup are disposed when the component is removed.

## Three ways to use Brio

### A widget in an existing app

Mount a small root without taking over its host page. Non-overlapping roots can share app state; separate apps are isolated:

```js
const widget = createApp({ state: () => ({ open: false }) });
const handle = widget.mount('#account-menu');

// When the host removes this widget:
handle.unmount();
```

Unmount restores the mount root's original attributes and child markup. `app.unmount()` unmounts all roots but leaves the app reusable. `app.dispose()` unmounts every root and permanently closes the app.

### Multi-page site

Use ordinary server routes and HTML for navigation. Mount Brio only around the interactive areas on each page. Full-page links continue to work without Brio or when no client route matches.

### Single-page app

Use the optional router when client-side navigation is useful:

```js
import { createApp } from 'briojs';
import { createRouter } from 'briojs/router';

const router = createRouter([
  { path: '/', component: 'home-page' },
  { path: '/items/:id', component: 'item-page' },
]);

createApp({ router })
  .component('home-page', { template: '<h1>Home</h1>' })
  .component('item-page', {
    template: '<h1>Item <span b-text="route.value.params.id"></span></h1>',
    setup({ app }) {
      return { route: app.router.current };
    },
  })
  .mount('#app');
```

```html
<div id="app">
  <nav>
    <a href="/">Home</a>
    <a href="/items/42">An item</a>
  </nav>
  <div b-router-outlet></div>
</div>
```

`createRouter()` supports static paths and `:parameter` segments. It uses the History API for same-origin matches, responds to back/forward, and leaves modified clicks, external links, downloads, and unmatched routes to normal browser navigation.

## Reactive primitives

The standalone reactivity entry works without a DOM:

```js
import { batch, computed, createScope, effect, signal, state } from 'briojs/reactivity';

const scope = createScope();
scope.run(() => {
  const cart = state({ items: [{ price: 4, quantity: 2 }] });
  const total = computed(() =>
    cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );
  effect(() => console.log(total.value));

  batch(() => {
    cart.items[0].price = 5;
    cart.items[0].quantity = 3;
  });
});

scope.dispose(); // Stops effects and nested scopes created in the scope.
```

- `state(value)` observes plain objects and arrays and preserves cycles/shared references.
- `signal(value)` provides a reactive `.value` for primitives and replaceable values.
- `computed(fn)` is lazy, cached, and invalidated by the values it reads.
- `effect(fn)` recollects its dependencies each run and returns an idempotent stop function.
- `batch(fn)` runs affected effects once after a synchronous group of writes.
- `createScope()` owns nested scopes and effect cleanup. `onCleanup(fn)` registers cleanup in the current scope and errors if there is no active scope. A computed value created outside a scope can be stopped with `.dispose()`.

Effects run synchronously by default. Explicit batches are synchronous too; there is no hidden next-tick scheduler.

## Persistence

Import persistence where needed. Create persistent values inside an app/component setup function or an explicit reactive scope so disposal removes both its effect and cross-tab listener:

```js
import { createApp } from 'briojs';
import { persist } from 'briojs/persistence';

createApp().component('preferences-panel', {
  template: `
    <label>
      Theme
      <select b-model="preferences.theme">
        <option>light</option>
        <option>dark</option>
      </select>
    </label>
  `,
  setup() {
    return {
      preferences: persist('preferences', { theme: 'light' }),
    };
  },
}).mount('#preferences');
```

Objects and arrays are reactive directly. Primitive values are returned as signals and use `.value`. The default adapter is `localStorage`; select `sessionStorage` or pass a `getItem`/`setItem` adapter with `{ storage }`. JSON serialization errors and storage errors are surfaced. Cross-tab updates are applied to the existing reactive value.

## Trusted HTML and expression security

Directive expressions are ordinary JavaScript compiled and cached at runtime with `new Function`. They are authored application code, **not a sandbox**; the approach is incompatible with a strict CSP that disallows `unsafe-eval`. Never render untrusted content as a Brio template or directive expression.

`b-text` writes text, not HTML. `b-html` accepts only an explicit trusted value:

```js
import { trustedHTML } from 'briojs';

createApp({ state: () => ({ content: '<em>Trusted</em>' }) }).mount('#content');
```

```html
<div id="content" b-html="trustedHTML(content)"></div>
```

Only call `trustedHTML()` with content your application has sanitized or authored.

## Devtools

Import the separate development entry before creating apps, then mount its inspector:

```js
import { devtoolsPanel } from 'briojs/devtools';

const stopInspector = devtoolsPanel(document.querySelector('#brio-tools'));
```

The inspector tracks app state snapshots, mounted roots, and reactive effect counts. Call the returned function to remove the panel and its subscription. The devtools entry is not imported by the core package entry.

## App and lifecycle API

```ts
createApp({
  state?: () => Record<string, unknown>,
  components?: Record<string, ComponentDefinition>,
  router?: Router,
  plugins?: BrioPlugin[],
})
```

- `app.component(name, definition)` registers a reusable component; names must be valid hyphenated custom-element names.
- `app.plugin(plugin)` installs a plugin once per app.
- `app.mount(elementOrSelector)` mounts one independently disposable root and returns `{ root, unmounted, unmount() }`.
- `app.unmount()` unmounts all roots; the app remains mountable.
- `app.dispose()` permanently disposes the app and its scopes.
- `app.state` is shared by roots mounted from that app.

The mount root is owned by Brio: unmount restores its original attributes and children. Put `b-if` and `b-for` on descendants, not on the mount root.

Framework SSR and hydration are not part of this release. Brio enhances existing HTML on the client, so server-rendered multi-page sites need no Brio server runtime.

## Package and migration

Version 4 is not API-compatible with version 3. Replace `newApp()` with `createApp()`, `$state` with app state or the `state()` import, `$effect` with `effect()`, and the previous directives with the table above. Router, persistence, and devtools are first-party package subpaths. Review all templates: directives now require hyphen-only names, expressions are explicitly trusted JavaScript, and HTML insertion requires `trustedHTML()`.

The package exports:

- `briojs`: app, components, DOM enhancement, trusted HTML, and core types.
- `briojs/reactivity`: state, signals, effects, computed values, batching, and scopes.
- `briojs/persistence`: scope-owned local/session/custom storage.
- `briojs/router`: optional history router.
- `briojs/devtools`: development-only instrumentation and inspector panel.
