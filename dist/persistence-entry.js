import { d as getCurrentScope, e as effect, f as onCleanup, c as causedError, b as batch } from "./effect-DGhE0oQi.js";
import { s as state, b as signal } from "./state-CLBlAcxj.js";
const isPlainContainer = (value) => {
  if (value === null || typeof value !== "object") return false;
  if (Array.isArray(value)) return true;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};
const resolveStorage = (selection) => {
  if (selection && typeof selection === "object") return selection;
  const storage = selection === "session" ? globalThis.sessionStorage : globalThis.localStorage;
  if (!storage) throw new Error("Web Storage is not available in this environment.");
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
  if (!key.trim()) throw new TypeError("A non-empty persistence key is required.");
  if (!getCurrentScope())
    throw new Error("persist() must be called inside an app, component setup, or explicit reactive scope.");
  const storage = resolveStorage(options.storage);
  const initial = readInitial(storage, key, initialValue);
  const objectBacked = isPlainContainer(initial);
  const value = objectBacked ? state(initial) : signal(initial);
  let applyingRemoteUpdate = false;
  const encode = () => {
    if (applyingRemoteUpdate) return;
    const current = objectBacked ? value : value.value;
    const serialized = JSON.stringify(current);
    if (serialized === void 0)
      throw new TypeError(`Brio state for key "${key}" cannot be serialized as JSON.`);
    storage.setItem(key, serialized);
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
          const target = value;
          for (const prop of Object.keys(target)) {
            if (!(prop in next)) delete target[prop];
          }
          Object.assign(target, next);
        } else if (!objectBacked) {
          value.value = next;
        }
      });
    } finally {
      applyingRemoteUpdate = false;
    }
  };
  if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
    window.addEventListener("storage", listener);
    onCleanup(() => {
      window.removeEventListener("storage", listener);
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
