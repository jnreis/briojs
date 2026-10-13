import { e as effect } from "./effect-DZvu7u5S.js";
import { b, a, k, o, j } from "./effect-DZvu7u5S.js";
import { t as trigger, b as track, a as signal } from "./state-v4-UFBFm952.js";
import { s } from "./state-v4-UFBFm952.js";
import { persist } from "./persistence-entry.js";
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
function resource(fetcher) {
  const data = signal(void 0);
  const loading = signal(true);
  const error = signal(void 0);
  const run = async () => {
    loading.value = true;
    error.value = void 0;
    try {
      data.value = await fetcher();
    } catch (err) {
      error.value = err;
    } finally {
      loading.value = false;
    }
  };
  effect(() => {
    run();
  });
  return {
    data,
    loading,
    error,
    refetch: run
  };
}
export {
  b as batch,
  computed,
  a as createScope,
  effect,
  k as getCurrentScope,
  o as onCleanup,
  j as onDispose,
  persist,
  resource,
  signal,
  s as state
};
//# sourceMappingURL=reactivity.js.map
