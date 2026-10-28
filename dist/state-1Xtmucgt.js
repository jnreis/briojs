import { c as createTypeError, R as ReflectApi, i as isFunction, k as isArray, g as getLength, G as GET_OWN_PROPERTY_DESCRIPTOR, O as ObjectConstructor, l as ownKeys, e as isObjectType, j as isString } from "./native-BneND9DN.js";
import { b as batch, x as enterBatch, y as leaveBatch, z as getActiveEffect, A as queueEffect } from "./effect-BL1g_AaG.js";
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
const isObject = (value) => value !== null && isObjectType(value);
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
const isArrayIndex = (key) => isString(key) && /^(0|[1-9]\d*)$/.test(key) && Number(key) < 4294967295;
const queueDependency = (dependency, activeEffect) => {
  if (dependency) {
    for (const eff of dependency) if (eff !== activeEffect) queueEffect(eff);
  }
};
const trigger = (target, key, type, newValue, oldValue) => {
  const dependencies = targetMap.get(target);
  if (!dependencies) return;
  const activeEffect = getActiveEffect();
  enterBatch();
  try {
    queueDependency(dependencies.get(key), activeEffect);
    if (type !== "set") queueDependency(dependencies.get(ITERATE), activeEffect);
    if (isArray(target) && key === "length") {
      const length = Number(newValue);
      if (!(Number(oldValue) <= length)) {
        for (const [dependencyKey, dependency] of dependencies)
          if (isArrayIndex(dependencyKey) && Number(dependencyKey) >= length)
            queueDependency(dependency, activeEffect);
      }
    } else if (isArray(target) && type === "add" && isArrayIndex(key)) {
      queueDependency(dependencies.get("length"), activeEffect);
    }
  } finally {
    leaveBatch();
  }
};
const firstChangedIndex = (key, target, args) => {
  const length = getLength(target);
  if (key === "push") return length;
  if (key === "pop") return length ? length - 1 : 0;
  if (key !== "splice") return 0;
  if (!getLength(args)) return length;
  const relative = Math.trunc(Number(args[0])) || 0;
  return relative < 0 ? Math.max(length + relative, 0) : Math.min(relative, length);
};
const triggerArrayChanges = (target, before, from, oldLength) => {
  const dependencies = targetMap.get(target);
  if (!dependencies) return;
  const activeEffect = getActiveEffect();
  const newLength = getLength(target);
  enterBatch();
  try {
    for (let index = from, end = oldLength > newLength ? oldLength : newLength; index < end; index++) {
      const previous = index - from;
      if (!ObjectConstructor.is(before[previous], target[index]) || previous in before !== index in target)
        queueDependency(dependencies.get(String(index)), activeEffect);
    }
    if (oldLength !== newLength) {
      queueDependency(dependencies.get("length"), activeEffect);
      queueDependency(dependencies.get(ITERATE), activeEffect);
    }
  } finally {
    leaveBatch();
  }
};
const observe = (value) => isObject(value) && canObserve(value) ? state(value) : value;
const canObserve = (value) => {
  if (isArray(value)) return true;
  const prototype = ObjectConstructor.getPrototypeOf(value);
  return prototype === ObjectConstructor.prototype || prototype === null;
};
function state(target) {
  if (!isObject(target)) throw createTypeError("Brio state() requires a plain object or array.");
  if (!canObserve(target)) throw createTypeError("Brio state() only observes plain objects and arrays.");
  const raw = toRaw(target);
  const existing = proxyCache.get(raw);
  if (existing) return existing;
  const proxy = new Proxy(raw, {
    get(current, key, receiver) {
      track(current, key);
      const value = ReflectApi.get(current, key, receiver);
      if (isFunction(value)) {
        if (!isArray(current) || !arrayMutators.has(key)) return value;
        let methods = arrayMethodCache.get(current);
        if (!methods) arrayMethodCache.set(current, methods = /* @__PURE__ */ new Map());
        let method = methods.get(key);
        if (!method) {
          method = (...args) => batch(() => {
            const oldLength = getLength(current);
            const from = firstChangedIndex(key, current, args);
            const before = current.slice(from);
            const comparator = args[0];
            const input = key === "sort" ? isFunction(comparator) ? [(a, b) => comparator(observe(a), observe(b))] : args : args.map(toRaw);
            const result = ReflectApi.apply(value, current, input);
            triggerArrayChanges(current, before, from, oldLength);
            return result === current ? receiver : isArray(result) ? result.map(observe) : observe(result);
          });
          methods.set(key, method);
        }
        return method;
      }
      if (!isObject(value)) return value;
      const descriptor = ReflectApi[GET_OWN_PROPERTY_DESCRIPTOR](current, key);
      if (descriptor && !descriptor.configurable && !descriptor.writable) return value;
      return canObserve(value) ? state(value) : value;
    },
    has(current, key) {
      track(current, key);
      return ReflectApi.has(current, key);
    },
    set(current, key, incoming, receiver) {
      const value = toRaw(incoming);
      const hadKey = ObjectConstructor.prototype.hasOwnProperty.call(current, key);
      const previous = ReflectApi.get(current, key, receiver);
      if (ObjectConstructor.is(toRaw(previous), value)) return true;
      settingDepth++;
      let succeeded;
      try {
        succeeded = ReflectApi.set(current, key, value, receiver);
      } finally {
        settingDepth--;
      }
      if (succeeded)
        trigger(current, key, hadKey ? "set" : "add", value, previous);
      return succeeded;
    },
    defineProperty(current, key, descriptor) {
      if (settingDepth) return ReflectApi.defineProperty(current, key, descriptor);
      const previous = ReflectApi[GET_OWN_PROPERTY_DESCRIPTOR](current, key);
      const nextDescriptor = { ...descriptor };
      if ("value" in nextDescriptor) nextDescriptor.value = toRaw(nextDescriptor.value);
      const succeeded = ReflectApi.defineProperty(current, key, nextDescriptor);
      if (!succeeded) return succeeded;
      const next = ReflectApi[GET_OWN_PROPERTY_DESCRIPTOR](current, key);
      const type = previous ? "set" : "add";
      const changed = !previous || !next || !ObjectConstructor.is(toRaw(previous.value), toRaw(next.value)) || previous.enumerable !== next.enumerable || previous.configurable !== next.configurable || previous.writable !== next.writable;
      if (changed) trigger(current, key, type, next == null ? void 0 : next.value, previous == null ? void 0 : previous.value);
      return succeeded;
    },
    deleteProperty(current, key) {
      const hadKey = ObjectConstructor.prototype.hasOwnProperty.call(current, key);
      const succeeded = ReflectApi.deleteProperty(current, key);
      if (succeeded && hadKey) trigger(current, key, "delete");
      return succeeded;
    },
    ownKeys(current) {
      track(current, ITERATE);
      return ownKeys(current);
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
      if (ObjectConstructor.is(toRaw(value), toRaw(next))) return;
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
//# sourceMappingURL=state-1Xtmucgt.js.map
