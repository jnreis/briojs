---
name: brio-release
description: "Prepare, validate, and publish a Brio release: @jnreis/briojs to npm, the create-brio scaffolder, the git tag, and the GitHub release. Use when asked to release, publish, version-bump, ship, or prepare vX.Y.Z, or to check readiness before publishing."
---

# Releasing Brio

The authoritative checklist is the "Releasing" section of `CONTRIBUTING.md`.
This skill is the working order and the lessons from previous releases.

## Ground rules

- The maintainer owns git and publishing. Ask before every irreversible step
  (commit, push, tag, `npm publish`, GitHub release). Ask which steps the maintainer
  wants to run themselves and which you should run.
- Ask for the release date and version. Never invent them.
- Don't overwrite size or benchmark baselines to make checks pass. Report the
  differences instead.
- Never write npm tokens or one-time codes to files or the repo.

## 1. Prepare (files only)

1. `version` in `package.json`, following semver (new `dist` files count as minor).
2. `CHANGELOG.md`: change `## [x.y.z] — Unreleased` to `## [x.y.z] — YYYY-MM-DD`.
3. Pinned CDN URLs `@jnreis/briojs@x.y.z` in `README.md`, `DOCUMENTATION.md`,
   `site/src/content/docs/start/getting-started.md`, and
   `site/scripts/content.mjs`. Grep for the old version to catch the rest.
4. Minor or major: raise the `@jnreis/briojs` range in `templates/*/package.json`
   (`create-brio` regenerates its templates from these when packed) and the
   bug-report version placeholder in `.github/ISSUE_TEMPLATE/bug_report.yml`.
5. Review `ai/brio-apps/` version guidance, and remove any "unreleased" or "not
   published yet" wording for features in this release.
6. `create-brio` is its own package (`packages/create-brio/`, own version).
   Bump it only if its CLI or templates changed. Run `npm run verify:templates`
   there.

## 2. Validate (run sequentially)

```sh
npm run build && npm run typecheck && node --test 'tests/**/*.test.js'
npm run site:build && node site/scripts/check.mjs && npm run test:site
npm run test:playground
npm run test:astro
npm run test:csp
npm run size -- --check
npm run bench:check
```

Size and bench differences are reported, not "fixed" by saving baselines.

## 3. Test the real tarballs

In a temp directory (never inside the repo):

1. `npm pack --pack-destination "$T"` at the root and in `packages/create-brio`.
   Review the file lists. The packed `README.md` must show one logo and one
   creature image with no `#gh-*-mode-only` fragments (`prepack` strips the dark
   copies for npm), and the repo `README.md` must be unchanged afterwards.
2. In a fresh consumer project, install the Brio tarball. Import every
   `exports` subpath in Node, type-check them with strict TypeScript, and check
   the expected `dist/` files and `ai/` are present.
3. In a browser (Playwright from the repo root so it resolves), load the
   standalone `brio.min.js` and an add-on script from `file://`, then call
   `brio.createApp({ state }).mount(...)`. Brio 5 has no auto-start, so a
   page without that call renders nothing. Click something and check the DOM
   and that there are no console errors.
4. Run the packed CLI: `npm exec --package="$T/create-brio-x.y.z.tgz" -- create-brio <dir> --template spa --language ts --package-manager npm`.
   Its `^x.y.z` dependency isn't on npm yet, so install the local Brio tarball
   into the generated project, then `npm run build` (and `typecheck` for TS).
   Repeat for another template.

## 4. Publish (with the maintainer)

1. `main` only accepts pull requests. The release files go on a branch
   (`release/vx.y.z`) and a PR that is squash-merged once the four required
   checks pass. Then check out `main`, pull, and confirm `git status -sb` is
   clean and in sync with `origin/main`. Publish from that commit.
2. `npm whoami` must print `jnreis`. If not, the maintainer runs `npm login`.
3. Publish **`@jnreis/briojs` first** (`npm publish` at the root), then
   `create-brio` (`npm publish` in `packages/create-brio`), because generated
   projects depend on the new Brio. npm requires two-factor confirmation through
   a browser link that only the person at the terminal can open. If `EOTP`
   appears, hand the maintainer the commands instead of retrying.
4. The maintainer tags the merged commit and pushes:
   `git tag vx.y.z && git push origin vx.y.z`. Release tags can't be moved or
   deleted afterwards, so tag only after npm publish succeeds.

## 5. Verify and announce

```sh
npm view @jnreis/briojs dist-tags --json        # latest = x.y.z
npm view create-brio version
git ls-remote --tags origin vx.y.z
curl -sI https://cdn.jsdelivr.net/npm/@jnreis/briojs@x.y.z/dist/brio.min.js | head -1
```

Then, in a temp dir: `npm create brio@latest app -- --template spa --language ts --package-manager npm`,
install, build, and typecheck against the published packages.

GitHub release with `gh` (on macOS it may be in `/opt/homebrew/bin`). Extract
the version's changelog section, optionally prefixed with a one-line "get
started" note, and run
`gh release create vx.y.z --verify-tag --latest --title "Brio x.y.z" --notes-file <file>`.
Without `gh`, give the maintainer the notes and the releases/new URL.

Finally, delete temp directories and tarballs. Never commit them.
