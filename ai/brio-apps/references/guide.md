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
`batch`, `createScope`, `onCleanup`, `persist`, `createRouter`, `createStepEngine`,
`validate`, `http`, and `trustedHTML`. The development bundle also contains
`devtools`, `inspectDevtools`, and `devtoolsPanel`; production omits the inspector,
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

`createApp` accepts `state` (a factory), `components`, `router`, and `plugins`.
`app.component(name, definition)` and `app.plugin(plugin)` return the app.
Mount targets are elements or selectors; roots cannot overlap, even across apps.
Separate apps isolate state; multiple roots of one app share `app.state`.
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
| `trustedHTML` | Explicit HTML trust assertion, not a sanitizer. |
| `onCleanup` | Script cleanup helper; use synchronously in the active scope. |
| `money` | Mask-specific formatting descriptor helper. |

The context is also accessible as `ctx`, especially in contextual scripts.
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

## Directive contracts

Prefer canonical `b-` names. Arguments use hyphens; modifiers use dots, never
Vue-style `:` or `@` syntax. Text interpolation is `${expression}`, not `{{...}}`.
Escape HTML-significant characters in literal text/attribute values.

| Directive | Contract |
| --- | --- |
| `b-text="expr"` | Sets text content; descendants are not hydrated. |
| `b-bind-href="expr"` | Binds a DOM property when available, otherwise an attribute. `null`, `undefined`, and `false` remove attributes. |
| `b-bind-class="expr"` | Accepts strings, arrays, or class-name/boolean objects. |
| `b-bind-style="expr"` | Supports style objects. |
| `b-on-click="statements"` | Executes event statements; listeners are scope-owned. |
| `b-model="$data.field"` | Assignable input/textarea/select state; supports checkboxes, radios, and multiple selects. |
| `b-if`, `b-else-if`, `b-else` | Adjacent conditional branches; whitespace/comments can separate them. |
| `b-show="$data.visible"` | Detaches without disposing local state or bindings. `.display` uses `display: none`. |
| `b-for="item, index in $data.items"` | Arrays, iterables, objects, or nonnegative integers; values live in `$for`. |
| `b-key="$for.item.id"` | Stable string/number identity; duplicate keys throw. Index is the default key. |
| `b-html="trustedHTML($data.markup)"` | Replaces and hydrates children. Always treat the content as executable authored markup. |
| `b-ignore` | Skips hydration of the element and descendants. |
| `b-script` | Only on a script element; see required writing style below. |
| `b-effect="$data.observe($data.count)"` | Reactive expression, not a block of event-style statements. Avoid feedback writes. |
| `b-id="['input']"` | Creates `$id.input`; bind `id`/label `for` explicitly. |
| `b-template` | Unwraps a template or element into hydrated sibling nodes. |
| `b-teleport="'#portal'"` | Moves an element to an existing document selector; not a reactive destination expression. |
| `b-router-outlet` | Renders the router's matched registered component. |

When `b-if` becomes false, local state, effects, and listeners are disposed
immediately; reactivation creates fresh local state. App/parent state survives.
Exit-transition DOM is an inert snapshot. Use `b-show` to preserve local state.
`b-if` conditions evaluate before that branch's `b-data`; ordinary directives
such as `b-show` evaluate in the element's resulting local data scope.
Avoid competing imperative writes to directive-owned children.

Events support `.prevent`, `.stop`, `.self`, `.outside`, `.window`, `.document`,
`.capture`, `.passive`, `.once`, `.debounce`, and `.throttle`.
Event debounce/throttle is fixed at 150ms; do not invent `.debounce.500`.
Do not combine passive listeners with preventDefault.
Model modifiers: `.lazy` (change), `.trim`, `.number` (parseFloat, retaining
non-numeric text). Do not assume checkbox/radio value coercion beyond current
model behavior; test the form's exact value types.

Observers: `b-on-enter`/`b-on-exit` receive `$entry`;
`b-on-resize` receives `$size.width`, `$size.height`, and `$entry`;
`b-on-addednodes`, `b-on-removednodes`, `b-on-attrs`, `b-on-text` receive
`$mutations`. Observer `.debounce` is fixed at 100ms; intersection also supports
`.once`. Resize/IntersectionObserver require browser support or app polyfills.
Text observers watch characterData, not every replacement of child text nodes.

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
  (ctx) => {
    const timer = setInterval(() => { ctx.$data.ticks++; }, 1000);
    ctx.onCleanup(() => clearInterval(timer));
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

In expressions/scripts use `$insert(...)` or `ctx.$insert(...)`, not
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
executable templates. Use `b-text` for user content. Strict CSP disallowing
`unsafe-eval` is incompatible with runtime expression compilation.

Before shipping: test the actual rendered app and console errors, form value
types, keyed updates and nested contexts, conditional reset versus preservation,
insertion removal, unmount cleanup, and async failure behavior. Verify SPA direct
URLs and ordinary MPA links. Use the app's existing test/build tooling, not
assumed framework scripts in the consuming project.
