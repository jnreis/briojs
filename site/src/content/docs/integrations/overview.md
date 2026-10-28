---
title: Brio in your stack
description: Enhance server HTML with small Brio widgets, explicit DOM ownership, and cleanup before navigation or replacement.
sidebar:
  order: 1
---

Your server keeps its routes, templates, authentication, and forms. Brio owns
only the regions you mount. You do not need a Vite plugin, a client router, or
a full-page app to add an interaction.

- [Plain HTML and Express](/integrations/plain-html/): the complete working baseline.
- [Rails](/integrations/rails/): ERB and Turbo page/frame lifecycle.
- [Laravel](/integrations/laravel/): Blade and navigation boundaries.
- [Django](/integrations/django/): templates, static files, and optional htmx swaps.
- [WordPress](/integrations/wordpress/): an enqueued enhancement, without modifying core.

For ready-made interactions, start with [Brio Parts](/parts/). These guides use
a small counter so that the host integration stays visible.

## Try the baseline

[Open the working server-HTML example](/integrations/counter.html).
It loads the same Brio browser build as this site. No client-side routing,
forms interception, persistence, or simulated server is involved.

## A shared lifecycle helper

Download [widgets.js](/integrations/widgets.js) into your application's JavaScript
or static assets. It exports `createWidgetManager(createApp)`, a small example
helper, **not a Brio API or a new package**. Every guide below uses this exact file.

```js
import { createApp } from '@jnreis/briojs';
import { createWidgetManager } from './widgets.js';

const widgets = createWidgetManager(createApp);
widgets.mountWithin(document);
```

The helper recognizes this server-rendered markup:

```html
<section data-brio-counter data-start="3" aria-label="Counter">
  <p>Count: <output b-text="$data.count" aria-live="polite">3</output></p>
  <button type="button" b-on-click="$data.count++">Add one</button>
</section>
```

`data-start` must be a safe integer. The displayed fallback and attribute must
represent the same server value. Ordinary text remains readable without
JavaScript; the demo button simply has no behavior. For a real transaction,
keep a working server form rather than making JavaScript the only path.

## Ownership and replacement

The helper tracks each root by element identity. Mounting the same root again
does nothing; different roots get independent app state. It includes the passed
element itself, so it works for both a document and an inserted widget root.

Before your host removes or morphs a region:

```js
widgets.disposeWithin(region);
// Let the host replace the HTML.
widgets.mountWithin(newRegion);
```

Disposal releases Brio listeners and effects and restores the original markup.
It must happen **before** removal, not in a disconnected-element sweep afterward.
Do not nest these mounted roots or let another renderer mutate a live Brio-owned
subtree. Dispose and remount, or configure the host to leave it alone.

The helper deliberately resets transient state during navigation or replacement.
Persist important drafts explicitly; do not treat DOM caching as data storage.
Brio Parts are component definitions: register them on the app that owns the
region before mounting, then use their custom tags inside it. They do not need
another app per instance. Adapt this counter helper's app construction to register
the components you use rather than mounting counters on unrelated markup.
Disclosure, Tabs, and Menu take content from parent state with `b-prop-content`,
including labels and keyed items. The Parts source view shows the expected data shape.
Use slots for custom markup. Dialog takes an `open` prop and body, title, and
footer slots; handle `request-close` by updating parent state. Slotted forms,
validation, persistence, and closing belong to the parent. Menu `action` events
provide `$event.detail.id` and `$event.detail.label`. The components do not
embed example content or application-specific persistence.

## Server data and security boundaries

- Serialize with your framework's JSON helpers, not JavaScript string concatenation.
  For this counter, the only input is a server-validated integer in an escaped attribute.
- Keep `b-*` expressions developer-authored. Do not compile user-supplied templates.
  Display user text with `b-text`, not unsanitized `b-html`.
- Everything inside a mounted root is a template, including text. Escaping does
  not stop `${...}` in rendered user text from running. Wrap user content in
  `<span b-ignore>`, never put server values inside a `b-*` expression, and see
  [Server-rendered user content](/reference/trusted-html-and-expression-security/#server-rendered-user-content).
- Preserve server authorization, validation, CSRF protection, and error responses.
  Brio does not replace any of them. The counter never sends data to the server.
- The standard build's runtime expressions require CSP `script-src` permission
  for `unsafe-eval`. Externalizing bootstrap scripts avoids inline-script
  requirements, but does **not** remove this expression requirement. If your
  policy prohibits it, use the
  [CSP build](/reference/trusted-html-and-expression-security/#strict-csp-build)
  (Brio 5.1+): it needs no `unsafe-eval`, and only component templates defined
  in JavaScript activate.
- Use an exact release or self-hosted build. Load core before add-ons; install
  npm plugins before mounting. None of these examples requires an add-on.

## Choosing an asset path

With an existing bundler, import `createApp` from `@jnreis/briojs`. Use your
stack's asset helper for the entrypoint; no special Brio plugin is required.

Without a bundler, self-host `dist/brio.min.js`, then load a module that passes
`brio.createApp` to the helper. The [plain HTML guide](/integrations/plain-html/)
shows the complete file layout and ordering.
