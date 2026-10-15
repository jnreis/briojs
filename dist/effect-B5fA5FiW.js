function causedError(message, cause) {
  const error = new Error(message);
  Object.defineProperty(error, "cause", { configurable: true, value: cause });
  return error;
}
function combinedError(message, errors) {
  const error = new Error(message);
  Object.defineProperty(error, "errors", { configurable: true, value: errors });
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
      if (disposed) throw new Error("Cannot run a disposed Brio scope.");
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
      if (errors.length) throw combinedError("One or more Brio scope cleanups failed.", errors);
    }
  };
  scopeCleanups.set(scope, cleanups);
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
    var _a2;
    if (!active) return;
    active = false;
    (_a2 = scopeCleanups.get(scope)) == null ? void 0 : _a2.delete(wrapped);
    originalCleanup();
  };
  (_a = scopeCleanups.get(scope)) == null ? void 0 : _a.add(wrapped);
  return wrapped;
}
function onCleanup(cleanup) {
  if (!activeScope) throw new Error("This operation requires an active Brio scope.");
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
  for (const dep of eff.deps) dep.delete(eff);
  eff.deps.length = 0;
};
const runEffect = (eff) => {
  if (!eff.active) return;
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
  } finally {
    eff.running = false;
    activeEffect = previous;
  }
};
const queueEffect = (eff) => {
  queuedEffects.add(eff);
  if (!batchDepth) flushEffects();
};
const flushEffects = () => {
  const errors = [];
  while (queuedEffects.size) {
    const current = [...queuedEffects];
    queuedEffects.clear();
    for (const eff of current) {
      try {
        if (eff.active) eff.scheduler ? eff.scheduler() : runEffect(eff);
      } catch (error) {
        errors.push(error);
      }
    }
  }
  if (errors.length) throw combinedError("One or more reactive effects failed.", errors);
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
  Object.defineProperty(stop, "active", { get: () => reactiveEffect.active });
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
      flushEffects();
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
  getCurrentScope as a,
  batch as b,
  causedError as c,
  combinedError as d,
  effect as e,
  onCleanup as f,
  getActiveEffect as g,
  createScope as h,
  installDevtoolsBridge as i,
  notifyAppDisposed as j,
  notifyAppCreated as k,
  notifyRootUnmounted as l,
  notifyRootMounted as n,
  onDispose as o,
  queueEffect as q,
  setActiveScope as s
};
//# sourceMappingURL=effect-B5fA5FiW.js.map
