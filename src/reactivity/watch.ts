import { addPropertyListener, removeListener, isState, getStateListeners } from '.';
import { logger } from '../tools';
import { ARRAY, DELETE, OBJECT, STATE } from '../tools/constants';

/**
 * Watches for changes to a specific key/index or an entire observed object/array and executes a callback when changes are detected.
 *
 * @param proxied - The observed object/array.
 * @param prop - The key/index to watch. If `null` or empty string, watch for all changes to the observed object/array.
 * @param callback - The callback function to execute when the key/index is modified.
 * @returns cleanup - The disposer function to stop watching
 */
export let watch = (proxied: any, prop: string | number | null, callback: ListenerFunction, priority: number = 0) => {

    if (!isState(proxied)) {
        logger(`Cannot watch non-${STATE} ${OBJECT}/${ARRAY}.`);
        return () => {};
    }

    // If no key/index is specified, watch for all changes to the observed object/array
    if (!prop && prop !== 0) {

        let stateListeners = getStateListeners(proxied);

        // Add the callback to the observed object/array listeners
        stateListeners.set(callback, priority);

        // Return the disposer function to stop watching
        return () => stateListeners[DELETE](callback);
    }

    // Watch for changes to a specific key/index
    addPropertyListener(proxied, prop, callback, priority);

    // Return the disposer function to stop watching
    return () => removeListener(callback);
}