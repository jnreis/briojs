import { ListenerFunction, computedStack, CALLBACK, removePropertyListener } from '.';

/**
 * Computed function to track property dependencies and re-run when dependencies change.
 * @param fn
 * @returns fn
 */
export let computed = (fn: ListenerFunction, callback?: ListenerFunction): ListenerFunction => {

    // Append the callback to the computed function
    if (callback) (fn as any)[CALLBACK] = callback;

    // Add the computed function to the stack
    computedStack.push(fn);

    // Run the computed function to track dependencies
    fn({} as any);

    // Remove the computed function from the stack
    computedStack.pop();

    // Return the computed function
    return fn;
}

export let removeComputed = (fn: ListenerFunction) => {
    removePropertyListener(fn);
}