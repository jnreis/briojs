# Development and releases

## Local development

Use a current Node.js LTS release supported by the build/test tools (Node 22.12+
is a suitable baseline). The browser runtime has no Node.js dependency.

```sh
npm install
npx playwright install chromium
npm run build
npm run dev -- --open /tests/index.html
```

The repository contains a pnpm lockfile. If using pnpm, install with
`pnpm install --frozen-lockfile`; avoid committing a second package-manager
lockfile for incidental local installs.

The root playground and manual test gallery are development pages. Their
`/dist/` script URLs require the build output. Example apps with mock backends
are not production server implementations.

## Validation

```sh
npm run typecheck
npm test
npm run test:astro
```

`npm test` builds first and runs the Node test suite, including jsdom user
flows, directive interactions, and package-content checks. The Astro suite
builds its fixture and exercises real browser navigation with Playwright.
For a focused check, build once and run `node --test path/to/test.js`.

Keep changes focused, preserve lifecycle cleanup and existing behavior, and
add regression coverage for behavioral changes. Do not edit generated `dist/`
files by hand; regenerate them with `npm run build`.

## Documentation website

The static Astro/Starlight website lives in `site/`. It is deployed separately
from the npm package, whose file allowlist excludes the website and its assets.

```sh
pnpm install --frozen-lockfile
pnpm run site:dev
```

`DOCUMENTATION.md` remains the canonical API reference, and `CHANGELOG.md`
remains the canonical release history. `site:prepare` generates their Starlight
pages and stages the allowlisted example apps and local browser bundles. Do not
edit generated reference/release pages or staged demo files. After changing
canonical Markdown or example sources, rerun `pnpm run site:prepare` while the
dev server is running. Source website pages and styles support Astro hot reload.
After changing framework source, rebuild it before preparing the site again.

The homepage and gallery are custom Astro pages. Only the homepage's counter
uses Brio; documentation navigation and search use Starlight. Demos run in
the same tab with a return link, not embedded frames. Staged demos share the
website's light/dark preference and include a theme toggle. Website-only
palette overrides live in `site/public/demo-theme.css`; standalone app sources
keep their own styling. Mock backends and
simulated collaborators remain demonstrations, not deployable services.
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

## Preparing 4.0.0

4.0.0 is the first npm release. Keep its changelog as one consolidated entry,
not a list of breaking changes between unpublished v4 drafts. Earlier private
version numbers do not require a public npm migration sequence.

Before publishing:

1. Review the worktree and intended files. Check author metadata, license,
   release notes, examples, and package version.
2. Run the validation commands above, plus size and performance checks.
3. Run `npm pack --dry-run` to review the file list. `prepack` rebuilds `dist`
   for both packing and publishing; it does not run the full test suite.
4. Run `npm pack`, install the resulting tarball in a clean project, and verify
   the documented imports and standalone scripts. Remove the local tarball
   after checking it; never commit it.
5. Set the 4.0.0 changelog date when publishing. Update the README and
   documentation's pre-publication notices at the same time.
6. Commit the intended release files and push to
   `https://github.com/jnreis/briojs`. Make the repository public before creating
   a public release or publishing with public provenance.
7. Authenticate with npm as `jnreis`, verify with `npm whoami`, and enable the
   account/package security controls npm requires. Recheck availability with
   `npm view @jnreis/briojs`; availability is not a reservation, and an unused
   unscoped name can still be rejected by npm's similar-name protection.
8. Run `npm publish --access public`. `publishConfig` selects the public npm
   registry; the package is **scoped** `@jnreis/briojs`, under the publishing
   account `jnreis`. Public scoped packages require `--access public`.
   Never put npm credentials in the repository.
9. Verify `npm view @jnreis/briojs@4.0.0`, installation, and pinned CDN scripts. Create
   the `v4.0.0` tag and GitHub release against the published commit.

Publishing, pushing, tagging, and making the repository public are explicit
release actions, not automatic build steps. No npm token is stored by this
project. If adding automated publishing later, prefer npm trusted publishing
with GitHub Actions/OIDC over a long-lived token.
