import { removeListener, addPropertyListener } from '.';
import { getAccessedProps } from './track';
import { each } from '../tools/array';

/**
 * Tracks accessed properties and executes a callback when any of the properties change.
 * @param fn - The callback function to execute when the accessed properties change. Also used to track accessed properties when `deps` is not provided.
 * @param deps (optional) - The function to track accessed properties (dependencies). If not provided, `fn` is used.
 * @returns The computed function, which can be used to return the computed value or stop tracking accessed properties by calling `removeComputed` with it.
 */
export let computed = (fn: ListenerFunction, deps?: ListenerFunction): ListenerFunction => {

    // Run the computed function to track accessed properties
    let accessedProps = getAccessedProps(deps ? deps : fn);

    // Remove the array of accessed properties from the stack and add the computed function to each accessed property
    each(accessedProps, ([observedState, prop]: [any, string]) => {
        addPropertyListener(observedState, prop, fn);
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