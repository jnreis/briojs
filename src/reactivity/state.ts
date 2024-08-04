import { CALLBACK, getStateObject, setStateObject, removePropertyListeners, isState, findStateObject, getStateKeys, stateObjects } from '.';
import { trackProps, accessedProps } from './track';
import { deepEqual, has } from '../tools';
import { arrayAdd, each } from '../tools/array';
import { R, getDescriptor, getKey, getKeys } from '../tools/object';
import { isArray, isObject, isUndefined, isFunction } from '../tools/typeCheck';
import { CREATE, DELETE, PARENT, PROXIED, TARGET, UPDATE } from '../tools/constants';

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
    let ignoreKeys = getKey(options, 'ignoreKeys', []) as string[];

    // Proxy handler
    let handler = {
        has(_: any, prop: string): boolean {
            let stateObject = findStateObject(proxied, prop);
            return R.has(stateObject[TARGET], prop);
        },
        getOwnPropertyDescriptor(_: any, prop: string) {
            let stateObject = findStateObject(proxied, prop);
            return getDescriptor(stateObject[TARGET], prop, R);
        },
        ownKeys(_: any): (string | symbol)[] {
            return getStateKeys(proxied);
        },
        get(_: any, prop: string): any {

            let stateObject = findStateObject(proxied, prop);

            // Register the accessed property
            if (trackProps && has(getKeys(stateObject[TARGET]), prop))
                arrayAdd(accessedProps, [stateObject[PROXIED], prop]);

            return R.get(stateObject[TARGET], prop, stateObject[PROXIED]);
        },
        set(_: any, prop: string, newValue: any): boolean {

            let stateObject = findStateObject(proxied, prop);

            let oldValue = stateObject[PROXIED][prop];

            // Do not set the new value if it is equal to the old value
            if (deepEqual(oldValue, newValue))
                return true;

            // Set the storage state if a callback is present
            if (hasStorageCallback(newValue))
                newValue = newValue(stateObject[PROXIED], prop);

            // Attempt to observe the new value if the property is not marked to be ignored
            if (!has(stateObject.ignoreKeys, prop))
                newValue = state(newValue);

            // If an observed array/object is being reassigned to a new array/object, update the listeners.
            // This is necessary because the reference to the observed array/object has changed.
            if (isState(oldValue) && isArrayOrObject(newValue)) {
                stateObjects.set(newValue, getStateObject(oldValue));
                stateObjects[DELETE](oldValue);
            }

            // Set the new value
            let result: boolean = R.set(stateObject[TARGET], prop, newValue, stateObject[PROXIED]);

            // Notify computed functions about property changes
            notifyListeners(prop, newValue, oldValue);

            return result;
        },
        deleteProperty(_: any, prop: string) {

            let stateObject = findStateObject(proxied, prop);

            let oldValue = stateObject[TARGET][prop];

            // Delete the property
            let result = R.deleteProperty(stateObject[TARGET], prop);

            // Notify computed functions about property deletion
            notifyListeners(prop, undefined, oldValue);

            // Remove deleted properties from the listeners
            removePropertyListeners(stateObject[PROXIED], prop);

            return result;
        },
    };

    // Create a proxy for the object/array
    const proxied = new Proxy(target, handler);

    // Add the new proxied state to the state objects
    setStateObject(proxied, target, ignoreKeys, parent);

    // Observe nested arrays/objects
    for (let prop of getKeys(target)) {

        // Set the storage state if a callback is present
        if (hasStorageCallback(target[prop]))
            target[prop] = target[prop](proxied, prop);

        // Attempt to observe if the property is not marked to be ignored
        if (!has(ignoreKeys, prop))
            target[prop] = state(target[prop]);
    }

    // Function to notify computed functions about property changes
    let notifyListeners = (prop: any, newValue: any, oldValue: any) => {

        let operation = isUndefined(oldValue) ? CREATE : isUndefined(newValue) ? DELETE : UPDATE;

        let context = {operation, proxied, prop, newValue, oldValue};

        // State listeners
        let stateObject = getStateObject(proxied);

        // Notify state listeners
        _notifyListeners(stateObject.state, context);

        // Notify property listeners
        if (stateObject.props[prop])
            _notifyListeners(stateObject.props[prop], context);

        // // If property is also an state, notify its listeners
        // if (isState(proxied[prop]))
        //     _notifyListeners(getStateObject(proxied[prop]).state, context);

    }

    return proxied;
}



// * STATE HELPERS

/** Check if a value is an array or object */
let isArrayOrObject = (value: any) => 
    isArray(value) || isObject(value);

/** Notify state listeners */
let _notifyListeners = (listeners: ListenerFunctions, context: any) =>
    each(listeners, (fn: ListenerFunction) => fn(context));

/** Checks if a value has the callback symbol */
let hasStorageCallback = (value: any) =>
    isFunction(value) && (value as any)[CALLBACK];