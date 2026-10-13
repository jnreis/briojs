import { b as batch, q as queueEffect, g as getActiveEffect } from "./effect-DZvu7u5S.js";
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
let settingDepth = 0;
const isObject = (value) => value !== null && typeof value === "object";
const toRaw = (value) => {
  if (!isObject(value)) return value;
  return rawCache.get(value) ?? value;
};
const track = (target, key) => {
  const activeEffect = getActiveEffect();
  if (!(activeEffect == null ? void 0 : activeEffect.active)) return;
  let dependencies = targetMap.get(target);
  if (!dependencies) targetMap.set(target, dependencies = /* @__PURE__ */ new Map());
  let effects = dependencies.get(key);
  if (!effects) dependencies.set(key, effects = /* @__PURE__ */ new Set());
  if (effects.has(activeEffect)) return;
  effects.add(activeEffect);
  activeEffect.deps.push(effects);
};
const trigger = (target, key, type, newValue) => {
  const dependencies = targetMap.get(target);
  if (!dependencies) return;
  const effects = /* @__PURE__ */ new Set();
  const activeEffect = getActiveEffect();
  const add = (dep) => dep == null ? void 0 : dep.forEach((eff) => {
    if (eff !== activeEffect) effects.add(eff);
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
  effects.forEach((eff) => queueEffect(eff));
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
export {
  signal as a,
  track as b,
  state as s,
  trigger as t
};
//# sourceMappingURL=state-v4-UFBFm952.js.map
