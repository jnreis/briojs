import { c as createTypeError, b as createError, i as isFunction, f as isObjectType, k as isArray, o as objectConstructor, g as getLength, q as objectKeys } from "./native-CjaBWh7p.js";
import { a as addEventListener, r as removeEventListener } from "./native-Di2Lf1wo.js";
import { h as getCurrentScope, e as effect, j as onCleanup, c as causedError, b as batch } from "./effect-CdkoKvuz.js";
import { s as state, b as signal } from "./state-C_G-YNBL.js";
const isPlainContainer = (value) => {
  if (value === null || !isObjectType(value)) return false;
  if (isArray(value)) return true;
  const prototype = objectConstructor.getPrototypeOf(value);
  return prototype === objectConstructor.prototype || prototype === null;
};
const resolveStorage = (selection) => {
  if (selection && isObjectType(selection)) return selection;
  const storage = selection === "session" ? globalThis.sessionStorage : globalThis.localStorage;
  if (!storage) throw createError("Web Storage is not available in this environment.");
  return storage;
};
const readInitial = (storage, key, fallback) => {
  const stored = storage.getItem(key);
  if (stored === null) return fallback;
  try {
    return JSON.parse(stored);
  } catch (error) {
    throw causedError(`Unable to read persisted Brio state for key "${key}".`, error);
  }
};
function persist(key, initialValue, options = {}) {
  if (!key.trim()) throw createTypeError("A non-empty persistence key is required.");
  if (!getCurrentScope())
    throw createError("persist() must be called inside an app, component setup, or explicit reactive scope.");
  const storage = resolveStorage(options.storage);
  const initial = readInitial(storage, key, initialValue);
  const objectBacked = isPlainContainer(initial);
  const value = objectBacked ? state(initial) : signal(initial);
  let applyingRemoteUpdate = false;
  const encode = () => {
    const current = objectBacked ? value : value.value;
    const serialized = JSON.stringify(current);
    if (serialized === void 0)
      throw createTypeError(`Brio state for key "${key}" cannot be serialized as JSON.`);
    if (!applyingRemoteUpdate) storage.setItem(key, serialized);
  };
  const stop = effect(encode);
  const listener = (event) => {
    if (event.key !== key || event.storageArea && event.storageArea !== storage) return;
    let next;
    try {
      next = event.newValue === null ? initialValue : JSON.parse(event.newValue);
    } catch (error) {
      return;
    }
    applyingRemoteUpdate = true;
    try {
      batch(() => {
        if (objectBacked && isPlainContainer(next)) {
          if (isArray(value)) {
            if (isArray(next)) value.splice(0, getLength(value), ...next);
          } else if (!isArray(next)) {
            const target = value;
            for (const prop of objectKeys(target)) {
              if (!(prop in next)) delete target[prop];
            }
            objectConstructor.assign(target, next);
          }
        } else if (!objectBacked) {
          value.value = next;
        }
      });
    } finally {
      applyingRemoteUpdate = false;
    }
  };
  if (typeof window !== "undefined" && isFunction(window.addEventListener)) {
    addEventListener(window, "storage", listener);
    onCleanup(() => {
      removeEventListener(window, "storage", listener);
      stop();
    });
  } else {
    onCleanup(stop);
  }
  return value;
}
export {
  persist
};
//# sourceMappingURL=persistence-entry.js.map
