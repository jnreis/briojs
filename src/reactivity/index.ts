import { each } from '../tools/array';
import { DELETE, PROPS, STATE } from '../tools/constants';

// * VARIABLES

/**
 * The state object that holds a reference to all observed states, their parent observed state (if any), listeners, and other settings.
 */
export let stateObjects: Map<any, StateObject> = new Map();

/** Internal callback symbol */
export let CALLBACK = Symbol('callback');



// * HELPERS

/** Check if a value is an observed state */
export let isState = (proxied: any) => stateObjects.has(proxied);

export let setStateObject = (proxied: any, /* target: any, ignoreKeys: string[], parent?: any */) => {
    if (!isState(proxied)) {
        stateObjects.set(proxied, {
            // [PROXIED]: proxied,
            // [TARGET]: target,
            // [PARENT]: parent,
            // [IGNORE_KEYS]: ignoreKeys,
            [STATE]: new Map(),
            [PROPS]: {}
        });
    }
}

/** Get the state object for an observed state */
export let getStateObject = (proxied: any) => {
    return stateObjects.get(proxied) as StateObject;
}

export let getStateListeners = (proxied: any) =>
    getStateObject(proxied)[STATE];

/** Add a listener to a property of an observed state */
export let addPropertyListener = (proxied: any, prop: string | number, fn: ListenerFunction, priority: number = 0) => {

    let stateObject = getStateObject(proxied);

    // If the property doesn't exist in the listener, add it
    if (!stateObject[PROPS][prop])
        stateObject[PROPS][prop] = new Map();

    // Add the listener to the property
    stateObject[PROPS][prop].set(fn, priority);

    // If the property is also a state, add the listener to the state
    if (isState(proxied[prop]))
        getStateListeners(proxied[prop]).set(fn, priority);
}

/** Remove a listener from a property of an observed state */
export let removePropertyListeners = (stateObject: StateObject, prop: string) => {
    if (stateObject[PROPS][prop])
        stateObject[PROPS][prop].clear();
}

/** Remove a listener from all states and properties */
export let removeListener = (fn: ListenerFunction) => {
    each(stateObjects as any, stateObject => {
        // Remove the state listeners
        stateObject[STATE][DELETE](fn);

        // Remove the property listeners
        for (let prop in stateObject[PROPS]) {
            stateObject[PROPS][prop][DELETE](fn);
        }
    });
}



// * API

export { state } from './state';
export { computed, removeComputed } from './computed';
export { effect } from './effect';
export { watch } from './watch';
export { storage, storageEvent } from './storage';