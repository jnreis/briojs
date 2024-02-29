import { ListenerFunction, listeners, getListener } from '.';
import { computed, removeComputed } from './computed';

/**
 * Watches for changes to a specific key/index or an entire observed object/array and executes a callback when changes are detected.
 *
 * @param observedState - The observed object/array.
 * @param prop - The key/index to watch. If `null` or empty string, watch for all changes to the observed object/array.
 * @param callback - The callback function to execute when the key/index is modified.
 * @returns cleanup - The disposer function to stop watching
 */
export let watch = (observedState: any, prop: string | number | null, callback: ListenerFunction) => {

    // If no key/index is specified, watch for all changes to the observed object/array
    if (!prop && prop !== 0) {
        if (!listeners.has(observedState))
            return console.error('Cannot watch an unobserved object/array.');

        // Add the callback to the observed object/array listeners
        getListener(observedState).state.add(callback);

        // Return the disposer function to stop watching
        return () => getListener(observedState).state.delete(callback);
    }

    let cleanup = computed(
        // Access the specified key/index to establish dependency
        () => observedState[prop],
        // Execute the callback when the dependency changes
        callback
    );

    // Return the disposer function to stop watching
    return () => removeComputed(cleanup);
}

// /**
//  * Watches for all changes to an observed object/array and executes a callback when any property is modified.
//  * @param observedState
//  * @param fn
//  * @returns cleanup - The disposer function to stop watching
//  */
// export let watchState = (observedValue: any, fn: ListenerFunction) => {

//     if (!listeners.has(observedValue)) {
//         return console.error('Cannot watch an unobserved object/array.');
//     }

//     // Add the callback to the observed object/array listeners
//     getListener(observedValue).state.add(fn);

//     // Return the disposer function to stop watching
//     return () => getListener(observedValue).state.delete(fn);
// }