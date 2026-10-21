import {
    isObjectType, isString, objectConstructor, ReflectApi, isFunction, isArray, createTypeError, ownKeys,
    GET_OWN_PROPERTY_DESCRIPTOR,
} from '../core/native';
import { batch, getActiveEffect, queueEffect } from './effect';
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

export const trigger = (target: object, key: PropertyKey, type: 'set' | 'add' | 'delete', newValue?: unknown) => {
    const dependencies = targetMap.get(target);
    if (!dependencies) return;
    const effects = new Set<ReactiveEffect>();
    const activeEffect = getActiveEffect();
    const add = (dep?: Set<ReactiveEffect>) => dep?.forEach(eff => {
        if (eff !== activeEffect) effects.add(eff);
    });

    add(dependencies.get(key));
    if (type !== 'set') add(dependencies.get(ITERATE));
    if (isArray(target) && key === 'length') {
        for (const [depKey, dep] of dependencies) {
            if (isString(depKey) && /^(0|[1-9]\d*)$/.test(depKey) && Number(depKey) >= Number(newValue))
                add(dep);
        }
    } else if (isArray(target) && type === 'add' && isArrayIndex(key)) {
        add(dependencies.get('length'));
    }

    // Invalidate every computed before any effect re-runs, so no effect observes a half-updated graph.
    batch(() => effects.forEach(eff => queueEffect(eff)));
};

const isArrayIndex = (key: PropertyKey): boolean =>
    isString(key) && /^(0|[1-9]\d*)$/.test(key) && Number(key) < 4294967295;

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
            const descriptor = ReflectApi[GET_OWN_PROPERTY_DESCRIPTOR](current, key);
            if (descriptor && !descriptor.configurable && !descriptor.writable && isObject(value))
                return value;
            if (isArray(current) && arrayMutators.has(key) && isFunction(value)) {
                let methods = arrayMethodCache.get(current);
                if (!methods) arrayMethodCache.set(current, methods = new Map());
                let method = methods.get(key);
                if (!method) {
                    method = (...args: unknown[]) => batch(() =>
                        ReflectApi.apply(value, receiver, args));
                    methods.set(key, method);
                }
                return method;
            }
            return isObject(value) && canObserve(value) ? state(value) : value;
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
                trigger(current, key, hadKey ? 'set' : 'add', value);
            return succeeded;
        },
        defineProperty(current, key, descriptor) {
            const previous = ReflectApi[GET_OWN_PROPERTY_DESCRIPTOR](current, key);
            const nextDescriptor = { ...descriptor };
            if ('value' in nextDescriptor) nextDescriptor.value = toRaw(nextDescriptor.value);
            const succeeded = ReflectApi.defineProperty(current, key, nextDescriptor);
            if (!succeeded || settingDepth) return succeeded;
            const next = ReflectApi[GET_OWN_PROPERTY_DESCRIPTOR](current, key);
            const type = previous ? 'set' : 'add';
            const changed = !previous || !next ||
                !objectConstructor.is(toRaw(previous.value), toRaw(next.value)) ||
                previous.enumerable !== next.enumerable ||
                previous.configurable !== next.configurable ||
                previous.writable !== next.writable;
            if (changed) trigger(current, key, type, next?.value);
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
