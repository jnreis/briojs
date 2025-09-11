import { getStateObject, isState, stateObjects, initPropFns } from '.';
import { trackProps, accessedProps } from './track';
import { arrayAdd, arrayFrom, each, sort, sortPriority } from '../tools/array';
import { R, createContext, getProp, hasProp, newMap, newSet, setObjectKeys, setProp } from '../tools/object';
import { isArray, isObject, isUndefined } from '../tools/typeCheck';
import { CREATE, DEFINE_PROPERTY, DELETE, DELETE_PROPERTY, NULL, PARENT, PROPS, STATE, VALUE, UNDEFINED, UPDATE, NEW_VALUE, OLD_VALUE, OPERATION, TARGET } from '../tools/constants';

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
    let parent = getProp(options, PARENT, NULL) as any;

    // State options
    options = { [PARENT]: parent };

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
            if (trackProps && (hasProp(target, prop) || !(prop in target))) arrayAdd(accessedProps, [proxied, prop]);

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
            if (!(prop in target)) setProp(target, prop);

            // Get the old value (a.k.a. the current value)
            let oldValue = proxied[prop];

            // Do not set the new value if it is equal to the old value
            if (oldValue === newValue) return true;

            let stateObject = getStateObject(proxied);

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
            setObjectKeys(context, 'wc');

            // Call the property initialization function, if present
            if (initPropFns.has(newValue)) {

                // Remove the property initialization function from the set
                initPropFns[DELETE](newValue);

                // Call the property initialization function. This will return the new value to be set
                newValue = newValue(context);
            }

            // let isNewValueState = isState(newValue);

            // Attempt to observe the value if the property is not marked to skip observation
            if (!skip.has(prop))
                newValue = state(newValue);

            // Set the newValue in the context
            context[NEW_VALUE] = newValue;

            // Set the operation in the context
            setContextOperation(context);

            // Set the new value
            let result: boolean = R.set(target, prop, newValue, proxied);

            /**
             * If an observed array/object is being reassigned to a new observed array/object, update the refs listeners.
             * This will keep track of where the observed state is being referenced in other states and ensure that property listeners are notified correctly.
             */
            // if (isState(oldValue) && isState(newValue)) {
            //     let oldStateObject = getStateObject(oldValue);

            //     // The new value is already an observed state
            //     if (isNewValueState) {
            //         // Copy the referenced items from the old state object to the new state object
            //         each(oldStateObject[REFS], ([state, prop]) => 
            //             addPropertyReference(state, prop, newValue)
            //         );
            //     }

            //     // The new value was not an observed state, copy the existing state object
            //     else {
            //         let newStateObject = getStateObject(newValue);
            //         console.log('state - copying state object:', oldStateObject.proxied, 'to', newStateObject.proxied);
            //         // each([PROPS, REFS, SKIP, STATE], (item: keyof StateObject) => newStateObject[item] = deepClone(oldStateObject[item]));
            //         newStateObject[REFS] = [...newStateObject[REFS], ...oldStateObject[REFS]];
            //     }
            // }

            // // Remove the property reference from the old value, if it is a state
            // removePropertyReference(proxied, prop, oldValue);

            // // Add the property reference to the new value, if it is a state
            // addPropertyReference(proxied, prop, newValue);

            // // Call the onSet functions for the property, if any
            // if (stateObject[ON_SET][prop]) {
            //     each(stateObject[ON_SET][prop], fn => fn({
            //         [STATE]: proxied, 
            //         prop, 
            //         [NEW_VALUE]: newValue, 
            //         [OLD_VALUE]: oldValue
            //     }, stateObject, fn));
            // }

            // Notify listeners about the property change
            notifyListeners(stateObject, context);

            return result;
        },
        [DELETE_PROPERTY](target: any, prop: string) {

            let oldValue = target[prop];

            // Delete the property
            let result = R[DELETE_PROPERTY](target, prop);

            // Notify listeners about the property deletion
            notifyListeners(getStateObject(proxied), {
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
        // [TARGET]: target,
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

    // // Prepare to notify the property listeners of other objects that have this new value as a property
    // each([...stateObject[REFS]], ([state, property]) => {

    //     // This proxied state is referenced in the property of another state object
    //     if (state[property] === context[STATE]) {

    //         // Get the state object of the referenced state
    //         let newStateObject = getStateObject(state);

    //         // If the referenced state object has listeners for the property, add them to the listeners map
    //         if (newStateObject && newStateObject[PROPS][property]) {

    //             console.warn('notify listeners - newStateObject:', newStateObject[PROPS][property].size);

    //             // Prepare to notify the listeners of the property in the referenced state object
    //             each(newStateObject[PROPS][property], (order, fn) => {
    //                 if(listeners.has(fn)) {
    //                     console.warn('notify listeners - duplicate listener:', fn, 'in', newStateObject[PROPS][property]);
    //                 }
    //                 listeners.set(fn, order);
    //             });
    //         }
    //     }
    //     // Remove the property reference from this state object
    //     else removePropertyReference(state, property, context[STATE]);
    // });

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

// let addPropertyReference = (state: any, prop: Prop, value: any) => {
//     if (isState(value) && state[prop] === value) {

//         let refs = getStateObject(value)[REFS];

//         // If the property is not already referenced, add it
//         if (!refs.some(([s, p]) => s === state && p === prop)) {
//             arrayAdd(refs, [state, prop]);
//         }
//     }
// }

// let removePropertyReference = (state: any, prop: Prop, value: any) => {
//     if (isState(value)) {

//         let refs = getStateObject(value)[REFS];

//         // Remove the reference to the property
//         let index = refs.findIndex(([s, p]) => s === state && p === prop);
//         if (index !== -1) {
//             refs.splice(index, 1);
//         }
//     }
// }