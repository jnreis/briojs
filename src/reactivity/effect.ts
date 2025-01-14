import { addPropertyListener } from '.';
import { arrayAdd, each } from '../tools/array';
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

    // Run the function to track accessed properties
    let accessedProps = getAccessedProps(dependencies || listener);

    // Add the listener to each accessed property
    each(accessedProps, ([proxied, prop]: [any, string]) => {
        arrayAdd(listeners, addPropertyListener(proxied, prop, listener, priority));
    });

    // Make sure `listener` is called once
    if (dependencies) listener({} as any);

    /**
     * A cleanup function to remove the effect.
     * It removes `listener` from all states and properties listeners it was added to.
     */
    return () => each(listeners, listener => listener());
}