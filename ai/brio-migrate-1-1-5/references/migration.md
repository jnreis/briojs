# Brio 1.1.5 to 4.0.0 migration

## Feasibility and limits

Migration is feasible by rewriting the application's integration and templates.
**Replacing the script URL is not sufficient.** V4 is not backward compatible
with the 1.1.5 app object, context registries, or automatic expression resolution.
No compatibility build is provided.

The source baseline is the downloaded 1.1.5 browser artifact described in the
[legacy inventory](./legacy-api.md), whose mapped sources match `df5fbdc`.
The original target baseline is v4.0.0 through framework commit `d868d43`;
named stores and subtree providers below require this checkout's newer
Unreleased implementation. Check the application's
actual artifact and target declarations before following this guide.

Most ordinary bindings, events, loops, forms, and conditional UI can be
rewritten directly. The major redesign areas are asset registries, inherited
props, custom directives/hooks, async hydration, refs/slots, routing/network
fragments, persistence access, and transitions. Any application-specific use of
these needs an explicit compatibility decision and tests.

## 1. Bootstrap and ownership

Legacy startup publishes `window.brio.newApp` and emits `brio`. Applications
configure an app's registries and call `app.gc.$dom.hydrate(...)`.
V4 also emits `brio`, but publishes `createApp`; it does not automatically mount
your application's markup.

```js
const app = brio.createApp({
  state: () => ({ count: 0, increment() { this.count++; } }),
});
const mount = app.mount('#widget');
// Before removing the widget:
mount.unmount();
// Permanently stop the app:
app.dispose();
```

Use `brio.min.js` in production or `brio.dev.min.js` in development, not both.
Browser routing/persistence/validation now require the optional
`brio.router.min.js`, `brio.persistence.min.js`, and `brio.forms.min.js` scripts.
Load the needed scripts after the core and before mounting. HTTP and step remain
bundled; npm main-entry imports still expose every plugin and development helper.
Run bootstrap after the bundle and markup are available. ESM consumers can
import `createApp` from `briojs`; do not mix browser and ESM runtimes on a root.
For side-by-side migration testing, use separate pages/builds, not competing
`window.brio` globals.

V4 mount roots cannot overlap. Wrap root-level `b-if` / `b-for` in a stable
container. One app can mount multiple disjoint roots sharing `app.state`, or
use separate apps for isolated widgets. `unmount()` restores original markup;
`dispose()` also stops app plugins and permanently closes the app.
Raw DOM removal does not dispose an owner.

## 2. Resolve expressions, do not rename blindly

Legacy expressions could resolve bare names through `$each`, `$data`, `$props`,
`$store`, and `$tools`, and invoke some function-valued results automatically.
V4 compiles strict JavaScript with explicit context bindings and no `with`.

| Legacy usage | Target after resolving its actual owner |
| --- | --- |
| `count`, bare method names | `$data.count`, `$data.increment()` |
| `{{ count }}` | `${$data.count}` or `b-text="$data.count"` |
| `$each` collection fields | Explicit declared `$for.item` / `$for.index` |
| Root shared `$store` | App state for small apps, or an explicit reactive store registered in `createApp({ stores })` and read through `$stores.name` |
| Inherited general `$props` | Local/app state and explicit ancestry, or real component `$props` |
| `$el` | `$el` remains the current element |
| `$uid.name` | `$id.name` from `b-id` |
| `$refs.name` | Scoped DOM lookup or a component-owned reference |
| `$slots.name` | Component `<slot>` projection or explicit authored markup |
| `$cleanup(fn)` | `onCleanup(fn)` in a synchronous owned script/setup/plugin scope |
| `$dom`, `$set`, `$tools`, `$watch`, `$state`, `$effect`, `$http` | No automatic namespace in expressions; expose required operations as application methods |

A nested v4 `b-data` does not implicitly merge all app methods into its own
object. Navigate `$data.$parent`, or explicitly pass shared state/operations.
An app factory is plain initialization, not a cleanup scope.

In builds with named stores, shared state does not need to be copied into every
local scope:

```js
const shared = brio.state({ user: null, cart: [] });
const app = brio.createApp({ stores: { shared } });
// Markup: $stores.shared.cart.length, not legacy $store.cart.length.
```

Registration does not make a plain object reactive, own store effects, or add
persistence. Explicitly use `brio.state()` when migrating the reactive legacy
`$store`. Store names are fixed; store fields remain mutable. The same store can
be registered with multiple apps without being reset when one app disposes.
Use `b-provide="{ theme: $data.theme }"` / `$provided.theme` for deliberate
subtree sharing. This is not a rename of legacy inherited `$props`: identify
the actual owner and choose mutation, override and lifecycle behavior explicitly.

```html
<section b-data="{ count: 0 }">
  <button b-on-click="$data.count++; $data.$parent.total++">Add</button>
</section>
```

`$data.$parent` counts data boundaries; `$for.$parent` counts loop boundaries.
Ordinary wrappers and loops do not add a data boundary. Empty `b-data` does not
create local data. Components do create a data boundary. `$parent` metadata is
reserved/read-only; standalone `$parent` is not supplied.

Explicit calls matter: `b-on-click="$data.save"` does not call `save` in v4.
Use `$data.save($event)` when the method needs the event. V4 `b-effect` evaluates
a value expression; use a named method, not a statement block.

Imported ESM bindings are not lexical bindings in compiled HTML. Expose them
through state methods or component setup. Globals such as `Math` resolve
normally. Templates remain trusted executable code, not a sandbox. A CSP that
forbids runtime `new Function` remains a deployment blocker.

## 3. Directive conversion matrix

| 1.1.5 surface | v4 action / semantic check |
| --- | --- |
| `b-ignore` | Keep canonical name; it still stops hydration of the entire subtree. |
| `b-props` | Removed as a general data directive. Use app/local state or a registered component, not a rename to component `$props`. |
| `b-data` | Evaluate an object synchronously, e.g. `b-data="{ count: 0 }"` or an explicit factory call returning an object. Registered asset names and promises are not automatically resolved/awaited. |
| `b-each` | Rewrite into `b-for="item, index in $data.items"`; rewrite row bindings to `$for`. Add a stable `b-key="$for.item.id"` where identity matters. |
| `b-if` | Keep name but condition runs before branch-local data. False disposes after leave completes (immediately without a transition); reversal reuses the live branch, while activation after completed removal creates fresh local data. Wrap root structural directives. |
| `b-show` | Use **`b-if.hide`** for legacy display toggling. Conditions now run before branch-local data. `b-if.detach` instead detaches/reinserts the same live node; these differ for layout, queries, focus, observers, and form submission. V4 no longer supports `b-show`. |
| `b-html` | Supply actual authored HTML, not a legacy template registry name. It replaces/hydrates children; prefer components for reusable behavior. |
| `b-text` | Use an explicit value expression. Current builds hydrate `${...}` in its evaluated text without parsing tags; use `.raw` for literal/untrusted text. Never depend on combined `b-html` / `b-text` precedence. |
| `b-bind-*`, `bind-*` | Prefer `b-bind-*`; give an explicit expression. No empty-value inference. `.prop` forces property assignment; property/attribute and falsy-value semantics require tests. |
| `b-model` | Explicit assignable `$data.field`; type conversion and modifiers need special review below. |
| `b-mask` | Pattern string or `money(options)`; legacy registries, token meanings, and callback masks are not drop-in compatible. |
| `b-uid` | `b-id="['input']"` then explicit `b-bind-id="$id.input"` / label `b-bind-for="$id.input"`. |
| `b-ref` | Removed. Use scoped queries or component setup; no v4 `$refs` collector. |
| `b-slot` | Removed as a registry. Use named component slots and `slot="name"` on caller content. |
| `b-template` | Unwraps its own authored children only; its value does not select a registered template. It replaces the host with hydrated siblings. |
| `b-teleport` | Explicit selector expression such as `b-teleport="'#portal'"`. Destination must exist; dispose the original owner before removing it. |
| `b-script` | Inline function expression on a script element only; no registry name/array/src loader. Async script completion no longer delays the rest of mounting. |
| `b-style` | Removed. Use static CSS, scoped component `style`, or explicit `b-bind-style`. |
| `b-save`, `b-hydrate` | Removed asset-preprocessing contract; move saved templates/scripts/styles to explicit application definitions/imports. |
| `b-load-once` | No v4 script-loader equivalent; control asset loading through normal application boot/imports. |
| `b-transition` | Rewrite the two-selector expression into named CSS classes. Historical comments mention play/reverse aliases, but they are not registered in this build. |
| `b-on-*`, `on-*` | Prefer `b-on-*`, explicit calls, dot modifiers; translate old options deliberately. |
| Intersection / resize | Keep event names; current builds accept keyed observer `b-options` for root/rootMargin/threshold, document, and box. Update payloads to `$entry` / `$size`. |
| `b-effect` | Explicit expression such as `$data.observe($data.count)`; synchronous dependencies and feedback writes need review. |

V4 has no general custom directive registration API or general legacy `b-options`
processor; current `b-options` applies specifically to observer directives. Unrecognized legacy attributes can remain inert without an error.
Search for leftovers as well as testing visible behavior.

New v4 conditional chains use adjacent `b-else-if` and `b-else`, with
whitespace/comments allowed between branches. Do not synthesize branches that
alter the original conditions' precedence.
Use `.hide` or `.detach` only on the leading `b-if`, not on else branches.
These preservation modes hydrate every branch once at initial mount, run all
setup/scripts immediately, and keep inactive effects/listeners live. Use a
concrete branch element; wrap same-element loops/templates. Conditions always
see parent data before branch-local `b-data` and providers; review legacy
expressions that relied on the element's own local data rather than blindly
renaming the directive. Former v4 `b-show` maps to `b-if.detach`;
`b-show.display` maps to `b-if.hide`. Neither old name is a compatibility alias.
Legacy conditional updates are deferred; v4 selection updates synchronously.
With a leave transition, current v4 also keeps the branch hydrated until
completion. Reversing leave reuses the same branch and its state; after completed
removal, activation creates fresh state. Test exiting form events, reversal,
cleanup timing, and focus rather than assuming the old transition engine's behavior.

Legacy row alias reassignment can write back to the collection. In v4,
`$for.item = replacement` does not replace the source collection entry:
update `$data.items[$for.index]` explicitly (resolving the correct data owner),
or mutate the item's actual fields.

### Models and values

Legacy model typecasting is not the v4 default. V4 ordinary inputs store strings;
single checkboxes store booleans; checkbox-array membership follows the model's
array, not merely the number of same-name controls.

- Use `.number` only if `parseFloat` semantics are intended. It is not a general
  JSON parser and keeps nonnumeric text unchanged.
- `.trim` trims text; `.lazy` uses change rather than input.
- Legacy `b-options` model `raw: true` needs no v4 modifier: plain v4 text
  already stays text. Remove that legacy option rather than replacing it with
  `b-model.raw`, which is not supported in v4 (and was not a registered legacy
  directive). The `.raw` modifiers on `b-text` and `b-html` concern content
  hydration, not model value conversion.
- Preserve existing defaults in state before mounting; do not rely on the input
  markup to populate them.
- Test numeric radios/checkbox arrays separately: DOM values are strings, and
  model-to-DOM matching does not automatically coerce them to numbers.
- Write explicit parsing/validation for legacy booleans, nulls, numeric formats,
  or serialized values, without accepting malformed values silently.
- Legacy text models suppress updates during composition; do not assume the
  same IME timing in v4's model handler. Validate composition in a real browser.

### Bindings, events, and observers

V4 binds an available DOM property by default (except `aria-*` / `data-*`);
otherwise null/undefined/false remove the attribute, while zero and empty text
are actual values. Classes accept strings, arrays, or boolean maps, preserving
static classes. Style objects clear removed dynamic properties.

Normal DOM events support `.prevent`, `.stop`, `.self`, `.once`, `.capture`,
`.passive`, `.window`, `.document`, `.outside`, `.debounce`, `.throttle`.
Debounce/throttle are fixed at 150ms. Do not invent `.debounce.500`.
Component-host event handling does not implement these DOM modifier behaviors;
handle prevention/filtering explicitly or attach to an ordinary element.

Translate `b-on-click-prevent` to `b-on-click.prevent`, not a new event named
`click-prevent`. Old `b-options` objects are keyed by the complete directive
attribute. `.signal` and old keyboard `keys` options are not supported v4
modifiers; use an explicitly owned native listener or application filter.
Preserve the intended exact event names when removing hyphen options.

Intersection handlers use `$entry`; resize handlers use `$size.width`,
`$size.height`, and `$entry`. Current observer `b-options` supports
root/rootMargin/threshold, mutation target/subtree, resize document/box, and
numeric debounce delays. Dot `.debounce` is 100ms and overrides configured
delays. These additions require the current bundle, not the original v4 baseline.
Old observers debounce even without an option; v4 debounce is opt-in.
Old resize payloads are border-box `[width, height]` arrays; v4's
object describes the selected box (content-box by default). Convert destructuring and measurements, not just
the payload's name.

## 4. Factories, components, scripts, and styles

Replace shared data/props factories with app state or named application factory
methods. A v4 `b-data="$data.makeLocal()"` must return a plain object immediately.
Preload async state before mounting or initialize loading/error state and update
it explicitly; never hand `b-data` a promise.

Replace a reusable registry template with a component when it owns behavior:

```js
app.component('counter-card', {
  template: '<button b-on-click="$data.increment()">${$props.label}: ${$data.count}</button><slot></slot>',
  setup({ $props, $emit, el, app }) {
    return {
      count: 0,
      increment() { this.count++; $emit('change', this.count); },
    };
  },
});
```

Use `<counter-card b-bind-label="$data.label">...</counter-card>`. Setup is
synchronous and scope-owned. Static props are strings; bound props are reactive.
Emit parent updates rather than mutating props. Projected content retains the
parent context; named slots use `<slot name="actions">` and `slot="actions"`.
Do not mechanically move arbitrary host directives onto component tags:
place conditions/models/other unsupported directives on a normal wrapper or
inside the component template.

```html
<script b-script>
  ($context) => {
    const listener = () => { $context.$data.ticks++; };
    window.addEventListener('pulse', listener);
    $context.onCleanup(() => window.removeEventListener('pulse', listener));
  }
</script>
```

Migrate bare script statements, names, arrays, and fetched scripts into explicit
application functions/imports or this function-expression form. Prefer the
unassigned arrow form shown. Register cleanup before awaiting; use cancellation
or a disposed guard for late async results. Mounting does not await async
`b-script`, so initialize template-visible fields first.

Move dynamic scoped styles into a component's `style` definition. Static/global
styles belong in the application's normal stylesheet pipeline. Any application
owned style element must be removed when its owner is disposed.

## 5. Insertion and hydration

Legacy `$dom.insert` is content-first; v4 is target-first:

```js
const handle = app.insert('#items', 'append',
  '<button b-on-click="$data.count++">${$data.count}</button>');
handle.remove();
```

In expressions/scripts use `$insert(...)` / `$context.$insert(...)`, not app `$insert`.
Targets must belong to a mounted app root. Child placements inherit the target;
sibling placements inherit its parent. `options.data` supplies an explicit local
data scope. Strings are trusted/hydrated internally; nodes/fragments are cloned.
`textContent` is literal text, with no interpolation.

| Old placement | V4 placement |
| --- | --- |
| `outer` | `replaceWith` |
| `inner` | `replaceChildren` |
| `first` | `prepend` |
| `last` | `append` |
| `before` / `after` | Same |
| `text` | `textContent` |

Do not carry over template-name resolution, promised content, script loading,
document/head/body replacement, selection, or hydrate/then options. Resolve
authored content yourself; use normal deployment for scripts/styles. V4 insertion
returns a synchronous owned handle, not the legacy async completion contract.

No sibling replacement of mount roots, direct replacement of generated
`b-if`/`b-for` rows, or child writes to ignore/text/html/router-controlled
containers. Use an appropriate enclosing container. Failed replacement does
not restore the old content; assess destructive operations before execution.
ESM-only `hydrateRoot` / `hydrateNode` are not substitutes for app ownership and
are not on `window.brio`; application migrations should use mount/insert.

## 6. Reactivity, shared state, and extensions

V4 `state` supports plain objects/arrays, not a generic reactive class instance
or a legacy parent/options argument. Signals and computed values expose `.value`.
Effects run synchronously by default, recollect dependencies, and return a stop
function. `batch` groups synchronous writes. There is no public legacy `watch`
or listener-priority contract; implement only the required watch behavior with
an owned effect, explicitly choosing initial-run and old-value semantics.
The legacy effect's optional dependency function and listener priority cannot
be passed unchanged as the v4 options object. Legacy state can return a primitive
unchanged; v4 `state(primitive)` throws, so use `signal(primitive)` deliberately.

Use component setup, app plugins, or `createScope().run(...)` to own effects and
external resources. A plugin is a function receiving the app; call `onCleanup`
synchronously during installation. An app state factory is not scope-owned.

App plugins cannot register arbitrary hydration handlers into a v4 directive
pipeline. Reimplement necessary custom directives/hooks as scoped component or
application code with explicit event/lifetime semantics. Flag unsupported
extensions instead of fabricating `$set` or mutating internal maps.

V4 steps use `createStepEngine(reactiveSteps)` with named methods; no legacy
`newStepEngine` exists. Step navigation was not a built-in 1.1.5 browser helper:
do not treat it as an automatic replacement for application navigation.

## 7. HTTP, validation, persistence, routing, transitions

### HTTP and forms

| Legacy method / registration | V4 replacement |
| --- | --- |
| `$set.data`, `$set.props` | Explicit app state/factory methods, local `b-data`, or component setup |
| `$set.template`, `$set.script`, `$set.style` | Component definitions, application imports, static/scoped CSS |
| `$set.mask`, `$set.maskTokens` | No registry equivalent; supported patterns or an explicitly owned input formatter |
| `$set.route`, `$set.router`, `$set.routeRules` | Normal MPA navigation or an approved component-router redesign |
| `$dom.hydrate`, `$dom.dehydrate` | Mount handles/app unmount; insertion handles for inserted content |
| `$dom.insert` | `app.insert` / contextual `$insert`, with a different signature/result |
| `$dom.query`, `$dom.queryAll` | Native queries scoped to the owning root/component |
| `$dom.context` | No public v4 equivalent; track state/references explicitly |
| `$dom.emit`, `$dom.listen` | Native CustomEvent/listeners with owned cleanup, or component `$emit` |
| `$tools.hasProp`, `getProp`, `setProp` | Application/native object operations after checking default/descriptor semantics |
| `$tools.sync`, `$tools.clone` | Deliberate application-specific synchronization/copying with identity and value-type tests |
| `$tools.validate` | New schema-based validator contract below |
| `app.exec`, `ctxArgs`, `evalEffect`, `bnode`, `bnodes`, `directives` | No supported application equivalent for the old internals |

Do not replace legacy clone/sync helpers with an untested JSON round trip or
`structuredClone` of a reactive proxy. Those can lose value types/descriptors or
throw. Choose copying versus in-place updates based on actual consumers.
Likewise, native event names and cancellation differ from legacy `$dom.emit`;
preserve the production event contract deliberately.

Expose `brio.http` through app methods, not `$http` in markup. V4 provides
get/post/put/patch/delete (not head). Fetch options and parsers are supported;
non-OK responses reject. GET/DELETE object arguments become query parameters;
other object bodies become JSON. Do not assume nested query encoding, response
wrappers, header preservation, or DELETE body behavior match 1.1.5.
In particular, legacy object POST bodies without a content-type override are
URL-encoded, not JSON. If the endpoint expects form data, build a
`URLSearchParams` or `FormData` body explicitly for v4.
Legacy no-parser responses attempt JSON parsing of text regardless of headers;
v4 chooses JSON by content-type. Request `{ parser: 'json' }` explicitly where
the old backend returns JSON with a non-JSON header.
Legacy errors carry parsed `error.content`; v4 only attaches `error.response`.
Read the error response explicitly when the app needs its body and handle parse
failure visibly.

Legacy `$tools.validate(data)` creates an object whose `prop()` / `rule()`
methods register rules and whose `validate()` updates `.errors`.
V4 `validate(data, schema, customRules)` returns `true` or
`Record<string, string[]>`, and schema entries are arrays of
`{ name, value?, message? }`. Built-ins: required/min/max/email/same/in.
Convert legacy schemas and provide custom rules for missing validators.
Unknown rules warn and are skipped, so leaving old rule names can incorrectly
accept data. Test exact boundaries, messages, and server-side validation.

```js
// Legacy:
const oldValidator = oldApp.gc.$tools.validate(data);
oldValidator.prop('email', ['required', 'email']);
const oldValid = oldValidator.validate();
// V4:
const result = brio.validate(data, {
  email: [{ name: 'required' }, { name: 'email' }],
});
const valid = result === true;
const errors = valid ? {} : result;
```

V4 does not supply the old validator object's mutable `.errors` field or
automatic old messages. `matches` / `type` need custom rules; required/email
acceptance differs (including whitespace and empty containers).

### Persistence

Do not infer persistence from legacy `$store`: it starts as `state({})`, not an
automatically serialized store. Inventory actual storage accesses/helpers first.

V4 `persist(key, initial, { storage })` requires component/plugin/explicit scope.
It returns reactive objects/arrays directly and signals for primitives. Default
storage is local; select `'session'` or a getItem/setItem adapter explicitly.
It writes JSON and can throw on malformed data/unavailable storage.

Do not change keys/shapes in place. Decide compatibility using real sanitized
payload samples and a rollback plan. For a format conversion, prefer a new
versioned key and an explicitly approved adapter with validation.
Do not claim same-tab or cross-tab behavior from a rename alone.

### Routing

Preserve normal links for a multi-page project. V4 routing is component-based:
`createRouter([{ path: '/', component: 'home-page' }])`, passed into `createApp`,
with registered components and a `b-router-outlet`.
It does not fetch and transplant server HTML, assets, or head metadata.

Choose deliberately between normal MPA navigation and a real SPA rewrite.
Route state is `router.current.value`; parameter patterns are `:id` without
legacy custom rule suffixes. Add explicit parameter validation when needed.
Unmatched `navigate()` returns false; implement an explicit fallback.
Verify direct URLs/server fallback, history, queries/fragments, titles, scroll,
focus, authenticated errors, and modified/external/download links.

### Transitions and masks

V4 transitions use six classes for a chosen name: `fade-enter`,
`fade-enter-active`, `fade-enter-to`, `fade-leave`, `fade-leave-active`,
`fade-leave-to`, activated by `b-transition="'fade'"`.
Use CSS transitions, not keyframe animations. Old play/reverse logic and timing
options need application-specific redesign; test reversal in a real browser.

V4 patterns use `#` / `9` for digits and `a` / `A` for ASCII letters; other
characters are literals. Custom Unicode/alphanumeric legacy tokens are not
equivalent. Implement needed formats explicitly rather than silently replacing
them. Convert simple fixed counts such as `#2/#2/#4` to `'##/##/####'` only
when ASCII digit input is acceptable. `?`, `+`, escapes, per-field tokens, and
callback formats have no equivalent pattern grammar.
Money uses minor units and `thousands`, `decimal`, `precision` options;
mask/model values remain formatted strings unless explicitly normalized.
Test old monetary payloads, negatives, rounding expectations, paste, caret,
and deletion around literals before adopting the new formatter.
Typing `123456` formats as `123,456` in the old formatter but `1,234.56` in v4.
This is verified by the paired fixtures: preserve the old amount interpretation
with an explicit formatter/input adapter or obtain approval for the UX change.

## Completion criteria

Follow the [verification checklist](./verification.md). The
[paired examples](./examples.md) demonstrate a small flow only; they do not
assert compatibility for removed registries, extensions, fetched pages, or
application business rules. Report unsupported behavior before deployment.
