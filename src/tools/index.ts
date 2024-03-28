import { getKeys } from "./object";
import { isArray, isDate, isFunction, isMap, isObject, isRegExp, isSet, isString } from "./typeCheck";

/**
 * Generates random strings of a given length until a callback returns true.
 * @param length
 * @param callback
 */
export let uid = (length: number = 8, callback?: (uid: string) => boolean): string => {
    while (true) {
        let uid = 'b' + [...Array(length -1)].map(() => Math.random().toString(36)[2]).join('');
        // If no callback is provided, return the uid
        if (!callback) return uid;
        // If a callback is provided, return the uid if the callback returns true
        if (callback(uid)) return uid;
    }
}

export let has = (value: any, item: string|symbol) =>
    value && value.includes(item);

export let entries = (value: any): [string, any][] =>
    isObject(value) ? Object.entries(value) : value.entries();

/**
 * Returns the size of a value
 */
export let size = (value: any): number => {
    // If the value is an object, get the keys
    let v = isObject(value) ? getKeys(value) : value;
    return isArray(v) || isString(v) 
        ? v.length // Object, Array, or String
        : v.size; // Map, Set, or other iterable
}


/**
 * Performs a deep comparison between two values to determine if they are equivalent
 * @param a Value to compare
 * @param b Other value to compare
 * @returns True if the values are equivalent, else false
 */
export function deepEqual(a: any, b: any): boolean {
    // For objects
    if (isObject(a) && isObject(b)) {
        // Check if the objects have the same keys
        if (size(a) !== size(b)) {
            return false
        }
        // Check if the objects have the same values
        for (let key in a) {
            if (!deepEqual(a[key], b[key])) {
                return false
            }
        }
        return true
    }

    // For arrays
    if ((isArray(a) && isArray(b))) {
        // Check if the arrays have the same length
        if (size(a) !== size(b)) {
            return false
        }
        // Check if the arrays have the same values
        for (let i = 0; i < size(a); i++) {
            if (!deepEqual(a[i], b[i])) {
                return false
            }
        }
        return true
    }

    // For sets or maps
    if ((isSet(a) && isSet(b)) || (isMap(a) && isMap(b))) {
        return deepEqual(Array.from(a), Array.from(b));
    }

    // For functions or regexes
    if ((isFunction(a) && isFunction(b)) || (isRegExp(a) && isRegExp(b))) {
        return a.toString() === b.toString()
    }

    // For dates
    if (isDate(a) && isDate(b)) return a.getTime() === b.getTime();

    // For all other values
    return a === b;
}

export let wait = (callback: () => void, ms = 0) => setTimeout(callback, ms);

export let debounce = (callback: Function, delay: number) => {
    let timeout: any;
    return (...args: any[]) => {
        clearTimeout(timeout);
        timeout = wait(() => callback(...args), delay);
    }
}

export let throttle = (callback: Function, delay: number) => {
    let last: number = 0;
    return (...args: any[]) => {
        let now = Date.now();
        if (now - last < delay) return;
        last = now;
        return callback(...args);
    }
}