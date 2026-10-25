# Brio.js 5

Brio is a petite, HTML-first framework for reactive widgets and web apps. It enhances real DOM nodes in place; there is no virtual DOM, JSX transform, or required compiler. Use it for one small island on a server-rendered page, several independent widgets, or a client-side application.

Version 4.0.0 was the first npm release of this reimagined framework; the current release is 5.0.0.
Upgrading from 4.x? See [Migrating from Brio 4](#migrating-from-brio-4).
Earlier versions in the repository were private development
iterations, not npm releases.

## Contents

- [Installation and browser bundles](#install)
- [First app](#first-app)
- [Shared stores](#shared-stores) and [subtree-provided values](#subtree-provided-values)
- [HTML directives](#html-directives) and [directive combinations](#directive-combinations-and-conflicts)
- [Components](#components) and [CSS](#recommended-css)
- [Widgets, multi-page sites, and SPAs](#three-ways-to-use-brio)
- [Reactive primitives](#reactive-primitives) and [async resources](#async-resources)
- [Step navigation](#step-navigation), [HTTP](#http), [form validation](#form-validation), and [persistence](#persistence)
- [HTML and expression security](#trusted-html-and-expression-security)
- [Errors](#errors) and [devtools](#devtools)
- [Lifecycle and insertion](#app-and-lifecycle-api)
- [Plugins: your own directives and helpers](#plugins)
- [Astro islands](#astro-islands)
- [Package entry points](#package-entry-points) and [migrating from Brio 4](#migrating-from-brio-4)

## Install

Choose the setup that fits your page: an npm import for bundled apps, or a
script tag for a quick start without a build step.

### Scaffold a project

The separate `create-brio` CLI is implemented but not yet published. After its
release alongside Brio 5, use:

```sh
npm create brio@latest
npm create brio@latest my-app -- --template spa --language ts --package-manager npm
```

Choose widget, multi-page, SPA, Astro, or plugin; each supports JavaScript and
TypeScript. It includes editor settings and prints the install/dev commands.
No automatic dependency installation or git initialization; nonempty
directories are rejected without overwriting files. In non-interactive
environments, provide all choices or pass `--yes` for defaults.
Until publication, use the
[local scaffolder instructions](https://github.com/jnreis/briojs/tree/main/packages/create-brio).

### Install with npm

```sh
npm install @jnreis/briojs
```

```js
import { createApp } from '@jnreis/briojs';
```

The package publishes tree-shakable ESM entry points. Import only the capabilities you use:

```js
import { createApp } from '@jnreis/briojs';
import { state, effect, computed, batch } from '@jnreis/briojs/reactivity';
import { persist } from '@jnreis/briojs/persistence';
import { createRouter } from '@jnreis/briojs/router';
import { http, HttpError } from '@jnreis/briojs/http';
import { inputsPlugin, validate, moneyMask } from '@jnreis/briojs/inputs';
import { observersPlugin } from '@jnreis/briojs/observers';
import { createStepEngine } from '@jnreis/briojs/step';
```

Directives that live in an add-on (`b-mask`, `b-form`, and the observer
directives) need the add-on's plugin on the app:

```js
createApp({ plugins: [inputsPlugin, observersPlugin] }).mount('#app');
```

### Editor autocomplete

The package ships `dist/html-custom-data.json`, which gives VS Code (and other
editors that read HTML custom data) completions, hover docs, and links for
every `b-` directive and its common modifiers. Add it to your project's
`.vscode/settings.json`:

```json
{
  "html.customData": ["./node_modules/@jnreis/briojs/dist/html-custom-data.json"]
}
```

Reload the window after adding it. Not using npm? Download
[html-custom-data.json](https://briojs.com/dist/html-custom-data.json) into
your project and point the setting at that copy.

Building tooling of your own? `dist/directives.json` is the machine-readable
directive manifest the custom data is generated from: names, values,
modifiers, examples, and docs links.

### Add development tools when you need them

The development tools are deliberately separate:

```js
import { devtoolsPanel } from '@jnreis/briojs/devtools';
```

Import that entry before creating apps to enable the development inspector.
All tooling is also available from the npm main entry without implicit activation:

```js
import { createApp, enableDevtools, inspectDevtools, devtoolsPanel } from '@jnreis/briojs';
enableDevtools(); // Development only; before creating apps.
```

Unused devtools exports can be tree-shaken. Main-entry imports alone do not
enable snapshotting; the dedicated `@jnreis/briojs/devtools` entry enables it automatically.

### Browser bundles

Load one of the standalone bundles, not both:

```html
<!-- Production: runtime without development tools or tracking hooks -->
<script src="https://cdn.jsdelivr.net/npm/@jnreis/briojs@5.0.0/dist/brio.min.js"></script>
<!-- During development, use this instead: -->
<!-- <script src="https://cdn.jsdelivr.net/npm/@jnreis/briojs@5.0.0/dist/brio.dev.min.js"></script> -->
```

For self-hosting, copy the desired scripts from `node_modules/@jnreis/briojs/dist/`
to your public assets.
The `/dist/` URLs below assume you serve them at that path. Pin core and plugins
to the same version; load the scripts before mounting your app.

Both expose `window.brio` with `createApp`, `state`, `signal`, `computed`,
`effect`, `batch`, `flush`, `untrack`, `resource`, `createScope`, `onCleanup`,
`getCurrentScope`, `trustedHTML`, `defineDirective`, `definePlugin`, and `use`. Both dispatch the
`brio` ready event after publishing the core API.

#### Add only the add-ons you use

Add-ons are optional browser scripts. Load only what you
need, **after** the core and **before** application bootstrap:

```html
<script src="/dist/brio.min.js"></script>
<script src="/dist/brio.router.min.js"></script>      <!-- brio.createRouter and b-router-outlet -->
<script src="/dist/brio.persistence.min.js"></script> <!-- brio.persist -->
<script src="/dist/brio.http.min.js"></script>        <!-- brio.http, brio.HttpError -->
<script src="/dist/brio.inputs.min.js"></script>      <!-- b-mask, b-form, brio.validate, brio.moneyMask -->
<script src="/dist/brio.observers.min.js"></script>   <!-- b-on-enter/exit/resize and the mutation directives -->
<script src="/dist/brio.step.min.js"></script>        <!-- brio.createStepEngine -->
<script src="/app.js"></script>
```

- **Load order:** core first, needed add-ons second, application bootstrap last.
  Loading an add-on before the core throws. For deferred loading, wait for the
  needed scripts to finish, not just the core's `brio` ready event.
- **Automatic attachment:** an add-on that brings directives (inputs,
  observers) installs its plugin with `brio.use()`, so every app created
  afterwards has those directives. Apps created before the script loaded do not.
- **Shared runtime:** add-ons extend the existing `window.brio` and use its
  reactive engine and cleanup scopes. They do not dispatch another ready event,
  and work with the development core too.
- **Clear errors:** using an add-on directive without its add-on throws an
  error that names the script to load, for example
  `b-mask needs the Brio inputs add-on. Load brio.inputs.min.js after brio.min.js, …`.
- **ESM imports:** the npm main entry retains tree-shakable named exports for
  convenience; each add-on also has the dedicated subpath shown above. With
  npm, install add-on directives with `plugins: [inputsPlugin]` or
  `app.use(inputsPlugin)`.
  Importing a plugin has no implicit application registration in ESM.

#### Choose the right core bundle

| Bundle | Development tooling |
| --- | --- |
| `brio.min.js` | Compiles out devtools tracking hooks; no inspector or reactive state snapshotting. |
| `brio.dev.min.js` | Adds `devtools`, `inspectDevtools`, `devtoolsPanel`, and `enableDevtools`, with tracking enabled automatically. |

For dynamic content, start with `app.insert()`; for step navigation, use
`createStepEngine()`. The lower-level `hydrateRoot` and `hydrateNode` APIs are
ESM-only.

## AI-assisted application development

Want a coding assistant to help with your app? Start with the portable kit,
then review and test its output just as you would any other application code.

### Use the application kit

The [portable AI developer kit](./ai/README.md) includes a tool-neutral
[Brio v4 application guide](./ai/brio-apps/references/guide.md), an on-demand
skill, and runnable widget, multi-page enhancement, and SPA recipes. It ships
in the npm package under `ai/`. Read the kit's installation instructions before
copying the entire skill folder to a supported assistant location; npm
installation does not activate it. These resources guide app development, not
framework maintenance, and generated code still requires review and testing.

### Give an assistant the docs

The website publishes the documentation in the [llms.txt](https://llmstxt.org)
format for assistants and agents that read the web:

- [briojs.com/llms.txt](https://briojs.com/llms.txt): an index of every guide,
  reference page, AI kit resource, and example, with one-line summaries.
- [briojs.com/llms-full.txt](https://briojs.com/llms-full.txt): the complete
  guides and reference as one Markdown file, ready to paste or attach.

### Migrating an older app?

Applications running 1.1.5 should use the separate
[migration skill](./ai/brio-migrate-1-1-5/SKILL.md) and
[migration guide](./ai/brio-migrate-1-1-5/references/migration.md). V4 is not a
drop-in replacement; the kit documents legacy contracts, unsupported surfaces,
behavioral decisions, and verification before production rollout.

## First app

Start with a little state and a place to use it. This counter needs just two
pieces: JavaScript to mount the app, and HTML to describe the interaction.

### Give the counter some state

Run this JavaScript after the counter's HTML exists:

```js
import { createApp } from '@jnreis/briojs';

const app = createApp({
  state: () => ({ count: 0 }),
});

app.mount('#counter');
```

### Connect it to your HTML

```html
<section id="counter">
  <button b-on-click="$data.count++">
    Count: <span b-text="$data.count"></span>
  </button>
  <p b-text="`Twice: ${$data.count * 2}`"></p>
</section>
```

Click the button and both numbers update. Here's all that's happening:

- `state` creates the app's starting data: `{ count: 0 }`.
- `mount` connects Brio to `#counter`, leaving the rest of the page alone.
- `b-on-click` changes the count; `b-text` keeps the displayed text in sync.
- `$data.count` reads the count from the current state.

That's enough to start. The sections below explain the expression helpers and
scope rules you'll encounter as your app grows.

### Reading state in expressions

Brio uses explicit paths, so it's clear where a value comes from:

| To read... | Use |
| --- | --- |
| The nearest state (app state, component setup state, or `b-data`) | `$data` |
| Parent state | `$data.$parent` |
| Loop values | `$for` |
| JavaScript globals | `Math`, `JSON`, `setTimeout`, and other globals as usual |

Use `$data.count`, rather than bare `count`. Expressions run in strict mode,
without `with` or implicit state-name resolution. Unresolved identifiers throw
`ReferenceError`; when a bare name matches a loop variable, state key, or prop,
the error suggests the path to use. For example:

```text
count is not defined. Use $data.count.
item is not defined. Loop variables are read through $for: use $for.item.
```

### Helpers available to your HTML

The expression context is also available as `$context`.

| Where | Available bindings |
| --- | --- |
| Every expression | `$data`, `$el`, `$id`, `$ref`, `$for`, `$props`, `$emit`, `$insert`, `$stores`, `$provided`, `trustedHTML`, `flush` |
| Event handlers | `$event` |
| Observers | `$mutations`, `$size`, or `$entry` |
| Contextual scripts | `onCleanup` |
| Added by [plugins](#plugins) | App helpers such as `$format`, and names a plugin directive gives its subtree, such as `$form` |

Bindings are read-only references. Change writable state properties, not the
reference itself:

```js
$data.count++; // Update a state property.
// Don't reassign the binding: $data = {};
```

`$ref` names are also read-only. Event statements can declare ordinary local
variables.

### When you add nested scopes

Each nested context inherits from its parent through the prototype chain and stores only what it adds (for example its own `$el`). Reads such as `$context.$data` see the whole chain, but `Object.keys($context)` and spreads list only the element's own keys.

Data and loop ancestry are independent:

| Scope | Grandparent access | What adds a level? |
| --- | --- | --- |
| Data | `$data.$parent.$parent` | `b-data` with an expression, or component setup state |
| Loop | `$for.$parent.$parent` | A nested loop |

Ordinary elements and loops do not add data ancestry levels; data scopes do
not add loop ancestry levels. App state and outermost loops have
`$parent === undefined`. An empty `b-data` attribute inherits data without
adding a scope; `b-data="{}"` creates one.

`$parent` is reserved, read-only metadata on scope-specific views, not a field added to user state. It is excluded from keys, spreads, and JSON serialization. The same underlying state object may have different parents in different scopes. Normal reads, writes, and methods remain reactive. Access ancestry through `$data.$parent` and `$for.$parent`, and use `$context` for other helpers.

### A note on authored HTML

`trustedHTML` remains public for JavaScript-authored values, for example
`app.state.markup = brio.trustedHTML('<em>Authored content</em>')` with
`b-html.hydrate="$data.markup"`. Expressions also receive `trustedHTML` directly.
It marks trust intent, not sanitization; managed insertion uses it internally.
Default `b-html` also accepts unmarked strings but never activates Brio.

## Shared stores

Use a store when several parts of your page need the same data, such as a cart
or signed-in session. Sharing is explicit: you choose the values and the apps
that receive them.

### Register and read a store

One app's mounted roots share `app.state`. For named stores that must be
accessible regardless of local data or component boundaries, register them
with `createApp({ stores })`:

```js
const session = brio.state({ user: null });
const cart = brio.state({
  items: [],
  add(product) { this.items.push(product); },
});
const configuration = { apiBase: '/api' }; // Intentionally nonreactive.

const app = brio.createApp({ stores: { session, cart, configuration } });
app.mount('#catalog');
app.mount('#header');
// Another app can share the exact same store:
const widget = brio.createApp({ stores: { cart } });
widget.mount('#cart-widget');
```

```html
<section b-data="{ search: '' }">
  <span b-text="$stores.cart.items.length"></span>
</section>
```

### Where stores are available

| Where | Access |
| --- | --- |
| App expressions | `$stores` |
| Contextual scripts | `$context.$stores` |
| Component setup | `$stores` in the setup arguments |
| Plugins and application code | `app.stores` |

### Choose reactive values deliberately

Registration preserves the supplied values and identities and **does not make
them reactive**. Explicitly use `state()` for reactive objects/arrays or
`signal()` for primitive values (read signals through `.value`). Mutating a plain
store does not notify bindings, although another dependency may cause a later
read to see the new value.

### Registration and store lifetime

- `app.stores` is a shallow read-only, null-prototype snapshot. Names cannot be
  added, replaced, or deleted after app creation; store contents remain mutable.
- Missing names return `undefined`. No stores produces an empty mapping.
- Registration must be a plain object of enumerable own data properties, not
  an accessor registry.
- Unmounting or disposing an app does not reset or dispose shared stores. Own
  store effects/resources explicitly; registration creates neither a resource
  scope nor persistence.
- Normal stores last only for the current page. Use scoped `persist()` or an
  explicit backend/storage adapter for reloads and multi-page navigation.

## Subtree-provided values

Providers are useful for values that belong to one region of your app, such
as its theme or a shared cart. Children can use them without passing the same
prop through every level.

### Provide once, read below

Use `b-provide` to expose values on an element and throughout its Brio subtree.
Read them directly through `$provided`; no separate inject directive is needed:

```html
<section b-data="{ theme: 'dark' }"
         b-provide="{ theme: $data.theme, cart: $stores.cart }">
  <input b-model="$data.theme">
  <p b-text="$provided.theme"></p>
  <div b-provide="{ theme: 'light' }">
    <span b-text="$provided.theme"></span>
    <span b-text="$provided.cart.items.length"></span>
  </div>
</section>
```

### How inheritance works

- Provider expressions stay reactive: changing the outer theme updates
  consumers without remounting children.
- Nested providers override their own names and inherit others.
- An explicitly provided `undefined` shadows a parent value; removing the
  local key reveals the parent's value.
- Missing names return `undefined`. Outside a provider, `$provided` is an
  empty read-only mapping.

### Names are read-only; referenced state can change

Provided names are read-only: `$provided.theme = 'light'` throws. Referenced
objects are not frozen, so `$provided.cart.items.push(product)` can update the
provided reactive object. The expression must return a synchronous plain object
of enumerable own data properties. Invalid initial or updated results throw;
they are not silently accepted. `$provided` in the provider expression refers
to the inherited values, not its own result.

### Provider timing and scope

Providers run after same-element `b-data` and, on repeated elements, after row
`$for` exists. Other bindings on that element see its provided values.
`b-if` conditions still use their parent context before branch-local providers.
Providers do not add `$data.$parent` or `$for.$parent` levels.

| Consumer | Provider context |
| --- | --- |
| Component setup | Receives `$provided`; a host provider applies before setup. |
| Templates, scripts, routed views, managed inserted content | Inherit the applicable context. |
| Projected slots | Keep their caller/authoring context, not providers inside the component template. |
| Teleports | Keep their original context, not the physical destination's. |
| Child insertion | Inherits destination providers. |
| Sibling insertion | Inherits the parent container's providers. |

Provider effects stop when their owning scope is disposed. `b-if.hide` and
`b-if.detach` keep them active; a false unmodified `b-if` disposes them.

## HTML directives

Directives connect your HTML to state and behavior. Start with `b-text`,
`b-on-click`, and `b-model`, then reach for the others as you need them.

Directive arguments use hyphens (`b-on-click`, `b-bind-href`); options use chained dot modifiers (`b-on-click.prevent.stop`, `b-if.hide`). Every directive starts with `b-`; attributes without it, such as `on-click` or `text`, are left alone. `b-mask` takes a pattern or formatter, not modifiers.

### Directive quick reference

| Directive | Purpose |
| --- | --- |
| `b-data` | Create a nested state scope from an object expression. |
| `b-provide` | Provide live named values to this element and its subtree through `$provided`. |
| `b-id` | Generate named unique values in `$id`; bind them to `id`, `for`, or classes explicitly. |
| `b-ref` | Register a concrete element under a literal name in the local, read-only `$ref` registry. |
| `b-text` | Reactively set an element's text content. |
| `b-bind-name` | Reactively bind an attribute or DOM property, e.g. `b-bind-href="$data.url"`. |
| `b-on-event` | Listen for a DOM event, e.g. `b-on-submit="$data.save($event)"`. |
| `b-model` | Two-way bind a text-like input, checkbox, radio, or select. |
| `b-if`, `b-else-if`, `b-else` | Select the first matching branch. Default: remove/dehydrate inactive branches. `.hide`: preserve in the DOM; `.detach`: preserve outside the DOM. |
| `b-script` | Execute a contextual function expression inside a marked script element. |
| `b-mask` | Format an input with a Unicode pattern string or synchronous formatter function. `moneyMask(options)` returns a formatter. Inputs add-on. |
| `b-transition` | Animate enter/leave with named CSS transition classes. |
| `b-for` | Render an array, iterable, object, or integer. |
| `b-key` | Give a repeated item a stable string or number identity. Used with `b-for`. |
| `b-template` | Unwrap an element or instantiate a `<template>`'s contents in place, hydrating them without a rendered wrapper. Implied on a `<template>` that carries any `b-` directive. |
| `b-html` | Insert markup without activating Brio; `.hydrate` activates templates explicitly marked with `trustedHTML()`. |
| `b-ignore` | Skip hydration for this element and its descendants. |
| `b-cloak` | Removed when Brio hydrates the element; pair with `[b-cloak] { display: none; }` to hide raw templates until mount. |
| `b-teleport` | Reactively move an element or template range relative to an Element/ref or document selector. Default placement: `after`. |
| `b-effect` | Run a reactive expression for side effects in the element's owned scope. |
| `b-router-outlet` | Render the component matching the current route. Available when the app has a router. |
| `b-on-enter`, `b-on-exit` | Observe intersection/visibility changes. Observers add-on. |
| `b-on-addednodes`, `b-on-removednodes`, `b-on-attrs`, `b-on-text` | Observe DOM mutations. Observers add-on. |
| `b-on-resize` | Observe element or document size changes. Observers add-on. |
| `b-form` | Track a form's values, validation, and submission as `$form`; see [Bind a whole form](#bind-a-whole-form-with-b-form). Inputs add-on. |

Directives that end with "Inputs add-on" or "Observers add-on" need that add-on's script or plugin; see
[Add only the add-ons you use](#add-only-the-add-ons-you-use).

### Directive options

When a directive needs a value a modifier can't express, such as a delay in
milliseconds or an observer's `rootMargin`, add a matching `.options` attribute
holding an object:

```html
<input b-on-input="$data.search()" b-on-input.options="{ debounce: 400 }">
<div b-on-enter="$data.loadMore()" b-on-enter.options="{ rootMargin: '200px' }"></div>
<div b-on-exit="$data.pause()" b-on-exit.options="$data.exitOptions"></div>
```

- The value is any expression that evaluates to a plain object: a literal or a
  reference such as `$data.exitOptions`. It is read once at hydration and is not
  reactive.
- It applies to every attribute with the same base name on that element, so
  `b-on-enter.options` configures `b-on-enter.once` too. Attribute order doesn't
  matter.
- Modifiers are shorthands for `true`. When both are set, the `.options` value
  wins: `b-on-click.prevent` with `b-on-click.options="{ prevent: false }"` does
  not prevent.
- `.options` stands alone; `b-on-enter.once.options` is an error.
- Keys are checked. An unknown key, a directive that takes no options (for
  example `b-text.options`), or `.options` without its directive throws an error
  naming the problem.

Directives that take options: `b-on-*` (every [event modifier](#event-modifiers),
with `debounce` and `throttle` also accepting milliseconds) and the
[observer directives](#observer-options). Plugin directives opt in by listing
their keys; see [Plugins](#plugins).

### A few directives working together

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

### Lists and stable keys

`b-for` uses `item in $data.items` or `item, index in $data.items`. Those names
declare properties of `$for`: read `$for.item` and `$for.index` in the row.

- **Choose a stable key** when items can be inserted, removed, or reordered.
  Without `b-key`, the index is the key. Duplicate keys are errors.
- **Retained rows keep their identity.** Keyed reorders move only rows whose
  relative order changed; swapping two rows moves two rows.
- **Focus and selection stay with a moved row.** Brio uses the browser's
  state-preserving `moveBefore()` where available, otherwise it restores focus
  and selection after the move. The element and local state are retained too.

A row that moves to a *different* `b-for` (a card dragged to another list) is a new element in the destination loop, so focus cannot follow it automatically. Flush, then focus the new row by key:

```js
moveCard(card, toList);   // state change: removes the row from one loop, adds it to another
brio.flush();
document.querySelector(`[data-card-id="${card.id}"]`)?.focus();
```

#### Row boundaries and clearing a list

A single concrete repeated element is its own boundary: Brio adds no
`<!--brio:range-->` comments around it. Template, `b-template`, and teleported
rows keep their range comments.

Clearing a list, or replacing it with items that share no old keys, disposes
every old row at once. If the loop is its parent's only content besides
whitespace, the old rows are removed with a single DOM write.

### Binding attributes, classes, and styles

`b-bind-*` binds a DOM property when one exists; otherwise it sets or removes
the corresponding attribute.

| Binding value or target | Behavior |
| --- | --- |
| Attribute value `false`, `null`, or `undefined` | Removes the attribute. |
| `aria-*` boolean | Writes `"true"` or `"false"`; null/undefined still remove the attribute. For example, `b-bind-aria-pressed="$data.on"` announces a toggle's state. |
| `class` | Accepts a string, an object of class names and booleans, or freely nested arrays mixing both: `['card ' + $data.kind, { active: $data.on }]`. |
| `style` | Accepts a style object. |
| Read-only property | Binds as an attribute, including SVG geometry (`r`/`cx`) and `input.form`/`list`. |
| Writable property whose setter throws | Surfaces the error; does not silently fall back to an attribute. |

HTML parsing lowercases attribute names, so `b-bind-viewBox` reaches Brio as `b-bind-viewbox`. On SVG elements Brio restores the spec's mixed-case attribute names (`viewBox`, `preserveAspectRatio`, `gradientUnits`, `stdDeviation`, …). The `.prop` modifier always assigns a DOM property and resolves its casing against the element (`b-bind-tabIndex.prop`, `b-bind-scrollTop.prop`).

### Two-way input with `b-model`

`b-model` text inputs and textareas preserve strings by default, including
whitespace and numeric-looking text. Supported model modifiers are `.lazy`
(update on change instead of input), `.trim` (trim whitespace), and `.number`
(`parseFloat`, keeping nonnumeric text unchanged). Text is literal by default;
`b-html.hydrate` opts into content hydration.

#### Cursor, selection, and composition

When state changes the value of a focused text input or textarea (through
`b-model` or `b-bind-value`), Brio keeps the cursor and selection on the same
characters: text changed before the cursor shifts it, text changed after it
leaves it alone. Without this, browsers move the cursor to the end on every
programmatic write, which breaks live collaboration and server-side
reformatting. The browser's own undo history does not survive programmatic
writes, and writing during IME composition can cancel it; avoid changing a
field's value while `compositionstart` is active.

### Local DOM references with `b-ref`

Use `b-ref` when application code needs a particular element's native API:

```html
<section b-data="">
  <input b-ref="search">
  <button b-on-click="$ref.search?.focus()">Focus search</button>
  <dialog b-ref="dialog">
    <button b-on-click="$ref.dialog.close()">Close</button>
  </dialog>
  <button b-on-click="$ref.dialog?.showModal()">Open dialog</button>
</section>
```

`$ref.search` (also `$context.$ref.search`) is the actual DOM element, not a
proxy, component instance, or wrapper API. Use it for focus/selection, dialogs,
scrolling, media controls, measurement, or third-party integrations.
`$el` is still the current element; `b-id` still creates unique **strings** for
IDs, label associations, ARIA relationships, or selectors. Refs do not set IDs.

#### Ref names and local boundaries

- The name is literal, trimmed, and nonempty: `b-ref="search"` does not evaluate
  JavaScript. Use `$ref['search-input']` for names requiring bracket access.
  Empty names, arguments, and modifiers are errors. There is no `ref` shorthand,
  dynamic-name expression, ref collection, or callback-ref API.
- Each mounted root, `b-data` boundary, component instance, and repeated row
  owns a separate registry. Even empty `b-data` creates a **ref** boundary,
  although it does not create another data ancestry level.
- Lookup is local-only. Missing names return `undefined`; there is no parent
  fallback, `$ref.$parent`, or automatic parent collection of row refs.
  Ordinary wrappers, conditionals, and `b-template` alone do not add a boundary.
- Duplicate names in one registry throw. Separate rows/components/data scopes
  may reuse names. Each keyed row retains its registry and nodes when reordered.
  A same-element `b-ref` on a concrete row belongs to that row.
  Loop collection/key expressions run before new row targets register.
- A component-host `b-ref` references the host element in its caller's applicable
  registry. Setup/templates get a separate private registry. Projected slot
  content retains its author's registry, including through template cloning.
  Cloning projected content with the same ref more than once can therefore
  cause a duplicate in the author's registry; give repeated projected content
  its own explicit data boundaries.
- Refs on `b-template` wrappers or native `<template>` elements are errors:
  no surviving rendered element represents that fragment. Put refs on concrete
  children. `b-ignore` skips registration along with all other hydration.

#### When refs become available

Refs register as their targets hydrate, before their ordinary effects/children.
There is no pre-scan or descendant-ready guarantee during component setup or
earlier sibling initialization. Event-time optional chaining handles missing
targets; an owned effect can respond to a target appearing later:

```js
import { effect } from '@jnreis/briojs';

app.component('search-field', {
  template: '<input b-ref="input">',
  setup({ $ref }) {
    effect(() => {
      const input = $ref.input;
      if (input instanceof HTMLInputElement) input.focus();
    });
  },
});
```

Reads (`$ref.input`), presence checks (`'input' in $ref`), and enumeration
(`Object.keys($ref)`) react to registrations/removals. DOM properties such as
`$ref.input.value` or `.isConnected` are **not** made reactive. Registry changes
may notify effects incrementally during hydration; this is not an "all mounted"
hook. Names cannot be assigned, deleted, or redefined by application code.
The npm `RefMap` type exposes `Element | undefined`; narrow the element type
before using specialized methods.

#### Ref lifetime and cleanup

- Plain `b-if` retains refs through live leave transitions, then unregisters on
  disposal. Reversal keeps the same ref; activation after completed removal
  registers a new element.
- `.hide` and `.detach` retain refs, including disconnected elements. Teleport
  changes placement, not ref ownership. A truthy ref does not imply connectivity.
- Preservation modes hydrate **all** branches, so the same name across branches
  in one registry is a duplicate even when only one branch is visible. Plain
  branches may also overlap during leave transitions. Use distinct names or a
  `b-data` boundary per branch; refs do not silently switch to the active branch.
- Managed insertion and hydrated `b-html` inherit the destination's registry,
  subject to normal nested boundaries; removal/replacement unregisters owned
  refs. Default `b-html` content is not registered. Unmount empties that mount's registry;
  remount creates a fresh one.

Use native APIs without bypassing Brio ownership: do not replace hydrated
children via a ref, establish competing input-value bindings, or write back
unconditionally from effects that observe those writes. Dispose integration
listeners/widgets through `onCleanup`, not by deleting registry entries.

### Teleport targets and placement

Use teleport when an element belongs to one part of your app but needs to appear
elsewhere in the page, such as a modal or floating panel.

`b-teleport` evaluates a reactive expression. Supply an actual `Element` (including
a `$ref` value), a CSS selector string, or a `[target, placement]` pair:

```html
<aside b-ref="panel"><p>Existing content</p></aside>

<!-- Default: immediately after the panel, not inside it. -->
<p b-teleport="$ref.panel">A sibling of the panel</p>

<!-- Explicitly insert inside the target. -->
<input b-teleport="[$ref.panel, 'prepend']">
<div b-teleport="['#modal-root', 'append']">Modal content</div>

<!-- Targets and placements may depend on reactive data. -->
<div b-teleport="[$data.compact ? $ref.sidebar : $ref.panel, $data.placement]">
  The same live element moves; its state and source context are retained.
</div>
```

| Placement | Location |
|-----------|----------|
| `before` | Immediately before the target, in its parent. |
| `after` (default) | Immediately after the target, in its parent. |
| `prepend` | Before the target's existing children. |
| `append` | After the target's existing children. |

#### Choosing a teleport target

Strings **always** mean selectors: `'panel'` selects a `<panel>` tag, even if a
ref named `panel` exists. Write `$ref.panel` or `$ref['panel-name']` for refs;
there is no bare-name lookup, `.ref` modifier, or unquoted-selector shorthand.
Tuple syntax requires exactly two items and a valid placement. Only Elements,
selector strings, and null/undefined targets are accepted; invalid expressions,
values, placements, selectors, modifiers, and self/descendant destinations throw.
Sibling placements require an element or fragment parent. Child placements
cannot insert into an inert native `<template>` or a Brio container whose
children are controlled by another directive, such as `b-text` or `b-html`.
You may still place output beside such a container.

#### Targets that appear or change later

Refs retain their normal **local-only** lookup. A ref may be declared later in
hydration: teleport waits for that target's hydration to finish before inserting
output, including component rendering. When a target is null/undefined, output
stays at or returns to its authored source, without disposal or rehydration.
Registration, removal, or replacement of that ref updates its placement.
Missing targets do not implicitly hide the content; use a conditional when needed.

Selectors are resolved against the source element's document, including outside
the mount root. A valid selector with no match warns and restores source output.
Repeated identical misses do not repeat the warning until the unresolved result
changes. There is **no DOM observer or polling**: selectors are looked up again
only when expression dependencies change. Prefer refs for conditional targets.
An unchanged target/placement does not repeatedly move output. DOM connectivity,
native reparenting, and sibling changes are not tracked. A retained ref can target
a disconnected Element; sibling placement still requires a parent.

#### What moves, and what stays the same

Teleport preserves source data, providers, ref ownership, component/slot context,
listeners, and node identity. It changes physical CSS ancestry and native event
bubbling. Template ranges move together; keyed rows retain their order within
each loop's bounded target/placement group. Reactive retargeting while a
same-element conditional or conditional loop is detached does not reconnect its
output; activation uses the latest requested destination.

#### Cleaning up teleported content

Removing a ref target through Brio returns independently owned teleported output
to its source. Removing the teleport's original owner disposes that output
wherever it lives. Selector-only targets have no reactive lifetime notification:
dispose the source owner before removing those destinations, or switch the target
expression first. Native DOM removal alone never unregisters a ref.

### Wrapperless content with `b-template`

Want several elements to behave as one branch or row, without adding a wrapper
to the rendered HTML? Use a directive-bearing `<template>`.

`b-template` is an **in-place, one-time unwrap**, not a component definition,
named template registry, HTML expression, or reactive template selector.

A native `<template>` that carries any `b-` directive renders in place as if it
had `b-template`, so `b-template` is only needed on other elements (or to be
explicit on a directive-free `<template>`):

```html
<template b-if="$data.user">
  <h2>${$data.user.name}</h2>
  <p b-text="$data.user.bio"></p>
</template>
```

| `<template>` carries | Result |
| --- | --- |
| No `b-` directive (only `id`, `slot`, `class`, …) | Stays inert. Brio never touches its `.content`, so it is safe for templates cloned by your own code or other libraries. |
| `b-ignore` | Stays inert, whatever else it carries. |
| `b-cloak` only | The attribute is removed; the template stays inert. |
| `b-if`, `b-else-if`, `b-else`, `b-for`/`b-key`, `b-data`, `b-id`, `b-provide`, `b-teleport`, `b-effect`, or `b-template` | Its contents render in place. |
| A directive that needs a concrete element (`b-bind-*`, `b-on-*`, `b-text`, `b-html`, `b-model`, `b-mask`, `b-transition`, `b-ref`, `b-if.hide`, or any unknown `b-*`) | An error naming the directive. Put it on an element inside. |

The same explicit form still works everywhere:

```html
<div id="app">
  <template b-template>
    <h2>${$data.title}</h2>
    <p b-text="$data.description"></p>
  </template>
</div>
```

Brio replaces the marked element with paired anchor comments and its hydrated
contents. Multiple top-level elements, text nodes, and comments are allowed.
The example renders the heading and paragraph directly inside `#app`.
A native `<template>` with no `b-` directive stays inert; Brio does not hydrate
its `.content` automatically.

#### Unwrapping and inherited context

- On `<template b-template>`, Brio clones the template's inert contents.
  On an ordinary container such as `<div b-template>`, it moves the existing
  children out and removes the container. Use a non-void element with children.
- Use the exact bare attribute `b-template` (or `b-template=""`). There are no
  supported modifiers, arguments, or shorthand alias. Its attribute value is
  not evaluated; `b-template="$data.template"` does not select a template.
- No other directive is required. Children inherit the expression context and
  hydrate normally, with their own `$el`. Their bindings remain reactive even
  though unwrapping itself happens only once.
- Same-element `b-data`, `b-id`, and `b-provide` are processed before unwrapping
  and are available to the contents. These are useful optional companions:

  ```html
  <template b-template b-data="{ label: 'Name' }"
            b-id="['input']" b-provide="{ label: $data.label }">
    <label b-bind-for="$id.input" b-text="$provided.label"></label>
    <input b-bind-id="$id.input">
  </template>
  ```

  The label and input survive; the template does not. Context-creating
  expressions on the wrapper see that wrapper as `$el`, not a rendered child.
#### Template companions and limits

- Same-element `b-effect` runs in the template's owned scope, after its contents
  hydrate. `b-teleport` moves the whole rendered range to its destination,
  including text, nested structural output, and boundary comments. Its selector
  must already exist; it is not a reactive template-source expression.
- Directives that need a surviving element are an error on a wrapper (an
  explicit `b-template` or a directive-bearing `<template>`): `b-text`,
  `b-html`, `b-bind-*`, events/observers, `b-model`, `b-mask`, `b-transition`,
  and `b-router-outlet`. Move them onto surviving children
  or an outer container. A registered component tag with `b-template` is
  unwrapped rather than instantiated as a component, so it cannot take props.
- Wrapper attributes are not forwarded: `class`, `style`, `id`, accessibility
  attributes, and the wrapper's layout/semantics disappear. Native CSS `@scope`
  follows the style element's new physical parent.
#### Template branches and keyed rows

- Keep a stable, concrete mount root; `b-template` **inside** it is supported,
  but putting it on the element passed to `app.mount()` is an error.
- Plain `b-if` / `b-else-if` / `b-else` and `b-if.detach` support template
  branches. Plain conditionals dispose and remove the complete rendered range;
  `.detach` disconnects/reinserts the same range without stopping effects.
  Nested templates, loops, and teleported output are cleaned up with their owner.
- `b-for` with `b-key` supports template rows: all roots and text move together,
  retained keys preserve DOM/local state, and removed keys dispose their scopes.
  Same-element `b-id` generates IDs per row; providers may read that row's `$for`.
- `.hide` still requires a concrete branch element. There is no wrapper whose
  display could be changed, and text nodes have no display property. Use
  `.detach` for wrapperless preservation or a concrete wrapper for `.hide`.
  A same-element `b-transition` is not a fragment/group animation API; use a
  concrete conditional branch when its whole output needs enter/leave transitions.

These combinations need no rendered wrapper:

```html
<template b-if="$data.visible">
  <h2>Conditional heading</h2>
  <p>Both roots are removed and disposed together.</p>
</template>

<ul>
  <template b-for="item in $data.items" b-key="$for.item.id">
    <li b-text="$for.item.name"></li>
    <li b-text="$for.item.description"></li>
  </template>
</ul>

<template b-if.detach="$data.open" b-teleport="['#portal', 'append']">
  <h2>Preserved at the destination</h2>
  <button b-on-click="$data.open = false">Close</button>
</template>
```

Teleported keyed rows reorder together at their destination without moving back
to the source. When a conditional also owns a same-element loop, `.detach`
suspends that loop's teleported row groups too; collection updates while detached
are reflected on reinsertion. As with concrete wrappers, teleporting a
**descendant** elsewhere does not make ancestor CSS display control it.

### Directive combinations and conflicts

Most directives work naturally together. The useful rule of thumb is to give
each DOM resource one owner: children, input value, display, or structural host.

Structural directives can replace a host or return before the ordinary directive
pass, so they are not an unordered set of independent behaviors.

#### The order Brio follows

**Changing attribute order does not change structural precedence:**

1. `b-ignore` skips the entire element and its subtree, including other directives.
2. A conditional chain is collected and evaluated in the **parent** context;
   only its branch instances proceed to the remaining steps.
3. `b-data` establishes context on that element.
4. `b-for` establishes repetition; each row is hydrated separately with `$for`.
5. `b-id` and `b-provide` establish row-local IDs/live inherited values, then
   `b-ref` registers concrete targets in the applicable local registry.
6. `b-template` unwraps and hydrates contents, then processes its supported
   `b-teleport` / `b-effect` companions, skipping other host processing.
7. A registered component tag is mounted through its component-specific path.
8. Ordinary host directives are processed in attribute order; children hydrate
   afterward unless a directive owns their content. `b-router-outlet` returns
   immediately when encountered.

#### Same-element combinations at a glance

Not every conflict throws: some skip a directive or let reactive effects
overwrite each other. Do not rely on attribute order to resolve competing owners.

**Context and structural ownership**

| Combination | Behavior / recommended pattern |
| --- | --- |
| `b-if` + same-element `b-data`, `b-provide`, or `b-id` | The condition cannot use values created by those directives on that branch. It sees the parent context. Move context creation onto an outer element if the condition needs it. |
| `b-if` + same-element `b-for` | Plain `b-if` and `.detach` own the complete loop output, including template rows. The condition runs before the loop and cannot read that row's `$for`. `.hide` requires a concrete wrapper instead. For per-row conditions, put a conditional inside the repeated row/template. |
| `b-for` + same-element `b-data` | Data is created before repetition, not independently per row. The initializer cannot read the new row's `$for`. Put per-item data on a child inside the row/template. |
| `b-for` + same-element `b-id` | Supported: IDs are generated per row after `$for` is established. Retained keys keep their IDs; new keys get fresh IDs. A same-element `b-key` is evaluated before these new IDs exist. |
| `b-for` + same-element `b-provide` | Supported: providers are created during row hydration and can use the row's `$for`. |
| `b-for` + `b-key` | Supported; `b-key` belongs on that repeated element and evaluates in its row context. It has no standalone binding behavior. |
| `b-template` or directive-bearing `<template>` + structural/ordinary host directives | See the limitations above. Context, structural, teleport, and effect directives may share the wrapper; directives requiring a surviving element are an error. |
| `b-ref` + `b-template` / native `<template>` | An error. Ref concrete children, not fragment wrappers. |
| `b-ref` + `b-data` / `b-for` / component host | Normal data elements register in their data-local registry; rows register in their row-local registry. Component hosts register in the caller's applicable registry; component internals are private. |
| Reused ref name across live conditional branches | Duplicate error, including inactive preserved branches and transition-overlapping branches. Use distinct names or explicit `b-data` boundaries. |
| Multiple conditional directives on one element | An error. Use one of `b-if`, `b-else-if`, or `b-else` per branch; only the leading `b-if` accepts mode modifiers. |

**Content and input ownership**

| Combination | Behavior / recommended pattern |
| --- | --- |
| `b-text` + `b-html` (including `.hydrate`) | Both replace the same children. Do not combine them. Existing child markup is replaced, not used as fallback or an additional hydrated template. |
| `b-bind-*` targeting `textContent` / `innerHTML` or `b-effect` mutating children + hydrated content | Direct DOM writes are not a substitute for owned content replacement and may remove nodes without disposing their bindings. Use `b-text` / `b-html` instead; keep third-party-managed subtrees under `b-ignore`. |
| `b-html` + child directives | Default HTML leaves inserted directives/interpolation inert. `.hydrate` requires `trustedHTML()`, hydrates replacements in an owned content scope, and disposes the previous one. In either mode, do not separately manage those same children with an outlet, insertion API, or another content writer. |
| `b-router-outlet` + content writers / authored child bindings | Give the outlet a dedicated empty container. It manages routed component children; other content owners conflict, and ordinary attributes after the outlet are not processed. Put unrelated behaviors on an outer wrapper. |
| `b-model` + `b-bind-value` / `b-bind-checked` / manual value-writing effects | Competing state-to-control writers. Let `b-model` own the control's value/selection; ordinary event handlers may perform additional actions but should not establish another independent value binding. |
| `b-model` + `b-mask` | Supported on text-like inputs/textareas: the mask formats input before model listeners read it. Masked values are formatted strings; `.number` uses `parseFloat`, not locale-aware money parsing. Initialize model values in the expected format; changing model state alone does not cause an input event or guarantee reformatting by the mask. |
| `b-model` on non-form elements; `b-mask` on non-input/textarea elements; `b-script` on non-script elements | Errors when processed. A component host does not acquire native input/script capabilities by using one of these directives. |

**Visibility, movement, and competing bindings**

| Combination | Behavior / recommended pattern |
| --- | --- |
| `b-if.hide` + `b-bind-style` / effects writing `display` on the branch | Competing display owners; a reactive style write can reveal an inactive branch or override activation. Let the conditional own branch display; style a child or use `.detach` when appropriate. |
| `b-transition` + dynamic class/style bindings | Class bindings add and remove only the names they own, so transition classes survive. Do not let a binding toggle a transition class itself, and avoid styles that overwrite animated properties while a transition runs; put those on a child when possible. Keyed `b-for` rows with `b-transition` animate position changes through `<name>-move` and briefly own the row's inline `transform`; do not bind `style.transform` on that row. `b-transition` does not provide leave animation for removed `b-for` rows, or animate every descendant when an ancestor is removed. |
| `b-for` + same-row `b-teleport` | Supported for concrete or template rows. Keyed reconciliation moves the complete row range at its destination. Each loop owns bounded groups per target/placement, preserving unrelated surrounding content through retargeting. |
| `b-teleport` + a destination controlled by `b-text` / `b-html` / `b-router-outlet` / `b-ignore` | Child placements are errors; use `before` / `after` beside the controlled container, or choose an independently managed destination. |
| `b-if` + teleported children | Supported, but hiding an ancestor with `.hide` cannot hide descendants moved elsewhere. Their effects also stay live in preservation modes. Put visibility on the surviving teleported element when it must be controlled independently. |
| Multiple bindings/effects writing the same attribute/property | No arbitration. Use one expression per target; do not combine different modifier spellings to install competing bindings. |

#### How combinations are tested

`tests/directive-interactions.test.js` generates **465 pairwise co-mount tests**
for all 30 directive forms in the reference table plus registered component
hosts. Each pair is mounted in one app and root using a behavior probe for each
directive; tests assert output, shared reactive updates, event/model behavior,
observer cleanup, and disposal. Failure output names the pair and expected and
actual results. This matrix verifies that distinct directives coexist across a
shared app tree; it does not imply that every same-element combination is
supported. Same-element precedence, conflicts, and placement rules are
documented above and covered by focused integration tests. The matrix also
checks that every directive listed in the reference table has a probe, so a
newly documented directive cannot silently go untested. A higher-order
regression composes `b-for`, `b-key`, `b-id`, and `b-provide` on keyed rows and
checks row-local values and IDs through reorder and disposal.

### Event modifiers

Add modifiers when an event needs a little more control, such as handling only
Enter or preventing a form's default submit behavior.

| Modifier | Effect |
|---|---|
| `.prevent`, `.stop` | Call `preventDefault()` / `stopPropagation()`. |
| `.self`, `.outside` | Run only for events targeting the element itself / outside it. |
| `.window`, `.document` | Listen on `window` / `document`. |
| `.once` | Remove the listener after the first event that passes the other filters. |
| `.capture`, `.passive` | Native listener options. |
| `.debounce`, `.throttle` | Rate-limit the handler (150ms). Set another delay with `b-on-input.options="{ debounce: 400 }"`. |
| `.enter`, `.esc`, `.space`, `.tab`, `.up`, `.down`, `.left`, `.right`, `.delete` | Run only for that key (`.delete` matches Delete and Backspace). Several keys mean any of them. |
| `.ctrl`, `.alt`, `.shift`, `.meta` | Run only while every listed system key is held. |

```html
<input b-on-keydown.enter.prevent="$data.addTag()" b-on-keydown.esc="$data.cancel()">
<div b-on-keydown.ctrl.enter.window="$data.save()"></div>
```

Every modifier can also be set through [`.options`](#directive-options), where
`debounce` and `throttle` take a delay in milliseconds (`true` keeps 150ms):

```html
<input b-on-input="$data.search()" b-on-input.options="{ debounce: 400 }">
<div b-on-scroll.window="$data.track()" b-on-scroll.options="{ throttle: 50, passive: true }"></div>
```

Key and system-key filters run first, so `.enter.prevent` cancels only Enter.
An unknown modifier (for example the typo `b-on-click.prevnt`) throws a
`SyntaxError` listing the supported names instead of being ignored.

#### Combining event modifiers

For ordinary DOM events, `.outside`, `.window`, and `.document` are alternative
targets, not combinations: `.outside` wins over `.window`, which wins over
`.document`. `.debounce` wins over `.throttle` if both are present; choose one.
Avoid `.passive.prevent` because a passive listener cannot cancel the default
action. `.prevent`/`.stop` execute before `.self`/`.outside` filtering, so those
filters do not prevent the cancellation/propagation side effect. Component
hosts accept the same modifiers.

`.outside` ignores the event that was being dispatched when its element was
created, so a menu opened by a click is not closed by that same click
bubbling up to `document`:

```html
<button b-on-click="$data.open = !$data.open">Menu</button>
<div role="menu" b-if="$data.open" b-on-click.outside="$data.open = false">…</div>
```

#### Reading updated DOM inside a handler

Each event handler runs inside `batch()`: several writes produce one coherent
update when the handler returns. Consequently, DOM that depends on those writes
(a new `b-if` branch, its `$ref` entries, bound text/attributes) does not exist
yet inside the same synchronous handler. Call `flush()` to apply pending updates
first, for example
`b-on-click="$data.editing = true; flush(); $ref.field.focus()"`. Methods can
call the exported `flush()` (`brio.flush()` in browser bundles). Code after an
`await` runs outside the batch and sees updates immediately.

#### Avoiding observer feedback loops

An observer on an element whose attributes/children are updated
by bindings or `b-html` can observe those framework writes too. Do not write the
same observed state/DOM back unconditionally from its callback or `b-effect`:
that can create feedback loops.

### Conditional lifecycle

Use a conditional to show the first matching branch. Start with plain `b-if`;
choose a preservation mode only when inactive content needs to keep its state.

`b-else-if` and `b-else` follow an adjacent `b-if` branch (whitespace and comments are allowed between branches). The first matching branch is selected; `b-else` is the final fallback. In every mode, conditions run in the parent scope before branch-local `b-data` or providers.

```html
<section b-if="$data.loggedIn" b-data="{ clicks: 0 }">
  <button b-on-click="$data.clicks++">${$data.clicks}</button>
</section>
<p b-else-if="$data.loading">Loading...</p>
<p b-else>Please log in.</p>
```

#### Default: remove inactive branches

With unmodified `b-if`, an inactive branch is removed and dehydrated after its
leave transition completes, or immediately when no transition runs. Its bindings
and listeners remain live during leave. Reversing before completion reuses the
same element and local state; after a completed leave, activation creates fresh
branch-local `b-data` and component state. Parent/app state is not reset.

#### Keep local state with a preservation mode

| Mode | Inactive content |
| --- | --- |
| `b-if` | Removed and dehydrated after leave; later activation creates fresh local state. |
| `b-if.hide` | Kept in the DOM with `display: none`; activation restores authored visible display. |
| `b-if.detach` | Disconnected without dehydration; activation reinserts the same nodes. |

Set a preservation mode **only on the leading `b-if`**; it applies to every
branch in that chain:

```html
<section b-if.hide="$data.tab === 'settings'" b-data="{ edits: 0 }">
  <button b-on-click="$data.edits++">Edits: ${$data.edits}</button>
</section>
<section b-else-if="$data.tab === 'preview'">Preview</section>
<section b-else>Choose a tab</section>

<aside b-if.detach="$data.open" b-data="{ count: 0 }">
  <button b-on-click="$data.count++">Count: ${$data.count}</button>
</aside>
```

#### Preservation timing and limits

- Both modes hydrate **all branches once at initial mount**, even initially
  inactive branches. Component setup and contextual scripts run immediately;
  local state, bindings, listeners, and effects remain live while inactive.
  Neither mode pauses effects. Enclosing scope disposal cleans up all branches.
- Initially inactive branches do not enter-transition on mount. Subsequent
  activation/deactivation animates; hiding/detaching waits for leave completion.
  Rapid reversals cancel stale removal callbacks.
- `.hide` needs a concrete element or component host. Put
  `b-for` / `b-template` inside a wrapper for that mode. `.detach` also supports
  wrapperless template branches and same-element loops.
  Hiding a wrapper does not hide descendants teleported elsewhere.
- Combining `.hide` and `.detach`, unknown conditional modifiers, or modifiers
  on `b-else-if` / `b-else` is an error.

### Contextual scripts

Use a contextual script for initialization that belongs to a particular piece
of HTML. Its cleanup belongs to that piece too.

Only `<script b-script>` is processed. Write an unassigned arrow expression so
the browser does not execute its body:

```html
<script b-script>
  ($context) => {
    $context.$data.ready = true;
    const timer = setTimeout(() => { $context.$data.message = 'Ready'; }, 250);
    $context.onCleanup(() => clearTimeout(timer));
  }
</script>
```

#### Script context and cleanup

- Brio constructs a function factory with an explicit context parameter, then
  invokes the returned function with that context. Scripts do not use `with`.
- Context includes `$data`, `$el`, `$id`, `$for`, and `$event` when supplied by
  the caller. `$el` is the script element; use `$data.$parent` for parent state.
- The helpers are also lexical bindings, so `() => { $data.ready = true; }`
  works too.
- Async arrows and destructured parameters are supported. Errors surface
  without retrying the script.
- Async initialization does not block mounting: initialize values used by the
  template before the first `await`.
- Register timer/listener cleanup **synchronously** through `$context.onCleanup`.

### Input masks

Use a pattern for familiar formats such as phone numbers, or provide a function
when your formatting needs custom logic. `b-mask` is part of the
[inputs add-on](#add-only-the-add-ons-you-use): load `brio.inputs.min.js` after
the core, or install `inputsPlugin` from `@jnreis/briojs/inputs`.

```html
<input b-mask="'(###) ###-####'">
<input b-mask="'aa-##-AA-*'">
<!-- Two JS backslashes produce a single pattern escape: literal A -->
<input b-mask="'\\A##'">
<input b-mask="({ value }) => value.toUpperCase()">
```

| Token | Accepted Unicode code point |
|---|---|
| `*` | Any code point, including emoji |
| `A` | Letter or decimal digit: `[\p{L}\p{Nd}]` |
| `a` | Letter: `\p{L}` |
| `#` | Decimal digit: `\p{Nd}` |

Other characters, including `9`, are literals. Backslash escapes the next code
point; escape a backslash to include it literally. A trailing escape is an error.
Tokens skip nonmatching input; literals are inserted and consume matching input
when present. Matching uses code points, not grapheme clusters: combining marks
do not independently match `a`/`A`, and emoji sequences can span several `*`
tokens. Native input restrictions still apply.

#### Custom input formatters

The expression can instead evaluate to a synchronous `MaskFormatter`:

```ts
type MaskContext = {
  value: string;
  selectionStart: number | null;
  selectionEnd: number | null;
  selectionDirection: 'forward' | 'backward' | 'none' | null;
  inputType: string | undefined;
};
type MaskResult = string | {
  value: string;
  selectionStart?: number;
  selectionEnd?: number;
};
type MaskFormatter = (context: MaskContext) => MaskResult;
```

For example `b-mask="$data.formatter"` or
`b-mask="$data.createFormatter($data.options)"`. No registry, string-name lookup,
`$mask` injection, or money-specific modifier is involved. The expression and
synchronous reactive reads made while initially applying the formatter are
tracked. Prefer pure formatters; avoid mutations of reactive state in them.
Configuration changes reapply the mask. Formatters return a string or an
object with a string value; promises and malformed results throw. Explicit
selection positions must be integer UTF-16 offsets within the formatted string.
Without positions, the existing selection is preserved and clamped. Patterns
map selection to editable characters; money anchors it to digits on the right.
Brio owns composition handling, input events, model synchronization, and cleanup.

### Money formatter

The inputs add-on also provides `moneyMask`, a ready-made formatter for currency
amounts.

```html
<script src="/dist/brio.min.js"></script>
<script src="/dist/brio.inputs.min.js"></script>
<input b-mask="brio.moneyMask({ thousands: '.', decimal: ',', precision: 2 })">
```

```js
import { inputsPlugin, moneyMask } from '@jnreis/briojs/inputs';
const app = createApp({
  plugins: [inputsPlugin],
  state: () => ({ amount: '', amountMask: moneyMask({ precision: 2 }) }),
});
```

```html
<input b-model="$data.amount" b-mask="$data.amountMask">
```

| Option | Default | Meaning |
| --- | --- | --- |
| `thousands` | `','` | Thousands separator. |
| `decimal` | `'.'` | Decimal separator. |
| `precision` | `2` | Integer from 0 to 100. |

Money uses ASCII-digit, fixed-minor-unit entry: `123456` becomes `1,234.56`.
It is not a locale-aware number parser or Unicode digit converter.

Options are copied at factory time. Use
`b-mask="brio.moneyMask($data.options)"` to rebuild reactively.
npm exports the formatter types
from both `@jnreis/briojs` and `@jnreis/briojs/inputs`.

### CSS transitions

Add `b-transition` when a branch should ease into or out of view. You write the
CSS; Brio handles the enter/leave classes and waits before removing content.

For `b-transition="'fade'"`:

| Phase | Classes |
| --- | --- |
| Enter | `fade-enter`, `fade-enter-active`, `fade-enter-to` |
| Leave | `fade-leave`, `fade-leave-active`, `fade-leave-to` |

The default name is `brio`. Put CSS `transition` properties on the active
classes, and starting/ending styles on the other classes. This directive
handles CSS transitions, not keyframe animations.

#### Transition completion and reversal

- Brio tracks the element's own `transitionrun`, `transitionend`, and
  `transitioncancel` events for every running property, ignoring descendant
  events.
- Removal waits for all properties, including delays. The fallback uses
  computed CSS duration plus delay, not a fixed timeout.
- No-duration/reduced-motion styles complete without waiting for an event.
- Unmount cancels pending frames, listeners, and timers.

Reversing a running transition in **any `b-if` mode** retargets the same element's
CSS properties from their current interpolated values without replaying the
opposite starting pose. Plain `b-if` keeps the branch hydrated during leave so
a reversal can reuse it without a second element or state reset. Only a completed
leave dehydrates that branch; its next activation starts a fresh enter animation.
Enclosing cleanup cancels transitions and disposes all branches immediately.

#### Move transitions for keyed lists

A keyed `b-for` row with `b-transition` also animates when it changes position, whether it was reordered or shifted by an insertion or removal. Brio measures the rows, reorders the DOM, then starts each moved row at its old position with an inverse `transform` and adds `<name>-move` while it slides home (FLIP). Style the move class:

```html
<li b-for="task in $data.tasks" b-key="$for.task.id" b-transition="'task'">${$for.task.title}</li>
```

```css
.task-move { transition: transform 0.2s ease; }
@media (prefers-reduced-motion: reduce) { .task-move { transition: none; } }
```

The class is removed on the row's own `transform` `transitionend`, or after the
computed duration.

- Interrupting a move restarts it from the row's current visual position.
- New rows play the enter transition; rows that did not shift are untouched.
- Loops without `b-transition` never read layout.
- Component hosts support `b-transition`, so a `b-for` of components can animate.
- Moves between different loops create a new element and cannot slide.

## Observer options

Observe visibility, DOM mutations, or size when an interaction needs information
from the browser. Configure only the observers you use on that element. The
observer directives are part of the observers add-on: load
`brio.observers.min.js` after the core, or install `observersPlugin` from
`@jnreis/briojs/observers`.

### Configure an observer

Each observer takes its own [`.options`](#directive-options) attribute for
values that modifiers can't express, such as a `rootMargin` or an
`attributeFilter`. Options are read once at hydration, not tracked reactively.

```html
<!-- Load the next page 200px before the sentinel scrolls into view. -->
<div b-on-enter="$data.loadMore()" b-on-enter.options="{ rootMargin: '200px' }"></div>

<!-- Different settings for entering and leaving, inside a scrolling panel. -->
<div b-on-enter="$data.play()" b-on-enter.options="{ root: '#scroller', threshold: 0.5 }"
     b-on-exit="$data.pause()" b-on-exit.options="$data.exitOptions"></div>

<div b-on-attrs="console.log($mutations)"
     b-on-attrs.options="{ target: '#observed', subtree: false, attributeFilter: ['data-theme'], attributeOldValue: true }"></div>

<div b-on-resize.document="console.log($size, $entry)"
     b-on-resize.options="{ box: 'border-box', debounce: 250 }"></div>
```

`b-options` from Brio 4 was removed; using it on an element with an observer
throws an error that points to `.options`.

### Visibility: intersection options

| Option | Meaning |
| --- | --- |
| `root` | Element/Document reference, selector, or null for the viewport (default). |
| `rootMargin` | Native CSS length/percentage syntax. |
| `threshold` | Number or array between 0 and 1. |
| `once` or `.once` | Stop after the first delivered matching callback. |

Enter/exit follow `isIntersecting`. Thresholds control native notification
boundaries, not an additional percentage filter.

### DOM changes: mutation options

| Option | Meaning |
| --- | --- |
| `target` | Element/Document/Text reference or selector; defaults to the directive element. |
| `subtree` | Defaults to true for existing v4 behavior; set false for direct-only observation. `.subtree` is shorthand for `subtree: true`. |
| `attributeFilter`, `attributeOldValue` | Attribute-observer options; the old-value flag defaults to false. |
| `characterDataOldValue` | Text-observer option; defaults to false. |

Added/removed observers filter `childList` records. Text observers watch
`characterData`, not arbitrary `textContent` replacements.

### Size changes: resize options

| Option or binding | Meaning |
| --- | --- |
| `.document` or `document: true` | Observe the owner document's `documentElement`. |
| `box` | `content-box` (default), `border-box`, or `device-pixel-content-box`; passed to `observe`. |
| `$size.width`, `$size.height` | The selected measurement, accounting for vertical writing modes. Device-pixel units are physical pixels. |
| `$entry` | Native resize entry. |

Missing nondefault box measurements report an error instead of silently
supplying a different box.

### Debounce and observer cleanup

| Debounce setting | Delay |
| --- | --- |
| `.debounce` or `debounce: true` | 100ms. |
| Numeric `debounce` | A non-negative delay. |
| False or absent | Run immediately. |

A value from `.options` overrides the modifier. Mutation debounce accumulates
every matching record; intersection/resize use the latest matching entry.
Disposal disconnects observers and cancels pending callbacks.

Selectors must resolve when hydrated. Invalid options throw explicitly.
Intersection/ResizeObserver require native browser support or an application
polyfill; native constructor validation governs CSS margins and platform support.

## Components

When a piece of UI is ready to reuse, give it a name and a template.
Components are a first-party feature: no extra plugin is needed.

### Define and use a component

Use a hyphenated custom-element name, an HTML template, and an optional setup
function:

```js
import { createApp } from '@jnreis/briojs';

const app = createApp({ state: () => ({ label: 'Clicks' }) });

app.component('click-counter', {
  template: `
    <button b-on-click="$data.count.value++; $data.notify()">
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

### Choose where the template lives

| `template` value | Use |
| --- | --- |
| Markup string | Keep the HTML in your component definition. |
| A `<template>` element | Keep markup in the page, where editors highlight it. |
| An `#id` selector, such as `'#tpl-click-counter'` | Find a `<template>` in the host's document. |

A selector that does not match a `<template>` throws when the first instance
mounts.

### Pass values through props

Static host attributes become string props; `b-bind-name` supplies a reactive prop through `$props`. Declare `props` to coerce static attributes:

```js
app.component('favorite-button', {
  props: { compact: Boolean, count: Number },
  template: '<button><span b-if="!$props.compact">Favorite </span><span b-text="$props.count"></span></button>',
});
```

```html
<favorite-button compact count="3"></favorite-button>
```

| Declared type | Static attribute conversion |
| --- | --- |
| `Boolean` | `false` when absent; `true` when present with any value except `"false"`. |
| `Number` | Passed through `Number()`. |
| `String` (default) | Kept as a string. |

Only these three types are accepted. Bound props (`b-bind-*`) are **never
coerced**.

HTML lowercases attribute names: `b-bind-userName` arrives as `$props.username`.
Use lowercase or dashed names (`$props['user-name']`).

### Setup, events, and slots

| Setup argument | Value |
| --- | --- |
| `$props`, `$emit` | Props and component event emitter; also available in templates and contextual scripts. |
| `$stores`, `$provided` | Registered stores and inherited provided values. |
| `$ref` | The component's private DOM-ref registry. |
| `el`, `app` | Host element and owning app. |
| `route` | The router's reactive route, when a router is installed. |

- Emit bubbling `CustomEvent`s with `$emit(name, detail)`.
- Project named slots with `slot="name"` on content and
  `<slot name="name">` in the template.
- Setup runs in an owned scope. Effects, persistence, and listeners registered
  during setup are disposed when the component is removed.

### Directives on component hosts

Registered component tags do not use the ordinary-element directive pass.
`b-bind-*` supplies props, not native host attribute/property bindings (so
`b-bind-class` supplies a `class` prop; it does not style the host).
Use `b-attr-*` to bind the host element itself, with the same behavior as
`b-bind-*` on an ordinary element (class objects merge with static classes,
style objects and custom properties, `aria-*`, `data-*`, booleans, and `.prop`).
`b-attr-*` values are not passed as props:

```html
<kpi-card class="card" b-bind-value="$for.kpi.value"
          b-attr-class="{ rising: $for.kpi.delta > 0 }"
          b-attr-data-testid="'kpi-' + $for.kpi.key"></kpi-card>
```

#### Prop evaluation and host events

Each bound prop is evaluated once at mount, before setup, and again only when
its dependencies change. Component template markup is parsed once per
definition and cloned for each instance in the host's own document.
`b-on-*`/`on-*` installs host event listeners with the same event modifiers
as ordinary elements (`<row-actions b-on-remove.stop.once="…">`,
`b-on-keydown.enter`). Observer-style names are host event names, not
observer installation; put observers on a concrete wrapper or inside the
component template.

#### Structural directives on a component

Earlier structural/context steps still apply: `b-if`, `b-for` with `b-key`,
`b-data`, `b-id`, `b-provide`, and `b-ref` can be handled before component setup, subject
to the combination rules above. `b-ignore` skips setup altogether, while
`b-template` unwraps the tag instead of setting it up.
`b-transition` animates the host itself, and `b-attr-*` binds the host's own
attributes. Other `b-*` host directives (such as `b-model`, `b-html`, and
`b-teleport`) are rejected.
Use a surviving wrapper or put the directive inside the component.

## Recommended CSS

Keep styling familiar: write native CSS alongside your HTML, and use bindings
only for values that need to change.

Use ordinary stylesheets and native CSS. Brio does not compile, relocate,
namespace, or restrict your CSS. Prefer shared external styles for global
design tokens, resets, layers, and reusable classes.

### Hiding templates until mount with `b-cloak`

Before Brio runs, the browser paints templates as authored: `${…}` text,
every `b-if` branch, and unpopulated lists. Add `b-cloak` to the mount root or
any region, and put this rule in `<head>` so it applies before first paint:

```html
<style>[b-cloak] { display: none !important; }</style>
<main id="app" b-cloak>…</main>
```

- **Hydration removes the cloak** from each element: mount roots, rows, branches,
  and component templates. `b-ignore` content is never hydrated, so its cloak
  stays.
- **Unmount restores the original attributes**, including `b-cloak`.
- **Include the CSS yourself**, before first paint. Brio does not inject it;
  deferred or module scripts would inject it too late.

> Cloaked content stays hidden if JavaScript fails or is disabled. Cloak only
> regions that are meaningless without Brio; keep essential content
> server-rendered or static.

### Native scoped styles

Put a bare `@scope` in an inline style to scope its rules to that style element's
**physical parent**. No directive or data boundary is needed:

```html
<div>
  <style>
    @scope { h2 { color: green; } }
  </style>
  <div>
    <style>
      @scope { h2 { color: red; } }
    </style>
    <h2>Red here!</h2>
  </div>
  <h2>Green here!</h2>
</div>
```

The inner rule wins through native **scoping proximity** when cascade priority
and specificity tie. The scope root selector does not add specificity to its
contained rules; explicit `:scope` adds pseudo-class specificity and targets
the root itself. Use ordinary nesting, media/container queries, and `@supports`
as supported by your browsers.

The same pattern works directly inside a component template: an inline style
whose parent is the component host scopes to that host. Putting it deeper in a
wrapper scopes to the wrapper. `b-data` changes expression context, not CSS scope.
Projected slots follow physical placement for CSS while retaining their author
expression context. A `b-template` wrapper disappears; use a surviving wrapper
or explicit selector if the style needs a stable root.

### Explicit roots and limits

Native CSS accepts `@scope (.panel) to (.limit) { ... }`. Roots are ordinary
document selectors and can match multiple elements, not just the style's parent.
The limit excludes each matching element **and its descendants**. To style the
limit element but not its children/subtrees, use `to (.limit > *)`. With an
implicit parent root, write `@scope to (.limit) { ... }`.

For an instance-specific explicit root, combine existing Brio bindings:

```html
<section b-id="['style']" b-bind-class="{ [$id.style]: true }">
  <style>
    @scope (.${$id.style}) to (.limit) {
      h2 { color: red; }
    }
  </style>
  <h2>Red here</h2>
  <div class="limit"><h2>Outside this rule's scope</h2></div>
</section>
```

`b-id` provides the unique name; the class binding and text interpolation use
that same name. Brio adds no separate styling metadata.

### Reactive values: prefer CSS custom properties

Changing an inline style's text updates its stylesheet. For changing values,
prefer binding custom properties instead of regenerating CSS text:

```html
<section b-data="{ accent: 'teal' }"
         b-bind-style="{ '--accent': $data.accent }">
  <style>
    @scope {
      :scope { border: 1px solid var(--accent); }
      h2 { color: var(--accent); }
    }
  </style>
  <h2>Reactive color</h2>
  <button b-on-click="$data.accent = 'purple'">Change accent</button>
</section>
```

Ordinary `<style>` text supports the same `${...}` interpolation as other
hydrated text, including reactive references. Use it for authored selectors or
structural CSS when needed; prefer simple references such as `${$id.style}` or
`${$data.selector}` rather than expressions with nested braces. Brio does not
escape/sanitize interpolated CSS. Do not insert untrusted values into CSS or
executable templates. To keep `${...}` literal, put `b-ignore` on the style
element. `b-text` is also available when explicitly binding complete CSS
text without secondary interpolation.

### Native behavior and lifetime

- Scoped selectors are not Shadow DOM isolation. Global CSS can still match
  descendants; inherited properties and custom properties cross scope limits.
  Teleported content outside a scope stops matching its rules.
- Keyframe and cascade-layer names follow native document-global CSS naming,
  even when authored inside `@scope`. Choose distinctive names such as
  `my-app-card-pulse`, and use CSS variables for animation parameters as needed.
  Brio does not rewrite animations or impose serialization restrictions.
- Inline styles stay where authored, with their attributes and formatting.
  A hidden connected branch's stylesheet remains active. A detached branch's
  inline stylesheet disconnects and stops applying until reinsertion. This also
  affects rules targeting explicit roots or teleported elements elsewhere.
- Default `b-if` keeps inline styles during leave transitions and removes them
  with the branch when leave completes. Managed insertion/removal likewise
  follows the actual DOM. Unmount stops Brio bindings and restores original
  markup; static CSS in that restored markup can remain active.
- Dispose Brio scopes through its lifecycle APIs instead of deleting owned DOM
  manually. CSS connectivity is native, but reactive bindings still need cleanup.
- Browser CSS parsing and support apply normally: there is no framework fallback
  or capability error for `@scope`. Support starts at Chromium 118, Firefox 146,
  and Safari 17.4, with a reported Safari 26.0–26.3 input/textarea regression fixed
  in 26.4. Check your target browsers and provide ordinary global-class styles
  when broader compatibility is required. CSP inline-style rules still apply.

## Three ways to use Brio

Start at the scale your project needs. The same mounting and cleanup model
works for a single widget, an enhanced server page, or a client-side app.

| Shape | Start with |
| --- | --- |
| Widget | One small mount root inside an existing page. |
| Multi-page site | Server navigation, with interactive roots on each page. |
| Single-page app | The optional router and a dedicated route outlet. |

### A widget in an existing app

Mount a small root without taking over its host page. Non-overlapping roots can share app state; separate apps have isolated app state unless stores are explicitly shared:

```js
const widget = createApp({ state: () => ({ open: false }) });
const handle = widget.mount('#account-menu');

// When the host removes this widget:
handle.unmount();
```

| Cleanup | Result |
| --- | --- |
| `handle.unmount()` | Releases this root. |
| `app.unmount()` | Releases all roots; the app stays reusable. |
| `app.dispose()` | Releases all roots and permanently closes the app. |

By default, unmount restores the root's original attributes and child markup.
All three methods accept `{ restore: false }` when the host is about to discard
the DOM; see [page lifecycle](#server-rendered-pages-and-page-swaps).

### Multi-page site

Use ordinary server routes and HTML for navigation. Mount Brio only around the interactive areas on each page. Full-page links continue to work without Brio or when no client route matches.

### Single-page app

Use the optional router when client-side navigation is useful:

```js
import { createApp } from '@jnreis/briojs';
import { createRouter } from '@jnreis/briojs/router';

const router = createRouter([
  { path: '/', component: 'home-page' },
  { path: '/items/:id', component: 'item-page' },
]);

createApp({ router })
  .component('home-page', { template: '<h1>Home</h1>' })
  .component('item-page', {
    template: '<h1>Item <span b-text="$route.params.id"></span></h1>',
    setup({ route }) {
      return { get tab() { return route.query.tab ?? 'details'; } };
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

#### Route state

`router.route` is a reactive, read-only object describing the current location.
Templates read it as `$route`, and component setup receives it as `route`:

| Field | Example for `/items/42?tab=reviews#top` |
|---|---|
| `matched` | `true` (false when nothing matched or a guard blocked) |
| `component` | `'item-page'` |
| `path` | `'/items/42'` (app-relative, no query or fragment) |
| `params` | `{ id: '42' }` |
| `query` | `{ tab: 'reviews' }` (the last value wins for repeated keys) |
| `hash` | `'#top'` (always `''` in hash mode) |
| `fullPath` | `'/items/42?tab=reviews#top'`: pass it back to `navigate()` to return here |

Fields are tracked individually, so an effect reading `$route.query.tab` does
not rerun for an unrelated hash change; `params` and `query` keep their object
identity when their contents are unchanged. `router.current` remains available
as a signal holding the same data as a plain `RouteMatch` (or `null`).

Read route state inside effects, getters, or templates rather than copying it
once in setup: `b-router-outlet` **keeps the mounted page when only the query
or hash changes**, so pagination such as `?page=2` updates the existing page
instead of remounting it. A different component or path remounts the page.

#### Guards, redirects, and the fallback route

```js
const signedIn = () => session.user ? true : `/login?redirect=${encodeURIComponent(router.route.fullPath)}`;

const router = createRouter([
  { path: '/', component: 'home-page' },
  { path: '/home', redirect: '/' },
  { path: '/old-items/:id', redirect: to => `/items/${to.params.id}` },
  { path: '/settings', component: 'settings-page', guard: signedIn },
  { path: '*', component: 'not-found-page' },
], { guard: to => to.path !== '/maintenance' });
```

- A route may have a `component`, a `redirect` (which wins), or neither.
  `redirect` is a path or a function of the attempted `RouteMatch`. A route with
  neither still matches, updates `$route`, and intercepts links, but leaves the
  outlet empty: useful when the page is permanent markup and only some URLs add
  something, such as `{ path: '/' }` next to `{ path: '/card/:id', component: 'card-dialog' }`.
- A `guard(to)` returns `true` to allow, `false` to block, or a path to
  redirect to. The global `guard` option runs first, then the route's own guard.
  Blocked links/`navigate()` calls leave history unchanged and return `false`;
  a blocked initial load or back/forward renders nothing (`$route.matched` is false).
  Redirects replace the history entry.
- **Guards are reactive.** After navigation, Brio re-runs the current route's
  guards whenever state they read changes; signing out on `/settings` redirects
  immediately. Guards may run more than once per navigation, so keep them pure.
- `path: '*'` matches anything else inside the base, including links, which are
  then intercepted. Only one `*` route is allowed. Without it, unmatched URLs
  use normal browser navigation.
- More than 10 consecutive redirects throw, to surface redirect loops.

#### Hash mode

Use `createRouter(routes, { mode: 'hash' })` when the server cannot rewrite
URLs to the SPA entry (static hosting, `file:` previews). Routes live in the
fragment (`/my-app/#/items/42?tab=reviews`); `href('/items/42')` returns
`'#/items/42'`. Fragments that do not start with `/` (`#section`) remain
ordinary in-page anchors and keep the current page.

In history mode, opening `base + 'index.html'` directly is treated as the `/`
route and the address bar is replaced with the base.

#### Deploying under a base path

```js
const router = createRouter([
  { path: '/', component: 'home-page' },
  { path: '/users/:username', component: 'user-page' },
], { base: '/my-app/' });

router.base;                                      // '/my-app/'
router.href('/users/ada?sort=name#details');        // '/my-app/users/ada?sort=name#details'
router.navigate('/users/ada?sort=name#details');    // Updates browser history.
router.current.value.path;                        // '/users/ada'
router.match('/my-app/users/ada');                 // Browser pathname -> route.
router.match('/my-app-other/users/ada');           // null
router.match('/users/ada');                        // null: outside this base.
```

The default base is `/`. `/my-app` and `/my-app/` both normalize to
`/my-app/`, exposed as `router.base`. Bases must be absolute pathnames, not
origins/URLs, and cannot contain queries, fragments, backslashes, whitespace,
repeated slashes, or dot segments. Unicode base paths are URL-encoded.

**Application paths and browser URLs are different inputs:**

| API/source | Input |
|---|---|
| Route definitions | App-relative pathname, e.g. `/users/:username`; no query or fragment. |
| `href(path)` | App-relative path with optional query/fragment; returns a deployment-aware pathname/search/hash. Does not require a matching route. |
| `navigate(path, { replace? })` | Same app-relative input as `href`; returns false without changing history for unmatched routes. |
| `match(browserUrl)` | Browser URL/pathname with the base already present; never prepends it. Foreign-origin/outside-base URLs return null. |
| Initial load, Back/Forward, anchor interception | Actual browser URLs, stripped at a path-segment boundary before matching. |

App-relative inputs start with a single `/`. Origins, protocol-relative URLs,
and backslashes are rejected; use normal browser navigation for external links.
Paths cannot escape the configured base through `..`. Do not pass an already
base-prefixed browser pathname to `navigate` or `href`: it would be interpreted
as an application path and prefixed again.

`current.value.path` is always the matched **app-relative pathname**, excluding
query/fragment. Query strings and fragments remain on the generated/browser URL
through navigation and history; parameter matching uses only the pathname.
Both `/my-app` and `/my-app/` can match the app's `/` route.

Use ordinary anchors with deployment-aware `href` values. Generate those on the
server when links must remain usable without JavaScript:

```html
<a href="/my-app/users/ada?sort=name#details">Ada</a>
```

Client code can generate the same URL with `router.href('/users/ada?sort=name#details')`.
Only same-origin, matching URLs inside the configured base and a mounted root
are intercepted. The base is not reapplied to anchors. Same-page fragment links
with unchanged query retain native browser behavior.

Configure your server to serve the SPA entry for direct URLs under `/my-app/`,
including `/my-app/users/ada`. The router does not configure hosting rewrites,
asset paths, or server rendering.

## Reactive primitives

Use reactivity on its own when you need observable data without mounting any
HTML. Start with state, derive a value, and react to changes.

### State, derived values, and effects

The standalone reactivity entry works without a DOM:

```js
import { batch, computed, createScope, effect, signal, state } from '@jnreis/briojs/reactivity';

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

| Primitive | Purpose |
| --- | --- |
| `state(value)` | Observe plain objects and arrays; preserve cycles and shared references. |
| `signal(value)` | A reactive `.value` for primitives and replaceable values. |
| `computed(fn)` | Lazy, cached derived value, invalidated by the values it reads. |
| `effect(fn)` | Recollect dependencies each run; return an idempotent stop function. |
| `batch(fn)` | Run affected effects once after a synchronous group of writes. |
| `flush()` | Run pending effects immediately, even inside a batch or event handler. Later writes still apply when the batch ends. |
| `untrack(fn)` | Return `fn`'s result without subscribing the surrounding effect/computed to its reads. |

### Give reactive work a lifetime

`createScope()` owns nested scopes and effect cleanup. `onCleanup(fn)` registers
cleanup in the current scope and errors if there is no active scope. A computed
created outside a scope can be stopped with `.dispose()`.

When called directly in an effect body, `onCleanup(fn)` is **per run**:

- It runs before the effect's next run and when the effect stops or its scope
  is disposed. This works in unowned effects too.
- Cleanup inside a nested `scope.run()` keeps that scope's lifetime.
- As with scope cleanups, the returned function runs the cleanup early, at most
  once.

```js
effect(() => {
  if (!settings.live) return;
  const unsubscribe = feed.subscribe(onMessage);
  onCleanup(unsubscribe); // Unsubscribes when live turns off, before re-subscribing, and on stop.
});

effect(() => {
  const days = filters.days;          // Tracked: reloads when the range changes.
  untrack(() => load(days, filters)); // Reads inside load() do not become dependencies.
});
```

### Group related changes with `batch`

Effects run synchronously by default. Explicit batches are synchronous too;
there is no hidden next-tick scheduler.

Event handlers are already batched. Wrap several writes made elsewhere
(timers, fetch callbacks, scripts) in `batch()` so lists and bindings update
once instead of after every write.

### Arrays and efficient DOM updates

Mutating array methods (`push`, `splice`, `sort`, …) run on the underlying array,
then notify only changed indexes and `length` when it changes. Returned values
(`pop()`, `shift()`, `splice()` results) and `sort` comparator arguments are the
same reactive values that reads return.

| Binding | When Brio writes to the DOM |
| --- | --- |
| `b-text`, `${…}`, primitive `b-bind-*` | Only when the value differs from the last written value. |
| `b-bind-class` | Only changed class names are added/removed; classes added by other code stay. |
| Object values, such as a style object | Always reapplied, since they may have changed in place. |

### Update ordering and reactive cycles

- **Owners update before their children.** Pending effects run in creation
  order. An owner (outlet, branch, component, or effect mounting child scopes)
  is created before its child effects, so it disposes stale children before
  they can run against new values.
- **An effect does not trigger itself** by writing a value it read in the same
  run.
- **Writes from other code are not lost.** If a nested effect or `untrack`ed
  code writes an already-read value while an effect is still running, the
  effect runs again immediately after its current run. One example is an auth
  guard calling `router.navigate()` during route setup.
- **Repeated reruns are bounded.** After 100 consecutive such runs, Brio throws
  `A Brio effect keeps re-triggering itself.`
- **Derived values stay coherent.** A write invalidates every dependent
  computed before any effect reruns. A computed read later in the same batch
  or handler already reflects the write; effects never see half-updated
  derived state.
- **Computed cycles surface explicitly.** A computed reading itself directly
  or through other computeds throws `Circular Brio computed dependency.` It
  recovers once the cycle is broken.

### Async resources

Use a resource for data that follows reactive inputs, such as search results.
It keeps loading, data, and error state together and prevents stale requests
from overwriting newer results.

`resource(fetcher)` is exported from `@jnreis/briojs` and `@jnreis/briojs/reactivity`, and is
available as `brio.resource` in the browser bundles. It starts immediately and tracks
reactive dependencies read synchronously by the fetcher (before its first await).
It does not block mounting or provide server rendering.

```js
import { createScope, resource, signal } from '@jnreis/briojs/reactivity';

const scope = createScope();
const query = signal('Brio');
const results = scope.run(() => resource(async signal => {
  const url = '/api/search?q=' + encodeURIComponent(query.value);
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Search failed: ${response.status}`);
  return response.json();
}));

// Bind results.data.value, results.loading.value, and results.error.value.
query.value = 'HTML'; // Aborts the previous execution and starts a new one.
await results.refetch(); // Explicit refresh using the current query.
scope.dispose(); // Stops dependency tracking and aborts pending work.
```

#### Requests and cancellation

- The fetcher receives a fresh `AbortSignal` on every execution. Existing
  zero-argument fetchers still work.
- Starting a new execution aborts the previous one. Only the latest execution
  may publish data, error, or completion, even if a fetcher ignores cancellation.
  An obsolete `refetch()` promise still waits for its own fetcher to settle;
  aborting does not forcibly terminate arbitrary asynchronous work.
#### Resource data, loading, and errors

- Refreshing retains existing data, clears the previous error, and sets loading
  true. A latest successful execution replaces data (including with undefined).
  A latest failure retains data, records the original error, and clears loading.
  Related status changes are batched for coherent reactive notifications.
- Fetcher failures, including synchronous throws, are recorded in `error.value`;
  `refetch()` resolves after recording them, rather than rethrowing them.
  Render errors visibly. Aborted superseded/disposed executions do not publish
  errors; other fetcher errors are not silently discarded.
#### Owning and disposing a resource

- A resource belongs to the scope active at construction. Component setup,
  scoped plugins, or an explicit `scope.run()` can own it; the app's state factory
  alone does not provide an owner scope.
- Standalone resources work without an active scope, but must be explicitly
  disposed with `results.dispose()`. Disposal is idempotent, stops dependency
  tracking, aborts pending work, sets loading false, and preserves settled
  data/error. No late completion publishes after disposal. Subsequent
  `refetch()` calls reject with a disposed-resource error.

#### Resource boundaries

The utility does not cache, deduplicate, retry, or impose timeouts. Actual
cancellation requires the fetcher to pass its signal to a cancellable operation.
Signals expose mutable values; application code should treat resource outputs
as read-only and perform refreshes through `refetch()`.

## Step navigation

For a wizard or guided flow, use a small step engine rather than a full router.
It keeps one current step and lets Back follow the path the user actually took.

### Create a flow and connect the buttons

The optional `@jnreis/briojs/step` entry (browser: `brio.step.min.js`) provides
`createStepEngine({ initial, steps })`, a small synchronous navigation engine
with **exactly one current step** and history-based Back. It owns its reactive
state: definitions are configuration, not a record of mutable active flags.

```js
const wizard = brio.createStepEngine({
  initial: 'intro',
  steps: {
    intro: { next: 'details' },
    details: { next: 'review' },
    review: {},
  },
});

const app = brio.createApp({
  state: () => ({ wizard }),
});
app.mount('#app');
```

```html
<div id="app">
  <p>Current: <span b-text="$data.wizard.current"></span></p>
  <section b-if="$data.wizard.isActive('intro')">Welcome</section>
  <section b-if="$data.wizard.isActive('details')">Enter your details</section>
  <section b-if="$data.wizard.isActive('review')">Review your answers</section>
  <button b-on-click="$data.wizard.back()"
          b-bind-disabled="!$data.wizard.canGoBack">Back</button>
  <button b-on-click="$data.wizard.next()"
          b-bind-disabled="!$data.wizard.canGoNext">Next</button>
  <button b-on-click="$data.wizard.go('review')">Jump to review</button>
  <button b-on-click="$data.wizard.reset()">Start over</button>
</div>
```

Keep the engine in `$data` for local use. For intentional sharing, pass the same
instance through `createApp({ stores: { wizard } })` and read `$stores.wizard`.
Neither pattern requires wrapping the definitions or engine in `state()`.

### Step engine API

| API | Behavior |
|-----|----------|
| `current` | Read-only reactive name of the current step. |
| `canGoNext` | Read-only reactive boolean: the current definition has a `next` link. |
| `canGoBack` | Read-only reactive boolean: history is nonempty. |
| `isActive(name)` | Reactive current-name comparison; unknown names return `false`. |
| `go(name)` | Navigate to a registered name and push the former current name; returns `true`. Invalid/unknown targets throw before mutation. |
| `next()` | Follow the configured next link; return `false` without warning at a terminal step. |
| `back()` | Pop history, without pushing another entry; return `false` without warning when empty. |
| `reset()` | Restore initial and clear history; return `true` if current or history changed, otherwise `false`. |

### History, cycles, and reset

Back follows the **actual path**, not a configured reverse link. For example,
Intro → Review → Back returns directly to Intro. After Back, further navigation
records a new path; there is no Forward stack. History is private and unlimited
until reset or the engine is released.

Cycles are allowed. Navigating to the current step is a successful no-op, with
no history entry or reactive notification. A self-linked step still has
`canGoNext === true`. Returning to the initial step through `go()` or a configured
link **preserves history**; only `reset()` clears it.

### Step configuration rules

Configuration is validated and copied once:

- Supply a nonempty plain-object `steps` record and an explicit registered
  initial name.
- Each definition accepts only an optional nonempty `next` string naming a
  registered step. `{}` is terminal.
- Forward references, cycles, and exact literal names are supported.
- Unknown fields, accessors, malformed values, and dangling links throw.
- Keep labels/form data separately: definitions cannot contain `active`,
  `keep`, `back`, `origin`, or business metadata.
- Later changes to the input objects do not change the engine.

npm exports `StepOptions`, `StepDefinition`, `StepRecord`, and `StepEngine`.

### Ownership and application workflow

The facade and its methods are read-only. Navigation publishes a coherent final
state even when called directly from JavaScript. Constructing an engine creates
no effect or app-owned resource; disposing a consumer does not reset an engine
shared with another app.

Reset affects navigation only, not form/application data. This utility has no
dynamic registration, multiple-active mode, completion tracking, asynchronous
guards, or hooks. Validate/await application work before navigating; manage
loading, errors, and competing requests in that application workflow.

## HTTP

Use the HTTP helper for common Fetch requests, with query serialization,
response parsing, and explicit HTTP errors. Keep loading and error presentation
in your application.

### Make a request and handle its result

Load `brio.http.min.js` after the core for `brio.http` and `brio.HttpError`,
or import `http` and `HttpError` from `@jnreis/briojs/http` (also exported by `@jnreis/briojs`).
HTTP is not an automatic `$http` expression helper:
expose application methods through `$data` or component setup.

```js
import { http, HttpError } from '@jnreis/briojs';

const controller = new AbortController();
try {
  const result = await http.get('/api/items', {
    filter: { published: true },
    tags: ['js', 'html'],
  }, { signal: controller.signal });
  console.log(result);
} catch (error) {
  if (error instanceof HttpError) {
    // The error response body has not been consumed.
    console.error(error.status, await error.response.text());
  } else {
    // Network, cancellation, serialization, or response parsing failure.
    console.error(error);
  }
}
```

All five methods use `(url, bodyOrQuery?, options?)`:

| Method | Second argument |
| --- | --- |
| GET, DELETE | Query parameters. |
| POST, PUT, PATCH | Request body. |

There is no HEAD helper.
To supply options alone, pass `undefined` as the second argument.

### Query parameters

Pass a plain object or `URLSearchParams` to GET/DELETE. A top-level null or
undefined means no query argument. Existing parameters are preserved and new
entries appended; fragments are preserved. Relative URLs with a query argument
resolve against the current page URL (or `http://localhost` outside a browser).

- Nested objects use brackets: `{ user: { name: 'Ada' } }` becomes
  `user[name]=Ada`.
- Scalar arrays repeat empty brackets: `{ tags: ['js', 'html'] }` becomes
  `tags[]=js&tags[]=html`.
- Structured array entries use indices: `{ rows: [{ id: 1 }] }` becomes
  `rows[0][id]=1`. Nested arrays follow the same rule.
- Strings, finite numbers, booleans, and Dates are supported; Dates use ISO UTC.
  Null becomes an empty value; undefined is omitted, including inside arrays.
  Empty arrays/objects add no entries.
- Only own enumerable string-keyed object properties and present array entries
  are serialized. Cycles, invalid Dates, functions, symbols, bigint, nonfinite
  numbers, and unsupported object types reject before fetching.

The examples above show decoded keys; URL encoding is handled by
`URLSearchParams`. Bracket parsing requires server support, not a universal
query standard. For repeated plain keys or another convention, pass an explicit
`URLSearchParams`, for example `new URLSearchParams([['tag', 'a'], ['tag', 'b']])`.
Brio appends those entries without adding brackets or mutating the input.
DELETE has no body; use native Fetch if an endpoint requires one.

### Request bodies and options

#### JSON bodies

Plain objects, arrays, numbers, booleans, and null are JSON-serialized for
POST/PUT/PATCH. Nested values follow native `JSON.stringify` semantics, including
its omissions and errors; this is not a schema validator. Unsupported top-level
values and serialization yielding undefined reject. An omitted body stays absent.
Brio adds `Content-Type: application/json` only when no content-type was supplied.
Caller headers are copied, never mutated.

#### Native Fetch bodies

Strings and native Fetch bodies (`FormData`, `URLSearchParams`, `Blob`/`File`,
`ArrayBuffer`, typed arrays/DataView, and `ReadableStream`) pass through unchanged.
Buffer-view offsets/lengths are preserved. Brio does not set their content-type:
Fetch derives it when appropriate. Do not set a multipart content-type manually;
the browser must generate its boundary. Build form bodies explicitly; a supplied
content-type does not change how a plain object is serialized.

#### Fetch options and request lifetime

Options accept Fetch's `RequestInit` fields except `method` and `body`, plus
`parser` and optional `duplex: 'half'` for platforms requiring it for streams.
Headers support all native `HeadersInit` forms. `parser` is not forwarded to Fetch.
Fetch/platform restrictions still apply, including streaming support and CORS.
Signals pass through unchanged; Brio does not automatically abort requests on
scope disposal, retry failures, enforce timeouts, or coordinate competing requests.
Own those policies in application methods and always restore loading state.

### Response parsing and errors

Without `parser`, successful responses follow this contract:

| Response | Result |
|---|---|
| HTTP 204 or 205 | `undefined` |
| `application/json` or a structured `+json` media type | Parsed JSON; a zero-length body returns `undefined` |
| Other or missing content-type | Text, including `''` for an empty body |

Media types are case-insensitive and may include parameters. Whitespace-only
JSON and malformed nonempty JSON reject; Brio does not silently return their text.
JSON `null` remains null, distinct from an absent response.

#### Choosing a response parser

An explicit `parser: 'json' | 'text' | 'blob' | 'arrayBuffer' | 'formData'`
always calls the corresponding native Response method, even for 204/205.
Consequently explicit JSON parsing rejects an empty body. Other native parser
failures propagate unchanged.

#### HTTP errors versus other failures

Non-OK responses reject with `HttpError` **before parsing**, exposing read-only
`response` and numeric `status`. The body remains unread so the caller chooses
how to consume it. Network/abort, serialization, and parsing failures retain
their original error types; they are not wrapped as HTTP status errors.

#### HTTP response types

TypeScript defaults to unknown response data. `http.get<Item>(url)` returns
`Promise<Item | undefined>`; explicit `{ parser: 'json' }` returns `Promise<Item>`.
These generic arguments describe an expected shape, not runtime validation.
Explicit non-JSON parsers infer their native result types. npm also exports
`HttpMethod`, `HttpParser`, `HttpOptions`, `HttpBody`, `HttpQuery`, and
`HttpQueryValue`.

## Form validation

Describe your rules, validate your data, then show the messages in your own UI.
The helper leaves you in control of when validation runs and how errors appear.

### Validate a set of fields

`validate(data, schema, customRules?)` is a synchronous helper, not a form
controller. Import it from `@jnreis/briojs/inputs` or `@jnreis/briojs`; the optional
`brio.inputs.min.js` browser script exposes `brio.validate`.

```js
import { validate } from '@jnreis/briojs/inputs';

const schema = {
  email: [
    { name: 'required', message: 'Enter your email address.' },
    { name: 'email', message: 'Enter a valid email address.' },
  ],
  password: [{ name: 'min', value: 8, message: 'Use at least eight characters.' }],
  confirmation: [{ name: 'same', value: 'password', message: 'Passwords must match.' }],
};

const result = validate({
  email: 'ada@example.com',
  password: 'eight-or-more',
  confirmation: 'eight-or-more',
}, schema);

if (result !== true) {
  // Field names map to arrays of messages, e.g. result.email.
  console.log(result);
}
```

### Read the validation result

| Result | Meaning |
| --- | --- |
| `true` | All rules passed. |
| Field-to-message-array object | Validation failed; each field may have several messages. |

> Check `result !== true`, not truthiness: an error object is truthy too.

All declared rules run in order. Each rule accepts
`{ name, value?, message? }`. Without a custom message, the fallback is
`"<field> failed <rule> validation"`.

### Built-in validation rules

| Rule | Meaning |
| --- | --- |
| `required` | Rejects null, undefined, false, empty/whitespace-only strings, empty arrays, and objects without enumerable string keys. Numeric zero is valid. |
| `min` / `max` | Minimum/maximum string or array length, or numeric value. The rule's `value` supplies the bound. String length is UTF-16 length, not grapheme count. |
| `email` | A basic string email-format check, not verification that an address exists or can receive mail. |
| `same` | Strict equality with another top-level field named by `value`. |
| `in` | Membership in the array supplied as `value`, using native `includes` semantics. |

### Add your own rules

Custom rules receive `(value, ruleValue, allData)` and return a boolean. They
can add rules or override built-ins:

```js
const result = validate({ age: 24 }, {
  age: [{ name: 'multipleOf', value: 3, message: 'Use a multiple of three.' }],
}, {
  multipleOf: (value, divisor) => typeof value === 'number' && value % Number(divisor) === 0,
});
```

### Connecting validation to a form

Unknown rule names throw a `TypeError`; they are not skipped. There is no
implicit trimming, nested-path traversal, or async validation. For an optional
field, omit format rules when it is empty rather than expecting `email` or `min`
to skip it. Call `validate` from your own submit/input handlers, put errors in
reactive state, and render messages with `b-text`, or let `b-form` do that
wiring for you. Server-side validation is still required.

### Bind a whole form with `b-form`

`b-form` connects a `<form>` to `validate`. It is part of the inputs add-on:
load `brio.inputs.min.js` after the core, or install `inputsPlugin` once, then
give the form its rules and a submit function:

```js
import { createApp } from '@jnreis/briojs';
import { inputsPlugin } from '@jnreis/briojs/inputs';

createApp({
  plugins: [inputsPlugin],
  state: () => ({
    rules: {
      email: [
        { name: 'required', message: 'Enter your email address.' },
        { name: 'email', message: 'Enter a valid email address.' },
      ],
    },
    async save(values) {
      const response = await fetch('/api/signup', { method: 'POST', body: JSON.stringify(values) });
      if (!response.ok) throw new Error(`Signup failed: ${response.status}`);
    },
  }),
}).mount('#signup');
```

```html
<form id="signup" b-form="{ rules: $data.rules, submit: $data.save }" novalidate>
  <label>Email <input name="email" type="email"></label>
  <p class="error" b-text="$form.error('email')"></p>
  <button b-bind-disabled="$form.submitting">Sign up</button>
  <p b-if="$form.submitError">Something went wrong. Try again.</p>
</form>
```

Inside the form, `$form` holds:

| Name | Meaning |
| --- | --- |
| `values` | Every named control, read as a server would see it: text as strings, `number`/`range` as numbers (`null` when empty), a single checkbox as `true`/`false`, same-name checkboxes and `<select multiple>` as arrays, radios as the checked value, files as an array. |
| `errors` | The `validate` result as field-to-messages, `{}` when valid. Updates as values change. |
| `error(name)` | The first message for a field once it was touched (blurred) or the form was submitted; otherwise `''`. Use it for display. |
| `touched` | Fields the user has left at least once. |
| `valid`, `submitted`, `submitting` | Booleans for the current state. |
| `submitError` | Whatever the submit function threw or rejected with, or `null`. |
| `reset()`, `submit()` | Call `form.reset()` or `form.requestSubmit()`, including all of the behavior below. |

- **Submitting:** an invalid form cancels the submission and focuses its first
  invalid control. A valid form with a `submit` function cancels the native
  submission and calls `submit(values, event)`; a second submission is ignored
  while a returned promise is pending. Without a `submit` function a valid form
  submits natively.
- **Accessibility:** controls with a shown error get `aria-invalid="true"`. Use
  `novalidate` to replace the browser's own messages with yours, and render
  messages next to their fields.
- **Values come from the DOM.** `b-form` reads controls on `input`, `change`,
  `reset`, and submit. If you also use `b-model` and change the model from code,
  the new value is read on the next user edit or submit.
- **Options:** `{ rules?, customRules?, submit? }`. The expression is read again
  on every validation, so rules can come from state.

## Persistence

Keep a preference or draft across reloads with `persist()`. It returns reactive
data you can use in bindings just like other state.

### Persist a component's preferences

Import persistence where needed:

```js
import { createApp } from '@jnreis/briojs';
import { persist } from '@jnreis/briojs/persistence';

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

### Values and storage adapters

| Value | How to use it |
| --- | --- |
| Object or array | Reactive directly; read/write its properties or items. |
| Primitive | Returned as a signal; use `.value`. |

| Storage option | Adapter |
| --- | --- |
| Omitted, or `{ storage: 'local' }` | `localStorage` (default). |
| `{ storage: 'session' }` | `sessionStorage`. |
| `{ storage: adapter }` | Your `getItem`/`setItem` adapter. |

JSON serialization errors and storage errors are surfaced.

### Persistence lifetime and cross-tab updates

- Inside component setup, an app plugin, or an explicit reactive scope,
  disposal removes the save effect and cross-tab listener.
- Outside any scope, a value lives for the life of the page. For example,
  a module-level `const token = persist('token', '')` may be shared by several
  components.
- Cross-tab updates apply to the existing reactive value; array roots are
  replaced in place. Saving continues afterwards.
- A remote value with a different shape is ignored: array versus object, or a
  non-object for an object root.

> Persistence uses JSON, not encryption. Browser storage is not a secure
> credential vault or an authoritative server-side data store.

## Trusted HTML and expression security

The simplest safe default is to display user content as text and keep Brio
templates under your application's control.

### Treat expressions as application code

Directive expressions are ordinary strict-mode JavaScript, compiled and cached
at runtime with `new Function`, without `with`.

> Expressions are **not a sandbox**. Never render untrusted content as a Brio
> template or directive expression. Runtime compilation is incompatible with
> a strict CSP that disallows `unsafe-eval`.

### Choose text or markup deliberately

`b-text` evaluates its source expression and writes the result as literal text.
Tags and `${...}` inside returned values are never interpreted. Authored HTML
interpolation still evaluates once; its returned values also remain literal.
`b-html` parses markup without activating Brio directives, interpolation, or
contextual scripts. Both sources remain reactive:

```html
<p b-text="$data.userText"></p>
<p>${$data.userText}</p>
<div b-html="$data.staticMarkup"></div>
```

Use **`b-text` for untrusted/user-provided text**. Inert HTML is not sanitized:
HTML attributes and other browser behavior can still be dangerous.

| Content | Brio behavior |
| --- | --- |
| `b-text` or the value returned by authored `${...}` interpolation | Literal text; tags and `${...}` in the returned value are not interpreted. |
| `b-html` | Parses HTML, but leaves Brio directives, interpolation, and contextual scripts inactive. Not sanitization. |
| `b-html.hydrate` | Activates a Brio template only when explicitly marked with `trustedHTML()`. |

### Activate only trusted dynamic templates

To activate a dynamic Brio template, explicitly use `b-html.hydrate` with a
`trustedHTML()` value. Ordinary strings, null, and undefined are rejected in this
mode. Use `trustedHTML('')` to clear an active template. Each replacement
disposes previous effects, listeners, refs, and owned resources before hydrating
the new content. A value without the trust marker is rejected before replacing
existing content. Authored `b-template` and managed insertion are unchanged.

```js
import { createApp, trustedHTML } from '@jnreis/briojs';

createApp({ state: () => ({ content: '<em>Trusted</em>' }) }).mount('#content');
```

```html
<div id="content" b-html.hydrate="trustedHTML($data.content)"></div>
```

Only call `trustedHTML()` with templates you trust as application code. It is a
trust assertion, not sanitization or a security boundary. Sanitizing ordinary
HTML does not necessarily make it safe to execute as a Brio template.

## Errors

When something goes wrong, start with the error message: it points back to the
HTML or JavaScript that needs attention.

### Find the failing expression

Brio errors say where they happened. Expression failures name the expression,
the directive, the element (tag, id, and up to two classes), the nearest
enclosing custom element, and the original error:

```text
Brio expression failed: "$data.user.name" in b-text on <span.name> inside <user-card>: TypeError: Cannot read properties of undefined (reading 'name')
```

### Inspect the error details

| Property | Contains |
| --- | --- |
| `error.cause` | Original expression error. |
| `error.directive` | Attribute name. |
| `error.element` | Element to inspect in devtools. |

### Structural errors and effect failures

- Brio's own structural errors gain the element being hydrated or updated,
  e.g. `b-ref requires a nonempty literal name. (at <p.note>)`.
- Effects that fail when state changes are reported together from the write:
  `One or more reactive effects failed.` lists every failure on its own line
  and keeps them in `error.errors`.
- Errors thrown by your own code (component `setup`, store methods, computed
  getters) are not rewritten; Brio wraps them only when they surface through a
  template expression, keeping the original as `cause`.

## Devtools

Use the development inspector to see app state, mounted roots, and effect
counts while you build. Keep it out of production.

### Open the inspector

Import the separate development entry before creating apps, then mount its inspector:

```js
import { devtoolsPanel } from '@jnreis/briojs/devtools';

const stopInspector = devtoolsPanel(document.querySelector('#brio-tools'));
```

### Inspector cleanup and activation

- The inspector tracks app state snapshots, mounted roots, and reactive effect
  counts.
- Call the returned function to remove the panel and its subscription.
- The main entry also exports devtools functions, but does not activate tracking
  automatically. Unused tooling can be tree-shaken.

With the development browser bundle, use
`brio.devtoolsPanel(document.querySelector('#brio-tools'))` directly.

## App and lifecycle API

Mount behavior where you need it, and release it before its host removes the
DOM. Brio's lifecycle APIs keep those two steps explicit.

### Managed dynamic insertion

Use `app.insert()` when new content needs Brio bindings and owned cleanup,
rather than writing HTML into a managed subtree yourself.

```js
const handle = app.insert('#items', 'append',
  '<button b-on-click="$data.count++">${$data.count}</button>',
  { data: { count: 0 } });
handle.remove();
```

`app.insert(target, placement, content, options?)` accepts a node or selector.

| Placement | Result |
| --- | --- |
| `before`, `after` | Insert beside the target. |
| `prepend`, `append` | Insert inside the target. |
| `replaceWith`, `replaceChildren` | Replace the target or its children. |
| `textContent` | Insert literal text; no HTML parsing or interpolation evaluation. |

HTML strings are automatically trusted and hydrated. Nodes and document
fragments are cloned, leaving originals untouched. Multiple top-level nodes
and structural directives are supported.

#### Insertion targets and expression helpers

The app method is `insert` (without `$`); the matching `$insert` helper is available in directive expressions and `$context.$insert`
in scripts. Its selectors are restricted to the originating mount root.
App-level selectors must resolve within exactly one of that app's mounted roots;
missing, ambiguous, cross-app, and disposed targets throw. Direct node references
also work for child placements on managed detached `b-if.detach` elements and teleported
elements. A contextual helper expires when its mount is unmounted, even if the
same root element is mounted again.

#### Inserted context, handles, and cleanup

Child placements inherit the target's context; sibling placements inherit its
parent's context. `{ data }` creates local reactive state with inherited state
accessible through `$data.$parent`; loop context remains available through `$for`.
Inserted content is owned by the destination scope, not the calling button/script.
The handle exposes current `nodes`, `removed`, and an idempotent `remove()`.
Removal, replacement, enclosing scope disposal, and unmount clean up bindings,
listeners, and nested insertions. Raw DOM removal does not trigger cleanup.

#### Insertion ownership rules

Mount roots cannot be replaced or used for sibling placements. Containers owned
by `b-ignore`, `b-text`, `b-html`, or router outlets reject child insertion rather
than competing with those directives. Roots generated by `b-if` and `b-for`
cannot be replaced directly, since those controllers retain their identities;
replace the enclosing container's children instead. `before`/`after` placements
next to a `b-for` row throw, because the loop owns the space between its rows;
insert into the row itself or outside the loop instead. Replacement is destructive: old content
is disposed first; a hydration failure removes the failed insertion and throws,
but does not restore the old content.

#### Trust and insertion

Use only templates you trust as application code. Automatic `trustedHTML` is an
ergonomic trust assertion, not sanitization; inserted expressions and scripts
execute code. Sanitizing HTML alone does not make it a trusted Brio template.

### Low-level dynamic hydration

Prefer `app.mount()` for independent roots: it manages runtime and cleanup
automatically. For integrations needing direct control, ESM imports expose
`hydrateRoot(element, context, runtime)` and `hydrateNode(node, context, runtime)`.

1. Supply an explicit context, including `$data`.
2. Supply a runtime with `app`, `state`, and `components`.
3. Invoke hydration inside `createScope().run(...)`.
4. Dispose that scope before removing or replacing the hydrated content.

Hydrate only new content, not an already hydrated subtree. Raw DOM removal does
not dispose bindings or listeners.

### App configuration and methods

```ts
createApp({
  state?: () => Record<string, unknown>,
  stores?: Record<string, unknown>,
  components?: Record<string, ComponentDefinition>,
  router?: Router,
  plugins?: BrioPlugin[],
})
```

| API | Purpose |
| --- | --- |
| `app.component(name, definition)` | Register a reusable component with a valid hyphenated custom-element name. |
| `app.use(plugin)` | Install a plugin function or [plugin object](#plugins) once per app; installing the same object again does nothing. |
| `app.directive(definition)` | Register a [custom directive](#plugins) before the first mount. |
| `app.helper(name, value)` | Make a `$`-prefixed value available in every expression; register before the first mount. |
| `app.mount(elementOrSelector)` | Mount one independently disposable root; returns `{ root, unmounted, unmount() }`. |
| `app.unmount(options?)` | Unmount all roots; leave the app mountable. |
| `app.dispose(options?)` | Permanently dispose the app and its scopes. |
| `app.state` | State shared by this app's mounted roots. |
| `app.stores` | Fixed read-only mapping of explicitly supplied stores; no automatic reactivity or persistence. |

The mount root is owned by Brio: unmount restores its original attributes and children by default. Put `b-if` and `b-for` on descendants, not on the mount root.

Framework SSR and hydration are not part of this release. Brio enhances existing HTML on the client, so server-rendered multi-page sites need no Brio server runtime.

### Server-rendered pages and page swaps

The host owns navigation and DOM replacement. Brio owns behavior attached to
each mounted root. No document observer or navigation adapter runs automatically.

```js
const app = createApp({ state: () => ({ count: 0 }) });
const mount = app.mount(element);

mount.unmount();                   // Cleanup and restore authored HTML.
// For outgoing DOM, use one of these instead:
mount.unmount({ restore: false }); // Cleanup this root without snapshot restoration.
app.unmount({ restore: false });   // Cleanup all roots; app remains reusable.
app.dispose({ restore: false });   // Cleanup all roots and permanently close the app.
```

#### What cleanup releases

Root-owned cleanup always runs, including listeners, effects, observers, refs,
and resources. App plugins and their resources live until app disposal, not
individual root unmounting. `{ restore: false }` skips original-attribute/child restoration;
it does not freeze the DOM: directive cleanup may remove owned output.
The resulting DOM is not a reusable template. Mount fresh server markup for
the next page. Teardown is idempotent; all roots are released even when cleanup
reports errors. Failed mounting still restores its original markup.

#### Page swaps and persistent roots

Before a client-side swap, dispose apps belonging to outgoing roots. After the
swap, mount fresh roots. For a persistent island, preserve the actual root
element and its existing mount; do not dispose or mount it again. DOM IDs do not
transfer state. Keep persistent and page-local apps separate when they need
independent app/plugin lifetimes.

#### Browser back/forward cache

For ordinary document navigation, no pagehide handler is required. Do not
unconditionally dispose on `pagehide`: `event.persisted === true` means the
browser may resume this same document from its back/forward cache. Keep its
mounts alive and do not remount on `pageshow`. If registering pagehide cleanup
for non-cached navigation, guard `!event.persisted` and do not use `{ once: true }`
(a cached departure would consume the listener).

### Astro islands

Use the optional adapter when Astro owns page navigation and Brio owns the
interactive islands. Register app factories once; the adapter handles discovery
and page-swap cleanup.

`@jnreis/briojs/astro` is an optional **client integration**, exported from the same
package. It requires no Astro server plugin, component wrapper, separate package,
or addition to the Brio browser core.

#### Register island factories

Install the adapter once from a shared layout's processed client script:

```astro
<script>
  import { enhanceAstro, lazyApp } from '@jnreis/briojs/astro';
  import { createGreeting } from '../apps/greeting';

  const integration = enhanceAstro({
    apps: {
      greeting: createGreeting,
      counter: lazyApp(() => import('../apps/counter')),
    },
    onError(error, root) {
      console.error('Unable to enhance island', root, error);
      // Show an application-specific error message if appropriate.
    },
  });

  if (import.meta.hot) {
    import.meta.hot.dispose(() => integration.dispose());
  }
</script>
```

#### Mark the island roots

Declare roots by registered name; sibling instances may use the same name:

```html
<section b-app="counter" b-props="{ initial: 5 }">
  <button b-on-click="$data.count++" b-text="$data.count">5</button>
</section>
```

#### Return one fresh app per island

Each factory receives `(root, props)` and returns a **fresh, unmounted** Brio app.
Factories may ignore either argument. Each island owns its entire app, including
plugins; do not return an app shared with another island or an existing mount.
Factories are synchronous; `lazyApp` explicitly marks asynchronous module loading.

```ts
// apps/counter.ts
import { createApp } from '@jnreis/briojs';
import type { AstroAppFactory } from '@jnreis/briojs/astro';

const createCounter: AstroAppFactory = (_root, props) => {
  const initial = props.initial ?? 0;
  if (typeof initial !== 'number' || !Number.isFinite(initial)) {
    throw new TypeError('Counter initial must be a finite number.');
  }
  return createApp({ state: () => ({ count: initial }) });
};

export default createCounter;
```

#### Eager and lazy code loading

Registry entries are loaded code, not app instances.

| Entry | Loading behavior |
| --- | --- |
| Ordinary factory function | Eager: the factory code is already loaded. |
| `lazyApp(() => import(...))` | Loads when a matching island is discovered; the module must default-export its factory. |

One loader promise is shared per lazy entry during an installation, but every
root gets its own app. This is **code loading**, not visibility, idle, or
interaction scheduling.

Authored server HTML remains until mounting; provide useful static content if
desired. A module failure is cached without automatic retries.

#### Island metadata and props

`b-app` and `b-props` are adapter metadata, not core directives:

- Names are exact registered keys. Unknown names and nested `b-app` roots are
  errors; use components for nested behavior. Independent siblings are supported.
- `b-props` is an optional trusted JavaScript expression, evaluated once per new
  root before code loading, with `$el` available and no app `$data`.
- It must return a synchronous plain object with data properties, not accessors,
  arrays, promises, or null. Absent props default to an empty object. Top-level
  props are shallow-copied/read-only; nested values are not deeply frozen.
- Props are passed to the factory, not automatically merged into app state.
  Runtime HTML props require validation; TypeScript does not type-check the HTML.
- Regular `b-bind-*` attributes keep their normal DOM-binding meaning.

#### Passing server data safely

The expression uses Brio's trusted JavaScript evaluator, not a sandbox or JSON
parser. Do not interpolate untrusted code into it. Astro frontmatter runs on the
server; processed scripts run in the browser. For server data, use Astro's HTML
attribute serialization and generate the expression as data, for example:

```astro
---
const initial = 5;
---
<section b-app="counter" b-props={JSON.stringify({ initial })}>
  <button b-on-click="$data.count++" b-text="$data.count">5</button>
</section>
```

JSON object text is also a valid object expression here; Brio itself still uses
JavaScript evaluation. Follow the host's safe serialization rules, and never
use HTML string concatenation with untrusted content.

#### Astro navigation and persistent islands

With Astro ClientRouter, the adapter releases outgoing apps before swaps and
discovers incoming roots on `astro:page-load`. Repeated events never remount
existing roots. Roots at or inside a matching `transition:persist` boundary keep
their actual app, DOM identity, and original props. Incoming props do not reset
them. If the boundary disappears, their apps are disposed. Use unique Astro
persistence names and leave Astro in charge of moving the preserved DOM.

#### Pending loads and island errors

Pending lazy initialization survives when its actual root is preserved.
Otherwise it is abandoned before the factory is called. Dynamic imports cannot
be cancelled, but obsolete completions never mount outgoing islands. Live load,
props, factory, mounting, and swap-cleanup errors go to the required
`onError(error, root)` callback; other islands continue. Failed roots do not retry
on repeated page-load events. Exceptions thrown by `onError` are surfaced as
uncaught errors. Invalid configuration and duplicate active installation throw
synchronously.

#### Disposing the Astro integration

`integration.dispose()` is idempotent: it unregisters host listeners, abandons
pending initialization, and disposes every app, restoring its authored snapshot.
Cleanup failures are thrown after releasing the other apps and installation
lock. Reinstallation is allowed after disposal. Outgoing page swaps instead use
`restore: false`. There is no document MutationObserver or public scan/retry API:
DOM changes outside Astro navigation remain the host's responsibility.

#### Compatibility and the runnable fixture

The adapter leaves back/forward-cached documents live. It is tested against
Astro 5.18.2 and its generated `data-astro-transition-persist` marker; reverify
when upgrading Astro or customizing its swap algorithm. The runnable
[fixture registry](https://github.com/jnreis/briojs/blob/main/tests/fixtures/astro/src/lifecycle.js) exercises eager/lazy
apps and persistent ancestors. Pulse events in the fixture are test diagnostics
for leaked listeners, not part of the adapter API.

Run `npm run dev:astro` to explore the fixture. Run `npx playwright install chromium`
once, then `npm run test:astro` for production-build browser tests of repeated
navigation, actual DOM/state persistence, resource cancellation, cleanup counts,
and browser back/forward restoration.

## Plugins

Plugins add your own `b-` directives, `$` helpers, and components to an app.
Built-in directives keep working exactly as documented; a plugin can only add
names, never change existing ones. Brio's own add-ons (inputs, observers, and
the router outlet) are plugins built on this same API.

### Write a directive

A directive is an object with a name and one or more hooks:

```js
import { createApp, defineDirective } from '@jnreis/briojs';

const tooltip = defineDirective({
  name: 'b-tooltip',
  arg: true,                    // also matches b-tooltip-top, b-tooltip-left, ...
  modifiers: ['hover'],         // anything else is an error that names the attribute
  mount(element, binding) {
    const tip = document.createElement('span');
    tip.className = `tooltip ${binding.arg ?? 'top'}`;
    element.append(tip);
    binding.effect(() => { tip.textContent = binding.value(); });
    if (binding.modifiers.hover) {
      binding.on(element, 'pointerenter', () => tip.hidden = false);
      binding.on(element, 'pointerleave', () => tip.hidden = true);
    }
    return () => tip.remove(); // runs when the element leaves the page
  },
});

createApp({ state: () => ({ name: 'Ada' }) })
  .directive(tooltip)
  .mount('#app');
```

```html
<button b-tooltip-left.hover="`Say hi to ${$data.name}`">Wave</button>
```

`defineDirective` only adds editor types; a plain object works the same way.

| Field | Meaning |
| --- | --- |
| `name` | `b-` followed by lowercase kebab-case. Built-in names and prefixes (`b-on-*`, `b-bind-*`, `b-attr-*`, `b-ref-*`, `b-router-*`) are reserved. |
| `arg` | `true` to also match `name-<anything>`, available as `binding.arg`. |
| `modifiers` | Allowed `.modifier` names. Omit to accept any, `[]` for none. `options` is reserved. |
| `options` | Allowed keys for a [`.options`](#directive-options) attribute, read as `binding.options`. Omit to reject `.options`. |
| `value` | `'expression'` (default), `'statement'` for event-style code, `'text'` for the raw attribute string, or `'none'` when the attribute must be empty. |
| `children` | `false` when the directive owns the element's content, like `b-text`; Brio then skips the element's children. |
| `scope`, `mount`, `ready` | The hooks below. At least one is required. |
| `description`, `example` | Optional text for documentation and editor tooling. |

### When each hook runs

Each element is processed in a fixed order, so you choose a phase rather than a
priority:

| Phase | Runs | Use it to |
| --- | --- | --- |
| `scope(element, binding)` | Before any other directive on the element, after `b-data` and `b-provide`. Return an object to add `$names` for the element, its other directives, and its descendants. | Give a subtree a controller, such as `$form`. |
| `mount(element, binding)` | With the element's other directives, in attribute order, before its children. | Most behavior: listeners, effects, observers. |
| `ready(element, binding)` | After the element's children are hydrated, alongside `b-model` on `<select>`. | Read or enhance content that Brio rendered inside. |

`mount` and `ready` may return a cleanup function. Structural directives
(`b-if`, `b-for`, `b-template`) finish first and hydrate each rendered copy
again, so hooks run once per rendered element. Plugin directives cannot be used
on component hosts or on `<template>` fragments; put them on an element inside.

When two directives react to the same event, the DOM's own order decides: a
capturing listener runs before `b-model`'s, a bubbling one after. That is how
`b-mask` formats input before `b-model` reads it.

### The binding

| Member | Purpose |
| --- | --- |
| `directive`, `name`, `arg`, `modifiers`, `expression` | The definition name, the full attribute name, the argument, the modifier flags, and the raw value. |
| `options` | The checked object from the element's `.options` attribute, or `{}`. Merge it over `modifiers` so that values win: `{ ...binding.modifiers, ...binding.options }`. |
| `context` | The expression context at this element (`$data`, `$ref`, and the rest). |
| `app` | The app that is hydrating the element. |
| `value()` | Evaluate the attribute. Inside `binding.effect`, it re-runs when what it reads changes. |
| `evaluate(source, locals?)` | Evaluate another expression in the element's context, with optional extra `$names`. |
| `run(locals?)` | Run a `'statement'` value, for example `binding.run({ $event })`. |
| `assign(value)` | Write to the attribute's expression, like `b-model` does. |
| `effect(fn)` | A reactive effect stopped with the element. |
| `on(target, type, listener, options?)` | `addEventListener`, removed with the element. |
| `onCleanup(fn)` | Run `fn` when the element leaves the page (`b-if`, `b-for`, unmount). |
| `hydrate(node)` | Hydrate content the directive inserted itself (with `children: false`) in the element's context. It is cleaned up with the element. |

Locals passed to `evaluate` and `run` must be `$`-prefixed, like `$event`.

### Give a subtree a name with `scope`

```js
import { defineDirective, state } from '@jnreis/briojs';

const disclosure = defineDirective({
  name: 'b-disclosure',
  value: 'none',
  scope: () => ({ $disclosure: state({ open: false }) }),
});
```

```html
<section b-disclosure>
  <button b-on-click="$disclosure.open = !$disclosure.open">Details</button>
  <p b-if="$disclosure.open">…</p>
</section>
```

Names from `scope` work like `b-data`: sibling directives on the element and
everything inside can read them, and nested elements can shadow them.

### Package a plugin

A plugin object groups directives, helpers, and components under one name:

```js
import { definePlugin } from '@jnreis/briojs';

export default definePlugin({
  name: 'brio-plugin-ui',
  directives: [tooltip, disclosure],
  helpers: { $currency: value => new Intl.NumberFormat('en', { style: 'currency', currency: 'USD' }).format(value) },
  components: { 'ui-badge': { template: '<span class="badge"><slot></slot></span>' } },
  setup(app) {},                       // once, at install
  onMount(root, app) { return () => {}; }, // after each root hydrates; cleanup on unmount
});
```

```js
createApp({ plugins: [ui] }).mount('#app');
// or: createApp().use(ui).mount('#app');
```

Shipping a browser script? Call `brio.use(plugin)` in it, and every app
created afterwards on the page installs the plugin, just like Brio's own
add-on scripts. `brio.use` exists only on the browser global; with npm, pass the
plugin to each app.

- **All or nothing.** If any part of a plugin fails to register (a name
  conflict, a failing `setup`), nothing from it stays installed.
- **Conflicts are errors,** never silent overrides. The message names both
  plugins.
- **Register before mounting.** `app.directive`, `app.helper`, and plugins that
  add them must run before the first `app.mount()`, so every root hydrates
  with the same vocabulary.
- **Helpers** need a `$` prefix and cannot reuse built-in names such as `$data`.
  A misspelled `$name` still throws a `ReferenceError`.
- **Installed once.** `app.use()` ignores a plugin object it already
  installed; a different plugin with the same name is an error.
- **Plugin functions still work.** `app.use(app => { … })` runs once with the
  app, and can call `app.directive()` and `app.helper()` itself.
- **Unknown directives warn in development.** With `brio.dev.min.js` or
  `enableDevtools()`, an unrecognized `b-` attribute logs a warning that names
  it, once per name. Production bundles stay silent.

Brio uses this same API itself: `inputsPlugin` (`b-mask`, `b-form`) and
`observersPlugin` (`b-on-enter`, `b-on-resize`, …) are plugin objects, and a
router brings `b-router-outlet` as `router.plugin`, which `createApp({ router })`
installs for you. Their names are reserved, so another plugin cannot claim them.

### Test a plugin

`@jnreis/briojs/testing` mounts markup in a fresh app. It needs a DOM on
`globalThis`, such as `global-jsdom` or happy-dom's global registrator:

```js
import 'global-jsdom/register';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderBrio } from '@jnreis/briojs/testing';
import ui from '../src/index.js';

test('b-tooltip shows its text', t => {
  const view = renderBrio('<button b-tooltip="\'Hi\'">Wave</button>', { plugins: [ui] });
  t.after(view.cleanup);
  assert.equal(view.get('.tooltip').textContent, 'Hi');
});
```

`renderBrio(html, options)` accepts every `createApp` option and returns
`{ root, app, handle, flush, get, type, click, cleanup }`. `type` and `click`
dispatch the events and flush, so assertions see the updated DOM.

### Publish a plugin

Start from the [plugin template](https://github.com/jnreis/briojs/tree/main/templates/plugin):
it includes a directive, a helper, tests, a demo page, and editor autocomplete.
Name the package `brio-plugin-<name>` (or `@scope/brio-plugin-<name>`), add the
`brio-plugin` keyword, list `@jnreis/briojs` as a peer dependency, and ship an
`html-custom-data.json` for your directives so users can add it to VS Code's
`html.customData`.

## Package entry points

Import the capabilities your app needs. Optional tools have dedicated entries,
and the reactivity entry works without a DOM.

### Import map

| Entry | Includes |
| --- | --- |
| `@jnreis/briojs` | App, components, DOM enhancement, trusted HTML, and core types. |
| `@jnreis/briojs/reactivity` | DOM-independent state, signals, effects, computed values, batching, async resources, and scopes. |
| `@jnreis/briojs/persistence` | Local/session/custom storage, with scope cleanup where owned. |
| `@jnreis/briojs/router` | Optional history or hash router; the router brings `b-router-outlet`. |
| `@jnreis/briojs/http` | Fetch helpers and `HttpError`. |
| `@jnreis/briojs/inputs` | `inputsPlugin` (`b-mask`, `b-form`), `validate` and its rules, and the `moneyMask` formatter. |
| `@jnreis/briojs/observers` | `observersPlugin`: `b-on-enter`, `b-on-exit`, `b-on-resize`, and the mutation directives. |
| `@jnreis/briojs/testing` | `renderBrio()` for testing apps and plugins in Node with jsdom or happy-dom. |
| `@jnreis/briojs/step` | Step navigation. |
| `@jnreis/briojs/devtools` | Development-only instrumentation and inspector panel. |
| `@jnreis/briojs/astro` | Optional named-island lifecycle integration and lazy code loading. |
| `@jnreis/briojs/dist/*` | Built files for self-hosted standalone browser scripts. |

### Runtime and browser requirements

All JavaScript entry points are ES modules; there is no CommonJS build. Runtime
dependencies are not required. Brio enhances client-rendered DOM rather than
providing server-side rendering or hydration of framework-generated server output.
Its reactivity entry can run without a DOM. Modern browsers are required; optional
observer directives and native CSS features depend on browser support.

### Migrating from Brio 4

Brio 5 moves directives that most pages never use out of the core bundle, which
makes `brio.min.js` about 2 KB smaller (brotli), and requires the `b-` prefix
on every directive.

| In Brio 4 | In Brio 5 |
| --- | --- |
| `b-mask`, `moneyMask` in the core / `brio.money-mask.min.js` | Load `brio.inputs.min.js`, or install `inputsPlugin` from `@jnreis/briojs/inputs`. |
| `validate` from `brio.forms.min.js` / `@jnreis/briojs/forms` | `brio.inputs.min.js` / `@jnreis/briojs/inputs`. |
| `@jnreis/briojs/money-mask` | `@jnreis/briojs/inputs`. |
| `b-on-enter`, `b-on-exit`, `b-on-resize`, `b-on-addednodes`, `b-on-removednodes`, `b-on-attrs`, `b-on-text`, and their `.options` | Load `brio.observers.min.js`, or install `observersPlugin` from `@jnreis/briojs/observers`. |
| `b-router-outlet` | Unchanged with `createApp({ router })`: the router installs it. |
| `app.plugin(plugin)` | `app.use(plugin)`. |
| `b-options="{ 'b-on-enter': { threshold: 0.5 } }"` | One `.options` attribute per directive: `b-on-enter.options="{ threshold: 0.5 }"`. Option values now win over modifiers. |
| Short forms without `b-`: `on-*`, `bind-*`, `text`, `html`, `model`, `mask`, `teleport`, `transition`, `effect` | Add the prefix: `b-on-click`, `b-bind-href`, `b-text`, and so on. Brio now leaves unprefixed attributes alone. |

With script tags, add the add-on script after `brio.min.js` and nothing else
changes: add-ons attach to every app created afterwards. With npm, add the
plugin to each app:

```js
import { inputsPlugin } from '@jnreis/briojs/inputs';
import { observersPlugin } from '@jnreis/briojs/observers';

createApp({ plugins: [inputsPlugin, observersPlugin], state: () => ({}) });
```

A page that still uses a moved directive without its add-on fails with an error
that names the script and the plugin to load.

### References for older applications

For a private application built with an older Brio runtime, use the
[legacy migration kit](./ai/brio-migrate-1-1-5/references/migration.md).
The [historical v3 reference](https://github.com/jnreis/briojs/blob/main/DOCUMENTATION-v3.md)
is preserved in the repository, not shipped as current documentation.
