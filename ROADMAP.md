# Roadmap

Where Brio is headed next. Priorities can change as people build with it, so
treat this as a direction, not a promise. Ideas and feedback are welcome in
[Discussions](https://github.com/jnreis/briojs/discussions).

## Done: easier to try, ask about, and find

- ✅ **Starter templates** for a widget, multi-page site, SPA, and Astro
  islands, each one click away in StackBlitz ([templates/](./templates/)).
- ✅ **Editor autocomplete** for every `b-` directive through VS Code's
  `html.customData`, generated from one directive manifest.
- ✅ **llms.txt** and **llms-full.txt** on briojs.com, so AI assistants can
  read the docs.
- ✅ **Issue and pull request templates.**

## Done: let others extend Brio

- ✅ **A public plugin API** for custom `b-` directives, `$helpers`, and app
  lifecycle hooks, with clear rules for naming, ordering, and cleanup
  ([docs](https://briojs.com/reference/plugins/)).
- ✅ **Proof that it works:** Brio 5's own add-ons (inputs with `b-mask` and
  `b-form`, observers, and the router outlet) are plugins built on the public
  API, keeping their directives out of the core bundle.
- ✅ **A plugin starter template**, the `brio-plugin-*` naming convention, and a
  testing helper ([templates/plugin](./templates/plugin/)).

## Next: start faster, share more

- ✅ **Project scaffolder implemented:** all five templates in JavaScript or
  TypeScript, with prompts, automation flags, and non-destructive generation.
  The separate [`create-brio` package](./packages/create-brio/) is prepared
  locally; `npm create brio@latest` becomes available after publication.
- ✅ **A playground with shareable links** at `/play/`:
  Monaco HTML/CSS/JavaScript editors, an isolated preview, the
  homepage creature, and compressed URL-fragment sharing. Shared code waits
  for an explicit Run.
- ✅ **Brio Parts:** a dedicated
  three-column `/parts/` directory of copy-paste components, starting
  with disclosure/accordion, tabs, native dialog, and an action menu. Each gets
  a detail-page live demo, a template with embedded scoped CSS, an app-registerable
  definition, a playground link, and documented accessibility and keyboard behavior.
- ✅ **Integration guides:** Rails,
  Laravel, Django, WordPress, and plain HTML/Express, with a runnable baseline
  and a shared lifecycle helper. No Brio Vite plugin.

## When there is demand

- A "Built with Brio" showcase and `awesome-brio`, once there are real projects
  and community resources to feature.
- A full VS Code extension: highlighting and completion inside `b-`
  expressions.
- JetBrains web-types generated from the directive manifest.
- A devtools browser extension.

## Want to help?

Look for issues labeled
[`good first issue`](https://github.com/jnreis/briojs/labels/good%20first%20issue)
or [`help wanted`](https://github.com/jnreis/briojs/labels/help%20wanted), and
read [CONTRIBUTING.md](./CONTRIBUTING.md) for local setup and tests. Built
something with Brio? Share it in
[Show and tell](https://github.com/jnreis/briojs/discussions).
