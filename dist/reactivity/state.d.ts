import { Signal } from './types';

export declare const isObject: (value: unknown) => value is Record<PropertyKey, unknown>;
export declare const toRaw: <T>(value: T) => T;
export declare const track: (target: object, key: PropertyKey) => void;
export declare const trigger: (target: object, key: PropertyKey, type: "set" | "add" | "delete", newValue?: unknown, oldValue?: unknown) => void;
export declare const canObserve: (value: object) => boolean;
export declare function state<T extends object>(target: T): T;
export declare function signal<T>(initialValue: T): Signal<T>;
