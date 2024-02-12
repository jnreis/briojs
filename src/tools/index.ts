import { isObject } from "./typeCheck";

/**
 * Generates random strings of a given length until a callback returns true.
 * @param length
 * @param callback
 */
export function uid(length: number, callback: (uid: string) => boolean): string {
    while (true) {
        const uid = [...Array(length)].map(() => Math.random().toString(36)[2]).join('')
        if (callback(uid)) {
            return uid
        }
    }
}

export function has(data: string | string[], item: string) {
    return data.includes(item);
}

export function entries(obj: any) {
    return isObject(obj) ? Object.entries(obj) : obj.entries();
}

// Export everything from the following files
export * from './array';
export * from './dom';
export * from './number';
export * from './string';
export * from './typeCheck';