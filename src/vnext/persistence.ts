import { batch, effect, getCurrentScope, onCleanup, signal, state } from './reactivity';
import type { Signal } from './reactivity';
import { causedError } from './errors';

export type StorageAdapter = Pick<Storage, 'getItem' | 'setItem'>;
export type PersistOptions = {
    storage?: 'local' | 'session' | StorageAdapter;
};

type Persisted<T> = T extends readonly unknown[] | Record<string, unknown> ? T : Signal<T>;

const isPlainContainer = (value: unknown): value is Record<PropertyKey, unknown> | unknown[] => {
    if (value === null || typeof value !== 'object') return false;
    if (Array.isArray(value)) return true;
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
};

const resolveStorage = (selection: PersistOptions['storage']): StorageAdapter => {
    if (selection && typeof selection === 'object') return selection;
    const storage = selection === 'session' ? globalThis.sessionStorage : globalThis.localStorage;
    if (!storage) throw new Error('Web Storage is not available in this environment.');
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
    if (!key.trim()) throw new TypeError('A non-empty persistence key is required.');
    if (!getCurrentScope())
        throw new Error('persist() must be called inside an app, component setup, or explicit reactive scope.');
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
            throw new TypeError(`Brio state for key "${key}" cannot be serialized as JSON.`);
        storage.setItem(key, serialized);
    };
    const stop = effect(encode);

    const listener = (event: StorageEvent) => {
        if (event.key !== key || (event.storageArea && event.storageArea !== storage)) return;
        let next: unknown;
        try {
            next = event.newValue === null ? initialValue : JSON.parse(event.newValue);
        } catch (error) {
            throw causedError(`Unable to apply persisted Brio state for key "${key}".`, error);
        }
        applyingRemoteUpdate = true;
        try {
            batch(() => {
                if (!objectBacked) {
                    (value as Signal<T>).value = next as T;
                } else if (Array.isArray(value) && Array.isArray(next)) {
                    const currentArray = value as unknown[];
                    currentArray.splice(0, currentArray.length, ...next);
                } else if (isPlainContainer(value) && isPlainContainer(next) && !Array.isArray(next)) {
                    const currentObject = value as Record<string, unknown>;
                    const nextObject = next as Record<string, unknown>;
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

    if (typeof globalThis.addEventListener === 'function')
        globalThis.addEventListener('storage', listener as EventListener);
    onCleanup(() => {
        stop();
        if (typeof globalThis.removeEventListener === 'function')
            globalThis.removeEventListener('storage', listener as EventListener);
    });
    return value as Persisted<T>;
}
