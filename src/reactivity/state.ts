import { ListenerFunction, listeners, computedStack, getListener, addPropertyListener, IGNORE, CALLBACK } from '.';
import { trackProps, accessedProps } from './track';
import { deepEqual } from '../tools';
import { isArray, isObject, isUndefined } from '../tools/typeCheck';
import { CREATE, DELETE, UPDATE } from '../tools/constants';


/**
 * State wrapps an object/array in a Proxy to track changes and dependencies.
 * @param value The object/array to observe
 * @returns observedState
*/
export let state = (value: any) => {

    // If the object/array is already observed, return it
    if (listeners.has(value) || !isArrayOrObject(value)) return value;

    // Proxy handler
    let handler = {
        get(target: any, prop: string, receiver: any) {

            // If there's a function in the computedStack, map it to the accessed property
            if (computedStack.length > 0) {
                let computedFn = computedStack[computedStack.length - 1];
                // Track accessed properties
                addPropertyListener(receiver, prop, computedFn);
            }

            // Register the accessed property
            if (trackProps && !ignore(receiver, prop)) {
                accessedProps.push([receiver, prop]);
            }

            return Reflect.get(target, prop, receiver);
        },
        set(target: any, prop: string, newValue: any, receiver: any) {
            let oldValue = target[prop];

            // If the new/old value are equal, return
            if (deepEqual(oldValue, newValue)) return true;

            // Observe the new value if it's an object/array
            newValue = state(newValue);

            // Set the new value
            let result = Reflect.set(target, prop, newValue, receiver);

            // Notify computed functions about property changes
            notifyDependencies(prop, newValue, oldValue);

            return result;
        },
        deleteProperty(target: any, prop: string) {
            let oldValue = target[prop];

            // Delete the property
            let result = Reflect.deleteProperty(target, prop);

            // Notify computed functions about property deletion
            notifyDependencies(prop, undefined, oldValue);

            return result;
        },
    };

    for (let key in value) {
        // Recursively observe nested arrays/objects
        if (isArrayOrObject(value[key])) {
            value[key] = state(value[key]);
        }
    }

    // Create a proxy for the object/array
    const observedState = new Proxy(value, handler);

    // Function to notify computed functions about property changes
    let notifyDependencies = async (prop: any, newValue: any, oldValue: any) => {

        // Don't notify about array length changes
        if ((isArray(observedState) && prop == 'length')) return;

        let operation = isUndefined(oldValue) ? CREATE : isUndefined(newValue) ? DELETE : UPDATE;

        let context = {operation, observedState, prop, newValue, oldValue};

        // Notify target listeners
        let listener = getListener(observedState);
        if (listener.state.size > 0) {
            // listener.state.forEach((fn: ListenerFunction) => await fn(context));
            for (let fn of listener.state) {
                await fn(context);
            }
        }

        if (listener.props[prop]) {
            listener.props[prop].forEach((fn: ListenerFunction) => {
                // Run the computed function or its callback
                ((fn as any)[CALLBACK] ? (fn as any)[CALLBACK] : fn)(context);
            });
        }
    }

    return observedState;
}



// * STATE HELPERS

let isArrayOrObject = (value: any) => 
    isArray(value) || isObject(value);

let ignore = (receiver: any, prop: string|symbol) => 
    prop === Symbol.unscopables || IGNORE in receiver;