/** Mount a fresh app on every `[data-widget]` element whose name is registered. */
export function mountWidgets(registry, root = document) {
  const apps = [];
  for (const element of root.querySelectorAll('[data-widget]')) {
    const create = registry[element.dataset.widget];
    if (!create) {
      console.warn(`No widget named "${element.dataset.widget}".`, element);
      continue;
    }
    const app = create(element);
    app.mount(element);
    apps.push(app);
  }
  addEventListener('pagehide', event => {
    if (!event.persisted) for (const app of apps) app.dispose({ restore: false });
  });
  return apps;
}
