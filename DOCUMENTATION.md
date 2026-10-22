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
import { http, HttpError } from 'briojs/http';
import { validate } from 'briojs/forms';
import { createStepEngine } from 'briojs/step';
import { moneyMask } from 'briojs/money-mask';
```

The development tools are deliberately separate:

```js
import { devtoolsPanel } from 'briojs/devtools';
```

Import that entry before creating apps to enable the development inspector.
All tooling is also available from the npm main entry without implicit activation:

```js
import { createApp, enableDevtools, inspectDevtools, devtoolsPanel } from 'briojs';
enableDevtools(); // Development only; before creating apps.
```

Unused devtools exports can be tree-shaken. Main-entry imports alone do not
enable snapshotting; the dedicated `briojs/devtools` entry enables it automatically.

### Browser bundles

Load one of the standalone bundles, not both:

```html
<!-- Production: runtime without development tools or tracking hooks -->
<script src="/dist/brio.min.js"></script>
<!-- During development, use this instead: -->
<!-- <script src="/dist/brio.dev.min.js"></script> -->
```

Both expose `window.brio` with `createApp`, `state`, `signal`, `computed`,
`effect`, `batch`, `flush`, `untrack`, `resource`, `createScope`, `onCleanup`,
`getCurrentScope`, and `trustedHTML`. Both dispatch the
`brio` ready event after publishing the core API.

All plugins are optional browser scripts. Load only what you
need, **after** the core and **before** application bootstrap:

```html
<script src="/dist/brio.min.js"></script>
<script src="/dist/brio.router.min.js"></script>      <!-- Adds brio.createRouter -->
<script src="/dist/brio.persistence.min.js"></script> <!-- Adds brio.persist -->
<script src="/dist/brio.http.min.js"></script>        <!-- Adds brio.http, brio.HttpError -->
<script src="/dist/brio.forms.min.js"></script>       <!-- Adds brio.validate -->
<script src="/dist/brio.step.min.js"></script>        <!-- Adds brio.createStepEngine -->
<script src="/dist/brio.money-mask.min.js"></script>  <!-- Adds brio.moneyMask -->
<script src="/app.js"></script>
```

The optional scripts extend the existing `window.brio`, use its reactive engine
and cleanup scopes, and do not dispatch another `brio` ready event. For deferred
loading, bootstrap after the needed scripts finish, not at the core's ready
event. Loading a plugin before the core throws. The same scripts work with the
development core. No plugin above is included in either core bundle. Pattern
masks and custom formatter support remain core; money formatting is optional.
The npm main entry retains tree-shakable named exports for convenience; each
plugin also has the dedicated subpath shown above. Importing a plugin has no
implicit application registration in ESM.

The development bundle additionally exposes `devtools`, `inspectDevtools`,
`devtoolsPanel`, and `enableDevtools`, with tracking enabled automatically. The production bundle compiles out devtools tracking hooks and
does not include the inspector or reactive state snapshotting.
Low-level `hydrateRoot` and `hydrateNode` are ESM-only APIs.
Use `app.insert()` for managed dynamic content and `createStepEngine()` for
step navigation.

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

Expressions run in strict mode without `with` or implicit state-name resolution. Use `$data` for the nearest state object (app state, component setup state, or `b-data`), `$data.$parent` for parent state, and `$for` for loop values. Bare state names such as `count` are not supported and unresolved identifiers throw `ReferenceError`. When the bare name is a loop variable, state key, or prop, the error suggests the path to use, for example `item is not defined. Loop variables are read through $for: use $for.item.` or `count is not defined. Use $data.count.` JavaScript globals such as `Math`, `JSON`, and `setTimeout` resolve normally.

The context is also available as `$context`. Named bindings include `$data`, `$el`, `$id`, `$ref`, `$for`, `$props`, `$emit`, `$insert`, `$stores`, `$provided`, `trustedHTML`, and `flush`. Event handlers receive `$event`; observers supply `$mutations`, `$size`, or `$entry`. Contextual scripts supply `onCleanup`. Bindings are read-only references; mutate writable state properties (`$data.count++`), not the binding itself (`$data = {}`). `$ref` names are also read-only. Event statements can declare ordinary local variables.

Each nested context inherits from its parent through the prototype chain and stores only what it adds (for example its own `$el`). Reads such as `$context.$data` see the whole chain, but `Object.keys($context)` and spreads list only the element's own keys.

Data and loop ancestry are independent: `$data.$parent.$parent` accesses a grandparent data scope, while `$for.$parent.$parent` accesses a grandparent loop. Ordinary elements and loops do not add data ancestry levels; data scopes do not add loop ancestry levels. Component setup state creates a data scope. App state and outermost loops have `$parent === undefined`. An empty `b-data` attribute inherits data without adding a scope; `b-data="{}"` creates one.

`$parent` is reserved, read-only metadata on scope-specific views, not a field added to user state. It is excluded from keys, spreads, and JSON serialization. The same underlying state object may have different parents in different scopes. Normal reads, writes, and methods remain reactive. Access ancestry through `$data.$parent` and `$for.$parent`, and use `$context` for other helpers.

`trustedHTML` remains public for JavaScript-authored values, for example
`app.state.markup = brio.trustedHTML('<em>Authored content</em>')` with
`b-html.hydrate="$data.markup"`. Expressions also receive `trustedHTML` directly.
It marks trust intent, not sanitization; managed insertion uses it internally.
Default `b-html` also accepts unmarked strings but never activates Brio.

## Shared stores

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

`$stores` is available in every app expression and as `$context.$stores` in scripts.
Component setup receives `$stores` directly; plugins can use `app.stores`.
Registration preserves the supplied values and identities and **does not make
them reactive**. Explicitly use `state()` for reactive objects/arrays or
`signal()` for primitive values (read signals through `.value`). Mutating a plain
store does not notify bindings, although another dependency may cause a later
read to see the new value.

`app.stores` is a shallow read-only, null-prototype snapshot of the registration
object. Names cannot be added, replaced, or deleted after app creation; store
contents remain mutable. Missing names return `undefined`. Registration must
be a plain object of enumerable own data properties, not an accessor registry.
No stores produces an empty mapping. Shared stores are not reset or disposed
when an app unmounts/disposes. Own store effects/resources explicitly; registration
does not create a resource scope or persistence. Normal stores last only for
the current page; use scoped `persist()` or an explicit backend/storage adapter
for reloads and multi-page navigation.

## Subtree-provided values

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

Provider expressions stay reactive: changing the outer theme updates its
consumers without remounting children. Nested providers override their own names
and inherit others. An explicitly provided `undefined` shadows a parent value;
removing the local key reveals the parent's value. Missing names return
`undefined`; outside a provider, `$provided` is an empty read-only mapping.

Provided names are read-only: `$provided.theme = 'light'` throws. Referenced
objects are not frozen, so `$provided.cart.items.push(product)` can update the
provided reactive object. The expression must return a synchronous plain object
of enumerable own data properties. Invalid initial or updated results throw;
they are not silently accepted. `$provided` in the provider expression refers
to the inherited values, not its own result.

Providers run after same-element `b-data` and, on repeated elements, after row
`$for` exists. Other bindings on that element see its provided values.
`b-if` conditions still use their parent context before branch-local providers.
Providers do not add `$data.$parent` or `$for.$parent` levels.

Component setup receives `$provided`; templates, scripts, routed views, and
managed inserted content inherit the applicable context. A provider on a
component host applies before setup. Slot content keeps its caller/authoring
context, not providers inside the component's template. Teleports preserve
their original context rather than inheriting from the physical destination.
Child insertion inherits destination providers; sibling insertion inherits the
parent container's providers. Provider effects stop when their owning scope is
disposed; `b-if.hide` and `b-if.detach` keep them active, while a false
unmodified `b-if` disposes them.

## HTML directives

Directive arguments use hyphens (`b-on-click`, `b-bind-href`); options use chained dot modifiers (`on-click.prevent.stop`, `b-if.hide`). `b-mask` takes a pattern or formatter, not modifiers.

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
| `b-mask` | Format an input with a Unicode pattern string or synchronous formatter function. Optional `moneyMask(options)` returns a formatter. |
| `b-transition` | Animate enter/leave with named CSS transition classes. |
| `b-for` | Render an array, iterable, object, or integer. |
| `b-key` | Give a repeated item a stable string or number identity. Used with `b-for`. |
| `b-template` | Unwrap an element or instantiate a `<template>`'s contents in place, hydrating them without a rendered wrapper. Implied on a `<template>` that carries any `b-` directive. |
| `b-html` | Insert markup without activating Brio; `.hydrate` activates templates explicitly marked with `trustedHTML()`. |
| `b-ignore` | Skip hydration for this element and its descendants. |
| `b-cloak` | Removed when Brio hydrates the element; pair with `[b-cloak] { display: none; }` to hide raw templates until mount. |
| `b-teleport` | Reactively move an element or template range relative to an Element/ref or document selector. Default placement: `after`. |
| `b-effect` | Run a reactive expression for side effects in the element's owned scope. |
| `b-router-outlet` | Render the component matching the current optional route. |
| `b-on-enter`, `b-on-exit` | Observe intersection/visibility changes. |
| `b-on-addednodes`, `b-on-removednodes`, `b-on-attrs`, `b-on-text` | Observe DOM mutations. |
| `b-on-resize` | Observe element or document size changes. |
| `b-options` | Configure observer directives on the same element; see Observer options. |

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

`b-for` uses `item in $data.items` or `item, index in $data.items`. These names declare properties of `$for`, so row expressions use `$for.item` and `$for.index`. Without `b-key`, the index is the key; provide a stable key when items can be inserted, removed, or reordered. Duplicate keys are errors. Keyed reorders move only rows whose relative order changed (swapping two rows moves two rows). A moved row keeps its element, state, focus, and text selection: Brio uses the browser's state-preserving `moveBefore()` where available and otherwise restores focus and selection after the move.

A row that moves to a *different* `b-for` (a card dragged to another list) is a new element in the destination loop, so focus cannot follow it automatically. Flush, then focus the new row by key:

```js
moveCard(card, toList);   // state change: removes the row from one loop, adds it to another
brio.flush();
document.querySelector(`[data-card-id="${card.id}"]`)?.focus();
```

A row whose repeated element is a single concrete element (not a `<template>`, `b-template`, or teleported row) is its own boundary: Brio adds no `<!--brio:range-->` comments around it. Template and teleported rows keep their range comments. Clearing a list, or replacing it with items that share no keys with the old ones, disposes every old row at once; when the loop is the only content of its parent (besides whitespace), the old rows are removed with a single DOM write.

`b-bind-*` binds a DOM property when one exists; otherwise it sets or removes the corresponding attribute. `false`, `null`, and `undefined` remove attributes. `aria-*` bindings are the exception for booleans: ARIA states are enumerated strings, so `true`/`false` become `"true"`/`"false"` (`b-bind-aria-pressed="$data.on"` keeps a toggle button's state announced), while `null`/`undefined` still remove the attribute. `class` accepts a string, array, or object of class names and booleans. `style` accepts a style object. Read-only properties (SVG geometry such as `r`/`cx`, `input.form`/`list`) are bound as attributes. A writable property whose setter throws surfaces an error instead of silently falling back to an attribute.

HTML parsing lowercases attribute names, so `b-bind-viewBox` reaches Brio as `b-bind-viewbox`. On SVG elements Brio restores the spec's mixed-case attribute names (`viewBox`, `preserveAspectRatio`, `gradientUnits`, `stdDeviation`, …). The `.prop` modifier always assigns a DOM property and resolves its casing against the element (`b-bind-tabIndex.prop`, `b-bind-scrollTop.prop`).

`b-model` text inputs and textareas preserve strings by default, including
whitespace and numeric-looking text. Supported model modifiers are `.lazy`
(update on change instead of input), `.trim` (trim whitespace), and `.number`
(`parseFloat`, keeping nonnumeric text unchanged). Text is literal by default;
`b-html.hydrate` opts into content hydration.

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

**Names and scope**

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

**Timing, reactivity, and lifetime**

Refs register as their targets hydrate, before their ordinary effects/children.
There is no pre-scan or descendant-ready guarantee during component setup or
earlier sibling initialization. Event-time optional chaining handles missing
targets; an owned effect can respond to a target appearing later:

```js
import { effect } from 'briojs';

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

Teleport preserves source data, providers, ref ownership, component/slot context,
listeners, and node identity. It changes physical CSS ancestry and native event
bubbling. Template ranges move together; keyed rows retain their order within
each loop's bounded target/placement group. Reactive retargeting while a
same-element conditional or conditional loop is detached does not reconnect its
output; activation uses the latest requested destination.

Removing a ref target through Brio returns independently owned teleported output
to its source. Removing the teleport's original owner disposes that output
wherever it lives. Selector-only targets have no reactive lifetime notification:
dispose the source owner before removing those destinations, or switch the target
expression first. Native DOM removal alone never unregisters a ref.

### Wrapperless content with `b-template`

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
| No `b-` directive (only `id`, `slot`, `class`, …) | Stays inert. Brio never touches its `.content`, so it is safe for templates cloned by your own code or other libraries. Short aliases such as `text` or `effect` do not count. |
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
- Same-element `b-effect` runs in the template's owned scope, after its contents
  hydrate. `b-teleport` moves the whole rendered range to its destination,
  including text, nested structural output, and boundary comments. Its selector
  must already exist; it is not a reactive template-source expression.
- Directives that need a surviving element are an error on a wrapper (an
  explicit `b-template` or a directive-bearing `<template>`): `b-text`,
  `b-html`, `b-bind-*`, events/observers, `b-model`, `b-mask`, `b-transition`,
  `b-router-outlet`, and their short aliases. Move them onto surviving children
  or an outer container. A registered component tag with `b-template` is
  unwrapped rather than instantiated as a component, so it cannot take props.
- Wrapper attributes are not forwarded: `class`, `style`, `id`, accessibility
  attributes, and the wrapper's layout/semantics disappear. Native CSS `@scope`
  follows the style element's new physical parent.
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

Directives are not an unordered set of independent behaviors. Structural
directives can replace a host or return before the ordinary directive pass.
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

Use one owner per DOM resource (children, input value, display, or structural
host). Not every conflict throws: some skip a directive or let reactive effects
overwrite each other. Do not rely on attribute order to resolve competing owners.

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
| `b-text` + `b-html` (including `.hydrate`) | Both replace the same children. Do not combine them. Existing child markup is replaced, not used as fallback or an additional hydrated template. |
| `b-bind-*` targeting `textContent` / `innerHTML` or `b-effect` mutating children + hydrated content | Direct DOM writes are not a substitute for owned content replacement and may remove nodes without disposing their bindings. Use `b-text` / `b-html` instead; keep third-party-managed subtrees under `b-ignore`. |
| `b-html` + child directives | Default HTML leaves inserted directives/interpolation inert. `.hydrate` requires `trustedHTML()`, hydrates replacements in an owned content scope, and disposes the previous one. In either mode, do not separately manage those same children with an outlet, insertion API, or another content writer. |
| `b-router-outlet` + content writers / authored child bindings | Give the outlet a dedicated empty container. It manages routed component children; other content owners conflict, and ordinary attributes after the outlet are not processed. Put unrelated behaviors on an outer wrapper. |
| `b-model` + `b-bind-value` / `b-bind-checked` / manual value-writing effects | Competing state-to-control writers. Let `b-model` own the control's value/selection; ordinary event handlers may perform additional actions but should not establish another independent value binding. |
| `b-model` + `b-mask` | Supported on text-like inputs/textareas: the mask formats input before model listeners read it. Masked values are formatted strings; `.number` uses `parseFloat`, not locale-aware money parsing. Initialize model values in the expected format; changing model state alone does not cause an input event or guarantee reformatting by the mask. |
| `b-model` on non-form elements; `b-mask` on non-input/textarea elements; `b-script` on non-script elements | Errors when processed. A component host does not acquire native input/script capabilities by using one of these directives. |
| `b-if.hide` + `b-bind-style` / effects writing `display` on the branch | Competing display owners; a reactive style write can reveal an inactive branch or override activation. Let the conditional own branch display; style a child or use `.detach` when appropriate. |
| `b-transition` + dynamic class/style bindings | Class bindings add and remove only the names they own, so transition classes survive. Do not let a binding toggle a transition class itself, and avoid styles that overwrite animated properties while a transition runs; put those on a child when possible. Keyed `b-for` rows with `b-transition` animate position changes through `<name>-move` and briefly own the row's inline `transform`; do not bind `style.transform` on that row. `b-transition` does not provide leave animation for removed `b-for` rows, or animate every descendant when an ancestor is removed. |
| `b-for` + same-row `b-teleport` | Supported for concrete or template rows. Keyed reconciliation moves the complete row range at its destination. Each loop owns bounded groups per target/placement, preserving unrelated surrounding content through retargeting. |
| `b-teleport` + a destination controlled by `b-text` / `b-html` / `b-router-outlet` / `b-ignore` | Child placements are errors; use `before` / `after` beside the controlled container, or choose an independently managed destination. |
| `b-if` + teleported children | Supported, but hiding an ancestor with `.hide` cannot hide descendants moved elsewhere. Their effects also stay live in preservation modes. Put visibility on the surviving teleported element when it must be controlled independently. |
| Multiple bindings/effects writing the same attribute/property | No arbitration. Use one expression per target; do not combine prefixed/unprefixed aliases or different modifier spellings to install competing bindings. |

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

#### Event modifiers

| Modifier | Effect |
|---|---|
| `.prevent`, `.stop` | Call `preventDefault()` / `stopPropagation()`. |
| `.self`, `.outside` | Run only for events targeting the element itself / outside it. |
| `.window`, `.document` | Listen on `window` / `document`. |
| `.once` | Remove the listener after the first event that passes the other filters. |
| `.capture`, `.passive` | Native listener options. |
| `.debounce`, `.throttle` | Rate-limit the handler (150ms). |
| `.enter`, `.esc`, `.space`, `.tab`, `.up`, `.down`, `.left`, `.right`, `.delete` | Run only for that key (`.delete` matches Delete and Backspace). Several keys mean any of them. |
| `.ctrl`, `.alt`, `.shift`, `.meta` | Run only while every listed system key is held. |

```html
<input b-on-keydown.enter.prevent="$data.addTag()" b-on-keydown.esc="$data.cancel()">
<div b-on-keydown.ctrl.enter.window="$data.save()"></div>
```

Key and system-key filters run first, so `.enter.prevent` cancels only Enter.
An unknown modifier (for example the typo `b-on-click.prevnt`) throws a
`SyntaxError` listing the supported names instead of being ignored.

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

Each event handler runs inside `batch()`: several writes produce one coherent
update when the handler returns. Consequently, DOM that depends on those writes
(a new `b-if` branch, its `$ref` entries, bound text/attributes) does not exist
yet inside the same synchronous handler. Call `flush()` to apply pending updates
first, for example
`b-on-click="$data.editing = true; flush(); $ref.field.focus()"`. Methods can
call the exported `flush()` (`brio.flush()` in browser bundles). Code after an
`await` runs outside the batch and sees updates immediately.

Observer `b-options` is specific to observer directives, not general directive
configuration. An observer on an element whose attributes/children are updated
by bindings or `b-html` can observe those framework writes too. Do not write the
same observed state/DOM back unconditionally from its callback or `b-effect`:
that can create feedback loops.

### Conditional lifecycle

`b-else-if` and `b-else` follow an adjacent `b-if` branch (whitespace and comments are allowed between branches). The first matching branch is selected; `b-else` is the final fallback. In every mode, conditions run in the parent scope before branch-local `b-data` or providers.

```html
<section b-if="$data.loggedIn" b-data="{ clicks: 0 }">
  <button on-click="$data.clicks++">${$data.clicks}</button>
</section>
<p b-else-if="$data.loading">Loading...</p>
<p b-else>Please log in.</p>
```

With unmodified `b-if`, an inactive branch is removed and dehydrated after its
leave transition completes, or immediately when no transition runs. Its bindings
and listeners remain live during leave. Reversing before completion reuses the
same element and local state; after a completed leave, activation creates fresh
branch-local `b-data` and component state. Parent/app state is not reset.

Set a preservation mode **only on the leading `b-if`**; it applies to every
branch in that chain:

```html
<section b-if.hide="$data.tab === 'settings'" b-data="{ edits: 0 }">
  <button on-click="$data.edits++">Edits: ${$data.edits}</button>
</section>
<section b-else-if="$data.tab === 'preview'">Preview</section>
<section b-else>Choose a tab</section>

<aside b-if.detach="$data.open" b-data="{ count: 0 }">
  <button on-click="$data.count++">Count: ${$data.count}</button>
</aside>
```

- `.hide` keeps every branch in the DOM and sets inactive branches to
  `display: none`; activation restores their authored visible display.
- `.detach` removes inactive branches without dehydration and reinserts the
  same nodes when selected.
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

Only `<script b-script>` is processed. Write an unassigned arrow expression so the browser does not execute its body:

```html
<script b-script>
  ($context) => {
    $context.$data.ready = true;
    const timer = setTimeout(() => { $context.$data.message = 'Ready'; }, 250);
    $context.onCleanup(() => clearTimeout(timer));
  }
</script>
```

Brio constructs a function factory with an explicit context parameter, then invokes the returned function with that context; scripts do not use `with`. Context includes `$data`, `$el`, `$id`, `$for`, and `$event` when supplied by the caller. Parent state is accessed with `$data.$parent`. `$el` is the script element. The same helpers are available as lexical bindings, so `() => { $data.ready = true; }` also works. Async arrows and destructured parameters are supported; errors are surfaced without retrying the script. Async initialization does not block mounting; initialize values used by the template before the first `await`. Register timer/listener cleanup synchronously through `$context.onCleanup`.

### Input masks

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

### Optional money formatter

```html
<script src="/dist/brio.min.js"></script>
<script src="/dist/brio.money-mask.min.js"></script>
<input b-mask="brio.moneyMask({ thousands: '.', decimal: ',', precision: 2 })">
```

```js
import { moneyMask } from 'briojs/money-mask';
const app = createApp({
  state: () => ({ amount: '', amountMask: moneyMask({ precision: 2 }) }),
});
```

```html
<input b-model="$data.amount" b-mask="$data.amountMask">
```

Options default to `thousands: ','`, `decimal: '.'`, `precision: 2`.
Precision is an integer from 0 to 100. Money intentionally retains ASCII-digit,
fixed-minor-unit entry: `123456` becomes `1,234.56`. It is not a locale-aware
number parser or Unicode digit converter. Options are copied at factory time;
use `b-mask="brio.moneyMask($data.options)"` to rebuild reactively.
npm exports the formatter types
from both `briojs` and `briojs/money-mask`.

### CSS transitions

`b-transition="'fade'"` uses `fade-enter`, `fade-enter-active`, `fade-enter-to`, and the corresponding `fade-leave*` classes. The default name is `brio`. Define CSS `transition` properties on the active classes and starting/ending styles on the other classes.

Brio tracks the element's own `transitionrun`, `transitionend`, and `transitioncancel` events for every running property, ignoring descendant events. Removal waits for all properties, including delays. A fallback uses computed CSS duration plus delay, not a fixed timeout. No-duration/reduced-motion styles complete without waiting for an event; unmount cancels pending frames, listeners, and timers. This directive handles CSS transitions, not keyframe animations.

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

The class is removed on the row's own `transform` `transitionend`, or after the computed duration. Interrupting a move restarts it from the row's current visual position. New rows play the enter transition, and rows that did not shift are untouched. Loops without `b-transition` never read layout. `b-transition` also works on component hosts, so a `b-for` of components can animate. Moves between different loops create a new element and cannot slide.

## Observer options

Observer directives support `b-options`, a synchronous object keyed by their
attribute name. Base-name options apply first, then full-name options, then
boolean dot modifiers. Options are read at hydration, not reactively retargeted.
This is an observer-specific API, not a restoration of general legacy options
for model/event/mask directives.

```html
<div b-options="{ 'b-on-enter': {
       root: '#scroller', rootMargin: '20px', threshold: [0, 0.5, 1]
     } }"
     b-on-enter.once.debounce="console.log($entry)"></div>

<div b-options="{ 'b-on-attrs': {
       target: '#observed', subtree: false,
       attributeFilter: ['data-theme'], attributeOldValue: true
     } }"
     b-on-attrs="console.log($mutations)"></div>

<div b-options="{ 'b-on-resize': { box: 'border-box', debounce: 250 } }"
     b-on-resize.document="console.log($size, $entry)"></div>
```

- **Intersection:** `root` accepts an Element/Document reference, selector, or
  null (viewport, the default). `rootMargin` uses native CSS length/percentage
  syntax; `threshold` accepts a number or array between 0 and 1. `.once` stops
  after the first delivered matching callback. Enter/exit still follow
  `isIntersecting`; thresholds control native notification boundaries, not an
  additional percentage filter.
- **Mutation:** `target` accepts an Element/Document/Text reference or selector;
  default is the directive element. `subtree` defaults to true for existing v4
  behavior; set false explicitly for direct-only observation. `.subtree` forces
  true. Attribute observers also support `attributeFilter` / `attributeOldValue`;
  text observers support `characterDataOldValue`. Old-value flags default false.
  Added/removed observers filter childList records; text observes characterData,
  not arbitrary `textContent` replacements.
- **Resize:** `.document` or `document: true` observes the owner document's
  documentElement. `box` is `content-box` (default), `border-box`, or
  `device-pixel-content-box`, passed to `observe`. `$size.width/height` use the
  selected measurement, accounting for vertical writing modes; `$entry` is the
  native entry. Device-pixel units are physical pixels. Missing nondefault box
  measurements report an error instead of silently supplying a different box.
- **Debounce:** `.debounce` / true means 100ms; numeric `debounce` selects a
  non-negative delay; false/absent runs immediately. A dot modifier overrides
  numeric configuration. Mutation debounce accumulates every matching record;
  intersection/resize use the latest matching entry. Disposal disconnects
  observers and cancels pending callbacks.

Selectors must resolve when hydrated. Invalid options throw explicitly.
Intersection/ResizeObserver require native browser support or an application
polyfill; native constructor validation governs CSS margins and platform support.

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

`template` is a markup string, a `<template>` element, or an `#id` selector naming a `<template>` in the host's document (`template: '#tpl-click-counter'`). Selector and element templates keep markup in the page where editors highlight it; a selector that does not match a `<template>` throws when the first instance mounts.

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

A declared `Boolean` prop is `false` when absent and `true` when present (any value except `"false"`); `Number` props pass through `Number()`; `String` is the default. Only `Boolean`, `Number`, and `String` are accepted. Bound props (`b-bind-*`) are never coerced. HTML lowercases attribute names, so `b-bind-userName` arrives as `$props.username`; use lowercase or dashed prop names (`$props['user-name']`). Setup receives `$props`, `$emit`, `$stores`, `$provided`, the private `$ref` registry, the host element as `el`, `app`, and `route` (the router's reactive route, when a router is installed). Templates and contextual scripts also access `$props` and `$emit`. Component events are bubbling `CustomEvent`s emitted with `$emit(name, detail)`. Named slots use `slot="name"` on projected content and `<slot name="name">` in the template. Component setup runs in an owned scope; effects, persistence, and listeners registered during setup are disposed when the component is removed.

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

Each bound prop is evaluated once at mount, before setup, and again only when
its dependencies change. Component template markup is parsed once per
definition and cloned for each instance in the host's own document.
`b-on-*`/`on-*` installs host event listeners with the same event modifiers
as ordinary elements (`<row-actions b-on-remove.stop.once="…">`,
`b-on-keydown.enter`). Observer-style names are host event names, not
observer installation; put observers on a concrete wrapper or inside the
component template.

Earlier structural/context steps still apply: `b-if`, `b-for` with `b-key`,
`b-data`, `b-id`, `b-provide`, and `b-ref` can be handled before component setup, subject
to the combination rules above. `b-ignore` skips setup altogether, while
`b-template` unwraps the tag instead of setting it up.
Other `b-*` host directives (such as `b-model`, `b-html`, `b-teleport`, and
`b-transition`) are rejected. Do not use unprefixed aliases to bypass that
restriction; they do not install ordinary host behaviors either.
Use a surviving wrapper or put the directive inside the component.

## Recommended CSS

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

Brio removes `b-cloak` from each element as it hydrates it (the mount root,
rows, branches, and component templates); `b-ignore` content is never
hydrated, so a cloak inside it stays. Unmounting restores the root's original
attributes, including `b-cloak`. Brio does not inject the rule itself: a
deferred or module script would inject it after first paint. Cloaked content
stays hidden if JavaScript fails or is disabled, so cloak only regions that
are meaningless without Brio, and prefer server-rendered or static markup for
content that must remain readable.

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

### A widget in an existing app

Mount a small root without taking over its host page. Non-overlapping roots can share app state; separate apps have isolated app state unless stores are explicitly shared:

```js
const widget = createApp({ state: () => ({ open: false }) });
const handle = widget.mount('#account-menu');

// When the host removes this widget:
handle.unmount();
```

Unmount restores the mount root's original attributes and child markup by default. `app.unmount()` unmounts all roots but leaves the app reusable. `app.dispose()` unmounts every root and permanently closes the app. All three teardown methods accept `{ restore: false }` when the host is about to discard the DOM; see [page lifecycle](#server-rendered-pages-and-page-swaps).

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
- `flush()` runs pending effects immediately, including inside a batch or event handler; later writes in the batch are still applied when it ends.
- `untrack(fn)` runs `fn` and returns its result without subscribing the surrounding effect or computed to anything `fn` reads.
- `createScope()` owns nested scopes and effect cleanup. `onCleanup(fn)` registers cleanup in the current scope and errors if there is no active scope. A computed value created outside a scope can be stopped with `.dispose()`.
- Called directly in an effect body, `onCleanup(fn)` is **per run**: `fn` runs before the effect's next run and when the effect stops (or its scope is disposed). This works in unowned effects too. Cleanup registered inside a nested `scope.run()` keeps that scope's lifetime. Like scope cleanups, the returned function runs the cleanup early, at most once.

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

Effects run synchronously by default. Explicit batches are synchronous too; there is no hidden next-tick scheduler. Event handlers are already batched; wrap several writes made elsewhere (timers, fetch callbacks, scripts) in `batch()` so lists and bindings update once instead of after every write.

Array methods that mutate (`push`, `splice`, `sort`, …) run on the underlying array and then notify only the indexes that changed, plus `length` when it changes. Values they return (`pop()`, `shift()`, `splice()` results) and the values passed to a `sort` comparator are the same reactive values that reads return.

Bindings skip DOM writes when the value has not changed: `b-text`, `${…}` interpolation, and `b-bind-*` with primitive values compare against the last written value, and `b-bind-class` adds or removes only class names that changed, leaving classes added by other code in place. Object values (for example a style object) are always reapplied, since they may have been mutated in place.

Pending effects run in creation order. An owner (a router outlet, a `b-if` branch, a component, any effect that mounts children in a child scope) is always created before the effects it creates, so when one write affects both, the owner re-renders and disposes its stale children before they could run against the new values.

An effect never re-triggers itself by writing a value it read in the same run. When something else writes a value the effect already read *while that effect is still running* (a nested effect, or `untrack`ed code such as an auth guard calling `router.navigate()` during route setup), the effect runs again as soon as the current run ends, so the write is never lost. An effect that keeps re-triggering itself this way throws `A Brio effect keeps re-triggering itself.` after 100 consecutive runs.

A write invalidates every dependent computed before any effect re-runs, so effects never observe half-updated derived state, and a computed read later in the same batch or handler already reflects the write. A computed that reads itself, directly or through other computeds, throws `Circular Brio computed dependency.`; it recovers once the cycle is broken.

### Async resources

`resource(fetcher)` is exported from `briojs` and `briojs/reactivity`, and is
available as `brio.resource` in the browser bundles. It starts immediately and tracks
reactive dependencies read synchronously by the fetcher (before its first await).
It does not block mounting or provide server rendering.

```js
import { createScope, resource, signal } from 'briojs/reactivity';

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

- The fetcher receives a fresh `AbortSignal` on every execution. Existing
  zero-argument fetchers still work.
- Starting a new execution aborts the previous one. Only the latest execution
  may publish data, error, or completion, even if a fetcher ignores cancellation.
  An obsolete `refetch()` promise still waits for its own fetcher to settle;
  aborting does not forcibly terminate arbitrary asynchronous work.
- Refreshing retains existing data, clears the previous error, and sets loading
  true. A latest successful execution replaces data (including with undefined).
  A latest failure retains data, records the original error, and clears loading.
  Related status changes are batched for coherent reactive notifications.
- Fetcher failures, including synchronous throws, are recorded in `error.value`;
  `refetch()` resolves after recording them, rather than rethrowing them.
  Render errors visibly. Aborted superseded/disposed executions do not publish
  errors; other fetcher errors are not silently discarded.
- A resource belongs to the scope active at construction. Component setup,
  scoped plugins, or an explicit `scope.run()` can own it; the app's state factory
  alone does not provide an owner scope.
- Standalone resources work without an active scope, but must be explicitly
  disposed with `results.dispose()`. Disposal is idempotent, stops dependency
  tracking, aborts pending work, sets loading false, and preserves settled
  data/error. No late completion publishes after disposal. Subsequent
  `refetch()` calls reject with a disposed-resource error.

The utility does not cache, deduplicate, retry, or impose timeouts. Actual
cancellation requires the fetcher to pass its signal to a cancellable operation.
Signals expose mutable values; application code should treat resource outputs
as read-only and perform refreshes through `refetch()`.

## Step navigation

The optional `briojs/step` entry (browser: `brio.step.min.js`) provides
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

Back follows the **actual path**, not a configured reverse link. For example,
Intro → Review → Back returns directly to Intro. After Back, further navigation
records a new path; there is no Forward stack. History is private and unlimited
until reset or the engine is released.

Cycles are allowed. Navigating to the current step is a successful no-op, with
no history entry or reactive notification. A self-linked step still has
`canGoNext === true`. Returning to the initial step through `go()` or a configured
link **preserves history**; only `reset()` clears it.

Configuration is validated and copied once. Require a nonempty plain-object
steps record and an explicit registered initial name. Each definition accepts
only an optional nonempty `next` string naming a registered step; `{}` is terminal.
Forward references, cycles, and exact literal names are supported. Unknown
fields, accessors, malformed values, and dangling links throw. Step definitions
cannot contain `active`, `keep`, `back`, `origin`, or business metadata; keep
labels/form data separately. Later changes to the input objects do not change
the engine. npm exports `StepOptions`, `StepDefinition`, `StepRecord`, and
`StepEngine`.

The facade and its methods are read-only. Navigation publishes a coherent final
state even when called directly from JavaScript. Constructing an engine creates
no effect or app-owned resource; disposing a consumer does not reset an engine
shared with another app.

Reset affects navigation only, not form/application data. This utility has no
dynamic registration, multiple-active mode, completion tracking, asynchronous
guards, or hooks. Validate/await application work before navigating; manage
loading, errors, and competing requests in that application workflow.

## HTTP

Load `brio.http.min.js` after the core for `brio.http` and `brio.HttpError`,
or import `http` and `HttpError` from `briojs/http` (also exported by `briojs`).
HTTP is not an automatic `$http` expression helper:
expose application methods through `$data` or component setup.

```js
import { http, HttpError } from 'briojs';

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

All five methods use `(url, bodyOrQuery?, options?)`. There is no HEAD helper.
GET and DELETE accept query parameters; POST, PUT, and PATCH accept bodies.
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

Plain objects, arrays, numbers, booleans, and null are JSON-serialized for
POST/PUT/PATCH. Nested values follow native `JSON.stringify` semantics, including
its omissions and errors; this is not a schema validator. Unsupported top-level
values and serialization yielding undefined reject. An omitted body stays absent.
Brio adds `Content-Type: application/json` only when no content-type was supplied.
Caller headers are copied, never mutated.

Strings and native Fetch bodies (`FormData`, `URLSearchParams`, `Blob`/`File`,
`ArrayBuffer`, typed arrays/DataView, and `ReadableStream`) pass through unchanged.
Buffer-view offsets/lengths are preserved. Brio does not set their content-type:
Fetch derives it when appropriate. Do not set a multipart content-type manually;
the browser must generate its boundary. Build form bodies explicitly; a supplied
content-type does not change how a plain object is serialized.

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

An explicit `parser: 'json' | 'text' | 'blob' | 'arrayBuffer' | 'formData'`
always calls the corresponding native Response method, even for 204/205.
Consequently explicit JSON parsing rejects an empty body. Other native parser
failures propagate unchanged.

Non-OK responses reject with `HttpError` **before parsing**, exposing read-only
`response` and numeric `status`. The body remains unread so the caller chooses
how to consume it. Network/abort, serialization, and parsing failures retain
their original error types; they are not wrapped as HTTP status errors.

TypeScript defaults to unknown response data. `http.get<Item>(url)` returns
`Promise<Item | undefined>`; explicit `{ parser: 'json' }` returns `Promise<Item>`.
These generic arguments describe an expected shape, not runtime validation.
Explicit non-JSON parsers infer their native result types. npm also exports
`HttpMethod`, `HttpParser`, `HttpOptions`, `HttpBody`, `HttpQuery`, and
`HttpQueryValue`.

## Persistence

Import persistence where needed. Inside component setup, an app plugin, or an explicit reactive scope, disposal removes the value's save effect and cross-tab listener. Outside any scope (for example a module-level `const token = persist('token', '')` shared by several components), the value lives for the life of the page:

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

Objects and arrays are reactive directly. Primitive values are returned as signals and use `.value`. The default adapter is `localStorage`; select `sessionStorage` or pass a `getItem`/`setItem` adapter with `{ storage }`. JSON serialization errors and storage errors are surfaced. Cross-tab updates are applied to the existing reactive value (array roots are replaced in place) and saving continues afterwards. A remote value whose shape differs from the local one (array vs. object, or a non-object for an object root) is ignored.

## Trusted HTML and expression security

Directive expressions are ordinary strict-mode JavaScript compiled and cached at runtime with `new Function`, without `with`. They are authored application code, **not a sandbox**; the approach is incompatible with a strict CSP that disallows `unsafe-eval`. Never render untrusted content as a Brio template or directive expression.

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

To activate a dynamic Brio template, explicitly use `b-html.hydrate` with a
`trustedHTML()` value. Ordinary strings, null, and undefined are rejected in this
mode. Use `trustedHTML('')` to clear an active template. Each replacement
disposes previous effects, listeners, refs, and owned resources before hydrating
the new content. A value without the trust marker is rejected before replacing
existing content. Authored `b-template` and managed insertion are unchanged.

```js
import { trustedHTML } from 'briojs';

createApp({ state: () => ({ content: '<em>Trusted</em>' }) }).mount('#content');
```

```html
<div id="content" b-html.hydrate="trustedHTML($data.content)"></div>
```

Only call `trustedHTML()` with templates you trust as application code. It is a
trust assertion, not sanitization or a security boundary. Sanitizing ordinary
HTML does not necessarily make it safe to execute as a Brio template.

## Errors

Brio errors say where they happened. Expression failures name the expression,
the directive, the element (tag, id, and up to two classes), the nearest
enclosing custom element, and the original error:

```text
Brio expression failed: "$data.user.name" in b-text on <span.name> inside <user-card>: TypeError: Cannot read properties of undefined (reading 'name')
```

- `error.cause` is the original error, `error.directive` the attribute name,
  and `error.element` the element, which you can inspect in devtools.
- Brio's own structural errors gain the element being hydrated or updated,
  e.g. `b-ref requires a nonempty literal name. (at <p.note>)`.
- Effects that fail when state changes are reported together from the write:
  `One or more reactive effects failed.` lists every failure on its own line
  and keeps them in `error.errors`.
- Errors thrown by your own code (component `setup`, store methods, computed
  getters) are not rewritten; Brio wraps them only when they surface through a
  template expression, keeping the original as `cause`.

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

The app method is `insert` (without `$`); the matching `$insert` helper is available in directive expressions and `$context.$insert`
in scripts. Its selectors are restricted to the originating mount root.
App-level selectors must resolve within exactly one of that app's mounted roots;
missing, ambiguous, cross-app, and disposed targets throw. Direct node references
also work for child placements on managed detached `b-if.detach` elements and teleported
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
replace the enclosing container's children instead. `before`/`after` placements
next to a `b-for` row throw, because the loop owns the space between its rows;
insert into the row itself or outside the loop instead. Replacement is destructive: old content
is disposed first; a hydration failure removes the failed insertion and throws,
but does not restore the old content.

Use authored or sanitized markup only. Automatic `trustedHTML` is an ergonomic
trust assertion, not sanitization; inserted expressions and scripts execute code.

### Low-level dynamic hydration

ESM imports expose the low-level APIs `hydrateRoot(element, context, runtime)` and `hydrateNode(node, context, runtime)`: supply an explicit context (including `$data`), a runtime with `app`, `state`, and `components`, and invoke hydration inside `createScope().run(...)`. Dispose that scope before removing or replacing the hydrated content; raw DOM removal does not dispose bindings or listeners. Hydrate only new content, not an already hydrated subtree. Prefer `app.mount()` for independent roots, since it manages runtime and cleanup automatically.

```ts
createApp({
  state?: () => Record<string, unknown>,
  stores?: Record<string, unknown>,
  components?: Record<string, ComponentDefinition>,
  router?: Router,
  plugins?: BrioPlugin[],
})
```

- `app.component(name, definition)` registers a reusable component; names must be valid hyphenated custom-element names.
- `app.plugin(plugin)` installs a plugin once per app.
- `app.mount(elementOrSelector)` mounts one independently disposable root and returns `{ root, unmounted, unmount() }`.
- `app.unmount(options?)` unmounts all roots; the app remains mountable.
- `app.dispose(options?)` permanently disposes the app and its scopes.
- `app.state` is shared by roots mounted from that app.
- `app.stores` is a fixed read-only mapping of explicitly supplied stores; no automatic reactivity or persistence.

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

Root-owned cleanup always runs, including listeners, effects, observers, refs,
and resources. App plugins and their resources live until app disposal, not
individual root unmounting. `{ restore: false }` skips original-attribute/child restoration;
it does not freeze the DOM: directive cleanup may remove owned output.
The resulting DOM is not a reusable template. Mount fresh server markup for
the next page. Teardown is idempotent; all roots are released even when cleanup
reports errors. Failed mounting still restores its original markup.

Before a client-side swap, dispose apps belonging to outgoing roots. After the
swap, mount fresh roots. For a persistent island, preserve the actual root
element and its existing mount; do not dispose or mount it again. DOM IDs do not
transfer state. Keep persistent and page-local apps separate when they need
independent app/plugin lifetimes.

For ordinary document navigation, no pagehide handler is required. Do not
unconditionally dispose on `pagehide`: `event.persisted === true` means the
browser may resume this same document from its back/forward cache. Keep its
mounts alive and do not remount on `pageshow`. If registering pagehide cleanup
for non-cached navigation, guard `!event.persisted` and do not use `{ once: true }`
(a cached departure would consume the listener).

### Astro islands

`briojs/astro` is an optional **client integration**, exported from the same
package. It requires no Astro server plugin, component wrapper, separate package,
or addition to the Brio browser core. Install it once from a shared layout's
processed client script:

```astro
<script>
  import { enhanceAstro, lazyApp } from 'briojs/astro';
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

Declare roots by registered name; sibling instances may use the same name:

```html
<section b-app="counter" b-props="{ initial: 5 }">
  <button b-on-click="$data.count++" b-text="$data.count">5</button>
</section>
```

Each factory receives `(root, props)` and returns a **fresh, unmounted** Brio app.
Factories may ignore either argument. Each island owns its entire app, including
plugins; do not return an app shared with another island or an existing mount.
Factories are synchronous; `lazyApp` explicitly marks asynchronous module loading.

```ts
// apps/counter.ts
import { createApp } from 'briojs';
import type { AstroAppFactory } from 'briojs/astro';

const createCounter: AstroAppFactory = (_root, props) => {
  const initial = props.initial ?? 0;
  if (typeof initial !== 'number' || !Number.isFinite(initial)) {
    throw new TypeError('Counter initial must be a finite number.');
  }
  return createApp({ state: () => ({ count: initial }) });
};

export default createCounter;
```

Registry entries are loaded code, not app instances. Eager entries are ordinary
factory functions. `lazyApp(() => import(...))` loads a module only when a
matching island is discovered; the module must default-export its factory.
One loader promise is shared per lazy entry during an installation, while every
root gets its own app. This is **code loading**, not visibility/idle/interaction
scheduling. Authored server HTML remains until mounting; provide useful static
content if desired. A module failure is cached without automatic retries.

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

With Astro ClientRouter, the adapter releases outgoing apps before swaps and
discovers incoming roots on `astro:page-load`. Repeated events never remount
existing roots. Roots at or inside a matching `transition:persist` boundary keep
their actual app, DOM identity, and original props. Incoming props do not reset
them. If the boundary disappears, their apps are disposed. Use unique Astro
persistence names and leave Astro in charge of moving the preserved DOM.

Pending lazy initialization survives when its actual root is preserved.
Otherwise it is abandoned before the factory is called. Dynamic imports cannot
be cancelled, but obsolete completions never mount outgoing islands. Live load,
props, factory, mounting, and swap-cleanup errors go to the required
`onError(error, root)` callback; other islands continue. Failed roots do not retry
on repeated page-load events. Exceptions thrown by `onError` are surfaced as
uncaught errors. Invalid configuration and duplicate active installation throw
synchronously.

`integration.dispose()` is idempotent: it unregisters host listeners, abandons
pending initialization, and disposes every app, restoring its authored snapshot.
Cleanup failures are thrown after releasing the other apps and installation
lock. Reinstallation is allowed after disposal. Outgoing page swaps instead use
`restore: false`. There is no document MutationObserver or public scan/retry API:
DOM changes outside Astro navigation remain the host's responsibility.

The adapter leaves back/forward-cached documents live. It is tested against
Astro 5.18.2 and its generated `data-astro-transition-persist` marker; reverify
when upgrading Astro or customizing its swap algorithm. The runnable
[fixture registry](./tests/fixtures/astro/src/lifecycle.js) exercises eager/lazy
apps and persistent ancestors. Pulse events in the fixture are test diagnostics
for leaked listeners, not part of the adapter API.

Run `npm run dev:astro` to explore the fixture. Run `npx playwright install chromium`
once, then `npm run test:astro` for production-build browser tests of repeated
navigation, actual DOM/state persistence, resource cancellation, cleanup counts,
and browser back/forward restoration.

## Package and migration

Version 4 is not API-compatible with version 3. Replace `newApp()` with `createApp()`, `$state` with app state or the `state()` import, `$effect` with `effect()`, and the previous directives with the table above. Router, persistence, and devtools are first-party package subpaths. Review all templates: state access requires `$data` or `$data.$parent`, loop values require `$for` (outer loop values use `$for.$parent`), arguments use hyphens and modifiers use dots, expressions are explicitly trusted strict-mode JavaScript, and `b-html.hydrate` requires `trustedHTML()` (`$insert` trusts authored markup automatically). Default `b-html` is inert and `b-text` is literal. Migrate `$parent.$parent.$data` to `$data.$parent.$parent`.

The package exports:

- `briojs`: app, components, DOM enhancement, trusted HTML, and core types.
- `briojs/reactivity`: state, signals, effects, computed values, batching, and scopes.
- `briojs/persistence`: scope-owned local/session/custom storage.
- `briojs/router`: optional history router.
- `briojs/devtools`: development-only instrumentation and inspector panel.
- `briojs/astro`: optional named-island lifecycle integration and lazy code loading.
