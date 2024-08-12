import { removeListener, addPropertyListener } from '.';
import { getAccessedProps } from './track';
import { each } from '../tools/array';
import { is, isAsyncFunction } from '../tools/typeCheck';
import { logger } from '../tools';
import { FUNCTION, FUNCTION_MUST_BE_SYNC } from '../tools/constants';

/**
 * Tracks accessed properties and executes a callback when any of the properties change.
 * @param fn - The callback function to execute when the accessed properties change. Also used to track accessed properties when `deps` is not provided.
 * @param deps (optional) - The function to track accessed properties (dependencies). If not provided, `fn` is used.
 * @returns The computed function, which can be used to return the computed value or stop tracking accessed properties by calling `removeComputed` with it.
 */
export let computed = (fn: ListenerFunction, deps?: ListenerFunction, priority: number = 0): ListenerFunction => {

    // Validate the arguments
    if (isAsyncFunction(deps)) {
        logger(FUNCTION_MUST_BE_SYNC('dependencies'));
    }
    else if (isAsyncFunction(fn) && !is(deps, FUNCTION)) {
        logger(FUNCTION_MUST_BE_SYNC('computed'));
    }

    // Run the computed function to track accessed properties
    let accessedProps = getAccessedProps(deps ? deps : fn);

    // Remove the array of accessed properties from the stack and add the computed function to each accessed property
    each(accessedProps, ([proxied, prop]: [any, string]) => {
        addPropertyListener(proxied, prop, fn, priority);
    });

    // Make sure the computed function is called once
    if (deps) fn({} as any);

    // Return the computed function
    return fn;
}

/**
 * Stops tracking accessed properties for a computed function.
 * @param fn - The computed function to stop tracking.
 */
export let removeComputed = (fn: ListenerFunction) => {
    removeListener(fn);
}