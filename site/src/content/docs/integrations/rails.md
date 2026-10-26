---
title: Rails
description: Mount Brio in ERB and dispose widgets before Turbo caches or replaces their DOM.
sidebar:
  order: 3
---

Keep Rails routes, ERB, forms, and authentication. Brio enhances a small
region rather than replacing your Rails frontend. See the
[shared helper and ownership rules](/integrations/overview/) first.

## ERB

In a view, use a server-controlled integer. This example starts at three:

```erb
<% count = 3 %>
<section data-brio-counter data-start="<%= count %>" aria-label="Counter">
  <p>Count: <output b-text="$data.count" aria-live="polite"><%= count %></output></p>
  <button type="button" b-on-click="$data.count++">Add one</button>
</section>
```

The `$data` expressions are Brio's; ERB leaves them alone. Escape real server
values using Rails helpers. Do not mark user input `html_safe` to construct
Brio expressions.

## Existing JavaScript bundler

Install `@jnreis/briojs` with your app's package manager. Copy
[widgets.js](/integrations/widgets.js) to `app/javascript/brio-widgets.js`.
In your existing application entrypoint:

```js
import { createApp } from '@jnreis/briojs';
import { createWidgetManager } from './brio-widgets.js';

const widgets = createWidgetManager(createApp);
const mount = () => widgets.mountWithin(document);
const dispose = () => widgets.disposeWithin(document);

document.addEventListener('turbo:load', mount);
document.addEventListener('turbo:before-cache', dispose);
document.addEventListener('turbo:before-render', dispose);
document.addEventListener('turbo:before-frame-render', event => {
  widgets.disposeWithin(event.target);
});
document.addEventListener('turbo:frame-load', event => {
  widgets.mountWithin(event.target);
});
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount, { once: true });
} else {
  mount();
}
```

Include this entrypoint once through your existing Rails asset setup.
Initial mounting and Turbo load are safe to repeat because the helper tracks
root identity.

Before caching or rendering another page, disposal restores the original
markup. Back/forward restoration therefore remounts the server's initial
counter, not stale reactive DOM. Save important state explicitly if that is
not the behavior your application needs.

This recipe covers Turbo Drive's normal replacement and frame rendering.
Do not use `data-turbo-permanent` on these ephemeral roots. Turbo Streams or
morph rendering need cleanup **before each affected root is mutated**, followed
by mounting the new HTML. The page events alone do not make arbitrary morphing
inside a live Brio subtree safe.

## Importmap or no bundler

Do not pin the npm package's entry file alone and assume its relative chunks
are installed. Instead, self-host the browser bundle through Rails' asset
pipeline, load it before an external bootstrap module, and pass
`brio.createApp` into the same helper. Use your Rails asset URL helpers rather
than copying development-only paths. The [plain HTML guide](/integrations/plain-html/)
shows the equivalent loading order.

## Forms stay Rails forms

Use `form_with`, Rails' authenticity tokens, server validation, and ordinary
error rendering. The counter has no server effects. If you add fetch-based
saves, preserve CSRF headers and display failed responses; do not treat a
local state update as a successful save.
