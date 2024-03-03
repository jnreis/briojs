import {
    ListenerFunction, 
    listeners, getListener, removePropertyListeners, computedStack, 
    CALLBACK } from '.';
// import { trackProps, accessedProps } from './track';
import { deepEqual, has } from '../tools';
import { getKeys } from '../tools/object';
import { isArray, isObject, isUndefined } from '../tools/typeCheck';
import { CREATE, DELETE, UPDATE } from '../tools/constants';


/**
 * State wrapps an object/array in a Proxy to track changes and notify listeners.
 * @param target The object/array to observe
 * @returns observedState
*/
export let state = (target: any) => {

    // If the object/array is already observed, return it
    if (listeners.has(target) || !isArrayOrObject(target)) return target;

    // Proxy handler
    let handler = {
        get(target: any, prop: string, receiver: any) {

            if (has(getKeys(target), prop)) {
                // Get the last item in the computed stack and add the accessed property to it
                if (computedStack.length > 0) {
                    computedStack[computedStack.length - 1].push([receiver, prop]);
                }

                // // Register the accessed property
                // if (trackProps) {
                //     accessedProps.push([receiver, prop]);
                // }
            }

            // return value[prop];
            return Reflect.get(target, prop, receiver);
        },
        set(target: any, prop: string, newValue: any, receiver: any) {
            let oldValue = receiver[prop];

            // If the new/old value are equal, return
            if (deepEqual(oldValue, newValue)) return true;

            // Observe the new value if it's an object/array
            newValue = state(newValue);

            // If an observed array/object is being reassigned to a new array/object, update the listeners.
            // This is necessary because the reference to the observed array/object has changed.
            if (listeners.has(oldValue) && isArrayOrObject(newValue)) {
                listeners.set(newValue, listeners.get(oldValue)!);
                listeners.delete(oldValue);
            }

            // Set the new value
            let result = Reflect.set(target, prop, newValue, receiver);

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

    for (let key in target) {
        // Recursively observe nested arrays/objects
        if (isArrayOrObject(target[key])) {
            target[key] = state(target[key]);
        }
    }

    // Create a proxy for the object/array
    const observedState = new Proxy(target, handler);

    // Add the observed object/array to the listeners
    getListener(observedState);

    // Function to notify computed functions about property changes
    let notifyListeners = (prop: any, newValue: any, oldValue: any) => {

        // Don't notify about array length changes
        if ((isArray(target) && prop == 'length')) return;

        let operation = isUndefined(oldValue) ? CREATE : isUndefined(newValue) ? DELETE : UPDATE;

        let context = {operation, observedState, prop, newValue, oldValue};

        // State listeners
        let listener = getListener(observedState);

        // Notify state listeners
        notifyStateListeners(observedState, context);

        // Notify property listeners of the state
        if (listener.props[prop]) {
            listener.props[prop].forEach((fn: ListenerFunction) => {
                // Run the computed function or its callback
                ((fn as any)[CALLBACK] ? (fn as any)[CALLBACK] : fn)(context);
            });
        }

        // // If property is also an state, notify its listeners
        // if (listeners.has(observedState[prop])) {
        //     notifyStateListeners(observedState[prop], context);
        // }
    }

    return observedState;
}



// * STATE HELPERS

let isArrayOrObject = (value: any) => 
    isArray(value) || isObject(value);

// let ignore = (receiver: any) => IGNORE in receiver;

let notifyStateListeners = (observedState: any, context: any) =>
    getListener(observedState).state.forEach((fn: ListenerFunction) => fn(context));