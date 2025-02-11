import { ENTRIES, ERROR, LENGTH } from "./constants";
import { O } from "./object";
import { replace } from "./string";
import { isObject, isUndefined } from "./typeCheck";

/**
 * Determines whether an string or array includes a certain value
 * @param value the string or array to search
 * @param item the value to search for
 * @param position the position to start the search
 * @returns true if the value is found, else false
 */
export let has = (value: string|any[], item: string, position?: number) =>
    value.includes(item, position);

export let entries = (value: any): [string, any][] =>
    isObject(value) ? O[ENTRIES](value) : value[ENTRIES]();

/**
 * Returns a section of a string or a copy of a section of an array
 * @param value the string or array to take a slice from
 * @param start the index to start the slice
 * @param end the index to end the slice
 * @returns the slice of the string or array
 */
export let slice = (value: string|any[], start?: number | undefined, end?: number | undefined) =>
    value.slice(start, end);

/** Returns the size/length of a value */
export let size = (value: any): number => isUndefined(value[LENGTH]) ? value.size : value[LENGTH];

export let wait = (callback: FunctionType, ms = 0) => setTimeout(callback, ms);

export let waitAsync = (callback: FunctionType, ms = 0) => new Promise(resolve => wait(() => resolve(callback()), ms));

/**
 * Debounce: the callback function will only be called after the delay has passed since the last call.
 * @param callback Function to debounce
 * @param delay Time to wait before calling the function
 * @returns A debounced function
 */
export let debounce = (callback: Function, delay?: number) => {
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

export let uuid = () => crypto.randomUUID();

/**
 * Generates a random string of a specified length (default is 8)
 * @param length
 */
export let uid = (length: number = 8): string =>
    'b' + slice(replace(uuid(), /-/g, ''), 0, length - 1);

/**
 * Logs a message.
 * @returns Brio.js `...details`
 */
export let log = (type: 'log'|'warn'|'error', ...details: any[]): any => console[type]('Brio.js', ...details);

/**
 * Logs a warning message.
 * @returns Brio.js warn: `...details`
 */
export let logWarn = (...details: any[]) => log('warn', 'warn:', ...details);

/**
 * Logs an error message.
 * @returns Brio.js detected an error: `...details`
 */
export let logError = (...details: any[]) => log(ERROR, `detected an ${ERROR}:`, ...details);