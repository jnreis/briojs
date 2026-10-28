---
title: How Brio fits
description: Choose a widget, multi-page enhancement, or single-page app without changing frameworks.
editUrl: https://github.com/jnreis/briojs/blob/main/site/src/content/docs/start/how-brio-fits.md
---

Brio enhances the real DOM in place. You can use a little of it without handing
over the whole page, and add capabilities as your app needs them.

## A widget inside another app

Mount Brio around a form, menu, calculator, or other independent element.
Keep roots non-overlapping. Share data deliberately through stores, not an
implicit global app.

The host owns navigation and removal. Unmount the widget before its host removes
the element. Brio cleans up its owned effects, listeners, observers, and resources.

## A server-rendered multi-page site

Keep server routes, ordinary links, and server-rendered content. Mount interactive
regions on each page. There is no Brio server runtime to install.

For client-side page swaps, explicitly clean up outgoing roots and mount fresh
markup. The [lifecycle reference](/reference/app-and-lifecycle-api/) covers
persistent islands and [Astro integration](/reference/app-and-lifecycle-api/#astro-islands).

## A single-page app

Add the optional router, reusable components, shared stores, and async resources.
Use history mode when your server can serve the app entry for nested routes.
Use hash mode on static hosting that cannot rewrite routes, including GitHub Pages.

Routing, persistence, HTTP, validation, step navigation, and money formatting are
optional tools. Browser plugins load after core; npm entries are tree-shakable.

## Is Brio the right fit?

Brio is useful when you value authored HTML, explicit JavaScript, lightweight
integration, and predictable ownership. It is not a framework server renderer
or a complete application backend. Pages with a strict CSP can use the
[CSP build](/reference/trusted-html-and-expression-security/#strict-csp-build)
(Brio 5.1+).

Choose the architecture that fits your project. You do not need client routing
to add one useful widget.

Next: [components](/reference/components/),
[reactivity](/reference/reactive-primitives/), and
[routing](/reference/three-ways-to-use-brio/).
