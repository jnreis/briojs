import { getStateObject, isState, stateObjects, propertyInitFns } from '.';
import { trackProps, accessedProps } from './track';
import { arrayAdd, arrayFrom, each, sort, sortPriority } from '../tools/array';
import { R, createContext, getKey, hasOwnProperty, newMap, setKey } from '../tools/object';
import { isArray, isObject, isUndefined } from '../tools/typeCheck';
import { CREATE, DEFINE_PROPERTY, DELETE, DELETE_PROPERTY, NULL, PARENT, PROPS, STATE, VALUE, UNDEFINED, UPDATE, ON_SET, NEW_VALUE, OLD_VALUE } from '../tools/constants';

/**
 * State wrapps an object/array in a Proxy to track changes and notify listeners.
 * @param {Object|Array} target The object/array to observe
 * @param {Object} [options] Options for the state
 * @param {Object} [options.parent] The parent state object
 * @returns proxied
*/
// @ts-ignore
export let state: State = (target: any, options?: StateOptions) => {

    /**
     * Do not observe the target if:
     * - The target is already observed, or
     * - The target is not an object/array.
     */
    if (!isArrayOrObject(target) || isState(target)) return target;

    /** The parent state object */
    let parent = getKey(options, PARENT, NULL) as any;

    // State options
    options = { parent };

    // Proxy handler
    let handler = {
        get(target: any, prop: string): any {

            /**
             * Track the accessed property if: isTracking && (isInTarget || !isInParent)
             * (isInTarget || !isInParent): is necessary to avoid tracking properties that are in the parent object.
             * It will track props that are in the target object or not (undefined props), as long as they are not in the parent object.
             * 
             * @example:
               let s1 = state({ a: 1 });
               let s2 = state({ b: 2 }, { parent: s1});

               s2.a; // prop 'a' is in s1, so it WILL NOT be tracked for s2. The get trap will be triggered for s1 and it will be properly tracked.
               s2.b; // prop 'b' is in s2, so it will be tracked for s2.
               s2.c; // prop 'c' is not in s2 or s1, so it will be tracked for s2. 'c' is an undefined property at this point, but it may be set later and it should be tracked so it can notify listeners.
             */
            if (trackProps && (hasOwnProperty(target, prop) || !(prop in target))) arrayAdd(accessedProps, [proxied, prop]);

            return R.get(target, prop, proxied);
        },
        set(target: any, prop: string, newValue: any): boolean {

            /**
             * If the property does not exist in the context, make sure it is set in THIS target object, not in the parent object.
             * This is necessary because the default behavior is to traverse the prototype chain in search of the property, 
             * when it arrives at the end of the chain without finding the property, it sets the property in that object.
             * This behavior is not intuitive, it is expensive, and can cause reactivity issues.
             * The expected behavior is to set the property in the target object when it does not exist in the context.
             * 
             * To demonstrate this behavior, consider the following example:
             * 
                let s1 = state({ a: 1 });
                let s2 = state({ b: 2 }, { parent: s1});
                let s3 = state({ c: 3 }, { parent: s2});

                s3.d = 4; // this would trigger the set trap in s3, s2, and finally s1. The property 'd' would be set in s1.

                effect(() => console.log('s1', s1.d));
                effect(() => console.log('s2', s2.d));
                effect(() => console.log('s3', s3.d));

                s3.d = 5; // this would trigger the effects multiple times due to the set trap being triggered during the traversal of the prototype chain.
             * 
             * The one-liner below ensures that the property is set in the target object when it does not exist in the context.
             * This fixes the issue of traversing the prototype chain and ensures that listeners are triggered correctly.
             */
            if (!(prop in target)) setKey(target, prop, {w: true, e: true, c: true});

            // Get the old value (a.k.a. the current value)
            let oldValue = proxied[prop];

            // Do not set the new value if it is equal to the old value
            if (oldValue === newValue) return true;

            let stateObject = getStateObject(proxied);

            // Call the property init function, if present
            if (propertyInitFns.has(newValue))
                newValue = newValue({[STATE]: proxied, prop, [NEW_VALUE]: newValue, [OLD_VALUE]: oldValue}, stateObject, newValue);

            // Attempt to observe the value if the property is not marked to skip observation
            if (!skip.has(prop))
                newValue = state(newValue);

            /**
             * If an observed array/object is being reassigned to a new array/object, update the listeners.
             * This is necessary because the reference to the observed array/object has changed.
             * Note that the old and new values must be of the same type (array or object).
             */
            if (isState(oldValue) && isState(newValue)) {
                stateObjects.set(newValue, getStateObject(oldValue));
                stateObjects[DELETE](oldValue);
            }

            // Set the new value
            let result: boolean = R.set(target, prop, newValue, proxied);

            // Call the property set functions, if any
            if (stateObject[ON_SET][prop])
                each(stateObject[ON_SET][prop], fn => fn({[STATE]: proxied, prop, [NEW_VALUE]: newValue, [OLD_VALUE]: oldValue}, stateObject, fn));

            // Notify listeners about the property change
            notifyListeners(stateObject, proxied, prop, newValue, oldValue);

            return result;
        },
        [DELETE_PROPERTY](target: any, prop: string) {

            let oldValue = target[prop];

            // Delete the property
            let result = R[DELETE_PROPERTY](target, prop);

            // Notify listeners about the property deletion
            notifyListeners(getStateObject(proxied), proxied, prop, UNDEFINED, oldValue);

            return result;
        },
        [DEFINE_PROPERTY](target: any, prop: string, descriptor: PropertyDescriptor) {

            let newValue = descriptor[VALUE];
            let oldValue = proxied[prop];

            // Call the property initialization function if present
            if (propertyInitFns.has(newValue))
                descriptor[VALUE] = newValue({[STATE]: proxied, prop, [NEW_VALUE]: newValue, [OLD_VALUE]: oldValue}, getStateObject(proxied), newValue);

            // Attempt to observe the value if the property is not marked to skip observation
            if (!skip.has(prop) && VALUE in descriptor)
                descriptor[VALUE] = state(descriptor[VALUE]);

            return R[DEFINE_PROPERTY](target, prop, descriptor);
        },
    }

    // Create a proxy for the object/array
    const proxied = new Proxy(isState(parent) ? createContext(parent, target) : target, handler);

    /**
     * Skip specific keys/indexes from being automatically observed.
     * 
     * Note that these keys/indexes can still be observed manually.
     */
    const skip: Set<string|number> = new Set();

    // Create the state object
    let stateObject: StateObject = {
        [STATE]: newMap(),
        [PROPS]: {},
        skip,
        [ON_SET]: {},
    };

    // Add the new proxied state to the state objects
    stateObjects.set(proxied, stateObject);

    // Observe nested arrays/objects
    for (let prop in target) {

        let value = target[prop];

        // Call the property initialization function if present
        if (propertyInitFns.has(value)) {
            value = value({[STATE]: proxied, prop, [NEW_VALUE]: value, [OLD_VALUE]: UNDEFINED}, stateObject, value);
            R.set(target, prop, value, proxied);
        }

        // Attempt to observe the value if the property is not marked to skip observation
        // Note: R.set silently handles getters and setters
        else if (!skip.has(prop) && isArrayOrObject(value)) {
            R.set(target, prop, value, proxied);
        }
    }

    return proxied;
}



// * STATE HELPERS

/** Check if a value is an array or object */
let isArrayOrObject = (value: any) => 
    isArray(value) || isObject(value);

/** Function to notify computed functions about property changes */
let notifyListeners = (stateObject: StateObject, proxied: any, prop: any, newValue: any, oldValue: any) => {

    let operation = isUndefined(oldValue) ? CREATE : isUndefined(newValue) ? DELETE : UPDATE;

    let context: ListenerFunctionContext = {operation, [STATE]: proxied, prop, [NEW_VALUE]: newValue, [OLD_VALUE]: oldValue};

    // Notify state listeners
    _notifyListeners(stateObject[STATE], context);

    // Notify property listeners
    if (stateObject[PROPS][prop])
        _notifyListeners(stateObject[PROPS][prop], context);
}

/** Notify state listeners */
let _notifyListeners = async (listeners: ListenerFunctions, context: ListenerFunctionContext) => {
    // Convert the map to an array
    let fns = arrayFrom(listeners) as [ListenerFunction, number][];

    // Sort the listeners by priority
    sort(fns, sortPriority);

    // Call the listeners by priority
    for (let [listener] of fns) await listener(context);
}