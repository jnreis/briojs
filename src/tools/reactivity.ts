// reactivity.js
let activeEffect: ReactiveEffect | null = null;
let activeEffectRefs: Map<any, string | symbol> = new Map();
const effectStack: ReactiveEffect[] = [];
const initStack: WeakSet<Function> = new WeakSet();
const targetMap: WeakMap<any, Map<string | symbol, Set<ReactiveEffect>>> = new WeakMap();
const proxyMap: WeakMap<any, any> = new WeakMap();

// Global graph mapping child proxies back to their parent target and key
const parentMap: WeakMap<any, Map<any, Set<string | symbol>>> = new WeakMap();

console.log('Initialized Reactivity System', { activeEffect, effectStack, initStack, targetMap, proxyMap, parentMap });

/**
 * Reactive Effect Class
 */
export class ReactiveEffect {
  fn: Function;
  scheduler: Function | null;
  deps: Set<ReactiveEffect>[];
  active: boolean;

  constructor(fn: Function, scheduler: Function | null = null) {
    this.fn = fn;
    this.scheduler = scheduler; // Custom callbacks (like watch jobs) go here
    this.deps = [];
    this.active = true;
  }

  run() {
    if (!this.active) {
      return this.fn();
    }

    // console.warn(
    //   `[Effect] Running effect:`, this.fn, 
    //   `\nScheduler:`, this.scheduler, 
    //   `\nCurrent activeEffect:`, activeEffect, 
    //   `\nEffect stack:`, effectStack.length
    // );
    
    if (!effectStack.includes(this)) {
      cleanupEffect(this);
      try {
        effectStack.push(this);
        activeEffect = this;
        return this.fn();
      } finally {
        console.warn(
          `[Effect] Finished effect:`, this.fn, 
          `\nRefs tracked:`, [...activeEffectRefs]
        );
        activeEffectRefs.clear();
        effectStack.pop();
        activeEffect = effectStack[effectStack.length - 1] || null;
      }
    }
  }

  stop() {
    if (this.active) {
      cleanupEffect(this);
      this.active = false;
    }
  }
}

function cleanupEffect(effect: ReactiveEffect) {
  const { deps } = effect;
  if (deps.length) {
    for (let i = 0; i < deps.length; i++) {
      deps[i].delete(effect);
    }
    deps.length = 0;
  }
}

/**
 * Track & Trigger
 */
export function track(target: any, key: string | symbol) {

  // console.warn(`[Track] Accessed property: ${String(key)}\nTarget:`, target, `\ndepsMap:`, targetMap.get(target), `\nactiveEffect:`, activeEffect);

  // If there is no active effect, do nothing
  if (!activeEffect) return;

  // Get the dependencies map for the target object, or create it if it doesn't exist
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }

  // Get the dependency set for the specific property, or create it if it doesn't exist
  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }

  // Add the active effect to the dependency set if it's not already there
  if (!dep.has(activeEffect)) {
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
  }

  activeEffectRefs.set(target, key);

  // console.error(`[Track] Tracking property: ${String(key)}\nTarget:`, target, `\ndepsMap:`, targetMap.get(target), `\nactiveEffect:`, activeEffect);
}

export function trigger(target: any, key: string | symbol) {

  getEffects(target, key).forEach((effect: ReactiveEffect) => {
    if (effect.scheduler) {
      effect.scheduler(); // If it's a watcher or computed property, let its handler decide how to execute
    } else {
      effect.run();       // Normal template/rendering effect
    }
  });
}

function getEffects(target: any, key: string | symbol) {

  let effects: Set<ReactiveEffect> = new Set();

  // First, find effects directly tied to this property
  const depsMap = targetMap.get(target);
  if (depsMap) {
    const dep = depsMap.get(key);
    if (dep) {
      // Create a static copy to prevent infinite loops during cleanups/re-runs
      effects = new Set(dep);
    }
  }

  // Find who owns this target in the reactive tree
  const parentTargets = parentMap.get(target);

  if (parentTargets/* && Array.isArray(target)*/) {
    for (let [parentTarget, parentKeys] of parentTargets) {
      // For each parent key that points to this child, add the parent and key to the set of parents to trigger
      for (let parentKey of parentKeys) {
        const depsMap = targetMap.get(parentTarget);
        if (depsMap) {
          const dep = depsMap.get(parentKey);
          if (dep) {
            dep.forEach((effect: ReactiveEffect) => effects.add(effect));
          }
        }
      }
    }
  }

  console.warn(`[Trigger] Triggering effects for property: ${String(key)}\nTarget:`, target, `\ndepsMap:`, targetMap.get(target), `\nactiveEffect:`, activeEffect, `\nEffects to run:`, effects);

  return effects;
}

/**
 * Proxy Factory (Lazy Evaluation)
 */
export function reactive(target: any) {
  if (typeof target !== 'object' || target === null) {
    return target;
  }

  if (proxyMap.has(target)) {
    return proxyMap.get(target);
  }

  const handlers = {
    get(target: any, key: string | symbol, receiver: any) {

      // Look up your global init tracker
      if (typeof target[key] === 'function' && initStack.has(target[key])) {

        // Execute the initializer to attach the real ComputedRefImpl
        target[key](target, key);
      }

      // Track the property access for reactivity
      track(target, key);

      // // 
      // if (Array.isArray(target[key])) {
      //   // console.warn(`[Reactive] Accessed array property: ${String(key)}. Tracking its length for reactivity.`, target[key], targetMap.get(target), activeEffect);
      //   track(target[key], 'length');
      // }

      // // If we are reading an array, make sure we also track its length 
      // // so mutations to the array size wake up downstream effects
      // if (Array.isArray(target) && key === 'length') {
      //   track(target, 'length');
      // }

      // console.log(`[Reactive] Get property: ${String(key)}\nTarget:`, target, `\ndepsMap:`, targetMap.get(target), `\nactiveEffect:`, activeEffect);

      // Get the property value using Reflect to ensure correct behavior with getters/setters and prototype chains
      const res = Reflect.get(target, key, receiver);

      // If the result is an object, make it reactive as well (deep reactivity)
      if (typeof res === 'object' && res !== null) {

        const childTarget = res; // Raw object/array underneath

        let parents = parentMap.get(childTarget);
        if (!parents) {
          parentMap.set(childTarget, (parents = new Map()));
        }

        // Save the structural link: this child belongs to this parent's key
        parents.set(target, (parents.get(target) || new Set()).add(key));

        // console.warn(`[Reactive] Nested object accessed: ${String(key)}. Making it reactive.`, res, targetMap.get(res), activeEffect);
        return reactive(res);
      }

      return res;
    },

    set(target: any, key: string | symbol, value: any, receiver: any) {

      // Get the old value to compare against for change detection
      const oldValue = target[key];

      // // Check if the property already exists to determine if this is an addition or an update (important for triggering)
      // const hadKey = Array.isArray(target)
      //   ? Number(key) < target.length
      //   : Object.prototype.hasOwnProperty.call(target, key);

      // Set the property value using Reflect to ensure correct behavior with setters and prototype chains
      const result = Reflect.set(target, key, value, receiver);

      console.error(`[Reactive] Set property: ${String(key)}\nTarget:`, target, `\nOld Value:`, oldValue, `\nNew Value:`, value);

      // Only trigger if the value actually changed
      if (oldValue !== value) {
        // console.warn(`[Reactive] Set property: ${String(key)}\nTarget:`, target, `\nOld Value:`, oldValue, `\nNew Value:`, value, `\ndepsMap:`, targetMap.get(target), `\nactiveEffect:`, activeEffect);
        trigger(target, key);
      }

      return result;
    },
    deleteProperty(target: any, key: string | symbol) {

      // Check if the property exists before deletion to determine if we should trigger
      const hadKey = Object.prototype.hasOwnProperty.call(target, key);

      // Delete the property using Reflect to ensure correct behavior with prototype chains
      const result = Reflect.deleteProperty(target, key);

      // Only trigger if the property was successfully deleted and it existed before
      if (hadKey && result) {
        trigger(target, key);
        // triggerParent(target);
      }

      return result;
    }
  };

  // Create the proxy object with the defined handlers
  const proxy = new Proxy(target, handlers);

  // Cache the proxy to ensure the same object is only wrapped once and to allow identity checks to work correctly
  proxyMap.set(target, proxy);

  return proxy;
}

export function computed(getter: Function) {
  
  let init = (target: any, key: string | symbol) => {
    let cachedValue: any;
    let isManualValue = false;

    const job = () => {
      // If a developer manually overwrote this property, stop auto-computing it
      if (isManualValue) return;

      const newValue = effect.run();
      if (cachedValue !== newValue) {
        cachedValue = newValue;
        // Trigger updates to notify any outer watchers tracking state.fullName
        trigger(target, key); 
      }
    };

    const effect = new ReactiveEffect(getter, job);

    // Initial calculation to cache the baseline
    cachedValue = effect.run();

    // Define the property descriptor on the target object
    Object.defineProperty(target, key, {
      get() {
        return cachedValue;
      },
      set(newValue) {
        // Flag that the user has intentionally broken the computed bond
        isManualValue = true;

        if (cachedValue !== newValue) {
          cachedValue = newValue;

          // Notify watchers of the manual rewrite
          trigger(target, key);
        }

        // Stop the effect from auto-updating since the user has taken control
        effect.stop();

        // Clean up the init function from the stack since this property is now manually controlled
        initStack.delete(init);
      },
      enumerable: true,
      configurable: true
    });
  };

  initStack.add(init);

  return init;
}

/**
 * Watchers
 */
export function watch(getter: any, cb: Function) {

  // let getter: Function;

  // // If the source is a function, use it directly as the getter
  // if (typeof source === 'function') {
  //   getter = source;
  // }
  // else if (Array.isArray(source)) {
  //   getter = () => source.length
  // }
  // // If the source is a reactive object, create a getter that accesses all its properties to collect dependencies
  // else if (typeof source === 'object' && source !== null) {
  //   getter = () => {
  //     for (let key in source) {
  //       // if (Object.prototype.hasOwnProperty.call(source, key)) {
  //         source[key]; // Access each property to track it
  //       // }
  //     }
  //   }
  // }

  let oldValue: any;

  const job = () => {
    // Re-run the effect to get the new value
    let newValue = effect.run();

    // console.log(`[WATCHER] Effect re-run!`, `\nNew Value:`, newValue, `\nOld Value:`, oldValue);

    // Only call the callback if the value has changed
    // This handles cases where the value actually changed and cases where the change was bubbled up from a nested object
    if (newValue !== oldValue || (typeof newValue === 'object' && newValue !== null && newValue === oldValue)) {

      // Invoke the callback with the new and old values
      cb(newValue, oldValue);

      // Update oldValue for the next run
      oldValue = newValue;
    }
  };

  // Instantiate the effect with our custom runner job as its scheduler
  const effect = new ReactiveEffect(getter, job);

  // Initial read to catch active dependencies
  oldValue = effect.run();

  return () => {
    effect.stop();
  };
}