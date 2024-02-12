import { computedStack, trackerSymbol } from "./observe";

/**
 * @typedef {Object} ComputedArguments - Computed Arguments.
 * @property {(fun: () => void) => void} computeAsync -
 * Will monitor the dependencies of the function passed as an argument. Useful when dealing with asynchronous computations.
 */

/**
 * @typedef {Object} Options - Computed Options.
 * @property {boolean} [autoRun] -
 * If false, will not run the function argument when calling computed(function).
 * The computed function must be called **at least once** to calculate its dependencies.
 * @property {() => void} [callback] -
 * Specify a callback that will be re-runned each time a dependency changes instead of the computed function.
 */

type WrappedFunction = (...args: any[]) => any;
type Options = {
    autoRun?: boolean;
    callback?: WrappedFunction;
    bind?: any;
    disableTracking?: boolean;
};

/**
 * Wraps a function and captures observed properties which are accessed during the function execution.
 * When those properties are mutated, the function is called to reflect the changes.
 *
 * @param {(args: ComputedArguments) => void} wrappedFunction
 * @param {Options} options
 */
export function computed(
    wrappedFunction: WrappedFunction,
    options: Options = {}
) {
    const { autoRun = true, callback, bind, disableTracking = false } = options;

    function observeComputation(fun: Function | null, argsList: any[] = []) {
        const target = callback || wrapper;
        // Track object and object properties accessed during this function call
        if (!disableTracking) {
            (target as any)[trackerSymbol] = new WeakMap();
        }
        // Store into the stack a reference to the computed function
        computedStack.unshift(target);
        // Inject the computeAsync argument which is used to manually declare when the computation takes part
        if (argsList.length > 0) {
            argsList = [...argsList, computeAsyncArg];
        } else {
            argsList = [computeAsyncArg];
        }
        // Run the computed function - or the async function
        const result = fun
            ? fun()
            : bind
            ? wrappedFunction.apply(bind, argsList)
            : wrappedFunction(...argsList);
        // Remove the reference
        computedStack.shift();
        // Return the result
        return result;
    }
    const computeAsyncArg = { computeAsync: observeComputation };
    const wrapper: WrappedFunction = (...argsList) =>
        observeComputation(null, argsList);

    // If autoRun, then call the function at once
    if (autoRun) {
        wrapper();
    }

    return wrapper;
}

/**
 * Will remove the computed function from the reactive Maps (the next time an bound observer property is called) allowing garbage collection.
 *
 * @param {Function} computedFunction
 */
export function dispose(computedFunction: any) {
    computedFunction[trackerSymbol] = null;
    return (computedFunction.__disposed = true);
}
