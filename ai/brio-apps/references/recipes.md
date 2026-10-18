# Brio application recipes

These assets are small executable v4 examples, not an application generator.
Adapt their root IDs, deployment paths, state, labels, and integration to the
consuming project. No external API, dependency installation, or internet access
is required to run them once the Brio browser bundle is available.

## Running the assets

Copy the chosen HTML into the application's served directory. Copy
`node_modules/briojs/dist/brio.min.js` alongside it as `brio.min.js`, or change
its script URL to the actual served production bundle. During development use
the development bundle instead, never both. The copies are ordinary application
assets; installing the skill does not make their relative bundle URL resolve.
Also serve the plugin scripts referenced by the chosen HTML: the multi-page
recipe needs `brio.persistence.min.js` and `brio.forms.min.js`. The SPA needs
`brio.router.min.js`. The widget needs only the core. Plugins load after the
core and before bootstrap, with the same URLs for development.

Serve over HTTP with the app's existing server. Do not assume that a repository
`/dist/` URL exists in production. For the SPA, serve its HTML at `/` and configure
the server to return it for `/items/:id` direct loads. Avoid serving this root-
based example under a subpath without adapting its routes and URLs.
The SPA deliberately uses `/brio.min.js` so refreshing a nested route does not
request the bundle from `/items/brio.min.js`. Serve that bundle at the site root
or replace the URL with your application's stable asset URL.

The examples dispose on pagehide only when `event.persisted` is false.
Cached documents keep their existing mounts; do not remount on pageshow.
Embedded applications must integrate unmount/dispose with their host lifecycle
before removing roots, using `{ restore: false }` for outgoing DOM.
For client-side swaps, dispose page-local apps before replacement and mount
fresh server markup afterward. Keep actual host-preserved roots mounted and
track roots by Element identity to avoid duplicate enhancement.

For Astro, use the optional `briojs/astro` entry rather than writing a
counter-specific coordinator. Install one shared
`enhanceAstro({ apps, onError })` registry from a layout; declare `b-app` roots
and read-once trusted `b-props`. Eager factories and `lazyApp` module loaders
share the same `(root, props)` factory contract. The adapter handles ClientRouter
cleanup and persistent root/ancestor lifetimes. See the main documentation's
Astro islands section for setup, errors, HMR and safe server-data transfer.

## Widget

The widget enhances only `#widget`; the surrounding host button is unaffected.
Two nested loops demonstrate independent loop ancestry. A child local scope
writes shared state through `$data.$parent`.

Try:

1. Increment shared count and a nested conditional counter.
2. Hide/re-show the conditional branch: its counter resets.
3. Hide/re-show the `b-if.detach` branch: its counter survives.
4. Insert content, increment its local counter, and remove it.
5. Trigger the external pulse event while mounted; dispose before host removal.

Dynamic insertion's local data is separate from app data. HTML is authored code;
do not replace it with unsanitized server/user content.

## Multi-page form enhancement

The form uses normal server-page navigation; it does not install a router.
`b-id` connects the email label and input. Model trimming and validation are
explicit. The submit handler shows validation status but intentionally performs
no network submission; implement server submission and visible failures for a
real application. Server validation remains necessary.

The component persists only a non-sensitive theme preference using a
demonstration-specific localStorage key. It is created inside component setup,
not the app state factory. Choose your own key in an actual app.

Try invalid/valid email input, verify status messages, change the theme, and
reload to verify persistence. Supply an actual `/account` server page to test
the ordinary link destination.

## Routed SPA

The router matches `/` and `/items/:id`. Home projects caller-context content
into a counter component, binds its label prop, and handles emitted counts.
The item page reads parameters from `app.router.current.value`.

Try a counter update, navigate to Item 42, change to another item through
`app.router.navigate`, and use back/forward. Returning home creates fresh
component-local state. The item's external pulse listener is removed on route
exit; retained references must no longer respond.

Unmatched routes are not a built-in 404 page. Implement the application's
fallback/server behavior deliberately. This example is not SSR or a route
loader/data-fetching abstraction.

## ESM adaptation

Replace the bundle tag with an application module entry, import `createApp`
from `briojs`, and import optional router/persistence APIs from their subpaths.
Keep those imports in module code; expressions cannot resolve arbitrary module
locals. State methods can close over imported helpers:

```js
import { createApp, validate } from 'briojs';

const app = createApp({
  state: () => ({
    email: '',
    status: '',
    submit() {
      const result = validate({ email: this.email }, {
        email: [{ name: 'required' }, { name: 'email' }],
      });
      this.status = result === true ? 'Valid' : result.email.join('; ');
    },
  }),
});
app.mount('#form');
```

The markup calls `$data.submit()`, not an unresolved `validate(...)` import.
For async methods, expose loading/error state and cancel owned requests on
teardown. No recipe requires implicit global state fields.

## Testing generated applications

Use the actual asset/application markup, not a rewritten test-only approximation.
Assert observable output and cleanup: stored old buttons/listeners must stop
responding after disposal. Test both valid and failing inputs, shared versus
local state, keyed updates, direct SPA links, and ordinary MPA navigation.
Browser tests are needed for real transitions, focus/caret, observer support,
and host navigation; DOM simulation alone is not sufficient.
