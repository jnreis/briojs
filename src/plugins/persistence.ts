import {
    isObjectType, objectConstructor, isFunction, isArray, createError, createTypeError, objectKeys,
} from '../core/native';
import { addEventListener, removeEventListener } from '../dom/native';
import { getCurrentScope, onCleanup } from '../core/scope';
import { batch, effect } from '../reactivity/effect';
import { signal, state } from '../reactivity/state';
import type { Signal } from '../reactivity/types';
import { causedError } from '../core/errors';

export type StorageAdapter = Pick<Storage, 'getItem' | 'setItem'>;
export type PersistOptions = {
    storage?: 'local' | 'session' | StorageAdapter;
};

type Persisted<T> = T extends readonly unknown[] | Record<string, unknown> ? T : Signal<T>;

const isPlainContainer = (value: unknown): value is Record<PropertyKey, unknown> | unknown[] => {
    if (value === null || !isObjectType(value)) return false;
    if (isArray(value)) return true;
    const prototype = objectConstructor.getPrototypeOf(value);
    return prototype === objectConstructor.prototype || prototype === null;
};

const resolveStorage = (selection: PersistOptions['storage']): StorageAdapter => {
    if (selection && isObjectType(selection)) return selection;
    const storage = selection === 'session' ? globalThis.sessionStorage : globalThis.localStorage;
    if (!storage) throw createError('Web Storage is not available in this environment.');
    return storage;
};

const readInitial = (storage: StorageAdapter, key: string, fallback: unknown): unknown => {
    const stored = storage.getItem(key);
    if (stored === null) return fallback;
    try {
        return JSON.parse(stored);
    } catch (error) {
        throw causedError(`Unable to read persisted Brio state for key "${key}".`, error);
    }
};

export function persist<T>(key: string, initialValue: T, options: PersistOptions = {}): Persisted<T> {
    if (!key.trim()) throw createTypeError('A non-empty persistence key is required.');
    if (!getCurrentScope())
        throw createError('persist() must be called inside an app, component setup, or explicit reactive scope.');
    const storage = resolveStorage(options.storage);
    const initial = readInitial(storage, key, initialValue) as T;
    const objectBacked = isPlainContainer(initial);
    const value: unknown = objectBacked ? state(initial) : signal(initial);
    let applyingRemoteUpdate = false;
    const encode = () => {
        if (applyingRemoteUpdate) return;
        const current = objectBacked ? value : (value as Signal<T>).value;
        const serialized = JSON.stringify(current);
        if (serialized === undefined)
            throw createTypeError(`Brio state for key "${key}" cannot be serialized as JSON.`);
        storage.setItem(key, serialized);
    };
    const stop = effect(encode);

    const listener = (event: StorageEvent) => {
        if (event.key !== key || (event.storageArea && event.storageArea !== storage)) return;
        let next: unknown;
        try {
            next = event.newValue === null ? initialValue : JSON.parse(event.newValue);
        } catch (error) {
            return;
        }
        applyingRemoteUpdate = true;
        try {
            batch(() => {
                if (objectBacked && isPlainContainer(next)) {
                    const target = value as Record<string, unknown>;
                    for (const prop of objectKeys(target)) {
                        if (!(prop in next)) delete target[prop];
                    }
                    objectConstructor.assign(target, next);
                } else if (!objectBacked) {
                    (value as Signal<T>).value = next as T;
                }
            });
        } finally {
            applyingRemoteUpdate = false;
        }
    };

    if (typeof window !== 'undefined' && isFunction(window.addEventListener)) {
        addEventListener(window, 'storage', listener);
        onCleanup(() => {
            removeEventListener(window, 'storage', listener);
            stop();
        });
    } else {
        onCleanup(stop);
    }

    return value as Persisted<T>;
}
