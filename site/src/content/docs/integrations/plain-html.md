---
title: Plain HTML and Express
description: A runnable no-build Brio enhancement and an Express static-files setup.
sidebar:
  order: 2
---

Brio can enhance a static page or any server-rendered response. Start with
the [working example](/integrations/counter.html) and the shared
[lifecycle contract](/integrations/overview/).

## Files, not a framework plugin

Create a `public` folder containing:

```text
public/
  index.html
  counter.js
  widgets.js
  vendor/
    brio.min.js
```

Copy [widgets.js](/integrations/widgets.js) into that folder. Copy
`dist/brio.min.js` from your Brio installation into `public/vendor/`.

Save this as `index.html`:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>A little Brio</title>
  <script defer src="/vendor/brio.min.js"></script>
  <script type="module" src="/counter.js"></script>
</head>
<body>
  <h1>A server page with a local interaction</h1>
  <section data-brio-counter data-start="3" aria-label="Counter">
    <p>Count: <output b-text="$data.count" aria-live="polite">3</output></p>
    <button type="button" b-on-click="$data.count++">Add one</button>
  </section>
</body>
</html>
```

Save this as `counter.js`:

```js
import { createWidgetManager } from './widgets.js';

const widgets = createWidgetManager(brio.createApp);
widgets.mountWithin();
```

Serve `public` over HTTP using your existing server, not `file://`.
Keep the core script before the module and do not add `async`. The module
runs after parsing; the target HTML exists before it mounts.

## Express

In a new example folder, initialize an npm project and install Express:

```sh
npm init -y
npm install express
```

Place the files above in `public`. Save this as `server.mjs`, alongside it:

```js
import express from 'express';
import { fileURLToPath } from 'node:url';

const app = express();
app.use(express.static(fileURLToPath(new URL('./public/', import.meta.url))));
app.listen(3000, () => console.log('Open http://localhost:3000'));
```

Run `node server.mjs`. Express serves the page and assets; the browser owns
only the local counter. No server mutation endpoint is being demonstrated.

For EJS, Pug, or another view engine, use its escaped output syntax for server
values. Validate the counter's starting value as a safe integer, and render it
both in `data-start` and as the output's fallback text.

## Existing npm entrypoint

If your application already has a bundler, replace the browser-global setup
with:

```js
import { createApp } from '@jnreis/briojs';
import { createWidgetManager } from './widgets.js';

const widgets = createWidgetManager(createApp);
widgets.mountWithin();
```

Normal full-page navigation needs no custom routing. If your own code replaces
HTML, call `disposeWithin(oldRegion)` before replacement and
`mountWithin(newRegion)` afterward. Keep server forms, validation, and
authorization on the server.
