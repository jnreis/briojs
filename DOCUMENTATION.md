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

### Browser bundles

Load one of the standalone bundles, not both:

```html
<!-- Production: runtime without development tools or tracking hooks -->
<script src="/dist/brio.min.js"></script>
<!-- During development, use this instead: -->
<!-- <script src="/dist/brio.dev.min.js"></script> -->
```

Both expose `window.brio` with `createApp`, `state`, `signal`, `computed`,
`effect`, `batch`, `createScope`, `onCleanup`, `persist`, `createRouter`,
`createStepEngine`, `validate`, `http`, and `trustedHTML`. Both dispatch the
`brio` ready event after publishing the complete API.

The development bundle additionally exposes `devtools`, `inspectDevtools`, and
`devtoolsPanel`. The production bundle compiles out devtools tracking hooks and
does not include the inspector or reactive state snapshotting.
The browser global no longer exposes `hydrateRoot` or `hydrateNode`; those
remain available through ESM. Use `app.insert()` for managed dynamic content.
The legacy `newStepEngine` tuple API has been removed from all exports; use
`createStepEngine()` and its named methods instead.

## AI-assisted application development

The [portable AI developer kit](./ai/README.md) includes a tool-neutral
[Brio v4 application guide](./ai/brio-apps/references/guide.md), an on-demand
skill, and runnable widget, multi-page enhancement, and SPA recipes. It ships
in the npm package under `ai/`. Read the kit's installation instructions before
copying the entire skill folder to a supported assistant location; npm
installation does not activate it. These resources guide app development, not
framework maintenance, and generated code still requires review and testing.

Applications running 1.1.5 should use the separate
[migration skill](./ai/brio-migrate-1-1-5/SKILL.md) and
[migration guide](./ai/brio-migrate-1-1-5/references/migration.md). V4 is not a
drop-in replacement; the kit documents legacy contracts, unsupported surfaces,
behavioral decisions, and verification before production rollout.

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
  <button b-on-click="$data.count++">
    Count: <span b-text="$data.count"></span>
  </button>
  <p b-text="`Twice: ${$data.count * 2}`"></p>
</section>
```

Expressions run in strict mode without `with` or implicit state-name resolution. Use `$data` for the nearest state object (app state, component setup state, or `b-data`), `$data.$parent` for parent state, and `$for` for loop values. Bare state names such as `count` are not supported and unresolved identifiers throw `ReferenceError`. JavaScript globals such as `Math`, `JSON`, and `setTimeout` resolve normally.

The context is also available as `ctx`. Named bindings include `$data`, `$el`, `$id`, `$for`, `$props`, `$emit`, `$insert`, and `trustedHTML`. Event handlers receive `$event`; observers supply `$mutations`, `$size`, or `$entry`. The mask directive supplies `money`, and contextual scripts supply `onCleanup`. Helpers not supplied in that context are `undefined`. Bindings are read-only references; mutate their properties (`$data.count++`), not the binding itself (`$data = {}`). Event statements can declare ordinary local variables.

Data and loop ancestry are independent: `$data.$parent.$parent` accesses a grandparent data scope, while `$for.$parent.$parent` accesses a grandparent loop. Ordinary elements and loops do not add data ancestry levels; data scopes do not add loop ancestry levels. Component setup state creates a data scope. App state and outermost loops have `$parent === undefined`. An empty `b-data` attribute inherits data without adding a scope; `b-data="{}"` creates one.

`$parent` is reserved, read-only metadata on scope-specific views, not a field added to user state. It is excluded from keys, spreads, and JSON serialization. The same underlying state object may have different parents in different scopes. Normal reads, writes, and methods remain reactive. Use `ctx` for other helpers; standalone `$parent` and `ctx.$parent` are no longer provided.

## HTML directives

Directive arguments use hyphens (`b-on-click`, `b-bind-href`); options use chained dot modifiers (`on-click.prevent.stop`, `b-show.display`, `b-mask.money`).

| Directive | Purpose |
| --- | --- |
| `b-data` | Create a nested state scope from an object expression. |
| `b-text` | Reactively set an element's text content. |
| `b-bind-name` | Reactively bind an attribute or DOM property, e.g. `b-bind-href="$data.url"`. |
| `b-on-event` | Listen for a DOM event, e.g. `b-on-submit="$data.save($event)"`. |
| `b-model` | Two-way bind a text-like input, checkbox, radio, or select. |
| `b-if`, `b-else-if`, `b-else` | Mount one conditional branch; dispose its state scope, effects, and listeners when it becomes false. |
| `b-show` | Detach the element without dehydrating it; `.display` uses CSS display instead. |
| `b-script` | Execute a contextual function expression inside a marked script element. |
| `b-mask` | Format an input with a pattern string or `money(options)`. |
| `b-transition` | Animate enter/leave with named CSS transition classes. |
| `b-for` | Render an array, iterable, object, or integer. |
| `b-key` | Give a repeated item a stable string or number identity. Used with `b-for`. |
| `b-html` | Insert explicitly trusted HTML created by `trustedHTML()`. |
| `b-ignore` | Skip hydration for this element and its descendants. |
| `b-router-outlet` | Render the component matching the current optional route. |

```html
<div b-data="{ query: '', visible: true, results: ['Brio', 'HTML'] }">
  <label>
    Search
    <input b-model="$data.query">
  </label>

  <button b-on-click="$data.visible = !$data.visible">Toggle results</button>
  <ul b-if="$data.visible">
    <li b-for="result, index in $data.results" b-key="$for.result">
      <span b-text="`${$for.index + 1}. ${$for.result}`"></span>
    </li>
  </ul>
</div>
```

`b-for` uses `item in $data.items` or `item, index in $data.items`. These names declare properties of `$for`, so row expressions use `$for.item` and `$for.index`. Without `b-key`, the index is the key; provide a stable key when items can be inserted, removed, or reordered. Duplicate keys are errors.

`b-bind-*` binds a DOM property when one exists; otherwise it sets or removes the corresponding attribute. `false`, `null`, and `undefined` remove attributes. `class` accepts a string, array, or object of class names and booleans. `style` accepts a style object.

### Conditional lifecycle

`b-else-if` and `b-else` follow an adjacent `b-if` branch (whitespace and comments are allowed between branches). The first true branch is mounted; `b-else` is the final fallback. Conditions run in the parent scope.

```html
<section b-if="$data.loggedIn" b-data="{ clicks: 0 }">
  <button on-click="$data.clicks++">${$data.clicks}</button>
</section>
<p b-else-if="$data.loading">Loading...</p>
<p b-else>Please log in.</p>
```

When a branch becomes false, its bindings and listeners are disposed immediately. Its next mount recreates branch-local `b-data` and component state. Parent/app state is not reset. With a transition, the exiting DOM is an inert visual snapshot until the animation finishes.

`b-show` preserves the same node, bindings, and local state when detached. `b-show.display` preserves it in the DOM using `display: none`. Both modes animate on subsequent show/hide changes, and a reversed toggle cancels pending removal.

### Contextual scripts

Only `<script b-script>` is processed. Write an unassigned arrow expression so the browser does not execute its body:

```html
<script b-script>
  (ctx) => {
    ctx.$data.ready = true;
    const timer = setTimeout(() => { ctx.$data.message = 'Ready'; }, 250);
    ctx.onCleanup(() => clearTimeout(timer));
  }
</script>
```

Brio constructs a function factory with an explicit context parameter, then invokes the returned function with that context; scripts do not use `with`. Context includes `$data`, `$el`, `$id`, `$for`, and `$event` when supplied by the caller. Parent state is accessed with `$data.$parent`. `$el` is the script element. The same helpers are available as lexical bindings, so `() => { $data.ready = true; }` also works. Async arrows and destructured parameters are supported; errors are surfaced without retrying the script. Async initialization does not block mounting; initialize values used by the template before the first `await`. Register timer/listener cleanup synchronously through `ctx.onCleanup`.

### Money masks

```html
<input b-mask="money({ thousands: '.', decimal: ',', precision: 2 })">
<input b-mask.money="{ thousands: ' ', decimal: ',', precision: 3 }">
```

Options default to `thousands: ','`, `decimal: '.'`, `precision: 2`. Precision is an integer from 0 to 100. Digits are interpreted as fixed-precision minor units: `123456` becomes `1.234,56` in the first example. Options may reference reactive state and are forwarded to the formatter. `b-mask.money` without an expression and `b-mask="'money'"` use defaults. Pattern masks use expressions such as `b-mask="'(###) ###-####'"`.

Masks preserve the focused input's caret and selection when formatting changes its value. Pattern deletions snap to the preceding editable character rather than a separator; money masks anchor the caret to the digits to its right so grouping and zero padding do not send it to the end.

### CSS transitions

`b-transition="'fade'"` uses `fade-enter`, `fade-enter-active`, `fade-enter-to`, and the corresponding `fade-leave*` classes. The default name is `brio`. Define CSS `transition` properties on the active classes and starting/ending styles on the other classes.

Brio tracks the element's own `transitionrun`, `transitionend`, and `transitioncancel` events for every running property, ignoring descendant events. Removal waits for all properties, including delays. A fallback uses computed CSS duration plus delay, not a fixed timeout. No-duration/reduced-motion styles complete without waiting for an event; unmount cancels pending frames, listeners, and timers. This directive handles CSS transitions, not keyframe animations.

Reversing a running `b-show` transition retargets its CSS properties from their current interpolated values, without replaying the opposite starting pose. A new `b-if` instance still enters from its starting pose because the previous branch has already been dehydrated.

## Components

Components are a first-party feature. Define them with a hyphenated custom-element name, an HTML template, and an optional setup function:

```js
import { createApp } from 'briojs';

const app = createApp({ state: () => ({ label: 'Clicks' }) });

app.component('click-counter', {
  template: `
    <button b-on-click="$data.count.value++">
      <span b-text="$props.label"></span>:
      <span b-text="$data.count.value"></span>
      <slot></slot>
    </button>
  `,
  setup({ $props, $emit }) {
    return {
      count: { value: 0 },
      notify() { $emit('change', $props.label); },
    };
  },
});

app.mount('#widgets');
```

```html
<main id="widgets">
  <click-counter b-bind-label="$data.label" b-on-change="console.log($event.detail)">
    Tap to increment
  </click-counter>
</main>
```

Static host attributes become string props; `b-bind-name` supplies a reactive prop through `$props`. Setup receives `$props`, `$emit`, the host element as `el`, and `app`. Templates and contextual scripts also access `$props` and `$emit`. Component events are bubbling `CustomEvent`s emitted with `$emit(name, detail)`. The previous `props` and `emit` names are not aliases. Named slots use `slot="name"` on projected content and `<slot name="name">` in the template. Component setup runs in an owned scope; effects, persistence, and listeners registered during setup are disposed when the component is removed.

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
    template: '<h1>Item <span b-text="$data.route.value.params.id"></span></h1>',
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

Import persistence where needed. Create persistent values inside component setup, an app plugin, or an explicit reactive scope so disposal removes both its effect and cross-tab listener. The app's `state` factory does not itself run in an owned scope:

```js
import { createApp } from 'briojs';
import { persist } from 'briojs/persistence';

createApp().component('preferences-panel', {
  template: `
    <label>
      Theme
      <select b-model="$data.preferences.theme">
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

Directive expressions are ordinary strict-mode JavaScript compiled and cached at runtime with `new Function`, without `with`. They are authored application code, **not a sandbox**; the approach is incompatible with a strict CSP that disallows `unsafe-eval`. Never render untrusted content as a Brio template or directive expression.

`b-text` writes text, not HTML. Use an explicit trusted value for `b-html` (the current implementation also accepts ordinary strings; the helper does not enforce sanitization):

```js
import { trustedHTML } from 'briojs';

createApp({ state: () => ({ content: '<em>Trusted</em>' }) }).mount('#content');
```

```html
<div id="content" b-html="trustedHTML($data.content)"></div>
```

Only call `trustedHTML()` with content your application has sanitized or authored.

## Devtools

Import the separate development entry before creating apps, then mount its inspector:

```js
import { devtoolsPanel } from 'briojs/devtools';

const stopInspector = devtoolsPanel(document.querySelector('#brio-tools'));
```

The inspector tracks app state snapshots, mounted roots, and reactive effect counts. Call the returned function to remove the panel and its subscription. The devtools entry is not imported by the core package entry.

With the development browser bundle, use
`brio.devtoolsPanel(document.querySelector('#brio-tools'))` directly.

## App and lifecycle API

### Managed dynamic insertion

```js
const handle = app.insert('#items', 'append',
  '<button on-click="$data.count++">${$data.count}</button>',
  { data: { count: 0 } });
handle.remove();
```

`app.insert(target, placement, content, options?)` accepts a node or selector;
placements are `before`, `after`, `prepend`, `append`, `replaceWith`,
`replaceChildren`, and `textContent`. HTML strings are automatically trusted
and hydrated. Nodes and document fragments are cloned, leaving the originals
untouched. Multiple top-level nodes and structural directives are supported.
`textContent` inserts literal text without parsing HTML or evaluating interpolation.

The app method is `insert` (without `$`); the matching `$insert` helper is available in directive expressions and `ctx.$insert`
in scripts. Its selectors are restricted to the originating mount root.
App-level selectors must resolve within exactly one of that app's mounted roots;
missing, ambiguous, cross-app, and disposed targets throw. Direct node references
also work for child placements on managed detached `b-show` elements and teleported
elements. A contextual helper expires when its mount is unmounted, even if the
same root element is mounted again.

Child placements inherit the target's context; sibling placements inherit its
parent's context. `{ data }` creates local reactive state with inherited state
accessible through `$data.$parent`; loop context remains available through `$for`.
Inserted content is owned by the destination scope, not the calling button/script.
The handle exposes current `nodes`, `removed`, and an idempotent `remove()`.
Removal, replacement, enclosing scope disposal, and unmount clean up bindings,
listeners, and nested insertions. Raw DOM removal does not trigger cleanup.

Mount roots cannot be replaced or used for sibling placements. Containers owned
by `b-ignore`, `b-text`, `b-html`, or router outlets reject child insertion rather
than competing with those directives. Roots generated by `b-if` and `b-for`
cannot be replaced directly, since those controllers retain their identities;
replace the enclosing container's children instead. Replacement is destructive: old content
is disposed first; a hydration failure removes the failed insertion and throws,
but does not restore the old content.

Use authored or sanitized markup only. Automatic `trustedHTML` is an ergonomic
trust assertion, not sanitization; inserted expressions and scripts execute code.

### Low-level dynamic hydration

ESM imports expose `hydrateRoot(element, context, runtime)` and `hydrateNode(node, context, runtime)`; these are no longer on the browser global. These are low-level APIs: supply an explicit context (including `$data`), a runtime with `app`, `state`, and `components`, and invoke hydration inside `createScope().run(...)`. Dispose that scope before removing or replacing the hydrated content; raw DOM removal does not dispose bindings or listeners. Hydrate only new content, not an already hydrated subtree. Prefer `app.mount()` for independent roots, since it manages runtime and cleanup automatically.

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

Version 4 is not API-compatible with version 3. Replace `newApp()` with `createApp()`, `$state` with app state or the `state()` import, `$effect` with `effect()`, and the previous directives with the table above. Router, persistence, and devtools are first-party package subpaths. Review all templates: state access requires `$data` or `$data.$parent`, loop values require `$for` (outer loop values use `$for.$parent`), arguments use hyphens and modifiers use dots, expressions are explicitly trusted strict-mode JavaScript, and `b-html` requires `trustedHTML()` (`$insert` trusts authored markup automatically). Migrate `$parent.$parent.$data` to `$data.$parent.$parent`.

The package exports:

- `briojs`: app, components, DOM enhancement, trusted HTML, and core types.
- `briojs/reactivity`: state, signals, effects, computed values, batching, and scopes.
- `briojs/persistence`: scope-owned local/session/custom storage.
- `briojs/router`: optional history router.
- `briojs/devtools`: development-only instrumentation and inspector panel.
