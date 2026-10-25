# Changelog

## [5.0.0] — 2026-10-24

Brio 5 adds a public plugin API, and uses it to move directives that most pages
never need out of the core bundle. Upgrading from 4.x takes a script tag or a
plugin per app; see
[Migrating from Brio 4](https://briojs.com/reference/package-entry-points/#migrating-from-brio-4).

### Breaking changes

- `b-mask`, `moneyMask`, `validate`, and `b-form` now live in the **inputs
  add-on**: `brio.inputs.min.js`, or `inputsPlugin` from `@jnreis/briojs/inputs`.
  It replaces `brio.forms.min.js`, `brio.money-mask.min.js`,
  `@jnreis/briojs/forms`, and `@jnreis/briojs/money-mask`.
- `b-on-enter`, `b-on-exit`, `b-on-resize`, `b-on-addednodes`,
  `b-on-removednodes`, `b-on-attrs`, and `b-on-text` now live in the
  **observers add-on**: `brio.observers.min.js`, or `observersPlugin` from
  `@jnreis/briojs/observers`.
- `b-options` is replaced by a `.options` attribute per directive:
  `b-on-enter.options="{ rootMargin: '200px' }"` instead of
  `b-options="{ 'b-on-enter': { rootMargin: '200px' } }"`. Option values now win
  over modifiers. Using `b-options` with an observer throws an error that shows
  the new form.
- Every directive needs the `b-` prefix. The short forms `on-*`, `bind-*`,
  `text`, `html`, `model`, `mask`, `teleport`, `transition`, and `effect` are
  gone: one spelling per directive, and no clashes with other libraries'
  attributes when Brio runs inside someone else's page.
- `b-router-outlet` comes with the router: `createApp({ router })` installs it
  as before, so router apps need no changes.
- `app.plugin()` is renamed `app.use()`.
- Using a moved directive without its add-on throws an error that names the
  script and the plugin to load, in production and development builds.

### Directive options

- Any directive that takes options accepts a `<directive>.options` attribute
  with a literal object or a reference such as `$data.exitOptions`. Keys are
  checked, and the value is read once at hydration.
- `b-on-*` takes every event modifier as an option, and `debounce` and
  `throttle` accept a delay in milliseconds:
  `b-on-input.options="{ debounce: 400 }"`.

### Scaffolder (separate package, pending publication)

- Prepared `create-brio`: generates widget, multi-page, SPA, Astro, and plugin
  projects in JavaScript or TypeScript, with package-manager selection,
  non-interactive flags, and editor settings. It never overwrites a nonempty
  destination or automatically installs dependencies or initializes git.
- The packed CLI and all ten generated variants are tested. The command
  `npm create brio@latest` becomes available only after separate publication.

### Add-ons

- Add-on scripts with directives attach them to every app created after they
  load, through the new browser global `brio.use(plugin)`. Third-party plugin
  scripts can do the same.
- With npm, install add-on directives per app with `plugins: [inputsPlugin]`
  or `app.use(inputsPlugin)`. Installing the same plugin object twice does nothing.
- The names of add-on directives are reserved for their official plugins.
- Errors thrown inside add-on directives keep their own message and location
  instead of being wrapped as plugin failures.

### Plugin API

- `app.directive(definition)` registers your own `b-` directives with `scope`,
  `mount`, and `ready` hooks. Phases replace priorities: `scope` adds `$names`
  for the element and its subtree, `mount` runs with the element's other
  directives, and `ready` runs after its children hydrate.
- Directive bindings provide `value()`, `evaluate()`, `run()`, `assign()`,
  `effect()`, `on()`, `onCleanup()`, and `hydrate(node)`, which are released
  with the element.
- Directive definitions list their accepted `.options` keys in `options` and
  read the checked values from `binding.options`. `options` is reserved as a
  modifier name.
- `app.helper(name, value)` adds `$`-prefixed helpers to every expression.
- `app.use()` accepts plugin objects with `name`, `directives`, `helpers`,
  `components`, `setup`, and `onMount`. Installation is all or nothing, and
  name conflicts are errors that name both owners. Plugin functions still work.
- `defineDirective` and `definePlugin` add editor types; both are also on
  `window.brio`.
- Plugins cannot override built-in directives or reserved prefixes, and their
  directives are rejected on component hosts and `<template>` fragments.
- Development bundles warn once about each unknown `b-` attribute.

### Forms

- `<form b-form="{ rules, submit }">` (inputs add-on) exposes `$form`:
  typed `values`, `errors`, `error(name)`, `touched`, `valid`, `submitting`,
  `submitted`, `submitError`, `reset()`, and `submit()`, plus `aria-invalid` and
  focus on the first invalid control.

### Tooling

- `@jnreis/briojs/testing` exports `renderBrio()` for testing apps and plugins
  in Node with jsdom or happy-dom.
- A plugin starter template with a `b-copy` directive, a `$copy` helper,
  tests, a demo page, and editor autocomplete.
- The directive manifest and VS Code custom data include `b-form` and name the
  add-on each moved directive needs.

### Size

- `brio.min.js` is 20.3 KB brotli, against 20.0 KB in 4.1.0, while adding the
  plugin API and directive `.options` (it would be 22.4 KB with the add-on
  directives still in core).
- `brio.inputs.min.js` is 2.9 KB (masks, money, validation, `b-form`) and
  `brio.observers.min.js` 1.8 KB. `brio.router.min.js` grows from 2.5 to 2.8 KB
  because it now carries `b-router-outlet`.

## [4.1.0] — 2026-10-24

### Tooling and ecosystem

- `dist/html-custom-data.json`: VS Code autocomplete and hover docs for every
  `b-` directive and common modifiers through the `html.customData` setting.
- `dist/directives.json`: a machine-readable directive manifest for tools.
- Starter templates for a widget, multi-page site, SPA, and Astro islands,
  with "Open in StackBlitz" links on the website.
- `llms.txt` and `llms-full.txt` on briojs.com for AI assistants.

## [4.0.0] — 2026-10-22

The first npm release of Brio.js, an HTML-first framework for reactive
widgets, multi-page sites, and single-page applications.

Development began with [Initial v4](https://github.com/jnreis/briojs/commit/86f1cc3eb023470b11ed6343436fd97483dd3092)
on October 12, 2026. This entry consolidates the entire v4 development cycle:
intermediate APIs and bug fixes were never published as separate releases.

### Core and reactivity

- Explicit `createApp()` lifecycle: isolated mounts, unmounting, disposal, and
  restoration options for host-managed page swaps.
- Standalone, DOM-independent `state`, `signal`, `computed`, `effect`, `batch`,
  `flush`, and `untrack`, with TypeScript declarations.
- Proxy-based plain-object and array reactivity, including cycles and shared
  references. Computed invalidation is synchronous and effects observe coherent
  derived state; circular dependencies and runaway effects report errors.
- Owned scopes with `createScope()` and `onCleanup()`. Effect-body cleanup runs
  before each rerun and on disposal. Listeners, observers, and resources share
  their owner's lifetime.
- Async `resource()` with per-execution cancellation, latest-result publication,
  explicit refetch/disposal, and reactive data/loading/error state.
- Named shared stores and live subtree-provided values, without implicit
  global app state.

### HTML and components

- Explicit expression contexts: `$data`, `$for`, `$props`, `$emit`, `$ref`,
  `$provided`, `$id`, and `$context`; independent data and loop ancestry.
- Reactive text, attributes, properties, classes, styles, form models, and
  input masks. Text is literal; dynamic template hydration is an explicit
  `b-html.hydrate` opt-in requiring `trustedHTML()`.
- Keyed lists preserve element/state identity, focus, and selection on reorder.
  Reconciliation moves only rows outside the longest stable run.
- `b-if`/`b-else-if`/`b-else` chains with destructive, `.hide`, and `.detach`
  lifecycles; component templates can branch across their root elements.
- Wrapperless `b-template` output and implicit instantiation of native
  `<template>` elements carrying Brio directives.
- Reusable components with cached HTML templates, setup, reactive typed props,
  custom events, slots, and scoped cleanup.
- Local DOM refs, generated IDs, reactive teleports, contextual scripts,
  observer options, and managed dynamic insertion.
- Enter/leave transitions and FLIP move transitions for keyed lists, including
  component hosts. Class bindings preserve transition and externally added classes.
- Nested class arrays/objects, SVG attribute casing, ARIA boolean serialization,
  and form-value updates after dynamic options render.
- Focused text fields keep their cursor/selection on the same characters when
  reactive state changes their value.
- `b-cloak` hides raw templates until mount with a small authored CSS rule.
- Located errors identify the expression, directive, element, enclosing
  component, and original cause. Invalid directives/modifiers fail explicitly.

### Optional tools and distribution

- Routing with history/hash modes, deployment bases, URL generation, reactive
  route state, guards, redirects, fallback routes, and query-only updates that
  keep the current page mounted.
- JSON persistence using local/session/custom storage, cross-tab updates, and
  scope cleanup where owned; unowned values live for the page.
- Fetch-based HTTP helpers with typed options/parsers, recursive query
  parameters, native request bodies, and public `HttpError`.
- Form validation, step navigation, and an optional `moneyMask()` formatter.
- Opt-in devtools with app/state/effect inspection and a live panel.
- Astro named-island integration with eager/lazy factories, persistent roots,
  navigation cleanup, cancellation, and disposable installation.
- Tree-shakable ESM entry points and TypeScript declarations. Standalone
  production/development browser bundles and six optional plugin scripts share
  one core runtime. No runtime dependencies.
- A portable AI application-development kit with guides, recipes, and an
  optional skill, plus a separate migration kit for private 1.1.5 applications.

### Performance and verification

- Cached templates/expressions, parsed attribute snapshots, fewer per-node
  allocations, selective array notifications, and skipped unchanged DOM writes.
- Single-element list rows need no range comments; bulk clear/replacement uses
  a single DOM removal where ownership permits.
- Runtime, directive-interaction, lifecycle, browser, type, package, and
  real-world application tests.
- Example apps covering counters, constraints, CRUD, large tables, async data,
  routing/authentication, optimistic synchronization, and collaborative editing.
- A keyed-table benchmark with Brio, Vue, petite-vue, Alpine, React, Preact,
  and Svelte, plus raw/gzip/Brotli and tree-shaking regression checks.

## Before 4.0 — private development

Earlier version numbers in this repository describe development milestones,
not npm releases. They are not a sequence of public package upgrades.

- **3.0:** JavaScript-style text interpolation and further reactivity/step
  navigation experiments.
- **2.x:** explicit context names, IDs, loop/template behavior, and navigation
  experiments within the original runtime.
- **1.x and 0.x:** the original directive-based framework and reactive state
  implementation, including the private 1.1.5 runtime used by an existing app.

The [git history](https://github.com/jnreis/briojs/commits/main/) preserves the
implementation chronology. The
[historical v3 reference](https://github.com/jnreis/briojs/blob/main/DOCUMENTATION-v3.md)
is retained for archaeology, not current usage. For a private 1.1.5 application,
see the [migration kit](./ai/brio-migrate-1-1-5/SKILL.md).
