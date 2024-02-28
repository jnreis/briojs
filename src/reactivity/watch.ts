import { ListenerFunction, addStateListener, removeStateListener } from '.';
import { computed, removeComputed } from './computed';

/**
 * Watches for changes to a specific key/index in an observed object/array and executes a callback when the key/index is modified.
 *
 * @param observedState - The observed object/array.
 * @param prop - The key/index to watch.
 * @param callback - The callback function to execute when the key/index is modified.
 * @returns cleanup - The disposer function to stop watching
 */
export let watch = (observedState: any, prop: string | number, callback: ListenerFunction) => {

    let cleanup = computed(
        // Access the specified key/index to establish dependency
        () => observedState[prop],
        // Execute the callback when the dependency changes
        callback
    );

    // Return the disposer function to stop watching
    return () => removeComputed(cleanup);
}

/**
 * Watches for all changes to an observed object/array and executes a callback when any property is modified.
 * @param observedState
 * @param fn
 * @returns cleanup - The disposer function to stop watching
 */
export let watchAll = (observedState: any, fn: ListenerFunction) => {

    // Add the callback to the observed object/array listeners
    addStateListener(observedState, fn);

    // Return the disposer function to stop watching
    return () => removeStateListener(observedState, fn);
}