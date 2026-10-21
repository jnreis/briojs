# Changelog

Notable changes to Brio.js, reconstructed from the source diffs and package
metadata on `main`, through commit `d868d43`.

## How to read this history

- Dates are **commit dates**, not verified npm publication dates. This repository
  has no release tags.
- Version headings use versions actually recorded in `package.json`. Related
  snapshots are grouped when a version bump did not introduce a separate feature.
  Same-version follow-up work is included in the stated date range.
- The June-August 2024 commits labeled `0.15.0` and `0.17.0` through `0.21.0`
  kept the package at `0.14.0`; they are documented as development under that
  version. The commit labeled `0.10.0` likewise did not change the package version.
- Historical API names describe the code at that time, not the current API.
  See [DOCUMENTATION.md](./DOCUMENTATION.md) for current usage.
- Generated bundles, version-only edits, and cosmetic refactors are not listed
  individually. Each historical section links to its source changes.
- `Unreleased` records pending work in this checkout; dated sections describe
  committed `main` history.

## Unreleased

### Performance
- Rendering lists is roughly 2× faster and uses about 60% less memory per row. Measured with the new `npm run bench` harness (median ms in headless Chromium, keyed 1,000-row table):

  | Operation | Before | After |
  |---|---|---|
  | create 1k rows | 35.3 | 19.1 |
  | replace 1k rows | 53.5 | 26.8 |
  | swap rows | 3.1 | 1.3 |
  | remove row | 3.6 | 1.7 |
  | create 10k rows | 467 | 226 |
  | append 1k rows | 43.2 | 22.8 |
  | clear 1k rows | 8.0 | 2.6 |
  | heap per row | 14.2 KB | 5.3 KB |
  | DOM nodes per row | 3 | 1 |

- `npm run bench:compare` measures Brio against Vue, petite-vue, Alpine, React, Preact and Svelte on the same keyed-table operations.
- `b-for` evaluates keys through one reusable probe, builds row state only for new rows, writes `$for` values only when they change, and clears or fully replaces lists in one pass (a single DOM write when the loop is its parent's only content).
- Single-element `b-for` rows no longer get `<!--brio:range-->` comment anchors. Template and teleported rows keep them.
- Contexts inherit from their parent through the prototype chain instead of copying every key; `Object.keys($context)` now lists only the element's own keys. Compiled expressions destructure only the context names they use.
- Scopes, node ownership and effects allocate less: lazy cleanup sets, no per-node disposal callbacks, no per-effect property definitions, and static text/comment nodes are skipped during hydration. Loop rows create their `$ref` registry only when used.
- Array mutators run on the raw array and notify only the changed indexes and `length`. Values they return, and values passed to `sort` comparators, are reactive.
- `b-text`, `${…}` interpolation and primitive `b-bind-*` values skip DOM writes when unchanged; interpolation templates and attribute modifiers are parsed once.
- `$insert` with `before`/`after` beside a `b-for` row now throws; insert inside the row or outside the loop.

### Changed
- `onCleanup(fn)` called directly in an effect body now runs before the effect's next run and when it stops, instead of only when the owning scope is disposed. It also works in effects created outside a scope, which never adopt the scope that happened to trigger them. Cleanup registered inside a nested `scope.run()` keeps that scope's lifetime.
- A `<template>` with `b-if`, `b-else-if`, `b-else`, or `b-for` but no `b-template` now throws a located error instead of silently rendering inert template copies.
- Component templates are parsed once per definition and cloned for each instance, in the host's own document. Bound props are evaluated once at mount instead of twice.
- Bare-name `ReferenceError`s in expressions now suggest the right path: `$for.item` (or `$for.$parent.group`) for loop variables, and `$data.count` or `$props.label` for state keys and props.
- Hydration is cheaper per element: attributes are snapshotted and parsed once, `b-for` no longer allocates an `[index, item]` pair per row, and `arrayFrom` no longer goes through `Reflect.apply`. Creating 10,000 keyed rows is about 10% faster.

- Added real-world test apps under `tests/apps/` (occupancy counter,
  temperature converter, conditional registration form) with JSDOM user-flow
  suites, and linked them from the manual test index.

- Added `flush()` (root context, `brio.flush`, and `briojs/reactivity`) to apply
  pending effects inside a batched event handler, e.g. to focus an element
  rendered by a new `b-if` branch. Documented that `b-on-*` handlers are batched.

- Added an automated directive interaction matrix with 465 pairwise co-mount
  cases across every documented directive form and component hosts. Cases assert
  observable behavior, shared reactivity, and lifecycle cleanup with pair-named
  expected/actual diagnostics. Added a higher-order keyed-loop regression and
  linked matrix coverage to the directive reference documentation.

- Added a raw/gzip/Brotli size reporter, checked-in regression baseline, and
  main/subpath tree-shaking tests covering browser scripts, reachable static
  ESM graphs, and minified npm consumers. Shared native/DOM/error helpers applied
  across the runtime, plus shared Object/Reflect aliases, typed typeof predicates,
  a length helper, and a typed `isInstanceOf` wrapper used by all runtime checks,
  `removeElement` calls for DOM elements/comments, `deleteItem` wrappers at
  collection deletion sites, and `includesItem` wrappers at collection
  membership checks, and a `startsWith` helper for runtime string-prefix tests,
  reduce production core by 4,325 raw bytes overall (8.9%). Compared with the
  original baseline, gzip is 18 bytes smaller and Brotli is 24 bytes smaller.
  Prioritizes core and typical bundled apps, with documented small-tool and
  unbundled-ESM tradeoffs. Public APIs, diagnostics, and browser targets remain
  unchanged; helper behavior and type inference have dedicated regression tests.

- Optional router supports normalized deployment bases and `href()` generation.
  App-relative navigation/route state is separated from browser URL matching,
  with segment-aware base boundaries, direct-load/history support, and preserved
  query strings/fragments. External navigation uses ordinary browser APIs.

- Optional `briojs/astro` shared named-island registry with `b-app`, read-once
  trusted-expression `b-props`, eager factories and `lazyApp` code loading.
  Supports persistent roots/ancestors, pending-load abandonment, required
  per-island error reporting and disposable/reinstallable ownership.
- Mount/app unmount and app disposal accept `{ restore: false }` for outgoing
  host-owned DOM while retaining full cleanup. Default snapshot restoration is
  unchanged. Added a runnable Astro ClientRouter fixture and production browser
  tests for swaps, persistent islands, cancellation, and back/forward caching.

- All browser plugins are opt-in builds: router, persistence, HTTP, forms,
  step, and money-mask. Matching npm subpaths supplement tree-shakable main
  exports. Pattern masks remain core and accept synchronous custom formatters.
- Mask tokens use Unicode code points: `*` any, `A` letters/decimal digits,
  `a` letters, `#` decimal digits. `9` is literal; backslash escapes tokens.
  Money formatting/caret handling is an optional `moneyMask(options)` factory,
  with no special modifier, injected helper, or registry.
- Async resources pass per-execution AbortSignals, abort superseded work, and
  publish only the latest result. Scoped or explicit disposal stops tracking,
  aborts pending work, and prevents late publication/refetch; refresh retains
  existing data and batches status changes.
- HTTP uses recursive bracket queries, complete native Fetch body support,
  preserved caller headers, typed Fetch options and parser results, JSON/+json
  media-type parsing, and explicit empty-response semantics. Public `HttpError`
  exposes status and an unread response in npm and both browser bundles.
- Step navigation uses fixed `{ initial, steps }` configuration, internally
  reactive read-only current/capabilities, one active step, and private history.
  `go`, `next`, history-based `back`, and `reset` publish atomic navigation state;
  definitions contain only optional next links.
- Wrapperless `b-template` output uses owned DOM ranges shared with structural
  directives and managed insertion. Plain conditionals, `.detach`, keyed loops,
  teleport, and template effects compose without losing multi-root/text output.
  Repeated `b-id` values are row-local; `.hide` remains concrete-only.
- Ordinary reactive `<style>` text and recommended native CSS `@scope` patterns,
  using existing `b-id`, class bindings, and CSS custom properties. Styles remain
  in authored DOM with native connectivity, cascade, and animation naming.
- Unified conditional branch creation, activation, deactivation, and cleanup.
  Plain `b-if` now dehydrates after leave completes, allowing interrupted
  transitions to reverse the same live element without duplicate nodes or state
  resets. Completed leaves still remove/dehydrate and subsequent mounts start fresh.
- Added `b-if.hide` (CSS display hiding) and
  `b-if.detach` (detachment without dehydration). The leading `b-if` sets the
  mode for the entire chain; preservation modes hydrate all branches once and
  keep inactive effects live. Conditions always evaluate in the parent context.
  Unmodified `b-if` retains destructive removal and fresh hydration.
- `b-text` displays literal values without secondary interpolation. `b-html`
  inserts inert markup by default; explicit `b-html.hydrate` requires a
  `trustedHTML()` value and owns activated template cleanup.
- Explicit `$context` binding for compiled expressions and contextual scripts.

### Fixed

- `b-bind-aria-*` now serializes `true`/`false` as `"true"`/`"false"` instead of
  an empty attribute and attribute removal.
- `b-model.number` radios and checkbox groups now compare against the parsed
  value, so numeric state checks the right control and clicks no longer uncheck
  or skip values.
- `b-model` on `<select>` now applies its value synchronously after `b-for`
  options hydrate, including when a `b-if` branch re-renders.
- Computed values read after a write in the same batch or event handler now
  return the fresh value; invalidation is synchronous instead of queued.
- A write now invalidates every dependent computed before any effect re-runs,
  removing glitches where an effect observed half-updated derived state and
  preventing mutually dependent computeds from looping forever.
- Circular `computed` reads throw `Circular Brio computed dependency.` instead
  of recursing; the computed recovers once the cycle is broken.
- `persist()` keeps saving after applying a cross-tab update, replaces remote
  array roots without leaving holes, and ignores remote values whose shape
  (array vs. object) differs from the local value.
- Keyed `b-for` reorders move only rows outside the longest stable run, so
  swapping two rows of 1,000 moves 2 rows instead of nearly all of them.
- `b-bind-viewBox`, `b-bind-preserveAspectRatio`, and other mixed-case SVG
  attributes now work; the HTML parser lowercases them and SVG ignores the
  lowercase names. `.prop` bindings resolve the property's casing
  (`b-bind-tabIndex.prop`).
- `b-bind` no longer assigns getter-only properties (SVG `r`/`cx`/`href`,
  `input.form`/`list`), which threw and was caught on every update; they are
  bound as attributes directly. Real setter failures now raise an error
  instead of silently becoming attributes.

### Added
- `untrack(fn)` reads reactive values without subscribing the current effect or computed. It is exported from `briojs`, `briojs/reactivity`, and the browser global.
- `brio.resource` and `brio.untrack` in the browser bundles.
- `b-attr-*` on component hosts binds the host element's own attributes, classes, and styles (with `b-bind-*` semantics) without becoming a prop.

- Reactive `b-teleport` Element/ref and selector expressions with explicit
  `[target, placement]` tuples, default `after`, and `before`/`prepend`/`append`.
  Missing targets restore source output; keyed destination groups and detached
  ranges retain identity, order, and source ownership through retargeting.
- Static `b-ref` and a local read-only `$ref` registry with reactive membership,
  raw DOM targets, component privacy, row-local identity, and lifecycle cleanup.
- Observer-specific keyed `b-options`: intersection roots/margins/thresholds,
  mutation targets/subtree/filter/old-value settings, resize document/box
  selection, and numeric debounce delays. Debounced mutations retain all records.
- Optional standalone plugin scripts share the browser core runtime rather than
  embedding separate reactive engines.
- Main npm entry exports for devtools, with explicit `enableDevtools()`
  activation and automatic activation retained by the devtools subpath.
- Fixed named app stores through `createApp({ stores })`, `app.stores`, and
  `$stores`, preserving supplied references without implicit reactivity.
- Live subtree values through `b-provide` and `$provided`, with nested overrides,
  read-only names, and component setup access.
- Portable 1.1.5-to-v4 migration skill, legacy API inventory, semantic migration
  guide, paired examples, and production verification checklist.
- Portable AI app-development kit: a reusable skill, framework guide, recipes,
  and installation instructions in [ai/](./ai/README.md).
- Runnable widget, multi-page enhancement, and SPA examples, with regression
  tests covering their behavior and inclusion in the npm package.
- `b-cloak`, removed as each element hydrates, for hiding raw templates until
  mount with a `[b-cloak] { display: none }` rule.
- Located errors: expression failures name the directive, element, enclosing
  component, and original error and expose `error.element`/`error.directive`;
  Brio's structural errors name the element; aggregated effect failures list
  each failure.
- Real-world test apps under `tests/apps/` (counter, temperature converter,
  conditional form, TodoMVC, 7GUIs, large table, data dashboard), each with a JSDOM suite
  that drives user flows end to end.

### Documentation

- Documented shared store ownership, explicit reactivity, provider inheritance,
  and their use when migrating legacy shared state.
- Clarified that persistence must have an owned cleanup scope; an app state
  factory alone does not provide one.
- Clarified that `trustedHTML` asserts trust without sanitizing and is required
  for explicit `b-html.hydrate`, not ordinary inert `b-html`.

## [4.0.0] - 2026-10-12 to 2026-10-13

A new runtime architecture, replacing the previous monolithic app and context
implementation. **This is a breaking redesign, not a drop-in v3 upgrade.**

### Added

- Explicit `createApp()` lifecycle with `mount()`, `unmount()`, and `dispose()`;
  isolated apps can enhance separate areas of an existing page.
- Owned scopes with `createScope()` and `onCleanup()`, tying reactive effects,
  DOM listeners, observers, and plugin resources to their lifetime.
- Standalone reactivity: proxy-based `state`, `signal`, `computed`, `effect`,
  `batch`, and asynchronous `resource`, with TypeScript declarations.
- Reusable components with setup functions, reactive `$props`, `$emit`, scoped
  styles, and projected content evaluated in its original parent context.
- `b-else-if` and `b-else` chains alongside `b-if`.
- Independent ancestry through `$data.$parent` and `$for.$parent`, including
  nested loops without an extra `b-data` boundary.
- Managed `app.insert(target, placement, content, options?)` and contextual
  `$insert`, supporting `before`, `after`, `prepend`, `append`, `replaceWith`,
  `replaceChildren`, and `textContent`.
  - HTML strings are marked as trusted internally; supplied nodes are cloned.
  - Inserted content inherits its destination context unless local `data` is
    supplied, and the returned handle owns its cleanup.
  - Replacing managed content dehydrates it without stopping unrelated siblings.
- Modular persistence, routing, forms, HTTP, step navigation, and development
  tools. Published ESM subpaths include `briojs/reactivity`,
  `briojs/persistence`, `briojs/router`, and `briojs/devtools`.
- Separate production and development browser bundles: `brio.min.js` and
  `brio.dev.min.js`. The development bundle adds inspection and a devtools panel;
  production builds compile out devtools tracking hooks.
- Automated runtime, directive, lifecycle, insertion, and browser API tests, plus
  an updated manual example suite.

### Changed / breaking

- Expressions use explicit context objects such as `$data` and `$for`, rather
  than automatic bare-property resolution. Compilation uses strict functions,
  without `with`.
- Standalone `$parent` is replaced by context-specific ancestry.
- Component helpers are named `$props` and `$emit`; `trustedHTML`, `onCleanup`,
  and `money` remain unprefixed.
- `b-if` destroys the inactive branch's scope and recreates it on activation.
  `b-show` detaches and restores the same live subtree, preserving its state.
- `b-script` compiles a function factory with an explicit `ctx`, including its
  event context, and supports cleanup without a `with`-based scope.
- Directive modifiers use the dot-separated syntax shown in the v4 examples.
- Browser globals expose the supported high-level API rather than internal
  hydration functions. `hydrateRoot` and `hydrateNode` remain available from ESM.
- Devtools are imported through `briojs/devtools`, not the core ESM entry.
- Removed the legacy `newStepEngine` compatibility wrapper; use
  `createStepEngine` and its named methods instead.

### Fixed

- Nested state contexts retain reactivity; ancestry metadata is read-only and
  does not leak into serialized state.
- Conditional branches dehydrate immediately when false, including while their
  leave animation remains visible. Conditions run before branch-local `b-data`.
- CSS transitions wait for the element's own active properties and handle
  cancellation. Interrupted transitions retarget from the current visual state
  rather than restarting from the opposite initial pose.
- Money masks receive their options. Pattern and money masks preserve caret and
  selection positions when editing or deleting around formatting characters.
- Teleported content is not hydrated twice, and teardown also cleans nodes
  restored to their original location.
- Mount ownership, structural placeholders, and dynamic insertion share cleanup
  tracking. Unsafe replacements of mount roots or directive-controlled content
  are rejected rather than leaving orphaned bindings.

## [3.0.0] - 2026-05-19 to 2026-05-29

### Changed / breaking

- Removed `{{ ... }}` text interpolation in favor of JavaScript-style `${ ... }`.
  Removed the separate template-expression reference rewriting machinery.
- Reworked step navigation around a reactive step registry and `setStep`,
  replacing the previous separate active-step list.
- Kept context-only hydrated nodes registered so their descendants could retain
  the intended context.

### Reactivity

- Deduplicated collected state-property dependencies.
- Changed array-effect subscription handling to avoid registering a listener
  separately for every accessed array item.
- Reworked listener registration and raw-target bookkeeping.

## [2.1.0] - 2026-01-07 to 2026-05-18

### Changed / breaking

- Simplified navigation to `go(pathOrHistoryOffset)`. Removed app route
  registries, route-matching rules, and their automatic popstate dispatch from
  the runtime.
- Refined local directive evaluation and context argument generation.
- Replaced the identifier-extraction helper with reference extraction that
  accounts for declarations, property access, destructuring, and template
  expressions.
- Added and refined step-navigation helpers before the subsequent 3.0 redesign.

### Fixed

- Assigning a new object or array of the same type synchronizes the existing
  reactive value, preserving its identity. A follow-up corrected the type check
  and the value reported to listeners.
- Updated loop-context property descriptors and validation rule processing.
- Validation messages distinguish string-length limits from numeric limits.

## [2.0.0] - 2025-11-06 to 2026-01-07

### Changed / breaking

- Renamed `b-uid` to `b-id`, exposing generated identifiers through `$id`.
- Renamed reference and slot contexts from `$refs` / `$slots` to `$ref` / `$slot`.
- Continued the `b-for` / `$for` transition begun during 1.2 development, with
  refinements to loop contexts and generated content.
- Revised script, style, teleport, and conditional directive handling to use the
  updated node/context API.

### Added

- Object-valued class and style bindings: class keys toggle individual classes,
  and style objects assign CSS properties.
- Template insertion options are forwarded to the insertion helper.
- Reintroduced computed-property initialization within reactive state.

### Fixed

- Improved evaluation of inline and registered data factories, including async
  factories and access to the parent data context.
- Refined template and loop hydration, context lookup, and validation schemas.

## [1.2.0] - 2025-10-24 to 2025-10-30

### Changed / breaking

- Flattened the `$dom` and `$tools` helper namespaces into the global context.
- Changed `$insert` to target-first arguments:
  `$insert(target, placement, content, options?)`.
- Replaced the older `outer`, `inner`, `first`, and `last` placement names with
  `replaceWith`, `replaceChildren`, `prepend`, and `append`. Literal insertion
  used the historical `text` placement.
- Restricted document-level insertion: the `html` element cannot be targeted,
  and `head` / `body` accept only child replacement, prepend, and append.
- Removed `b-boost`; routing and validation integration were reworked.
- Renamed `b-each` / `$each` to `b-for` / `$for` in the October 30 follow-ups,
  which still carried package version `1.2.0`.

### Fixed

- Improved async data/props context creation and expression evaluation.
- Updated HTML/template insertion and reference/slot refresh behavior.

## [1.1.6] - 2025-10-18 to 2025-10-21

- Consolidated reference and slot discovery into app context hydration; removed
  their separate directive implementations, not their markup functionality.
- Shared handling between `b-html` and `b-text`.
- Refined context inheritance, HTML replacement, and template cleanup.
- Restored tracked distribution artifacts.

## [1.1.5] - 2025-10-15

- Made hydration asynchronous and awaited directive hydration and inserted
  content in sequence.
- Reorganized node hydration, dehydration, and cleanup helpers around that
  asynchronous lifecycle.

## [1.1.1] - 2025-10-13

- Stopped automatic bare-name resolution through `$uid`, `$refs`, and `$slots`.
  Expressions accessing those contexts must specify the context explicitly.

## [1.1.0] - 2025-10-09 to 2025-10-10

- Simplified app/node hydration and context inheritance.
- Reworked template and unique-ID handling.
- Extended expression context resolution to include `$refs` and `$slots`; this
  automatic resolution was subsequently removed in 1.1.1.

## [1.0.1] - 2025-10-08 to 2025-10-09

- Replaced the previous animation-engine plugins and transition helper layer
  with a rewritten transition directive.
- Added schema-based validation and expanded DOM/style utilities.
- Refined expression context resolution, template insertion, and validation.
- This is the first `1.x` version recorded in the package manifest; there is no
  separate `1.0.0` version change in this history.

## [0.30.0] - 2025-09-10

- Reworked app, directive, and reactive-context internals.
- Introduced source analysis that rewrites undeclared expression identifiers to
  their matching data, loop, props, store, or tools context.
- Revised state proxy inheritance, listener tracking, and property initialization.
- Added slot directive support, reworked template handling, and added
  post-insertion callbacks.
- Expanded HTTP request handling and string/object utilities.

## [0.28.0] - 2025-05-06

- Added JSON serialization for object request bodies and automatic JSON content
  headers, while preserving query-string handling for GET requests.
- Improved bare function-path invocation and compilation of script strings
  containing function expressions.
- Enabled source maps in the build.

## [0.27.0] - 2025-02-19

- Added `setAllDirectives(app)` to install the complete directive set, the money
  mask, and default mask tokens.
- Expanded browser entry-point discovery and exported animation-engine adapters.
- Made model bindings resolve a reactive property accessor and reject expressions
  that do not identify a reactive value.

## [0.26.0] - 2025-02-10

- Separated the customizable app core from the complete directive set.
- Exported individual directives for selective registration.
- Removed automatic setup from the ESM entry; setup remained explicit or
  browser-entry-driven.
- Built full and core browser bundles, plus recursively discovered plugin
  browser entries.
- Separated money-mask and token registration from core initialization.

## [0.25.0] - 2025-01-13 to 2025-01-27

- Consolidated app assets into a `$store` registry: directives, templates,
  scripts, styles, props, data, masks, mask tokens, and route rules.
- Allowed `newApp` root and context arguments to be nodes or CSS selectors.
- Made script hydration explicitly opt-in with `b-script`, rather than
  automatically marking every script element.
- Simplified expression arguments and added local package-publishing tooling.

## [0.24.0] - 2025-01-13

- Replaced the global API/hydration arrangement with `newApp` and app-owned
  registries, node contexts, hydration, and dehydration.
- Added app-integrated routing and dynamic `$insert` HTML insertion.
- Added or reorganized `b-data`, template, script, style, resize, and navigation
  boost directives.
- Added the money mask and expanded customizable mask/token registration.
- Centralized browser setup and readiness signaling.

## [0.14.0 development] - 2024-06-28 to 2024-08-31

These changes did not advance the package version, despite higher version
numbers in their commit subjects.

- Made storage parsing more forgiving when a stored value is not valid JSON.
- Moved evaluation and hydration into shared tools and added development-mode
  handling for directive/text changes.
- Refined browser startup and the `brio:init` registration window.
- Added priority-ordered reactive listeners.
- Replaced before/after-style hooks with an asynchronous hook chain supporting
  pause, play, and removal.
- Experimented with a custom reactive inheritance chain, then removed it in
  favor of simpler context/prototype handling.
- Fixed inherited props/accessor handling, checkbox-group detection, and
  attribute binding for disabled controls.

## [0.13.0 / 0.14.0] - 2024-06-22

- Removed obsolete computed dependency-stack bookkeeping.
- Returned independent copies of collected dependencies, separating dependency
  collection from the single-property getter/setter selection used by bindings.

## [0.12.0] - 2024-06-21

- Added the `$http` request helper.
- Added state observation options for depth and ignored properties, and exposed
  state detection through the API.
- Adjusted props/loop hydration order and reactive dependency handling.

## [0.9.0 / 0.11.0] - 2024-06-11 to 2024-06-14

- Removed the experimental `$animate` helper and compression utility.
- Refined reference registration and expression evaluation.
- Made `b-html` resolve registered component names, evaluate their markup, and
  hydrate inserted children.
- Consolidated component rendering into HTML handling, removing the dedicated
  component/text dispatch and prefix directive.
- Updated component registration and storage helpers.
- The intervening commit labeled `0.10.0` did not change `package.json`; `0.11.0`
  recorded the resulting snapshot without a separate runtime feature.

## [0.8.0] - 2024-06-07

- Improved animation completion callbacks and transition-engine preparation.
- Expanded the experimental animation helper's CSS transform/filter handling.
- Added a compression utility, removed again in the next version.

## [0.7.0] - 2024-06-06

- Added named global stores through `addStore`.
- Automatically prefixed custom magic methods and store names with `$`, with
  reserved-name checks.

## [0.6.0] - 2024-06-06

- Added an experimental `$animate` helper backed by the Web Animations API.
- Updated `$in` / `$out` defaults and animation controller behavior.

## [0.5.0] - 2024-06-05

- Added registered HTML components through `addComponent` and `b-component`.
- Added store/data item registration helpers.
- Changed custom directive registration to accept a name and modifier support,
  rather than requiring each directive to implement its own attribute matching.

## [0.4.0] - 2024-06-04

- Centralized directive matching and attribute evaluation in the hydration
  wrapper, reducing repeated directive-level setup.
- Renamed lifecycle helpers to interceptor terminology, including
  `saveInterceptor`.

## [0.3.1] - 2024-05-29

- Exposed `attr`, `lifecycle`, and `saveLifecycle` to custom directive hydration
  functions, alongside existing hydration and cleanup tools.

## [0.3.0] - 2024-05-28

- Reworked evaluation, node hydration, directive lifecycle, and cleanup.
- Revised props, loops, model bindings, conditional rendering, events, and
  transitions around that lifecycle.
- Added a separate non-reactive data store and changed animation registration to
  `addTransitionEngine`, removing the previous `animate` / `afterAnimations` API.

## [0.2.0] - 2024-03-05 to 2024-05-01

- Added module and CDN builds.
- Added transition-engine registration and reactive local/session storage.
- Added viewport intersection, input mask, and ignore directives.
- Changed binding attribute syntax and refined loop/props contexts.
- Made hydration tools available to custom directives.
- Added package entry-point and TypeScript declaration metadata.

## [Initial development] - 2024-01-19 to 2024-03-02

- Began as the `frame` package at manifest version `0.0.0`, with proxy-based
  reactive state.
- Added DOM hydration, scoped state, computed values, watchers, and effects.
- Introduced binding, loops, conditional rendering, two-way model bindings,
  events, references, and HTML/text directives.
- Renamed the package to `briojs` and reworked the proxy/context implementation.
- Exposed an API for registering props, magic methods, and custom directives,
  alongside reactivity and DOM helpers.

[4.0.0]: https://github.com/jnreis/briojs/compare/c8f4ce5...d868d43
[3.0.0]: https://github.com/jnreis/briojs/compare/655d032...c8f4ce5
[2.1.0]: https://github.com/jnreis/briojs/compare/440a920...655d032
[2.0.0]: https://github.com/jnreis/briojs/compare/bca0d69...440a920
[1.2.0]: https://github.com/jnreis/briojs/compare/caabff9...bca0d69
[1.1.6]: https://github.com/jnreis/briojs/compare/df5fbdc...caabff9
[1.1.5]: https://github.com/jnreis/briojs/compare/d968d8a...df5fbdc
[1.1.1]: https://github.com/jnreis/briojs/compare/6dcd7d4...d968d8a
[1.1.0]: https://github.com/jnreis/briojs/compare/b273a76...6dcd7d4
[1.0.1]: https://github.com/jnreis/briojs/compare/5682690...b273a76
[0.30.0]: https://github.com/jnreis/briojs/compare/65e3484...5682690
[0.28.0]: https://github.com/jnreis/briojs/compare/3fbf804...65e3484
[0.27.0]: https://github.com/jnreis/briojs/compare/e19c23b...3fbf804
[0.26.0]: https://github.com/jnreis/briojs/compare/a3becfe...e19c23b
[0.25.0]: https://github.com/jnreis/briojs/compare/2fe978d...a3becfe
[0.24.0]: https://github.com/jnreis/briojs/compare/8e77b5f...2fe978d
[0.14.0 development]: https://github.com/jnreis/briojs/compare/e36567b...8e77b5f
[0.13.0 / 0.14.0]: https://github.com/jnreis/briojs/compare/f52422d...e36567b
[0.12.0]: https://github.com/jnreis/briojs/compare/221db54...f52422d
[0.9.0 / 0.11.0]: https://github.com/jnreis/briojs/compare/d9d8680...221db54
[0.8.0]: https://github.com/jnreis/briojs/compare/ab1ea0b...d9d8680
[0.7.0]: https://github.com/jnreis/briojs/compare/fde126a...ab1ea0b
[0.6.0]: https://github.com/jnreis/briojs/compare/94f4371...fde126a
[0.5.0]: https://github.com/jnreis/briojs/compare/8ed7c7f...94f4371
[0.4.0]: https://github.com/jnreis/briojs/compare/794cf3a...8ed7c7f
[0.3.1]: https://github.com/jnreis/briojs/compare/1881dbe...794cf3a
[0.3.0]: https://github.com/jnreis/briojs/compare/a1b0582...1881dbe
[0.2.0]: https://github.com/jnreis/briojs/compare/bcc8b6b...a1b0582
[Initial development]: https://github.com/jnreis/briojs/compare/9365c28...bcc8b6b
