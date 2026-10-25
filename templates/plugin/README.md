# Brio plugin starter

Everything you need to publish a [Brio.js](https://briojs.com) plugin: a
`b-copy` directive and a `$copy` helper, tests that run in Node, editor
autocomplete for your directive, and a demo page.

```sh
npm install
npm test      # node --test with jsdom
npm run dev   # the demo in index.html
```

- `src/index.js`: the plugin. `defineDirective` and `definePlugin` only add
  types; the plugin is a plain object.
- `test/copy.test.js`: tests with `renderBrio` from `@jnreis/briojs/testing`.
- `html-custom-data.json`: VS Code autocomplete for `b-copy`. Ship it with the
  package so users can add it to their own `html.customData`.
- `index.html` and `src/demo.js`: a page to try the plugin by hand.

## Use it in an app

```js
import { createApp } from '@jnreis/briojs';
import copyPlugin from 'brio-plugin-copy';

createApp({ plugins: [copyPlugin] }).mount('#app');
// or: createApp().use(copyPlugin).mount('#app');
```

```html
<button b-copy="$data.link">Copy link</button>
<button b-on-click="$copy('hello')">Copy hello</button>
```

## Make it yours

1. Rename the package. Community plugins are named `brio-plugin-<name>`
   (or `@you/brio-plugin-<name>`) and keep the `brio-plugin` keyword, so people
   can find them on npm.
2. Rename the directive. Plugin directives must start with `b-`, use lowercase
   kebab-case, and cannot reuse a built-in name.
3. Choose hooks: `mount` for most behavior, `ready` when you need the element's
   children hydrated first, and `scope` to give descendants a `$name`. See
   [Write a plugin](https://briojs.com/reference/plugins/).
4. Remove `"private": true` and run `npm publish`.

## Rules your users can count on

- Plugins never change built-in directives, and two plugins cannot claim the
  same name: the conflict is reported when the second one installs.
- Everything registered through `binding.on`, `binding.effect`, and
  `binding.onCleanup` is released when the element leaves the page.

[Plugin docs](https://briojs.com/reference/plugins/) ·
[Directives](https://briojs.com/reference/html-directives/) ·
[Examples](https://briojs.com/examples/)
