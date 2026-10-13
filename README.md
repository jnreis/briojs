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
  <button b-on-click="count++">Count: <span b-text="count"></span></button>
</div>
```

Read the [vNext documentation](./DOCUMENTATION.md) for widgets, multi-page sites, SPAs, components, reactivity, persistence, routing, and the breaking v4 migration.
