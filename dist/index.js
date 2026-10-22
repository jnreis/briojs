var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { R as ReflectApi, $ as $PARENT, c as createTypeError, p as includesItem, d as deleteItem, b as createError, g as getLength, T as TELEPORT, a as arrayFrom, l as ownKeys, G as GET_OWN_PROPERTY_DESCRIPTOR, o as objectConstructor, n as createSyntaxError, t as startsWith, j as isInstanceOf, m as isString, k as isArray, f as isObjectType, e as objectEntries, q as objectKeys, u as TEMPLATE, A as ATTRIBUTES, B as B_TELEPORT, r as removeElement, h as isNumber, i as isFunction, v as isBoolean, w as snapshotList } from "./native-DNTl55LH.js";
import { b as getChildNodes, g as getAttribute, c as removeAttribute, a as addEventListener, r as removeEventListener, d as removeChild, e as getParent, f as getOwnerDocument, h as getNodeType, i as getNextSibling, j as insertBefore } from "./native-Di2Lf1wo.js";
import { e as evaluate, a as execute, b as emptyContextValues, d as createExpressionScope, f as assign, g as createProvidedValues, h as evaluateFunction, c as copyContextValues } from "./context-values-BXAsS55z.js";
import { j as getCurrentScope, a as combinedError, o as onCleanup, b as batch, e as effect, c as causedError, k as errorText, n as createScope, p as onDispose, h as directiveError, s as setScopeNode, r as locate, u as untrack, t as notifyRootMounted, v as flush, w as notifyAppDisposed, x as notifyAppCreated, y as notifyRootUnmounted } from "./effect-Hm6a3OX7.js";
import { z, f, E, m, A, B, D, C } from "./effect-Hm6a3OX7.js";
import { s as state, a as track, t as trigger } from "./state-TMgcg8XY.js";
import { b } from "./state-TMgcg8XY.js";
import { computed, resource } from "./reactivity.js";
import { createRouter } from "./router-entry.js";
import { persist } from "./persistence-entry.js";
import { createStepEngine } from "./step-entry.js";
import { validate } from "./forms-entry.js";
import { moneyMask } from "./money-mask-entry.js";
import { HttpError, http } from "./http-entry.js";
import { d, a, e, i } from "./devtools-DxlDsvKn.js";
const sources = /* @__PURE__ */ new WeakMap();
function createScopedState(source, parent) {
  const observed = state(sources.get(source) ?? source);
  if (ReflectApi.has(observed, $PARENT))
    throw createTypeError($PARENT + " is reserved for Brio scope ancestry.");
  const readOnly = () => {
    throw createTypeError("Brio scope $parent is read-only.");
  };
  const view = new Proxy(observed, {
    get(target, key, receiver) {
      return key === $PARENT ? parent : ReflectApi.get(target, key, receiver);
    },
    has(target, key) {
      return key === $PARENT || ReflectApi.has(target, key);
    },
    set(target, key, value, receiver) {
      if (key === $PARENT) return readOnly();
      return ReflectApi.set(target, key, value, receiver);
    },
    deleteProperty(target, key) {
      if (key === $PARENT) return readOnly();
      return ReflectApi.deleteProperty(target, key);
    },
    defineProperty(target, key, descriptor) {
      if (key === $PARENT) return readOnly();
      return ReflectApi.defineProperty(target, key, descriptor);
    }
  });
  sources.set(view, observed);
  return view;
}
const owners = /* @__PURE__ */ new WeakMap();
const hydratingNodes = [];
const hydratingCallbacks = [];
const getPendingHydration = (node) => {
  const index = hydratingNodes.lastIndexOf(node);
  return index < 0 ? void 0 : hydratingCallbacks[index] ?? (hydratingCallbacks[index] = /* @__PURE__ */ new Set());
};
function withHydration(node, hydrate) {
  var _a;
  if (includesItem(hydratingNodes, node)) {
    hydrate();
    return;
  }
  const depth = hydratingNodes.push(node) - 1;
  hydratingCallbacks[depth] = void 0;
  const pop = () => {
    const callbacks = hydratingCallbacks[depth];
    hydratingNodes.length = depth;
    hydratingCallbacks.length = depth;
    return callbacks;
  };
  try {
    hydrate();
  } catch (error) {
    pop();
    throw error;
  }
  (_a = pop()) == null ? void 0 : _a.forEach((callback) => callback());
}
function getNodeOwner(node) {
  const owner = owners.get(node);
  if (owner == null ? void 0 : owner.scope.disposed) {
    deleteItem(owners, node);
    return void 0;
  }
  return owner;
}
function ownNode(node, context, runtime) {
  const scope = getCurrentScope();
  if (!scope) throw createError("DOM hydration requires an active Brio scope.");
  const owner = { context, runtime, scope };
  owners.set(node, owner);
  return owner;
}
function disposeNodes(nodes) {
  const scopes = /* @__PURE__ */ new Set();
  const selected = (node) => nodes.some((root) => root === node || root.contains(node));
  const visit = (node) => {
    const owner = getNodeOwner(node);
    if (owner) scopes.add(owner.scope);
    visitChildren(arrayFrom(getChildNodes(node)));
  };
  const visitChildren = (children) => {
    var _a;
    for (let index = 0; index < getLength(children); index++) {
      const child = children[index];
      const portal = (_a = getNodeOwner(child)) == null ? void 0 : _a[TELEPORT];
      if (portal && !selected(portal.source)) {
        const end = children.indexOf(portal.end, index);
        if (end !== -1) {
          index = end;
          continue;
        }
      }
      visit(child);
    }
  };
  visitChildren(nodes);
  const errors = [];
  for (const scope of scopes) {
    try {
      scope.dispose();
    } catch (error) {
      errors.push(error);
    }
  }
  if (getLength(errors)) throw combinedError("Brio DOM content cleanup failed.", errors);
}
const registries = /* @__PURE__ */ new WeakMap();
const keys = Symbol("brio.refs");
function createRefs() {
  const values = objectConstructor.create(null);
  const readOnly = () => {
    throw createTypeError("$ref names are read-only.");
  };
  const refs = new Proxy(values, {
    get(target, key) {
      track(target, key);
      return ReflectApi.get(target, key);
    },
    has(target, key) {
      track(target, key);
      return ReflectApi.has(target, key);
    },
    ownKeys(target) {
      track(target, keys);
      return ownKeys(target);
    },
    [GET_OWN_PROPERTY_DESCRIPTOR](target, key) {
      track(target, key);
      const descriptor = ReflectApi[GET_OWN_PROPERTY_DESCRIPTOR](target, key);
      return descriptor && { ...descriptor, writable: false };
    },
    set: readOnly,
    deleteProperty: readOnly,
    defineProperty: readOnly,
    setPrototypeOf: readOnly,
    preventExtensions: readOnly
  });
  registries.set(refs, values);
  return refs;
}
function defineLazyRefs(context) {
  let refs;
  return objectConstructor.defineProperty(context, "$ref", {
    enumerable: true,
    configurable: true,
    get: () => refs ?? (refs = createRefs()),
    // Child scopes assigning their own `$ref` shadow this accessor instead of hitting a getter-only property.
    set(value) {
      objectConstructor.defineProperty(this, "$ref", { value, writable: true, enumerable: true, configurable: true });
    }
  });
}
function registerRef(refs, name, element) {
  const values = registries.get(refs);
  if (!values) throw createTypeError("b-ref requires a Brio ref registry.");
  if (objectConstructor.prototype.hasOwnProperty.call(values, name))
    throw createSyntaxError(`Duplicate b-ref name "${name}" in the same scope.`);
  const notify = () => batch(() => {
    trigger(values, name, "set");
    trigger(values, keys, "set");
  });
  values[name] = element;
  onCleanup(() => {
    if (values[name] !== element) return;
    delete values[name];
    notify();
  });
  notify();
}
const staticClasses = /* @__PURE__ */ new WeakMap();
const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const svgAttributeNames = "attributeName attributeType baseFrequency calcMode clipPathUnits diffuseConstant edgeMode filterUnits gradientTransform gradientUnits kernelMatrix kernelUnitLength keyPoints keySplines keyTimes lengthAdjust limitingConeAngle markerHeight markerUnits markerWidth maskContentUnits maskUnits numOctaves pathLength patternContentUnits patternTransform patternUnits pointsAtX pointsAtY pointsAtZ preserveAlpha preserveAspectRatio primitiveUnits refX refY repeatCount repeatDur requiredExtensions specularConstant specularExponent spreadMethod startOffset stdDeviation stitchTiles surfaceScale systemLanguage tableValues targetX targetY textLength viewBox xChannelSelector yChannelSelector";
let svgNames;
const findProperty = (element, name) => {
  for (let target = element; target; target = objectConstructor.getPrototypeOf(target)) {
    const descriptor = objectConstructor[GET_OWN_PROPERTY_DESCRIPTOR](target, name);
    if (descriptor) return descriptor;
  }
};
const resolveBindTarget = (element, name, forceProp) => {
  if (forceProp) {
    if (name in element) return name;
    for (let target = element; target; target = objectConstructor.getPrototypeOf(target))
      for (const key of objectConstructor.getOwnPropertyNames(target))
        if (key.toLowerCase() === name) return key;
    return name;
  }
  if (element.namespaceURI !== SVG_NAMESPACE) return name;
  svgNames ?? (svgNames = new Map(svgAttributeNames.split(" ").map((attribute) => [attribute.toLowerCase(), attribute])));
  return svgNames.get(name) ?? name;
};
const dynamicStyles = /* @__PURE__ */ new WeakMap();
const setBoundValue = (element, name, value, forceProp = false) => {
  if (name === "class") {
    let staticNames = staticClasses.get(element);
    if (!staticNames) {
      staticNames = new Set((getAttribute(element, "class") ?? "").split(/\s+/).filter(Boolean));
      staticClasses.set(element, staticNames);
    }
    const currentDynamic = /* @__PURE__ */ new Set();
    if (isString(value))
      value.split(/\s+/).filter(Boolean).forEach((className) => currentDynamic.add(className));
    else if (isArray(value))
      value.filter(Boolean).forEach((className) => String(className).split(/\s+/).filter(Boolean).forEach((name2) => currentDynamic.add(name2)));
    else if (value && isObjectType(value)) {
      for (const [className, enabled] of objectEntries(value))
        if (enabled) className.split(/\s+/).filter(Boolean).forEach((name2) => currentDynamic.add(name2));
    }
    const combined = /* @__PURE__ */ new Set([...staticNames, ...currentDynamic]);
    const current = getAttribute(element, "class");
    if (combined.size) {
      const next = arrayFrom(combined).join(" ");
      if (current !== next) element.setAttribute("class", next);
    } else if (current !== null) removeAttribute(element, "class");
    return;
  }
  if (name === "style" && value && isObjectType(value)) {
    const style = element.style;
    const previousProperties = dynamicStyles.get(element) ?? /* @__PURE__ */ new Set();
    const currentProperties = /* @__PURE__ */ new Set();
    const properties = objectEntries(value);
    for (const [property] of properties) {
      const normalized = property.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
      currentProperties.add(normalized);
      deleteItem(previousProperties, normalized);
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
  const aria = startsWith(name, "aria-");
  if (aria && (value === true || value === false)) value = String(value);
  const descriptor = forceProp || aria || startsWith(name, "data-") || !(name in element) ? void 0 : findProperty(element, name);
  if (forceProp || (descriptor == null ? void 0 : descriptor.set) || (descriptor == null ? void 0 : descriptor.writable)) {
    try {
      element[name] = value;
      return;
    } catch (error) {
      throw causedError(`Unable to bind property "${name}" on <${element.tagName.toLowerCase()}>: ${errorText(error)}`, error);
    }
  }
  if (value === null || value === void 0 || value === false) removeAttribute(element, name);
  else element.setAttribute(name, value === true ? "" : String(value));
};
function handleBind(element, attrName, expression, modifiers, context) {
  const rawTarget = attrName.slice(getLength(startsWith(attrName, "b-bind-") ? "b-bind-" : startsWith(attrName, "b-attr-") ? "b-attr-" : "bind-"));
  if (!rawTarget) throw createSyntaxError(`Brio binding directive "${attrName}" has no target.`);
  const forceProp = Boolean(modifiers.prop);
  const target = resolveBindTarget(element, rawTarget, forceProp);
  let last;
  let written = false;
  const start = () => effect(() => {
    const value = evaluate(expression, context, attrName, element);
    if (written && objectConstructor.is(value, last) && (value === null || !isObjectType(value))) return;
    setBoundValue(element, target, value, forceProp);
    last = value;
    written = true;
  });
  if (target === "value" && isInstanceOf(element, HTMLSelectElement)) {
    const observer = new MutationObserver(() => written && setBoundValue(element, target, last, forceProp));
    observer.observe(element, { childList: true, subtree: true });
    onCleanup(() => observer.disconnect());
    return start;
  }
  start();
}
const noModifiers = objectConstructor.freeze({});
const parsedNames = /* @__PURE__ */ new Map();
function extractModifiers(attrName) {
  let parsed = parsedNames.get(attrName);
  if (parsed) return parsed;
  if (attrName.indexOf(".") === -1) parsed = { baseName: attrName, modifiers: noModifiers };
  else {
    const parts = attrName.split(".");
    const modifiers = {};
    for (let i2 = 1; i2 < getLength(parts); i2++) modifiers[parts[i2]] = true;
    parsed = { baseName: parts[0], modifiers: objectConstructor.freeze(modifiers) };
  }
  if (parsedNames.size > 1e3) parsedNames.clear();
  parsedNames.set(attrName, objectConstructor.freeze(parsed));
  return parsed;
}
const keyNames = {
  enter: "Enter",
  esc: "Escape",
  space: " ",
  tab: "Tab",
  up: "ArrowUp",
  down: "ArrowDown",
  left: "ArrowLeft",
  right: "ArrowRight",
  delete: "Delete,Backspace"
};
const systemKeys = ["ctrl", "alt", "shift", "meta"];
let dispatching;
const eventModifiers = [
  "prevent",
  "stop",
  "self",
  "outside",
  "window",
  "document",
  "debounce",
  "throttle",
  "capture",
  "passive",
  "once",
  "ctrl",
  "alt",
  "shift",
  "meta",
  "enter",
  "esc",
  "space",
  "tab",
  "up",
  "down",
  "left",
  "right",
  "delete"
];
function handleOn(element, attrName, expression, modifiers, context) {
  const rawTarget = startsWith(attrName, "b-on-") ? attrName.slice(getLength("b-on-")) : attrName.slice(getLength("on-"));
  if (!rawTarget) throw createSyntaxError(`Brio event directive "${attrName}" has no event name.`);
  const names2 = objectKeys(modifiers);
  for (const name of names2)
    if (!includesItem(eventModifiers, name))
      throw createSyntaxError(`Unknown event modifier ".${name}" on "${attrName}". Supported: .${eventModifiers.join(", .")}.`);
  const keys2 = names2.flatMap((name) => {
    var _a;
    return ((_a = keyNames[name]) == null ? void 0 : _a.split(",")) ?? [];
  });
  const required = systemKeys.filter((name) => modifiers[name]);
  let target = element;
  const opener = modifiers.outside ? dispatching ?? globalThis.event : void 0;
  if (modifiers.outside) target = document;
  else if (modifiers.window) target = window;
  else if (modifiers.document) target = document;
  let debounceTimer;
  let throttleTimer;
  const handler = (event) => {
    if (getLength(keys2) && !includesItem(keys2, event.key)) return;
    if (required.some((name) => !event[`${name}Key`])) return;
    if (modifiers.prevent) event.preventDefault();
    if (modifiers.stop) event.stopPropagation();
    if (modifiers.self && event.target !== element) return;
    if (modifiers.outside && (event === opener || element.contains(event.target) || !element.isConnected)) return;
    if (modifiers.once) removeEventListener(target, rawTarget, handler, options);
    const invoke = () => {
      const previous = dispatching;
      dispatching = event;
      try {
        batch(() => execute(expression, context, event, attrName, element));
      } finally {
        dispatching = previous;
      }
    };
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
    passive: Boolean(modifiers.passive)
  };
  addEventListener(target, rawTarget, handler, options);
  onCleanup(() => {
    clearTimeout(debounceTimer);
    clearTimeout(throttleTimer);
    removeEventListener(target, rawTarget, handler, options);
  });
}
const projectedContexts = /* @__PURE__ */ new WeakMap();
function takeProjectedContext(node) {
  const context = projectedContexts.get(node);
  deleteItem(projectedContexts, node);
  return context;
}
const projectionFree = /* @__PURE__ */ new WeakSet();
const copyProjected = (source, target) => {
  const context = projectedContexts.get(source);
  let found = !!context;
  if (context) projectedContexts.set(target, context);
  for (let child = source.firstChild, copy = target.firstChild; child && copy; child = child.nextSibling, copy = copy.nextSibling)
    found = copyProjected(child, copy) || found;
  if (isInstanceOf(source, HTMLTemplateElement) && isInstanceOf(target, HTMLTemplateElement))
    found = copyProjected(source.content, target.content) || found;
  return found;
};
function cloneProjectedNode(node) {
  const clone = node.cloneNode(true);
  if (!projectionFree.has(node) && !copyProjected(node, clone)) projectionFree.add(node);
  return clone;
}
const isFragmentTemplate = (element) => element.localName === TEMPLATE && !element.hasAttribute("b-ignore") && arrayFrom(element[ATTRIBUTES]).some(({ name }) => startsWith(name, "b-") && name !== "b-cloak");
function findSlots(root) {
  return arrayFrom(root.querySelectorAll("slot, template")).flatMap((node) => isInstanceOf(node, HTMLTemplateElement) ? isFragmentTemplate(node) ? findSlots(node.content) : [] : [node]);
}
function fillSlots(host, template, context) {
  const slots = /* @__PURE__ */ new Map();
  for (const child of arrayFrom(getChildNodes(host))) {
    const name = isInstanceOf(child, Element) ? getAttribute(child, "slot") ?? "" : "";
    const content = slots.get(name) ?? [];
    content.push(child);
    slots.set(name, content);
  }
  for (const outlet of findSlots(template)) {
    const name = getAttribute(outlet, "name") ?? "";
    const content = slots.get(name);
    if (!(content == null ? void 0 : content.length)) {
      outlet.replaceWith(...arrayFrom(getChildNodes(outlet)));
      continue;
    }
    for (const node of content) projectedContexts.set(node, context);
    outlet.replaceWith(...content);
    deleteItem(slots, name);
  }
  for (const remaining of slots.values())
    for (const node of remaining) removeChild(getParent(node), node);
}
const parsedTemplates$1 = /* @__PURE__ */ new WeakMap();
const templateSelector = /^#[A-Za-z][\w-]*$/;
const instantiateTemplate = (definition, host) => {
  const ownerDocument = getOwnerDocument(host);
  const source = definition.template;
  let parsed = parsedTemplates$1.get(definition);
  if (!parsed || parsed.document !== ownerDocument) {
    let template = source;
    if (isString(source)) {
      if (templateSelector.test(source)) {
        template = ownerDocument.getElementById(source.slice(1));
        if ((template == null ? void 0 : template.localName) !== TEMPLATE)
          throw createError(`Component <${host.localName}> template "${source}" does not match a <template> element.`);
      } else {
        template = ownerDocument.createElement(TEMPLATE);
        template.innerHTML = source;
      }
    }
    parsedTemplates$1.set(definition, parsed = { document: ownerDocument, template });
  }
  return parsed.template.content.cloneNode(true);
};
function mountComponent(element, definition, context, runtime, hydrateNodeFn) {
  const propsObject = {};
  const declared = definition.props ?? {};
  for (const [name, type] of objectEntries(declared)) if (type === Boolean) propsObject[name] = false;
  for (const attribute of arrayFrom(element[ATTRIBUTES])) {
    const { name, value } = attribute;
    if (startsWith(name, "b-")) continue;
    const type = declared[name];
    propsObject[name] = type === Boolean ? value !== "false" : type === Number ? Number(value) : value;
  }
  const propBindings = arrayFrom(element[ATTRIBUTES]).filter((attribute) => startsWith(attribute.name, "b-bind-") || startsWith(attribute.name, "bind-")).map((attribute) => {
    const raw = startsWith(attribute.name, "b-bind-") ? attribute.name.slice(getLength("b-bind-")) : attribute.name.slice(getLength("bind-"));
    return {
      name: raw.split(".")[0],
      directive: attribute.name,
      expression: attribute.value
    };
  });
  const $props = state(propsObject);
  const $ref = createRefs();
  const componentScope = createScope();
  onCleanup(() => componentScope.dispose());
  const $emit = (name, detail) => {
    if (!/^[a-z][a-z0-9-]*$/.test(name))
      throw createTypeError(`Invalid component event name "${name}".`);
    element.dispatchEvent(new CustomEvent(name, { detail, bubbles: true }));
  };
  componentScope.run(() => {
    var _a, _b;
    for (const attribute of arrayFrom(element[ATTRIBUTES])) {
      if (startsWith(attribute.name, "b-on-") || startsWith(attribute.name, "on-")) {
        const { baseName, modifiers } = extractModifiers(attribute.name);
        if (!/^(b-)?on-[a-z-]+$/.test(baseName))
          throw createSyntaxError(`Invalid component event directive "${attribute.name}".`);
        handleOn(element, baseName, attribute.value, modifiers, context);
      } else if (startsWith(attribute.name, "b-attr-")) {
        handleBind(
          element,
          extractModifiers(attribute.name).baseName,
          attribute.value,
          extractModifiers(attribute.name).modifiers,
          context
        );
      } else if (startsWith(attribute.name, "b-") && !startsWith(attribute.name, "b-bind-")) {
        throw createError(`Directive "${attribute.name}" is not supported on component hosts.`);
      }
    }
    for (const binding of propBindings) {
      effect(() => {
        $props[binding.name] = evaluate(binding.expression, context, binding.directive, element);
      });
    }
    const setupResult = ((_b = definition.setup) == null ? void 0 : _b.call(definition, {
      el: element,
      $props,
      $emit,
      app: runtime.app,
      $stores: context.$stores ?? emptyContextValues,
      $provided: context.$provided ?? emptyContextValues,
      $ref,
      route: (_a = runtime.router) == null ? void 0 : _a.route
    })) ?? {};
    const local = createScopedState(setupResult, context.$data);
    const componentContext = createExpressionScope(
      { $data: local, $el: element, $props, $emit, $ref },
      context
    );
    const owner = getNodeOwner(element);
    if (owner) {
      owner.context = componentContext;
    } else {
      ownNode(element, componentContext, runtime);
    }
    const content = instantiateTemplate(definition, element);
    fillSlots(element, content, context);
    element.replaceChildren(content);
    withHydration(element, () => {
      for (const child of arrayFrom(getChildNodes(element))) {
        hydrateNodeFn(child, componentContext, runtime);
      }
    });
    for (const attribute of arrayFrom(element[ATTRIBUTES])) {
      if (startsWith(attribute.name, "b-")) removeAttribute(element, attribute.name);
    }
  });
}
const names = /* @__PURE__ */ new WeakMap();
const running = /* @__PURE__ */ new WeakMap();
function prepareTransition(element, expression) {
  names.set(element, expression.trim().replace(/^['"]|['"]$/g, "") || "brio");
}
function getTransitionName(element) {
  return names.get(element);
}
function cancelTransition(element) {
  var _a;
  (_a = running.get(element)) == null ? void 0 : _a();
}
function transitionTimeout(element) {
  const style = getOwnerDocument(element).defaultView.getComputedStyle(element);
  const milliseconds = (value) => parseFloat(value) * (value.trim().endsWith("ms") ? 1 : 1e3);
  const durations = style.transitionDuration.split(",").map(milliseconds);
  const delays = style.transitionDelay.split(",").map(milliseconds);
  return Math.max(0, ...style.transitionProperty.split(",").map(
    (property, index) => property.trim() === "none" ? 0 : durations[index % getLength(durations)] + delays[index % getLength(delays)]
  ));
}
function runTransition(element, name, phase, onDone) {
  const interrupted = running.has(element);
  cancelTransition(element);
  const view = getOwnerDocument(element).defaultView;
  const classes = [`${name}-${phase}`, `${name}-${phase}-active`, `${name}-${phase}-to`];
  const pending = /* @__PURE__ */ new Set();
  let started = false;
  let activated = false;
  let settled = false;
  let frame = 0;
  let completionFrame = 0;
  let timer;
  const cleanup = () => {
    if (settled) return;
    settled = true;
    view.cancelAnimationFrame(frame);
    view.cancelAnimationFrame(completionFrame);
    clearTimeout(timer);
    removeEventListener(element, "transitionrun", onRun);
    removeEventListener(element, "transitionend", onEnd);
    removeEventListener(element, "transitioncancel", onEnd);
    element.classList.remove(...classes);
    if (running.get(element) === cleanup) deleteItem(running, element);
  };
  const finish = () => {
    if (settled) return;
    cleanup();
    onDone == null ? void 0 : onDone();
  };
  const isOwnEvent = (event) => event.target === element && !event.pseudoElement;
  const onRun = (event) => {
    const transition = event;
    if (!activated || !isOwnEvent(transition)) return;
    started = true;
    pending.add(transition.propertyName);
  };
  const onEnd = (event) => {
    const transition = event;
    if (!activated || !isOwnEvent(transition)) return;
    deleteItem(pending, transition.propertyName);
    if (started && pending.size === 0) {
      view.cancelAnimationFrame(completionFrame);
      completionFrame = view.requestAnimationFrame(() => {
        if (pending.size === 0) finish();
      });
    }
  };
  running.set(element, cleanup);
  addEventListener(element, "transitionrun", onRun);
  addEventListener(element, "transitionend", onEnd);
  addEventListener(element, "transitioncancel", onEnd);
  const activate = () => {
    activated = true;
    element.classList.remove(classes[0]);
    element.classList.add(classes[1], classes[2]);
    const timeout = transitionTimeout(element);
    if (timeout > 0) timer = setTimeout(finish, timeout + 50);
    else finish();
  };
  if (interrupted) {
    activate();
  } else {
    element.classList.add(classes[0], classes[1]);
    frame = view.requestAnimationFrame(() => {
      frame = view.requestAnimationFrame(activate);
    });
  }
}
function enterTransition(element, name = "brio") {
  runTransition(element, name, "enter");
}
function leaveTransition(element, name = "brio", onDone) {
  runTransition(element, name, "leave", onDone);
}
function handleTransition(element, expression, _modifiers, _context) {
  var _a;
  prepareTransition(element, expression);
  onCleanup(() => {
    cancelTransition(element);
    deleteItem(names, element);
  });
  if (element.isConnected) {
    for (let ancestor = element; ancestor; ancestor = ancestor.parentElement) {
      if (((_a = ancestor.style) == null ? void 0 : _a.display) === "none") return;
    }
    enterTransition(element, getTransitionName(element));
  }
}
const trustedMarkup = Symbol("brio.trustedMarkup");
function trustedHTML(markup) {
  return { [trustedMarkup]: markup };
}
function isTrustedHTML(value) {
  return value !== null && isObjectType(value) && trustedMarkup in value;
}
function getTrustedHTMLString(value) {
  return value[trustedMarkup];
}
function portalPosition({ target, placement }) {
  const sibling = placement === "before" || placement === "after";
  const parent = sibling ? getParent(target) : target;
  if (!parent || getNodeType(parent) !== Node.ELEMENT_NODE && getNodeType(parent) !== Node.DOCUMENT_FRAGMENT_NODE)
    throw createError(B_TELEPORT + " placement requires an element or fragment container.");
  return {
    parent,
    reference: placement === "before" ? target : placement === "after" ? getNextSibling(target) : placement === "prepend" ? target.firstChild : null
  };
}
function createDomRange(document2, name) {
  const start = document2.createComment(`brio:${name}`);
  const end = document2.createComment(`/brio:${name}`);
  const fragment = document2.createDocumentFragment();
  fragment.append(start, end);
  const portals = /* @__PURE__ */ new Set();
  const homes = /* @__PURE__ */ new Map();
  let detached = false;
  let destination;
  let source;
  let redirected;
  let pendingRedirect = false;
  let resume;
  const detachPortal = (portal) => {
    const home = document2.createComment("brio:portal");
    insertBefore(getParent(portal.start), home, portal.start);
    homes.set(portal, home);
    portal.detach();
  };
  const nodes = (includeAnchors = false) => {
    const result = [];
    if (getParent(start) && getParent(start) === getParent(end)) {
      let current = includeAnchors ? start : getNextSibling(start);
      while (current && current !== end) {
        result.push(current);
        current = getNextSibling(current);
      }
      if (includeAnchors) result.push(end);
    }
    return result;
  };
  return {
    start,
    end,
    get detached() {
      return detached;
    },
    get destination() {
      return destination;
    },
    nodes,
    moveBefore(parent, reference) {
      const resuming = detached && getNodeType(parent) !== Node.DOCUMENT_FRAGMENT_NODE;
      if (resuming && pendingRedirect && source) {
        if (destination) ({ parent, reference } = portalPosition(destination));
        else if (getParent(source)) {
          parent = getParent(source);
          reference = getNextSibling(source);
        }
      } else if (resuming && resume && (!resume.reference || getParent(resume.reference) === resume.parent)) {
        ({ parent, reference } = resume);
      }
      if (reference === start && parent === getParent(start)) return;
      if (getParent(start) !== parent || getNextSibling(end) !== reference) {
        const contents = nodes(true);
        if (reference && includesItem(contents, reference))
          throw createError("Cannot move a Brio range inside itself.");
        for (const node of contents) insertBefore(parent, node, reference);
      }
      if (resuming) {
        detached = false;
        pendingRedirect = false;
        resume = void 0;
        for (const [portal, home] of homes) {
          if (getParent(home)) portal.moveBefore(getParent(home), home);
          removeElement(home);
        }
        homes.clear();
      }
    },
    detach() {
      if (!detached) {
        if (source && destination && getParent(start))
          resume = { parent: getParent(start), reference: getNextSibling(end) };
        detached = true;
        portals.forEach(detachPortal);
      }
      this.moveBefore(document2.createDocumentFragment(), null);
    },
    remove() {
      resume = void 0;
      portals.forEach(removeElement);
      homes.forEach(removeElement);
      homes.clear();
      for (const node of nodes(true)) removeChild(getParent(node), node);
    },
    addPortal(portal) {
      portals.add(portal);
      if (detached) detachPortal(portal);
    },
    removePortal(portal) {
      deleteItem(portals, portal);
      removeElement(homes.get(portal));
      deleteItem(homes, portal);
      removeElement(portal);
    },
    redirect(next, home) {
      destination = next;
      source = home;
      if (detached) pendingRedirect = true;
      if (redirected) redirected();
      else if (!detached) {
        if (destination) {
          const { parent, reference } = portalPosition(destination);
          this.moveBefore(parent, reference);
        } else if (getParent(source)) this.moveBefore(getParent(source), getNextSibling(source));
      }
    },
    onRedirect(callback) {
      redirected = callback;
    }
  };
}
class ElementRange {
  constructor(start) {
    __publicField(this, "end");
    __publicField(this, "detached", false);
    __publicField(this, "destination");
    this.start = start;
    this.end = start;
  }
  nodes() {
    return getParent(this.start) ? [this.start] : [];
  }
  moveBefore(parent, reference) {
    const { start } = this;
    if (reference === start) return;
    if (getParent(start) !== parent || getNextSibling(start) !== reference) insertBefore(parent, start, reference);
  }
  detach() {
    removeElement(this.start);
  }
  remove() {
    removeElement(this.start);
  }
  addPortal() {
    throw createError("Single-element Brio ranges cannot host portals.");
  }
  removePortal() {
  }
  redirect() {
    throw createError("Single-element Brio ranges cannot be redirected.");
  }
  onRedirect() {
  }
}
const createElementRange = (element) => new ElementRange(element);
const outputs = /* @__PURE__ */ new WeakMap();
function ownElementRange(element, context, runtime) {
  const existing = outputs.get(element);
  if (existing) return existing;
  const parent = getParent(element);
  if (!parent) throw createError("Brio rendered output requires an element with a parent node.");
  const range = createDomRange(getOwnerDocument(element), "range");
  insertBefore(parent, range.start, element);
  insertBefore(parent, range.end, getNextSibling(element));
  outputs.set(element, range);
  ownNode(range.start, context, runtime);
  ownNode(range.end, context, runtime);
  onCleanup(() => {
    deleteItem(outputs, element);
    removeElement(range);
  });
  return range;
}
const placements = /* @__PURE__ */ new Set(["before", "after", "prepend", "append", "replaceWith", "replaceChildren", "textContent"]);
function createInsert(runtime) {
  return (target, placement, content, options = {}) => {
    var _a, _b;
    const root = runtime.root;
    if (!root || ((_a = getNodeOwner(root)) == null ? void 0 : _a.runtime) !== runtime)
      throw createError("$insert requires an active mounted Brio root.");
    const node = isString(target) ? root.matches(target) ? root : root.querySelector(target) : target;
    if (!isInstanceOf(node, Node) || !root.contains(node) && ((_b = getNodeOwner(node)) == null ? void 0 : _b.runtime.root) !== root)
      throw createTypeError("$insert target must resolve to a node inside this app root.");
    const targetOwner = getNodeOwner(node);
    if (targetOwner && targetOwner.runtime.app !== runtime.app)
      throw createError("$insert cannot target content owned by another Brio app.");
    if (!options || !isObjectType(options) || isArray(options))
      throw createTypeError("$insert options must be an object.");
    if (!placements.has(placement))
      throw createTypeError(`Invalid $insert placement "${placement}".`);
    const siblingPlacement = placement === "before" || placement === "after" || placement === "replaceWith";
    if (siblingPlacement && node === root)
      throw createError("$insert cannot insert beside or replace a mount root.");
    if ((placement === "before" || placement === "after") && (targetOwner == null ? void 0 : targetOwner.loopRow))
      throw createError("$insert cannot insert beside a b-for row; insert inside the row or into the list container instead.");
    if (placement === "replaceWith" && (targetOwner == null ? void 0 : targetOwner.structuralRoot))
      throw createError("$insert cannot replace a root managed by b-if or b-for; replace its enclosing container instead.");
    const container = siblingPlacement ? getParent(node) : node;
    if (!isInstanceOf(container, Element))
      throw createTypeError("This $insert placement requires an element container.");
    const containerOwner = getNodeOwner(container);
    if (!containerOwner || containerOwner.runtime.app !== runtime.app || containerOwner.scope.disposed)
      throw createError("$insert destination has no active context owned by this app.");
    if (containerOwner.controlsChildren)
      throw createError("$insert cannot modify a container whose content is controlled by a directive.");
    if (!isString(content) && !isInstanceOf(content, Node))
      throw createTypeError("$insert content must be an HTML string or a node to clone.");
    const document2 = getOwnerDocument(container);
    const fragment = document2.createDocumentFragment();
    if (placement === "textContent") {
      fragment.append(document2.createTextNode(isString(content) ? content : content.textContent ?? ""));
    } else if (isString(content)) {
      const template = document2.createElement(TEMPLATE);
      template.innerHTML = getTrustedHTMLString(trustedHTML(content));
      fragment.append(template.content);
    } else {
      const supportedTypes = [Node.ELEMENT_NODE, Node.TEXT_NODE, Node.COMMENT_NODE, Node.DOCUMENT_FRAGMENT_NODE];
      if (!includesItem(supportedTypes, getNodeType(content)))
        throw createTypeError("$insert can clone elements, text, comments, or document fragments.");
      fragment.append(document2.importNode(content, true));
    }
    const context = options.data === void 0 ? containerOwner.context : createExpressionScope({
      $data: createScopedState(options.data, containerOwner.context.$data)
    }, containerOwner.context);
    const previous = placement === "replaceWith" ? [node] : placement === "replaceChildren" || placement === "textContent" ? arrayFrom(getChildNodes(container)) : [];
    const reference = placement === "before" ? node : placement === "after" || placement === "replaceWith" ? getNextSibling(node) : placement === "prepend" ? container.firstChild : null;
    disposeNodes(previous);
    const range = createDomRange(document2, "insert");
    const { start, end } = range;
    const children = arrayFrom(getChildNodes(fragment));
    fragment.prepend(start);
    fragment.append(end);
    const scope = createScope(containerOwner.scope);
    let removed = false;
    const handle = {
      get nodes() {
        return range.nodes();
      },
      get removed() {
        return removed;
      },
      remove() {
        scope.dispose();
      }
    };
    onDispose(scope, () => {
      removed = true;
      const current = range.nodes();
      try {
        disposeNodes(current);
      } finally {
        removeElement(range);
      }
    });
    try {
      if (placement === "replaceChildren" || placement === "textContent") {
        container.replaceChildren(fragment);
      } else {
        insertBefore(container, fragment, (reference == null ? void 0 : reference.parentNode) === container ? reference : null);
        previous.forEach((child) => removeChild(getParent(child), child));
      }
      scope.run(() => {
        ownNode(start, context, containerOwner.runtime);
        ownNode(end, context, containerOwner.runtime);
        if (placement !== "textContent") {
          withHydration(container, () => {
            for (const child of children)
              if (getParent(child) === container) hydrateNode(child, context, containerOwner.runtime);
          });
        }
      });
    } catch (error) {
      try {
        removeElement(handle);
      } catch (cleanupError) {
        throw combinedError("Brio insertion and cleanup both failed.", [error, cleanupError]);
      }
      throw error;
    }
    return handle;
  };
}
const interpolationRegex = /\$\{([^}]+)\}/g;
const parsedTemplates = /* @__PURE__ */ new Map();
const parse = (text) => {
  let parts = parsedTemplates.get(text);
  if (!parts) {
    parts = text.split(interpolationRegex);
    parsedTemplates.set(text, parts);
    if (parsedTemplates.size > 500) deleteItem(parsedTemplates, parsedTemplates.keys().next().value);
  }
  return parts;
};
function interpolateText(text, context) {
  const parts = parse(text);
  let result = parts[0];
  for (let index = 1; index < getLength(parts); index += 2) {
    const value = evaluate(parts[index], context, "text interpolation");
    result += (value === null || value === void 0 ? "" : String(value)) + parts[index + 1];
  }
  return result;
}
function handleModel(element, expression, modifiers, context) {
  if (!(isInstanceOf(element, HTMLInputElement) || isInstanceOf(element, HTMLTextAreaElement) || isInstanceOf(element, HTMLSelectElement)))
    throw createTypeError("b-model can only be used on input, textarea, and select elements.");
  const isLazy = Boolean(modifiers.lazy);
  const isTrim = Boolean(modifiers.trim);
  const isNumber2 = Boolean(modifiers.number);
  const formatValue = (val) => {
    let res = isTrim ? val.trim() : val;
    if (isNumber2) {
      const parsed = parseFloat(res);
      return isNaN(parsed) ? res : parsed;
    }
    return res;
  };
  const updateState = () => {
    const input = element;
    const current = evaluate(expression, context, "b-model", element);
    if (isInstanceOf(element, HTMLSelectElement) && element.multiple) {
      assign(expression, context, arrayFrom(element.selectedOptions, (option) => formatValue(option.value)), "b-model", element);
    } else if (input.type === "checkbox" && isArray(current)) {
      const values = current.slice();
      const formattedVal = formatValue(input.value);
      const index = values.indexOf(formattedVal);
      if (input.checked && index < 0) values.push(formattedVal);
      else if (!input.checked && index >= 0) values.splice(index, 1);
      assign(expression, context, values, "b-model", element);
    } else if (input.type === "checkbox") {
      assign(expression, context, input.checked, "b-model", element);
    } else if (input.type === "radio") {
      if (input.checked) assign(expression, context, formatValue(input.value), "b-model", element);
    } else {
      assign(expression, context, formatValue(element.value), "b-model", element);
    }
  };
  const eventName = isLazy ? "change" : "input";
  addEventListener(element, eventName, updateState);
  if (!isLazy && (isInstanceOf(element, HTMLInputElement) && (element.type === "checkbox" || element.type === "radio") || isInstanceOf(element, HTMLSelectElement))) {
    addEventListener(element, "change", updateState);
  }
  onCleanup(() => {
    removeEventListener(element, eventName, updateState);
    removeEventListener(element, "change", updateState);
  });
  const updateElement = (value) => {
    const input = element;
    if (isInstanceOf(element, HTMLSelectElement) && element.multiple && isArray(value)) {
      const selected = new Set(value.map(String));
      for (const option of arrayFrom(element.options)) option.selected = selected.has(option.value);
    } else if (input.type === "checkbox") {
      input.checked = isArray(value) ? includesItem(value, formatValue(input.value)) : Boolean(value);
    } else if (input.type === "radio") {
      input.checked = objectConstructor.is(value, formatValue(input.value));
    } else if (element.value !== String(value ?? "")) {
      element.value = String(value ?? "");
    }
  };
  const start = () => {
    effect(() => updateElement(evaluate(expression, context, "b-model", element)));
  };
  if (isInstanceOf(element, HTMLSelectElement)) {
    const observer = new MutationObserver(() => updateElement(evaluate(expression, context, "b-model", element)));
    observer.observe(element, { childList: true, subtree: true });
    onCleanup(() => observer.disconnect());
    return start;
  }
  start();
}
function handleIf(element, expression, modifiers, context, runtime, hydrateNodeFn) {
  const parent = getParent(element);
  if (!parent) throw createError("b-if requires an element with a parent node.");
  if (objectKeys(modifiers).some((name) => !includesItem(["hide", "detach"], name)))
    throw createSyntaxError("b-if supports only .hide and .detach modifiers.");
  if (modifiers.hide && modifiers.detach)
    throw createSyntaxError("b-if.hide and b-if.detach cannot be combined.");
  const preserved = Boolean(modifiers.hide || modifiers.detach);
  const branches = [];
  const originals = [];
  const addBranch = (node, condition) => {
    const attributes = arrayFrom(node[ATTRIBUTES]);
    const conditional = attributes.filter((attribute) => includesItem(["b-if", "b-else-if", "b-else"], extractModifiers(attribute.name).baseName));
    if (getLength(conditional) !== 1)
      throw createSyntaxError("An element can have only one conditional directive.");
    if (node !== element && getLength(objectKeys(extractModifiers(conditional[0].name).modifiers)))
      throw createSyntaxError("Conditional modifiers belong only on the leading b-if, not b-else-if or b-else.");
    if (modifiers.hide && (node.localName === TEMPLATE || attributes.some((attribute) => includesItem(["b-for", "b-template", TEMPLATE], extractModifiers(attribute.name).baseName))))
      throw createSyntaxError("b-if.hide requires a concrete branch element; wrap b-for or b-template in another element or use .detach.");
    const template = cloneProjectedNode(node);
    removeAttribute(template, conditional[0].name);
    if (template.localName === TEMPLATE) template.setAttribute("b-template", "");
    originals.push(node);
    branches.push({ template, expression: condition });
  };
  addBranch(element, expression);
  const nextBranch = (node) => {
    var _a;
    let next = getNextSibling(node);
    while (next && (getNodeType(next) === Node.COMMENT_NODE || getNodeType(next) === Node.TEXT_NODE && !((_a = next.textContent) == null ? void 0 : _a.trim()))) next = getNextSibling(next);
    return (next == null ? void 0 : next.nodeType) === Node.ELEMENT_NODE ? next : null;
  };
  let sibling = nextBranch(element);
  let ended = false;
  while (sibling) {
    const conditional = arrayFrom(sibling[ATTRIBUTES]).find((attribute) => includesItem(["b-else-if", "b-else"], extractModifiers(attribute.name).baseName));
    if (!conditional) break;
    if (ended)
      throw createSyntaxError("b-else must be the last branch of a b-if chain.");
    ended = extractModifiers(conditional.name).baseName === "b-else";
    addBranch(sibling, ended ? void 0 : conditional.value);
    sibling = nextBranch(sibling);
  }
  const output = ownElementRange(element, context, runtime);
  const placeholder = output.start;
  removeElement(element);
  originals.slice(1).forEach(removeElement);
  let stopCondition;
  onCleanup(() => stopCondition == null ? void 0 : stopCondition());
  const selectBranch = () => branches.findIndex((candidate) => candidate.expression === void 0 || Boolean(evaluate(candidate.expression, context, candidate === branches[0] ? "b-if" : "b-else-if", candidate.template)));
  const instances = /* @__PURE__ */ new Map();
  const anchors = [];
  let active;
  let activeBranch = -1;
  let initialized = false;
  const createAnchor = () => {
    const anchor = getOwnerDocument(element).createComment("brio:if:branch");
    ownNode(anchor, context, runtime);
    anchors.push(anchor);
    return anchor;
  };
  const destroy = (instance) => {
    deleteItem(instances, instance.index);
    cancelTransition(instance.element);
    try {
      instance.scope.dispose();
    } finally {
      removeElement(instance.output);
    }
  };
  onCleanup(() => {
    const errors = [];
    for (const instance of instances.values()) {
      try {
        destroy(instance);
      } catch (error) {
        errors.push(error);
      }
    }
    anchors.forEach(removeElement);
    removeElement(placeholder);
    if (getLength(errors)) throw combinedError("Conditional branch cleanup failed.", errors);
  });
  const deactivate = (instance, animate) => {
    const current = instance.element;
    const name = getTransitionName(current);
    const finish = () => {
      if (!preserved) destroy(instance);
      else if (modifiers.hide) current.style.display = "none";
      else instance.output.detach();
    };
    if (animate && name && current.isConnected) leaveTransition(current, name, finish);
    else {
      cancelTransition(current);
      finish();
    }
  };
  const createInstance = (index, visible, anchor = placeholder) => {
    const current = cloneProjectedNode(branches[index].template);
    const scope = createScope();
    const destination = visible || modifiers.hide ? getParent(anchor) : getOwnerDocument(element).createDocumentFragment();
    insertBefore(destination, current, destination === getParent(anchor) ? getNextSibling(anchor) : null);
    const range = scope.run(() => ownElementRange(current, context, runtime));
    const instance = {
      index,
      element: current,
      scope,
      anchor,
      output: range,
      display: current.style.display === "none" ? "" : current.style.display
    };
    instances.set(index, instance);
    if (modifiers.hide) current.style.display = visible ? instance.display : "none";
    try {
      instance.scope.run(() => hydrateNodeFn(current, context, runtime));
      const owner = getNodeOwner(current);
      if (owner) owner.structuralRoot = true;
      if (preserved && range.start.isConnected && !includesItem(output.nodes(), range.start)) {
        instance.anchor = createAnchor();
        range.start.before(instance.anchor);
      }
      if (!visible) deactivate(instance, false);
      return instance;
    } catch (error) {
      try {
        destroy(instance);
      } catch (cleanupError) {
        throw combinedError("Conditional hydration and cleanup both failed.", [error, cleanupError]);
      }
      throw error;
    }
  };
  const activate = (index, animate) => {
    var _a;
    const instance = instances.get(index);
    if (!instance) return createInstance(index, true);
    const current = instance.element;
    if (modifiers.hide) current.style.display = instance.display;
    else if (((_a = getParent(instance.output.start)) == null ? void 0 : _a.nodeType) === Node.DOCUMENT_FRAGMENT_NODE && getParent(instance.anchor))
      instance.output.moveBefore(getParent(instance.anchor), getNextSibling(instance.anchor));
    const name = getTransitionName(current);
    if (animate && name) enterTransition(current, name);
    else cancelTransition(current);
    return instance;
  };
  stopCondition = effect(() => {
    let selected = selectBranch();
    const initial = !initialized;
    initialized = true;
    if (initial && preserved) {
      let cursor = placeholder;
      for (const index of branches.keys()) {
        const anchor = createAnchor();
        insertBefore(parent, anchor, getNextSibling(cursor));
        const instance = createInstance(index, index === selected, anchor);
        cursor = getParent(instance.output.end) === parent ? instance.output.end : anchor;
      }
      activeBranch = selected;
      active = instances.get(selected);
      selected = selectBranch();
    }
    if (selected === activeBranch) return;
    const previous = active;
    active = void 0;
    activeBranch = selected;
    if (previous) deactivate(previous, !initial);
    if (selected >= 0) active = activate(selected, !initial);
  });
}
const longestIncreasing = (positions) => {
  const tails = [];
  const previous = [];
  positions.forEach((position, index) => {
    if (position < 0) return;
    let low = 0;
    let high = getLength(tails);
    while (low < high) {
      const middle = low + high >> 1;
      if (positions[tails[middle]] < position) low = middle + 1;
      else high = middle;
    }
    previous[index] = low ? tails[low - 1] : -1;
    tails[low] = index;
  });
  const stable = /* @__PURE__ */ new Set();
  for (let index = getLength(tails) ? tails[getLength(tails) - 1] : -1; index >= 0; index = previous[index])
    stable.add(index);
  return stable;
};
const enumerate = (value) => {
  if (value === null || value === void 0) return { items: [] };
  if (isArray(value) || isObjectType(value) && Symbol.iterator in value)
    return { items: arrayFrom(value) };
  if (isObjectType(value)) {
    const entries = objectEntries(value);
    return { keys: entries.map((entry) => entry[0]), items: entries.map((entry) => entry[1]) };
  }
  if (isNumber(value) && Number.isInteger(value) && value >= 0)
    return { items: arrayFrom({ length: value }, (_, index) => index + 1) };
  throw createTypeError("b-for expects an array, iterable, object, or non-negative integer.");
};
function handleFor(element, expression, _modifiers, context, runtime, hydrateNodeFn) {
  const parent = getParent(element);
  if (!parent) throw createError("b-for requires an element with a parent node.");
  const parsed = /^\s*([A-Za-z_$][\w$]*)(?:\s*,\s*([A-Za-z_$][\w$]*))?\s+in\s+([\s\S]+)$/.exec(expression);
  if (!parsed) throw createSyntaxError(`Invalid b-for expression "${expression}". Use "item in $data.items".`);
  const [, itemName, indexName = "$index", collectionExpression] = parsed;
  if (itemName === $PARENT || indexName === $PARENT)
    throw createSyntaxError($PARENT + " is reserved for Brio loop ancestry.");
  const keyExpression = getAttribute(element, "b-key");
  const output = ownElementRange(element, context, runtime);
  const placeholder = output.start;
  const template = cloneProjectedNode(element);
  removeAttribute(template, "b-for");
  removeAttribute(template, "b-key");
  if (template.localName === TEMPLATE) template.setAttribute("b-template", "");
  removeElement(element);
  const anchorless = template.localName !== TEMPLATE && !arrayFrom(template[ATTRIBUTES]).some(({ name }) => {
    const { baseName } = extractModifiers(name);
    return baseName === B_TELEPORT || baseName === TELEPORT || baseName === "b-template";
  });
  const rows = /* @__PURE__ */ new Map();
  const portals = [];
  let ordered = [];
  let placed = /* @__PURE__ */ new Map();
  let reconciling = false;
  const reconcilePositions = () => {
    if (reconciling) return;
    const used = /* @__PURE__ */ new Set();
    const destinations = /* @__PURE__ */ new Map();
    for (const row of ordered) {
      const destination = row.output.destination;
      if (!destination) continue;
      let portal = portals.find((candidate) => candidate.destination.target === destination.target && candidate.destination.placement === destination.placement);
      if (!portal) {
        const range = createDomRange(getOwnerDocument(element), "for:portal");
        range.redirect(destination, output.end);
        portal = { destination, range };
        portals.push(portal);
        output.addPortal(range);
      }
      used.add(portal.range);
      destinations.set(row, portal.range);
    }
    const references = /* @__PURE__ */ new Map([[output, output.end]]);
    for (const portal of portals) references.set(portal.range, portal.range.end);
    const stable = longestIncreasing(ordered.map((row) => destinations.has(row) || row.output.detached ? -1 : placed.get(row) ?? -1));
    for (let index = getLength(ordered) - 1; index >= 0; index--) {
      const row = ordered[index];
      const destination = destinations.get(row) ?? output;
      if (!stable.has(index))
        row.output.moveBefore(getParent(destination.end), references.get(destination) ?? null);
      references.set(destination, row.output.start);
    }
    placed = /* @__PURE__ */ new Map();
    for (const row of ordered) if (!destinations.has(row)) placed.set(row, placed.size);
    for (let index = getLength(portals) - 1; index >= 0; index--) {
      if (!used.has(portals[index].range)) {
        output.removePortal(portals[index].range);
        portals.splice(index, 1);
      }
    }
  };
  const clearAll = () => {
    const host = getParent(output.end);
    const kept = [];
    let blank = true;
    for (let node = host.firstChild; node; node = getNextSibling(node)) {
      if (node === output.start) node = output.end;
      else if (node.nodeType !== Node.TEXT_NODE || (node.nodeValue ?? "").trim()) {
        blank = false;
        break;
      }
      kept.push(node);
      if (getLength(kept) > 16) {
        blank = false;
        break;
      }
    }
    if (!blank || getLength(getChildNodes(host)) !== rows.size + getLength(kept) + 1) return;
    try {
      for (const row of rows.values()) row.scope.dispose();
    } finally {
      rows.clear();
      host.textContent = "";
      for (const node of kept) {
        if (node === output.end) host.appendChild(output.start);
        host.appendChild(node);
      }
    }
  };
  onCleanup(() => {
    const errors = [];
    for (const row of rows.values()) {
      try {
        row.scope.dispose();
      } catch (error) {
        errors.push(error);
      } finally {
        removeElement(row.output);
      }
    }
    rows.clear();
    removeElement(placeholder);
    if (getLength(errors)) throw new AggregateError(errors, "One or more repeated items failed to dispose.");
  });
  effect(() => {
    reconciling = true;
    try {
      const { items, keys: keys2 } = enumerate(evaluate(collectionExpression, context, "b-for", element));
      const nextKeys = /* @__PURE__ */ new Set();
      const probe = { $parent: context.$for };
      const keyContext = keyExpression ? createExpressionScope({ $for: probe }, context) : void 0;
      const rowKeys = [];
      let survivors = 0;
      for (let position = 0; position < getLength(items); position++) {
        let evaluatedKey = keys2 ? keys2[position] : position;
        if (keyContext) {
          probe[itemName] = items[position];
          probe[indexName] = evaluatedKey;
          evaluatedKey = evaluate(keyExpression, keyContext, "b-key", element);
        }
        if (!isString(evaluatedKey) && !isNumber(evaluatedKey))
          throw createTypeError("b-key must evaluate to a string or number.");
        if (nextKeys.has(evaluatedKey))
          throw createError(`Duplicate b-for key "${evaluatedKey}" from b-key="${keyExpression}".`);
        nextKeys.add(evaluatedKey);
        rowKeys.push(evaluatedKey);
        if (rows.has(evaluatedKey)) survivors++;
      }
      if (!survivors && rows.size && anchorless && !getLength(portals)) clearAll();
      ordered = [];
      for (let position = 0; position < getLength(items); position++) {
        const item = items[position];
        const index = keys2 ? keys2[position] : position;
        const evaluatedKey = rowKeys[position];
        let row = rows.get(evaluatedKey);
        if (!row) {
          const rowState = createScopedState({ [itemName]: item, [indexName]: index }, context.$for);
          const rowContext = defineLazyRefs(createExpressionScope({ $for: rowState }, context));
          const rowElement = cloneProjectedNode(template);
          const rowScope = createScope();
          insertBefore(getParent(output.end), rowElement, output.end);
          const range = anchorless ? createElementRange(rowElement) : rowScope.run(() => ownElementRange(rowElement, rowContext, runtime));
          range.onRedirect(reconcilePositions);
          row = { element: rowElement, context: rowContext, values: rowState, item, index, scope: rowScope, key: evaluatedKey, output: range };
          rows.set(evaluatedKey, row);
          try {
            rowScope.run(() => hydrateNodeFn(rowElement, rowContext, runtime));
          } catch (error) {
            deleteItem(rows, evaluatedKey);
            try {
              rowScope.dispose();
            } catch (cleanupError) {
              throw combinedError("Loop hydration and cleanup both failed.", [error, cleanupError]);
            } finally {
              removeElement(range);
            }
            throw error;
          }
          const owner = getNodeOwner(rowElement);
          if (owner) owner.structuralRoot = owner.loopRow = true;
        } else {
          if (row.item !== item) row.values[itemName] = row.item = item;
          if (row.index !== index) row.values[indexName] = row.index = index;
        }
        ordered.push(row);
      }
      for (const [key, row] of rows) {
        if (nextKeys.has(key)) continue;
        try {
          row.scope.dispose();
        } finally {
          removeElement(row.output);
          deleteItem(rows, key);
        }
      }
    } finally {
      reconciling = false;
    }
    reconcilePositions();
  });
}
function handleHtml(element, expression, modifiers, context, runtime, hydrateChildrenFn) {
  let contentScope;
  onCleanup(() => contentScope == null ? void 0 : contentScope.dispose());
  effect(() => {
    const html = evaluate(expression, context, "b-html", element);
    if (modifiers.hydrate && !isTrustedHTML(html))
      throw createTypeError("b-html.hydrate requires a trustedHTML() value.");
    const htmlStr = isTrustedHTML(html) ? getTrustedHTMLString(html) : String(html ?? "");
    contentScope == null ? void 0 : contentScope.dispose();
    contentScope = void 0;
    const template = document.createElement(TEMPLATE);
    template.innerHTML = htmlStr;
    element.replaceChildren(template.content);
    if (modifiers.hydrate) {
      contentScope = createScope();
      contentScope.run(() => hydrateChildrenFn(element, context, runtime));
    }
  });
}
function handleText(element, expression, context) {
  let last;
  effect(() => {
    const value = evaluate(expression, context, "b-text", element);
    const text = value === null || value === void 0 ? "" : String(value);
    if (text !== last) element.textContent = last = text;
  });
}
function handleData(element, expression, _modifiers, parentContext) {
  const context = createExpressionScope({ $el: element }, parentContext);
  if (!expression.trim()) return context;
  const data = evaluate(expression, context, "b-data", element);
  if (data === null || !isObjectType(data))
    throw createTypeError("b-data must evaluate to an object.");
  const reactiveData = createScopedState(data, parentContext.$data);
  const scopeObj = {
    $data: reactiveData,
    $el: element
  };
  return createExpressionScope(
    scopeObj,
    parentContext
  );
}
function handleProvide(expression, context) {
  const $provided = createProvidedValues(() => evaluate(expression, context, "b-provide"), context.$provided);
  return createExpressionScope({ $provided }, context);
}
let idSeq = 0;
const activeIds = /* @__PURE__ */ new Set();
function handleId(_element, expression, _modifiers, context) {
  const evaluated = expression ? evaluate(expression, context, "b-id") : ["id"];
  const idList = isArray(evaluated) ? evaluated : [String(evaluated)];
  const idMap = {};
  for (const name of idList) {
    const generated = `brio-${++idSeq}`;
    activeIds.add(generated);
    idMap[name] = generated;
  }
  onCleanup(() => {
    for (const val of objectConstructor.values(idMap)) {
      deleteItem(activeIds, val);
    }
  });
  return createExpressionScope({ $id: idMap }, context);
}
function compilePattern(pattern) {
  const parts = [];
  const characters = [...pattern];
  for (let index = 0; index < getLength(characters); index++) {
    const character = characters[index];
    if (character === "\\") {
      if (++index === getLength(characters)) throw createSyntaxError("Mask pattern cannot end with an escape.");
      parts.push({ literal: characters[index] });
    } else if (character === "*") parts.push({ accepts: () => true });
    else if (character === "A") parts.push({ accepts: (value) => /[\p{L}\p{Nd}]/u.test(value) });
    else if (character === "a") parts.push({ accepts: (value) => new RegExp("\\p{L}", "u").test(value) });
    else if (character === "#") parts.push({ accepts: (value) => new RegExp("\\p{Nd}", "u").test(value) });
    else parts.push({ literal: character });
  }
  return parts;
}
function patternFormatter(pattern) {
  const parts = compilePattern(pattern);
  return (context) => {
    const input = [...context.value];
    const positions = [];
    let value = "";
    let index = 0;
    let offset = 0;
    for (const part of parts) {
      if (index >= getLength(input)) break;
      if ("literal" in part) {
        value += part.literal;
        if (input[index] === part.literal) {
          offset += getLength(input[index++]);
        }
      } else {
        while (index < getLength(input) && !part.accepts(input[index]))
          offset += getLength(input[index++]);
        if (index < getLength(input)) {
          const character = input[index++];
          value += character;
          offset += getLength(character);
          positions.push({ input: offset, output: getLength(value) });
        }
      }
    }
    const map = (position) => {
      var _a;
      if (position === null) return void 0;
      return ((_a = positions.filter((entry) => entry.input <= position).at(-1)) == null ? void 0 : _a.output) ?? 0;
    };
    return { value, selectionStart: map(context.selectionStart), selectionEnd: map(context.selectionEnd) };
  };
}
function validateResult(result) {
  if (isString(result)) return;
  if (result === null || !isObjectType(result) || !("value" in result) || !isString(result.value))
    throw createTypeError("Mask formatter must return a string or { value, selectionStart?, selectionEnd? }.");
  for (const key of ["selectionStart", "selectionEnd"]) {
    const position = key in result ? ReflectApi.get(result, key) : void 0;
    if (position !== void 0 && (!isNumber(position) || !Number.isInteger(position) || position < 0 || position > getLength(result.value)))
      throw createTypeError(`Mask formatter ${key} must be an integer within the formatted value.`);
  }
}
function handleMask(element, expression, modifiers, context) {
  if (!(isInstanceOf(element, HTMLInputElement) || isInstanceOf(element, HTMLTextAreaElement)))
    throw createTypeError("b-mask can only be used on input and textarea elements.");
  if (getLength(objectKeys(modifiers))) throw createTypeError("b-mask does not support modifiers; use a pattern or formatter function.");
  let formatter;
  let applying = false;
  let composing = false;
  const applyMask = (event) => {
    if (applying || composing || isInstanceOf(event, InputEvent) && event.isComposing) return;
    const current = element.value;
    const start = element.selectionStart;
    const end = element.selectionEnd;
    const direction = element.selectionDirection;
    const result = formatter({
      value: current,
      selectionStart: start,
      selectionEnd: end,
      selectionDirection: direction,
      inputType: isInstanceOf(event, InputEvent) ? event.inputType : void 0
    });
    validateResult(result);
    const value = isString(result) ? result : result.value;
    const clamp = (position) => Math.min(position, getLength(value));
    const mappedStart = isString(result) ? start : result.selectionStart ?? start;
    const mappedEnd = isString(result) ? end : result.selectionEnd ?? end;
    applying = true;
    try {
      if (current !== value) {
        element.value = value;
        element.dispatchEvent(new Event("input", { bubbles: true }));
      }
      if (getOwnerDocument(element).activeElement === element && mappedStart !== null && mappedEnd !== null)
        element.setSelectionRange(clamp(mappedStart), clamp(mappedEnd), direction ?? "none");
    } finally {
      applying = false;
    }
  };
  const compositionStart = () => {
    composing = true;
  };
  const compositionEnd = () => {
    composing = false;
    applyMask();
  };
  addEventListener(element, "input", applyMask, true);
  addEventListener(element, "compositionstart", compositionStart);
  addEventListener(element, "compositionend", compositionEnd);
  onCleanup(() => {
    removeEventListener(element, "input", applyMask, true);
    removeEventListener(element, "compositionstart", compositionStart);
    removeEventListener(element, "compositionend", compositionEnd);
  });
  effect(() => {
    const value = evaluate(expression, context, "b-mask", element);
    if (isString(value)) formatter = patternFormatter(value);
    else if (isFunction(value)) formatter = value;
    else throw createTypeError("b-mask must evaluate to a pattern string or formatter function.");
    applyMask();
  });
}
function handleTeleport(element, expression, modifiers, context) {
  var _a;
  if (getLength(objectKeys(modifiers))) throw createSyntaxError(B_TELEPORT + " does not support modifiers.");
  const owner = getNodeOwner(element);
  if (!owner) throw createError(B_TELEPORT + " requires an owned Brio element.");
  const range = ownElementRange(element, context, owner.runtime);
  const placeholder = getOwnerDocument(element).createComment("brio:" + TELEPORT);
  ownNode(placeholder, owner.context, owner.runtime);
  (_a = getParent(range.start)) == null ? void 0 : _a.insertBefore(placeholder, range.start);
  getNodeOwner(range.start)[TELEPORT] = { source: placeholder, end: range.end };
  let stop;
  let cancelPending;
  onCleanup(() => {
    stop == null ? void 0 : stop();
    cancelPending == null ? void 0 : cancelPending();
    removeElement(range);
    removeElement(placeholder);
  });
  let lastTarget;
  let lastPlacement;
  let missingSelector;
  stop = effect(() => {
    var _a2;
    cancelPending == null ? void 0 : cancelPending();
    cancelPending = void 0;
    const value = evaluate(expression, context, B_TELEPORT, element);
    let target = value;
    let placement = "after";
    if (isArray(value)) {
      if (getLength(value) !== 2) throw createTypeError(B_TELEPORT + " expects a [target, placement] pair.");
      [target, placement] = value;
    }
    if (placement !== "before" && placement !== "after" && placement !== "prepend" && placement !== "append")
      throw createTypeError(B_TELEPORT + " placement must be before, after, prepend, or append.");
    if (isString(target)) {
      const selector = target;
      target = getOwnerDocument(element).querySelector(selector);
      if (!target) {
        if (missingSelector !== selector) console.warn(B_TELEPORT + ` target "${selector}" not found.`);
        missingSelector = selector;
      } else missingSelector = void 0;
    } else missingSelector = void 0;
    if (target !== null && target !== void 0 && !isInstanceOf(target, getOwnerDocument(element).defaultView.Element))
      throw createTypeError(B_TELEPORT + " target must be an Element, selector string, null, or undefined.");
    const resolved = target;
    if (resolved) {
      if (range.nodes(true).some((node) => node === resolved || node.contains(resolved)))
        throw createError(B_TELEPORT + " cannot target its own rendered output.");
      if ((placement === "append" || placement === "prepend") && resolved.localName === TEMPLATE)
        throw createError(B_TELEPORT + " cannot insert children into a native template.");
      const { parent } = portalPosition({ target: resolved, placement });
      if ((_a2 = getNodeOwner(parent)) == null ? void 0 : _a2.controlsChildren)
        throw createError(B_TELEPORT + " cannot insert into a container whose content is controlled by a directive.");
      const targetOwner = getNodeOwner(resolved);
      let pending = getPendingHydration(resolved);
      if (!targetOwner) {
        for (let ancestor = getParent(resolved); ancestor && !pending; ancestor = getParent(ancestor))
          pending = getPendingHydration(ancestor);
      }
      if (pending) {
        const retry = () => stop == null ? void 0 : stop.run();
        pending.add(retry);
        cancelPending = () => {
          deleteItem(pending, retry);
        };
        return;
      }
    }
    if (lastTarget === resolved && lastPlacement === placement) return;
    range.redirect(resolved ? { target: resolved, placement } : void 0, placeholder);
    lastTarget = resolved;
    lastPlacement = placement;
  });
}
function handleTemplate(element, _expression, _modifiers, context, runtime, hydrateNodeFn) {
  ownElementRange(element, context, runtime);
  const isTemplateTag = element.tagName.toLowerCase() === TEMPLATE;
  const fragment = isTemplateTag ? cloneProjectedNode(element.content) : getOwnerDocument(element).createDocumentFragment();
  if (!isTemplateTag) {
    while (element.firstChild) {
      fragment.appendChild(element.firstChild);
    }
  }
  const parent = getParent(element);
  if (!parent) throw createError("b-template requires an element with a parent node.");
  const insertedNodes = arrayFrom(getChildNodes(fragment));
  insertBefore(parent, fragment, element);
  removeElement(element);
  withHydration(parent, () => {
    for (const node of insertedNodes) {
      if (getParent(node) === parent) hydrateNodeFn(node, context, runtime);
    }
  });
}
function observerOptions(element, attrName, modifiers, context) {
  const expression = getAttribute(element, "b-options");
  const mapping = expression === null ? {} : evaluate(expression, context, "b-options", element);
  if (!mapping || !isObjectType(mapping) || isArray(mapping))
    throw createTypeError("b-options must evaluate to an object keyed by directive name.");
  const base = attrName.split(".")[0];
  const result = {};
  for (const name of /* @__PURE__ */ new Set([base, attrName])) {
    const options = objectConstructor.prototype.hasOwnProperty.call(mapping, name) ? ReflectApi.get(mapping, name) : void 0;
    if (options === void 0) continue;
    if (!options || !isObjectType(options) || isArray(options))
      throw createTypeError(`b-options["${name}"] must be an object.`);
    objectConstructor.assign(result, options);
  }
  return objectConstructor.assign(result, modifiers);
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
function handleIntersection(element, attrName, expression, modifiers, context) {
  const isExit = attrName.split(".")[0].endsWith("-exit");
  const options = observerOptions(element, attrName, modifiers, context);
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
          execute(expression, createExpressionScope({ $entry: entry }, context), void 0, attrName, element);
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
  onCleanup(() => {
    clearTimeout(debounceTimer);
    stopped = true;
    observer.disconnect();
  });
  observer.observe(element);
}
function handleMutation(element, attrName, expression, modifiers, context) {
  const baseName = attrName.split(".")[0];
  const isAdded = baseName.endsWith("-addednodes");
  const isRemoved = baseName.endsWith("-removednodes");
  const isAttrs = baseName.endsWith("-attrs");
  const isText = baseName.endsWith("-text");
  const configured = observerOptions(element, attrName, modifiers, context);
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
      matching = mutations.filter((m2) => getLength(m2.addedNodes) > 0);
    } else if (isRemoved) {
      matching = mutations.filter((m2) => getLength(m2.removedNodes) > 0);
    } else if (isAttrs) {
      matching = mutations.filter((m2) => m2.type === ATTRIBUTES);
    } else if (isText) {
      matching = mutations.filter((m2) => m2.type === "characterData");
    } else {
      matching = mutations;
    }
    if (getLength(matching)) {
      const invoke = () => {
        const records = pending;
        pending = [];
        execute(expression, createExpressionScope({ $mutations: records }, context), void 0, attrName, element);
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
  onCleanup(() => {
    clearTimeout(debounceTimer);
    observer.disconnect();
    pending = [];
  });
  observer.observe(target, options);
}
function handleResize(element, attrName, expression, modifiers, context) {
  const options = observerOptions(element, attrName, modifiers, context);
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
      execute(expression, createExpressionScope({ $size: size, $entry: entry }, context), void 0, attrName, element);
    };
    if (delay !== void 0) {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(invoke, delay);
    } else {
      invoke();
    }
  });
  onCleanup(() => {
    clearTimeout(debounceTimer);
    observer.disconnect();
  });
  observer.observe(target, { box });
}
function handleEffect(element, expression, _modifiers, context) {
  effect(() => {
    evaluate(expression, context, "b-effect", element);
  });
}
function handleScript(element, _expression, _modifiers, context) {
  if (element.tagName.toLowerCase() !== "script")
    throw createTypeError("b-script can only be used on script elements.");
  const raw = (element.textContent || "").trim();
  if (!raw) throw createSyntaxError("b-script requires a function expression.");
  const $context = createExpressionScope({ onCleanup }, context);
  try {
    const result = evaluateFunction(raw, $context, element)($context);
    if (isInstanceOf(result, Promise))
      return result.then(() => {
      }, (error) => {
        throw directiveError("Brio b-script execution failed", error, "b-script", element);
      });
  } catch (error) {
    throw directiveError("Brio b-script execution failed", error, "b-script", element);
  }
}
function mountRouterOutlet(element, context, runtime, hydrateNodeFn) {
  if (!runtime.router) throw createError("b-router-outlet requires a router on the Brio app.");
  const router = runtime.router;
  let childScope;
  let childElement;
  let mountedKey;
  const clear = () => {
    try {
      childScope == null ? void 0 : childScope.dispose();
    } finally {
      removeElement(childElement);
      childScope = childElement = mountedKey = void 0;
    }
  };
  onCleanup(clear);
  effect(() => {
    const route = router.current.value;
    const key = route && `${route.component} ${route.path}`;
    if (key === mountedKey) return;
    clear();
    if (!(route == null ? void 0 : route.component)) return;
    const definition = runtime.components.get(route.component);
    if (!definition) throw createError(`No component registered for route "${route.component}".`);
    const el = getOwnerDocument(element).createElement(route.component);
    childElement = el;
    childScope = createScope();
    mountedKey = key;
    element.append(el);
    untrack(() => childScope.run(() => mountComponent(el, definition, context, runtime, hydrateNodeFn)));
  });
}
const inserts = /* @__PURE__ */ new WeakMap();
const getInsert = (runtime) => {
  let insert = inserts.get(runtime);
  if (!insert) inserts.set(runtime, insert = createInsert(runtime));
  return insert;
};
const componentNamePattern$1 = /^[a-z][a-z0-9]*-[a-z0-9-]+$/;
const conditionalNames = /* @__PURE__ */ new Set(["b-if", "b-else-if", "b-else"]);
const childControllingNames = /* @__PURE__ */ new Set(["b-text", "text", "b-html", "html", "b-router-outlet"]);
const transitionNames = /* @__PURE__ */ new Set(["b-transition", "transition"]);
const fragmentNames = /* @__PURE__ */ new Set(["b-template", "b-teleport", "teleport", "b-effect", "effect"]);
const elementAliases = /* @__PURE__ */ new Set(["text", "html", "model", "mask", "transition"]);
function hydrateChildren(element, context, runtime) {
  withHydration(element, () => {
    for (const child of snapshotList(getChildNodes(element))) {
      if (getParent(child) === element && !getNodeOwner(child)) hydrateNode(child, context, runtime);
    }
  });
}
function hydrateTextNode(node, context) {
  const raw = node.nodeValue ?? "";
  if (!raw.includes("${")) return;
  let last;
  effect(() => {
    const text = interpolateText(raw, context);
    if (text !== last) node.nodeValue = last = text;
  });
}
function hydrateNode(node, parentContext, runtime) {
  if (getNodeOwner(node)) throw createError("Cannot hydrate an already hydrated Brio node.");
  const type = getNodeType(node);
  if (type !== Node.ELEMENT_NODE && (type !== Node.TEXT_NODE || !(node.nodeValue ?? "").includes("${"))) return;
  parentContext = takeProjectedContext(node) ?? parentContext;
  if (!("$ref" in parentContext)) parentContext = createExpressionScope({ $ref: createRefs() }, parentContext);
  const scope = createScope();
  setScopeNode(scope, node);
  try {
    withHydration(node, () => scope.run(() => {
      ownNode(node, parentContext, runtime);
      hydrateOwnedNode(node, parentContext, runtime);
    }));
  } catch (error) {
    throw locate(error, node);
  }
}
function elementContext(element, parentContext, runtime) {
  const own = { $el: element };
  if (!parentContext.$stores) own.$stores = emptyContextValues;
  if (!parentContext.$provided) own.$provided = emptyContextValues;
  if (runtime.root) {
    const insert = getInsert(runtime);
    if (parentContext.$insert !== insert) own.$insert = insert;
  }
  return createExpressionScope(own, parentContext);
}
function hydrateOwnedNode(node, parentContext, runtime) {
  if (getNodeType(node) === Node.TEXT_NODE) {
    hydrateTextNode(node, parentContext);
    return;
  }
  if (getNodeType(node) !== Node.ELEMENT_NODE) return;
  const element = node;
  if (!getLength(element[ATTRIBUTES]) && !element.localName.includes("-") && element.localName !== "script") {
    const context2 = elementContext(element, parentContext, runtime);
    getNodeOwner(element).context = context2;
    hydrateChildren(element, context2, runtime);
    return;
  }
  removeAttribute(element, "b-cloak");
  if (element.hasAttribute("b-ignore") || element.hasAttribute("ignore")) {
    getNodeOwner(element).controlsChildren = true;
    return;
  }
  const attributes = snapshotList(element[ATTRIBUTES]);
  const parsed = attributes.map((attribute) => extractModifiers(attribute.name));
  const conditionalAttributes = attributes.filter((_, index) => conditionalNames.has(parsed[index].baseName));
  if (getLength(conditionalAttributes) > 1)
    throw createSyntaxError("An element can have only one conditional directive.");
  const ifAttr = conditionalAttributes[0];
  if (ifAttr && extractModifiers(ifAttr.name).baseName === "b-if") {
    handleIf(element, ifAttr.value, extractModifiers(ifAttr.name).modifiers, parentContext, runtime, hydrateNode);
    return;
  }
  if (ifAttr)
    throw createSyntaxError("b-else-if and b-else require an adjacent preceding b-if branch.");
  const fragmentTemplate = isFragmentTemplate(element);
  let context = elementContext(element, parentContext, runtime);
  const dataAttr = getAttribute(element, "b-data");
  if (dataAttr !== null) {
    context = handleData(element, dataAttr, {}, context);
    context = createExpressionScope({ $ref: createRefs() }, context);
    removeAttribute(element, "b-data");
  }
  getNodeOwner(element).context = context;
  const forAttr = getAttribute(element, "b-for");
  if (forAttr !== null) {
    const { modifiers } = extractModifiers("b-for");
    handleFor(element, forAttr, modifiers, context, runtime, hydrateNode);
    return;
  }
  const idAttr = getAttribute(element, "b-id");
  if (idAttr !== null) {
    context = handleId(element, idAttr, {}, context);
    removeAttribute(element, "b-id");
    getNodeOwner(element).context = context;
  }
  const provideAttr = getAttribute(element, "b-provide");
  if (provideAttr !== null) {
    context = handleProvide(provideAttr, context);
    removeAttribute(element, "b-provide");
    getNodeOwner(element).context = context;
  }
  const templateAttr = getAttribute(element, "b-template");
  if (parsed.some(({ baseName }) => childControllingNames.has(baseName)))
    getNodeOwner(element).controlsChildren = true;
  const refAttributes = attributes.filter((attribute, index) => parsed[index].baseName === "b-ref" || startsWith(attribute.name, "b-ref-"));
  if (getLength(refAttributes)) {
    if (getLength(refAttributes) !== 1 || refAttributes[0].name !== "b-ref")
      throw createSyntaxError("b-ref does not support arguments or modifiers.");
    const name = refAttributes[0].value.trim();
    if (!name) throw createSyntaxError("b-ref requires a nonempty literal name.");
    if (templateAttr !== null || element.tagName.toLowerCase() === TEMPLATE)
      throw createTypeError("b-ref requires a concrete element, not a template wrapper.");
    registerRef(context.$ref, name, element);
    removeAttribute(element, "b-ref");
  }
  if (templateAttr !== null || fragmentTemplate) {
    for (const attribute of arrayFrom(element[ATTRIBUTES])) {
      const { baseName } = extractModifiers(attribute.name);
      if (fragmentNames.has(baseName)) continue;
      if (startsWith(baseName, "b-") || elementAliases.has(baseName) || startsWith(baseName, "bind-") || startsWith(baseName, "on-"))
        throw createSyntaxError(`${baseName} needs a concrete element, but ${templateAttr !== null ? "b-template" : "<template>"} renders its contents in place without one. Put it on an element inside.`);
    }
    handleTemplate(element, templateAttr ?? "", {}, context, runtime, hydrateNode);
    for (const attribute of arrayFrom(element[ATTRIBUTES])) {
      const { baseName, modifiers } = extractModifiers(attribute.name);
      if (baseName === B_TELEPORT || baseName === TELEPORT)
        handleTeleport(element, attribute.value, modifiers, context);
      else if (baseName === "b-effect" || baseName === "effect")
        handleEffect(element, attribute.value, modifiers, context);
    }
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
  const afterChildren = [];
  const transitionAttr = attributes.find((_, index) => transitionNames.has(parsed[index].baseName));
  if (transitionAttr) prepareTransition(element, transitionAttr.value);
  for (let index = 0; index < attributes.length; index++) {
    const attribute = attributes[index];
    const attrName = attribute.name;
    const attrValue = attribute.value;
    const { baseName, modifiers } = parsed[index];
    if (startsWith(baseName, "b-on-") || startsWith(baseName, "on-")) {
      if (baseName.includes("-enter") || baseName.includes("-exit")) {
        handleIntersection(element, attrName, attrValue, modifiers, context);
      } else if (baseName.includes("-addednodes") || baseName.includes("-removednodes") || baseName.includes("-attrs") || baseName.includes("-text")) {
        handleMutation(element, attrName, attrValue, modifiers, context);
      } else if (baseName.includes("-resize")) {
        handleResize(element, attrName, attrValue, modifiers, context);
      } else {
        handleOn(element, baseName, attrValue, modifiers, context);
      }
      removeAttribute(element, attrName);
    } else if (startsWith(baseName, "b-bind-") || startsWith(baseName, "bind-")) {
      const start = handleBind(element, baseName, attrValue, modifiers, context);
      if (start) afterChildren.push(start);
      removeAttribute(element, attrName);
    } else if (baseName === "b-model" || baseName === "model") {
      const start = handleModel(element, attrValue, modifiers, context);
      if (start) afterChildren.push(start);
      removeAttribute(element, attrName);
    } else if (baseName === "b-text" || baseName === "text") {
      getNodeOwner(element).controlsChildren = true;
      handleText(element, attrValue, context);
      removeAttribute(element, attrName);
      hasText = true;
    } else if (baseName === "b-html" || baseName === "html") {
      getNodeOwner(element).controlsChildren = true;
      handleHtml(element, attrValue, modifiers, context, runtime, hydrateChildren);
      removeAttribute(element, attrName);
      hasHtml = true;
    } else if (baseName === "b-mask" || baseName === "mask") {
      handleMask(element, attrValue, modifiers, context);
      removeAttribute(element, attrName);
    } else if (baseName === B_TELEPORT || baseName === TELEPORT) {
      handleTeleport(element, attrValue, modifiers, context);
      removeAttribute(element, attrName);
    } else if (baseName === "b-transition" || baseName === "transition") {
      handleTransition(element, attrValue);
      removeAttribute(element, attrName);
    } else if (baseName === "b-effect" || baseName === "effect") {
      handleEffect(element, attrValue, modifiers, context);
      removeAttribute(element, attrName);
    } else if (baseName === "b-script") {
      handleScript(element, attrValue, modifiers, context);
      removeAttribute(element, attrName);
    } else if (baseName === "b-router-outlet") {
      getNodeOwner(element).controlsChildren = true;
      mountRouterOutlet(element, context, runtime, hydrateNode);
      removeAttribute(element, attrName);
      return;
    }
  }
  if (!hasText && !hasHtml && tagName !== "script") {
    hydrateChildren(element, context, runtime);
  }
  afterChildren.forEach((start) => start());
}
function hydrateRoot(root, context, runtime) {
  hydrateNode(root, context, runtime);
}
const componentNamePattern = /^[a-z][a-z0-9]*-[a-z0-9-]+$/;
const activeMountRoots = /* @__PURE__ */ new Set();
function createApp(options = {}) {
  var _a;
  const appState = state(((_a = options.state) == null ? void 0 : _a.call(options)) ?? {});
  const stores = objectConstructor.freeze(copyContextValues(
    options.stores === void 0 ? {} : options.stores,
    "Brio stores"
  ));
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
    get stores() {
      return stores;
    },
    components,
    router: options.router,
    get roots() {
      return roots;
    },
    component(name, definition) {
      if (disposed) throw createError("Cannot register a component on a disposed Brio app.");
      const normalized = name.toLowerCase();
      if (!componentNamePattern.test(normalized))
        throw createTypeError(`Component name "${name}" must be a custom-element name such as "user-card".`);
      if (components.has(normalized))
        throw createError(`Component "${normalized}" is already registered.`);
      const template = definition.template;
      if (isString(template) ? !template.trim() : (template == null ? void 0 : template.localName) !== "template")
        throw createTypeError(`Component "${normalized}" requires a non-empty template string, "#id" selector, or <template> element.`);
      for (const [prop, type] of objectEntries(definition.props ?? {}))
        if (!includesItem([Boolean, Number, String], type))
          throw createTypeError(`Component "${normalized}" prop "${prop}" must be declared as Boolean, Number, or String.`);
      components.set(normalized, definition);
      return app;
    },
    plugin(plugin) {
      if (disposed) throw createError("Cannot install a plugin on a disposed Brio app.");
      if (plugins.has(plugin)) return app;
      plugins.add(plugin);
      const scope = createScope(appScope);
      try {
        scope.run(() => plugin(app));
      } catch (error) {
        deleteItem(plugins, plugin);
        try {
          scope.dispose();
        } catch (cleanupError) {
          throw combinedError("Brio plugin installation and cleanup both failed.", [error, cleanupError]);
        }
        throw error;
      }
      return app;
    },
    insert(target, placement, content, insertOptions) {
      if (disposed) throw createError("Cannot insert into a disposed Brio app.");
      const matches = [...roots].filter((handle) => {
        var _a2;
        return isString(target) ? handle.root.matches(target) || Boolean(handle.root.querySelector(target)) : isInstanceOf(target, Node) && (handle.root.contains(target) || ((_a2 = getNodeOwner(target)) == null ? void 0 : _a2.runtime.root) === handle.root);
      });
      if (getLength(matches) !== 1)
        throw createError("Brio insert target must belong to exactly one mounted root of this app.");
      const owner = getNodeOwner(matches[0].root);
      if (!owner) throw createError("Brio insert requires an active mounted Brio root.");
      return createInsert(owner.runtime)(target, placement, content, insertOptions);
    },
    mount(target) {
      var _a2;
      if (disposed) throw createError("Cannot mount a disposed Brio app.");
      const root = isString(target) ? document.querySelector(target) : target;
      if (!isInstanceOf(root, Element))
        throw createTypeError(`Brio mount target "${String(target)}" did not resolve to an element.`);
      if ([...activeMountRoots].some((mounted) => mounted.contains(root) || root.contains(mounted)))
        throw createError("Brio mount roots cannot be equal or nested; use one app root with child components.");
      if (arrayFrom(root[ATTRIBUTES]).some((attribute) => includesItem(["b-if", "b-for", "b-template"], attribute.name.split(".")[0])))
        throw createError("b-if, b-for and b-template require a container root; wrap the structural directive in another element.");
      const originalAttributes = arrayFrom(root[ATTRIBUTES]).map((attribute) => [attribute.name, attribute.value]);
      const originalChildren = arrayFrom(getChildNodes(root), (child) => child.cloneNode(true));
      const scope = createScope(appScope);
      let unmounted = false;
      const handle = {
        root,
        get unmounted() {
          return unmounted;
        },
        unmount(options2 = {}) {
          if (unmounted) return;
          unmounted = true;
          try {
            scope.dispose();
          } finally {
            deleteItem(roots, handle);
            deleteItem(activeMountRoots, root);
            notifyRootUnmounted(app, root);
            if (options2.restore !== false) {
              for (const attribute of arrayFrom(root.attributes))
                removeAttribute(root, attribute.name);
              for (const [name, value] of originalAttributes)
                root.setAttribute(name, value);
              root.replaceChildren(...originalChildren.map((child) => child.cloneNode(true)));
            }
          }
        }
      };
      roots.add(handle);
      activeMountRoots.add(root);
      notifyRootMounted(app, root);
      const context = createExpressionScope(
        { $data: createScopedState(appState), $stores: stores, $provided: emptyContextValues, $ref: createRefs(), $route: (_a2 = options.router) == null ? void 0 : _a2.route, trustedHTML, flush }
      );
      try {
        scope.run(() => {
          if (options.router) {
            const stopRouter = options.router.start(root);
            onCleanup(stopRouter);
          }
          hydrateRoot(root, context, { ...runtime, root });
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
    unmount(options2) {
      const errors = [];
      for (const root of [...roots]) {
        try {
          root.unmount(options2);
        } catch (error) {
          errors.push(error);
        }
      }
      if (getLength(errors)) throw combinedError("One or more Brio app roots failed to unmount.", errors);
    },
    dispose(options2) {
      if (disposed) return;
      let failure;
      try {
        app.unmount(options2);
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
    for (const [name, definition] of objectEntries(options.components ?? {}))
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
    for (let i2 = 0; i2 < getLength(queue); i2++) {
      queue[i2]();
    }
  } finally {
    isFlushing = false;
    if (getLength(scheduledQueue)) {
      queueMicrotask(flushQueue);
    }
  }
}
export {
  HttpError,
  z as addDisposer,
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
  f as describeNode,
  d as devtools,
  a as devtoolsPanel,
  directiveError,
  effect,
  e as enableDevtools,
  errorText,
  evaluate,
  evaluateFunction,
  execute,
  flush,
  getCurrentScope,
  E as getScopeNode,
  http,
  hydrateNode,
  hydrateRoot,
  i as inspectDevtools,
  locate,
  m as mark,
  moneyMask,
  onCleanup,
  onDispose,
  persist,
  queueTask,
  A as removeDisposer,
  resource,
  B as runUnscoped,
  D as setActiveScope,
  C as setEffectFrame,
  setScopeNode,
  b as signal,
  state,
  trustedHTML,
  untrack,
  validate
};
//# sourceMappingURL=index.js.map
