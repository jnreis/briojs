import {
    computedStack, removeListener, addPropertyListener,
    CALLBACK,
} from '.';
import { arrayAdd, each } from '../tools/array';

/**
 * Tracks accessed properties and executes a callback when any of the properties change.
 * @param fn - The function to track accessed properties.
 * @param callback (optional) - The callback function to execute when the accessed properties change.
 * @returns The computed function, which can be used to return the computed value or stop tracking accessed properties by calling `removeComputed` with it.
 */
export let computed = (fn: ListenerFunction, callback?: ListenerFunction): ListenerFunction => {

    // Append the callback to the computed function, if provided
    if (callback) (fn as any)[CALLBACK] = callback;

    // Add the new array to the computed stack
    arrayAdd(computedStack, []);

    // Run the computed function to track accessed properties
    fn({} as any);

    // Remove the array of accessed properties from the stack and add the computed function to each accessed property
    each(computedStack.pop(), ([observedState, prop]: [any, string]) => {
        addPropertyListener(observedState, prop, fn);
    });

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