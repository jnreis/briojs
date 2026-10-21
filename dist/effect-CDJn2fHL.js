import { f as isObjectType, b as createError, s as brioErrors, o as objectConstructor, g as getLength, d as deleteItem } from "./native-DNTl55LH.js";
const located = /* @__PURE__ */ new WeakSet();
const scopeNodes = /* @__PURE__ */ new WeakMap();
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
const setScopeNode = (scope, node) => node && scopeNodes.set(scope, node);
const getScopeNode = (scope) => scope && scopeNodes.get(scope);
function combinedError(message, errors) {
  const error = mark(createError(message + errors.map((item) => "\n  - " + errorText(item)).join("")));
  define(error, "errors", errors);
  return error;
}
let activeScope;
const scopeCleanups = /* @__PURE__ */ new WeakMap();
function createScope(parent = activeScope) {
  let disposed = false;
  const cleanups = /* @__PURE__ */ new Set();
  let detachFromParent;
  const scope = {
    get disposed() {
      return disposed;
    },
    run(fn) {
      if (disposed) throw createError("Cannot run a disposed Brio scope.");
      const previous = activeScope;
      activeScope = scope;
      try {
        return fn();
      } finally {
        activeScope = previous;
      }
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      detachFromParent == null ? void 0 : detachFromParent();
      const errors = [];
      for (const cleanup of [...cleanups]) {
        try {
          cleanup();
        } catch (error) {
          errors.push(error);
        }
      }
      cleanups.clear();
      if (getLength(errors)) throw combinedError("One or more Brio scope cleanups failed.", errors);
    }
  };
  scopeCleanups.set(scope, cleanups);
  setScopeNode(scope, getScopeNode(parent));
  if (parent) detachFromParent = onDispose(parent, () => scope.dispose());
  return scope;
}
function onDispose(scope, cleanup) {
  var _a;
  if (!scope) return () => {
  };
  if (scope.disposed) {
    cleanup();
    return () => {
    };
  }
  const originalCleanup = cleanup;
  let active = true;
  const wrapped = () => {
    if (!active) return;
    active = false;
    deleteItem(scopeCleanups.get(scope), wrapped);
    originalCleanup();
  };
  (_a = scopeCleanups.get(scope)) == null ? void 0 : _a.add(wrapped);
  return wrapped;
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
  const reactiveEffect = {
    fn,
    scheduler: options.scheduler,
    scope: getCurrentScope(),
    deps: [],
    active: true,
    running: false
  };
  const stop = () => {
    if (!reactiveEffect.active) return;
    reactiveEffect.active = false;
    cleanupEffect(reactiveEffect);
    if (devtoolsEnabled) notifyEffectDisposed(Boolean(reactiveEffect.devtoolsTracked));
  };
  objectConstructor.defineProperty(stop, "active", { get: () => reactiveEffect.active });
  stop.run = () => runEffect(reactiveEffect);
  const currentScope = getCurrentScope();
  if (currentScope) onDispose(currentScope, stop);
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
  combinedError as a,
  batch as b,
  causedError as c,
  describeNode as d,
  effect as e,
  directiveError as f,
  getActiveEffect as g,
  getCurrentScope as h,
  installDevtoolsBridge as i,
  onCleanup as j,
  createScope as k,
  errorText as l,
  mark as m,
  locate as n,
  onDispose as o,
  notifyRootMounted as p,
  queueEffect as q,
  flush as r,
  setScopeNode as s,
  notifyAppDisposed as t,
  notifyAppCreated as u,
  notifyRootUnmounted as v,
  setActiveScope as w,
  getScopeNode as x
};
//# sourceMappingURL=effect-CDJn2fHL.js.map
