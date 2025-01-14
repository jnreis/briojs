import { DELETE, PROPS, SKIP, STATE } from '../tools/constants';
import { newMap, setKey } from '../tools/object';
import { skipProp } from './skip';
import { state } from './state';
import { storage } from './storage';

// * VARIABLES

/**
 * The state object that holds a reference to all observed states, their parent observed state (if any), listeners, and other settings.
 */
export let stateObjects: Map<any, StateObject> = newMap();

/**
 * Holds temporary functions that are called when a state is set to initialize the property.
 * 
 * In the example below, $persist() and $session() will each add a function to this propertyInitFns Set.
 * @example
 * let myState = state({ count: $persist(0) });
 * let myState = state({ count: $session(0) });
 */
export let propertyInitFns: Set<FunctionType> = new Set();



// * HELPERS

/** Check if a value is an observed state */
export let isState = (proxied: any) => stateObjects.has(proxied);

/** Get the state object for an observed state */
export let getStateObject = (proxied: any) =>
    stateObjects.get(proxied) as StateObject;

/**
 * Add a listener to an observed state
 * @returns The disposer function to remove the listener from the state
 */
export let addStateListener = (proxied: any, fn: ListenerFunction, priority: number = 0) => {
    if (isState(proxied)) {
        // Get the state listeners map
        let stateMap = getStateObject(proxied)[STATE];

        // Add the listener
        stateMap.set(fn, priority);

        // Return the disposer function to remove the listener
        return () => stateMap[DELETE](fn);
    }
}

/**
 * Add a listener to a property of an observed state
 * @returns The disposer function to remove the listener from the property and state (if the property is also an observed state)
 */
export let addPropertyListener = (proxied: any, prop: string | number, fn: ListenerFunction, priority: number = 0) => {
    // Get the properties object
    let propsObject = getStateObject(proxied)[PROPS];

    // If the property doesn't exist in the properties object, add it
    if (!propsObject[prop]) propsObject[prop] = newMap();

    // Add the listener to the property map
    // This will notify the listener when the property is set/deleted
    propsObject[prop].set(fn, priority);

    // If the property is also a state, add the listener to the state
    // This will notify the listener when the properties of this state are set/deleted
    let removeStateListener = addStateListener(proxied[prop], fn, priority);

    return () => {
        propsObject[prop][DELETE](fn);
        if (removeStateListener) removeStateListener();
    }
}

setKey(state, 'persist', { v: (value: any, alias?: string) => storage(localStorage, value, alias) });
setKey(state, 'session', { v: (value: any, alias?: string) => storage(sessionStorage, value, alias) });
setKey(state, SKIP, { v: skipProp });


// * API

export { state } from './state';
export { effect } from './effect';
export { watch } from './watch';
export { storage, storageEvent } from './storage';