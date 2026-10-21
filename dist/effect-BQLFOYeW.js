var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { f as isObjectType, b as createError, s as brioErrors, o as objectConstructor, d as deleteItem, j as isInstanceOf, g as getLength } from "./native-DNTl55LH.js";
const located = /* @__PURE__ */ new WeakSet();
const define = (error, name, value) => objectConstructor.defineProperty(error, name, { configurable: true, value });
const errorText = (error) => error && isObjectType(error) && "message" in error ? `${error.name}: ${error.message}` : String(error);
const elementOf = (node) => {
  const element = node.nodeType === 1 ? node : node.parentNode;
  return (element == null ? void 0 : element.nodeType) === 1 ? element : null;
};
const describeNode = (node) => {
  const element = elementOf(node);
  if (!element) return "a detached node";
  const tag = (el) => el.tagName.toLowerCase();
  const classes = (element.getAttribute("class") ?? "").trim().split(/\s+/).filter(Boolean).slice(0, 2);
  let text = `<${tag(element)}${element.id ? "#" + element.id : ""}${classes.map((name) => "." + name).join("")}>`;
  for (let parent = element.parentElement; parent; parent = parent.parentElement)
    if (tag(parent).includes("-")) return `${text} inside <${tag(parent)}>`;
  return text;
};
const mark = (error, node, directive) => {
  located.add(error);
  const element = node && elementOf(node);
  if (element) define(error, "element", element);
  if (directive) define(error, "directive", directive);
  return error;
};
function causedError(message, cause) {
  const error = createError(message);
  define(error, "cause", cause);
  return error;
}
const directiveError = (message, cause, directive, node) => mark(causedError(
  `${message}${directive ? ` in ${directive}` : ""}${node ? ` on ${describeNode(node)}` : ""}: ${errorText(cause)}`,
  cause
), node, directive);
const locate = (error, node) => {
  if (node && brioErrors.has(error) && !located.has(error)) {
    error.message += ` (at ${describeNode(node)})`;
    mark(error, node);
  }
  return error;
};
const setScopeNode = (scope, node) => {
  if (node) scope._node = node;
};
const getScopeNode = (scope) => scope == null ? void 0 : scope._node;
function combinedError(message, errors) {
  const error = mark(createError(message + errors.map((item) => "\n  - " + errorText(item)).join("")));
  define(error, "errors", errors);
  return error;
}
let activeScope;
const noop = () => {
};
class BrioScope {
  constructor(parent) {
    __publicField(this, "_disposed", false);
    __publicField(this, "_cleanups");
    __publicField(this, "_parent");
    __publicField(this, "_node");
    if (!parent) return;
    this._node = parent._node;
    if (parent._disposed) {
      this._disposed = true;
      return;
    }
    this._parent = parent;
    (parent._cleanups ?? (parent._cleanups = /* @__PURE__ */ new Set())).add(this);
  }
  get disposed() {
    return this._disposed;
  }
  run(fn) {
    if (this._disposed) throw createError("Cannot run a disposed Brio scope.");
    const previous = activeScope;
    activeScope = this;
    try {
      return fn();
    } finally {
      activeScope = previous;
    }
  }
  dispose() {
    if (this._disposed) return;
    this._disposed = true;
    const parent = this._parent;
    if (parent && !parent._disposed) deleteItem(parent._cleanups, this);
    const cleanups = this._cleanups;
    if (!cleanups) return;
    let errors;
    for (const cleanup of cleanups) {
      try {
        if (isInstanceOf(cleanup, BrioScope)) cleanup.dispose();
        else cleanup();
      } catch (error) {
        (errors ?? (errors = [])).push(error);
      }
    }
    cleanups.clear();
    if (errors) throw combinedError("One or more Brio scope cleanups failed.", errors);
  }
}
function createScope(parent = activeScope) {
  return new BrioScope(parent);
}
function onDispose(scope, cleanup) {
  if (!scope) return noop;
  const owner = scope;
  if (owner._disposed) {
    cleanup();
    return noop;
  }
  let active = true;
  const wrapped = () => {
    if (!active) return;
    active = false;
    if (!owner._disposed) deleteItem(owner._cleanups, wrapped);
    cleanup();
  };
  (owner._cleanups ?? (owner._cleanups = /* @__PURE__ */ new Set())).add(wrapped);
  return wrapped;
}
function addDisposer(scope, cleanup) {
  const owner = scope;
  if (owner._disposed) cleanup();
  else (owner._cleanups ?? (owner._cleanups = /* @__PURE__ */ new Set())).add(cleanup);
}
function removeDisposer(scope, cleanup) {
  const owner = scope;
  if (!owner._disposed) deleteItem(owner._cleanups, cleanup);
}
function onCleanup(cleanup) {
  if (!activeScope) throw createError("This operation requires an active Brio scope.");
  return onDispose(activeScope, cleanup);
}
function getCurrentScope() {
  return activeScope;
}
function setActiveScope(scope) {
  const prev = activeScope;
  activeScope = scope;
  return prev;
}
const devtoolsEnabled = typeof __BRIO_DEVTOOLS__ === "undefined" || __BRIO_DEVTOOLS__;
let bridge;
function installDevtoolsBridge(next) {
  bridge = next;
}
const notifyAppCreated = (app, state) => {
  if (devtoolsEnabled) bridge == null ? void 0 : bridge.appCreated(app, state);
};
const notifyAppDisposed = (app) => {
  if (devtoolsEnabled) bridge == null ? void 0 : bridge.appDisposed(app);
};
const notifyRootMounted = (app, root) => {
  if (devtoolsEnabled) bridge == null ? void 0 : bridge.rootMounted(app, root);
};
const notifyRootUnmounted = (app, root) => {
  if (devtoolsEnabled) bridge == null ? void 0 : bridge.rootUnmounted(app, root);
};
const notifyEffectCreated = () => {
  if (!devtoolsEnabled || !bridge) return false;
  bridge.effectCreated();
  return true;
};
const notifyEffectDisposed = (tracked) => {
  if (devtoolsEnabled && tracked) bridge == null ? void 0 : bridge.effectDisposed();
};
let activeEffect;
let batchDepth = 0;
const queuedEffects = /* @__PURE__ */ new Set();
const getActiveEffect = () => activeEffect;
const cleanupEffect = (eff) => {
  for (const dep of eff.deps) deleteItem(dep, eff);
  eff.deps.length = 0;
};
const runEffect = (eff) => {
  var _a;
  if (!eff.active || ((_a = eff.scope) == null ? void 0 : _a.disposed)) return;
  if (eff.running) return;
  cleanupEffect(eff);
  const previous = activeEffect;
  activeEffect = eff;
  eff.running = true;
  try {
    if (eff.scope) {
      return eff.scope.run(() => eff.fn());
    }
    return eff.fn();
  } catch (error) {
    throw locate(error, getScopeNode(eff.scope));
  } finally {
    eff.running = false;
    activeEffect = previous;
  }
};
const queueEffect = (eff) => {
  var _a;
  if (eff.scheduler) {
    if (eff.active && !((_a = eff.scope) == null ? void 0 : _a.disposed)) eff.scheduler();
    return;
  }
  queuedEffects.add(eff);
  if (!batchDepth) flush();
};
const flush = () => {
  var _a;
  const errors = [];
  while (queuedEffects.size) {
    const current = [...queuedEffects];
    queuedEffects.clear();
    for (const eff of current) {
      try {
        if (eff.active && !((_a = eff.scope) == null ? void 0 : _a.disposed)) runEffect(eff);
      } catch (error) {
        errors.push(error);
      }
    }
  }
  if (getLength(errors)) throw combinedError("One or more reactive effects failed.", errors);
};
function effect(fn, options = {}) {
  const scope = getCurrentScope();
  const reactiveEffect = {
    fn,
    scheduler: options.scheduler,
    scope,
    deps: [],
    active: true,
    running: false
  };
  const stop = () => {
    if (!reactiveEffect.active) return;
    reactiveEffect.active = stop.active = false;
    if (scope) removeDisposer(scope, stop);
    cleanupEffect(reactiveEffect);
    if (devtoolsEnabled) notifyEffectDisposed(Boolean(reactiveEffect.devtoolsTracked));
  };
  stop.active = true;
  stop.run = () => runEffect(reactiveEffect);
  if (scope) addDisposer(scope, stop);
  if (devtoolsEnabled) reactiveEffect.devtoolsTracked = notifyEffectCreated();
  if (!options.lazy) {
    try {
      runEffect(reactiveEffect);
    } catch (error) {
      stop();
      throw error;
    }
  }
  return stop;
}
const enterBatch = () => {
  batchDepth++;
};
const leaveBatch = () => {
  if (!--batchDepth) flush();
};
function batch(fn) {
  batchDepth++;
  let result;
  let failure;
  let failed = false;
  try {
    result = fn();
  } catch (error) {
    failure = error;
    failed = true;
  }
  batchDepth--;
  if (!batchDepth) {
    try {
      flush();
    } catch (error) {
      if (failed)
        throw combinedError("A Brio batch operation and its reactive effects failed.", [failure, error]);
      throw error;
    }
  }
  if (failed) throw failure;
  return result;
}
export {
  setActiveScope as A,
  getScopeNode as B,
  combinedError as a,
  batch as b,
  causedError as c,
  enterBatch as d,
  effect as e,
  describeNode as f,
  getActiveEffect as g,
  directiveError as h,
  installDevtoolsBridge as i,
  getCurrentScope as j,
  createScope as k,
  leaveBatch as l,
  mark as m,
  onDispose as n,
  onCleanup as o,
  errorText as p,
  queueEffect as q,
  locate as r,
  setScopeNode as s,
  notifyRootMounted as t,
  flush as u,
  notifyAppDisposed as v,
  notifyAppCreated as w,
  notifyRootUnmounted as x,
  addDisposer as y,
  removeDisposer as z
};
//# sourceMappingURL=effect-BQLFOYeW.js.map
