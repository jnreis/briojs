# Brio v4 application guide for AI assistants

Use this guide to build applications with Brio.js, not to modify its internals.
It describes the public v4 contracts. Check the consuming app's installed
`briojs/package.json` version and integration before using it. For browser-only
apps, check the selected bundle's source/version; `window.brio` has no version
property. If APIs differ, inspect that version's documentation/types instead of
guessing. The examples target v4.0.0.

## Integration and public APIs

Brio enhances actual HTML with synchronous fine-grained reactive bindings.
There is no virtual DOM, JSX requirement, framework server rendering, or
server/client reconciliation API. Use a small root for a widget, independent
roots on server-rendered pages, or the optional router for an SPA.

Browser: serve exactly one bundle, `brio.min.js` for production or
`brio.dev.min.js` for development. Both publish `window.brio` and dispatch the
`brio` ready event after publication. Run mounting after both the script and the
root markup are available. Bundle paths are application deployment paths,
not automatically available `/dist/` URLs.

The browser global contains `createApp`, `state`, `signal`, `computed`, `effect`,
`batch`, `flush`, `createScope`, `onCleanup`, `getCurrentScope`, and `trustedHTML`.
All plugins are optional: load `brio.router.min.js`, `brio.persistence.min.js`,
`brio.http.min.js`, `brio.forms.min.js`, `brio.step.min.js`, or
`brio.money-mask.min.js` after the core as needed. They add createRouter, persist,
http/HttpError, validate, createStepEngine, or moneyMask respectively. These scripts share
the core runtime and extend its global; they do not emit another ready event.
Bootstrap after all needed scripts load, not at the core's ready event alone.
The development bundle also contains
`devtools`, `inspectDevtools`, `devtoolsPanel`, and `enableDevtools`; production omits the inspector,
snapshotting, and development tracking hooks. Do not load both bundles.

ESM with a bundler:

```js
import { createApp, trustedHTML, createStepEngine, validate, http } from 'briojs';
import { state, signal, computed, effect, batch, createScope, onCleanup } from 'briojs/reactivity';
import { persist } from 'briojs/persistence';
import { createRouter } from 'briojs/router';
import { moneyMask } from 'briojs/money-mask';
// Dedicated briojs/http, briojs/forms, and briojs/step entries are also available.
// Development only; import before creating apps:
import { devtoolsPanel } from 'briojs/devtools';
```

Keep devtools imports out of production application entry points. Native browser
The npm main entry exports all these plugins and devtools too. Main-entry
devtools exports are inert until `enableDevtools()` is called before app creation;
the devtools subpath and development browser bundle activate automatically. Native browser
ESM needs resolvable module URLs/import maps; npm bare imports do not resolve on
their own. Do not mix a standalone runtime and ESM runtime on the same root.

## App ownership

```js
const app = brio.createApp({ state: () => ({ count: 0 }) });
const mount = app.mount('#counter');
app.state.count++;
mount.unmount();
app.dispose();
```

`createApp` accepts `state` (a factory), `stores`, `components`, `router`, and `plugins`.
`app.component(name, definition)` and `app.plugin(plugin)` return the app.
Mount targets are elements or selectors; roots cannot overlap, even across apps.
Separate apps isolate app state; multiple roots of one app share `app.state`.
Explicitly registered stores can be shared across apps.
Root elements cannot carry `b-if`, `b-for`, or `b-template`: use descendants.

`mount.unmount()` restores the root's original attributes and child markup.
`app.unmount()` unmounts all roots but permits later mounting.
`app.dispose()` permanently closes the app. The host must call unmount/dispose
before removing a widget: raw DOM removal does not clean up Brio.

## Expressions and independent contexts

Expressions are trusted strict-mode JavaScript, compiled with `new Function`.
There is no `with`, implicit state-name resolution, or sandbox.

| Reference | Meaning |
| --- | --- |
| `$data` | Nearest data scope; mutate `$data.count`, not the binding itself. |
| `$data.$parent` | Enclosing data scope; chain for grandparents. |
| `$for.item`, `$for.index` | Names declared by a loop. |
| `$for.$parent` | Enclosing loop, independently of data ancestry. |
| `$el` | Current directive/script element. |
| `$id.name` | Generated ID from a surrounding `b-id`. |
| `$ref.name` | Raw DOM element in the current local ref registry, or undefined. Names are read-only. |
| `$props`, `$emit` | Component props and event emitter. |
| `$event` | DOM/component event in event handlers. |
| `$mutations`, `$size`, `$entry` | Observer-specific payloads. |
| `$insert` | Mount-bound dynamic insertion helper. |
| `$stores.name` | Registered app-wide store, independent of data/component boundaries. |
| `$provided.name` | Live subtree value from the nearest provider of that name. |
| `trustedHTML` | Explicit HTML trust assertion, not a sanitizer. |
| `flush` | Apply pending updates now, e.g. `$data.open = true; flush(); $ref.panel.focus()`. |
| `onCleanup` | Script cleanup helper; use synchronously in the active scope. |

The context is also accessible as `$context`, especially in contextual scripts.
Helpers not supplied by the current context are undefined.
Ordinary globals (`Math`, `JSON`, timers) and local variables resolve normally.
Do not assume imported ESM names are visible inside compiled expressions: put
application methods in `$data`, or use supplied context helpers.

`b-data="{ count: 0 }"` creates local state; empty `b-data` inherits without
adding a scope. Plain wrappers and loops do not add data ancestry levels.
Components do add a data scope. Data scopes do not add loop ancestry levels.
Outermost `$data.$parent` and `$for.$parent` are undefined.
`$parent` metadata is reserved/read-only and excluded from serialization.

```html
<section b-data="{ count: 0 }">
  <button b-on-click="$data.count++; $data.$parent.total++">Increment</button>
  <p b-text="$data.count"></p>
</section>
<ul>
  <li b-for="group in $data.groups" b-key="$for.group.id">
    <span b-for="item, index in $for.group.items" b-key="$for.item.id">
      ${$for.$parent.group.name}: ${$for.item.name}
    </span>
  </li>
</ul>
```

Both examples need the referenced parent/app fields initialized before mounting.

## Shared stores and subtree values

```js
const session = brio.state({ user: null });
const configuration = { apiBase: '/api' }; // Not reactive.
const app = brio.createApp({ stores: { session, configuration } });
const widget = brio.createApp({ stores: { session } });
```

`app.stores` / `$stores` are a fixed shallow read-only name mapping. References
are preserved, not copied or automatically made reactive. Explicitly create
reactive stores with `state()` (or a signal and `.value` for primitives).
Plain-store writes do not notify bindings. Changing the original registration
object does not change the app's registered names. Missing names return
`undefined`; no stores gives an empty mapping. Store registries must be plain
objects of enumerable own data properties, not accessors.

`$stores` is available regardless of local data/component boundaries, including
scripts, routed views and insertion. Component setup receives `$stores`;
plugins use `app.stores`. Shared stores survive app disposal; registration does
not own their resources or persist them across page loads. Scope resource
effects/persistence explicitly.

```html
<section b-data="{ theme: 'dark' }"
         b-provide="{ theme: $data.theme, session: $stores.session }">
  <span b-text="$provided.theme"></span>
  <div b-provide="{ theme: 'light' }">
    <span b-text="$provided.session.user?.name ?? 'Guest'"></span>
  </div>
</section>
```

`b-provide` returns a synchronous plain-object mapping whose expression remains
reactive. It applies on the element itself and throughout its Brio subtree,
without an inject directive. Nested providers override their own keys and
inherit others. Explicit `undefined` shadows a parent; removing a local key
reveals the parent. `$provided` inside the expression is inherited, not its own
result. Missing values return `undefined`; no provider gives an empty mapping.

Provided names are read-only, but referenced objects are not deep-frozen.
Mutate the actual reactive owner or supplied object's fields, not
`$provided.theme`. Accessor mappings, arrays, promises and invalid updated
results throw. Child state is not recreated when provided values change.
Component setup receives `$provided` directly.

Providers see same-element local data and per-row `$for`. Conditional
expressions still use the parent context before the branch's provider.
Providers add no data/loop ancestry levels. Providers on component hosts apply
before setup; caller-authored slot nodes keep their authoring context even
inside component-internal providers. Teleports retain original providers.
Inserted children inherit the destination's providers; inserted siblings
inherit the container's. Normal owned cleanup stops provider effects.

The named-store/provider APIs are additions in this checkout's Unreleased
section. Verify the consuming bundle supports them; the version number alone
does not distinguish older v4.0.0 builds.

## Directive contracts

Prefer canonical `b-` names. Arguments use hyphens; modifiers use dots, never
Vue-style `:` or `@` syntax. Text interpolation is `${expression}`, not `{{...}}`.
Escape HTML-significant characters in literal text/attribute values.

| Directive | Contract |
| --- | --- |
| `b-text="expr"` | Sets literal text; returned tags and `${...}` are never interpreted. |
| `b-provide="{ name: expression }"` | Supplies live read-only names through `$provided` on this element and its subtree. |
| `b-bind-href="expr"` | Binds a DOM property when available, otherwise an attribute. `null`, `undefined`, and `false` remove attributes, except `aria-*` booleans, which become `"true"`/`"false"`. |
| `b-bind-class="expr"` | Accepts strings, arrays, or class-name/boolean objects. |
| `b-bind-style="expr"` | Supports style objects. |
| `b-on-click="statements"` | Executes event statements; listeners are scope-owned. |
| `b-model="$data.field"` | Assignable input/textarea/select state; supports checkboxes, radios, and multiple selects. |
| `b-if`, `b-else-if`, `b-else` | Adjacent first-match branches; whitespace/comments can separate them. Default dehydrates inactive branches; `.hide` preserves in DOM, `.detach` preserves outside DOM. |
| `b-for="item, index in $data.items"` | Arrays, iterables, objects, or nonnegative integers; values live in `$for`. |
| `b-key="$for.item.id"` | Stable string/number identity; duplicate keys throw. Index is the default key. |
| `b-html="$data.markup"` | Inserts markup without Brio activation. `b-html.hydrate="trustedHTML($data.markup)"` explicitly activates executable authored templates with owned cleanup. |
| `b-ignore` | Skips hydration of the element and descendants. |
| `b-script` | Only on a script element; see required writing style below. |
| `b-effect="$data.observe($data.count)"` | Reactive expression, not a block of event-style statements. Avoid feedback writes. |
| `b-id="['input']"` | Creates `$id.input`; bind `id`/label `for` explicitly. |
| `b-ref="input"` | Register a concrete DOM target by literal name. Read `$ref.input`; not `$refs`. |
| `b-template` | Unwraps authored contents into an owned range of hydrated siblings. Supports keyed `b-for`, plain `b-if`, `.detach`, `b-id`, providers, teleport and effects; no template-name/expression sourcing. |
| `b-teleport="$ref.panel"` | Reactive Element/ref or selector expression; defaults to `after`. Use `[$ref.panel, 'append']` to insert inside. |
| `b-router-outlet` | Renders the router's matched registered component. |

When unmodified `b-if` becomes false, removal and disposal wait for leave completion
(immediate without a transition). Bindings/listeners remain live during leave.
Reversal reuses the same node/state; activation after a completed leave creates
fresh local state. App/parent state survives. Use `b-if.hide` or `b-if.detach` to
preserve the same nodes and local state. Declare the mode only on the leading
`b-if`; it applies to all else branches. Both modes hydrate all branches once
at mount (including inactive branches), run setup/scripts immediately, and
keep effects/listeners reactive while hidden; they do not pause work.
`.hide` uses `display: none` and restores authored display; `.detach` removes
and reinserts the same live nodes. Leave transitions finish before hiding or
detaching; rapid reversals cancel stale callbacks.
All conditional expressions evaluate in the parent context before the branch's
`b-data` / providers. Do not put modifiers on else branches, combine preservation
modes. `.hide` requires a concrete branch; wrap same-element loops/templates
for that mode. Plain conditionals and `.detach` support template fragments and
same-element loops; complete output moves/removes together. Keyed templates
preserve multiple roots, text, and row-local IDs through reorder; `b-id` runs
after `b-for`, while same-element `b-data` still runs before the loop.
Same-element `b-teleport` moves the range and `b-effect` runs after children
hydrate. Bindings/events/model/transition/script belong on surviving children,
not the removed template wrapper. Use a concrete branch for group transitions.
Detached conditional loops suspend their teleported row groups and reconcile
hidden collection updates before restoring output at its destination.
Teleported descendants are not hidden by hiding their source wrapper.
Avoid competing imperative writes to directive-owned children.

### Teleport destinations

Use `b-teleport="$ref.panel"` for an Element or
`b-teleport="['#portal', 'append']"` for a selector and placement.
Only `before`, `after` (default), `prepend`, and `append` are supported.
A tuple has exactly two items. Strings always mean document-wide CSS selectors,
never ref names. There is no `.ref` modifier or unquoted-selector shorthand.
Ref lookup stays local-only; row/component/data boundaries still apply.

Targets/placements are reactive expressions. Null/undefined or unmatched selectors
keep/restore live output at its authored source without cloning/rehydrating.
Ref membership changes retry automatically; later targets wait for hydration,
including component rendering. An unmatched selector warns once per unchanged
miss; there is no DOM observer/polling, so arbitrary insertion does not retry it.
Invalid values/placements/selectors/modifiers, cycles, inert native template
child destinations, and directive-controlled child containers throw.
Before/after may target siblings beside a controlled container.

Moving output preserves source contexts, ownership, refs, listeners and native
identity, but changes CSS ancestry and native event bubbling. Keyed loops maintain
bounded groups per target/placement, not just parent. Same-element detached
conditionals/conditional loops keep output suspended through retargeting.
Disconnected refs remain valid; connectivity and native reparenting are not
reactive. Brio removal of a ref target restores independent source output.
For selector-only destinations, switch target/dispose source before removing
the destination; native removal alone never updates ref membership.

### Local DOM refs

Use `b-ref="input"` with `$ref.input?.focus()` for native APIs, not state/render
replacement. Names are trimmed nonempty literals; arguments/modifiers/dynamic
names/collections are unsupported. Duplicate names in one registry throw.
`$ref` is read-only with reactive get/has/enumeration; raw DOM objects/properties
are not proxied or made reactive. Missing names are undefined.

Every mount, b-data boundary (even empty b-data), component instance and repeated
row has a local-only registry, without parent fallback. Same-row refs stay with
retained keys; same-element b-data refs belong to that new boundary.
Component-host refs belong to the caller; setup/templates get private refs;
projected slots retain author refs. Setup receives `$ref` before children hydrate:
use an owned effect for later membership or read in events, not a pre-scan/mounted
assumption. npm exports `RefMap` (Element | undefined); narrow specialized types.

Plain conditionals unregister after completed leave; hide/detach retain refs,
even to disconnected elements. Teleport preserves ownership. Preserved branches
all hydrate, and plain leaves can overlap: duplicate names need distinct spelling
or separate b-data boundaries. No automatic active-branch ref selection.
b-template/native template refs are errors; ref concrete children. b-ignore/raw
HTML do not register. Managed insertion/hydrated HTML inherit destination refs,
normal nested boundaries apply, and disposal/unmount clears registrations.
Use onCleanup for integration resources; do not assign/delete ref entries.

Events support `.prevent`, `.stop`, `.self`, `.outside`, `.window`, `.document`,
`.capture`, `.passive`, `.once`, `.debounce`, and `.throttle`.
Event debounce/throttle is fixed at 150ms; do not invent `.debounce.500`.
Do not combine passive listeners with preventDefault.
Model modifiers: `.lazy` (change), `.trim`, `.number` (parseFloat, retaining
non-numeric text). Text inputs and textareas preserve strings by default.
`b-text` is literal by default; `b-html.hydrate` opts into template activation.
Do not assume checkbox/radio value coercion beyond current
model behavior; test the form's exact value types.

Observers: `b-on-enter`/`b-on-exit` receive `$entry`;
`b-on-resize` receives `$size.width`, `$size.height`, and `$entry`;
`b-on-addednodes`, `b-on-removednodes`, `b-on-attrs`, `b-on-text` receive
`$mutations`. Observer `.debounce` is 100ms; `b-options` can specify a numeric
delay. Intersection also supports `.once`. Resize/IntersectionObserver require browser support or app polyfills.
Text observers watch characterData, not every replacement of child text nodes.

Observer `b-options` is keyed by base/full directive names, with full-name
options overriding base options and dot booleans overriding both:

```html
<div b-options="{ 'b-on-enter': { root: '#scroller', rootMargin: '20px', threshold: [0, 0.5, 1] } }"
     b-on-enter.debounce="console.log($entry)"></div>
```

Intersection root may be an Element/Document, selector, or null viewport.
Mutation supports target node/selector, subtree (default true; explicit false
for direct-only), attributeFilter/attributeOldValue and characterDataOldValue.
Resize supports document true / `.document` and box content-box (default),
border-box, device-pixel-content-box. `$size` uses the selected box as physical
width/height; device pixels are not CSS pixels. Missing requested nondefault
measurements throw. Mutation debounce accumulates records. All options are
read once at hydration, invalid settings throw, and cleanup cancels pending
callbacks. This b-options API applies only to observer directives.

Masks: `b-mask="'##/##/####'"` or `b-mask="$data.formatter"`.
Tokens are Unicode-aware: `*` any code point, `A` letters/decimal digits, `a` letters,
`#` decimal digits. `9` is literal. Backslash escapes tokens; double it inside a JS
string expression. Patterns process code points, not grapheme clusters.
Formatters synchronously accept `{ value, selectionStart, selectionEnd,
selectionDirection, inputType }`, return a string or `{ value, selectionStart?,
selectionEnd? }`; positions use native UTF-16 offsets. Without positions, clamp
the existing selection. No registry or mask modifiers. Composition/model/cleanup
are owned by Brio. Use pure formatters; reactive configuration re-evaluates.
Optional `brio.money-mask.min.js` provides
`b-mask="brio.moneyMask({ precision: 2 })"`; ESM imports moneyMask from
briojs/money-mask and exposes the formatter through state. Money retains ASCII
fixed-minor-unit entry: `123456` formats to `1,234.56`. Options may be reactive
when passed to a factory in the expression. A masked
model holds a formatted string, not a numeric currency value.

Transitions: `b-transition="'fade'"` uses `fade-enter`, `fade-enter-active`,
`fade-enter-to`, `fade-leave`, `fade-leave-active`, and `fade-leave-to`.
Supply CSS transitions, not keyframe animations. Hide/removal waits for own
properties, ignores descendant events, and cancels pending work on disposal.

## Scripts, components, and cleanup

```html
<script b-script>
  ($context) => {
    const timer = setInterval(() => { $context.$data.ticks++; }, 1000);
    $context.onCleanup(() => clearInterval(timer));
  }
</script>
```

Use an unassigned arrow function, not top-level statements or an invoked
function. Only marked script elements are processed by Brio. Ordinary browser
scripts execute normally. Async initialization does not block mounting;
initialize displayed fields before the first await. Register cleanup before
awaiting; guard late async updates and handle application failures explicitly.

```js
app.component('counter-card', {
  template: '<button b-on-click="$data.increment()"><span b-text="$props.label"></span>: <span b-text="$data.count"></span><slot></slot></button>',
  setup({ $props, $emit, el, app }) {
    return {
      count: 0,
      increment() { this.count++; $emit('change', this.count); },
    };
  },
});
```

Use hyphenated component names. Setup returns plain state, exposed as `$data`.
Static host attributes become string props; `b-bind-label` gives a reactive prop.
Emits are bubbling CustomEvents; consume `$event.detail` in host handlers.
Named slots use `slot="name"` and `<slot name="name">`. Projected content retains
the caller's data context. Use ordinary `<style>@scope { ... }</style>` inside
the component template for native parent-rooted CSS.
Do not mutate props as an alternative to emitting a parent update.
Setup runs in an owned scope; `brio.onCleanup(...)` can register listeners,
timers, and other external resources there.

### Recommended native CSS

- Use shared stylesheets for global design tokens, resets, layers and reusable
  classes. Brio does not compile, move or namespace CSS.
- A bare `<style>@scope { h2 { color: green; } }</style>` scopes to the style's
  physical parent, including a component host when placed directly inside it.
  `b-data` does not create a CSS boundary. Native proximity favors closer scopes
  when priority/specificity tie; the root selector adds no specificity and
  explicit :scope adds pseudo-class specificity.
- Use `@scope (.panel) to (.limit)` for explicit roots/limits, or
  `@scope to (.limit)` with an implicit parent root. Limits exclude the matching
  element and descendants; `.limit > *` includes the limit element. Explicit
  roots are native document selectors and may match more than one subtree.
- For a unique explicit selector, use existing bindings:

  ```html
  <section b-id="['style']" b-bind-class="{ [$id.style]: true }">
    <style>
      @scope (.${$id.style}) to (.limit) { h2 { color: red; } }
    </style>
    <h2>Scoped text</h2>
    <div class="limit"><h2>Excluded text</h2></div>
  </section>
  ```

- Prefer `b-bind-style="{ '--accent': $data.accent }"` with `var(--accent)` for
  reactive values. Ordinary style text is reactive `${...}` text too; use simple
  references for authored selectors/structural changes. Expressions with nested
  braces are outside the simple text interpolator's grammar. `b-ignore` keeps
  literal `${...}` text, while `b-text` can bind full CSS without secondary
  interpolation. CSS interpolation is trusted code, not sanitization.
- CSS follows physical DOM: slots keep expression context but not CSS isolation;
  teleport can leave a scope, and unwrapped templates change the style's parent.
  Use a surviving wrapper/explicit selector for stable roots.
- Inheritance/custom properties cross limits and global CSS can reach inside.
  Keyframe/layer names remain document-global; choose distinctive names.
  Animations, variables, nesting, registration rules and formatting remain native,
  without framework CSSOM rewriting or shorthand restrictions.
- Inline styles stay connected during hide/leave, disconnect with detached
  branches, and reconnect on reinsertion. Explicit-root styles affect elsewhere
  only while their sheet is active. Unmount stops bindings and restores markup;
  restored static CSS can remain active. Dispose owned DOM via Brio lifecycle.
- Browser support, parsing/recovery and CSP apply normally; no Brio scope check
  or fallback. @scope: Chromium 118+, Firefox 146+, Safari 17.4+ (Safari 26.0–26.3
  has an input/textarea regression fixed in 26.4). Use ordinary classes when
  broader compatibility is required.

`state` observes plain objects/arrays, not arbitrary class instances.
Signals and computed values use `.value`; effects run synchronously by default.
`batch` groups synchronous writes. Event handlers run inside a batch, so DOM
depending on their writes (new `b-if` branches, `$ref` entries) appears when the
handler returns; call `flush()` first when the same handler needs that DOM. `createScope().run(...)` owns created effects;
dispose that scope. The app's state factory alone is not a scope.
ESM also exports `resource(fetcher)` from `briojs` and `briojs/reactivity`,
not the browser global. It starts fetching and exposes `data.value`,
`loading.value`, `error.value`, `refetch()`, and idempotent `dispose()`.
The fetcher receives an AbortSignal; pass it to Fetch/cancellable work.
New executions abort prior work; only the latest may publish, even if abort
is ignored. Existing data remains during refresh/failure; refresh clears error.
Failures are recorded in error.value, not rethrown by refetch. Synchronous
fetcher reads establish reactive dependencies; reads after await do not.
Owning-scope disposal aborts/stops the resource; outside a scope, call dispose
explicitly. The app state factory is not an owner scope. Disposal clears loading,
preserves settled data/error, and blocks late publication; later refetch rejects.
Obsolete refetch promises still wait for their fetcher to settle. Display
loading/errors. No caching, retries, timeouts, SSR, or mount blocking is provided.

## Managed insertion

```js
const handle = app.insert('#items', 'append',
  '<button b-on-click="$data.count++">${$data.count}</button>',
  { data: { count: 0 } });
handle.remove();
```

In expressions/scripts use `$insert(...)` or `$context.$insert(...)`, not
`app.$insert`. Signature: `(target, placement, content, options?)`.
Placements: `before`, `after`, `prepend`, `append`, `replaceWith`,
`replaceChildren`, `textContent`. Targets are nodes/selectors.
Strings are automatically trusted and hydrated; nodes/fragments are cloned.
`textContent` is literal text, without HTML or interpolation processing.

Child placements inherit target context; sibling placements inherit its parent.
`options.data` creates local `$data` with `$data.$parent`; `$for` is retained.
Contextual selectors are restricted to their mount; app selectors must resolve
in exactly one app root. Inserted content belongs to the destination, not the
calling button's scope. Handles expose `nodes`, `removed`, and idempotent
`remove()`. Replacement/unmount/enclosing scope disposal cleans up bindings.
Root unmount invalidates old contextual insertion helpers.

No sibling placement/replacement of mount roots; no direct replacement of
`b-if`/`b-for` generated roots. Child insertion into `b-ignore`, `b-text`,
`b-html`, or router-controlled containers is rejected. Replace an appropriate
enclosing container instead. Replacement is destructive: hydration failure
cleans the failed insertion, but does not restore old content.

## Optional tools and application boundaries

- Router: `createRouter([{ path: '/', component: 'home-page' }])`; assign to
  `createApp({ router })`, register components, use `b-router-outlet`. Dynamic
  path segments use `:id`; route state is `router.current.value`.
  `navigate(path, { replace })` returns a boolean; unmatched paths return false.
  Optional second argument `{ base: '/my-app/' }` (default `/`) normalizes the
  deployment prefix. Definitions, navigate and href use app-relative paths.
  `router.href('/users/ada?q=1#bio')` prefixes the base and preserves query/hash.
  `match(browserUrl)` instead consumes the already-prefixed browser URL;
  initial loads, history and intercepted anchors use that path without doubling
  the base. Outside-base/foreign-origin URLs do not match. current.value.path is
  app-relative, pathname only. Never pass browser URLs to navigate/href.
  Matched same-origin links inside mounted roots use history navigation;
  external/unmatched/modified/download links retain normal browser behavior.
  Render deployment-aware anchor hrefs on the server for no-JS use; configure
  server fallback for direct SPA URLs under the base. For MPAs, retain normal links.
- Persistence: `persist(key, initial, { storage })` inside component setup,
  a plugin, or explicit scope. Never call it in the app state factory unless
  an explicit owner scope surrounds that operation. Plain containers are
  reactive directly; primitives are signals. Default storage is localStorage;
  use `'session'` or a getItem/setItem adapter. JSON/storage failures can throw.
  Choose application-specific keys and never persist secrets.
- Forms: `validate(data, schema, customRules?)` returns `true` or a field-to-
  error-message-array object. Schema entries are arrays of
  `{ name, value?, message? }`; built-ins are required/min/max/email/same/in.
  Unknown rules warn and are skipped; verify schema names. Client validation
  does not replace server validation.
- HTTP: `http.get/post/put/patch/delete(url, bodyOrQuery?, options?)`.
  GET/DELETE accept plain query objects (nested brackets, scalar arrays `[]`,
  structured array indices; null becomes empty, undefined omitted; Dates use ISO)
  or explicit URLSearchParams. Top-level null/undefined means no query.
  POST/PUT/PATCH use JSON for plain objects/arrays/scalars/null; supplied headers
  are preserved. Native Fetch bodies pass through, including binary views and
  streams; leave multipart boundaries to Fetch. Content-type selects JSON/+json
  or text; automatic 204/205 and zero-length JSON return undefined. Malformed
  nonempty JSON rejects. Explicit parsers use native behavior, including rejection
  of empty JSON. Non-OK responses throw `HttpError` with status and an unread
  response; network/abort/parse errors remain native. Fetch options (including
  signal, optional streaming duplex) pass through; method/body belong to the helper,
  parser does not reach Fetch. Generic response types do not validate data.
  Implement visible errors, loading state, and owned request cancellation.
- Steps: `createStepEngine({ initial: 'intro', steps: { intro: { next: 'review' },
  review: {} } })` owns reactive navigation state. Place the engine in `$data`
  locally, or share through `$stores`; no caller `state()` wrapping is needed.
  Read-only `current`, `canGoNext`, `canGoBack`; methods `isActive(name)`,
  `go(name)`, `next()`, `back()`, `reset()` return booleans. Exactly one step is
  current. Back pops actual navigation history, not a definition link.
  Terminal Next/empty Back return false without warnings. Invalid explicit go
  targets throw. Self-navigation returns true without state/history changes.
  Reset restores initial and clears private unlimited history, not app/form
  data; returning to initial through go/next preserves history.
  Configuration is validated/copied once; only next is allowed per definition,
  all links must resolve, cycles are allowed, and mutations to input do nothing.
  No active/keep/back/origin fields, dynamic registration, history exposure, async
  guards/hooks, or completion state. Validate/await app work before navigation.

## API boundaries

Use `createApp` and `createStepEngine`, `app.insert` or contextual `$insert`,
explicit `$data` state access, `$data.$parent` ancestry, and `$ref` DOM references.
Own integration resources with `onCleanup` inside a Brio scope.
Low-level `hydrateRoot`/`hydrateNode` remain ESM-only; do not call them on
`window.brio`. Prefer mount/insert for application development.

## Trust and verification

For server-page/client-side swaps, the host owns navigation. Before removing
roots, call `mount.unmount({ restore: false })` or
`app.dispose({ restore: false })`; default teardown restores authored markup.
Cleanup still runs and may remove directive-owned DOM. Do not remount that
consumed markup; enhance fresh incoming HTML. Retain mounts when the host keeps
the actual root Element. Keep page-local and persistent app lifetimes separate.
Do not dispose cached documents on pagehide (`event.persisted`), or remount
their live roots on pageshow. Register host lifecycle listeners only once.

Astro: import enhanceAstro/lazyApp from optional `briojs/astro` in a shared
layout's processed client script, installed once:
`enhanceAstro({ apps: { counter: lazyApp(() => import('./counter')) }, onError(error, root) { console.error(error, root); } })`.
Modules default-export synchronous `(root, props) => createApp(...)` factories.
Use `b-app="counter"` with optional `b-props="{ initial: 5 }"`. Props are trusted
JS, read once before loading with $el/no $data, and must be a plain data-property
object. Validate values in the factory; no automatic state merge or reactive
server props. Astro frontmatter is server-only; serialize server data through
Astro mechanisms. Regular b-bind still binds DOM, not island props.
Allow sibling instances, reject nested islands and unknown names. Lazy means
code loading on discovery, not visibility. Pending outgoing roots never invoke
late factories. Roots at/inside matching transition:persist boundaries retain
the original app and props. Errors go to required onError; no automatic retries.
Dispose the returned integration handle for shutdown/HMR (restores snapshots);
normal page swaps are handled automatically. Tested with Astro 5.18.2.

Templates, `b-html.hydrate`, and HTML insertion execute authored expressions/scripts.
`trustedHTML` is a trust assertion, not sanitization or a security boundary;
it is required by `b-html.hydrate`. Never bind untrusted HTML as executable
templates. Use `b-text` for user content; returned values are always literal,
including values returned by authored interpolation. Default `b-html` accepts
strings or trusted values but does not activate Brio; it is not sanitized.
Use trustedHTML('') to clear hydrated content. Strict CSP disallowing
`unsafe-eval` is incompatible with runtime expression compilation.

Before shipping: test the actual rendered app and console errors, form value
types, keyed updates and nested contexts, conditional reset versus preservation,
insertion removal, unmount cleanup, and async failure behavior. Verify SPA direct
URLs and ordinary MPA links. Use the app's existing test/build tooling, not
assumed framework scripts in the consuming project.
