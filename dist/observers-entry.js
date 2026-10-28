import { n as createSyntaxError, O as ObjectConstructor, u as isBoolean, c as createTypeError, f as isNumber, j as isString, h as isInstanceOf, k as isArray, A as ATTRIBUTES, g as getLength, b as createError } from "./native-BneND9DN.js";
import { g as getAttribute, d as getOwnerDocument } from "./native-B0OLxTjP.js";
function observerOptions(element, { directive, modifiers, options }) {
  if (getAttribute(element, "b-options") !== null)
    throw createSyntaxError(`b-options was removed in Brio 5. Configure each observer with ${directive}.options="{ … }".`);
  return ObjectConstructor.assign({}, modifiers, options);
}
function observerTarget(value, element, label) {
  const target = isString(value) ? getOwnerDocument(element).querySelector(value) : value;
  const view = getOwnerDocument(element).defaultView;
  if (!isInstanceOf(target, view.Element) && !isInstanceOf(target, view.Document) && !isInstanceOf(target, view.Text))
    throw createTypeError(`${label} must resolve to an element, document, or text node.`);
  return target;
}
function observerBoolean(options, name, fallback) {
  const value = options[name];
  if (value === void 0) return fallback;
  if (!isBoolean(value)) throw createTypeError(`Observer ${name} must be a boolean.`);
  return value;
}
function observerDelay(options) {
  const value = options.debounce;
  if (value === void 0 || value === false) return;
  if (value === true) return 100;
  if (!isNumber(value) || !Number.isFinite(value) || value < 0)
    throw createTypeError("Observer debounce must be a boolean or non-negative finite milliseconds.");
  return value;
}
function handleIntersection(element, binding) {
  const isExit = binding.directive === "b-on-exit";
  const options = observerOptions(element, binding);
  const isOnce = observerBoolean(options, "once", false);
  const delay = observerDelay(options);
  const root = options.root === void 0 || options.root === null ? null : observerTarget(options.root, element, "Intersection root");
  if ((root == null ? void 0 : root.nodeType) === 3) throw createTypeError("Intersection root cannot be a text node.");
  if (options.rootMargin !== void 0 && !isString(options.rootMargin))
    throw createTypeError("Intersection rootMargin must be a string.");
  const threshold = options.threshold;
  if (threshold !== void 0 && !(isNumber(threshold) ? Number.isFinite(threshold) && threshold >= 0 && threshold <= 1 : isArray(threshold) && threshold.every((value) => isNumber(value) && Number.isFinite(value) && value >= 0 && value <= 1)))
    throw createTypeError("Intersection threshold must be a number or array of numbers between 0 and 1.");
  let debounceTimer;
  let stopped = false;
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (stopped) return;
      const matches = isExit ? !entry.isIntersecting : entry.isIntersecting;
      if (matches) {
        const invoke = () => {
          if (isOnce) {
            stopped = true;
            observer.disconnect();
          }
          binding.run({ $entry: entry });
        };
        if (delay !== void 0) {
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(invoke, delay);
        } else {
          invoke();
        }
      }
    }
  }, {
    root,
    rootMargin: options.rootMargin,
    threshold
  });
  binding.onCleanup(() => {
    clearTimeout(debounceTimer);
    stopped = true;
    observer.disconnect();
  });
  observer.observe(element);
}
const intersection = (name) => ({
  name,
  value: "statement",
  mount: handleIntersection,
  modifiers: ["once", "debounce"],
  options: ["root", "rootMargin", "threshold", "once", "debounce"]
});
const enterDirective = intersection("b-on-enter");
const exitDirective = intersection("b-on-exit");
function handleMutation(element, binding) {
  const { directive } = binding;
  const isAdded = directive === "b-on-addednodes";
  const isRemoved = directive === "b-on-removednodes";
  const isAttrs = directive === "b-on-attrs";
  const isText = directive === "b-on-text";
  const configured = observerOptions(element, binding);
  const target = configured.target === void 0 ? element : observerTarget(configured.target, element, "Mutation target");
  const delay = observerDelay(configured);
  const options = {
    childList: isAdded || isRemoved || !isAttrs && !isText,
    [ATTRIBUTES]: isAttrs,
    characterData: isText,
    subtree: observerBoolean(configured, "subtree", true)
  };
  if (isAttrs) {
    options.attributeOldValue = observerBoolean(configured, "attributeOldValue", false);
    if (configured.attributeFilter !== void 0) {
      if (!isArray(configured.attributeFilter) || !configured.attributeFilter.every((value) => isString(value)))
        throw createTypeError("Mutation attributeFilter must be an array of strings.");
      options.attributeFilter = configured.attributeFilter;
    }
  }
  if (isText) options.characterDataOldValue = observerBoolean(configured, "characterDataOldValue", false);
  let debounceTimer;
  let pending = [];
  const observer = new MutationObserver((mutations) => {
    let matching = [];
    if (isAdded) {
      matching = mutations.filter((m) => getLength(m.addedNodes) > 0);
    } else if (isRemoved) {
      matching = mutations.filter((m) => getLength(m.removedNodes) > 0);
    } else if (isAttrs) {
      matching = mutations.filter((m) => m.type === ATTRIBUTES);
    } else if (isText) {
      matching = mutations.filter((m) => m.type === "characterData");
    } else {
      matching = mutations;
    }
    if (getLength(matching)) {
      const invoke = () => {
        const records = pending;
        pending = [];
        binding.run({ $mutations: records });
      };
      pending.push(...matching);
      if (delay !== void 0) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(invoke, delay);
      } else {
        invoke();
      }
    }
  });
  binding.onCleanup(() => {
    clearTimeout(debounceTimer);
    observer.disconnect();
    pending = [];
  });
  observer.observe(target, options);
}
const mutation = (name, ...extra) => ({
  name,
  value: "statement",
  mount: handleMutation,
  modifiers: ["debounce", "subtree"],
  options: ["target", "subtree", "debounce", ...extra]
});
const addedNodesDirective = /* @__PURE__ */ mutation("b-on-addednodes");
const removedNodesDirective = /* @__PURE__ */ mutation("b-on-removednodes");
const attrsDirective = /* @__PURE__ */ mutation("b-on-attrs", "attributeFilter", "attributeOldValue");
const textDirective = /* @__PURE__ */ mutation("b-on-text", "characterDataOldValue");
function handleResize(element, binding) {
  const options = observerOptions(element, binding);
  const target = observerBoolean(options, "document", false) ? getOwnerDocument(element).documentElement : element;
  const box = options.box ?? "content-box";
  if (box !== "content-box" && box !== "border-box" && box !== "device-pixel-content-box")
    throw createTypeError("Resize box must be content-box, border-box, or device-pixel-content-box.");
  const delay = observerDelay(options);
  let debounceTimer;
  const observer = new ResizeObserver((entries) => {
    const entry = entries[0];
    if (!entry) return;
    const invoke = () => {
      const sizes = box === "border-box" ? entry.borderBoxSize : box === "device-pixel-content-box" ? entry.devicePixelContentBoxSize : entry.contentBoxSize;
      const measured = sizes == null ? void 0 : sizes[0];
      if (box !== "content-box" && !measured)
        throw createError(`ResizeObserver did not supply the requested ${box} measurement.`);
      const vertical = /^(vertical|sideways)/.test(
        getOwnerDocument(element).defaultView.getComputedStyle(entry.target).writingMode
      );
      const size = {
        width: measured ? vertical ? measured.blockSize : measured.inlineSize : entry.contentRect.width,
        height: measured ? vertical ? measured.inlineSize : measured.blockSize : entry.contentRect.height
      };
      binding.run({ $size: size, $entry: entry });
    };
    if (delay !== void 0) {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(invoke, delay);
    } else {
      invoke();
    }
  });
  binding.onCleanup(() => {
    clearTimeout(debounceTimer);
    observer.disconnect();
  });
  observer.observe(target, { box });
}
const resizeDirective = {
  name: "b-on-resize",
  value: "statement",
  mount: handleResize,
  modifiers: ["debounce", "document"],
  options: ["box", "document", "debounce"]
};
const observersPlugin = {
  name: "brio-observers",
  directives: [enterDirective, exitDirective, resizeDirective, addedNodesDirective, removedNodesDirective, attrsDirective, textDirective]
};
export {
  observersPlugin
};
//# sourceMappingURL=observers-entry.js.map
