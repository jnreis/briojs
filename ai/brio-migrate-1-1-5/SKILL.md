---
name: brio-migrate-1-1-5
description: "Migrate applications from Brio.js 1.1.5 to v5.0.0. Use for legacy newApp, b-props/b-data, b-each, mustache templates, $set/$dom/$tools, scripts, routing/boost, persistence, masks, transitions, and hydration APIs. Inventory the actual legacy bundle and preserve production behavior; not a blind rename or compatibility shim."
---

# Migrating Brio 1.1.5 applications

This is a portable application-migration skill, not a runtime plugin. It targets
1.1.5 to 5.0.0 specifically. Do not treat the newer app-development skill as a
description of legacy behavior.

## Required workflow

1. Read the [migration guide](./references/migration.md) and
   [legacy inventory](./references/legacy-api.md). Confirm the application's
   actual bundle/package; a filename alone does not establish its contents.
2. Inventory roots, templates (including server-generated markup), application
   scripts, asset registration, all directive names/options, context references,
   storage keys/payloads, custom hooks/directives, and navigation. Inspect usages,
   not only declarations. Follow dynamically inserted content too.
3. Capture the existing application's observable behavior with its current
   tooling. Save representative storage samples without credentials or personal
   data. Do not upgrade the runtime before establishing a baseline.
4. Produce a migration assessment: direct conversions, semantic rewrites,
   missing equivalents, and unresolved application decisions. Read the
   [verification checklist](./references/verification.md). Ask before changing
   persistence formats, navigation strategy, timer/event timings, validation
   acceptance, focus, or state reset/preservation.
5. Migrate one isolated root or vertical flow at a time on a branch/staging
   deployment. Never hydrate the same subtree with both runtimes. Install v5,
   register methods/components/plugins, then mount explicitly. Remove legacy
   bootstrap and registration only when their callers are replaced.
6. Resolve every expression's actual owner before introducing `$data`, `$for`,
   or `$props`. Replace function references in events with calls. Rewrite
   factory invocation, async preparation, scripts, insertion, persistence, and
   routing deliberately; there is no complete automatic codemod.
7. Use the [paired example instructions](./references/examples.md) as a small
   verified pattern, not proof that the entire production app is compatible.
   The [v5 example](./assets/after.html) is runnable with the current bundle.
8. Run the app's targeted build/tests and real browser checks. Verify cleanup,
   state ownership, network failures, navigation, data compatibility, and CSP.
   Report completed conversions, observed differences, unsupported surfaces,
   outstanding decisions, exact checks, and rollback steps. Do not call the
   migration complete with unresolved behavior gaps.

## Non-negotiable constraints

- Preserve host-page behavior and server-rendered navigation unless explicitly
  authorized to change them.
- No invented `app.$insert`, `$refs`, `$set`, `$dom`, `newApp`, custom directive
  registry, hook chain, or template registry in v5.
- Do not use regex replacements to resolve JavaScript scope or rewrite embedded
  scripts. Do not implement a fake legacy API that silently drops options.
- Treat markup as executable code; never move user/server response strings into
  `b-html` or insertion without an explicit trust decision.
- Do not overwrite live storage or load both browser globals on one page as a
  migration strategy. Use separate pages/builds or explicitly isolated ESM
  integrations, and keep a deployable legacy build.

For a consuming-project instruction and starter migration request, see the
[verification guide](./references/verification.md).
