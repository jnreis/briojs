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
  API, which made the core bundle about 2 KB smaller.
- ✅ **A plugin starter template**, the `brio-plugin-*` naming convention, and a
  testing helper ([templates/plugin](./templates/plugin/)).

## Next: start faster, share more

- **`npm create brio@latest`**, built on the starter templates.
- **A playground with shareable links** on briojs.com.
- **Brio Parts:** copy-paste accessible widgets (dialog, tabs, disclosure,
  combobox, toast, menu) with live demos.
- **Integration guides** for Rails, Laravel, Django, WordPress, and plain
  server-rendered HTML.
- **A "Built with Brio" showcase.**

## When there is demand

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
