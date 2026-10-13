import { combinedError } from './errors';
import { notifyEffectCreated, notifyEffectDisposed } from './devtools-bridge';

export type Stop = (() => void) & { readonly active: boolean; run(): unknown };
export type Signal<T> = { value: T };

export type Scope = {
    run<T>(fn: () => T): T;
    dispose(): void;
    readonly disposed: boolean;
};

export type EffectOptions = {
    lazy?: boolean;
    scheduler?: () => void;
};

type ReactiveEffect = {
    fn: () => unknown;
    scheduler?: () => void;
    scope?: Scope;
    deps: Set<ReactiveEffect>[];
    active: boolean;
    running: boolean;
    devtoolsTracked: boolean;
};

const targetMap = new WeakMap<object, Map<PropertyKey, Set<ReactiveEffect>>>();
const proxyCache = new WeakMap<object, object>();
const rawCache = new WeakMap<object, object>();
const ITERATE = Symbol('brio.iterate');
const arrayMutators = new Set<PropertyKey>([
    'copyWithin', 'fill', 'pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift',
]);
const arrayMethodCache = new WeakMap<object, Map<PropertyKey, Function>>();
let activeEffect: ReactiveEffect | undefined;
let activeScope: Scope | undefined;
let settingDepth = 0;
let batchDepth = 0;
const queuedEffects = new Set<ReactiveEffect>();

const isObject = (value: unknown): value is Record<PropertyKey, unknown> =>
    value !== null && typeof value === 'object';

const toRaw = <T>(value: T): T => {
    if (!isObject(value)) return value;
    return (rawCache.get(value) as T | undefined) ?? value;
};

const cleanupEffect = (effect: ReactiveEffect) => {
    for (const dep of effect.deps) dep.delete(effect);
    effect.deps.length = 0;
};

const runEffect = (effect: ReactiveEffect): unknown => {
    if (!effect.active) return;
    if (effect.running) return;
    cleanupEffect(effect);
    const previous = activeEffect;
    const previousScope = activeScope;
    activeEffect = effect;
    if (effect.scope) activeScope = effect.scope;
    effect.running = true;
    try {
        return effect.fn();
    } finally {
        effect.running = false;
        activeEffect = previous;
        activeScope = previousScope;
    }
};

const track = (target: object, key: PropertyKey) => {
    if (!activeEffect?.active) return;
    let dependencies = targetMap.get(target);
    if (!dependencies) targetMap.set(target, dependencies = new Map());
    let effects = dependencies.get(key);
    if (!effects) dependencies.set(key, effects = new Set());
    if (effects.has(activeEffect)) return;
    effects.add(activeEffect);
    activeEffect.deps.push(effects);
};

const flushEffects = () => {
    const errors: unknown[] = [];
    while (queuedEffects.size) {
        const current = [...queuedEffects];
        queuedEffects.clear();
        for (const effect of current) {
            try {
                if (effect.active) effect.scheduler ? effect.scheduler() : runEffect(effect);
            } catch (error) {
                errors.push(error);
            }
        }
    }
    if (errors.length) throw combinedError('One or more reactive effects failed.', errors);
};

const trigger = (target: object, key: PropertyKey, type: 'set' | 'add' | 'delete', newValue?: unknown) => {
    const dependencies = targetMap.get(target);
    if (!dependencies) return;
    const effects = new Set<ReactiveEffect>();
    const add = (dep?: Set<ReactiveEffect>) => dep?.forEach(effect => {
        if (effect !== activeEffect) effects.add(effect);
    });

    add(dependencies.get(key));
    if (type !== 'set') add(dependencies.get(ITERATE));
    if (Array.isArray(target) && key === 'length') {
        for (const [depKey, dep] of dependencies) {
            if (typeof depKey === 'string' && /^(0|[1-9]\d*)$/.test(depKey) && Number(depKey) >= Number(newValue))
                add(dep);
        }
    } else if (Array.isArray(target) && type === 'add' && isArrayIndex(key)) {
        add(dependencies.get('length'));
    }

    effects.forEach(effect => queuedEffects.add(effect));
    if (!batchDepth) flushEffects();
};

const isArrayIndex = (key: PropertyKey): boolean =>
    typeof key === 'string' && /^(0|[1-9]\d*)$/.test(key) && Number(key) < 4294967295;

const canObserve = (value: object): boolean => {
    if (Array.isArray(value)) return true;
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
};

export function state<T extends object>(target: T): T {
    if (!isObject(target)) throw new TypeError('Brio state() requires a plain object or array.');
    if (!canObserve(target)) throw new TypeError('Brio state() only observes plain objects and arrays.');
    const raw = toRaw(target);
    const existing = proxyCache.get(raw);
    if (existing) return existing as T;

    const proxy = new Proxy(raw, {
        get(current, key, receiver) {
            if (key === Symbol.for('brio.raw')) return current;
            track(current, key);
            const value = Reflect.get(current, key, receiver);
            const descriptor = Reflect.getOwnPropertyDescriptor(current, key);
            if (descriptor && !descriptor.configurable && !descriptor.writable && isObject(value))
                return value;
            if (Array.isArray(current) && arrayMutators.has(key) && typeof value === 'function') {
                let methods = arrayMethodCache.get(current);
                if (!methods) arrayMethodCache.set(current, methods = new Map());
                let method = methods.get(key);
                if (!method) {
                    method = (...args: unknown[]) => batch(() =>
                        Reflect.apply(value, receiver, args));
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
            let succeeded: boolean;
            try {
                succeeded = Reflect.set(current, key, value, receiver);
            } finally {
                settingDepth--;
            }
            if (succeeded)
                trigger(current, key, hadKey ? 'set' : 'add', value);
            return succeeded;
        },
        defineProperty(current, key, descriptor) {
            const previous = Reflect.getOwnPropertyDescriptor(current, key);
            const nextDescriptor = { ...descriptor };
            if ('value' in nextDescriptor) nextDescriptor.value = toRaw(nextDescriptor.value);
            const succeeded = Reflect.defineProperty(current, key, nextDescriptor);
            if (!succeeded || settingDepth) return succeeded;
            const next = Reflect.getOwnPropertyDescriptor(current, key);
            const type = previous ? 'set' : 'add';
            const changed = !previous || !next ||
                !Object.is(toRaw(previous.value), toRaw(next.value)) ||
                previous.enumerable !== next.enumerable ||
                previous.configurable !== next.configurable ||
                previous.writable !== next.writable;
            if (changed) trigger(current, key, type, next?.value);
            return succeeded;
        },
        deleteProperty(current, key) {
            const hadKey = Object.prototype.hasOwnProperty.call(current, key);
            const succeeded = Reflect.deleteProperty(current, key);
            if (succeeded && hadKey) trigger(current, key, 'delete');
            return succeeded;
        },
        ownKeys(current) {
            track(current, ITERATE);
            return Reflect.ownKeys(current);
        },
    }) as T;
    const cached = proxy as unknown as object;
    proxyCache.set(raw, proxy);
    rawCache.set(cached, raw);
    return proxy as T;
}

export function signal<T>(initialValue: T): Signal<T> {
    let value = initialValue;
    const holder = {};
    return {
        get value() {
            track(holder, 'value');
            return isObject(value) && canObserve(value) ? state(value) : value;
        },
        set value(next: T) {
            if (Object.is(toRaw(value), toRaw(next))) return;
            value = next;
            trigger(holder, 'value', 'set');
        },
    };
}

export function effect<T>(fn: () => T, options: EffectOptions = {}): Stop {
    const reactiveEffect: ReactiveEffect = {
        fn,
        scheduler: options.scheduler,
        scope: activeScope,
        deps: [],
        active: true,
        running: false,
        devtoolsTracked: false,
    };
    const stop = (() => {
        if (!reactiveEffect.active) return;
        reactiveEffect.active = false;
        cleanupEffect(reactiveEffect);
        notifyEffectDisposed(reactiveEffect.devtoolsTracked);
    }) as Stop;
    Object.defineProperty(stop, 'active', { get: () => reactiveEffect.active });
    stop.run = () => runEffect(reactiveEffect);
    if (activeScope) onDispose(activeScope, stop);
    reactiveEffect.devtoolsTracked = notifyEffectCreated();
    if (!options.lazy) {
        try {
            runEffect(reactiveEffect);
        } catch (error) {
            stop();
            throw error;
        }
    }
    return stop;
}

export function computed<T>(getter: () => T) {
    let dirty = true;
    let cachedValue: T;
    const holder = {};
    const runner = effect(getter, {
        lazy: true,
        scheduler: () => {
            if (!dirty) {
                dirty = true;
                trigger(holder, 'value', 'set');
            }
        },
    });
    const dispose = () => {
        if (!runner.active) return;
        runner();
    };
    return {
        get value(): T {
            if (!runner.active) throw new Error('Cannot read a disposed Brio computed value.');
            track(holder, 'value');
            if (dirty) {
                cachedValue = runner.run() as T;
                dirty = false;
            }
            return cachedValue;
        },
        dispose,
    };
}

export function batch<T>(fn: () => T): T {
    batchDepth++;
    let result!: T;
    let failure: unknown;
    let failed = false;
    try {
        result = fn();
    } catch (error) {
        failure = error;
        failed = true;
    }
    batchDepth--;
    if (!batchDepth) {
        try {
            flushEffects();
        } catch (error) {
            if (failed)
                throw combinedError('A Brio batch operation and its reactive effects failed.', [failure, error]);
            throw error;
        }
    }
    if (failed) throw failure;
    return result;
}

export function createScope(parent: Scope | undefined = activeScope): Scope {
    let disposed = false;
    const cleanups = new Set<() => void>();
    let detachFromParent: (() => void) | undefined;
    const scope: Scope = {
        get disposed() {
            return disposed;
        },
        run<T>(fn: () => T): T {
            if (disposed) throw new Error('Cannot run a disposed Brio scope.');
            const previous = activeScope;
            activeScope = scope;
            try {
                return fn();
            } finally {
                activeScope = previous;
            }
        },
        dispose() {
            if (disposed) return;
            disposed = true;
            detachFromParent?.();
            const errors: unknown[] = [];
            for (const cleanup of [...cleanups]) {
                try {
                    cleanup();
                } catch (error) {
                    errors.push(error);
                }
            }
            cleanups.clear();
            if (errors.length) throw combinedError('One or more Brio scope cleanups failed.', errors);
        },
    };
    scopeCleanups.set(scope, cleanups);
    if (parent) detachFromParent = onDispose(parent, () => scope.dispose());
    return scope;
}

export function onDispose(scope: Scope | undefined, cleanup: () => void): () => void {
    if (!scope) return () => {};
    if (scope.disposed) {
        cleanup();
        return () => {};
    }
    const originalCleanup = cleanup;
    let active = true;
    const wrapped = () => {
        if (!active) return;
        active = false;
        scopeCleanups.get(scope)?.delete(wrapped);
        originalCleanup();
    };
    scopeCleanups.get(scope)?.add(wrapped);
    return wrapped;
}

const scopeCleanups = new WeakMap<Scope, Set<() => void>>();

export function onCleanup(cleanup: () => void): () => void {
    if (!activeScope) throw new Error('This operation requires an active Brio scope.');
    return onDispose(activeScope, cleanup);
}

export function getCurrentScope(): Scope | undefined {
    return activeScope;
}
