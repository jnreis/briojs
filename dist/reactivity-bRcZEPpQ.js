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
let bridge;
function installDevtoolsBridge(next) {
  bridge = next;
}
const notifyAppCreated = (app, state2) => bridge == null ? void 0 : bridge.appCreated(app, state2);
const notifyAppDisposed = (app) => bridge == null ? void 0 : bridge.appDisposed(app);
const notifyRootMounted = (app, root) => bridge == null ? void 0 : bridge.rootMounted(app, root);
const notifyRootUnmounted = (app, root) => bridge == null ? void 0 : bridge.rootUnmounted(app, root);
const notifyEffectCreated = () => {
  if (!bridge) return false;
  bridge.effectCreated();
  return true;
};
const notifyEffectDisposed = (tracked) => {
  if (tracked) bridge == null ? void 0 : bridge.effectDisposed();
};
const targetMap = /* @__PURE__ */ new WeakMap();
const proxyCache = /* @__PURE__ */ new WeakMap();
const rawCache = /* @__PURE__ */ new WeakMap();
const ITERATE = Symbol("brio.iterate");
const arrayMutators = /* @__PURE__ */ new Set([
  "copyWithin",
  "fill",
  "pop",
  "push",
  "reverse",
  "shift",
  "sort",
  "splice",
  "unshift"
]);
const arrayMethodCache = /* @__PURE__ */ new WeakMap();
let activeEffect;
let activeScope;
let settingDepth = 0;
let batchDepth = 0;
const queuedEffects = /* @__PURE__ */ new Set();
const isObject = (value) => value !== null && typeof value === "object";
const toRaw = (value) => {
  if (!isObject(value)) return value;
  return rawCache.get(value) ?? value;
};
const cleanupEffect = (effect2) => {
  for (const dep of effect2.deps) dep.delete(effect2);
  effect2.deps.length = 0;
};
const runEffect = (effect2) => {
  if (!effect2.active) return;
  if (effect2.running) return;
  cleanupEffect(effect2);
  const previous = activeEffect;
  const previousScope = activeScope;
  activeEffect = effect2;
  if (effect2.scope) activeScope = effect2.scope;
  effect2.running = true;
  try {
    return effect2.fn();
  } finally {
    effect2.running = false;
    activeEffect = previous;
    activeScope = previousScope;
  }
};
const track = (target, key) => {
  if (!(activeEffect == null ? void 0 : activeEffect.active)) return;
  let dependencies = targetMap.get(target);
  if (!dependencies) targetMap.set(target, dependencies = /* @__PURE__ */ new Map());
  let effects = dependencies.get(key);
  if (!effects) dependencies.set(key, effects = /* @__PURE__ */ new Set());
  if (effects.has(activeEffect)) return;
  effects.add(activeEffect);
  activeEffect.deps.push(effects);
};
const flushEffects = () => {
  const errors = [];
  while (queuedEffects.size) {
    const current = [...queuedEffects];
    queuedEffects.clear();
    for (const effect2 of current) {
      try {
        if (effect2.active) effect2.scheduler ? effect2.scheduler() : runEffect(effect2);
      } catch (error) {
        errors.push(error);
      }
    }
  }
  if (errors.length) throw combinedError("One or more reactive effects failed.", errors);
};
const trigger = (target, key, type, newValue) => {
  const dependencies = targetMap.get(target);
  if (!dependencies) return;
  const effects = /* @__PURE__ */ new Set();
  const add = (dep) => dep == null ? void 0 : dep.forEach((effect2) => {
    if (effect2 !== activeEffect) effects.add(effect2);
  });
  add(dependencies.get(key));
  if (type !== "set") add(dependencies.get(ITERATE));
  if (Array.isArray(target) && key === "length") {
    for (const [depKey, dep] of dependencies) {
      if (typeof depKey === "string" && /^(0|[1-9]\d*)$/.test(depKey) && Number(depKey) >= Number(newValue))
        add(dep);
    }
  } else if (Array.isArray(target) && type === "add" && isArrayIndex(key)) {
    add(dependencies.get("length"));
  }
  effects.forEach((effect2) => queuedEffects.add(effect2));
  if (!batchDepth) flushEffects();
};
const isArrayIndex = (key) => typeof key === "string" && /^(0|[1-9]\d*)$/.test(key) && Number(key) < 4294967295;
const canObserve = (value) => {
  if (Array.isArray(value)) return true;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};
function state(target) {
  if (!isObject(target)) throw new TypeError("Brio state() requires a plain object or array.");
  if (!canObserve(target)) throw new TypeError("Brio state() only observes plain objects and arrays.");
  const raw = toRaw(target);
  const existing = proxyCache.get(raw);
  if (existing) return existing;
  const proxy = new Proxy(raw, {
    get(current, key, receiver) {
      if (key === Symbol.for("brio.raw")) return current;
      track(current, key);
      const value = Reflect.get(current, key, receiver);
      const descriptor = Reflect.getOwnPropertyDescriptor(current, key);
      if (descriptor && !descriptor.configurable && !descriptor.writable && isObject(value))
        return value;
      if (Array.isArray(current) && arrayMutators.has(key) && typeof value === "function") {
        let methods = arrayMethodCache.get(current);
        if (!methods) arrayMethodCache.set(current, methods = /* @__PURE__ */ new Map());
        let method = methods.get(key);
        if (!method) {
          method = (...args) => batch(() => Reflect.apply(value, receiver, args));
          methods.set(key, method);
        }
        return method;
      }
      return isObject(value) && canObserve(value) ? state(value) : value;
    },
    has(current, key) {
      track(current, key);
      return Reflect.has(current, key);
    },
    set(current, key, incoming, receiver) {
      const value = toRaw(incoming);
      const hadKey = Object.prototype.hasOwnProperty.call(current, key);
      const previous = Reflect.get(current, key, receiver);
      if (Object.is(toRaw(previous), value)) return true;
      settingDepth++;
      let succeeded;
      try {
        succeeded = Reflect.set(current, key, value, receiver);
      } finally {
        settingDepth--;
      }
      if (succeeded)
        trigger(current, key, hadKey ? "set" : "add", value);
      return succeeded;
    },
    defineProperty(current, key, descriptor) {
      const previous = Reflect.getOwnPropertyDescriptor(current, key);
      const nextDescriptor = { ...descriptor };
      if ("value" in nextDescriptor) nextDescriptor.value = toRaw(nextDescriptor.value);
      const succeeded = Reflect.defineProperty(current, key, nextDescriptor);
      if (!succeeded || settingDepth) return succeeded;
      const next = Reflect.getOwnPropertyDescriptor(current, key);
      const type = previous ? "set" : "add";
      const changed = !previous || !next || !Object.is(toRaw(previous.value), toRaw(next.value)) || previous.enumerable !== next.enumerable || previous.configurable !== next.configurable || previous.writable !== next.writable;
      if (changed) trigger(current, key, type, next == null ? void 0 : next.value);
      return succeeded;
    },
    deleteProperty(current, key) {
      const hadKey = Object.prototype.hasOwnProperty.call(current, key);
      const succeeded = Reflect.deleteProperty(current, key);
      if (succeeded && hadKey) trigger(current, key, "delete");
      return succeeded;
    },
    ownKeys(current) {
      track(current, ITERATE);
      return Reflect.ownKeys(current);
    }
  });
  const cached = proxy;
  proxyCache.set(raw, proxy);
  rawCache.set(cached, raw);
  return proxy;
}
function signal(initialValue) {
  let value = initialValue;
  const holder = {};
  return {
    get value() {
      track(holder, "value");
      return isObject(value) && canObserve(value) ? state(value) : value;
    },
    set value(next) {
      if (Object.is(toRaw(value), toRaw(next))) return;
      value = next;
      trigger(holder, "value", "set");
    }
  };
}
function effect(fn, options = {}) {
  const reactiveEffect = {
    fn,
    scheduler: options.scheduler,
    scope: activeScope,
    deps: [],
    active: true,
    running: false,
    devtoolsTracked: false
  };
  const stop = () => {
    if (!reactiveEffect.active) return;
    reactiveEffect.active = false;
    cleanupEffect(reactiveEffect);
    notifyEffectDisposed(reactiveEffect.devtoolsTracked);
  };
  Object.defineProperty(stop, "active", { get: () => reactiveEffect.active });
  stop.run = () => runEffect(reactiveEffect);
  if (activeScope) onDispose(activeScope, stop);
  reactiveEffect.devtoolsTracked = notifyEffectCreated();
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
function computed(getter) {
  let dirty = true;
  let cachedValue;
  const holder = {};
  const runner = effect(getter, {
    lazy: true,
    scheduler: () => {
      if (!dirty) {
        dirty = true;
        trigger(holder, "value", "set");
      }
    }
  });
  const dispose = () => {
    if (!runner.active) return;
    runner();
  };
  return {
    get value() {
      if (!runner.active) throw new Error("Cannot read a disposed Brio computed value.");
      track(holder, "value");
      if (dirty) {
        cachedValue = runner.run();
        dirty = false;
      }
      return cachedValue;
    },
    dispose
  };
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
const scopeCleanups = /* @__PURE__ */ new WeakMap();
function onCleanup(cleanup) {
  if (!activeScope) throw new Error("This operation requires an active Brio scope.");
  return onDispose(activeScope, cleanup);
}
function getCurrentScope() {
  return activeScope;
}
export {
  createScope as a,
  batch as b,
  causedError as c,
  combinedError as d,
  effect as e,
  notifyRootUnmounted as f,
  notifyRootMounted as g,
  notifyAppDisposed as h,
  installDevtoolsBridge as i,
  computed as j,
  signal as k,
  getCurrentScope as l,
  notifyAppCreated as n,
  onCleanup as o,
  state as s
};
//# sourceMappingURL=reactivity-bRcZEPpQ.js.map
