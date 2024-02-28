import { getKeys } from "./object";
import { isArray, isDate, isFunction, isMap, isObject, isRegExp, isSet } from "./typeCheck";

/**
 * Generates random strings of a given length until a callback returns true.
 * @param length
 * @param callback
 */
export let uid = (length: number, callback: (uid: string) => boolean): string => {
    while (true) {
        let uid = [...Array(length)].map(() => Math.random().toString(36)[2]).join('');
        if (callback(uid)) {
            return uid;
        }
    }
}

export let has = (value: any, item: string) => {
    return value && value.includes(item);
}

export let entries = (value: any): [string, any][] => {
    return isObject(value) ? Object.entries(value) : value.entries();
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
        if (getKeys(a).length !== getKeys(b).length) {
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
        if (a.length !== b.length) {
            return false
        }
        // Check if the arrays have the same values
        for (let i = 0; i < a.length; i++) {
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