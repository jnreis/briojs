import type { BrioApp } from '@jnreis/briojs';

/** Mount a fresh app on each registered widget element. */
export function mountWidgets(registry: Record<string, (element: HTMLElement) => BrioApp>, root: ParentNode = document) {
  const apps: BrioApp[] = [];
  for (const element of root.querySelectorAll<HTMLElement>('[data-widget]')) {
    const create = registry[element.dataset.widget ?? ''];
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
