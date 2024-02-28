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

// Add a listener to an observed state
export let addStateListener = (observedState: any, fn: ListenerFunction) => {
    getListener(observedState).state.add(fn);
}

// Remove a listener from an observed state
export let removeStateListener = (observedState: any, fn: ListenerFunction) => {
    listeners.get(observedState)?.state.delete(fn);
}

// Add a listener to a property of an observed state
export let addPropertyListener = (observedState: any, prop: string|number, fn: ListenerFunction) => {
    let dependency = getListener(observedState);
    if (!dependency.props[prop]) {
        dependency.props[prop] = new Set();
    }
    dependency.props[prop].add(fn);
}

// Remove a listener from a property of an observed state
export let removePropertyListener = (fn: ListenerFunction) => {
    listeners.forEach(listener => {
        for (let prop in listener.props) {
            listener.props[prop].delete(fn);
        }
    });
}



// * API

export { state } from './state';
export { computed, removeComputed } from './computed';
export { effect } from './effect';
export { watch, watchAll } from './watch';
export { trackAccessedProps, type PropRef } from './track';