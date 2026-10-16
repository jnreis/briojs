import { c as causedError, o as onDispose, a as combinedError, d as getCurrentScope, e as effect, f as onCleanup, b as batch, h as createScope, n as notifyRootMounted, j as notifyAppDisposed, k as notifyAppCreated, l as notifyRootUnmounted } from "./effect-DGhE0oQi.js";
import { s } from "./effect-DGhE0oQi.js";
import { s as state, t as trigger, a as track } from "./state-CLBlAcxj.js";
import { b } from "./state-CLBlAcxj.js";
import { computed, resource } from "./reactivity.js";
import { createRouter } from "./router-entry.js";
import { persist } from "./persistence-entry.js";
import { d, a, e, i } from "./devtools-CF9uSawU.js";
const valueExpressions = /* @__PURE__ */ new Map();
const statementExpressions = /* @__PURE__ */ new Map();
const assignmentExpressions = /* @__PURE__ */ new Map();
const functionExpressions = /* @__PURE__ */ new Map();
const $CONTEXT = "$context";
const contextBindings = `
"use strict";
const { $data, $el, $event, $id, $ref, $for, $mutations, $size, $entry, $props, $emit, $insert, $stores, $provided, trustedHTML, onCleanup, money } = ${$CONTEXT};
`;
function evaluateFunction(source, context) {
  const fn = compile(
    functionExpressions,
    source,
    (expression) => new Function($CONTEXT, `${contextBindings} return (${expression.replace(/;\s*$/, "")});`)
  );
  const result = fn(context);
  if (typeof result !== "function")
    throw new TypeError(`b-script must contain a function expression, such as (${$CONTEXT}) => { ... }.`);
  return result;
}
function createExpressionScope(...sources2) {
  return Object.assign(/* @__PURE__ */ Object.create(null), ...sources2.reverse());
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
    (expression) => new Function($CONTEXT, `${contextBindings} return (${expression});`)
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
    (expression) => new Function($CONTEXT, `${contextBindings} ${expression}`)
  );
  try {
    fn(event === void 0 ? scope : createExpressionScope({ $event: event }, scope));
  } catch (error) {
    throw causedError(`Brio event expression failed: "${source}"`, error);
  }
}
function assign(source, scope, value) {
  const fn = compile(
    assignmentExpressions,
    source,
    (expression) => new Function($CONTEXT, "$value", `${contextBindings} return (${expression} = $value);`)
  );
  try {
    fn(scope, value);
  } catch (error) {
    throw causedError(`Brio model expression failed: "${source}"`, error);
  }
}
const sources = /* @__PURE__ */ new WeakMap();
function createScopedState(source, parent) {
  const observed = state(sources.get(source) ?? source);
  if (Reflect.has(observed, "$parent"))
    throw new TypeError("$parent is reserved for Brio scope ancestry.");
  const readOnly = () => {
    throw new TypeError("Brio scope $parent is read-only.");
  };
  const view = new Proxy(observed, {
    get(target, key, receiver) {
      return key === "$parent" ? parent : Reflect.get(target, key, receiver);
    },
    has(target, key) {
      return key === "$parent" || Reflect.has(target, key);
    },
    set(target, key, value, receiver) {
      if (key === "$parent") return readOnly();
      return Reflect.set(target, key, value, receiver);
    },
    deleteProperty(target, key) {
      if (key === "$parent") return readOnly();
      return Reflect.deleteProperty(target, key);
    },
    defineProperty(target, key, descriptor) {
      if (key === "$parent") return readOnly();
      return Reflect.defineProperty(target, key, descriptor);
    }
  });
  sources.set(view, observed);
  return view;
}
const owners = /* @__PURE__ */ new WeakMap();
const pendingHydration = /* @__PURE__ */ new WeakMap();
const getPendingHydration = (node) => pendingHydration.get(node);
function withHydration(node, hydrate) {
  if (pendingHydration.has(node)) {
    hydrate();
    return;
  }
  const callbacks = /* @__PURE__ */ new Set();
  pendingHydration.set(node, callbacks);
  try {
    hydrate();
  } finally {
    pendingHydration.delete(node);
  }
  callbacks.forEach((callback) => callback());
}
function getNodeOwner(node) {
  return owners.get(node);
}
function ownNode(node, context, runtime) {
  const scope = getCurrentScope();
  if (!scope) throw new Error("DOM hydration requires an active Brio scope.");
  const owner = { context, runtime, scope };
  owners.set(node, owner);
  onDispose(scope, () => {
    if (owners.get(node) === owner) owners.delete(node);
  });
  return owner;
}
function disposeNodes(nodes) {
  const scopes = /* @__PURE__ */ new Set();
  const selected = (node) => nodes.some((root) => root === node || root.contains(node));
  const visit = (node) => {
    const owner = owners.get(node);
    if (owner) scopes.add(owner.scope);
    visitChildren(Array.from(node.childNodes));
  };
  const visitChildren = (children) => {
    var _a;
    for (let index = 0; index < children.length; index++) {
      const child = children[index];
      const portal = (_a = owners.get(child)) == null ? void 0 : _a.teleport;
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
  if (errors.length) throw combinedError("Brio DOM content cleanup failed.", errors);
}
function copyContextValues(value, label) {
  if (value === null || typeof value !== "object" || ![Object.prototype, null].includes(Object.getPrototypeOf(value)))
    throw new TypeError(`${label} must be a synchronous plain object.`);
  const result = /* @__PURE__ */ Object.create(null);
  for (const key of Object.keys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!("value" in descriptor))
      throw new TypeError(`${label} must contain data properties, not accessors.`);
    result[key] = Reflect.get(value, key);
  }
  return result;
}
const emptyContextValues = Object.freeze(/* @__PURE__ */ Object.create(null));
function createProvidedValues(getValues, parent = emptyContextValues) {
  let values = /* @__PURE__ */ Object.create(null);
  const holder = {};
  effect(() => {
    values = copyContextValues(getValues(), "b-provide");
    trigger(holder, "values", "set");
  });
  const readOnly = () => {
    throw new TypeError("$provided names are read-only.");
  };
  const hasOwn = (key) => Object.prototype.hasOwnProperty.call(values, key);
  return new Proxy(/* @__PURE__ */ Object.create(null), {
    get(_target, key) {
      track(holder, "values");
      return hasOwn(key) ? Reflect.get(values, key) : Reflect.get(parent, key);
    },
    has(_target, key) {
      track(holder, "values");
      return hasOwn(key) || Reflect.has(parent, key);
    },
    ownKeys() {
      track(holder, "values");
      return [.../* @__PURE__ */ new Set([...Reflect.ownKeys(parent), ...Reflect.ownKeys(values)])];
    },
    getOwnPropertyDescriptor(_target, key) {
      track(holder, "values");
      if (!hasOwn(key) && !Object.prototype.hasOwnProperty.call(parent, key)) return;
      return {
        configurable: true,
        enumerable: true,
        writable: false,
        value: hasOwn(key) ? Reflect.get(values, key) : Reflect.get(parent, key)
      };
    },
    set: readOnly,
    deleteProperty: readOnly,
    defineProperty: readOnly,
    setPrototypeOf: readOnly,
    preventExtensions: readOnly
  });
}
const registries = /* @__PURE__ */ new WeakMap();
const keys = Symbol("brio.refs");
function createRefs() {
  const values = /* @__PURE__ */ Object.create(null);
  const readOnly = () => {
    throw new TypeError("$ref names are read-only.");
  };
  const refs = new Proxy(values, {
    get(target, key) {
      track(target, key);
      return Reflect.get(target, key);
    },
    has(target, key) {
      track(target, key);
      return Reflect.has(target, key);
    },
    ownKeys(target) {
      track(target, keys);
      return Reflect.ownKeys(target);
    },
    getOwnPropertyDescriptor(target, key) {
      track(target, key);
      const descriptor = Reflect.getOwnPropertyDescriptor(target, key);
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
function registerRef(refs, name, element) {
  const values = registries.get(refs);
  if (!values) throw new TypeError("b-ref requires a Brio ref registry.");
  if (Object.prototype.hasOwnProperty.call(values, name))
    throw new SyntaxError(`Duplicate b-ref name "${name}" in the same scope.`);
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
const projectedContexts = /* @__PURE__ */ new WeakMap();
function takeProjectedContext(node) {
  const context = projectedContexts.get(node);
  projectedContexts.delete(node);
  return context;
}
function cloneProjectedNode(node) {
  const clone = node.cloneNode(true);
  const copy = (source, target) => {
    const context = projectedContexts.get(source);
    if (context) projectedContexts.set(target, context);
    const children = Array.from(target.childNodes);
    Array.from(source.childNodes).forEach((child, index) => copy(child, children[index]));
    if (source instanceof HTMLTemplateElement && target instanceof HTMLTemplateElement)
      copy(source.content, target.content);
  };
  copy(node, clone);
  return clone;
}
function findSlots(root) {
  return Array.from(root.querySelectorAll("slot, template[b-template]")).flatMap((node) => node instanceof HTMLTemplateElement ? findSlots(node.content) : [node]);
}
function fillSlots(host, template, context) {
  var _a;
  const slots = /* @__PURE__ */ new Map();
  for (const child of Array.from(host.childNodes)) {
    const name = child instanceof Element ? child.getAttribute("slot") ?? "" : "";
    const content = slots.get(name) ?? [];
    content.push(child);
    slots.set(name, content);
  }
  for (const outlet of findSlots(template)) {
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
  const $props = state(propsObject);
  const $ref = createRefs();
  const componentScope = createScope();
  onCleanup(() => componentScope.dispose());
  const $emit = (name, detail) => {
    if (!/^[a-z][a-z0-9-]*$/.test(name))
      throw new TypeError(`Invalid component event name "${name}".`);
    element.dispatchEvent(new CustomEvent(name, { detail, bubbles: true }));
  };
  componentScope.run(() => {
    var _a;
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
      $props[binding.name] = evaluate(binding.expression, context);
    const setupResult = ((_a = definition.setup) == null ? void 0 : _a.call(definition, {
      el: element,
      $props,
      $emit,
      app: runtime.app,
      $stores: context.$stores ?? emptyContextValues,
      $provided: context.$provided ?? emptyContextValues,
      $ref
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
    for (const binding of propBindings) {
      effect(() => {
        $props[binding.name] = evaluate(binding.expression, context);
      });
    }
    const template = document.createElement("template");
    template.innerHTML = definition.template;
    fillSlots(element, template.content, context);
    element.replaceChildren(template.content);
    withHydration(element, () => {
      for (const child of Array.from(element.childNodes)) {
        hydrateNodeFn(child, componentContext, runtime);
      }
    });
    for (const attribute of Array.from(element.attributes)) {
      if (attribute.name.startsWith("b-")) element.removeAttribute(attribute.name);
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
  const style = element.ownerDocument.defaultView.getComputedStyle(element);
  const milliseconds = (value) => parseFloat(value) * (value.trim().endsWith("ms") ? 1 : 1e3);
  const durations = style.transitionDuration.split(",").map(milliseconds);
  const delays = style.transitionDelay.split(",").map(milliseconds);
  return Math.max(0, ...style.transitionProperty.split(",").map(
    (property, index) => property.trim() === "none" ? 0 : durations[index % durations.length] + delays[index % delays.length]
  ));
}
function runTransition(element, name, phase, onDone) {
  const interrupted = running.has(element);
  cancelTransition(element);
  const view = element.ownerDocument.defaultView;
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
    element.removeEventListener("transitionrun", onRun);
    element.removeEventListener("transitionend", onEnd);
    element.removeEventListener("transitioncancel", onEnd);
    element.classList.remove(...classes);
    if (running.get(element) === cleanup) running.delete(element);
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
    pending.delete(transition.propertyName);
    if (started && pending.size === 0) {
      view.cancelAnimationFrame(completionFrame);
      completionFrame = view.requestAnimationFrame(() => {
        if (pending.size === 0) finish();
      });
    }
  };
  running.set(element, cleanup);
  element.addEventListener("transitionrun", onRun);
  element.addEventListener("transitionend", onEnd);
  element.addEventListener("transitioncancel", onEnd);
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
    names.delete(element);
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
  return value !== null && typeof value === "object" && trustedMarkup in value;
}
function getTrustedHTMLString(value) {
  return value[trustedMarkup];
}
function portalPosition({ target, placement }) {
  const sibling = placement === "before" || placement === "after";
  const parent = sibling ? target.parentNode : target;
  if (!parent || parent.nodeType !== Node.ELEMENT_NODE && parent.nodeType !== Node.DOCUMENT_FRAGMENT_NODE)
    throw new Error("b-teleport placement requires an element or fragment container.");
  return {
    parent,
    reference: placement === "before" ? target : placement === "after" ? target.nextSibling : placement === "prepend" ? target.firstChild : null
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
    portal.start.parentNode.insertBefore(home, portal.start);
    homes.set(portal, home);
    portal.detach();
  };
  const nodes = (includeAnchors = false) => {
    const result = [];
    if (start.parentNode && start.parentNode === end.parentNode) {
      let current = includeAnchors ? start : start.nextSibling;
      while (current && current !== end) {
        result.push(current);
        current = current.nextSibling;
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
      const resuming = detached && parent.nodeType !== Node.DOCUMENT_FRAGMENT_NODE;
      if (resuming && pendingRedirect && source) {
        if (destination) ({ parent, reference } = portalPosition(destination));
        else if (source.parentNode) {
          parent = source.parentNode;
          reference = source.nextSibling;
        }
      } else if (resuming && resume && (!resume.reference || resume.reference.parentNode === resume.parent)) {
        ({ parent, reference } = resume);
      }
      if (reference === start && parent === start.parentNode) return;
      if (start.parentNode !== parent || end.nextSibling !== reference) {
        const contents = nodes(true);
        if (reference && contents.includes(reference))
          throw new Error("Cannot move a Brio range inside itself.");
        for (const node of contents) parent.insertBefore(node, reference);
      }
      if (resuming) {
        detached = false;
        pendingRedirect = false;
        resume = void 0;
        for (const [portal, home] of homes) {
          if (home.parentNode) portal.moveBefore(home.parentNode, home);
          home.remove();
        }
        homes.clear();
      }
    },
    detach() {
      if (!detached) {
        if (source && destination && start.parentNode)
          resume = { parent: start.parentNode, reference: end.nextSibling };
        detached = true;
        portals.forEach(detachPortal);
      }
      this.moveBefore(document2.createDocumentFragment(), null);
    },
    remove() {
      var _a;
      resume = void 0;
      portals.forEach((portal) => portal.remove());
      homes.forEach((home) => home.remove());
      homes.clear();
      for (const node of nodes(true)) (_a = node.parentNode) == null ? void 0 : _a.removeChild(node);
    },
    addPortal(portal) {
      portals.add(portal);
      if (detached) detachPortal(portal);
    },
    removePortal(portal) {
      var _a;
      portals.delete(portal);
      (_a = homes.get(portal)) == null ? void 0 : _a.remove();
      homes.delete(portal);
      portal.remove();
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
        } else if (source.parentNode) this.moveBefore(source.parentNode, source.nextSibling);
      }
    },
    onRedirect(callback) {
      redirected = callback;
    }
  };
}
const outputs = /* @__PURE__ */ new WeakMap();
function ownElementRange(element, context, runtime) {
  const existing = outputs.get(element);
  if (existing) return existing;
  const parent = element.parentNode;
  if (!parent) throw new Error("Brio rendered output requires an element with a parent node.");
  const range = createDomRange(element.ownerDocument, "range");
  parent.insertBefore(range.start, element);
  parent.insertBefore(range.end, element.nextSibling);
  outputs.set(element, range);
  ownNode(range.start, context, runtime);
  ownNode(range.end, context, runtime);
  onCleanup(() => {
    outputs.delete(element);
    range.remove();
  });
  return range;
}
const placements = /* @__PURE__ */ new Set(["before", "after", "prepend", "append", "replaceWith", "replaceChildren", "textContent"]);
function createInsert(runtime) {
  return (target, placement, content, options = {}) => {
    var _a, _b;
    const root = runtime.root;
    if (!root || ((_a = getNodeOwner(root)) == null ? void 0 : _a.runtime) !== runtime)
      throw new Error("$insert requires an active mounted Brio root.");
    const node = typeof target === "string" ? root.matches(target) ? root : root.querySelector(target) : target;
    if (!(node instanceof Node) || !root.contains(node) && ((_b = getNodeOwner(node)) == null ? void 0 : _b.runtime.root) !== root)
      throw new TypeError("$insert target must resolve to a node inside this app root.");
    const targetOwner = getNodeOwner(node);
    if (targetOwner && targetOwner.runtime.app !== runtime.app)
      throw new Error("$insert cannot target content owned by another Brio app.");
    if (!options || typeof options !== "object" || Array.isArray(options))
      throw new TypeError("$insert options must be an object.");
    if (!placements.has(placement))
      throw new TypeError(`Invalid $insert placement "${placement}".`);
    const siblingPlacement = placement === "before" || placement === "after" || placement === "replaceWith";
    if (siblingPlacement && node === root)
      throw new Error("$insert cannot insert beside or replace a mount root.");
    if (placement === "replaceWith" && (targetOwner == null ? void 0 : targetOwner.structuralRoot))
      throw new Error("$insert cannot replace a root managed by b-if or b-for; replace its enclosing container instead.");
    const container = siblingPlacement ? node.parentNode : node;
    if (!(container instanceof Element))
      throw new TypeError("This $insert placement requires an element container.");
    const containerOwner = getNodeOwner(container);
    if (!containerOwner || containerOwner.runtime.app !== runtime.app || containerOwner.scope.disposed)
      throw new Error("$insert destination has no active context owned by this app.");
    if (containerOwner.controlsChildren)
      throw new Error("$insert cannot modify a container whose content is controlled by a directive.");
    if (typeof content !== "string" && !(content instanceof Node))
      throw new TypeError("$insert content must be an HTML string or a node to clone.");
    const document2 = container.ownerDocument;
    const fragment = document2.createDocumentFragment();
    if (placement === "textContent") {
      fragment.append(document2.createTextNode(typeof content === "string" ? content : content.textContent ?? ""));
    } else if (typeof content === "string") {
      const template = document2.createElement("template");
      template.innerHTML = getTrustedHTMLString(trustedHTML(content));
      fragment.append(template.content);
    } else {
      const supportedTypes = [Node.ELEMENT_NODE, Node.TEXT_NODE, Node.COMMENT_NODE, Node.DOCUMENT_FRAGMENT_NODE];
      if (!supportedTypes.includes(content.nodeType))
        throw new TypeError("$insert can clone elements, text, comments, or document fragments.");
      fragment.append(document2.importNode(content, true));
    }
    const context = options.data === void 0 ? containerOwner.context : createExpressionScope({
      $data: createScopedState(options.data, containerOwner.context.$data)
    }, containerOwner.context);
    const previous = placement === "replaceWith" ? [node] : placement === "replaceChildren" || placement === "textContent" ? Array.from(container.childNodes) : [];
    const reference = placement === "before" ? node : placement === "after" || placement === "replaceWith" ? node.nextSibling : placement === "prepend" ? container.firstChild : null;
    disposeNodes(previous);
    const range = createDomRange(document2, "insert");
    const { start, end } = range;
    const children = Array.from(fragment.childNodes);
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
        range.remove();
      }
    });
    try {
      if (placement === "replaceChildren" || placement === "textContent") {
        container.replaceChildren(fragment);
      } else {
        container.insertBefore(fragment, (reference == null ? void 0 : reference.parentNode) === container ? reference : null);
        previous.forEach((child) => {
          var _a2;
          return (_a2 = child.parentNode) == null ? void 0 : _a2.removeChild(child);
        });
      }
      scope.run(() => {
        ownNode(start, context, containerOwner.runtime);
        ownNode(end, context, containerOwner.runtime);
        if (placement !== "textContent") {
          withHydration(container, () => {
            for (const child of children)
              if (child.parentNode === container) hydrateNode(child, context, containerOwner.runtime);
          });
        }
      });
    } catch (error) {
      try {
        handle.remove();
      } catch (cleanupError) {
        throw combinedError("Brio insertion and cleanup both failed.", [error, cleanupError]);
      }
      throw error;
    }
    return handle;
  };
}
const interpolationRegex = /\$\{([^}]+)\}/g;
function interpolateText(text, context) {
  return text.replace(interpolationRegex, (_, expression) => {
    const value = evaluate(expression, context);
    return value === null || value === void 0 ? "" : String(value);
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
function extractModifiers(attrName) {
  const parts = attrName.split(".");
  const baseName = parts[0];
  const modifiers = {};
  for (let i2 = 1; i2 < parts.length; i2++) {
    modifiers[parts[i2]] = true;
  }
  return { baseName, modifiers };
}
function handleIf(element, expression, modifiers, context, runtime, hydrateNodeFn) {
  const parent = element.parentNode;
  if (!parent) throw new Error("b-if requires an element with a parent node.");
  if (Object.keys(modifiers).some((name) => !["hide", "detach"].includes(name)))
    throw new SyntaxError("b-if supports only .hide and .detach modifiers.");
  if (modifiers.hide && modifiers.detach)
    throw new SyntaxError("b-if.hide and b-if.detach cannot be combined.");
  const preserved = Boolean(modifiers.hide || modifiers.detach);
  const branches = [];
  const originals = [];
  const addBranch = (node, condition) => {
    const attributes = Array.from(node.attributes);
    const conditional = attributes.filter((attribute) => ["b-if", "b-else-if", "b-else"].includes(extractModifiers(attribute.name).baseName));
    if (conditional.length !== 1)
      throw new SyntaxError("An element can have only one conditional directive.");
    if (node !== element && Object.keys(extractModifiers(conditional[0].name).modifiers).length)
      throw new SyntaxError("Conditional modifiers belong only on the leading b-if, not b-else-if or b-else.");
    if (modifiers.hide && attributes.some((attribute) => ["b-for", "b-template", "template"].includes(extractModifiers(attribute.name).baseName)))
      throw new SyntaxError("b-if.hide requires a concrete branch element; wrap b-for or b-template in another element or use .detach.");
    const template = cloneProjectedNode(node);
    template.removeAttribute(conditional[0].name);
    originals.push(node);
    branches.push({ template, expression: condition });
  };
  addBranch(element, expression);
  const nextBranch = (node) => {
    var _a;
    let next = node.nextSibling;
    while (next && (next.nodeType === Node.COMMENT_NODE || next.nodeType === Node.TEXT_NODE && !((_a = next.textContent) == null ? void 0 : _a.trim()))) next = next.nextSibling;
    return (next == null ? void 0 : next.nodeType) === Node.ELEMENT_NODE ? next : null;
  };
  let sibling = nextBranch(element);
  let ended = false;
  while (sibling) {
    const conditional = Array.from(sibling.attributes).find((attribute) => ["b-else-if", "b-else"].includes(extractModifiers(attribute.name).baseName));
    if (!conditional) break;
    if (ended)
      throw new SyntaxError("b-else must be the last branch of a b-if chain.");
    ended = extractModifiers(conditional.name).baseName === "b-else";
    addBranch(sibling, ended ? void 0 : conditional.value);
    sibling = nextBranch(sibling);
  }
  const output = ownElementRange(element, context, runtime);
  const placeholder = output.start;
  element.remove();
  originals.slice(1).forEach((node) => node.remove());
  let stopCondition;
  onCleanup(() => stopCondition == null ? void 0 : stopCondition());
  const selectBranch = () => branches.findIndex((candidate) => candidate.expression === void 0 || Boolean(evaluate(candidate.expression, context)));
  const instances = /* @__PURE__ */ new Map();
  const anchors = [];
  let active;
  let activeBranch = -1;
  let initialized = false;
  const createAnchor = () => {
    const anchor = element.ownerDocument.createComment("brio:if:branch");
    ownNode(anchor, context, runtime);
    anchors.push(anchor);
    return anchor;
  };
  const destroy = (instance) => {
    instances.delete(instance.index);
    cancelTransition(instance.element);
    try {
      instance.scope.dispose();
    } finally {
      instance.output.remove();
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
    anchors.forEach((anchor) => anchor.remove());
    placeholder.remove();
    if (errors.length) throw combinedError("Conditional branch cleanup failed.", errors);
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
    const destination = visible || modifiers.hide ? anchor.parentNode : element.ownerDocument.createDocumentFragment();
    destination.insertBefore(current, destination === anchor.parentNode ? anchor.nextSibling : null);
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
      if (preserved && range.start.isConnected && !output.nodes().includes(range.start)) {
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
    else if (((_a = instance.output.start.parentNode) == null ? void 0 : _a.nodeType) === Node.DOCUMENT_FRAGMENT_NODE && instance.anchor.parentNode)
      instance.output.moveBefore(instance.anchor.parentNode, instance.anchor.nextSibling);
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
        parent.insertBefore(anchor, cursor.nextSibling);
        const instance = createInstance(index, index === selected, anchor);
        cursor = instance.output.end.parentNode === parent ? instance.output.end : anchor;
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
  if (!parsed) throw new SyntaxError(`Invalid b-for expression "${expression}". Use "item in $data.items".`);
  const [, itemName, indexName = "$index", collectionExpression] = parsed;
  if (itemName === "$parent" || indexName === "$parent")
    throw new SyntaxError("$parent is reserved for Brio loop ancestry.");
  const keyExpression = element.getAttribute("b-key");
  const output = ownElementRange(element, context, runtime);
  const placeholder = output.start;
  const template = cloneProjectedNode(element);
  template.removeAttribute("b-for");
  template.removeAttribute("b-key");
  element.remove();
  const rows = /* @__PURE__ */ new Map();
  const portals = [];
  let ordered = [];
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
        const range = createDomRange(element.ownerDocument, "for:portal");
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
    for (const row of [...ordered].reverse()) {
      const destination = destinations.get(row) ?? output;
      row.output.moveBefore(destination.end.parentNode, references.get(destination) ?? null);
      references.set(destination, row.output.start);
    }
    for (let index = portals.length - 1; index >= 0; index--) {
      if (!used.has(portals[index].range)) {
        output.removePortal(portals[index].range);
        portals.splice(index, 1);
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
        row.output.remove();
      }
    }
    rows.clear();
    placeholder.remove();
    if (errors.length) throw new AggregateError(errors, "One or more repeated items failed to dispose.");
  });
  effect(() => {
    reconciling = true;
    try {
      const entries = enumerate(evaluate(collectionExpression, context));
      const nextKeys = /* @__PURE__ */ new Set();
      ordered = [];
      for (const [index, item] of entries) {
        const loopData = { [itemName]: item, [indexName]: index };
        const rowState = createScopedState(loopData, context.$for);
        const rowContext = createExpressionScope({ $for: rowState }, context);
        const evaluatedKey = keyExpression ? evaluate(keyExpression, rowContext) : index;
        if (typeof evaluatedKey !== "string" && typeof evaluatedKey !== "number")
          throw new TypeError("b-key must evaluate to a string or number.");
        if (nextKeys.has(evaluatedKey))
          throw new Error(`Duplicate b-for key "${evaluatedKey}".`);
        nextKeys.add(evaluatedKey);
        let row = rows.get(evaluatedKey);
        if (!row) {
          rowContext.$ref = createRefs();
          const rowElement = cloneProjectedNode(template);
          const rowScope = createScope();
          output.end.parentNode.insertBefore(rowElement, output.end);
          const range = rowScope.run(() => ownElementRange(rowElement, rowContext, runtime));
          range.onRedirect(reconcilePositions);
          row = { element: rowElement, context: rowContext, values: rowState, scope: rowScope, key: evaluatedKey, output: range };
          rows.set(evaluatedKey, row);
          try {
            rowScope.run(() => hydrateNodeFn(rowElement, rowContext, runtime));
          } catch (error) {
            rows.delete(evaluatedKey);
            try {
              rowScope.dispose();
            } catch (cleanupError) {
              throw combinedError("Loop hydration and cleanup both failed.", [error, cleanupError]);
            }
            throw error;
          }
          const owner = getNodeOwner(rowElement);
          if (owner) owner.structuralRoot = true;
        } else {
          row.values[itemName] = item;
          row.values[indexName] = index;
        }
        ordered.push(row);
      }
      for (const [key, row] of rows) {
        if (nextKeys.has(key)) continue;
        try {
          row.scope.dispose();
        } finally {
          row.output.remove();
          rows.delete(key);
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
    const html = evaluate(expression, context);
    const htmlStr = isTrustedHTML(html) ? getTrustedHTMLString(html) : String(html ?? "");
    contentScope == null ? void 0 : contentScope.dispose();
    contentScope = void 0;
    const template = document.createElement("template");
    template.innerHTML = htmlStr;
    element.replaceChildren(template.content);
    if (!modifiers.raw) {
      contentScope = createScope();
      contentScope.run(() => hydrateChildrenFn(element, context, runtime));
    }
  });
}
function handleText(element, expression, modifiers, context) {
  effect(() => {
    const value = evaluate(expression, context);
    const text = value === null || value === void 0 ? "" : String(value);
    element.textContent = modifiers.raw ? text : interpolateText(text, context);
  });
}
function handleData(element, expression, _modifiers, parentContext) {
  const context = createExpressionScope({ $el: element }, parentContext);
  if (!expression.trim()) return context;
  const data = evaluate(expression, context);
  if (data === null || typeof data !== "object")
    throw new TypeError("b-data must evaluate to an object.");
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
  const $provided = createProvidedValues(() => evaluate(expression, context), context.$provided);
  return createExpressionScope({ $provided }, context);
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
function validateMoneyOptions(options) {
  if (options === null || typeof options !== "object" || Array.isArray(options))
    throw new TypeError("Money mask options must be an object.");
  if (options.thousands !== void 0 && typeof options.thousands !== "string")
    throw new TypeError("Money mask thousands must be a string.");
  if (options.decimal !== void 0 && (typeof options.decimal !== "string" || !options.decimal))
    throw new TypeError("Money mask decimal must be a non-empty string.");
  if (options.precision !== void 0 && (!Number.isInteger(options.precision) || options.precision < 0 || options.precision > 100))
    throw new RangeError("Money mask precision must be an integer between 0 and 100.");
  if ((options.thousands ?? ",") === (options.decimal ?? "."))
    throw new TypeError("Money mask thousands and decimal separators must differ.");
}
function formatMoney(value, options = {}) {
  validateMoneyOptions(options);
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
  const formattedInteger = integerStr.replace(/\B(?=(\d{3})+(?!\d))/g, () => thousands);
  const result = decimalStr ? `${formattedInteger}${decimal}${decimalStr}` : formattedInteger;
  return isNegative ? `-${result}` : result;
}
function formatPattern(value, pattern, positions) {
  let result = "";
  let valIndex = 0;
  for (let i2 = 0; i2 < pattern.length && valIndex < value.length; i2++) {
    const patternChar = pattern[i2];
    if (patternChar === "9" || patternChar === "#") {
      while (valIndex < value.length && !/\d/.test(value[valIndex])) valIndex++;
      if (valIndex < value.length) {
        positions == null ? void 0 : positions.push({ input: valIndex, output: result.length + 1 });
        result += value[valIndex++];
      }
    } else if (patternChar === "a" || patternChar === "A") {
      while (valIndex < value.length && !/[a-zA-Z]/.test(value[valIndex])) valIndex++;
      if (valIndex < value.length) {
        positions == null ? void 0 : positions.push({ input: valIndex, output: result.length + 1 });
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
function formatMask(value, pattern) {
  return formatPattern(value, pattern);
}
function handleMask(element, expression, modifiers, context) {
  if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) {
    throw new TypeError("b-mask can only be used on input and textarea elements.");
  }
  const trimmed = expression.trim();
  const money = (options = {}) => {
    validateMoneyOptions(options);
    return { kind: "money", options };
  };
  const maskContext = createExpressionScope({ money }, context);
  let configuration = "";
  const applyMask = (event) => {
    if (event instanceof InputEvent && event.isComposing) return;
    const current = element.value;
    const start = element.selectionStart;
    const end = element.selectionEnd;
    const direction = element.selectionDirection;
    const positions = [];
    const formatted = typeof configuration === "string" ? formatPattern(current, configuration, positions) : formatMoney(current, configuration.options);
    const deleting = event instanceof InputEvent && event.inputType.startsWith("delete");
    const mapPosition = (position) => {
      var _a;
      if (typeof configuration === "string") {
        if (!deleting) return formatMask(current.slice(0, position), configuration).length;
        return ((_a = positions.filter((entry) => entry.input < position).at(-1)) == null ? void 0 : _a.output) ?? 0;
      }
      const rightDigits = current.slice(position).replace(/\D/g, "").length;
      const digits = [...formatted.matchAll(/\d/g)];
      const leftDigits = digits.length - rightDigits;
      if (position === 0) return 0;
      return leftDigits > 0 ? digits[leftDigits - 1].index + 1 : formatted.startsWith("-") ? 1 : 0;
    };
    const preserveSelection = element.ownerDocument.activeElement === element && start !== null && end !== null;
    const mappedStart = preserveSelection ? mapPosition(start) : null;
    const mappedEnd = preserveSelection ? mapPosition(end) : null;
    if (element.value !== formatted) {
      element.value = formatted;
      element.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (mappedStart !== null && mappedEnd !== null && (current !== formatted || deleting))
      element.setSelectionRange(mappedStart, mappedEnd, direction ?? "none");
  };
  element.addEventListener("input", applyMask, true);
  onCleanup(() => {
    element.removeEventListener("input", applyMask, true);
  });
  effect(() => {
    const value = trimmed ? evaluate(trimmed, maskContext) : void 0;
    if (modifiers.money) configuration = money(value);
    else if (value === "money" || value === money) configuration = money();
    else if (typeof value === "string") configuration = value;
    else if (value && typeof value === "object" && value.kind === "money") configuration = money(value.options);
    else throw new TypeError("b-mask must evaluate to a pattern string or money(options).");
    applyMask();
  });
}
function handleTeleport(element, expression, modifiers, context) {
  var _a;
  if (Object.keys(modifiers).length) throw new SyntaxError("b-teleport does not support modifiers.");
  const owner = getNodeOwner(element);
  if (!owner) throw new Error("b-teleport requires an owned Brio element.");
  const range = ownElementRange(element, context, owner.runtime);
  const placeholder = element.ownerDocument.createComment("brio:teleport");
  ownNode(placeholder, owner.context, owner.runtime);
  (_a = range.start.parentNode) == null ? void 0 : _a.insertBefore(placeholder, range.start);
  getNodeOwner(range.start).teleport = { source: placeholder, end: range.end };
  let stop;
  let cancelPending;
  onCleanup(() => {
    stop == null ? void 0 : stop();
    cancelPending == null ? void 0 : cancelPending();
    range.remove();
    placeholder.remove();
  });
  let lastTarget;
  let lastPlacement;
  let missingSelector;
  stop = effect(() => {
    var _a2;
    cancelPending == null ? void 0 : cancelPending();
    cancelPending = void 0;
    const value = evaluate(expression, context);
    let target = value;
    let placement = "after";
    if (Array.isArray(value)) {
      if (value.length !== 2) throw new TypeError("b-teleport expects a [target, placement] pair.");
      [target, placement] = value;
    }
    if (placement !== "before" && placement !== "after" && placement !== "prepend" && placement !== "append")
      throw new TypeError("b-teleport placement must be before, after, prepend, or append.");
    if (typeof target === "string") {
      const selector = target;
      target = element.ownerDocument.querySelector(selector);
      if (!target) {
        if (missingSelector !== selector) console.warn(`b-teleport target "${selector}" not found.`);
        missingSelector = selector;
      } else missingSelector = void 0;
    } else missingSelector = void 0;
    if (target !== null && target !== void 0 && !(target instanceof element.ownerDocument.defaultView.Element))
      throw new TypeError("b-teleport target must be an Element, selector string, null, or undefined.");
    const resolved = target;
    if (resolved) {
      if (range.nodes(true).some((node) => node === resolved || node.contains(resolved)))
        throw new Error("b-teleport cannot target its own rendered output.");
      if ((placement === "append" || placement === "prepend") && resolved.localName === "template")
        throw new Error("b-teleport cannot insert children into a native template.");
      const { parent } = portalPosition({ target: resolved, placement });
      if ((_a2 = getNodeOwner(parent)) == null ? void 0 : _a2.controlsChildren)
        throw new Error("b-teleport cannot insert into a container whose content is controlled by a directive.");
      const targetOwner = getNodeOwner(resolved);
      let pending = getPendingHydration(resolved);
      if (!targetOwner) {
        for (let ancestor = resolved.parentNode; ancestor && !pending; ancestor = ancestor.parentNode)
          pending = getPendingHydration(ancestor);
      }
      if (pending) {
        const retry = () => stop == null ? void 0 : stop.run();
        pending.add(retry);
        cancelPending = () => {
          pending.delete(retry);
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
  const isTemplateTag = element.tagName.toLowerCase() === "template";
  const fragment = isTemplateTag ? cloneProjectedNode(element.content) : element.ownerDocument.createDocumentFragment();
  if (!isTemplateTag) {
    while (element.firstChild) {
      fragment.appendChild(element.firstChild);
    }
  }
  const parent = element.parentNode;
  if (!parent) throw new Error("b-template requires an element with a parent node.");
  const insertedNodes = Array.from(fragment.childNodes);
  parent.insertBefore(fragment, element);
  element.remove();
  withHydration(parent, () => {
    for (const node of insertedNodes) {
      if (node.parentNode === parent) hydrateNodeFn(node, context, runtime);
    }
  });
}
function observerOptions(element, attrName, modifiers, context) {
  const expression = element.getAttribute("b-options");
  const mapping = expression === null ? {} : evaluate(expression, context);
  if (!mapping || typeof mapping !== "object" || Array.isArray(mapping))
    throw new TypeError("b-options must evaluate to an object keyed by directive name.");
  const base = attrName.split(".")[0];
  const result = {};
  for (const name of /* @__PURE__ */ new Set([base, attrName])) {
    const options = Object.prototype.hasOwnProperty.call(mapping, name) ? Reflect.get(mapping, name) : void 0;
    if (options === void 0) continue;
    if (!options || typeof options !== "object" || Array.isArray(options))
      throw new TypeError(`b-options["${name}"] must be an object.`);
    Object.assign(result, options);
  }
  return Object.assign(result, modifiers);
}
function observerTarget(value, element, label) {
  const target = typeof value === "string" ? element.ownerDocument.querySelector(value) : value;
  const view = element.ownerDocument.defaultView;
  if (!(target instanceof view.Element) && !(target instanceof view.Document) && !(target instanceof view.Text))
    throw new TypeError(`${label} must resolve to an element, document, or text node.`);
  return target;
}
function observerBoolean(options, name, fallback) {
  const value = options[name];
  if (value === void 0) return fallback;
  if (typeof value !== "boolean") throw new TypeError(`Observer ${name} must be a boolean.`);
  return value;
}
function observerDelay(options) {
  const value = options.debounce;
  if (value === void 0 || value === false) return;
  if (value === true) return 100;
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0)
    throw new TypeError("Observer debounce must be a boolean or non-negative finite milliseconds.");
  return value;
}
function handleIntersection(element, attrName, expression, modifiers, context) {
  const isExit = attrName.split(".")[0].endsWith("-exit");
  const options = observerOptions(element, attrName, modifiers, context);
  const isOnce = observerBoolean(options, "once", false);
  const delay = observerDelay(options);
  const root = options.root === void 0 || options.root === null ? null : observerTarget(options.root, element, "Intersection root");
  if ((root == null ? void 0 : root.nodeType) === 3) throw new TypeError("Intersection root cannot be a text node.");
  if (options.rootMargin !== void 0 && typeof options.rootMargin !== "string")
    throw new TypeError("Intersection rootMargin must be a string.");
  const threshold = options.threshold;
  if (threshold !== void 0 && !(typeof threshold === "number" ? Number.isFinite(threshold) && threshold >= 0 && threshold <= 1 : Array.isArray(threshold) && threshold.every((value) => typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1)))
    throw new TypeError("Intersection threshold must be a number or array of numbers between 0 and 1.");
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
          execute(expression, createExpressionScope({ $entry: entry }, context));
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
    attributes: isAttrs,
    characterData: isText,
    subtree: observerBoolean(configured, "subtree", true)
  };
  if (isAttrs) {
    options.attributeOldValue = observerBoolean(configured, "attributeOldValue", false);
    if (configured.attributeFilter !== void 0) {
      if (!Array.isArray(configured.attributeFilter) || !configured.attributeFilter.every((value) => typeof value === "string"))
        throw new TypeError("Mutation attributeFilter must be an array of strings.");
      options.attributeFilter = configured.attributeFilter;
    }
  }
  if (isText) options.characterDataOldValue = observerBoolean(configured, "characterDataOldValue", false);
  let debounceTimer;
  let pending = [];
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
        const records = pending;
        pending = [];
        execute(expression, createExpressionScope({ $mutations: records }, context));
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
  const target = observerBoolean(options, "document", false) ? element.ownerDocument.documentElement : element;
  const box = options.box ?? "content-box";
  if (box !== "content-box" && box !== "border-box" && box !== "device-pixel-content-box")
    throw new TypeError("Resize box must be content-box, border-box, or device-pixel-content-box.");
  const delay = observerDelay(options);
  let debounceTimer;
  const observer = new ResizeObserver((entries) => {
    const entry = entries[0];
    if (!entry) return;
    const invoke = () => {
      const sizes = box === "border-box" ? entry.borderBoxSize : box === "device-pixel-content-box" ? entry.devicePixelContentBoxSize : entry.contentBoxSize;
      const measured = sizes == null ? void 0 : sizes[0];
      if (box !== "content-box" && !measured)
        throw new Error(`ResizeObserver did not supply the requested ${box} measurement.`);
      const vertical = /^(vertical|sideways)/.test(
        element.ownerDocument.defaultView.getComputedStyle(entry.target).writingMode
      );
      const size = {
        width: measured ? vertical ? measured.blockSize : measured.inlineSize : entry.contentRect.width,
        height: measured ? vertical ? measured.inlineSize : measured.blockSize : entry.contentRect.height
      };
      execute(expression, createExpressionScope({ $size: size, $entry: entry }, context));
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
function handleEffect(_element, expression, _modifiers, context) {
  effect(() => {
    evaluate(expression, context);
  });
}
function handleScript(element, _expression, _modifiers, context) {
  if (element.tagName.toLowerCase() !== "script")
    throw new TypeError("b-script can only be used on script elements.");
  const raw = (element.textContent || "").trim();
  if (!raw) throw new SyntaxError("b-script requires a function expression.");
  const $context = createExpressionScope({ onCleanup }, context);
  try {
    const result = evaluateFunction(raw, $context)($context);
    if (result instanceof Promise)
      return result.then(() => {
      }, (error) => {
        throw causedError("Brio b-script execution failed.", error);
      });
  } catch (error) {
    throw causedError("Brio b-script execution failed.", error);
  }
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
  withHydration(element, () => {
    for (const child of Array.from(element.childNodes)) {
      if (child.parentNode === element && !getNodeOwner(child)) hydrateNode(child, context, runtime);
    }
  });
}
function hydrateTextNode(node, context) {
  const raw = node.nodeValue ?? "";
  if (!raw.includes("${")) return;
  effect(() => {
    node.nodeValue = interpolateText(raw, context);
  });
}
function hydrateNode(node, parentContext, runtime) {
  if (getNodeOwner(node)) throw new Error("Cannot hydrate an already hydrated Brio node.");
  parentContext = takeProjectedContext(node) ?? parentContext;
  if (!parentContext.$ref) parentContext = createExpressionScope({ $ref: createRefs() }, parentContext);
  const scope = createScope();
  withHydration(node, () => scope.run(() => {
    ownNode(node, parentContext, runtime);
    hydrateOwnedNode(node, parentContext, runtime);
  }));
}
function hydrateOwnedNode(node, parentContext, runtime) {
  if (node.nodeType === Node.TEXT_NODE) {
    hydrateTextNode(node, parentContext);
    return;
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return;
  const element = node;
  if (element.hasAttribute("b-ignore") || element.hasAttribute("ignore")) {
    getNodeOwner(element).controlsChildren = true;
    return;
  }
  const conditionalAttributes = Array.from(element.attributes).filter((attribute) => ["b-if", "b-else-if", "b-else"].includes(extractModifiers(attribute.name).baseName));
  if (conditionalAttributes.length > 1)
    throw new SyntaxError("An element can have only one conditional directive.");
  const ifAttr = conditionalAttributes[0];
  if (ifAttr && extractModifiers(ifAttr.name).baseName === "b-if") {
    handleIf(element, ifAttr.value, extractModifiers(ifAttr.name).modifiers, parentContext, runtime, hydrateNode);
    return;
  }
  if (ifAttr)
    throw new SyntaxError("b-else-if and b-else require an adjacent preceding b-if branch.");
  let context = createExpressionScope({
    $el: element,
    $stores: parentContext.$stores ?? emptyContextValues,
    $provided: parentContext.$provided ?? emptyContextValues,
    ...runtime.root ? { $insert: createInsert(runtime) } : {}
  }, parentContext);
  const dataAttr = element.getAttribute("b-data");
  if (dataAttr !== null) {
    context = handleData(element, dataAttr, {}, context);
    context = createExpressionScope({ $ref: createRefs() }, context);
    element.removeAttribute("b-data");
  }
  getNodeOwner(element).context = context;
  const forAttr = element.getAttribute("b-for");
  if (forAttr !== null) {
    const { modifiers } = extractModifiers("b-for");
    handleFor(element, forAttr, modifiers, context, runtime, hydrateNode);
    return;
  }
  const idAttr = element.getAttribute("b-id");
  if (idAttr !== null) {
    context = handleId(element, idAttr, {}, context);
    element.removeAttribute("b-id");
    getNodeOwner(element).context = context;
  }
  const provideAttr = element.getAttribute("b-provide");
  if (provideAttr !== null) {
    context = handleProvide(provideAttr, context);
    element.removeAttribute("b-provide");
    getNodeOwner(element).context = context;
  }
  const templateAttr = element.getAttribute("b-template");
  if (Array.from(element.attributes).some((attribute) => ["b-text", "text", "b-html", "html", "b-router-outlet"].includes(extractModifiers(attribute.name).baseName)))
    getNodeOwner(element).controlsChildren = true;
  const refAttributes = Array.from(element.attributes).filter((attribute) => extractModifiers(attribute.name).baseName === "b-ref" || attribute.name.startsWith("b-ref-"));
  if (refAttributes.length) {
    if (refAttributes.length !== 1 || refAttributes[0].name !== "b-ref")
      throw new SyntaxError("b-ref does not support arguments or modifiers.");
    const name = refAttributes[0].value.trim();
    if (!name) throw new SyntaxError("b-ref requires a nonempty literal name.");
    if (templateAttr !== null || element.tagName.toLowerCase() === "template")
      throw new TypeError("b-ref requires a concrete element, not a template wrapper.");
    registerRef(context.$ref, name, element);
    element.removeAttribute("b-ref");
  }
  if (templateAttr !== null) {
    handleTemplate(element, templateAttr, {}, context, runtime, hydrateNode);
    for (const attribute of Array.from(element.attributes)) {
      const { baseName, modifiers } = extractModifiers(attribute.name);
      if (baseName === "b-teleport" || baseName === "teleport")
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
  const transitionAttr = Array.from(element.attributes).find((attribute) => ["b-transition", "transition"].includes(extractModifiers(attribute.name).baseName));
  if (transitionAttr) prepareTransition(element, transitionAttr.value);
  for (const attribute of Array.from(element.attributes)) {
    const attrName = attribute.name;
    const attrValue = attribute.value;
    const { baseName, modifiers } = extractModifiers(attrName);
    if (baseName.startsWith("b-on-") || baseName.startsWith("on-")) {
      if (baseName.includes("-enter") || baseName.includes("-exit")) {
        handleIntersection(element, attrName, attrValue, modifiers, context);
      } else if (baseName.includes("-addednodes") || baseName.includes("-removednodes") || baseName.includes("-attrs") || baseName.includes("-text")) {
        handleMutation(element, attrName, attrValue, modifiers, context);
      } else if (baseName.includes("-resize")) {
        handleResize(element, attrName, attrValue, modifiers, context);
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
    } else if (baseName === "b-text" || baseName === "text") {
      getNodeOwner(element).controlsChildren = true;
      handleText(element, attrValue, modifiers, context);
      element.removeAttribute(attrName);
      hasText = true;
    } else if (baseName === "b-html" || baseName === "html") {
      getNodeOwner(element).controlsChildren = true;
      handleHtml(element, attrValue, modifiers, context, runtime, hydrateChildren);
      element.removeAttribute(attrName);
      hasHtml = true;
    } else if (baseName === "b-mask" || baseName === "mask") {
      handleMask(element, attrValue, modifiers, context);
      element.removeAttribute(attrName);
    } else if (baseName === "b-teleport" || baseName === "teleport") {
      handleTeleport(element, attrValue, modifiers, context);
      element.removeAttribute(attrName);
    } else if (baseName === "b-transition" || baseName === "transition") {
      handleTransition(element, attrValue);
      element.removeAttribute(attrName);
    } else if (baseName === "b-effect" || baseName === "effect") {
      handleEffect(element, attrValue, modifiers, context);
      element.removeAttribute(attrName);
    } else if (baseName === "b-script") {
      handleScript(element, attrValue, modifiers, context);
      element.removeAttribute(attrName);
    } else if (baseName === "b-router-outlet") {
      getNodeOwner(element).controlsChildren = true;
      mountRouterOutlet(element, context, runtime, hydrateNode);
      element.removeAttribute(attrName);
      return;
    }
  }
  if (!hasText && !hasHtml && tagName !== "script") {
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
  const stores = Object.freeze(copyContextValues(
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
    insert(target, placement, content, insertOptions) {
      if (disposed) throw new Error("Cannot insert into a disposed Brio app.");
      const matches = [...roots].filter((handle) => {
        var _a2;
        return typeof target === "string" ? handle.root.matches(target) || Boolean(handle.root.querySelector(target)) : target instanceof Node && (handle.root.contains(target) || ((_a2 = getNodeOwner(target)) == null ? void 0 : _a2.runtime.root) === handle.root);
      });
      if (matches.length !== 1)
        throw new Error("Brio insert target must belong to exactly one mounted root of this app.");
      const owner = getNodeOwner(matches[0].root);
      if (!owner) throw new Error("Brio insert requires an active mounted Brio root.");
      return createInsert(owner.runtime)(target, placement, content, insertOptions);
    },
    mount(target) {
      if (disposed) throw new Error("Cannot mount a disposed Brio app.");
      const root = typeof target === "string" ? document.querySelector(target) : target;
      if (!(root instanceof Element))
        throw new TypeError(`Brio mount target "${String(target)}" did not resolve to an element.`);
      if ([...activeMountRoots].some((mounted) => mounted.contains(root) || root.contains(mounted)))
        throw new Error("Brio mount roots cannot be equal or nested; use one app root with child components.");
      if (Array.from(root.attributes).some((attribute) => ["b-if", "b-for", "b-template"].includes(attribute.name.split(".")[0])))
        throw new Error("b-if, b-for and b-template require a container root; wrap the structural directive in another element.");
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
        { $data: createScopedState(appState), $stores: stores, $provided: emptyContextValues, $ref: createRefs(), trustedHTML }
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
    for (let i2 = 0; i2 < queue.length; i2++) {
      queue[i2]();
    }
  } finally {
    isFlushing = false;
    if (scheduledQueue.length) {
      queueMicrotask(flushQueue);
    }
  }
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
      for (const [k, v] of Object.entries(body)) {
        u.searchParams.append(k, String(v));
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
  d as devtools,
  a as devtoolsPanel,
  effect,
  e as enableDevtools,
  evaluate,
  evaluateFunction,
  execute,
  getCurrentScope,
  http,
  hydrateNode,
  hydrateRoot,
  i as inspectDevtools,
  onCleanup,
  onDispose,
  persist,
  queueTask,
  resource,
  s as setActiveScope,
  b as signal,
  state,
  trustedHTML,
  validate
};
//# sourceMappingURL=index.js.map
