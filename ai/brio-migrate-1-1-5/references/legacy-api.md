# Verified Brio 1.1.5 inventory

This describes the **old** runtime, not APIs to use in v5. Pair it with the
[migration guide](./migration.md). Do not infer an app's behavior solely from a
version-looking filename or a changelog entry.

## Evidence and provenance

The user-provided browser bundle and map were inspected locally:

| Artifact | Bytes | SHA-256 |
| --- | --- | --- |
| `briojs.1.1.5.min.js` | 28013 | `34f67bd85c28daa96311375a3599de4b8ab68db94e590d5129f60230c4b36886` |
| `briojs.1.1.5.min.js.map` | 305116 | `9af05db3ad94e2c0a3585d7ed92a2adb4ad2259ecf2b0add3bbdd848e19f0ac6` |

All 44 embedded `sourcesContent` entries match their corresponding source files
at `df5fbdc`. This establishes the map's source baseline, not independent proof
that arbitrary future downloads bearing the same name are identical.
The legacy artifact is not included in this portable kit or the npm package.

Source paths below are the original paths recorded in that map. They are
evidence labels, not links to today's differently structured source tree.
Use the actual map or `git show df5fbdc:<path>` when investigating a discrepancy.

## Browser and app

Evidence: `src/briojs.min.ts`, `src/app.ts`.

- Browser setup installs non-changeable `window.brio`, initially providing
  `newApp()`, and dispatches `brio` on `window`. If a `brio` global already
  exists, legacy setup does not install another runtime.
- The browser `newApp()` wrapper registers the complete bundled directive set,
  built-in money mask, and default mask tokens.
- Setup installs storage and popstate listeners. A configured route callback is
  global to setup; do not assume isolated modern per-mount routers.
- Returned app keys: `template`, `style`, `script`, `props`, `data`, `directives`,
  `bnodes`, `masks`, `maskTokens`, `routes`, `routeRules`, `gc`, `exec`, `ctxArgs`,
  `evalEffect`, and `bnode` (creation/lookup helper pair).
- There is no top-level `app.mount`, `app.dispose`, `app.state`, or
  `app.insert` contract in this downloaded build. DOM operations live under
  `app.gc.$dom`.
- App contexts and registries are implementation-coupled, not a stable
  compatibility layer that v5 reproduces.

### Global expression context (`app.gc`)

| Entry | Legacy contract |
| --- | --- |
| `$dom` | `hydrate`, `dehydrate`, `insert`, `route`, `emit`, `listen`, `query`, `queryAll`, `context` |
| `$set` | `route`, `router`, `routeRules`, `template`, `style`, `script`, `props`, `data`, `mask`, `maskTokens` asset/configuration setters |
| `$store` | Shared reactive `state({})`; **not automatically persisted storage** |
| `$state` | Legacy reactive state constructor |
| `$watch` | Legacy change watcher |
| `$effect` | Legacy dependency-tracked effect |
| `$http` | Legacy request helper |
| `$tools` | `hasProp`, `getProp`, `setProp`, `sync`, `clone`, `validate` |

`$dom.context(target)` queries the element and returns its registered BNode's
`ctx`, or undefined. That DOM-context introspection API is not supplied by v5.
`$dom.hydrate(nodeOrSelector, contextNodeOrSelector?)` is asynchronous;
scripts/directives may delay completion.
`$dom.dehydrate(node, removeNode = true, removeBNode = true)` cleans a subtree.
`$set` asset setters take `(name, value)`; `$set.route` takes `(path, handler)`.
`$dom.insert(content, placement, target, { select?, hydrate?, then? }?)` is async,
accepts authored strings/nodes/promises and registered template names, and can
replace document-level content. It has no managed removal-handle result.
`$dom.listen(target, name, callback, options?)` returns a disposer.
`$dom.emit(target, name, detail?)` normalizes the event name to lowercase
alphanumerics and dispatches a bubbling, cancelable CustomEvent. Brio 5 component
emits retain valid hyphenated names and are not cancelable by default; check
listeners that depended on legacy normalization/cancellation.

### Local BNode context

| Entry | Meaning |
| --- | --- |
| `$el` | Current element; **there is no `$` alias** |
| `$uid` | Generated identifier map inherited from a parent |
| `$props` | Reactive props context with inheritance |
| `$data` | Data context |
| `$refs` | Data-level element reference map |
| `$slots` | Data-level slot-content map |
| `$each` | Repeated-item context |
| `$cleanup(fn)` | Registers BNode cleanup |

Ordinary expressions can infer matching bare identifiers through the legacy
context resolver. `$uid`, `$refs`, and `$slots` require explicit references in
1.1.5. Function-valued results can be called by directive evaluation. Text
interpolation accepts both `{{...}}` and `${...}`; parsing is limited and is not
a general JavaScript template parser.

## Registered directives

Evidence: `src/directives/index.ts` and the corresponding directive modules.
The complete set is installed in this order:

| Order | Directive / family |
| --- | --- |
| 1-7 | `b-ignore`, `b-if`, `b-props`, `b-data`, `b-each`, `b-uid`, `b-template` |
| 8-13 | `b-show`, `b-teleport`, `b-script`, `b-html`, `b-text`, `b-style` |
| 14-17 | `b-bind-*` / `bind-*`, `b-model`, `b-mask`, `b-transition` |
| 18-21 | Intersection, resize, DOM events, `b-effect` |

`b-options` is processed by hydration to supply directive option objects.
It is keyed by the complete attribute name, for example:

```html
<input b-model="quantity" b-options="{ 'b-model': { raw: true, lazy: true } }">
<button b-on-click-prevent="save"
        b-options="{ 'b-on-click-prevent': { debounce: 400 } }">Save</button>
```

It is not a separate rendering directive. There is **no registered `b-boost`**
in this downloaded build (only a commented registration placeholder), no
`b-for`, `b-key`, `b-id`, `b-else-if`, `b-else`, router outlet, or step engine.
Do not attribute later-version features to 1.1.5.

### Context and structural behavior

- `b-props` and `b-data` establish contexts using inline expressions or app
  assets. Props inheritance and data boundaries differ; converting both into
  v5 component props would change state ownership.
  Asset factories receive the parent/current context object and are awaited.
  Returned properties/descriptors are copied into the established context.
- `b-each="item, index in items"` parses aliases and evaluates the collection,
  supporting arrays, objects, or numeric repetition. If the index alias is
  omitted it defaults to `index`. Row fields are `$each.item` / `$each.index`.
  It updates by collection key/index with create/update/delete callbacks;
  this is not a stable item-identity diff. There is no independent public `b-key`.
- Row item reassignment can write through to the legacy collection; v5 loop
  alias assignment does not provide this same writeback contract.
- `b-if` uses a placeholder and hydrates a cloned branch; false removes and
  dehydrates its instance, after the transition callback when one is present.
- `b-show` preserves bindings and toggles **display**, rather than detaching the
  subtree. Its closest current v5 display behavior is `b-if.hide` (with
  conditions evaluated before branch-local data).
- `b-template` replaces its host with template content, allowing multiple roots.
  It cannot preserve all host-bound directives. Template registration and
  inserted HTML also participate in legacy asset lookup.
- `b-teleport` relocates content, so DOM ancestry and context ancestry differ.
- `b-ignore` prevents both element and descendant hydration.

### Content, assets, references, IDs

- `b-html` inserts reactive HTML with hydration; `b-text` inserts text. In legacy
  dispatch, `b-html` takes priority when both are present.
- `b-script` accepts registered scripts, arrays, inline/external script content,
  and awaits sequential execution. It is not equivalent to v5's inline
  function-only script processing.
- `b-style` creates style content adjacent to the directive host.
- `b-ref` stores the actual element in `$refs[name]`; duplicate names overwrite.
  `b-slot` removes its host and stores outer HTML in `$slots[name]`. Both are
  scanned at data-context hydration, not standalone directive registrations.
- `b-uid="['input']"` creates an identifier map used through `$uid.input`;
  it does not itself set the DOM `id`.
- `b-save="name"` registers scripts/styles/templates during hydration.
  Saved elements are removed unless `b-hydrate` is present. This preprocessing
  is separate from the registered directive list.
- `b-effect` uses legacy effect/expression resolution.

### Binding, model, events, observers, masks, transitions

- Binding matcher: `/^(b-bind-|bind-)[\w-$]+$/`. Empty values can infer the bound
  property name; legacy `.prop`-style options can force a property assignment.
- Event matcher: `/^(b-on-|on-)[\w-]+$/`. Dots are not accepted by these matchers;
  v5 dot modifiers cannot be copied back into the old app.
- Event options: capture, once, passive, signal, prevent, stop, self, outside,
  document, window, debounce, throttle, and keyboard `keys`.
  Hyphen suffixes after the event provide quick boolean options.
  Numeric timings and keyboard sets come from option objects; do not invent
  `.debounce.300`.
- Special observer event families: enter, exit, resize, each owned by BNode
  cleanup. Intersection forwards root/rootMargin/threshold and once options.
  Both families debounce by default at 100ms. Resize can observe the document
  element and pass observe options; its `$size` is a border-box `[width, height]`
  array, not v5's content-rectangle object.
- Model supports input/textarea/select, checkbox/radio/group behavior, and
  lazy/trim/raw options. Unless `raw` is enabled, it attempts JSON typecasting,
  so numeric/boolean/null-looking strings need explicit compatibility handling.
- Masks use app `masks` / `maskTokens` registries, string or function-driven
  masks, and a built-in money formatter. The old callback's context differs from
  v5's formatter-function contract. Default legacy tokens are `#` (Unicode decimal
  digit), `&` (Unicode letter), and `*` (Unicode letter/digit). Numeric quantifiers,
  `?`, `+`, and escapes are part of the old pattern parser.
- `b-mask="money"` selects the registered formatter; decimal/thousands/precision
  options come from `b-options['b-mask']`. It interprets the integer part as
  major units and an explicitly typed decimal part, not fixed-precision cents.
- Only `b-transition` is actually registered. A dispatch comment mentions
  `b-transition-play` / `b-transition-reverse`, but these names are not matched
  by the bundled directive entry. Its expression supplies two CSS selectors,
  e.g. `b-transition="['.in', '.out']"`, on an element with `b-if` or `b-show`.
  It extracts selector styles and handles `transitionend`, not the v5 six-class
  protocol. Do not infer animation support from stale comments.

## Tools, HTTP, storage, routing, extensions

### HTTP

Evidence: `src/methods/http.ts`.

Verified methods: `get`, `post`, `put`, `patch`, `delete`. No `head`.
Calls accept an endpoint, body/parameters, and options including parser/headers.
The old helper encodes nested parameters and has JSON, form-data, and
URL-encoded body branches. Object POST/PUT/PATCH bodies default to URL encoding
unless a JSON/form-data header selects a different branch.
GET and DELETE append parameters to the URL.

Success returns **content directly**, not a response wrapper. With no parser,
the helper reads response text and attempts JSON parsing even without a JSON
content-type header. With a parser, it invokes that response method directly.

On non-OK responses it throws an Error carrying native `error.response` and
parsed/raw `error.content`. Brio 5 also rejects, but does not populate legacy
`error.content`; review UI error-message extraction and empty responses.

### Reactivity and storage

Evidence: `src/reactivity/state.ts`, `effect.ts`, `watch.ts`, `storage.ts`.

`$state(target, options?)`, `$effect(listener, dependencies?, priority = 0)`,
and `$watch(state, propertyOrFalsy, listener, priority = 0)` are available
through `gc`. Watch returns a disposer; a falsy property other than numeric zero
watches the whole container. Listener contexts contain operation/property/
old/new values. Legacy listener cleanup, explicit dependency selection and
priority differ from v5's effects/scopes. No public `persist`, `session`,
or `storage` method is present on the downloaded browser app/global. The
embedded storage module and storage-event listener do not make `$store`
automatically persistent. Verify whether the production app uses ESM-only
storage helpers, custom wrappers, or direct Web Storage.

### Routing

Evidence: `src/methods/route.ts`, `src/methods/dom.ts`, `src/app.ts`.

The runtime constructs `newRouter(routes, routeRules, insert)` internally,
returning `[setRoute, route]`. Public app usage is through `$set.route`,
`$set.routeRules`, `$set.router`, and `$dom.route`, not a v5 `createRouter`.
Routing integrates with HTML insertion and configurable route rules.
`$set.route('/items/:id:number', ({ params, path, remove }) => ...)` registers a
handler. Dynamic suffix rules consult `routeRules`. A matching route calls its
handler; an unmatched same-origin path fetches HTML and swaps the document,
then pushes pathname history. Cross-origin navigation redirects.
The returned result is true for a match, false for the fetch/swap fallback,
or null for a redirect; false does not mean "nothing happened."
Do not infer its usage from the unregistered `b-boost` attribute.

### Validation

`$tools.validate(data)` returns a validator object with
`prop(name, rules)`, `rule(name, callback, message?)`, `validate()`, and mutable
`errors`. Rules accept strings or `{ name, value, message }` objects.
`validate()` returns a boolean and refreshes that object's errors.
Built-ins are required/min/max/email/same/in/matches/type.
Legacy `required` accepts zero and otherwise uses truthiness (including
whitespace and empty containers). Brio 5 required semantics are stricter.

### Extensions and cleanup

Custom directive entries have shape `[string | RegExp, hydrateFunction]` in the
app's directive registry. Assets/masks/tokens are also configurable. Custom
functions may depend on BNode internals, `exec`, context generation, or cleanup
arrays; there is no supported v5 translation of those internals.

BNodes keep cleanup callbacks for effects, events, observers, masks, scripts,
and transitions. Hydration/dehydration, structural replacement, and async
script ordering are part of application behavior, not merely API spellings.
The [verification checklist](./verification.md) must cover these lifetimes.
