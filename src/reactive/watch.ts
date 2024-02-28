import { WatchCallback } from '..';

import { computed, dispose } from './computed';

/**
 * Watches for changes to a specific key/index in an observed object/array and executes a callback when the key/index is modified.
 *
 * @param {Object|Array} obj - The observed object/array.
 * @param {string|number} key - The key/index to watch.
 * @param {Function} callback - The callback function to execute when the key/index is modified.
 */
export const watch = (obj: any, key: string | number, callback: WatchCallback) => {
    let oldValue : any, newValue : any = obj[key];
    // Create a computed function to monitor changes to the specified key/index
    const cb = () => {
        oldValue = newValue;
        newValue = obj[key];
        // Execute the callback only if the value has changed.
        if (oldValue !== newValue)
            callback(newValue, oldValue, key)
    };

    computed(
        // Access the specified key/index to establish dependency
        () => obj[key],
        // Execute the callback when the dependency changes
        { callback: cb}
    );

    // Return the disposer function to stop watching
    return () => dispose(cb);
};

