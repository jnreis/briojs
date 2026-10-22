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
   `npm view briojs`; availability is not a reservation.
8. Run `npm publish --access public`. `publishConfig` selects the public npm
   registry; the package is **unscoped** `briojs`, owned by the publishing account,
   not `@jnreis/briojs`. Never put npm credentials in the repository.
9. Verify `npm view briojs@4.0.0`, installation, and pinned CDN scripts. Create
   the `v4.0.0` tag and GitHub release against the published commit.

Publishing, pushing, tagging, and making the repository public are explicit
release actions, not automatic build steps. No npm token is stored by this
project. If adding automated publishing later, prefer npm trusted publishing
with GitHub Actions/OIDC over a long-lived token.
