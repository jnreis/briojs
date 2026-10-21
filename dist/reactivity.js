import { e as effect, h as createScope, o as onDispose, b as batch } from "./effect-DIImvjBh.js";
import { d, f } from "./effect-DIImvjBh.js";
import { t as trigger, a as track, b as signal } from "./state-gsWplTCq.js";
import { s } from "./state-gsWplTCq.js";
import { b as createError } from "./native-BSek5F0c.js";
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
      if (!runner.active) throw createError("Cannot read a disposed Brio computed value.");
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
  const scope = createScope();
  let current;
  onDispose(scope, () => {
    const pending = current;
    current = void 0;
    pending == null ? void 0 : pending.abort();
    loading.value = false;
  });
  const run = async () => {
    if (scope.disposed) throw createError("Cannot refetch a disposed Brio resource.");
    const previous = current;
    const controller = new AbortController();
    current = controller;
    previous == null ? void 0 : previous.abort();
    if (scope.disposed || current !== controller) return;
    batch(() => {
      loading.value = true;
      error.value = void 0;
    });
    if (scope.disposed || current !== controller) return;
    let value;
    let failure;
    let failed = false;
    try {
      value = await fetcher(controller.signal);
    } catch (err) {
      failed = true;
      failure = err;
    }
    if (scope.disposed || current !== controller) return;
    current = void 0;
    batch(() => {
      if (failed) error.value = failure;
      else data.value = value;
      loading.value = false;
    });
  };
  scope.run(() => {
    effect(() => {
      void run();
    });
  });
  return {
    data,
    loading,
    error,
    refetch: run,
    dispose: () => scope.dispose()
  };
}
export {
  batch,
  computed,
  createScope,
  effect,
  d as getCurrentScope,
  f as onCleanup,
  onDispose,
  persist,
  resource,
  signal,
  s as state
};
//# sourceMappingURL=reactivity.js.map
