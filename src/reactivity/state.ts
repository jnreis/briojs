import { CALLBACK, getStateObject, setStateObject, removePropertyListeners, isState, stateObjects } from '.';
import { trackProps, accessedProps } from './track';
import { deepEqual, has } from '../tools';
import { arrayAdd, arrayFrom } from '../tools/array';
import { R, createContext, getKey, getKeys } from '../tools/object';
import { isArray, isObject, isUndefined, isFunction } from '../tools/typeCheck';
import { CREATE, DELETE, DELETE_PROPERTY, IGNORE_KEYS, PARENT, PROPS, PROXIED, STATE, UPDATE } from '../tools/constants';

type StateOptions = { parent?: any, ignoreKeys?: string[] };

/**
 * State wrapps an object/array in a Proxy to track changes and notify listeners.
 * @param {Object|Array} target The object/array to observe
 * @param {Object} [options] Options for the state
 * @param {Object} [options.parent] The parent state object
 * @param {Array<string|number>} [options.ignoreKeys] Ignore specific keys/indexes from being automatically observed. Note that these keys/indexes can still be observed manually.
 * @returns proxied
*/
export let state = (target: any, options?: StateOptions) => {

    /**
     * Do not observe the target if:
     * - The target is already observed, or
     * - The target is not an object/array.
     */
    if (!isArrayOrObject(target) || isState(target)) return target;

    /**
     * The parent state object.
     * @default null
     */
    let parent = getKey(options, PARENT, null) as any;
    /**
     * Ignore specific keys/indexes.
     * @default []
     */
    let ignoreKeys = getKey(options, IGNORE_KEYS, []) as string[];

    // Proxy handler
    let handler = {
        get(target: any, prop: string): any {

            // Register the accessed property
            if (trackProps && has(getKeys(target), prop))
                arrayAdd(accessedProps, [proxied, prop]);

            return R.get(target, prop, proxied);
        },
        set(target: any, prop: string, newValue: any): boolean {

            let oldValue = proxied[prop];

            // Do not set the new value if it is equal to the old value
            if (deepEqual(oldValue, newValue))
                return true;

            // Set the storage state if a callback is present
            if (hasStorageCallback(newValue))
                newValue = newValue(proxied, prop);

            // Attempt to observe the new value if the property is not marked to be ignored
            if (!has(ignoreKeys, prop))
                newValue = state(newValue);

            // If an observed array/object is being reassigned to a new array/object, update the listeners.
            // This is necessary because the reference to the observed array/object has changed.
            if (isState(oldValue) && isArrayOrObject(newValue)) {
                stateObjects.set(newValue, getStateObject(oldValue));
                stateObjects[DELETE](oldValue);
            }

            // Set the new value
            let result: boolean = R.set(target, prop, newValue, proxied);

            // Notify computed functions about property changes
            notifyListeners(getStateObject(proxied), prop, newValue, oldValue);

            return result;
        },
        [DELETE_PROPERTY](target: any, prop: string) {

            let stateObject = getStateObject(proxied);

            let oldValue = target[prop];

            // Delete the property
            let result = R[DELETE_PROPERTY](target, prop);

            // Notify computed functions about property deletion
            notifyListeners(stateObject, prop, undefined, oldValue);

            // Remove deleted properties from the listeners
            removePropertyListeners(stateObject, prop);

            return result;
        },
    };

    // Create a proxy for the object/array
    const proxied = new Proxy(isState(parent) ? createContext(parent, target) : target, handler);

    // Add the new proxied state to the state objects
    setStateObject(proxied /* , target, ignoreKeys, parent */);

    // Observe nested arrays/objects
    for (let prop of getKeys(target)) {

        // Set the storage state if a callback is present
        if (hasStorageCallback(target[prop]))
            target[prop] = target[prop](proxied, prop);

        // Attempt to observe if the property is not marked to be ignored
        // ? Note: R.set silently handles getters and setters
        if (!has(ignoreKeys, prop) && isArrayOrObject(target[prop]))
            R.set(target, prop, state(target[prop]), proxied);
    }

    // Function to notify computed functions about property changes
    let notifyListeners = (stateObject: StateObject, prop: any, newValue: any, oldValue: any) => {

        let operation = isUndefined(oldValue) ? CREATE : isUndefined(newValue) ? DELETE : UPDATE;

        let context = {operation, [PROXIED]:proxied, prop, newValue, oldValue};

        // Notify state listeners
        _notifyListeners(stateObject[STATE], context);

        // Notify property listeners
        if (stateObject[PROPS][prop])
            _notifyListeners(stateObject[PROPS][prop], context);

        // // If property is also an state, notify its listeners
        // if (isState(proxied[prop]))
        //     _notifyListeners(getStateObject(proxied[prop])[STATE], context);

    }

    return proxied;
}



// * STATE HELPERS

/** Check if a value is an array or object */
let isArrayOrObject = (value: any) => 
    isArray(value) || isObject(value);

/** Notify state listeners */
let _notifyListeners = async (listeners: ListenerFunctions, context: any) => {
    // Convert the map to an array
    let fns = arrayFrom(listeners) as [ListenerFunction, number][];

    // Sort the listeners by priority
    fns.sort((a, b) => b[1] - a[1]);

    // Call the listeners by priority
    for (let [listener] of fns) await listener(context);
}

/** Checks if a value has the callback symbol */
let hasStorageCallback = (value: any) =>
    isFunction(value) && (value as any)[CALLBACK];