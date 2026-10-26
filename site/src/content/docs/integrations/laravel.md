---
title: Laravel
description: Enhance Blade with Brio using Laravel's existing Vite entrypoint and explicit Livewire ownership boundaries.
sidebar:
  order: 4
---

Blade renders the page. Brio owns only a marked widget. No Brio Vite plugin is
needed; Laravel's existing asset pipeline is enough. Start with the
[shared lifecycle helper](/integrations/overview/).

## Blade

```blade
@php($count = 3)
<section data-brio-counter data-start="{{ $count }}" aria-label="Counter">
  <p>Count: <output b-text="$data.count" aria-live="polite">{{ $count }}</output></p>
  <button type="button" b-on-click="$data.count++">Add one</button>
</section>
```

Blade escapes the server value. Brio's `$data` syntax does not use Blade's
double braces. Keep expressions developer-authored; never insert raw user input
into directive attributes.

## Existing Vite entrypoint

Install `@jnreis/briojs` with your app's package manager and copy
[widgets.js](/integrations/widgets.js) to `resources/js/brio-widgets.js`.
Add this to `resources/js/app.js`:

```js
import { createApp } from '@jnreis/briojs';
import { createWidgetManager } from './brio-widgets.js';

const widgets = createWidgetManager(createApp);
const mount = () => widgets.mountWithin(document);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount, { once: true });
} else {
  mount();
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => widgets.disposeWithin(document));
}
```

Load it once in your Blade layout using the application's existing
`@vite('resources/js/app.js')` setup. The HMR cleanup disposes the previous
entrypoint's widgets before its replacement mounts them.

## If you use Livewire

Do not let Livewire and Brio morph the same subtree. Put `wire:ignore` on the
Brio root if the widget's contents belong entirely to Brio. That attribute
does not prevent the whole root from being removed by an ancestor update:
dispose it before such a removal and mount newly inserted roots afterward.

For Livewire Navigate, register these listeners **once** in the app entrypoint
above, not in each page fragment:

```js
document.addEventListener('livewire:navigating', () => {
  widgets.disposeWithin(document);
});
document.addEventListener('livewire:navigated', mount);
```

These navigation hooks do not cover every Livewire component morph. Use the
appropriate pre-removal hooks for your installed Livewire version, or keep
Brio outside Livewire-managed regions. `wire:ignore` is an ownership boundary,
not a universal lifecycle integration.

## Keep backend behavior on the backend

Use normal Blade forms with `@csrf`, Laravel authorization, validation, and
rendered errors. The sample counter is local UI state only. For richer server
data use Laravel's JSON serialization helpers, not unescaped JavaScript
interpolation. Without a bundler, follow the
[self-hosted browser bundle setup](/integrations/plain-html/).
