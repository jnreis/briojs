import { listeners, getListener, addPropertyListener, removeListener } from '.';
import { logger } from '../tools';
import { ARRAY, OBJECT } from '../tools/constants';

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
        if (!listeners.has(observedState)) {
            logger(`Cannot watch an unobserved ${OBJECT}/${ARRAY}.`);
            return () => {};
        }

        // Add the callback to the observed object/array listeners
        getListener(observedState).state.add(callback);

        // Return the disposer function to stop watching
        return () => getListener(observedState).state.delete(callback);
    }

    // Watch for changes to a specific key/index
    addPropertyListener(observedState, prop, callback);

    // Return the disposer function to stop watching
    return () => removeListener(callback);
}