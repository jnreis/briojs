# Brio.js

Brio is a petite, HTML-first framework for reactive widgets and web apps. It enhances the real DOM in place, with a small reactive core, scoped cleanup, reusable HTML components, and optional persistence and routing.

```sh
npm install briojs
```

```js
import { createApp } from 'briojs';

createApp({ state: () => ({ count: 0 }) }).mount('#counter');
```

```html
<div id="counter">
  <button b-on-click="$data.count++">Count: <span b-text="$data.count"></span></button>
</div>
```

Read the [vNext documentation](./DOCUMENTATION.md) for widgets, multi-page sites, SPAs, components, reactivity, persistence, routing, and the breaking v4 migration.

For standalone browser use, load `dist/brio.min.js` in production or
`dist/brio.dev.min.js` during development. Both expose `window.brio`; the
development bundle also includes the live inspector and its tracking tools.
Use `app.insert(target, placement, content, options?)` for managed dynamic content,
or `$insert(...)` inside directives and scripts.

## Building with AI assistants

The package ships a [portable AI developer kit](./ai/README.md) with a
[Brio v4 application guide](./ai/brio-apps/references/guide.md), an installable
skill, and tested widget, multi-page, and SPA recipes. Use the guide directly,
or copy the complete skill folder into your assistant's supported discovery
location. Installing Brio does not automatically activate the skill.

For existing applications, the separate
[1.1.5-to-v4 migration kit](./ai/brio-migrate-1-1-5/SKILL.md) inventories the
actual legacy runtime, maps changed/removed APIs, and provides a staged
migration workflow with a tested before/after example.

## Measuring runtime performance

The [benchmark runner](./bench/run.mjs) drives the keyed-table scenarios of the
[js-framework-benchmark](https://krausest.github.io/js-framework-benchmark/current.html)
(create/replace/append/clear rows, update every tenth row, select, swap, remove)
in headless Chromium against [`bench/apps/brio.html`](./bench/apps/brio.html),
and reports median milliseconds plus heap and DOM nodes per row for 10,000 rows.

```sh
npm run bench            # Brio only
npm run bench:compare    # Brio, Vue, petite-vue, Alpine, React, Preact and Svelte side by side
npm run bench:check      # fail if a metric regresses >15% (and >1 ms) vs the baseline
node bench/run.mjs --save   # record a new bench/baseline.json after intentional changes
```

Each script rebuilds `dist` first. Vue, petite-vue and Alpine load their browser
ESM builds directly. React, Preact (JSX) and Svelte (compiled components) are
written in [`bench/src`](./bench/src) and compiled to the git-ignored `bench/dist`
by [`bench/build.mjs`](./bench/build.mjs), which the runner calls automatically.
Every page applies each change synchronously (`flushSync` for React and Svelte;
Preact's render microtask completes before `settle()` resolves), so all
frameworks are timed doing the same work. Timings include layout, depend on the
machine, and are comparable only against a baseline recorded on the same machine.

## Measuring bundle size

From a development checkout with dependencies installed:

```sh
npm run build
npm run size
npm run size -- --json
npm run size -- --check
```

The [size reporter](./scripts/size.js) measures raw bytes, gzip level 9, and
Brotli quality 11 for all eight browser scripts, each npm entry's reachable
static ESM graph, the deduplicated graph of all entries, and minified Vite
application consumers. Main-entry and subpath scenarios cover reactivity,
resources, optional tools, Astro, and a core app with router/HTTP/forms.
Persistence scenarios retain scope creation; devtools scenarios retain an app
and inspection, rather than measuring tools without their required runtime.

ESM graph sizes sum **separately compressed files**, counting shared chunks
once per graph. Consumer fixtures retain public functions via global sinks;
their small harness is included consistently. They measure library reachability,
not a complete application's size. Published ESM remains unminified; consumer
builds measure downstream minification separately. Source-map payloads are excluded; browser
scripts' map URL comments remain counted. Dynamic user app modules (including
Astro lazy factories), HTML, CSS, network overhead, and caching are not measured.

The [checked-in baseline](./scripts/size-baseline.json) records tool versions
and compression settings. `--check` fails on any raw, gzip, or Brotli increase,
or a changed scenario set. Rebuild first: the reporter intentionally reads
existing `dist` output and does not regenerate it. Reproduce the recorded tool
versions before interpreting small differences. For intentional changes, review
the full matrix and update the baseline explicitly:

```sh
node scripts/size.js --json > scripts/size-baseline.json
```

### Optimization techniques

The highest-leverage techniques usually remove **unneeded features**, not
characters. This practical inventory distinguishes runtime size from delivery
and install size:

1. Optional features and subpath entry points: already used by Brio.
2. Static ESM imports/exports for tree-shaking: already used.
3. Accurate `sideEffects` metadata: preserve devtools-entry activation.
4. Compile-time feature flags/dead-code elimination: production browser builds
   already remove devtools hooks; npm's opt-in devtools must remain functional.
5. Avoid unnecessary import-time initialization and registration.
6. Pure annotations only for genuinely discardable expressions.
7. Avoid opaque dynamic exports/property access that obstruct static analysis.
8. Share common code and the reactive runtime across entries/plugins.
9. Tune chunk boundaries using the entire reachable graph, not entry-file size.
10. Dynamic imports/code splitting reduce initial delivery, not necessarily total
    bytes; Astro lazy factories already support application-level splitting.
11. Limit dependencies, polyfills, and transpilation helpers without changing the
    supported browser target.
12. Identifier/syntax/whitespace minification: already handled by esbuild for
    browser distributions and minified consumers.
13. Alias repeated built-ins. Cached aliases can change monkeypatch behavior;
    shorter identifiers do not guarantee smaller compressed output.
14. Wrap repeated DOM methods while preserving their receiver (`this`).
15. Extract repeated multi-statement mechanics; existing error helpers already
    share error construction without losing messages or causes.
16. Share repeated constants, strings, regexes, and parsing when semantics match.
17. Consolidate directive parsing/attribute work without changing snapshots,
    ordering, precedence, or ownership.
18. Simplify equivalent control flow and redundant intermediate structures.
19. Scope hoisting/module concatenation and safe inlining: largely bundler work.
20. Private property mangling can save bytes, but public APIs, expressions,
    reflection, and separate browser builds make broad mangling unsafe here.
21. Short production error codes trade diagnostics for bytes: not used here.
22. Removing aliases/features/validation changes behavior: not a size-only fix.
23. Code golf, unsafe compiler assumptions, eval packing, and prototype mutation
    are not acceptable substitutes for maintainable code.
24. HTTP gzip/Brotli reduces transfer size; deployment controls compression.
25. Source maps are separate debug assets; removing them barely changes JS bytes.
26. Content hashes/CDN caching improve repeat delivery, not executable size.
27. npm's `files` allowlist reduces tarball/install size, not consumer code.
28. Alternative minifiers merit consideration only after measured justification;
    this pass adds no dependency or replacement minifier.
29. Lazy optional dependencies reduce startup delivery, but should not duplicate
    shared runtimes or change plugin contracts.

### Measured experiments

Before shared-helper optimization, production core was **48,512 raw / 16,349
gzip / 14,746 Brotli bytes**. Initial isolated experiments produced these deltas
from that baseline, not cumulative:

| Candidate | Raw | gzip | Brotli |
| --- | ---: | ---: | ---: |
| `removeAttribute` wrapper | -265 | -6 | +2 |
| `getAttribute` wrapper | -48 | +9 | +13 |
| Combined attribute wrappers | -319 | -6 | +13 |
| Object-method wrappers | -46 | +3 | +17 |
| `Array.from` wrapper | -248 | -5 | +28 |
| Shared directive-attribute cleanup | -176 | -2 | +46 |
| Normalize directive prefix once | -125 | -13 | -3 |

The prefix candidate looked best in core but increased the `createApp` consumer
by **70 Brotli bytes** and was rejected. These isolated results do not establish
the value of a cumulative helper set: sharing many recurring operations across
the runtime produces a different minified result.

The retained implementation uses internal [language helpers](./src/core/native.ts)
and [DOM helpers](./src/dom/native.ts) across core, directives, components,
reactivity, integrations, and tools. These cover parent/sibling/document/child
access, attribute operations, insertion/removal, event listeners, array/object
operations, and error construction. `Object` and `Reflect` namespace references
are captured once; their methods are looked up when called, not cached
individually. Replacing the entire global namespace after importing Brio is not
reflected in these aliases. DOM receivers, listener options, array snapshots,
error types/messages, and public APIs are preserved. Error stacks still include
the callers, with an additional shared factory frame.

Final measured deltas from the original pre-helper baseline:

| Artifact/consumer | Raw | gzip | Brotli |
| --- | ---: | ---: | ---: |
| Production browser core | -4,325 | -18 | -24 |
| Development browser core | -4,372 | -33 | +14 |
| Minified `createApp` consumer | -4,315 | -25 | -8 |
| Core + router/HTTP/forms consumer | -5,192 | -92 | -120 |

Production core is now **44,187 raw / 16,331 gzip / 14,722 Brotli bytes**:
**8.9% smaller raw** than the original baseline. Compression already encodes
repeated property names efficiently, so helper factoring does not guarantee
smaller gzip or Brotli output.

The accepted tradeoff prioritizes full core and typical bundled apps, not a
requirement that every artifact shrink. Standalone browser plugins add 27-52
gzip bytes and 27-55 Brotli bytes; optional-tool npm consumers add up to 96
gzip/118 Brotli bytes. The complete unbundled ESM graph adds 5,819 raw / 1,971
gzip / 1,736 Brotli bytes due to helper declarations, imports, and shared chunks.
Those graph costs are distinct from tree-shaken, minified application costs.
The checked-in regression baseline includes these deliberately accepted changes.

#### Repeated-word follow-up

After the first shared-helper pass, cross-file trials evaluated namespace aliases,
`typeof` predicates, `instanceof`, length/method wrappers, and repeated strings.
These production-core deltas use the **45,779-byte first-pass core** as baseline:

| Trial | Raw | gzip | Brotli |
| --- | ---: | ---: | ---: |
| `Object`/`Reflect` aliases | -297 | -6 | -18 |
| Typed `typeof` predicates | -420 | -32 | -15 |
| Generic `instanceof` helper | -189 | +8 | -16 |
| Length helper | -59 | +18 | -4 |
| `includes`/`startsWith` wrappers | -225 | +17 | +1 |
| Repeated whole-string constants | -588 | +127 | +156 |
| Factored `insert`/`scope`/`template`/`requires` string fragments | -71 | +62 | +71 |
| All operator/namespace helpers combined | -1,178 | +6 | +25 |
| Retained aliases + predicates + length (actual typed build) | -779 | -13 | -11 |
| `isInstanceOf` replacing 27 runtime checks | -180 | +22 | +22 |

The final `isInstanceOf(value, constructor)` helper preserves native
`instanceof` behavior, including custom `Symbol.hasInstance`, and carries a
TypeScript type guard. All 27 remaining runtime `instanceof` expressions now
use it; the helper's own implementation is the single remaining operator use.
This adds 22 compressed bytes to core but reduces the core+tools consumer by a
further 50 gzip / 45 Brotli bytes relative to the prior helper build.

#### DOM remove helper

Zero-argument `.remove()` calls use the existing `removeElement` helper,
including DOM elements/comments and Brio range/insert-handle cleanup. It accepts
nullish values to preserve optional cleanup behavior and calls the object's own
method, preserving its receiver and exceptions. `classList.remove()` stays
direct because it takes a variable list of class names.

Routing every zero-argument `.remove()` call through the helper saves **148 raw
/ 17 gzip / 5 Brotli bytes** in the production core versus the immediately
preceding build. The `createApp` consumer saves 148 raw / 24 gzip bytes with no
Brotli change; the full core+tools consumer saves 147 raw / 29 gzip / 36 Brotli
bytes. The size baseline records this measured result.

#### Collection delete helper

All 31 collection `.delete(item)` call sites now use the typed `deleteItem`
helper. It forwards the receiver and item to the collection method and returns
the native boolean result. It also accepts a nullish collection to preserve the
one optional cleanup call's `undefined` result. Map/Set membership behavior,
custom method receiver, and thrown errors are covered by helper tests.

Against the immediately preceding build this saves **217 raw / 14 gzip bytes**
in production core, with a 10-byte Brotli increase. The minified `createApp`
consumer saves 218 raw / 10 gzip / 29 Brotli bytes; core+tools saves 227 raw /
3 gzip bytes, with a 3-byte Brotli increase. The checked-in size baseline
captures these compression tradeoffs.

#### Collection includes helper

All 17 collection membership checks now use the typed `includesItem` helper.
It forwards the receiver and item to the collection method, preserving native
membership behavior, receiver binding, and thrown errors. Tests cover built-in
array semantics (including `NaN`) and custom collection methods. String
substring checks remain direct because they are not collection membership.

Against the immediately preceding build this saves **137 raw bytes** in
production core, while gzip increases by 24 bytes and Brotli by 39 bytes. The
minified `createApp` consumer saves 137 raw bytes, with 21 gzip / 20 Brotli
bytes of growth; core+tools saves 156 raw bytes, with 12 gzip / 35 Brotli bytes
of growth. The size baseline captures these measured tradeoffs.

#### String prefix helper

All 23 runtime string `.startsWith(prefix)` calls now use the typed `startsWith`
helper, which delegates directly to the native method. Runtime and type tests
cover matches, misses, empty strings, receiver binding, and thrown errors.

Against the immediately preceding build this saves **131 raw bytes** in
production core, while gzip increases by 19 bytes and Brotli decreases by 51
bytes. The minified `createApp` consumer saves 131 raw / 25 Brotli bytes, with
16 gzip bytes of growth; core+tools saves 165 raw / 31 Brotli bytes, with 11
gzip bytes of growth. The size baseline captures these tradeoffs.

The retained helpers are arrow functions with type guards where appropriate.
`isObjectType(null)` deliberately returns true, matching `typeof null`.
Environment guards such as `typeof window !== 'undefined'` stay inline:
passing an undeclared global to a helper would throw before the helper runs.
The compile-time devtools guard stays inline too. Direct function checks remain
where needed for precise union narrowing. Length writes and optional accesses
also stay direct.

Frequency is a search heuristic, not a count of interchangeable expressions:
`scope`, `insert`, and `template` also appear in public property names and error
messages. Public keys cannot be renamed, and factoring message fragments must
preserve the full diagnostic. These trials therefore changed only eligible
runtime expressions and strings, not words inside identifiers or public keys.
Additional individual string trials on the retained implementation also failed
to improve both compression formats; no string-constant factoring or generic
`instanceof`/method wrappers were retained.
