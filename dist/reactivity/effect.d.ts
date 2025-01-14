/**
 * Watches for changes on all reactive properties accessed during a function execution.
 * When those reactive properties are mutated, the `listener` function is called to reflect the changes.
 * @param listener The function to execute when any of the reactive properties change.
 * @param dependencies Used to track specific reactive properties. If not provided, `listener` is used.
 * @param priority The priority of the listener. Listeners with higher priority are called first. Default is 0.
 * @returns The cleanup function to remove the effect.
 */
export declare let effect: (listener: ListenerFunction, dependencies?: ListenerFunction, priority?: number) => () => any;
