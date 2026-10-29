---
name: brio-change-checklist
description: "Checklist of everything to update when changing Brio: tests, Lab pages, CSP build parity, docs, AI kits, website, templates, benchmarks and size baselines. Use for any change to src/, a directive, add-on, option, error message, template, or website page, before calling the work done."
---

# Brio change checklist

Run through this before finishing any change. Skip lines that don't apply, but
decide each one on purpose. Say in the final answer which you skipped and why.

Follow the Git and authorization rules in `AGENTS.md` and the
[contributor guide](../../../CONTRIBUTING.md). Implementation permission does
not authorize staging, committing, pushing, opening or merging PRs, tagging,
publishing, deploying, or creating releases.

## 1. Find what the change touches

```sh
git status --short
git branch --show-current
```

For new features, create `feat/<name>` from a clean `main` before editing, or
continue the existing task branch. Ask before switching branches or carrying
uncommitted or unrelated work onto a new branch. Never stash or discard it
automatically.

Search the whole repo for the names you changed (old and new), not just `src/`:
`DOCUMENTATION.md`, `README.md`, `ai/`, `site/`, `templates/`, `tests/`,
`bench/`, `scripts/`. A rename or removed option left behind in an example or AI
file is the most common miss.

## 2. Code

- [ ] `src/` change follows the lifecycle rule (everything created is released
      on unmount) and reuses `src/core/native.ts` helpers.
- [ ] **CSP build parity.** If it touches expressions, hydration, components,
      `app.insert`, or a directive, check the CSP build (`src/csp-entry.ts`,
      `src/core/csp-app.ts`, `src/core/csp-engine.ts`) and add or update a case
      in `tests/csp.test.js` and `tests/csp/strict-csp.spec.js`.
- [ ] **Add-ons.** The npm entry (`src/plugins/*-entry.ts`), the standalone
      script (`src/browser-*.ts`), and the types agree.
- [ ] **Types.** Public API changes update the `.d.ts` output and `tests/types/`.
- [ ] **Directive, modifier, or `.options` key:** follow the `brio-directive`
      skill (manifest in `scripts/directives.mjs`, editor data, reserved names).
- [ ] **Error messages.** Wording changes update the tests that match them and
      the errors reference in `DOCUMENTATION.md`.

## 3. Tests

- [ ] Regression test for every behavior change or bug fix (`tests/*.test.js`).
- [ ] **Lab page** (`tests/directives/`, `tests/methods/`, `tests/reactivity/`)
      added or updated, and registered in `tests/index.html`. See the
      `brio-lab-page` skill. Lab browser specs live in `tests/playground/`.
- [ ] Example apps in `tests/apps/` still run if the API they use changed.
- [ ] Site tests in `tests/site/` (examples, Parts, playground, demo links).
- [ ] Astro integration (`tests/astro/`) if the Astro entry or mount behavior
      changed.
- [ ] Benchmarks: `bench/` apps and `bench/baseline.json` if hot paths changed.
      Run `npm run bench:check`. Never overwrite the baseline to pass a check.
- [ ] Bundle size: `npm run size -- --check`. Never overwrite
      `scripts/size-baseline.json` to pass a check. Report the difference.

## 4. Documentation (see the `brio-docs` skill for canonical sources)

- [ ] `CHANGELOG.md` entry under the pending version. No invented dates or
      version bumps.
- [ ] `DOCUMENTATION.md` section, directive quick reference, and `## Contents`.
- [ ] `README.md` if install, bundles, add-ons, or the headline feature changed.
- [ ] `CONTRIBUTING.md` if the contributor workflow changed.
- [ ] Never hand-edit generated files (`dist/`, `site/src/content/docs/reference/`,
      `site/src/content/docs/releases.md`, `site/public/llms*.txt`). Regenerate
      with `npm run site:build`.

## 5. AI files

Two audiences. Update both when they apply.

- [ ] **For people building with Brio** (ships in npm): `ai/brio-apps/`
      (its skill file, `references/guide.md`, `recipes.md`, `assets/`), and
      `ai/README.md`. It must describe the released API exactly.
- [ ] **Migration kit:** `ai/brio-migrate-1-1-5/` when the change affects what a
      1.1.5 app needs to know (runtime requirements, CSP, removed APIs).
- [ ] **For working on Brio itself:** `AGENTS.md` and `.github/skills/`. Update
      them when a rule, command, folder, or workflow changes. Keep paths real;
      `tests/agent-instructions.test.js` checks them.

## 6. Website and examples

- [ ] Hand-written pages: `site/src/content/docs/start/` and
      `site/src/content/docs/integrations/` (including the shared widget helper
      `site/public/integrations/widgets.js` and `tests/integration-widgets.test.js`).
- [ ] Custom pages and the home page: `site/src/pages/`.
- [ ] Examples list: `site/data/examples.mjs`; app source in `tests/apps/`.
- [ ] Parts: `site/src/parts/` (catalog, examples, recipes) and their tests.
- [ ] Playground defaults: `site/src/playground/default.js`.
- [ ] Summary text and `llms.txt` source: `site/scripts/content.mjs`.

## 7. Templates and scaffolder

- [ ] `templates/<id>/` code and README still match the API.
- [ ] `site/data/templates.mjs`, `packages/create-brio/`, and its README.
- [ ] Pinned versions (`@jnreis/briojs@x.y.z`, template dependencies) change
      only at release time (see `brio-release`).

## 8. Verify, smallest first

```sh
npm run build
npm run typecheck
node --test tests/<relevant>.test.js
npm test
npm run test:playground     # Lab pages
npm run test:csp            # CSP build in Chromium
npm run site:build && node site/scripts/check.mjs && npm run test:site
npm run test:astro
npm run size -- --check && npm run bench:check
```

Run Playwright suites one at a time (fixed ports). Never stop the maintainer's
dev servers (5173, 4321, 4323).

## 9. Before you answer

- [ ] Temp files and scratch scripts removed, nothing left in the repo root.
- [ ] Review `git status --short`; distinguish this task's edits from pre-existing
      changes and leave the latter untouched.
- [ ] State which checks ran, which didn't, and anything you couldn't verify.
- [ ] Report release impact using the table in `CONTRIBUTING.md`: Brio npm,
      separate `create-brio` npm, website deployment, or none. Include all
      applicable targets and recommend patch/minor/major where relevant.
      Do not bump versions, change pins, or finalize release dates without
      approval. If there is no approved pending version, ask before adding one.
- [ ] If release preparation is requested, use `brio-release`. File preparation
      and validation do not authorize Git or publication actions.
