---
name: brio-apps
description: "Write or debug Brio.js v5 application code inside this repo: Lab pages, example apps in tests/apps, starter templates, website demos, Parts, playground defaults, and doc examples. Use for Brio HTML directives, reactive widgets, components, forms, routing, stores, scoped cleanup, and app.insert/$insert. Not for changing framework internals (see brio-directive)."
---

# Brio application code in this repo

The application skill ships to users in [`ai/brio-apps/`](../../../ai/brio-apps/SKILL.md).
That is the single source of truth. Don't copy its content here.

1. Read `ai/brio-apps/SKILL.md` and follow it.
2. Use its references as needed: `ai/brio-apps/references/guide.md` (API and
   patterns) and `ai/brio-apps/references/recipes.md` (runnable assets).
3. In this repo, check against the **current source**, not only the guide.
   If the framework changed after the guide was written, the source wins.
   Update the guide too (see `brio-docs`), because it ships in the npm package.

Repo-specific notes:
- Lab pages load `/dist/*.min.js` with script tags and use the global `brio`.
  Run `npm run build` first. Page structure is in the `brio-lab-page` skill.
- Website demos and Parts are in `site/src/` and run through Astro. Starter
  templates in `templates/` install `@jnreis/briojs` from npm, so they can only
  use released APIs.
