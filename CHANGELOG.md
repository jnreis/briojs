# Changelog

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
