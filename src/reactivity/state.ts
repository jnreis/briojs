import { isState, stateObjects, initPropFns } from '.';
import { trackProps, accessedProps } from './track';
import { arrayAdd, arrayFrom, each, some, sort, sortPriority } from '../tools/array';
import { R, createContext, hasProp, newMap, newSet, setObjectKeys, setProp, sync } from '../tools/object';
import { isArray, isObject, isUndefined } from '../tools/typeCheck';
import { CREATE, DEFINE_PROPERTY, DELETE, DELETE_PROPERTY, PROPS, STATE, VALUE, UNDEFINED, UPDATE, NEW_VALUE, OLD_VALUE, OPERATION, TARGET } from '../tools/constants';

/**
 * State wrapps an object/array in a Proxy to track changes and notify listeners.
 * @param {Object|Array} target The object/array to observe
 * @param {Object} [parent] The parent state object, if any
 * @returns proxied
*/
// @ts-ignore
export let state: State = (target: any, parent?: any) => {

    /**
     * Do not observe the target if:
     * - The target is already observed, or
     * - The target is not an object/array.
     */
    if (!isArrayOrObject(target) || isState(target)) return target;

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
               let s2 = state({ b: 2 }, s1);

               s2.a; // prop 'a' is in s1, so it WILL NOT be tracked for s2. The get trap will be triggered for s1 and it will be properly tracked.
               s2.b; // prop 'b' is in s2, so it will be tracked for s2.
               s2.c; // prop 'c' is not in s2 or s1, so it will be tracked for s2. 'c' is an undefined property at this point, but it may be set later and it should be tracked so it can notify listeners.
             */
            if (trackProps && (hasProp(target, prop) || !(prop in target))) {
                // Ensure the accessed property is added to the accessedProps array only once per getAccessedProps execution
                if (!some(accessedProps, ([proxied2, prop2]) => proxied2 === proxied && prop2 === prop)) {
                    arrayAdd(accessedProps, [proxied, prop]);
                }
            }

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
                let s2 = state({ b: 2 }, s1);
                let s3 = state({ c: 3 }, s2);

                s3.d = 4; // this would trigger the set trap in s3, s2, and finally s1. The property 'd' would be set in s1.

                effect(() => console.log('s1', s1.d));
                effect(() => console.log('s2', s2.d));
                effect(() => console.log('s3', s3.d));

                s3.d = 5; // this would trigger the effects multiple times due to the set trap being triggered during the traversal of the prototype chain.
             * 
             * The one-liner below ensures that the property is set in the target object when it does not exist in the context.
             * This fixes the issue of traversing the prototype chain and ensures that listeners are triggered correctly.
             */
            if (!(prop in target)) setProp(target, prop, UNDEFINED, 'wce');

            // Get the old value (a.k.a. the current value)
            let oldValue = proxied[prop];

            // Do not set the new value if it is equal to the old value
            if (oldValue === newValue) return true;

            let context: any = {
                [TARGET]: target,
                [STATE]: proxied,
                prop,
                [OLD_VALUE]: oldValue,
                // [NEW_VALUE]: newValue,
                // [OPERATION]: UNDEFINED,
            };

            // Lock the context to prevent it from being modified
            // Except for `newValue` and `operation`, which will be set later
            setObjectKeys(context, 'e');

            // Call the property initialization function, if present
            if (initPropFns.has(newValue)) {

                // Remove the property initialization function from the set
                initPropFns[DELETE](newValue);

                // Call the property initialization function. This will return the new value to be set
                newValue = newValue(context);
            }

            const isSameType = (isArray(newValue) && isArray(oldValue)) || (isObject(newValue) && isObject(oldValue));

            // If the new value and old value are both arrays or both objects, sync the new value with the old value to preserve reactivity.
            if (isSameType) {
                sync(oldValue, newValue);
            }

            // Attempt to observe the value if the property is not marked to skip observation
            // Note: When the new value and old value are of the same type, we sync them instead of replacing them to preserve reactivity.
            // In this case, we don't need to observe the new value because we are not replacing the old value, we are just syncing it.
            if (!skip.has(prop) && !isSameType) {
                newValue = state(newValue);
            }

            // Set the newValue in the context
            context[NEW_VALUE] = isSameType ? oldValue : newValue;

            // Set the operation in the context
            setContextOperation(context);

            // Set the new value
            let result: boolean = isSameType ? true : R.set(target, prop, newValue, proxied);

            // Notify listeners about the property change
            notifyListeners(stateObject, context);

            return result;
        },
        [DELETE_PROPERTY](target: any, prop: string) {

            let oldValue = target[prop];

            // Delete the property
            let result = R[DELETE_PROPERTY](target, prop);

            // Notify listeners about the property deletion
            notifyListeners(stateObject, {
                [TARGET]: target,
                [STATE]: proxied,
                prop,
                [OLD_VALUE]: oldValue,
                [NEW_VALUE]: UNDEFINED,
                [OPERATION]: DELETE,
            });

            return result;
        },
        [DEFINE_PROPERTY](target: any, prop: string, descriptor: PropertyDescriptor) {

            let newValue = descriptor[VALUE];
            let oldValue = proxied[prop];

            // Call the property initialization function if present
            if (initPropFns.has(newValue))
                descriptor[VALUE] = newValue({[STATE]: proxied, prop, [NEW_VALUE]: newValue, [OLD_VALUE]: oldValue});

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
    const skip = newSet() as Set<string|number|symbol>;

    // Create the state object
    let stateObject: StateObject = {
        // [PARENT]: parent,
        [TARGET]: target,
        // proxied,
        [STATE]: newMap(),
        [PROPS]: {},
        skip,
        // refs: [],
        // [ON_SET]: {},
    };

    // Add the new proxied state to the state objects
    stateObjects.set(proxied, stateObject);

    // Observe nested arrays/objects
    for (let prop in target) {

        let value = target[prop];

        // Call the property initialization function if present
        if (initPropFns.has(value)) {
            value = value({
                [TARGET]: target,
                [STATE]: proxied,
                prop,
                [OLD_VALUE]: UNDEFINED,
            });
        }

        // Attempt to observe the value if the property is not marked to skip observation
        // Note: R.set silently handles getters and setters
        if (!skip.has(prop) && isArrayOrObject(value)) {
            R.set(target, prop, value, proxied);
            // addPropertyReference(proxied, prop, proxied[prop]);
        }
    }

    return proxied;
}



// * STATE HELPERS

/** Check if a value is an array or object */
let isArrayOrObject = (value: any) => 
    isArray(value) || isObject(value);

/**
 * Function to notify computed functions about property changes
 * 
 * Listeners and notification rules:
 * - attach listener(s) to a property of a state (stateObject.props.prop)
 * - attach listener(s) to a state (stateObject.state)
 * - when a property is set, notify property listener(s) first, then notify state listeners
 * 
 */
let notifyListeners = (stateObject: StateObject, context: ListenerFunctionContext) => {

    let listeners = newMap() as ListenerFunctions;

    // Prepare to notify the property listeners in this state object
    let propStateObject: any = stateObject[PROPS][context.prop];
    if (propStateObject) {
        each(propStateObject, (order, fn) => listeners.set(fn, order));
    }

    // Notify state listeners in this state object
    each(stateObject[STATE], (order, fn) => listeners.set(fn, order));

    // Convert the map list to an array
    let fns = arrayFrom(listeners) as [ListenerFunction, number][];

    // Sort the listeners by priority
    sort(fns, sortPriority);

    // Call the listeners by priority
    for (let [listener] of fns) listener(context);
}

let setContextOperation = (context: ListenerFunctionContext) => {
    // Set the operation in the context
    context[OPERATION] = isUndefined(context[OLD_VALUE]) ? CREATE : isUndefined(context[NEW_VALUE]) ? DELETE : UPDATE;
}
