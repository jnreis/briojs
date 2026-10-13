import { l as getCurrentScope, s as state, k as signal, e as effect, o as onCleanup, c as causedError, b as batch } from "./reactivity-bRcZEPpQ.js";
import { j, a } from "./reactivity-bRcZEPpQ.js";
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
      throw causedError(`Unable to apply persisted Brio state for key "${key}".`, error);
    }
    applyingRemoteUpdate = true;
    try {
      batch(() => {
        if (!objectBacked) {
          value.value = next;
        } else if (Array.isArray(value) && Array.isArray(next)) {
          const currentArray = value;
          currentArray.splice(0, currentArray.length, ...next);
        } else if (isPlainContainer(value) && isPlainContainer(next) && !Array.isArray(next)) {
          const currentObject = value;
          const nextObject = next;
          for (const prop of Object.keys(currentObject)) {
            if (!Object.prototype.hasOwnProperty.call(nextObject, prop)) delete currentObject[prop];
          }
          Object.assign(currentObject, nextObject);
        } else {
          throw new TypeError(`Persisted value for key "${key}" changed between incompatible shapes.`);
        }
      });
    } finally {
      applyingRemoteUpdate = false;
    }
  };
  if (typeof globalThis.addEventListener === "function")
    globalThis.addEventListener("storage", listener);
  onCleanup(() => {
    stop();
    if (typeof globalThis.removeEventListener === "function")
      globalThis.removeEventListener("storage", listener);
  });
  return value;
}
export {
  batch,
  j as computed,
  a as createScope,
  effect,
  getCurrentScope,
  onCleanup,
  persist,
  signal,
  state
};
//# sourceMappingURL=reactivity.js.map
