---
name: brio-directive
description: "Add, change, rename, or remove a Brio framework directive (b-*), modifier, or .options key, in core or in an official add-on. Use when touching src/dom/directives, src/dom/bindings.ts, src/plugins, or scripts/directives.mjs. Covers wiring, reserved names, the directive manifest, tests, Lab page, docs, and size checks."
---

# Adding or changing a Brio directive

First decide **core or add-on**. Core holds directives most pages need. Anything
optional (observers, masks, forms, routing) belongs in an official add-on that
uses the public plugin API, so pages that don't use it don't pay for it.

## 1. Implement

**Add-on directive (preferred for new features)**
1. Create `src/dom/directives/<name>.ts` exporting a `DirectiveDefinition`
   (type in `src/dom/directives/registry.ts`). Declare `name`, `value`
   (`'expression' | 'statement' | 'text' | 'none'`), allowed `modifiers` and
   `options` keys, and the `mount` and/or `ready` hooks. `src/dom/directives/resize.ts`
   is a compact example.
2. Use the binding API (`binding.value()`, `binding.run({ $locals })`,
   `binding.on(...)`, `binding.effect(...)`) so listeners and effects are released
   on unmount. Return a cleanup for anything else (observers, timers).
3. Add it to the plugin's `directives` array in `src/plugins/<addon>.ts`.
4. Official add-on names must stay claimable only by their plugin. Update
   `addonFor` in `registry.ts` so core can name the missing add-on when the
   directive is used without it.
5. A brand-new add-on also needs: a `src/<addon>-entry.ts` export, a
   `src/browser-<addon>.ts` standalone script, entries in `scripts/build.js` and
   `scripts/size.js`, an `exports` entry in `package.json`, and README and
   DOCUMENTATION bundle tables.

**Core directive**
1. Implement `handle<Name>` in `src/dom/directives/<name>.ts` and export it from
   `src/dom/directives/index.ts`.
2. Wire it into `src/dom/bindings.ts`. Check the sets near the top
   (`conditionalNames`, `childControllingNames`, `fragmentNames`) and the
   combination and conflict rules.
3. Add the name to `reservedDirectives` (or a stem to `reservedPrefixes`) in
   `registry.ts` so plugins can't claim it.
4. Use helpers from `src/core/native.ts` and `src/dom/native.ts` instead of raw
   globals. They exist to keep the minified bundle small.

**Event modifiers** live in the `eventModifiers` list in
`src/dom/directives/on.ts`. The manifest test compares against it exactly.

## 2. Describe it in the manifest

Add or update the entry in `scripts/directives.mjs`: `name`, `description`,
`value`, `modifiers`, `docs` anchor, `example`, and `plugin`
(`'@jnreis/briojs/<addon>'`) for add-on directives. The build turns it into
`dist/directives.json` and the VS Code `html-custom-data.json`.
`tests/directive-manifest.test.js` fails if the manifest drifts from the runtime,
the reserved list, or `DOCUMENTATION.md` headings.

## 3. Test

- Add Node tests (jsdom) near related ones: `tests/directives.test.js`,
  `tests/directive-interactions.test.js`, `tests/observers.test.js`,
  `tests/plugin-api.test.js`, and so on. Cover behavior, modifiers and options,
  invalid input errors, and **cleanup on unmount**.
- Run: `npm run build && node --test tests/directive-manifest.test.js tests/<your>.test.js`.
- Plugin type changes: check `tests/types/plugins.ts` (compiled by
  `tests/mask.test.js`) and `npm run typecheck`.

## 4. Show and document it

- Lab page: follow the `brio-lab-page` skill (new page or new card).
- Docs: follow the `brio-docs` skill. At minimum: the directive section and
  quick-reference table in `DOCUMENTATION.md`, a `CHANGELOG.md` entry, and
  `ai/brio-apps/` if app authors will use it.

## 5. Verify

`npm run typecheck`, `npm test`, `npm run test:playground`, then
`npm run size -- --check`. A size increase in core needs justification. Report it
to the maintainer and don't overwrite the baseline.
