import { isObject } from "./typeCheck";

/**
 * Generates random strings of a given length until a callback returns true.
 * @param length
 * @param callback
 */
export const uid = (length: number, callback: (uid: string) => boolean): string => {
    while (true) {
        const uid = [...Array(length)].map(() => Math.random().toString(36)[2]).join('');
        if (callback(uid)) {
            return uid;
        }
    }
}

export const has = (value: any, item: string) => {
    return value && value.includes(item);
}

export const entries = (value: any): [string, any][] => {
    return isObject(value) ? Object.entries(value) : value.entries();
}

// Export everything from the following files
export * from './array';
export * from './constants';
export * from './dom';
export * from './number';
export * from './object';
export * from './string';
export * from './typeCheck';