import { addPropertyListener, isState, addStateListener } from '.';
import { logError } from '../tools';
import { ARRAY, OBJECT, STATE, CANNOT__$CAP } from '../tools/constants';
import { hasOwnProperty } from '../tools/object';

/**
 * Watches for changes to a specific prop or an entire observed object/array and executes a function when changes are detected.
 *
 * @param proxied - The observed object/array.
 * @param prop - The key/index to watch. If `falsy` and not 0, watch for all changes to the observed object/array.
 * @param listener - The function to execute when the prop is modified.
 * @returns cleanup - The disposer function to stop watching
 */
export let watch = (proxied: any, prop: string | number | null, listener: ListenerFunction, priority: number = 0) =>

    // If the proxied object is not an observed state, log an error and return an empty function
    !isState(proxied) && !logError(CANNOT__$CAP + `watch non-${STATE} ${OBJECT}/${ARRAY}.`)
        ? () => {}

    // If the prop is falsy and not 0, watch for all changes to the observed object/array
    : hasOwnProperty(proxied, prop as string)
        ? addPropertyListener(proxied, prop as string, listener, priority)

    // Otherwise watch for changes to a specific prop
    : addStateListener(proxied, listener, priority)!;