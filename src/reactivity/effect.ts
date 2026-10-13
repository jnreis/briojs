import { addPropertyListener } from '.';
import { each } from '../tools/array';
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
    let listeners: FunctionType[] = [];
    let disposed = false;
    let running = false;

    let run = (context: ListenerFunctionContext) => {
        if (disposed || running) return;
        running = true;
        try {
            let accessedProps = getAccessedProps(
                dependencies ? () => dependencies(context) : () => listener(context)
            );

            each(listeners, dispose => dispose());
            listeners = [];

            for (let [proxied, prop] of accessedProps)
                listeners.push(addPropertyListener(proxied, prop as string | number, run, priority));

            if (dependencies) listener(context);
        } finally {
            running = false;
        }
    }

    run({} as ListenerFunctionContext);

    /**
     * A cleanup function to remove the effect.
     * It removes `listener` from all states and properties listeners it was added to.
     */
    return () => {
        if (disposed) return;
        disposed = true;
        each(listeners, dispose => dispose());
        listeners = [];
    };
}