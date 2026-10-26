---
title: Django
description: Add Brio to Django templates with static assets and optional htmx lifecycle hooks.
sidebar:
  order: 5
---

Django owns routing, templates, and form processing. Brio enhances only the
marked root. Read the [ownership and data boundaries](/integrations/overview/)
before adding partial-page navigation.

## Static files

Place the Brio browser bundle at `myapp/static/myapp/brio.min.js`. Copy
[widgets.js](/integrations/widgets.js) alongside it, and add `counter.js`:

```js
import { createWidgetManager } from './widgets.js';

const widgets = createWidgetManager(brio.createApp);
widgets.mountWithin(document);
```

In your template, render `initial_count` from a view that supplies a validated
integer (for example, `{"initial_count": 3}`):

```django
{% load static %}
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>A Django page with Brio</title>
  <script defer src="{% static 'myapp/brio.min.js' %}"></script>
  <script type="module" src="{% static 'myapp/counter.js' %}"></script>
</head>
<body>
  <section data-brio-counter data-start="{{ initial_count }}" aria-label="Counter">
    <p>Count: <output b-text="$data.count" aria-live="polite">{{ initial_count }}</output></p>
    <button type="button" b-on-click="$data.count++">Add one</button>
  </section>
</body>
</html>
```

Django escapes attributes and text. `$data.count` is a Brio expression, not a
Django template variable. Keep these scripts in your base template so partials
do not register duplicate listeners.

## If you use htmx

Add these listeners to the same `counter.js`, before or after its initial
mount. They do not require htmx when it is absent:

```js
document.addEventListener('htmx:beforeCleanupElement', event => {
  widgets.disposeWithin(event.detail.elt);
});
document.addEventListener('htmx:load', event => {
  widgets.mountWithin(event.detail.elt);
});
```

`beforeCleanupElement` releases widgets before a normal swap removes their
DOM. `htmx:load` mounts newly inserted content, including when the new root
itself is a counter. Repeated load events do not duplicate mounts.

This covers normal htmx replacement, not arbitrary morph extensions mutating
Brio-owned children in place. Configure those extensions around ownership
boundaries or dispose the affected region before morphing it. Brio state
resets when a region is replaced.

## Data and real forms

For larger initial data use Django's `json_script`, then parse the element's
`textContent`; do not use `safe` to insert raw JSON into executable JavaScript.
The counter only needs a numeric attribute.

Retain `{% csrf_token %}` for server forms and follow Django's CSRF guidance for
unsafe fetch requests. Surface server validation and network failures. Brio
does not make an optimistic local counter into a persisted server value.
