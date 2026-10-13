import { c as causedError, e as effect, o as onCleanup, a as createScope, s as state, b as batch, d as combinedError, n as notifyAppCreated, f as notifyRootUnmounted, g as notifyRootMounted, h as notifyAppDisposed } from "./reactivity-bRcZEPpQ.js";
import { j, k } from "./reactivity-bRcZEPpQ.js";
import { persist } from "./reactivity.js";
import { createRouter } from "./router-entry.js";
const valueExpressions = /* @__PURE__ */ new Map();
const statementExpressions = /* @__PURE__ */ new Map();
const assignmentExpressions = /* @__PURE__ */ new Map();
function createExpressionScope(...sources) {
  const globals = globalThis;
  return new Proxy(/* @__PURE__ */ Object.create(null), {
    has(_target, key) {
      return key !== Symbol.unscopables;
    },
    get(_target, key) {
      if (key === Symbol.unscopables) return void 0;
      for (const source of sources) {
        if (Reflect.has(source, key)) return Reflect.get(source, key);
      }
      return Reflect.has(globals, key) ? Reflect.get(globals, key) : void 0;
    },
    set(_target, key, value) {
      for (const source of sources) {
        if (Reflect.has(source, key)) {
          Reflect.set(source, key, value);
          return true;
        }
      }
      if (sources.length) Reflect.set(sources[0], key, value);
      return true;
    }
  });
}
const compile = (cache, source, make) => {
  let fn = cache.get(source);
  if (!fn) {
    try {
      fn = make(source);
    } catch (error) {
      throw new SyntaxError(`Invalid Brio expression "${source}": ${String(error)}`);
    }
    cache.set(source, fn);
    if (cache.size > 500)
      cache.delete(cache.keys().next().value);
  }
  return fn;
};
function evaluate(source, scope) {
  const fn = compile(
    valueExpressions,
    source,
    (expression) => new Function("$scope", `with ($scope) { return (${expression}); }`)
  );
  try {
    return fn(scope);
  } catch (error) {
    throw causedError(`Brio expression failed: "${source}"`, error);
  }
}
function execute(source, scope, event) {
  const fn = compile(
    statementExpressions,
    source,
    (expression) => new Function("$scope", "$event", `with ($scope) { ${expression} }`)
  );
  try {
    fn(createExpressionScope({ $event: event }, scope), event);
  } catch (error) {
    throw causedError(`Brio event expression failed: "${source}"`, error);
  }
}
function assign(source, scope, value) {
  const fn = compile(
    assignmentExpressions,
    source,
    (expression) => new Function("$scope", "$value", `with ($scope) { return (${expression} = $value); }`)
  );
  try {
    fn(createExpressionScope({ $value: value }, scope), value);
  } catch (error) {
    throw causedError(`Brio model expression failed: "${source}"`, error);
  }
}
const trustedMarkup = Symbol("brio.trustedMarkup");
const projectedContexts = /* @__PURE__ */ new WeakMap();
const staticClasses = /* @__PURE__ */ new WeakMap();
const dynamicStyles = /* @__PURE__ */ new WeakMap();
const componentNamePattern$1 = /^[a-z][a-z0-9]*-[a-z0-9-]+$/;
const directiveNamePattern = /^b-[a-z-]+$/;
function trustedHTML(markup) {
  return { [trustedMarkup]: markup };
}
const getExpression = (expression, context) => evaluate(expression, context);
const registerEventBindings = (element, context) => {
  for (const attribute of Array.from(element.attributes)) {
    if (!attribute.name.startsWith("b-on-")) continue;
    if (!directiveNamePattern.test(attribute.name))
      throw new SyntaxError(`Invalid Brio directive name "${attribute.name}".`);
    const eventName = attribute.name.slice("b-on-".length);
    if (!eventName) throw new SyntaxError(`Brio event directive "${attribute.name}" has no event name.`);
    const source = attribute.value;
    const handler = (event) => batch(() => execute(source, createExpressionScope({ $event: event }, context), event));
    element.addEventListener(eventName, handler);
    onCleanup(() => element.removeEventListener(eventName, handler));
    element.removeAttribute(attribute.name);
  }
};
const setBoundValue = (element, name, value) => {
  if (name === "class") {
    let staticNames = staticClasses.get(element);
    if (!staticNames) {
      staticNames = new Set((element.getAttribute("class") ?? "").split(/\s+/).filter(Boolean));
      staticClasses.set(element, staticNames);
    }
    const currentDynamic = /* @__PURE__ */ new Set();
    if (typeof value === "string")
      value.split(/\s+/).filter(Boolean).forEach((className) => currentDynamic.add(className));
    else if (Array.isArray(value))
      value.filter(Boolean).forEach((className) => String(className).split(/\s+/).filter(Boolean).forEach((name2) => currentDynamic.add(name2)));
    else if (value && typeof value === "object") {
      for (const [className, enabled] of Object.entries(value))
        if (enabled) className.split(/\s+/).filter(Boolean).forEach((name2) => currentDynamic.add(name2));
    }
    const combined = /* @__PURE__ */ new Set([...staticNames, ...currentDynamic]);
    if (combined.size) element.setAttribute("class", Array.from(combined).join(" "));
    else element.removeAttribute("class");
    return;
  }
  if (name === "style" && value && typeof value === "object") {
    const style = element.style;
    const previousProperties = dynamicStyles.get(element) ?? /* @__PURE__ */ new Set();
    const currentProperties = /* @__PURE__ */ new Set();
    const properties = Object.entries(value);
    for (const [property] of properties) {
      const normalized = property.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
      currentProperties.add(normalized);
      previousProperties.delete(normalized);
    }
    for (const property of previousProperties) style.removeProperty(property);
    for (const [property, propertyValue] of properties) {
      const normalized = property.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
      if (propertyValue === null || propertyValue === void 0 || propertyValue === false)
        style.removeProperty(normalized);
      else style.setProperty(
        normalized,
        String(propertyValue)
      );
    }
    dynamicStyles.set(element, currentProperties);
    return;
  }
  if (name in element && !name.startsWith("aria-") && !name.startsWith("data-")) {
    try {
      element[name] = value;
      return;
    } catch (error) {
      throw causedError(`Unable to bind "${name}" on <${element.tagName.toLowerCase()}>.`, error);
    }
  }
  if (value === null || value === void 0 || value === false) element.removeAttribute(name);
  else element.setAttribute(name, value === true ? "" : String(value));
};
const registerBindings = (element, context) => {
  for (const attribute of Array.from(element.attributes)) {
    if (!attribute.name.startsWith("b-bind-")) continue;
    if (!directiveNamePattern.test(attribute.name))
      throw new SyntaxError(`Invalid Brio directive name "${attribute.name}".`);
    const property = attribute.name.slice("b-bind-".length);
    if (!property) throw new SyntaxError(`Brio binding directive "${attribute.name}" has no target.`);
    const expression = attribute.value;
    effect(() => setBoundValue(element, property, getExpression(expression, context)));
    element.removeAttribute(attribute.name);
  }
};
const registerModel = (element, expression, context) => {
  if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement))
    throw new TypeError("b-model can only be used on input, textarea, and select elements.");
  const updateState = () => {
    const input = element;
    const current = getExpression(expression, context);
    if (element instanceof HTMLSelectElement && element.multiple) {
      assign(expression, context, Array.from(element.selectedOptions, (option) => option.value));
    } else if (input.type === "checkbox" && Array.isArray(current)) {
      const values = current.slice();
      const index = values.indexOf(input.value);
      if (input.checked && index < 0) values.push(input.value);
      else if (!input.checked && index >= 0) values.splice(index, 1);
      assign(expression, context, values);
    } else if (input.type === "checkbox") assign(expression, context, input.checked);
    else if (input.type === "radio") {
      if (input.checked) assign(expression, context, input.value);
    } else assign(expression, context, element.value);
  };
  element.addEventListener("input", updateState);
  element.addEventListener("change", updateState);
  onCleanup(() => {
    element.removeEventListener("input", updateState);
    element.removeEventListener("change", updateState);
  });
  const updateElement = (value) => {
    const input = element;
    if (element instanceof HTMLSelectElement && element.multiple && Array.isArray(value)) {
      const selected = new Set(value.map(String));
      for (const option of Array.from(element.options)) option.selected = selected.has(option.value);
    } else if (input.type === "checkbox")
      input.checked = Array.isArray(value) ? value.includes(input.value) : Boolean(value);
    else if (input.type === "radio") input.checked = Object.is(value, input.value);
    else if (element.value !== String(value ?? "")) element.value = String(value ?? "");
  };
  effect(() => updateElement(getExpression(expression, context)));
  if (element instanceof HTMLSelectElement) {
    const observer = new MutationObserver(() => updateElement(getExpression(expression, context)));
    observer.observe(element, { childList: true, subtree: true });
    onCleanup(() => observer.disconnect());
  }
  element.removeAttribute("b-model");
};
const makeChildContext = (parent, data) => createExpressionScope(state(data), parent);
const mountConditional = (element, expression, context, runtime) => {
  const parent = element.parentNode;
  if (!parent) throw new Error("b-if requires an element with a parent node.");
  const placeholder = document.createComment("brio:if");
  const template = element.cloneNode(true);
  template.removeAttribute("b-if");
  parent.replaceChild(placeholder, element);
  let instance;
  let instanceScope;
  onCleanup(() => {
    try {
      instanceScope == null ? void 0 : instanceScope.dispose();
    } finally {
      instance == null ? void 0 : instance.remove();
      placeholder.remove();
    }
  });
  effect(() => {
    var _a;
    if (getExpression(expression, context)) {
      if (instance) return;
      instance = template.cloneNode(true);
      instanceScope = createScope();
      (_a = placeholder.parentNode) == null ? void 0 : _a.insertBefore(instance, placeholder.nextSibling);
      instanceScope.run(() => hydrateNode(instance, context, runtime));
    } else if (instance) {
      try {
        instanceScope == null ? void 0 : instanceScope.dispose();
      } finally {
        instance == null ? void 0 : instance.remove();
        instance = void 0;
        instanceScope = void 0;
      }
    }
  });
};
const enumerate = (value) => {
  if (value === null || value === void 0) return [];
  if (Array.isArray(value) || typeof value === "object" && Symbol.iterator in value)
    return Array.from(value, (item, index) => [index, item]);
  if (typeof value === "object") return Object.entries(value);
  if (typeof value === "number" && Number.isInteger(value) && value >= 0)
    return Array.from({ length: value }, (_, index) => [index, index + 1]);
  throw new TypeError("b-for expects an array, iterable, object, or non-negative integer.");
};
const mountLoop = (element, expression, context, runtime) => {
  const parent = element.parentNode;
  if (!parent) throw new Error("b-for requires an element with a parent node.");
  const parsed = /^\s*([A-Za-z_$][\w$]*)(?:\s*,\s*([A-Za-z_$][\w$]*))?\s+in\s+([\s\S]+)$/.exec(expression);
  if (!parsed) throw new SyntaxError(`Invalid b-for expression "${expression}". Use "item in items".`);
  const [, itemName, indexName = "$index", collectionExpression] = parsed;
  const keyExpression = element.getAttribute("b-key");
  const placeholder = document.createComment("brio:for");
  const template = element.cloneNode(true);
  template.removeAttribute("b-for");
  template.removeAttribute("b-key");
  parent.replaceChild(placeholder, element);
  const rows = /* @__PURE__ */ new Map();
  onCleanup(() => {
    const errors = [];
    for (const row of rows.values()) {
      try {
        row.scope.dispose();
      } catch (error) {
        errors.push(error);
      } finally {
        row.element.remove();
      }
    }
    rows.clear();
    placeholder.remove();
    if (errors.length) throw new AggregateError(errors, "One or more repeated items failed to dispose.");
  });
  effect(() => {
    var _a;
    const entries = enumerate(getExpression(collectionExpression, context));
    const nextKeys = /* @__PURE__ */ new Set();
    let cursor = placeholder;
    for (const [index, item] of entries) {
      const rowState = state({ [itemName]: item, [indexName]: index });
      const rowContext = createExpressionScope(rowState, context);
      const evaluatedKey = keyExpression ? getExpression(keyExpression, rowContext) : index;
      if (typeof evaluatedKey !== "string" && typeof evaluatedKey !== "number")
        throw new TypeError("b-key must evaluate to a string or number.");
      if (nextKeys.has(evaluatedKey))
        throw new Error(`Duplicate b-for key "${evaluatedKey}".`);
      nextKeys.add(evaluatedKey);
      let row = rows.get(evaluatedKey);
      if (!row) {
        const rowElement = template.cloneNode(true);
        const rowScope = createScope();
        row = { element: rowElement, context: rowContext, values: rowState, scope: rowScope, key: evaluatedKey };
        rows.set(evaluatedKey, row);
        rowScope.run(() => hydrateNode(rowElement, rowContext, runtime));
      } else {
        row.values[itemName] = item;
        row.values[indexName] = index;
      }
      if (row.element.previousSibling !== cursor)
        (_a = placeholder.parentNode) == null ? void 0 : _a.insertBefore(row.element, cursor.nextSibling);
      cursor = row.element;
    }
    for (const [key, row] of rows) {
      if (nextKeys.has(key)) continue;
      try {
        row.scope.dispose();
      } finally {
        row.element.remove();
        rows.delete(key);
      }
    }
  });
};
const fillSlots = (host, template, context) => {
  var _a;
  const slots = /* @__PURE__ */ new Map();
  for (const child of Array.from(host.childNodes)) {
    const name = child instanceof Element ? child.getAttribute("slot") ?? "" : "";
    const content = slots.get(name) ?? [];
    content.push(child);
    slots.set(name, content);
  }
  for (const outlet of Array.from(template.querySelectorAll("slot"))) {
    const name = outlet.getAttribute("name") ?? "";
    const content = slots.get(name);
    if (!(content == null ? void 0 : content.length)) {
      outlet.replaceWith(...Array.from(outlet.childNodes));
      continue;
    }
    for (const node of content) projectedContexts.set(node, context);
    outlet.replaceWith(...content);
    slots.delete(name);
  }
  for (const remaining of slots.values())
    for (const node of remaining) (_a = node.parentNode) == null ? void 0 : _a.removeChild(node);
};
const mountComponent = (element, definition, context, runtime) => {
  const propsObject = {};
  for (const attribute of Array.from(element.attributes)) {
    if (!attribute.name.startsWith("b-")) propsObject[attribute.name] = attribute.value;
  }
  const propBindings = Array.from(element.attributes).filter((attribute) => attribute.name.startsWith("b-bind-")).map((attribute) => ({
    name: attribute.name.slice("b-bind-".length),
    expression: attribute.value
  }));
  const props = state(propsObject);
  const componentScope = createScope();
  onCleanup(() => componentScope.dispose());
  const emit = (name, detail) => {
    if (!/^[a-z][a-z0-9-]*$/.test(name))
      throw new TypeError(`Invalid component event name "${name}".`);
    element.dispatchEvent(new CustomEvent(name, { detail, bubbles: true }));
  };
  componentScope.run(() => {
    var _a;
    for (const attribute of Array.from(element.attributes)) {
      if (attribute.name.startsWith("b-on-")) {
        const eventName = attribute.name.slice("b-on-".length);
        if (!/^[a-z-]+$/.test(eventName))
          throw new SyntaxError(`Invalid component event directive "${attribute.name}".`);
        const expression = attribute.value;
        const handler = (event) => batch(() => execute(expression, createExpressionScope({ $event: event }, context), event));
        element.addEventListener(eventName, handler);
        onCleanup(() => element.removeEventListener(eventName, handler));
      } else if (attribute.name.startsWith("b-") && !attribute.name.startsWith("b-bind-")) {
        throw new Error(`Directive "${attribute.name}" is not supported on component hosts.`);
      }
    }
    for (const binding of propBindings)
      props[binding.name] = getExpression(binding.expression, context);
    const setupResult = ((_a = definition.setup) == null ? void 0 : _a.call(definition, { el: element, props, emit, app: runtime.app })) ?? {};
    const local = state({ ...setupResult, $el: element, props, emit });
    const componentContext = createExpressionScope(local, context);
    for (const binding of propBindings) {
      effect(() => {
        props[binding.name] = getExpression(binding.expression, context);
      });
    }
    const template = document.createElement("template");
    template.innerHTML = definition.template;
    fillSlots(element, template.content, context);
    element.replaceChildren(template.content);
    for (const child of Array.from(element.childNodes)) {
      const childContext = projectedContexts.get(child) ?? componentContext;
      projectedContexts.delete(child);
      hydrateNode(child, childContext, runtime);
    }
    for (const attribute of Array.from(element.attributes)) {
      if (attribute.name.startsWith("b-")) element.removeAttribute(attribute.name);
    }
  });
};
const mountRouterOutlet = (element, context, runtime) => {
  if (!runtime.router) throw new Error("b-router-outlet requires a router on the Brio app.");
  const router = runtime.router;
  let childScope;
  let childElement;
  onCleanup(() => {
    try {
      childScope == null ? void 0 : childScope.dispose();
    } finally {
      childElement == null ? void 0 : childElement.remove();
    }
  });
  effect(() => {
    const route = router.current.value;
    try {
      childScope == null ? void 0 : childScope.dispose();
    } finally {
      childElement == null ? void 0 : childElement.remove();
    }
    childScope = void 0;
    childElement = void 0;
    if (!route) return;
    const definition = runtime.components.get(route.component);
    if (!definition) throw new Error(`No component registered for route "${route.component}".`);
    childElement = document.createElement(route.component);
    childScope = createScope();
    element.append(childElement);
    childScope.run(() => mountComponent(childElement, definition, context, runtime));
  });
};
const hydrateChildren = (element, context, runtime) => {
  for (const child of Array.from(element.childNodes)) {
    const projectedContext = projectedContexts.get(child);
    if (projectedContext) projectedContexts.delete(child);
    hydrateNode(child, projectedContext ?? context, runtime);
  }
};
function hydrateNode(node, parentContext, runtime) {
  if (node.nodeType !== Node.ELEMENT_NODE) return;
  const element = node;
  if (element.hasAttribute("b-ignore")) return;
  let context = createExpressionScope({ $el: element }, parentContext);
  const dataExpression = element.getAttribute("b-data");
  if (dataExpression !== null) {
    const data = getExpression(dataExpression, context);
    if (data === null || typeof data !== "object")
      throw new TypeError("b-data must evaluate to an object.");
    context = makeChildContext(parentContext, data);
    element.removeAttribute("b-data");
  }
  for (const attribute of Array.from(element.attributes)) {
    if (attribute.name.startsWith("b-") && !directiveNamePattern.test(attribute.name))
      throw new SyntaxError(`Invalid Brio directive name "${attribute.name}". Directive names use letters and hyphens only.`);
  }
  const ifExpression = element.getAttribute("b-if");
  if (ifExpression !== null) {
    mountConditional(element, ifExpression, context, runtime);
    return;
  }
  const forExpression = element.getAttribute("b-for");
  if (forExpression !== null) {
    mountLoop(element, forExpression, context, runtime);
    return;
  }
  const tagName = element.tagName.toLowerCase();
  const definition = componentNamePattern$1.test(tagName) ? runtime.components.get(tagName) : void 0;
  if (!definition) {
    registerEventBindings(element, context);
    registerBindings(element, context);
  }
  if (definition) {
    mountComponent(element, definition, context, runtime);
    return;
  }
  const textExpression = element.getAttribute("b-text");
  if (textExpression !== null) {
    effect(() => {
      const value = getExpression(textExpression, context);
      element.textContent = value === null || value === void 0 ? "" : String(value);
    });
    element.removeAttribute("b-text");
  }
  const showExpression = element.getAttribute("b-show");
  if (showExpression !== null) {
    const display = element.style.display;
    effect(() => {
      element.style.display = getExpression(showExpression, context) ? display : "none";
    });
    element.removeAttribute("b-show");
  }
  const modelExpression = element.getAttribute("b-model");
  if (modelExpression !== null) registerModel(element, modelExpression, context);
  if (element.hasAttribute("b-html")) {
    const expression = element.getAttribute("b-html");
    let contentScope;
    onCleanup(() => contentScope == null ? void 0 : contentScope.dispose());
    effect(() => {
      const html = getExpression(expression, context);
      if (!html || typeof html !== "object" || !(trustedMarkup in html))
        throw new TypeError("b-html requires a value created by trustedHTML().");
      contentScope == null ? void 0 : contentScope.dispose();
      contentScope = createScope();
      const template = document.createElement("template");
      template.innerHTML = html[trustedMarkup];
      element.replaceChildren(template.content);
      contentScope.run(() => hydrateChildren(element, context, runtime));
    });
    element.removeAttribute("b-html");
    return;
  }
  if (element.hasAttribute("b-router-outlet")) {
    mountRouterOutlet(element, context, runtime);
    element.removeAttribute("b-router-outlet");
    return;
  }
  for (const attribute of Array.from(element.attributes)) {
    if (attribute.name.startsWith("b-"))
      throw new Error(`Unknown Brio directive "${attribute.name}".`);
  }
  if (textExpression === null) hydrateChildren(element, context, runtime);
}
function hydrateRoot(root, context, runtime) {
  hydrateNode(root, context, runtime);
}
const componentNamePattern = /^[a-z][a-z0-9]*-[a-z0-9-]+$/;
const activeMountRoots = /* @__PURE__ */ new Set();
function createApp(options = {}) {
  var _a;
  const appState = state(((_a = options.state) == null ? void 0 : _a.call(options)) ?? {});
  const components = /* @__PURE__ */ new Map();
  const roots = /* @__PURE__ */ new Set();
  const appScope = createScope();
  let disposed = false;
  const plugins = /* @__PURE__ */ new Set();
  const runtime = {
    app: void 0,
    state: appState,
    components,
    router: options.router
  };
  const app = {
    state: appState,
    components,
    router: options.router,
    get roots() {
      return roots;
    },
    component(name, definition) {
      if (disposed) throw new Error("Cannot register a component on a disposed Brio app.");
      const normalized = name.toLowerCase();
      if (!componentNamePattern.test(normalized))
        throw new TypeError(`Component name "${name}" must be a custom-element name such as "user-card".`);
      if (components.has(normalized))
        throw new Error(`Component "${normalized}" is already registered.`);
      if (!definition.template.trim())
        throw new TypeError(`Component "${normalized}" requires a non-empty template.`);
      components.set(normalized, definition);
      return app;
    },
    plugin(plugin) {
      if (disposed) throw new Error("Cannot install a plugin on a disposed Brio app.");
      if (plugins.has(plugin)) return app;
      plugins.add(plugin);
      const scope = createScope(appScope);
      try {
        scope.run(() => plugin(app));
      } catch (error) {
        plugins.delete(plugin);
        try {
          scope.dispose();
        } catch (cleanupError) {
          throw combinedError("Brio plugin installation and cleanup both failed.", [error, cleanupError]);
        }
        throw error;
      }
      return app;
    },
    mount(target) {
      if (disposed) throw new Error("Cannot mount a disposed Brio app.");
      const root = typeof target === "string" ? document.querySelector(target) : target;
      if (!(root instanceof Element))
        throw new TypeError(`Brio mount target "${String(target)}" did not resolve to an element.`);
      if ([...activeMountRoots].some((mounted) => mounted.contains(root) || root.contains(mounted)))
        throw new Error("Brio mount roots cannot be equal or nested; use one app root with child components.");
      if (root.hasAttribute("b-if") || root.hasAttribute("b-for"))
        throw new Error("b-if and b-for require a container root; wrap the structural directive in another element.");
      const originalAttributes = Array.from(root.attributes).map((attribute) => [attribute.name, attribute.value]);
      const originalChildren = Array.from(root.childNodes, (child) => child.cloneNode(true));
      const scope = createScope(appScope);
      let unmounted = false;
      const handle = {
        root,
        get unmounted() {
          return unmounted;
        },
        unmount() {
          if (unmounted) return;
          unmounted = true;
          try {
            scope.dispose();
          } finally {
            roots.delete(handle);
            activeMountRoots.delete(root);
            notifyRootUnmounted(app, root);
            for (const attribute of Array.from(root.attributes))
              root.removeAttribute(attribute.name);
            for (const [name, value] of originalAttributes)
              root.setAttribute(name, value);
            root.replaceChildren(...originalChildren.map((child) => child.cloneNode(true)));
          }
        }
      };
      roots.add(handle);
      activeMountRoots.add(root);
      notifyRootMounted(app, root);
      const context = createExpressionScope(appState, { trustedHTML });
      try {
        scope.run(() => {
          if (options.router) {
            const stopRouter = options.router.start(root);
            onCleanup(stopRouter);
          }
          hydrateRoot(root, context, runtime);
        });
      } catch (error) {
        try {
          handle.unmount();
        } catch (cleanupError) {
          throw combinedError("Brio mounting and cleanup both failed.", [error, cleanupError]);
        }
        throw error;
      }
      return handle;
    },
    unmount() {
      const errors = [];
      for (const root of [...roots]) {
        try {
          root.unmount();
        } catch (error) {
          errors.push(error);
        }
      }
      if (errors.length) throw combinedError("One or more Brio app roots failed to unmount.", errors);
    },
    dispose() {
      if (disposed) return;
      let failure;
      try {
        app.unmount();
      } catch (error) {
        failure = error;
      }
      disposed = true;
      try {
        appScope.dispose();
      } catch (error) {
        failure = failure === void 0 ? error : combinedError("Brio app unmount and disposal both failed.", [failure, error]);
      }
      components.clear();
      notifyAppDisposed(app);
      if (failure !== void 0) throw failure;
    }
  };
  runtime.app = app;
  try {
    for (const [name, definition] of Object.entries(options.components ?? {}))
      app.component(name, definition);
    for (const plugin of options.plugins ?? []) app.plugin(plugin);
  } catch (error) {
    try {
      app.dispose();
    } catch (cleanupError) {
      throw combinedError("Brio app initialization and cleanup both failed.", [error, cleanupError]);
    }
    throw error;
  }
  appScope.run(() => notifyAppCreated(app, appState));
  return app;
}
export {
  batch,
  j as computed,
  createApp,
  createRouter,
  createScope,
  effect,
  onCleanup,
  persist,
  k as signal,
  state,
  trustedHTML
};
//# sourceMappingURL=index.js.map
