---
title: WordPress
description: Enqueue a small Brio enhancement from a plugin with escaped shortcode markup and explicit asset ordering.
sidebar:
  order: 6
---

Use a small plugin or your own theme integration. Do not edit WordPress core,
enqueue a framework once per block instance, or insert unescaped expressions
through post content. See the [shared lifecycle helper](/integrations/overview/).

## A minimal plugin

Create this directory under `wp-content/plugins/`:

```text
brio-counter/
  brio-counter.php
  counter.js
  widgets.js
  vendor/
    brio.min.js
```

Copy [widgets.js](/integrations/widgets.js) into it and self-host Brio's browser
bundle in `vendor`. Save the following as `brio-counter.php`, then activate the plugin:

```php
<?php
/**
 * Plugin Name: Brio Counter Example
 * Description: A local counter demonstrating a Brio widget.
 * Version: 1.0.0
 */
defined('ABSPATH') || exit;

add_action('wp_enqueue_scripts', function () {
    $base = plugin_dir_url(__FILE__);
    wp_enqueue_script('brio-core', $base . 'vendor/brio.min.js', array(), '5.1.0', true);
    wp_enqueue_script('brio-counter', $base . 'counter.js', array('brio-core'), '1.0.0', true);
});

add_shortcode('brio_counter', function () {
    $count = 3;
    return '<section data-brio-counter data-start="' . esc_attr((string) $count) . '" aria-label="Counter">'
        . '<p>Count: <output b-text="$data.count" aria-live="polite">' . esc_html((string) $count) . '</output></p>'
        . '<button type="button" b-on-click="$data.count++">Add one</button>'
        . '</section>';
});
```

Add `[brio_counter]` to a page. Each occurrence gets separate state; no duplicate
IDs are needed. This intentionally enqueues the small demo on all frontend
pages to keep block, shortcode, and theme-template detection out of the example.
In production, enqueue only where the widget can appear, using your theme or
block's asset strategy.

## Bootstrap after the core script

Save this as `counter.js`. It is a classic enqueued script; its dependency
guarantees that `brio` exists. The helper is loaded through a relative dynamic
import, so no module-enqueue version requirement is introduced:

```js
{
  const helperUrl = new URL('./widgets.js', document.currentScript.src);
  import(helperUrl.href).then(({ createWidgetManager }) => {
    const widgets = createWidgetManager(brio.createApp);
    widgets.mountWithin(document);
  }).catch(error => {
    console.error('Unable to initialize Brio counters:', error);
  });
}
```

The bootstrap captures `document.currentScript` synchronously, before the
import completes. Keep these files together and avoid optimization tools
rewriting the bootstrap into a different directory without adjusting the URL.

## Dynamic content and server actions

Normal page navigation needs no custom routing. If your theme or another plugin
replaces page regions, keep the manager accessible to that integration and call
`disposeWithin(oldRegion)` before replacement, then `mountWithin(newRegion)`
afterward. This minimal bootstrap does not claim compatibility with every
page-builder or navigation plugin.

Use WordPress escaping helpers and `wp_json_encode` for real data. Preserve
capability checks and nonces for server mutations; nonces are not authorization.
The demonstration has no AJAX endpoint, database writes, or editor preview
integration.
