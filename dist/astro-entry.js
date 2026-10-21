import { i as isFunction, c as createTypeError, o as objectConstructor, b as createError, e as objectEntries, d as deleteItem, g as getLength, f as isObjectType, a as arrayFrom, h as isNumber, j as isInstanceOf } from "./native-DNTl55LH.js";
import { a as addEventListener, r as removeEventListener, g as getAttribute } from "./native-Di2Lf1wo.js";
import { c as copyContextValues, e as evaluate } from "./context-values-DGLwTbXl.js";
import { a as combinedError } from "./effect-BTu8V88D.js";
const lazyMarker = Symbol("brio.astro.lazy");
function lazyApp(load) {
  if (!isFunction(load)) throw createTypeError("lazyApp requires a module loader.");
  return objectConstructor.freeze({ [lazyMarker]: true, load });
}
const installations = /* @__PURE__ */ new WeakSet();
const ownedApps = /* @__PURE__ */ new WeakSet();
const persistAttribute = "data-astro-transition-persist";
function enhanceAstro(options) {
  if (typeof document === "undefined") throw createError("enhanceAstro requires a browser document.");
  if (!options || !isFunction(options.onError))
    throw createTypeError("enhanceAstro requires onError(error, root).");
  const apps = objectConstructor.create(null);
  for (const [name, entry] of objectEntries(copyContextValues(options.apps, "Astro apps"))) {
    if (!name.trim() || !isFactory(entry) && !isLazy(entry))
      throw createTypeError(`Invalid Astro app registration "${name}".`);
    apps[name] = entry;
  }
  const doc = document;
  if (installations.has(doc)) throw createError("Brio Astro enhancement is already installed.");
  installations.add(doc);
  const islands = /* @__PURE__ */ new Map();
  const loads = /* @__PURE__ */ new Map();
  let disposed = false;
  const report = (error, root) => {
    try {
      options.onError(error, root);
    } catch (callbackError) {
      queueMicrotask(() => {
        throw callbackError;
      });
    }
  };
  const release = (island, restore) => {
    island.active = false;
    deleteItem(islands, island.root);
    if (island.app) island.app.dispose({ restore });
  };
  const mount = (island, factory, props) => {
    if (disposed || !island.active || !doc.contains(island.root)) return;
    const app = factory(island.root, props);
    if (!app || !isFunction(app.mount) || !isFunction(app.dispose) || !app.roots || !isNumber(app.roots.size))
      throw createTypeError("Astro app factory must return a fresh unmounted Brio app.");
    if (ownedApps.has(app) || app.roots.size)
      throw createTypeError("Astro app factory must return a fresh unmounted Brio app.");
    ownedApps.add(app);
    island.app = app;
    if (disposed || !island.active || !doc.contains(island.root)) {
      try {
        app.dispose();
      } catch (error) {
        report(error, island.root);
      }
      return;
    }
    try {
      app.mount(island.root);
    } catch (error) {
      try {
        app.dispose();
      } catch (cleanupError) {
        throw combinedError("Astro app mounting and cleanup failed.", [error, cleanupError]);
      }
      throw error;
    }
  };
  const fail = (island, error) => {
    if (!disposed && island.active) report(error, island.root);
  };
  const discover = () => {
    var _a;
    if (disposed) return;
    for (const island of islands.values()) {
      if (!doc.contains(island.root)) {
        try {
          release(island, false);
        } catch (error) {
          report(error, island.root);
        }
      }
    }
    const roots = arrayFrom(doc.querySelectorAll("[b-app]"));
    for (const root of roots) {
      if (islands.has(root)) continue;
      const island = { root, active: true };
      islands.set(root, island);
      try {
        if (((_a = root.parentElement) == null ? void 0 : _a.closest("[b-app]")) || root.querySelector("[b-app]"))
          throw createError("Brio Astro islands cannot be nested.");
        const name = getAttribute(root, "b-app");
        if (!objectConstructor.prototype.hasOwnProperty.call(apps, name))
          throw createError(`Unknown Brio Astro app "${name}".`);
        const source = getAttribute(root, "b-props");
        const props = objectConstructor.freeze(copyContextValues(
          source === null ? {} : evaluate(source, { $el: root }),
          "b-props"
        ));
        const entry = apps[name];
        if (typeof entry === "function") {
          mount(island, entry, props);
        } else if (isLazy(entry)) {
          let pending = loads.get(entry);
          if (!pending) {
            pending = Promise.resolve().then(() => entry.load()).then((module) => {
              if (!isFunction(module == null ? void 0 : module.default))
                throw createTypeError("Lazy Astro module must default-export an app factory.");
              return module.default;
            });
            loads.set(entry, pending);
          }
          void pending.then((factory) => {
            try {
              mount(island, factory, props);
            } catch (error) {
              fail(island, error);
            }
          }, (error) => fail(island, error));
        }
      } catch (error) {
        fail(island, error);
      }
    }
  };
  const beforeSwap = (event) => {
    const incoming = "newDocument" in event ? event.newDocument : void 0;
    if (!isInstanceOf(incoming, Document)) {
      for (const island of islands.values())
        report(createTypeError("Astro before-swap requires newDocument."), island.root);
      return;
    }
    const names = new Set(arrayFrom(incoming.querySelectorAll(`[${persistAttribute}]`), (element) => getAttribute(element, persistAttribute)));
    for (const island of islands.values()) {
      let ancestor = island.root;
      let retained = false;
      while (ancestor) {
        if (ancestor.hasAttribute(persistAttribute) && names.has(getAttribute(ancestor, persistAttribute))) {
          retained = true;
          break;
        }
        ancestor = ancestor.parentElement;
      }
      if (!retained) {
        try {
          release(island, false);
        } catch (error) {
          report(error, island.root);
        }
      }
    }
  };
  addEventListener(doc, "astro:before-swap", beforeSwap);
  addEventListener(doc, "astro:page-load", discover);
  discover();
  return {
    dispose() {
      if (disposed) return;
      disposed = true;
      removeEventListener(doc, "astro:before-swap", beforeSwap);
      removeEventListener(doc, "astro:page-load", discover);
      const errors = [];
      for (const island of islands.values()) {
        try {
          release(island, true);
        } catch (error) {
          errors.push(error);
        }
      }
      deleteItem(installations, doc);
      if (getLength(errors)) throw combinedError("Brio Astro disposal failed.", errors);
    }
  };
}
function isLazy(value) {
  return value !== null && isObjectType(value) && lazyMarker in value && value[lazyMarker] === true && "load" in value && isFunction(value.load);
}
function isFactory(value) {
  return isFunction(value);
}
export {
  enhanceAstro,
  lazyApp
};
//# sourceMappingURL=astro-entry.js.map
