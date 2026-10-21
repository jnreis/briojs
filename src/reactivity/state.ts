import {
    isObjectType, isString, objectConstructor, ReflectApi, isFunction, isArray, createTypeError, ownKeys, getLength,
    GET_OWN_PROPERTY_DESCRIPTOR,
} from '../core/native';
import { batch, enterBatch, leaveBatch, getActiveEffect, queueEffect } from './effect';
import type { ReactiveEffect } from './effect';
import type { Signal } from './types';

const targetMap = new WeakMap<object, Map<PropertyKey, Set<ReactiveEffect>>>();
const proxyCache = new WeakMap<object, object>();
const rawCache = new WeakMap<object, object>();
const ITERATE = Symbol('brio.iterate');
const arrayMutators = new Set<PropertyKey>([
    'copyWithin', 'fill', 'pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift',
]);
const arrayMethodCache = new WeakMap<object, Map<PropertyKey, Function>>();
let settingDepth = 0;

export const isObject = (value: unknown): value is Record<PropertyKey, unknown> =>
    value !== null && isObjectType(value);

export const toRaw = <T>(value: T): T => {
    if (!isObject(value)) return value;
    return (rawCache.get(value) as T | undefined) ?? value;
};

export const track = (target: object, key: PropertyKey) => {
    const activeEffect = getActiveEffect();
    if (!activeEffect?.active) return;
    let dependencies = targetMap.get(target);
    if (!dependencies) targetMap.set(target, dependencies = new Map());
    let effects = dependencies.get(key);
    if (!effects) dependencies.set(key, effects = new Set());
    if (effects.has(activeEffect)) return;
    effects.add(activeEffect);
    activeEffect.deps.push(effects);
};

const isArrayIndex = (key: PropertyKey): boolean =>
    isString(key) && /^(0|[1-9]\d*)$/.test(key) && Number(key) < 4294967295;

const queueDependency = (dependency: Set<ReactiveEffect> | undefined, activeEffect: ReactiveEffect | undefined) => {
    if (dependency) for (const eff of dependency) if (eff !== activeEffect) queueEffect(eff);
};

export const trigger = (
    target: object,
    key: PropertyKey,
    type: 'set' | 'add' | 'delete',
    newValue?: unknown,
    oldValue?: unknown,
) => {
    const dependencies = targetMap.get(target);
    if (!dependencies) return;
    const activeEffect = getActiveEffect();
    // Invalidate every computed before any effect re-runs, so no effect observes a half-updated graph.
    enterBatch();
    try {
        queueDependency(dependencies.get(key), activeEffect);
        if (type !== 'set') queueDependency(dependencies.get(ITERATE), activeEffect);
        if (isArray(target) && key === 'length') {
            // Growing an array never changes existing indexes; only a shrink removes tracked ones.
            const length = Number(newValue);
            if (!(Number(oldValue) <= length)) {
                for (const [dependencyKey, dependency] of dependencies)
                    if (isArrayIndex(dependencyKey) && Number(dependencyKey) >= length)
                        queueDependency(dependency, activeEffect);
            }
        } else if (isArray(target) && type === 'add' && isArrayIndex(key)) {
            queueDependency(dependencies.get('length'), activeEffect);
        }
    } finally {
        leaveBatch();
    }
};

// First index a mutator can change, so push/pop/splice diff only their affected tail.
const firstChangedIndex = (key: PropertyKey, target: unknown[], args: unknown[]): number => {
    const length = getLength(target);
    if (key === 'push') return length;
    if (key === 'pop') return length ? length - 1 : 0;
    if (key !== 'splice') return 0;
    if (!getLength(args)) return length;
    const relative = Math.trunc(Number(args[0])) || 0;
    return relative < 0 ? Math.max(length + relative, 0) : Math.min(relative, length);
};

// Array mutators run on the raw array; one diff then triggers just the indexes that changed.
const triggerArrayChanges = (target: unknown[], before: unknown[], from: number, oldLength: number) => {
    const dependencies = targetMap.get(target);
    if (!dependencies) return;
    const activeEffect = getActiveEffect();
    const newLength = getLength(target);
    enterBatch();
    try {
        for (let index = from, end = oldLength > newLength ? oldLength : newLength; index < end; index++) {
            const previous = index - from;
            if (!objectConstructor.is(before[previous], target[index]) || (previous in before) !== (index in target))
                queueDependency(dependencies.get(String(index)), activeEffect);
        }
        if (oldLength !== newLength) {
            queueDependency(dependencies.get('length'), activeEffect);
            queueDependency(dependencies.get(ITERATE), activeEffect);
        }
    } finally {
        leaveBatch();
    }
};

const observe = (value: unknown): unknown => isObject(value) && canObserve(value) ? state(value) : value;

export const canObserve = (value: object): boolean => {
    if (isArray(value)) return true;
    const prototype = objectConstructor.getPrototypeOf(value);
    return prototype === objectConstructor.prototype || prototype === null;
};

export function state<T extends object>(target: T): T {
    if (!isObject(target)) throw createTypeError('Brio state() requires a plain object or array.');
    if (!canObserve(target)) throw createTypeError('Brio state() only observes plain objects and arrays.');
    const raw = toRaw(target);
    const existing = proxyCache.get(raw);
    if (existing) return existing as T;

    const proxy = new Proxy(raw, {
        get(current, key, receiver) {
            track(current, key);
            const value = ReflectApi.get(current, key, receiver);
            if (isFunction(value)) {
                if (!isArray(current) || !arrayMutators.has(key)) return value;
                let methods = arrayMethodCache.get(current);
                if (!methods) arrayMethodCache.set(current, methods = new Map());
                let method = methods.get(key);
                if (!method) {
                    method = (...args: unknown[]) => batch(() => {
                        const oldLength = getLength(current);
                        const from = firstChangedIndex(key, current, args);
                        const before = current.slice(from);
                        const comparator = args[0];
                        const input = key === 'sort'
                            ? (isFunction(comparator) ? [(a: unknown, b: unknown) => comparator(observe(a), observe(b))] : args)
                            : args.map(toRaw);
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
            const hadKey = objectConstructor.prototype.hasOwnProperty.call(current, key);
            const previous = ReflectApi.get(current, key, receiver);
            if (objectConstructor.is(toRaw(previous), value)) return true;
            settingDepth++;
            let succeeded: boolean;
            try {
                succeeded = ReflectApi.set(current, key, value, receiver);
            } finally {
                settingDepth--;
            }
            if (succeeded)
                trigger(current, key, hadKey ? 'set' : 'add', value, previous);
            return succeeded;
        },
        defineProperty(current, key, descriptor) {
            // Inner define from our own set trap: the value is already raw and set() triggers afterwards.
            if (settingDepth) return ReflectApi.defineProperty(current, key, descriptor);
            const previous = ReflectApi[GET_OWN_PROPERTY_DESCRIPTOR](current, key);
            const nextDescriptor = { ...descriptor };
            if ('value' in nextDescriptor) nextDescriptor.value = toRaw(nextDescriptor.value);
            const succeeded = ReflectApi.defineProperty(current, key, nextDescriptor);
            if (!succeeded) return succeeded;
            const next = ReflectApi[GET_OWN_PROPERTY_DESCRIPTOR](current, key);
            const type = previous ? 'set' : 'add';
            const changed = !previous || !next ||
                !objectConstructor.is(toRaw(previous.value), toRaw(next.value)) ||
                previous.enumerable !== next.enumerable ||
                previous.configurable !== next.configurable ||
                previous.writable !== next.writable;
            if (changed) trigger(current, key, type, next?.value, previous?.value);
            return succeeded;
        },
        deleteProperty(current, key) {
            const hadKey = objectConstructor.prototype.hasOwnProperty.call(current, key);
            const succeeded = ReflectApi.deleteProperty(current, key);
            if (succeeded && hadKey) trigger(current, key, 'delete');
            return succeeded;
        },
        ownKeys(current) {
            track(current, ITERATE);
            return ownKeys(current);
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
            if (objectConstructor.is(toRaw(value), toRaw(next))) return;
            value = next;
            trigger(holder, 'value', 'set');
        },
    };
}
