---
name: brio-lab-page
description: "Create or update a Brio Lab manual test page (tests/directives, tests/methods, tests/reactivity) or a Lab example app (tests/apps), and register it in the Lab catalog. Use when a directive, method, or reactivity feature needs a visual demo or a manual test, or when editing the Lab home (index.html, lab/)."
---

# Brio Lab pages

The Lab (`npm run lab`, or `npm run dev` without the Astro frame) shows each
feature as plain HTML that loads the built standalone scripts. The page source is
the demo, so keep it exactly what a user would write: no imports, no build-time
injection, no framework internals.

## Page template

Copy the closest existing page in `tests/directives/`, `tests/methods/`, or
`tests/reactivity/` (`resize.html` and `slot.html` are good references) and keep
its structure:

1. `<head>`: `/site/public/theme.js` first, then title
   `Manual Test: <feature>`, a page-specific `<style>` only if needed,
   `/tests/shared/showcase.css`, and the favicon.
2. `<body>`: an `<h1>`, a one-line intro, then one `<div class="card">` per
   scenario, each with an `<h3>` numbered title ("1. …"), a short explanation,
   and the live markup. Each card becomes a source panel.
3. Scripts at the end, **in this order**: `/tests/source-viewer.js` (it snapshots
   source before hydration), `/dist/brio.min.js`, any add-on scripts
   (`/dist/brio.<addon>.min.js`), then an inline bootstrap:
   `brio.createApp(...)` + `app.mount('body')` on `DOMContentLoaded`.
4. Last element in `<body>`: the shared nav
   (`<nav class="brio-demo-nav" b-ignore aria-label="Brio lab">` with Lab,
   Experiments, and the theme toggle). Copy it verbatim.

Styling rules:
- Shared page, card, heading, and button styles live in
  `tests/shared/showcase.css`. Don't duplicate them per page. Add a shared rule
  only if several pages need it.
- Use the theme tokens (`var(--soft)`, `var(--line)`, `var(--blue)` …) so light and
  dark modes both work. Check both.

Cover the normal case, each modifier and `.options` key, edge cases, and
cleanup where it's visible. Show real values on screen; don't rely on
`console.log` alone.

## Register it

Add exactly one `<a class="test-link">` card in `tests/index.html` under the
right `<h3 class="catalog-group">` (State and bindings, Rendering and placement,
Events and behavior, Observers add-on, Hydration boundaries, DOM and data, Forms
and flows). Give it an `<h3>` naming the directive or method and a short
`<span class="desc">`. The Lab home reads this catalog, so nothing else needs
registering. Adding a new group means updating the group list asserted in
`tests/playground/options.spec.js`.

## Example apps

Larger demos go in `tests/apps/<id>/`. To show one on the website as well, add it
to `site/data/examples.mjs`. `site:prepare` stages it, and the site and theme
tests visit every listed app.

## Verify

1. `npm run build`, then open the page in the Lab and check it works, in light
   and dark themes, at desktop and phone widths.
2. `npm run test:playground`. Every page in these folders is checked
   automatically for catalog listing, shared theme, and nav. Add a focused spec
   in `tests/playground/` when the page shows behavior worth guarding.
