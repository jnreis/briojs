import { c as createApp } from "./create-app-DBQ5XyFF.js";
import { b as createError, j as isString } from "./native-BneND9DN.js";
import { f as flush } from "./effect-BL1g_AaG.js";
function renderBrio(html, options = {}) {
  const document = globalThis.document;
  if (!document)
    throw createError('renderBrio needs a DOM on globalThis. Run tests with jsdom or happy-dom (for example, the "global-jsdom" package).');
  const root = document.createElement("div");
  root.innerHTML = html;
  document.body.append(root);
  const app = createApp(options);
  let handle;
  try {
    handle = app.mount(root);
  } catch (error) {
    app.dispose();
    root.remove();
    throw error;
  }
  flush();
  const get = (selector) => {
    const element2 = root.querySelector(selector);
    if (!element2) throw createError(`renderBrio: nothing matches "${selector}".`);
    return element2;
  };
  const element = (target) => isString(target) ? get(target) : target;
  return {
    root,
    app,
    handle,
    flush,
    get,
    type(target, value) {
      const control = element(target);
      control.value = value;
      const view = control.ownerDocument.defaultView;
      control.dispatchEvent(new view.Event("input", { bubbles: true }));
      control.dispatchEvent(new view.Event("change", { bubbles: true }));
      flush();
    },
    click(target) {
      element(target).click();
      flush();
    },
    cleanup() {
      app.dispose();
      root.remove();
    }
  };
}
export {
  renderBrio
};
//# sourceMappingURL=testing-entry.js.map
