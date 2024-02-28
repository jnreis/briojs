import { WrappedFunction, computed, dispose } from './computed';

type Options = {
    autoRun?: boolean;
    bind?: any;
};

/**
 * Watches for changes on all the observed properties accessed during the function execution.
 * When those properties are mutated, the function is called to reflect the changes.
 */
export const effect = (fn: WrappedFunction, options: Options = {}) => {
    // Prevent the effect from running multiple times
    let running = false;

    const cleanup = computed(()=> {
        // Prevent the effect from running multiple times
        if (!running) {
            running = true;
            fn();
            // Delay the reset of the running flag to the next tick
            setTimeout(() => running = false, 0);
        }
    }, options);

    // Return the disposer function to stop watching
    return () => dispose(cleanup);
};

