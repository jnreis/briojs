import { Signal } from '../reactivity/types.js';
export type StorageAdapter = Pick<Storage, 'getItem' | 'setItem'>;
export type PersistOptions = {
    storage?: 'local' | 'session' | StorageAdapter;
};
type Persisted<T> = T extends readonly unknown[] | Record<string, unknown> ? T : Signal<T>;
export declare function persist<T>(key: string, initialValue: T, options?: PersistOptions): Persisted<T>;
export {};
