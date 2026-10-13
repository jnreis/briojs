import { c as causedError, a as createScope, o as onCleanup, e as effect, b as batch, d as combinedError, n as notifyAppCreated, f as notifyRootUnmounted, h as notifyRootMounted, i as notifyAppDisposed } from "./effect-DZvu7u5S.js";
import { k, j, s } from "./effect-DZvu7u5S.js";
import { s as state } from "./state-UFBFm952.js";
import { a } from "./state-UFBFm952.js";
import { computed, resource } from "./reactivity.js";
import { createRouter } from "./router-entry.js";
import { persist } from "./persistence-entry.js";
import { devtools } from "./devtools-entry.js";
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
let idCounter = 0;
function generateScopeId() {
  return `b-${++idCounter}`;
}
function scopeCss(content, scopeAttr) {
  const attrSelector = `[${scopeAttr}]`;
  if (typeof CSSStyleSheet !== "undefined" && "replaceSync" in CSSStyleSheet.prototype) {
    try {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(content);
      const scopeRules = (rules) => {
        let result = "";
        for (const rule of Array.from(rules)) {
          if (rule instanceof CSSStyleRule) {
            const scopedSelectors = rule.selectorText.split(",").map((sel) => {
              const trimmed = sel.trim();
              if (trimmed.includes("&")) {
                return trimmed.replace(/&/g, attrSelector);
              }
              return `${trimmed}${attrSelector}, ${attrSelector} ${trimmed}`;
            }).join(", ");
            result += `${scopedSelectors} { ${rule.style.cssText} }
`;
          } else if (rule instanceof CSSGroupingRule) {
            const condition = rule.conditionText ?? "";
            result += `@${rule.name || "media"} ${condition} {
${scopeRules(rule.cssRules)}
}
`;
          } else {
            result += `${rule.cssText}
`;
          }
        }
        return result;
      };
      return scopeRules(sheet.cssRules);
    } catch {
    }
  }
  return content.replace(/([^{};]+)({)/g, (match, selector, brace) => {
    const trimmed = selector.trim();
    if (trimmed.startsWith("@")) return match;
    const scoped = trimmed.split(",").map((s2) => `${s2.trim()}${attrSelector}`).join(", ");
    return `${scoped} ${brace}`;
  });
}
function injectScopedStyles(styleContent, scopeAttr) {
  const styleEl = document.createElement("style");
  styleEl.setAttribute("data-brio-scoped", scopeAttr);
  styleEl.textContent = scopeCss(styleContent, scopeAttr);
  document.head.appendChild(styleEl);
  return styleEl;
}
const projectedContexts = /* @__PURE__ */ new WeakMap();
function fillSlots(host, template, context) {
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
}
function mountComponent(element, definition, context, runtime, hydrateNodeFn) {
  const propsObject = {};
  for (const attribute of Array.from(element.attributes)) {
    if (!attribute.name.startsWith("b-")) propsObject[attribute.name] = attribute.value;
  }
  const propBindings = Array.from(element.attributes).filter((attribute) => attribute.name.startsWith("b-bind-") || attribute.name.startsWith("bind-")).map((attribute) => {
    const raw = attribute.name.startsWith("b-bind-") ? attribute.name.slice("b-bind-".length) : attribute.name.slice("bind-".length);
    return {
      name: raw.split(".")[0],
      expression: attribute.value
    };
  });
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
    let scopeAttr;
    if (definition.style) {
      scopeAttr = generateScopeId();
      element.setAttribute(scopeAttr, "");
      const styleEl = injectScopedStyles(definition.style, scopeAttr);
      onCleanup(() => styleEl.remove());
    }
    for (const attribute of Array.from(element.attributes)) {
      if (attribute.name.startsWith("b-on-") || attribute.name.startsWith("on-")) {
        const prefix = attribute.name.startsWith("b-on-") ? "b-on-" : "on-";
        const eventPart = attribute.name.slice(prefix.length).split(".")[0];
        if (!/^[a-z-]+$/.test(eventPart))
          throw new SyntaxError(`Invalid component event directive "${attribute.name}".`);
        const expression = attribute.value;
        const handler = (event) => batch(() => execute(expression, createExpressionScope({ $event: event }, context), event));
        element.addEventListener(eventPart, handler);
        onCleanup(() => element.removeEventListener(eventPart, handler));
      } else if (attribute.name.startsWith("b-") && !attribute.name.startsWith("b-bind-")) {
        throw new Error(`Directive "${attribute.name}" is not supported on component hosts.`);
      }
    }
    for (const binding of propBindings)
      props[binding.name] = evaluate(binding.expression, context);
    const setupResult = ((_a = definition.setup) == null ? void 0 : _a.call(definition, { el: element, props, emit, app: runtime.app })) ?? {};
    const local = state({ ...setupResult, $el: element, props, emit });
    const componentContext = createExpressionScope(local, context);
    for (const binding of propBindings) {
      effect(() => {
        props[binding.name] = evaluate(binding.expression, context);
      });
    }
    const template = document.createElement("template");
    template.innerHTML = definition.template;
    if (scopeAttr) {
      for (const el of Array.from(template.content.querySelectorAll("*"))) {
        el.setAttribute(scopeAttr, "");
      }
    }
    fillSlots(element, template.content, context);
    element.replaceChildren(template.content);
    for (const child of Array.from(element.childNodes)) {
      const childContext = projectedContexts.get(child) ?? componentContext;
      projectedContexts.delete(child);
      hydrateNodeFn(child, childContext, runtime);
    }
    for (const attribute of Array.from(element.attributes)) {
      if (attribute.name.startsWith("b-")) element.removeAttribute(attribute.name);
    }
  });
}
const staticClasses = /* @__PURE__ */ new WeakMap();
const dynamicStyles = /* @__PURE__ */ new WeakMap();
const setBoundValue = (element, name, value, forceProp = false) => {
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
  if (forceProp || name in element && !name.startsWith("aria-") && !name.startsWith("data-")) {
    try {
      element[name] = value;
      return;
    } catch (error) {
      if (forceProp) throw causedError(`Unable to bind property "${name}" on <${element.tagName.toLowerCase()}>.`, error);
    }
  }
  if (value === null || value === void 0 || value === false) element.removeAttribute(name);
  else element.setAttribute(name, value === true ? "" : String(value));
};
function handleBind(element, attrName, expression, modifiers, context) {
  const rawTarget = attrName.startsWith("b-bind-") ? attrName.slice("b-bind-".length) : attrName.slice("bind-".length);
  if (!rawTarget) throw new SyntaxError(`Brio binding directive "${attrName}" has no target.`);
  const forceProp = Boolean(modifiers.prop);
  effect(() => {
    const value = evaluate(expression, context);
    setBoundValue(element, rawTarget, value, forceProp);
  });
}
function handleOn(element, attrName, expression, modifiers, context) {
  const rawTarget = attrName.startsWith("b-on-") ? attrName.slice("b-on-".length) : attrName.slice("on-".length);
  if (!rawTarget) throw new SyntaxError(`Brio event directive "${attrName}" has no event name.`);
  let target = element;
  if (modifiers.outside) target = document;
  else if (modifiers.window) target = window;
  else if (modifiers.document) target = document;
  let debounceTimer;
  let throttleTimer;
  const handler = (event) => {
    if (modifiers.prevent) event.preventDefault();
    if (modifiers.stop) event.stopPropagation();
    if (modifiers.self && event.target !== element) return;
    if (modifiers.outside && (element.contains(event.target) || !element.isConnected)) return;
    const invoke = () => batch(() => {
      execute(expression, createExpressionScope({ $event: event }, context), event);
    });
    if (modifiers.debounce) {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(invoke, 150);
      return;
    }
    if (modifiers.throttle) {
      if (throttleTimer) return;
      throttleTimer = setTimeout(() => {
        throttleTimer = null;
      }, 150);
      invoke();
      return;
    }
    invoke();
  };
  const options = {
    capture: Boolean(modifiers.capture),
    passive: Boolean(modifiers.passive),
    once: Boolean(modifiers.once)
  };
  target.addEventListener(rawTarget, handler, options);
  onCleanup(() => {
    clearTimeout(debounceTimer);
    clearTimeout(throttleTimer);
    target.removeEventListener(rawTarget, handler, options);
  });
}
function handleModel(element, expression, modifiers, context) {
  if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement))
    throw new TypeError("b-model can only be used on input, textarea, and select elements.");
  const isLazy = Boolean(modifiers.lazy);
  const isTrim = Boolean(modifiers.trim);
  const isNumber = Boolean(modifiers.number);
  const formatValue = (val) => {
    let res = isTrim ? val.trim() : val;
    if (isNumber) {
      const parsed = parseFloat(res);
      return isNaN(parsed) ? res : parsed;
    }
    return res;
  };
  const updateState = () => {
    const input = element;
    const current = evaluate(expression, context);
    if (element instanceof HTMLSelectElement && element.multiple) {
      assign(expression, context, Array.from(element.selectedOptions, (option) => formatValue(option.value)));
    } else if (input.type === "checkbox" && Array.isArray(current)) {
      const values = current.slice();
      const formattedVal = formatValue(input.value);
      const index = values.indexOf(formattedVal);
      if (input.checked && index < 0) values.push(formattedVal);
      else if (!input.checked && index >= 0) values.splice(index, 1);
      assign(expression, context, values);
    } else if (input.type === "checkbox") {
      assign(expression, context, input.checked);
    } else if (input.type === "radio") {
      if (input.checked) assign(expression, context, formatValue(input.value));
    } else {
      assign(expression, context, formatValue(element.value));
    }
  };
  const eventName = isLazy ? "change" : "input";
  element.addEventListener(eventName, updateState);
  if (!isLazy && (element instanceof HTMLInputElement && (element.type === "checkbox" || element.type === "radio") || element instanceof HTMLSelectElement)) {
    element.addEventListener("change", updateState);
  }
  onCleanup(() => {
    element.removeEventListener(eventName, updateState);
    element.removeEventListener("change", updateState);
  });
  const updateElement = (value) => {
    const input = element;
    if (element instanceof HTMLSelectElement && element.multiple && Array.isArray(value)) {
      const selected = new Set(value.map(String));
      for (const option of Array.from(element.options)) option.selected = selected.has(option.value);
    } else if (input.type === "checkbox") {
      input.checked = Array.isArray(value) ? value.includes(input.value) : Boolean(value);
    } else if (input.type === "radio") {
      input.checked = Object.is(value, input.value);
    } else if (element.value !== String(value ?? "")) {
      element.value = String(value ?? "");
    }
  };
  effect(() => updateElement(evaluate(expression, context)));
  if (element instanceof HTMLSelectElement) {
    const observer = new MutationObserver(() => updateElement(evaluate(expression, context)));
    observer.observe(element, { childList: true, subtree: true });
    onCleanup(() => observer.disconnect());
  }
}
function enterTransition(element, name = "brio") {
  const el = element;
  el.classList.add(`${name}-enter`, `${name}-enter-active`);
  requestAnimationFrame(() => {
    el.classList.remove(`${name}-enter`);
    el.classList.add(`${name}-enter-to`);
    const onEnd = () => {
      el.classList.remove(`${name}-enter-active`, `${name}-enter-to`);
      el.removeEventListener("transitionend", onEnd);
    };
    el.addEventListener("transitionend", onEnd);
  });
}
function leaveTransition(element, name = "brio", onDone) {
  const el = element;
  el.classList.add(`${name}-leave`, `${name}-leave-active`);
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    el.classList.remove(`${name}-leave-active`, `${name}-leave-to`);
    el.removeEventListener("transitionend", finish);
    onDone();
  };
  requestAnimationFrame(() => {
    el.classList.remove(`${name}-leave`);
    el.classList.add(`${name}-leave-to`);
    el.addEventListener("transitionend", finish);
    setTimeout(finish, 1e3);
  });
}
function handleTransition(element, expression, _modifiers, _context) {
  const name = expression.trim().replace(/^['"]|['"]$/g, "") || "brio";
  enterTransition(element, name);
}
function handleIf(element, expression, _modifiers, context, runtime, hydrateNodeFn) {
  const parent = element.parentNode;
  if (!parent) throw new Error("b-if requires an element with a parent node.");
  const placeholder = document.createComment("brio:if");
  const template = element.cloneNode(true);
  template.removeAttribute("b-if");
  parent.replaceChild(placeholder, element);
  let instance;
  let instanceScope;
  let isLeaving = false;
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
    if (evaluate(expression, context)) {
      isLeaving = false;
      if (instance) return;
      instance = template.cloneNode(true);
      instanceScope = createScope();
      (_a = placeholder.parentNode) == null ? void 0 : _a.insertBefore(instance, placeholder.nextSibling);
      instanceScope.run(() => hydrateNodeFn(instance, context, runtime));
    } else if (instance && !isLeaving) {
      const currentInstance = instance;
      const currentScope = instanceScope;
      instance = void 0;
      instanceScope = void 0;
      const transitionAttr = currentInstance.getAttribute("b-transition");
      if (transitionAttr !== null) {
        isLeaving = true;
        const transitionName = transitionAttr.trim().replace(/^['"]|['"]$/g, "") || "brio";
        leaveTransition(currentInstance, transitionName, () => {
          try {
            currentScope == null ? void 0 : currentScope.dispose();
          } finally {
            currentInstance.remove();
          }
        });
      } else {
        try {
          currentScope == null ? void 0 : currentScope.dispose();
        } finally {
          currentInstance.remove();
        }
      }
    }
  });
}
const enumerate = (value) => {
  if (value === null || value === void 0) return [];
  if (Array.isArray(value) || typeof value === "object" && Symbol.iterator in value)
    return Array.from(value, (item, index) => [index, item]);
  if (typeof value === "object") return Object.entries(value);
  if (typeof value === "number" && Number.isInteger(value) && value >= 0)
    return Array.from({ length: value }, (_, index) => [index, index + 1]);
  throw new TypeError("b-for expects an array, iterable, object, or non-negative integer.");
};
function handleFor(element, expression, _modifiers, context, runtime, hydrateNodeFn) {
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
    const entries = enumerate(evaluate(collectionExpression, context));
    const nextKeys = /* @__PURE__ */ new Set();
    let cursor = placeholder;
    for (const [index, item] of entries) {
      const loopData = { [itemName]: item, [indexName]: index };
      const rowState = state({ ...loopData, $for: loopData });
      const rowContext = createExpressionScope(rowState, context);
      const evaluatedKey = keyExpression ? evaluate(keyExpression, rowContext) : index;
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
        rowScope.run(() => hydrateNodeFn(rowElement, rowContext, runtime));
      } else {
        row.values[itemName] = item;
        row.values[indexName] = index;
        row.values.$for[itemName] = item;
        row.values.$for[indexName] = index;
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
}
function handleShow(element, expression, modifiers, context) {
  const useDisplay = Boolean(modifiers.display);
  const el = element;
  if (useDisplay) {
    const originalDisplay = el.style.display === "none" ? "" : el.style.display;
    effect(() => {
      const value = evaluate(expression, context);
      const transitionAttr = el.getAttribute("b-transition");
      if (value) {
        el.style.display = originalDisplay;
      } else if (transitionAttr !== null && el.style.display !== "none") {
        const name = transitionAttr.trim().replace(/^['"]|['"]$/g, "") || "brio";
        leaveTransition(el, name, () => {
          el.style.display = "none";
        });
      } else {
        el.style.display = "none";
      }
    });
    return;
  }
  const parent = element.parentNode;
  if (!parent) throw new Error("b-show requires an element with a parent node.");
  const placeholder = document.createComment("brio:show");
  let isAttached = true;
  let isLeaving = false;
  onCleanup(() => {
    placeholder.remove();
    if (element.parentNode) element.remove();
  });
  effect(() => {
    var _a, _b;
    const visible = Boolean(evaluate(expression, context));
    if (visible) {
      isLeaving = false;
      if (!isAttached) {
        (_a = placeholder.parentNode) == null ? void 0 : _a.insertBefore(element, placeholder.nextSibling);
        isAttached = true;
      }
    } else if (isAttached && !isLeaving) {
      const transitionAttr = element.getAttribute("b-transition");
      if (transitionAttr !== null) {
        isLeaving = true;
        const name = transitionAttr.trim().replace(/^['"]|['"]$/g, "") || "brio";
        leaveTransition(element, name, () => {
          var _a2;
          if (!isAttached) return;
          if (!placeholder.parentNode) {
            (_a2 = element.parentNode) == null ? void 0 : _a2.replaceChild(placeholder, element);
          } else {
            element.remove();
          }
          isAttached = false;
          isLeaving = false;
        });
      } else {
        if (!placeholder.parentNode) {
          (_b = element.parentNode) == null ? void 0 : _b.replaceChild(placeholder, element);
        } else {
          element.remove();
        }
        isAttached = false;
      }
    }
  });
}
const trustedMarkup = Symbol("brio.trustedMarkup");
function trustedHTML(markup) {
  return { [trustedMarkup]: markup };
}
function isTrustedHTML(value) {
  return value !== null && typeof value === "object" && trustedMarkup in value;
}
function getTrustedHTMLString(value) {
  return value[trustedMarkup];
}
function handleHtml(element, expression, _modifiers, context, runtime, hydrateChildrenFn) {
  let contentScope;
  onCleanup(() => contentScope == null ? void 0 : contentScope.dispose());
  effect(() => {
    const html = evaluate(expression, context);
    const htmlStr = isTrustedHTML(html) ? getTrustedHTMLString(html) : String(html ?? "");
    contentScope == null ? void 0 : contentScope.dispose();
    contentScope = createScope();
    const template = document.createElement("template");
    template.innerHTML = htmlStr;
    element.replaceChildren(template.content);
    contentScope.run(() => hydrateChildrenFn(element, context, runtime));
  });
}
function handleText(element, expression, _modifiers, context) {
  effect(() => {
    const value = evaluate(expression, context);
    element.textContent = value === null || value === void 0 ? "" : String(value);
  });
}
function handleData(element, expression, _modifiers, parentContext) {
  const context = createExpressionScope({ $el: element }, parentContext);
  if (!expression.trim()) return context;
  const data = evaluate(expression, context);
  if (data === null || typeof data !== "object")
    throw new TypeError("b-data must evaluate to an object.");
  const reactiveData = state(data);
  const scopeObj = {
    $data: reactiveData,
    $parent: parentContext
  };
  return createExpressionScope(
    reactiveData,
    scopeObj,
    parentContext
  );
}
let idSeq = 0;
const activeIds = /* @__PURE__ */ new Set();
function handleId(_element, expression, _modifiers, context) {
  const evaluated = expression ? evaluate(expression, context) : ["id"];
  const idList = Array.isArray(evaluated) ? evaluated : [String(evaluated)];
  const idMap = {};
  for (const name of idList) {
    const generated = `brio-${++idSeq}`;
    activeIds.add(generated);
    idMap[name] = generated;
  }
  onCleanup(() => {
    for (const val of Object.values(idMap)) {
      activeIds.delete(val);
    }
  });
  return createExpressionScope({ $id: idMap }, context);
}
function formatMoney(value, options = {}) {
  const thousands = options.thousands ?? ",";
  const decimal = options.decimal ?? ".";
  const precision = options.precision ?? 2;
  const isNegative = value.trim().startsWith("-");
  const digitsOnly = value.replace(/[^\d]/g, "");
  if (!digitsOnly) return "";
  let integerStr;
  let decimalStr;
  if (precision > 0) {
    if (digitsOnly.length <= precision) {
      integerStr = "0";
      decimalStr = digitsOnly.padStart(precision, "0");
    } else {
      integerStr = digitsOnly.slice(0, digitsOnly.length - precision).replace(/^0+/, "") || "0";
      decimalStr = digitsOnly.slice(digitsOnly.length - precision);
    }
  } else {
    integerStr = digitsOnly.replace(/^0+/, "") || "0";
    decimalStr = "";
  }
  const formattedInteger = integerStr.replace(/\B(?=(\d{3})+(?!\d))/g, thousands);
  const result = decimalStr ? `${formattedInteger}${decimal}${decimalStr}` : formattedInteger;
  return isNegative ? `-${result}` : result;
}
function formatMask(value, pattern) {
  let result = "";
  let valIndex = 0;
  for (let i = 0; i < pattern.length && valIndex < value.length; i++) {
    const patternChar = pattern[i];
    if (patternChar === "9" || patternChar === "#") {
      while (valIndex < value.length && !/\d/.test(value[valIndex])) valIndex++;
      if (valIndex < value.length) {
        result += value[valIndex++];
      }
    } else if (patternChar === "a" || patternChar === "A") {
      while (valIndex < value.length && !/[a-zA-Z]/.test(value[valIndex])) valIndex++;
      if (valIndex < value.length) {
        result += value[valIndex++];
      }
    } else {
      result += patternChar;
      if (value[valIndex] === patternChar) {
        valIndex++;
      }
    }
  }
  return result;
}
function handleMask(element, expression, modifiers, _context) {
  if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) {
    throw new TypeError("b-mask can only be used on input and textarea elements.");
  }
  const trimmed = expression.trim();
  const isMoney = Boolean(modifiers.money) || trimmed.startsWith("money") || trimmed === "'money'";
  const applyMask = () => {
    const current = element.value;
    let formatted = "";
    if (isMoney) {
      formatted = formatMoney(current);
    } else {
      const pattern = trimmed.replace(/^['"]|['"]$/g, "");
      formatted = formatMask(current, pattern);
    }
    if (element.value !== formatted) {
      element.value = formatted;
      element.dispatchEvent(new Event("input", { bubbles: true }));
    }
  };
  element.addEventListener("input", applyMask);
  onCleanup(() => {
    element.removeEventListener("input", applyMask);
  });
}
function handleTeleport(element, expression, _modifiers, _context) {
  var _a;
  const targetSelector = expression.trim().replace(/^['"]|['"]$/g, "");
  const target = document.querySelector(targetSelector);
  if (!target) {
    console.warn(`b-teleport target "${targetSelector}" not found.`);
    return;
  }
  const placeholder = document.createComment("brio:teleport");
  (_a = element.parentNode) == null ? void 0 : _a.replaceChild(placeholder, element);
  target.appendChild(element);
  onCleanup(() => {
    if (placeholder.parentNode) {
      placeholder.parentNode.replaceChild(element, placeholder);
    } else {
      element.remove();
    }
    placeholder.remove();
  });
}
function handleTemplate(element, _expression, _modifiers, context, runtime, hydrateNodeFn) {
  var _a;
  const isTemplateTag = element.tagName.toLowerCase() === "template";
  const fragment = isTemplateTag ? element.content.cloneNode(true) : document.createDocumentFragment();
  if (!isTemplateTag) {
    while (element.firstChild) {
      fragment.appendChild(element.firstChild);
    }
  }
  const parent = element.parentNode;
  if (!parent) throw new Error("b-template requires an element with a parent node.");
  const placeholder = document.createComment("brio:template");
  parent.replaceChild(placeholder, element);
  const insertedNodes = Array.from(fragment.childNodes);
  (_a = placeholder.parentNode) == null ? void 0 : _a.insertBefore(fragment, placeholder.nextSibling);
  for (const node of insertedNodes) {
    hydrateNodeFn(node, context, runtime);
  }
}
function handleIntersection(element, attrName, expression, modifiers, context) {
  const isExit = attrName.includes("exit");
  const isOnce = Boolean(modifiers.once);
  let debounceTimer;
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const matches = isExit ? !entry.isIntersecting : entry.isIntersecting;
      if (matches) {
        const invoke = () => {
          execute(expression, createExpressionScope({ $entry: entry }, context));
          if (isOnce) observer.disconnect();
        };
        if (modifiers.debounce) {
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(invoke, 100);
        } else {
          invoke();
        }
      }
    }
  });
  observer.observe(element);
  onCleanup(() => {
    clearTimeout(debounceTimer);
    observer.disconnect();
  });
}
function handleMutation(element, attrName, expression, modifiers, context) {
  const isAdded = attrName.includes("addednodes");
  const isRemoved = attrName.includes("removednodes");
  const isAttrs = attrName.includes("attrs");
  const isText = attrName.includes("text");
  const options = {
    childList: isAdded || isRemoved || !isAttrs && !isText,
    attributes: isAttrs,
    characterData: isText,
    subtree: true
  };
  let debounceTimer;
  const observer = new MutationObserver((mutations) => {
    let matching = [];
    if (isAdded) {
      matching = mutations.filter((m) => m.addedNodes.length > 0);
    } else if (isRemoved) {
      matching = mutations.filter((m) => m.removedNodes.length > 0);
    } else if (isAttrs) {
      matching = mutations.filter((m) => m.type === "attributes");
    } else if (isText) {
      matching = mutations.filter((m) => m.type === "characterData");
    } else {
      matching = mutations;
    }
    if (matching.length) {
      const invoke = () => {
        execute(expression, createExpressionScope({ $mutations: matching }, context));
      };
      if (modifiers.debounce) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(invoke, 100);
      } else {
        invoke();
      }
    }
  });
  observer.observe(element, options);
  onCleanup(() => {
    clearTimeout(debounceTimer);
    observer.disconnect();
  });
}
function handleResize(element, _attrName, expression, modifiers, context) {
  let debounceTimer;
  const observer = new ResizeObserver((entries) => {
    const entry = entries[0];
    if (!entry) return;
    const invoke = () => {
      const size = {
        width: entry.contentRect.width,
        height: entry.contentRect.height
      };
      execute(expression, createExpressionScope({ $size: size, $entry: entry }, context));
    };
    if (modifiers.debounce) {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(invoke, 100);
    } else {
      invoke();
    }
  });
  observer.observe(element);
  onCleanup(() => {
    clearTimeout(debounceTimer);
    observer.disconnect();
  });
}
function handleEffect(_element, expression, _modifiers, context) {
  effect(() => {
    evaluate(expression, context);
  });
}
function handleScript(element, _expression, _modifiers, context) {
  if (element.tagName.toLowerCase() !== "script") return;
  const raw = (element.textContent || "").trim();
  if (!raw) return;
  const arrowRegex = /^\s*\(?\s*(?:(?:\(([^)]*)\)|([a-zA-Z_$][\w$]*))\s*=>\s*\{([\s\S]*)\})\s*;?\s*$/;
  const match = raw.match(arrowRegex);
  const scriptScope = createExpressionScope({ ctx: context, $ctx: context }, context);
  if (match) {
    try {
      const fn = evaluate(`(${raw.replace(/;\s*$/, "")})`, scriptScope);
      if (typeof fn === "function") {
        fn(scriptScope, context.$data);
        return;
      }
    } catch {
      const body = match[3];
      execute(body, scriptScope);
      return;
    }
  }
  execute(raw, scriptScope);
}
function extractModifiers(attrName) {
  const parts = attrName.split(".");
  const baseName = parts[0];
  const modifiers = {};
  for (let i = 1; i < parts.length; i++) {
    modifiers[parts[i]] = true;
  }
  return { baseName, modifiers };
}
function mountRouterOutlet(element, context, runtime, hydrateNodeFn) {
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
    const el = document.createElement(route.component);
    childElement = el;
    childScope = createScope();
    element.append(el);
    childScope.run(() => mountComponent(el, definition, context, runtime, hydrateNodeFn));
  });
}
const componentNamePattern$1 = /^[a-z][a-z0-9]*-[a-z0-9-]+$/;
function hydrateChildren(element, context, runtime) {
  for (const child of Array.from(element.childNodes)) {
    hydrateNode(child, context, runtime);
  }
}
const interpolationRegex = /\$\{([^}]+)\}/g;
function hydrateTextNode(node, context) {
  const raw = node.nodeValue ?? "";
  if (!raw.includes("${")) return;
  effect(() => {
    const text = raw.replace(interpolationRegex, (_, expr) => {
      const val = evaluate(expr, context);
      return val === null || val === void 0 ? "" : String(val);
    });
    node.nodeValue = text;
  });
}
function hydrateNode(node, parentContext, runtime) {
  if (node.nodeType === Node.TEXT_NODE) {
    hydrateTextNode(node, parentContext);
    return;
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return;
  const element = node;
  if (element.hasAttribute("b-ignore") || element.hasAttribute("ignore")) {
    return;
  }
  let context = createExpressionScope({ $el: element }, parentContext);
  const dataAttr = element.getAttribute("b-data");
  if (dataAttr !== null) {
    context = handleData(element, dataAttr, {}, parentContext);
    element.removeAttribute("b-data");
  }
  const idAttr = element.getAttribute("b-id");
  if (idAttr !== null) {
    context = handleId(element, idAttr, {}, context);
    element.removeAttribute("b-id");
  }
  const ifAttr = element.getAttribute("b-if");
  if (ifAttr !== null) {
    const { modifiers } = extractModifiers("b-if");
    handleIf(element, ifAttr, modifiers, context, runtime, hydrateNode);
    return;
  }
  const forAttr = element.getAttribute("b-for");
  if (forAttr !== null) {
    const { modifiers } = extractModifiers("b-for");
    handleFor(element, forAttr, modifiers, context, runtime, hydrateNode);
    return;
  }
  const templateAttr = element.getAttribute("b-template");
  if (templateAttr !== null) {
    handleTemplate(element, templateAttr, {}, context, runtime, hydrateNode);
    return;
  }
  const tagName = element.tagName.toLowerCase();
  const isComponent = componentNamePattern$1.test(tagName);
  const definition = isComponent ? runtime.components.get(tagName) : void 0;
  if (definition) {
    mountComponent(element, definition, context, runtime, hydrateNode);
    return;
  }
  let hasText = false;
  let hasHtml = false;
  for (const attribute of Array.from(element.attributes)) {
    const attrName = attribute.name;
    const attrValue = attribute.value;
    const { baseName, modifiers } = extractModifiers(attrName);
    if (baseName.startsWith("b-on-") || baseName.startsWith("on-")) {
      if (baseName.includes("-enter") || baseName.includes("-exit")) {
        handleIntersection(element, baseName, attrValue, modifiers, context);
      } else if (baseName.includes("-addednodes") || baseName.includes("-removednodes") || baseName.includes("-attrs") || baseName.includes("-text")) {
        handleMutation(element, baseName, attrValue, modifiers, context);
      } else if (baseName.includes("-resize")) {
        handleResize(element, baseName, attrValue, modifiers, context);
      } else {
        handleOn(element, baseName, attrValue, modifiers, context);
      }
      element.removeAttribute(attrName);
    } else if (baseName.startsWith("b-bind-") || baseName.startsWith("bind-")) {
      handleBind(element, baseName, attrValue, modifiers, context);
      element.removeAttribute(attrName);
    } else if (baseName === "b-model" || baseName === "model") {
      handleModel(element, attrValue, modifiers, context);
      element.removeAttribute(attrName);
    } else if (baseName === "b-show" || baseName === "show") {
      handleShow(element, attrValue, modifiers, context);
      element.removeAttribute(attrName);
    } else if (baseName === "b-text" || baseName === "text") {
      handleText(element, attrValue, modifiers, context);
      element.removeAttribute(attrName);
      hasText = true;
    } else if (baseName === "b-html" || baseName === "html") {
      handleHtml(element, attrValue, modifiers, context, runtime, hydrateChildren);
      element.removeAttribute(attrName);
      hasHtml = true;
    } else if (baseName === "b-mask" || baseName === "mask") {
      handleMask(element, attrValue, modifiers);
      element.removeAttribute(attrName);
    } else if (baseName === "b-teleport" || baseName === "teleport") {
      handleTeleport(element, attrValue);
      element.removeAttribute(attrName);
    } else if (baseName === "b-transition" || baseName === "transition") {
      handleTransition(element, attrValue);
      element.removeAttribute(attrName);
    } else if (baseName === "b-effect" || baseName === "effect") {
      handleEffect(element, attrValue, modifiers, context);
      element.removeAttribute(attrName);
    } else if (baseName === "b-script" || baseName === "script") {
      handleScript(element, attrValue, modifiers, context);
      element.removeAttribute(attrName);
    } else if (baseName === "b-router-outlet") {
      mountRouterOutlet(element, context, runtime, hydrateNode);
      element.removeAttribute(attrName);
      return;
    }
  }
  if (!hasText && !hasHtml) {
    hydrateChildren(element, context, runtime);
  }
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
      const context = createExpressionScope(
        appState,
        { $data: appState, trustedHTML }
      );
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
let scheduledQueue = [];
let isFlushing = false;
function queueTask(task) {
  scheduledQueue.push(task);
  if (!isFlushing) {
    isFlushing = true;
    queueMicrotask(flushQueue);
  }
}
function flushQueue() {
  try {
    const queue = scheduledQueue;
    scheduledQueue = [];
    for (let i = 0; i < queue.length; i++) {
      queue[i]();
    }
  } finally {
    isFlushing = false;
    if (scheduledQueue.length) {
      queueMicrotask(flushQueue);
    }
  }
}
function newStepEngine(steps) {
  const engine = createStepEngine(steps);
  return [
    (name, def) => engine.setStep(name, def),
    (name) => engine.isStepActive(name),
    (name) => engine.nextStep(name),
    (name) => engine.backStep(name),
    (name) => engine.originStep(name)
  ];
}
function createStepEngine(steps) {
  const setStep = (stepName, stepObject) => {
    if (!stepName) {
      console.warn("Step name is required.");
      return false;
    }
    steps[stepName] = stepObject && typeof stepObject === "object" ? stepObject : {};
    return true;
  };
  const isStepActive = (stepName) => {
    var _a;
    return Boolean((_a = steps[stepName]) == null ? void 0 : _a.active);
  };
  const toStep = (currStepName, stepKey) => {
    if (!isStepActive(currStepName)) return false;
    const currStep = steps[currStepName];
    const toStepName = currStep[stepKey];
    if (toStepName && steps[toStepName]) {
      if (!isStepActive(toStepName)) {
        steps[toStepName].active = true;
      }
      steps[toStepName].origin = currStepName;
      if (!currStep.keep) {
        currStep.active = false;
      }
      return true;
    } else {
      console.warn(`Step "${currStepName}" does not have a valid ${stepKey} step to go to.`);
      return false;
    }
  };
  const nextStep = (currStepName) => toStep(currStepName, "next");
  const backStep = (currStepName) => toStep(currStepName, "back");
  const originStep = (currStepName) => toStep(currStepName, "origin");
  const getActiveStep = () => {
    for (const [key, val] of Object.entries(steps)) {
      if (val.active) return key;
    }
    return void 0;
  };
  return {
    setStep,
    isStepActive,
    nextStep,
    backStep,
    originStep,
    getActiveStep
  };
}
const defaultRules = {
  required: (val) => {
    if (val === null || val === void 0 || val === false || val === "") return false;
    if (typeof val === "string") return val.trim().length > 0;
    if (Array.isArray(val)) return val.length > 0;
    if (typeof val === "object") return Object.keys(val).length > 0;
    return true;
  },
  min: (val, min) => {
    if (typeof val === "string" || Array.isArray(val)) return val.length >= Number(min);
    if (typeof val === "number") return val >= Number(min);
    return false;
  },
  max: (val, max) => {
    if (typeof val === "string" || Array.isArray(val)) return val.length <= Number(max);
    if (typeof val === "number") return val <= Number(max);
    return false;
  },
  email: (val) => {
    if (typeof val !== "string") return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  },
  same: (val, targetProp, allData) => val === allData[String(targetProp)],
  in: (val, list) => Array.isArray(list) && list.includes(val)
};
function validate(data, schema, customRules = {}) {
  const rules = { ...defaultRules, ...customRules };
  const errors = {};
  for (const [prop, propRules] of Object.entries(schema)) {
    const val = data[prop];
    for (const rule of propRules) {
      const ruleFn = rules[rule.name];
      if (ruleFn) {
        const passed = ruleFn(val, rule.value, data);
        if (!passed) {
          if (!errors[prop]) errors[prop] = [];
          errors[prop].push(rule.message || `${prop} failed ${rule.name} validation`);
        }
      } else {
        console.warn(`Unknown validation rule: ${rule.name}`);
      }
    }
  }
  return Object.keys(errors).length === 0 ? true : errors;
}
const request = (method) => async (url, body, options = {}) => {
  const headers = new Headers(options.headers);
  let finalBody = void 0;
  if (body !== void 0 && method !== "GET" && method !== "DELETE") {
    if (body instanceof FormData || body instanceof URLSearchParams || typeof body === "string") {
      finalBody = body;
    } else {
      headers.set("Content-Type", "application/json");
      finalBody = JSON.stringify(body);
    }
  } else if (body !== void 0 && (method === "GET" || method === "DELETE")) {
    const u = new URL(url, typeof location !== "undefined" ? location.href : "http://localhost");
    if (typeof body === "object") {
      for (const [k2, v] of Object.entries(body)) {
        u.searchParams.append(k2, String(v));
      }
    }
    url = u.href;
  }
  const response = await fetch(url, {
    ...options,
    method,
    headers,
    body: finalBody
  });
  if (!response.ok) {
    const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
    error.response = response;
    throw error;
  }
  const parser = options.parser;
  if (parser) {
    return response[parser]();
  }
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  return response.text();
};
const http = {
  get: request("GET"),
  post: request("POST"),
  put: request("PUT"),
  patch: request("PATCH"),
  delete: request("DELETE")
};
export {
  assign,
  batch,
  causedError,
  combinedError,
  computed,
  createApp,
  createExpressionScope,
  createRouter,
  createScope,
  createStepEngine,
  devtools,
  effect,
  evaluate,
  execute,
  k as getCurrentScope,
  http,
  hydrateNode,
  hydrateRoot,
  newStepEngine,
  onCleanup,
  j as onDispose,
  persist,
  queueTask,
  resource,
  s as setActiveScope,
  a as signal,
  state,
  trustedHTML,
  validate
};
//# sourceMappingURL=index.js.map
