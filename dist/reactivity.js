import { e as effect } from "./effect-B76KDYNZ.js";
import { b, f, a, h, o } from "./effect-B76KDYNZ.js";
import { t as trigger, a as track, b as signal } from "./state-Di8MyBwM.js";
import { s } from "./state-Di8MyBwM.js";
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
  f as createScope,
  effect,
  a as getCurrentScope,
  h as onCleanup,
  o as onDispose,
  persist,
  resource,
  signal,
  s as state
};
//# sourceMappingURL=reactivity.js.map
