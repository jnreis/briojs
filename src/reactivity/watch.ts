import { addPropertyListener, isState, addStateListener } from '.';
import { logError } from '../tools';
import { ARRAY, OBJECT, STATE, CANNOT__$CAP } from '../tools/constants';
import { isNumber, isString } from '../tools/typeCheck';

/**
 * Watches for changes to a specific prop or an entire observed object/array and executes a function when changes are detected.
 *
 * @param proxied - The observed object/array.
 * @param prop - The key/index to watch. If `falsy` and not 0, watch for all changes to the observed object/array.
 * @param listener - The function to execute when the prop is modified.
 * @returns cleanup - The disposer function to stop watching
 */
export let watch = (proxied: any, prop: string | number | null | undefined | symbol, listener: ListenerFunction, priority: number = 0) => {

    let cleanup;

    // If the proxied object is not an observed state, log an error and return an empty function
    if (!isState(proxied)) {
        logError(CANNOT__$CAP + `watch non-${STATE} ${OBJECT}/${ARRAY}.`)
        cleanup = () => {};
    }

    // Watch for changes to a specific prop
    else if (isString(prop) || isNumber(prop)) {
        cleanup = addPropertyListener(proxied, prop as string, listener, priority);
    }

    // Watch for all changes to the observed object/array
    else {
        cleanup = addStateListener(proxied, listener, priority)!;
    }

    return cleanup;
}