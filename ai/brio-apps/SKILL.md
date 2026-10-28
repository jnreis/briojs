---
name: brio-apps
description: "Build, extend, or debug applications using Brio.js v5. Use for Brio HTML directives, reactive widgets, multi-page enhancement, SPAs, components, forms, routing, scoped cleanup, and app.insert/$insert. Not for maintaining the framework internals or migrating unspecified older versions."
---

# Building applications with Brio

## Scope

Use this skill for application code using Brio v5. Check the installed version
and existing integration before editing. Do not assume Brio behaves like Vue,
Alpine, or React. This folder is self-contained and can be copied into an
assistant's supported skill directory.

## Workflow

1. Inspect the app's package manifest, entry scripts, HTML roots, and existing
   tests. Determine Brio version, browser bundle versus ESM, and widget/MPA/SPA
   scope. Preserve host-page navigation and non-Brio content.
2. Read the [application guide](./references/guide.md). It defines context,
   lifecycle, public APIs, trust boundaries, and unavailable APIs. If the
   installed version conflicts, consult its types/docs rather than guessing.
3. Read the relevant [recipes](./references/recipes.md). Adapt the closest
   runnable asset below; keep the app's existing build and deployment approach.
   Do not add a router to an ordinary multi-page site without a requirement.
4. Initialize template state before mounting. Use explicit `$data`/`$for`
   references, independent ancestry, named component methods, and canonical
   `b-` directives. Put imported helpers behind application methods when
   compiled expressions need them.
5. Establish cleanup ownership for timers, external listeners, persistence,
   requests, widgets, and dynamic content. Use `app.insert` in JS and `$insert`
   in directives/scripts. Raw DOM removal does not dispose bindings.
6. Handle async/loading/error states visibly. Treat authored templates as code;
   never interpolate untrusted HTML or directive expressions. Use `b-text` for
   user content and `b-ignore` around server-rendered user text. Under a
   strict CSP without `unsafe-eval`, use the CSP build and register every
   template from JavaScript.
7. Run the consuming app's smallest relevant tests/build. Exercise actual DOM
   interactions, conditional reset/preservation, nested scopes, removal and
   unmount, plus direct URLs for an SPA. Report what was verified and any
   unsupported integration; do not claim model output is correct from syntax alone.

## Runnable starting points

- [Widget HTML](./assets/widget.html): keyed nested loops, local conditional
  state, preserved show state, contextual scripts, and managed insertion.
- [Multi-page enhancement HTML](./assets/multi-page.html): a form, generated
  accessible IDs, validation, component persistence, and ordinary page links.
- [SPA HTML](./assets/spa.html): registered route components, props/events/slots,
  reactive route parameters, and component-owned listener cleanup.

For serving/copying instructions and expected behavior, read the recipes.
For assistants without skill support, supply the application guide directly.
Do not install this as universal always-on instructions in unrelated projects.
