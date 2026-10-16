# Migration execution and acceptance

## Inventory output

Before edits, produce an application-specific table:

| Location / flow | Actual 1.1.5 contract | v4 replacement | Behavior risk | Test / decision |
| --- | --- | --- | --- | --- |
| Bootstrap and roots | Ready event, `newApp`, hydration calls | Explicit `createApp` / mount | Double hydration, host interference | Root ownership |
| Templates and expressions | Owner, factory, bare identifiers | Explicit owner and calls | Wrong parent, uncalled function | DOM/state assertions |
| Dynamic HTML | Registry/network origin, scripts/styles | Components or trusted insertion | Executable responses, cleanup | Trust and removal |
| Storage | Keys, JSON shapes, defaults, tab updates | Scoped `persist` or app adapter | Data loss, rollback incompatibility | Old payload reads |
| Navigation | Normal links, routes, boost response contract | Preserve MPA or explicit SPA redesign | History/server behavior | Direct URLs/back |
| Forms | Value types, masks, validation, API errors | Explicit normalization and rules | Changed acceptance / payload | Boundary cases |
| Extensions | Hooks, custom directives, methods | App code / scoped components | No registry equivalent | Per-extension tests |

Inventory all occurrences, including fetched fragments, registered assets,
partials, server templates, scripts embedded in HTML strings, and routes not
visited by the initial page. Classify a surface as unused only after checking
its callers and generated markup.

## Acceptance checklist

- **Boot:** v4 available before bootstrap, DOM available before mount, exactly
  one owner per root, no old global readiness handler remains active.
- **Ownership:** sibling widgets and host controls unchanged; explicit parent
  data/loop chains verified; unmount/remount does not duplicate listeners.
- **Shared values:** named stores explicitly reactive where intended, exact
  identity shared across apps, disposal does not reset another app's store.
  Provider overrides, live updates and slot/teleport context boundaries tested.
- **Expressions:** no reliance on bare state names, old contexts, automatic
  function-path invocation, async data factories, or unprovided ESM bindings.
- **Loops:** empty/object/array cases, insert/delete/reorder, duplicate identities,
  nested loop and local state semantics. Stable keys are unique strings/numbers.
- **Templates:** multi-root/text output moves and disposes as a range; check keyed
  row identity/IDs, conditional cleanup, detach/reinsert with live updates,
  teleport destination ordering, managed insertion cleanup, and nested fragments.
  `.hide`/group transitions need concrete branches; mount roots cannot unwrap.
- **Refs:** `$ref` (not `$refs`) uses literal b-ref names and local-only registries
  per mount/data boundary/component/row. Check duplicate errors, safe missing reads,
  raw native APIs, setup hydration timing, slot author ownership, reactive membership,
  keyed retention, leave cleanup, detach retention, teleport and unmount. Preserved
  or overlapping branches need distinct names or separate data scopes.
- **Teleport:** expressions return Elements/refs, selector strings, or exact
  `[target, placement]` pairs. Verify default `after` vs explicit `append`, all
  used placements, late/missing/replaced refs and source fallback, local lookup,
  keyed ordering per target/placement and hidden retarget/reconnect. No bare ref
  names, `.ref`, or selector DOM observer. Target removal must not dispose
  independent source-owned output; selector-only destinations need explicit
  source/target lifetime coordination.
- **Conditions:** false disposes effects/listeners after leave completion
  (immediately without a transition); reversal reuses the live element and state,
  while activation after completed removal resets local state.
  Preserved `b-if.hide` / `b-if.detach` state and focus
  behavior checked, including parent-context conditions and eager setup of all
  branches in preservation-mode chains.
- **Forms:** input/change/submit, checkbox arrays and radio types, multiple
  selects, blank/NaN/zero/false values, initial values, composition/paste,
  masks/caret, validation messages and the exact server payload.
- **CSS:** legacy style-loader directives replaced with ordinary stylesheets or
  native inline @scope. Check browser support, physical parent roots/limits,
  b-id selector interpolation, global animation names, custom-property updates,
  slots/templates/teleport, and stylesheet connectivity through hide/detach,
  completed leave, insertion removal, and restored markup after unmount.
- **Insertion:** all used placements; root/container restrictions; authored
  HTML versus plain text; removed nodes no longer respond; no network script
  loader or head/body replacement assumed.
- **Cleanup:** timers, window/document listeners, observers, requests, widgets,
  and persistence stop on their intended owner lifetime. Register cleanup before
  `await`; guard late results. Raw DOM removal is not unmount.
- **Storage:** sanitized old payloads, key/default handling, session versus
  local storage, multi-tab behavior, malformed/unavailable storage, versioned
  writes and rollback. Obtain approval before transforming production data.
- **HTTP:** parser selection, JSON headers, DELETE semantics, non-OK response
  handling, empty responses, loading/cancellation, no hidden request failures.
- **Navigation:** normal MPA links unchanged or approved SPA route set verified;
  direct URLs, reload, query/fragment, back/forward, modified/external/unmatched
  links, title/head/focus and server fallback. Do not assume v4 updates these.
- **Transitions:** real browser CSS timing, reversal, multi-property completion,
  hidden/removed local state, no dependency on old animation objects.
- **Deployment:** runtime compilation's CSP requirements, one production bundle,
  cache busting, removed legacy script references, reproducible rollback build.

Use the production project's existing test tooling. Framework recipe tests do
not certify the application's backend, server templates, network fragments,
browser support, or business logic.

## Optional project instruction

Merge this pointer into the project's existing instructions; do not overwrite
them. Adjust the path to the copied skill or npm package.

```md
This project is migrating from Brio.js 1.1.5 to 4.0.0.
Use the brio-migrate-1-1-5 skill and read its migration/legacy references before
editing Brio application code. Record the legacy behavior before replacing it.
Never assume the v4 app-development guide describes the old runtime.
Keep host navigation, storage payloads, form value types, and scoped cleanup
compatible unless an explicit decision authorizes a change.
Run this project's existing behavior tests and report unresolved migration gaps.
```

## Starter request

```text
Use brio-migrate-1-1-5 to migrate this application's Brio 1.1.5 integration to
4.0.0. First identify the actual runtime and inventory all roots, registrations,
directives/options, contexts, dynamic fragments, storage, and navigation.
Capture baseline tests and present unsupported surfaces and behavioral decisions.
Then migrate one complete vertical flow at a time, preserving host behavior.
Do not silently change storage formats, routing strategy, form value types,
validation acceptance, state lifetimes, or event/animation timing.
Finish with behavior verification, remaining gaps, and a rollback procedure.
```
