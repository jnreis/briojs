import { c as createTypeError, e as isObjectType, b as createError, i as isFunction, k as isArray, O as ObjectConstructor, g as getLength, p as objectKeys } from "./native-C6Z9zuZA.js";
import { a as addEventListener, r as removeEventListener } from "./native-BP66_Ihq.js";
import { e as effect, h as getCurrentScope, g as onCleanup, l as causedError, b as batch } from "./effect-alBOOBUf.js";
import { s as state, a as signal } from "./state-D6RTXn8X.js";
const isPlainContainer = (value) => {
  if (value === null || !isObjectType(value)) return false;
  if (isArray(value)) return true;
  const prototype = ObjectConstructor.getPrototypeOf(value);
  return prototype === ObjectConstructor.prototype || prototype === null;
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
            ObjectConstructor.assign(target, next);
          }
        } else if (!objectBacked) {
          value.value = next;
        }
      });
    } finally {
      applyingRemoteUpdate = false;
    }
  };
  const listening = typeof window !== "undefined" && isFunction(window.addEventListener);
  if (listening) addEventListener(window, "storage", listener);
  if (getCurrentScope()) onCleanup(() => {
    if (listening) removeEventListener(window, "storage", listener);
    stop();
  });
  return value;
}
export {
  persist
};
//# sourceMappingURL=persistence-entry.js.map
