import { addPropertyListener, getStateObject } from '.';
import { arrayAdd, each } from '../tools/array';
import { TARGET } from '../tools/constants';
import { newSet } from '../tools/object';
import { isArray } from '../tools/typeCheck';
import { getAccessedProps } from './track';

/**
 * Watches for changes on all reactive properties accessed during a function execution.
 * When those reactive properties are mutated, the `listener` function is called to reflect the changes.
 * @param listener The function to execute when any of the reactive properties change.
 * @param dependencies Used to track specific reactive properties. If not provided, `listener` is used.
 * @param priority The priority of the listener. Listeners with higher priority are called first. Default is 0.
 * @returns The cleanup function to remove the effect.
 */
export let effect = (listener: ListenerFunction, dependencies?: ListenerFunction, priority: number = 0) => {

    // Hold the cleanup functions for each accessed property
    let listeners: FunctionType[] = [];

    // Run the `dependencies` function or `listener` function to track accessed properties
    let accessedProps = getAccessedProps(dependencies || listener);

    // Hold accessed arrays
    let accessedArrays = newSet();

    // Find accessed arrays to prevent adding the `listener` to each item of the array
    // When the listener is something like `() => state.names.includes(name)`, the accessed property will be `names`, but all items of the array will also be accessed, and we don't want to add the listener to each item, but only to the array itself.
    each(accessedProps, ([state, prop]) => {
        let target = getStateObject(state)[TARGET];
        if (isArray(target[prop]))
            accessedArrays.add(target[prop]);
    });

    // Add the listener to each accessed property
    each(accessedProps, ([proxied, prop]: [any, string]) => {
        // Prevent adding the same listener to each item of an accessed array
        // This is necessary because when an array is accessed, all its items are also accessed, and we don't want to add the listener to each item, but only to the array itself.
        if (!accessedArrays.has(proxied)) {
            arrayAdd(listeners, addPropertyListener(proxied, prop, listener, priority));
        }
    });

    // Make sure `listener` is called once
    if (dependencies) listener({} as any);

    /**
     * A cleanup function to remove the effect.
     * It removes `listener` from all states and properties listeners it was added to.
     */
    return () => each(listeners, listener => listener());
}