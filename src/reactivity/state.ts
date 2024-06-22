import { CALLBACK, listeners, getListener, removePropertyListeners, isState, ignoredTargets } from '.';
import { trackProps, accessedProps } from './track';
import { deepEqual, has } from '../tools';
import { arrayAdd, each } from '../tools/array';
import { getKey, getKeys } from '../tools/object';
import { isArray, isObject, isUndefined, isFunction } from '../tools/typeCheck';
import { CREATE, DELETE, UPDATE } from '../tools/constants';


/**
 * State wrapps an object/array in a Proxy to track changes and notify listeners.
 * @param target The object/array to observe
 * @returns observedState
*/
export let state = (target: any, options?: { depth?: number, ignore?: boolean }) => {

    let ignore = getKey(options, 'ignore', false) as boolean;
    let depth = getKey(options, 'depth', -1) as number;

    // Ignore the target
    if (ignore) ignoredTargets.add(target);

    // Do not observe the target if:
    // - The target is already observed
    // - The target is not an object/array
    // - The target is marked to be ignored
    // - Should not observe any deeper. Depth is 0.
    if (depth === 0 || !isArrayOrObject(target) || ignoredTargets.has(target) || isState(target)) return target;

    // Decrease the depth for the next level
    if (depth > 0) depth--;

    // Proxy handler
    let handler = {
        get(target: any, prop: string): any {

            // Register the accessed property
            if (trackProps && has(getKeys(target), prop)) {
                arrayAdd(accessedProps, [observedState, prop]);
            }

            return Reflect.get(target, prop, observedState);
        },
        set(target: any, prop: string, newValue: any): boolean {

            let oldValue = observedState[prop];

            // If the new/old value are equal, return
            if (deepEqual(oldValue, newValue)) return true;

            // Set the storage state if a callback is present
            if (hasStorageCallback(newValue)) {
                newValue = newValue(observedState, prop);
            }

            // Observe the new value if it's an object/array
            newValue = state(newValue, { depth, ignore });

            // If an observed array/object is being reassigned to a new array/object, update the listeners.
            // This is necessary because the reference to the observed array/object has changed.
            if (isState(oldValue) && isArrayOrObject(newValue)) {
                listeners.set(newValue, listeners.get(oldValue)!);
                listeners[DELETE](oldValue);
            }

            // Set the new value
            let result: boolean = Reflect.set(target, prop, newValue, observedState);

            // Notify computed functions about property changes
            notifyListeners(prop, newValue, oldValue);

            return result;
        },
        deleteProperty(target: any, prop: string) {
            let oldValue = target[prop];

            // Delete the property
            let result = Reflect.deleteProperty(target, prop);

            // Notify computed functions about property deletion
            notifyListeners(prop, undefined, oldValue);

            // Remove deleted properties from the listeners
            removePropertyListeners(observedState, prop);

            return result;
        },
    };

    // Create a proxy for the object/array
    const observedState = new Proxy(target, handler);

    // Add the observed object/array to the listeners
    getListener(observedState);

    for (let prop of getKeys(target)) {
        // Set the storage state if a callback is present
        if (hasStorageCallback(target[prop])) {
            target[prop] = target[prop](observedState, prop);
        }

        // Recursively observe nested arrays/objects that are not already observed
        if (!isState(target[prop]) && isArrayOrObject(target[prop])) {
            target[prop] = state(target[prop], { depth, ignore });
        }
    }

    // Function to notify computed functions about property changes
    let notifyListeners = (prop: any, newValue: any, oldValue: any) => {

        let operation = isUndefined(oldValue) ? CREATE : isUndefined(newValue) ? DELETE : UPDATE;

        let context = {operation, observedState, prop, newValue, oldValue};

        // State listeners
        let listener = getListener(observedState);

        // Notify state listeners
        notifyStateListeners(observedState, context);

        // Notify property listeners
        if (listener.props[prop]) {
            each(listener.props[prop] as any, (fn: ListenerFunction) => {
                // Run the computed function
                fn(context);
            });
        }

        // // If property is also an state, notify its listeners
        // if (isState(observedState[prop])) {
        //     notifyStateListeners(observedState[prop], context);
        // }
    }

    return observedState;
}



// * STATE HELPERS

let isArrayOrObject = (value: any) => 
    isArray(value) || isObject(value);

let notifyStateListeners = (observedState: any, context: any) =>
    each(getListener(observedState).state as any, (fn: ListenerFunction) => fn(context));

/**
 * Checks if a value has the callback symbol.
 */
let hasStorageCallback = (value: any) =>
    isFunction(value) && (value as any)[CALLBACK];