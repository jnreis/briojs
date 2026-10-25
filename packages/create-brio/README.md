# create-brio

Scaffold a Brio app or plugin from this repository's starter templates.

**Unpublished:** this package is prepared locally. The commands below using
`@latest` become available only after `create-brio` and Brio 5 are published.
Nothing in the scaffold command installs dependencies, initializes git, or
publishes a package.

## Usage after publication

```sh
npm create brio@latest
```

Choose a directory, template (`widget`, `multi-page`, `spa`, `astro`, or `plugin`),
language (`js` or `ts`), and package manager (`npm`, `pnpm`, `yarn`, or `bun`).
The invoking package manager is the default when detected.

For automation, supply all choices, or use `--yes` for defaults:

```sh
npm create brio@latest my-app -- --template spa --language ts --package-manager npm
npm create brio@latest my-widget -- --yes
```

Non-interactive runs require explicit choices or `--yes`. `--help` and
`--version` never create files. Invalid choices, files, symlinks, and nonempty
destination directories are rejected. Existing files are never overwritten.
Cancel a prompt with Ctrl+C.

The CLI prints installation and development commands; run them yourself.
JavaScript/TypeScript choices cover each template's application source. Astro
still uses its native `.astro` files and configuration. TypeScript projects
include a `typecheck` script and check types during their build. The TypeScript
plugin builds a typed library into `lib/` as well as its browser demo.

## Local development and release preparation

Requires Node 22.12+ (22.x), or Node 24+. No runtime dependencies.

From the repository root:

```sh
npm --prefix packages/create-brio run prepare:templates
node packages/create-brio/bin/create-brio.js my-app --template widget --language ts --package-manager npm
node --test tests/create-brio.test.js
npm --prefix packages/create-brio run verify:templates
npm pack ./packages/create-brio
```

Packing regenerates all ten variants from [the canonical templates](../../templates/)
and the small language-specific overlays in `variants/`. Hidden editor settings
are included; `_gitignore` is restored to `.gitignore` by the CLI because npm
omits `.gitignore` files from tarballs. Generated copies are gitignored.
The packed package is self-contained and does not fetch templates from GitHub.

Generated projects depend on Brio `^5.0.0`. Before that release is published,
validate with a locally packed Brio tarball rather than the public registry.
The scaffolder has its own version and release lifecycle; packing does not
publish either package.

`verify:templates` packs the local Brio build and CLI, installs validation
dependencies in a temporary directory, then builds all ten generated projects
and runs both plugin variants' tests. It removes that temporary directory on
success or failure. Nothing is installed into your project or this repository.
