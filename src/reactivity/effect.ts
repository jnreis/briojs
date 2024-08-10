import { computed, removeComputed } from '.';

/**
 * Watches for changes on all the observed properties accessed during the function execution.
 * When those properties are mutated, the function is called to reflect the changes.
 * This is basically a `computed` with a cleanup function as return value.
 * @param fn - The function to execute when the observed properties change.
 * @returns cleanup - The disposer function to stop watching
 */
export let effect = (fn: ListenerFunction, deps?: ListenerFunction, priority: number = 0) => {

    // Create a computed function to track dependencies
    let cleanup = computed(fn, deps, priority);

    // Return the disposer function to stop watching
    return () => removeComputed(cleanup);
}