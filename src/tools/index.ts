import { arrayFrom, join } from "./array";
import { getKeys } from "./object";
import { toString } from "./string";
import { isArray, isDate, isFunction, isMap, isObject, isPromise, isRegExp, isSet, isString } from "./typeCheck";

/**
 * Generates random strings of a given length until a callback returns true.
 * @param length
 * @param callback
 */
export let uid = (length: number = 8, callback?: (uid: string) => boolean): string => {
    while (true) {
        let uid = 'b' + join([...Array(length -1)].map(() => toString(Math.random(), 36)[2]), '');
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

export let slice = (value: any, start?: number | undefined, end?: number | undefined) =>
    value.slice(start, end);

export let asyncValue = async (value: any) => {
    let v = isFunction(value) ? value() : value;
    return isPromise(v) ? await v : v;
}

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
export let deepEqual = (a: any, b: any): boolean => {
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
        return deepEqual(arrayFrom(a), arrayFrom(b));
    }

    // For functions or regexes
    if ((isFunction(a) && isFunction(b)) || (isRegExp(a) && isRegExp(b))) {
        return toString(a) === toString(b);
    }

    // For dates
    if (isDate(a) && isDate(b)) return a.getTime() === b.getTime();

    // For all other values
    return a === b;
}

export let wait = (callback: FunctionType, ms = 0) => setTimeout(callback, ms);

/**
 * Debounce: the callback function will only be called after the delay has passed since the last call.
 * @param callback Function to debounce
 * @param delay Time to wait before calling the function
 * @returns A debounced function
 */
export let debounce = (callback: Function, delay: number) => {
    let timeout: any;
    return (...args: any[]) => {
        clearTimeout(timeout);
        timeout = wait(() => callback(...args), delay);
    }
}

/**
 * Throttle: the callback function will only be called once every delay milliseconds.
 * @param callback Function to throttle
 * @param delay Time to wait before calling the function
 * @returns A throttled function
 */
export let throttle = (callback: Function, delay: number) => {
    let last: number = 0;
    return (...args: any[]) => {
        let now = Date.now();
        if (now - last < delay) return;
        last = now;
        return callback(...args);
    }
}

/** Brio.js logger: Log an error or a warning message */
export let logger = (message: string, details: any = '', type: 'error'|'warn' = 'error') => {
    console[type](
        `Brio.js ${type == 'error' ? 'detected an error' : 'is warning'}: ${message}\n`,
        details
    );
};