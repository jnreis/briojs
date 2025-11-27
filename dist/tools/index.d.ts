/**
 * Determines whether an string or array includes a certain value
 * @param value the string or array to search
 * @param item the value to search for
 * @param position the position to start the search
 * @returns true if the value is found, else false
 */
export declare let has: (value: string | any[], item: any, position?: number) => boolean;
export declare let entries: (value: any) => [string | number, any][];
/**
 * Returns a section of a string or a copy of a section of an array
 * @param value the string or array to take a slice from
 * @param start the index to start the slice
 * @param end the index to end the slice
 * @returns the slice of the string or array
 */
export declare let slice: (value: string | any[], start?: number | undefined, end?: number | undefined) => string | any[];
/** Returns the size/length of a value */
export declare let size: (value: any) => number;
export declare let wait: (callback: FunctionType, ms?: number) => number;
export declare let clearWait: (id: number) => void;
export declare let waitAsync: (callback: FunctionType, ms?: number) => Promise<unknown>;
/**
 * Debounce: the callback function will only be called after the delay has passed since the last call.
 * @param callback Function to debounce
 * @param delay Time to wait before calling the function
 * @returns A debounced function
 */
export declare let debounce: (callback: Function, delay?: number) => (...args: any[]) => void;
/**
 * Throttle: the callback function will only be called once every delay milliseconds.
 * @param callback Function to throttle
 * @param delay Time to wait before calling the function
 * @returns A throttled function
 */
export declare let throttle: (callback: Function, delay: number) => (...args: any[]) => any;
/**
 * Generates a unique string of a minimum length.
 * @param length
 */
export declare let uid: (length?: number) => string;
/**
 * Logs a message.
 * @returns Brio.js `...details`
 */
export declare let log: (type: "log" | "warn" | "error", ...details: any[]) => any;
/**
 * Logs a warning message.
 * @returns Brio.js warn: `...details`
 */
export declare let logWarn: (...details: any[]) => any;
/**
 * Logs an error message.
 * @returns Brio.js detected an error: `...details`
 */
export declare let logError: (...details: any[]) => any;
export declare let deepClone: (value: any, seen?: WeakMap<object, any>) => any;
