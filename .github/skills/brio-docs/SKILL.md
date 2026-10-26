---
name: brio-docs
description: "Keep Brio documentation in sync after a framework, API, directive, add-on, template, or website change. Use when editing DOCUMENTATION.md, README.md, CHANGELOG.md, site docs/pages, Parts, playground defaults, the ai/ app kit, or llms.txt, or when asked to review docs before a release. Knows which files are canonical and which are generated."
---

# Brio documentation

## Canonical vs generated

Edit only the canonical sources. Regenerate everything else.

| Canonical source | Generates |
| --- | --- |
| `DOCUMENTATION.md` | `site/src/content/docs/reference/*.md` (one page per `##` section) and `llms-full.txt` |
| `CHANGELOG.md` | `site/src/content/docs/releases.md` |
| `site/scripts/content.mjs` (summary text) + docs | `site/public/llms.txt` |
| `scripts/directives.mjs` | `dist/directives.json`, `dist/html-custom-data.json` |
| `src/**` | `dist/` (including `.d.ts`) |

Regenerate with `npm run site:build`, which builds the runtime and runs
`site:prepare`. While the docs dev server runs, `npm run site:prepare` is
enough.

## Where each kind of change is documented

- **Any user-visible change:** a `CHANGELOG.md` entry under the pending
  version. Breaking changes go first under "Breaking changes". Everything else
  goes in the topic section it fits (Add-ons, Plugin API, Core and reactivity,
  HTML and components …). Write a pending heading as `## [x.y.z] — Unreleased`. Don't
  finalize version headings or dates. That happens at release.
- **API or directive:** its `DOCUMENTATION.md` section, plus the directive quick
  reference and `## Contents` when headings change. Heading text becomes the
  site anchor used by `scripts/directives.mjs` `docs` links, so keep them in step
  (`tests/directive-manifest.test.js` checks).
- **Install, bundles, add-ons:** README "Quick start" and add-on tables,
  DOCUMENTATION "Install" / "Browser bundles", `site/src/content/docs/start/`, and
  the summary in `site/scripts/content.mjs`.
- **App-author behavior:** `ai/brio-apps/` (SKILL.md, `references/guide.md`,
  `recipes.md`, `assets/`). It ships in the npm package, so it must describe the
  released API exactly. `tests/ai-kit.test.js` runs its assets.
- **Hand-written site pages:** `site/src/content/docs/start/`,
  `site/src/content/docs/integrations/`, and the custom Astro pages in
  `site/src/pages/` (home, examples, Parts, playground).
- **Parts:** catalog and examples in `site/src/parts/`. Each Part's supporting
  text must match its current markup and behavior.
- **Playground defaults:** `site/src/playground/default.js`.
- **Templates:** each `templates/<id>/README.md`, `site/data/templates.mjs`, and
  `packages/create-brio/README.md`.
- **Contributor workflow:** `CONTRIBUTING.md`. Agent-facing rules: `AGENTS.md`
  and `.github/skills/`.
- **Pinned CDN URLs** (`@jnreis/briojs@x.y.z`) change only at release time. See
  the `brio-release` skill.

## Style

Short sentences, plain words, and examples that run as written. Describe what
the code does today, not its history (history belongs in the changelog). Link
with relative paths inside the repo. Never promise unreleased features as
available.

## Verify

```sh
npm run build
node --test tests/directive-manifest.test.js tests/site-content.test.js tests/ai-kit.test.js
npm run site:build && node site/scripts/check.mjs
npm run test:site
```

`check.mjs` validates links, anchors, metadata, and assets across all built
pages. For a pre-release review, read the docs end to end against the current
source rather than only grepping for changed names.
