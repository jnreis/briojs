// * TYPES

export type ListenerFunction = (context: {operation: string, observedState: any, prop: string, newValue: any, oldValue: any}) => any;
export type ListenerFunctions = Set<ListenerFunction>;
export type ListenerObject = {
    state: ListenerFunctions,
    props: {
        [prop: string|number]: ListenerFunctions
    }
};
export type Listeners = Map<any, ListenerObject>;



// * VARIABLES

// The reference to all observed objects/arrays and their listeners
// These listeners receive every change to the observed object/array
export let listeners: Listeners = new Map();

// Hold computed functions currently being executed
export let computedStack: any[] = [];

// Internal callback symbol
export let CALLBACK = Symbol('callback');

// Ignore access tracking
export let IGNORE = Symbol('ignore');



// * HELPERS

// Get the listener object for an observed state
export let getListener = (observedState: any) => {
    if (!listeners.has(observedState)) {
        listeners.set(observedState, {
            state: new Set(),
            props: {}
        });
    }
    return listeners.get(observedState) as ListenerObject;
}

// // Add a listener to an observed state
// export let addStateListener = (observedState: any, fn: ListenerFunction) => {
//     getListener(observedState).state.add(fn);
// }

// // Remove a listener from an observed state
// export let removeStateListener = (observedState: any, fn: ListenerFunction) => {
//     getListener(observedState).state.delete(fn);
// }

// Add a listener to a property of an observed state
export let addPropertyListener = (observedState: any, prop: string, fn: ListenerFunction) => {

    // Get the listener object for the observed state
    let listener = getListener(observedState);

    // If the property doesn't exist in the listener, add it
    if (!listener.props[prop])
        listener.props[prop] = new Set();

    // Add the listener to the property
    listener.props[prop].add(fn);

    // If the property is also a state, add the listener to the state
    if (listeners.has(observedState[prop]))
        getListener(observedState[prop]).state.add(fn);
}

// Remove a listener from a property of an observed state
export let removePropertyListeners = (observedState: any, prop: string) => {
    let listener = getListener(observedState);
    if (listener.props[prop]) {
        listener.props[prop].clear();
    }
}

// Remove a listener from all states and properties
export let removeListener = (fn: ListenerFunction) => {
    listeners.forEach(listener => {
        listener.state.delete(fn);
        for (let prop in listener.props) {
            listener.props[prop].delete(fn);
        }
    });
}



// * API

export { state } from './state';
export { computed, removeComputed } from './computed';
export { effect } from './effect';
export { watch } from './watch';
export { trackAccessedProps, type PropRef } from './track';