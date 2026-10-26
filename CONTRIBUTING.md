# Development and releases

New here? Start with issues labeled `good first issue` or `help wanted`, ask
questions in [GitHub Discussions](https://github.com/jnreis/briojs/discussions),
and see [ROADMAP.md](./ROADMAP.md) for where Brio is headed. Bug reports and
feature requests use the forms in `.github/ISSUE_TEMPLATE/`.

Using an AI coding assistant on this repo? [AGENTS.md](./AGENTS.md) holds the
always-on rules, and `.github/skills/` holds workflows for adding directives,
Lab pages, docs updates, and releases. They summarize this guide, so update them
when you change a workflow here. `tests/agent-instructions.test.js` checks that
every file and skill they mention exists. These are for working on Brio itself.
The app-building kit for Brio users is in `ai/`.

## Your first contribution

You can help without changing the runtime: try a starter, report confusing docs,
share a small example, or reduce a bug to a runnable reproduction.

For code changes:

1. Pick an issue labeled `good first issue` or `help wanted`, or discuss a larger
   idea before spending time implementing it.
2. Fork the repo, create a branch, and follow the setup below.
3. Keep the change focused and add a regression test for a behavior change.
4. Run the smallest relevant checks, then open a pull request describing the
   change and how you tested it. Draft PRs and questions are welcome.

Follow the [community conduct policy](./CODE_OF_CONDUCT.md). Report security
vulnerabilities [privately](./SECURITY.md), not in issues or PRs.
This is an independently maintained project; responses may take time.

## Local development

Use a current Node.js LTS release supported by the build/test tools (Node 22.12+
is a suitable baseline). The browser runtime has no Node.js dependency.

```sh
npm install
npx playwright install chromium
npm run build
npm run lab
```

`npm run lab` starts the Vite Lab and the Astro fixture together; open the URL
Vite prints. Use `npm run dev` alone when you don't need the Astro frame.

The repository contains a pnpm lockfile. If using pnpm, install with
`pnpm install --frozen-lockfile`; avoid committing a second package-manager
lockfile for incidental local installs.

The root playground and manual test gallery are development pages. Their
`/dist/` script URLs require the build output. Example apps with mock backends
are not production server implementations.

Open `/` for **Brio Lab** (`index.html` + `lab/`): a keyed-list workbench with
live state, real DOM-node identities, a bounded MutationObserver trace, and a
searchable experiment rack. The catalog reads the links and descriptions from
`tests/index.html`, so the full directory remains the source of truth. Specimen
source is shown directly from its template and JavaScript module. The Lab and
manual test pages share a locally bundled Prism highlighter for HTML, embedded
CSS/JavaScript, and standalone JavaScript. Source snapshots remain literal text;
highlighting only adds presentation spans and never executes displayed code.

Use `/tests/index.html` for the complete example directory. The standalone apps,
manual pages, and Astro fixture share the website palette and a light/dark
toggle. The preference uses `starlight-theme` in local storage (per origin);
without a saved preference it follows your operating system. The Lab home
embeds the Astro fixture in a frame (`lab/astro-frame.js`). The fixture runs on
its own server at the same hostname on port 4323, not Astro's default 4321, so
it never collides with the docs site's dev server (`npm run lab` starts both, or
run `npm run dev:astro` beside `npm run dev`); the frame shows start
instructions until that server answers, then connects on its own. Set
`VITE_LAB_ASTRO_PORT` if you start Astro on another port. When framed, the
fixture (`tests/fixtures/astro/src/lab-embed.js`) hides its own header and
footer, follows the Lab's theme, and reports its height and current path to the
Lab. It accepts messages only from its parent on the same hostname. Compare
local and persistent islands across page swaps, send a window pulse, and
release lazy modules using the diagnostic controls. "Open in new tab" opens the
current fixture page standalone, with a return link to the Lab. Returning from
Astro defaults to Vite's port 5173 when no Lab origin was supplied.

Manual test pages keep only their page-specific `<style>` rules. Shared page,
card, heading, and button styles live in `tests/shared/showcase.css`. The pages
stay plain HTML that loads `/dist/*.min.js` with script tags, without
build-time injection, so they show exactly what a user would write.

## Validation

```sh
npm run typecheck
npm test
npm run test:astro
npm run test:playground
```

`npm test` builds first and runs the Node test suite, including jsdom user
flows, directive interactions, and package-content checks. The Astro suite
builds its fixture and exercises real browser navigation with Playwright.
The playground suite checks the shared theme on every manual page and app,
plus keyed identity, workbench state and mutation traces, catalog navigation,
preference persistence, and mobile layout.
For a focused check, build once and run `node --test path/to/test.js`.

The `Framework CI` workflow runs type checks and Node tests on Node 22 and 24,
plus the Lab and Astro Chromium suites on Node 22, for pushes to `main` and pull
requests. Website checks and deployment run separately in the `Website` workflow.
Dependency update pull requests are grouped and scheduled monthly.

Keep changes focused, preserve lifecycle cleanup and existing behavior, and
add regression coverage for behavioral changes. Do not edit generated `dist/`
files by hand; regenerate them with `npm run build`.

### Directive manifest and editor data

`scripts/directives.mjs` describes every `b-` attribute: its value, modifiers,
example, and docs anchor. `npm run build` turns it into
`dist/directives.json` and `dist/html-custom-data.json` (VS Code
`html.customData`). When you add or change a directive or modifier, update the
manifest too; `tests/directive-manifest.test.js` fails if it drifts from the
runtime source or from `DOCUMENTATION.md` headings.

### Starter templates

`templates/` holds runnable starters (widget, multi-page, SPA, Astro, plugin). They
install `@jnreis/briojs` from npm; StackBlitz opens them straight from `main`.
To test a template against unreleased runtime changes, install a locally packed
build (`npm pack`) instead of the registry version. The site lists them from
`site/data/templates.mjs`, and `tests/starter-templates.test.js` checks their
structure, links, and directives. Before changing one, run it for real:

```sh
cd templates/spa
npm install
npm run dev
npm run build
```

## Documentation website

The static Astro/Starlight website lives in `site/`. It is deployed separately
from the npm package, whose file allowlist excludes the website and its assets.

```sh
pnpm install --frozen-lockfile
pnpm run site:dev
```

`DOCUMENTATION.md` remains the canonical API reference, and `CHANGELOG.md`
remains the canonical release history. `site:prepare` generates their Starlight
pages, `llms.txt` and `llms-full.txt` (from the docs, getting-started guides,
and example list), and stages the allowlisted example apps, local browser
bundles, and editor data files. Do not
edit generated reference/release pages or staged demo files. After changing
canonical Markdown or example sources, rerun `pnpm run site:prepare` while the
dev server is running. Source website pages and styles support Astro hot reload.
After changing framework source, rebuild it before preparing the site again.

The homepage, example gallery, Parts, and playground are custom Astro pages.
The creature builder and isolated Parts/playground previews use Brio;
documentation navigation and search use Starlight. Example-gallery demos run in
the same tab with a return link, not embedded frames. Staged demos share the
website's light/dark preference and include a theme toggle. Shared demo
palette overrides live in `site/public/demo-theme.css` and shared color tokens
in `site/public/theme-tokens.css`. These assets also theme the standalone apps;
manual pages use `tests/shared/showcase.css`. App-specific layouts remain local
to each example. Mock backends and
simulated collaborators remain demonstrations, not deployable services.
The creature builder's displayed HTML is also its live template, and its
displayed JavaScript is the module that creates the live app (`site/src/demos/`).
Mood, color, size, and name drive reactive classes, styles, conditional extras,
and text. "Surprise me" picks random values and always changes the mood, color,
and name. Motion is decorative and disabled under `prefers-reduced-motion`.
The gallery groups the canonical example list into three
learning paths without hiding any demos.
Conduit uses hash routing in the staged site so deep routes survive reloads on
GitHub Pages; the original development app keeps history routing by default.

Validate production output before deploying:

```sh
pnpm run site:build
node --test tests/site-content.test.js
node site/scripts/check.mjs
pnpm exec playwright install chromium
pnpm run test:site
pnpm run site:preview
```

The static checker validates local links, anchors, metadata, and asset paths.
Browser tests exercise search, light/dark themes, small-screen navigation,
no-JavaScript reading, every demo, and Conduit hash-route reloads. They also
open every gallery link in both development and production. Demo links use
explicit `index.html` URLs because Astro's development server does not resolve
public-directory index pages from trailing-slash URLs.

### GitHub Pages and briojs.com

The `Website` workflow validates site-relevant pull requests. On relevant
changes to `main`, or a manual run on `main`, it builds and tests before
deploying `site/dist` with the official Pages actions. It does not publish npm.
The canonical site URL is the domain root, not `/briojs/`.

One-time setup (requires repository/domain owner access):

1. In your **GitHub account Settings → Pages**, verify `briojs.com`. Add
   the TXT record GitHub provides and keep it after verification to protect
   the domain against takeover. Do not invent a verification token.
2. In **jnreis/briojs → Settings → Pages → Build and deployment**, select
   **GitHub Actions** as the source.
3. Set **Custom domain** to `briojs.com` in the same repository settings.
   The checked-in `site/public/CNAME` also records the intended domain, but
   custom Actions deployments still require the repository Pages setting.
4. At the DNS provider, configure these records (remove only conflicting
   web-hosting records; preserve unrelated mail/TXT records):

   | Type | Name | Value |
   | --- | --- | --- |
   | A | `@` | `185.199.108.153` |
   | A | `@` | `185.199.109.153` |
   | A | `@` | `185.199.110.153` |
   | A | `@` | `185.199.111.153` |
   | CNAME | `www` | `jnreis.github.io` |

   Optional IPv6 support: add all four apex AAAA records,
   `2606:50c0:8000::153`, `2606:50c0:8001::153`,
   `2606:50c0:8002::153`, and `2606:50c0:8003::153`. Remove stale AAAA
   records pointing elsewhere even if you choose IPv4 only. Do not add a
   wildcard record. The `www` CNAME targets the account hostname, not the
   repository path or `briojs.com`; Pages redirects it to the configured apex.
5. Push the reviewed changes or manually run **Actions → Website** on `main`.
   Wait for Pages' DNS check and certificate provisioning, then enable
   **Enforce HTTPS**. DNS propagation can take up to 24 hours.
6. Verify `https://briojs.com`, the `https://www.briojs.com` redirect, search,
   a reference deep link, a demo, and a genuine unknown-path 404.
   Robots and the generated sitemap are at `/robots.txt` and
   `/sitemap-index.xml`; demos are excluded from the sitemap and disallowed
   for crawlers.

These are manual setup instructions, not actions performed by the build.
GitHub's current [custom-domain instructions](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
and [domain-verification instructions](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages)
are authoritative if provider requirements change.

## Performance

```sh
npm run bench
npm run bench:compare
npm run bench:check
```

The keyed-table harness measures create/replace/append/clear, update every tenth
row, select, swap, and remove in Chromium, plus heap/DOM nodes per row.
Comparison pages cover Vue, petite-vue, Alpine, React, Preact, and Svelte.
These are local measurements, not an official js-framework-benchmark ranking.

Timings include layout and depend on the machine. Compare repeated runs on the
same machine with the same tool versions. `bench:check` flags regressions over
15% and 1 ms against `bench/baseline.json`; investigate noise rather than
automatically overwriting the baseline. For a deliberate new baseline:

```sh
node bench/run.mjs --save
```

## Bundle size

```sh
npm run build
npm run size
npm run size -- --check
```

The reporter measures raw, gzip level 9, and Brotli quality 11 bytes for browser
scripts, each entry's reachable ESM graph, and minified Vite consumers.
ESM graphs sum separately compressed files and count shared chunks once.
Consumer fixtures retain exports with global sinks; these are library
reachability measurements, not complete application sizes. Source-map payloads,
HTML/CSS, dynamic app chunks, network overhead, and caching are excluded.

`--check` rejects any metric increase or scenario-set change. Small compressed
differences can come from changed minifier names and chunk hashes. Review the
whole matrix: fewer raw bytes do not necessarily mean fewer transferred bytes.
After reviewing an intentional change:

```sh
node scripts/size.js --json > scripts/size-baseline.json
```

## Releasing

Follow [Semantic Versioning](https://semver.org/): patch for fixes, minor for
backward-compatible features (including new files in `dist`), major for
breaking changes. 4.0.0 was the first npm release; its changelog stays one
consolidated entry for the whole unpublished v4 development cycle.

Before publishing:

1. Set `version` in `package.json`. Finalize the pending changelog heading as
   `## [x.y.z] — YYYY-MM-DD`, using the actual release date, not a preparation
   date. Until then, keep the version marked `Unreleased`.
2. Update pinned CDN URLs (`@jnreis/briojs@x.y.z`) in `README.md`,
   `DOCUMENTATION.md`, `site/src/content/docs/start/getting-started.md`, and
   `site/scripts/content.mjs`, plus the version notes at the top of the README
   and documentation. For minor and major releases, raise the starter
   templates' `@jnreis/briojs` range and the bug report version placeholder.
   Review the AI kit's version guidance and regenerate website/llms copies.
   `create-brio` is a separate package: validate its generated templates and
   publish it separately before advertising `npm create brio@latest` as available.
3. Run the validation commands above, plus size and performance checks.
4. Run `npm pack --dry-run` to review the file list. `prepack` rebuilds `dist`
   for both packing and publishing; it does not run the full test suite.
5. Run `npm pack`, install the resulting tarball in a clean project, and verify
   the documented imports and standalone scripts. Remove the local tarball
   after checking it; never commit it.
6. Commit the intended release files and push to
   `https://github.com/jnreis/briojs`.
7. Authenticate with npm as `jnreis` and verify with `npm whoami`.
8. Run `npm publish`. `publishConfig` selects the public npm registry and
   public access for the scoped `@jnreis/briojs` package. Never put npm
   credentials in the repository.
9. Verify `npm view @jnreis/briojs@x.y.z`, installation, and pinned CDN
   scripts. Create the `vx.y.z` tag and GitHub release against the published
   commit.

Publishing, pushing, tagging, and making the repository public are explicit
release actions, not automatic build steps. No npm token is stored by this
project. If adding automated publishing later, prefer npm trusted publishing
with GitHub Actions/OIDC over a long-lived token.
