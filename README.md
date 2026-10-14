# Brio.js

Brio is a petite, HTML-first framework for reactive widgets and web apps. It enhances the real DOM in place, with a small reactive core, scoped cleanup, reusable HTML components, and optional persistence and routing.

```sh
npm install briojs
```

```js
import { createApp } from 'briojs';

createApp({ state: () => ({ count: 0 }) }).mount('#counter');
```

```html
<div id="counter">
  <button b-on-click="$data.count++">Count: <span b-text="$data.count"></span></button>
</div>
```

Read the [vNext documentation](./DOCUMENTATION.md) for widgets, multi-page sites, SPAs, components, reactivity, persistence, routing, and the breaking v4 migration.

For standalone browser use, load `dist/brio.min.js` in production or
`dist/brio.dev.min.js` during development. Both expose `window.brio`; the
development bundle also includes the live inspector and its tracking tools.
Use `app.insert(target, placement, content, options?)` for managed dynamic content,
or `$insert(...)` inside directives and scripts.

## Building with AI assistants

The package ships a [portable AI developer kit](./ai/README.md) with a
[Brio v4 application guide](./ai/brio-apps/references/guide.md), an installable
skill, and tested widget, multi-page, and SPA recipes. Use the guide directly,
or copy the complete skill folder into your assistant's supported discovery
location. Installing Brio does not automatically activate the skill.
