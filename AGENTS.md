# Working on the Brio repository

Brio.js is an HTML-first reactive framework (`@jnreis/briojs` on npm). This repo
holds the runtime, its official add-ons, the Lab, the docs website, starter
templates, and the separate `create-brio` scaffolder. These instructions are for
changing the framework itself. To *use* Brio (demos, Lab pages, templates), also
follow the `brio-apps` skill.

[CONTRIBUTING.md](./CONTRIBUTING.md) is the full human guide. Read the relevant
section before larger changes.

## Map

- `src/core/`: app, expressions, scopes, scheduler, errors. `src/core/native.ts`
  aliases globals and constants so the bundle minifies well. Reuse those helpers.
- `src/reactivity/`: state, effect, computed, resource.
- `src/dom/`: hydration (`bindings.ts`, `mount.ts`), components, insert, and
  `directives/` (`registry.ts` is the public plugin directive API).
- `src/plugins/`: official add-ons (router, persistence, http, inputs, observers,
  step, devtools). `*-entry.ts` are npm subpaths, `browser-*.ts` the standalone
  scripts.
- `scripts/`: build, size report, and the directive manifest (`directives.mjs`).
- `tests/`: Node tests (`*.test.js`, jsdom), Lab manual pages
  (`directives/`, `methods/`, `reactivity/`), example `apps/`, Playwright suites
  (`playground/` = Lab, `site/`, `astro/`), and the Astro fixture.
- `index.html` + `lab/`: the Brio Lab home.
- `site/`: Astro/Starlight website. `ai/`: the app-building AI kit shipped in
  the npm package. `templates/`: starters. `packages/create-brio/`: scaffolder.

## Commands

Use pnpm through npm, so no global install is needed:
`npm exec --yes --package=pnpm@10 -- pnpm install --frozen-lockfile`.
Never add a second lockfile.

| Goal | Command |
| --- | --- |
| Build `dist/` (needed before Node tests and Lab pages) | `npm run build` |
| Types | `npm run typecheck` |
| One Node test after building | `node --test tests/<file>.test.js` |
| All Node tests (builds first) | `npm test` |
| Lab browser tests | `npm run test:playground` |
| Website | `npm run site:build && node site/scripts/check.mjs && npm run test:site` |
| Astro integration | `npm run test:astro` |
| Bundle size / performance | `npm run size -- --check`, `npm run bench:check` |

Start with the smallest relevant check, then widen. Run Playwright suites one at
a time. Their servers use fixed ports: Lab 4335/4336, site 4330/4334, Astro 4322.
The maintainer's own dev servers may be running on 5173 (Lab), 4321 (docs site),
and 4323 (Astro fixture). Never stop processes you didn't start.

## Rules

- **Git and publishing belong to the maintainer.** Never stage, commit, push,
  tag, publish to npm, or create releases unless explicitly asked in the
  current request. Never touch the git index as a side effect.
- **Generated files:** never hand-edit `dist/`, `site/src/content/docs/reference/`,
  `site/src/content/docs/releases.md`, `site/public/llms*.txt`, or staged
  website demos. Change the source and regenerate.
- **Canonical sources:** `DOCUMENTATION.md` (API reference),
  `CHANGELOG.md` (release history), `scripts/directives.mjs` (directive
  metadata), `tests/index.html` (Lab catalog), `site/data/*.mjs` (website
  example and template lists).
- **Baselines:** don't overwrite `scripts/size-baseline.json` or
  `bench/baseline.json` to make a check pass. Report the difference and let the
  maintainer decide.
- **Keep core lean:** optional features belong in an add-on (`src/plugins/`)
  built on the public plugin API, not in core.
- **Lifecycle:** everything a binding creates (listeners, observers, timers,
  effects) must be released on unmount. Use `binding.on`, `binding.effect`,
  returned cleanups, or `onCleanup`.
- **Behavior changes** need regression tests, a `CHANGELOG.md` entry under the
  pending version, and docs updates (see the `brio-docs` skill). Changes to
  public app-facing APIs must also update `ai/brio-apps/` because it ships to users.
- **Dates and versions:** never invent a release date or bump a version unless
  asked.
- **Lab pages stay plain HTML** that loads `/dist/*.min.js` with script tags, so
  their source viewer shows exactly what a user would write.

## Skills for common jobs

`.github/skills/` has step-by-step workflows: `brio-directive` (add or change a
directive or modifier), `brio-lab-page` (Lab test pages), `brio-docs` (keep
documentation in sync), `brio-release` (npm and GitHub release), and `brio-apps`
(writing Brio application code).
