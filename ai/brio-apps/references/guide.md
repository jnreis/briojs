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
`batch`, `createScope`, `onCleanup`, `getCurrentScope`, `createStepEngine`,
`http`, and `trustedHTML`. Load optional `brio.router.min.js`,
`brio.persistence.min.js`, and `brio.forms.min.js` after the core to add
`createRouter`, `persist`, and `validate` respectively. These scripts share
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
Root elements cannot carry `b-if` or `b-for`: use descendants.

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
| `$props`, `$emit` | Component props and event emitter. |
| `$event` | DOM/component event in event handlers. |
| `$mutations`, `$size`, `$entry` | Observer-specific payloads. |
| `$insert` | Mount-bound dynamic insertion helper. |
| `$stores.name` | Registered app-wide store, independent of data/component boundaries. |
| `$provided.name` | Live subtree value from the nearest provider of that name. |
| `trustedHTML` | Explicit HTML trust assertion, not a sanitizer. |
| `onCleanup` | Script cleanup helper; use synchronously in the active scope. |
| `money` | Mask-specific formatting descriptor helper. |

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
| `b-text="expr"` | Sets text content with one-pass `${...}` interpolation in the evaluated result; tags remain literal. `.raw` skips interpolation. |
| `b-provide="{ name: expression }"` | Supplies live read-only names through `$provided` on this element and its subtree. |
| `b-bind-href="expr"` | Binds a DOM property when available, otherwise an attribute. `null`, `undefined`, and `false` remove attributes. |
| `b-bind-class="expr"` | Accepts strings, arrays, or class-name/boolean objects. |
| `b-bind-style="expr"` | Supports style objects. |
| `b-on-click="statements"` | Executes event statements; listeners are scope-owned. |
| `b-model="$data.field"` | Assignable input/textarea/select state; supports checkboxes, radios, and multiple selects. |
| `b-if`, `b-else-if`, `b-else` | Adjacent first-match branches; whitespace/comments can separate them. Default dehydrates inactive branches; `.hide` preserves in DOM, `.detach` preserves outside DOM. |
| `b-for="item, index in $data.items"` | Arrays, iterables, objects, or nonnegative integers; values live in `$for`. |
| `b-key="$for.item.id"` | Stable string/number identity; duplicate keys throw. Index is the default key. |
| `b-html="trustedHTML($data.markup)"` | Replaces and hydrates children; `.raw` only inserts parsed HTML without Brio hydration. Always treat hydrated content as executable authored markup. |
| `b-ignore` | Skips hydration of the element and descendants. |
| `b-script` | Only on a script element; see required writing style below. |
| `b-effect="$data.observe($data.count)"` | Reactive expression, not a block of event-style statements. Avoid feedback writes. |
| `b-id="['input']"` | Creates `$id.input`; bind `id`/label `for` explicitly. |
| `b-template` | Unwraps a template or element into hydrated sibling nodes. |
| `b-teleport="'#portal'"` | Moves an element to an existing document selector; not a reactive destination expression. |
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
modes, or invent `.display`. Same-element `b-for` / `b-template` requires a
wrapper in preservation modes; nested structural directives remain supported.
`b-show` is removed, not deprecated: migrate former v4 `b-show` to
`b-if.detach`, and `b-show.display` to `b-if.hide`, reviewing conditions that
previously relied on local data or `$data.$parent`. Teleported descendants are
not hidden by hiding their source wrapper.
Avoid competing imperative writes to directive-owned children.

Events support `.prevent`, `.stop`, `.self`, `.outside`, `.window`, `.document`,
`.capture`, `.passive`, `.once`, `.debounce`, and `.throttle`.
Event debounce/throttle is fixed at 150ms; do not invent `.debounce.500`.
Do not combine passive listeners with preventDefault.
Model modifiers: `.lazy` (change), `.trim`, `.number` (parseFloat, retaining
non-numeric text). Text inputs and textareas preserve strings by default; do
not use `b-model.raw`, which is not supported. The `.raw` modifiers on `b-text`
and `b-html` control content hydration, not model value conversion.
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

Masks: `b-mask="'##/##/####'"`, or
`b-mask="money({ thousands: ',', decimal: '.', precision: 2 })"`, or
`b-mask.money="{ precision: 2 }"`. Money uses fixed-precision minor units;
`123456` formats to `1,234.56`. Options may be reactive. Do not assume a masked
`b-model` holds a numeric currency value; normalize it explicitly.

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
the caller's context. Optional `style` is scoped to component template elements.
Do not mutate props as an alternative to emitting a parent update.
Setup runs in an owned scope; `brio.onCleanup(...)` can register listeners,
timers, and other external resources there.

`state` observes plain objects/arrays, not arbitrary class instances.
Signals and computed values use `.value`; effects run synchronously by default.
`batch` groups synchronous writes. `createScope().run(...)` owns created effects;
dispose that scope. The app's state factory alone is not a scope.
ESM also exports `resource(fetcher)` from `briojs` and `briojs/reactivity`,
not the browser global. It starts fetching and exposes `data.value`,
`loading.value`, `error.value`, and `refetch()`. It does not automatically abort
requests, prevent stale responses, or block mounting. Display loading/errors
and choose explicit cancellation/stale-result handling for concurrent work.

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
  Matched same-origin links inside mounted roots use history navigation;
  external/unmatched/modified/download links retain normal browser behavior.
  Configure server fallback for direct SPA URLs. For MPAs, retain normal links.
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
  GET/DELETE objects become query parameters. Other object bodies become JSON;
  FormData, URLSearchParams, and strings are passed appropriately. Non-OK
  responses reject. Fetch options (including signal) and parser selection can
  be supplied. Implement visible errors, loading state, and request cancellation.
- Steps: `createStepEngine(steps)` returns named methods `setStep`,
  `isStepActive`, `nextStep`, `backStep`, `originStep`, `getActiveStep`.
  Supply a reactive steps record if UI reads active flags. Transitions require
  an active source and an existing destination; honor boolean results.
  `keep` preserves the source's active flag, so multiple steps may be active.

## Never invent or revive these APIs

No `newApp`, `newStepEngine`, app `$insert`, standalone `$parent`, implicit
bare state names, `props`/`emit` component aliases, Vue/React lifecycle hooks,
Vue-style directive syntax, `$nextTick`, or `$refs` API.
Low-level `hydrateRoot`/`hydrateNode` remain ESM-only; do not call them on
`window.brio`. Prefer mount/insert for application development.

## Trust and verification

Templates, `b-html`, and HTML insertion execute authored expressions/scripts.
`trustedHTML` is a trust assertion, not sanitization or a security boundary;
current `b-html` also accepts ordinary strings. Never bind untrusted HTML as
executable templates. Use `b-text.raw` for user content: default `b-text`
evaluates `${...}` embedded in returned strings. Both raw modifiers keep the
source expression reactive; raw HTML is not sanitized. Strict CSP disallowing
`unsafe-eval` is incompatible with runtime expression compilation.

Before shipping: test the actual rendered app and console errors, form value
types, keyed updates and nested contexts, conditional reset versus preservation,
insertion removal, unmount cleanup, and async failure behavior. Verify SPA direct
URLs and ordinary MPA links. Use the app's existing test/build tooling, not
assumed framework scripts in the consuming project.
