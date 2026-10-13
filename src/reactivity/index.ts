import { DELETE, PROPS, SKIP, STATE } from '../tools/constants';
import { newMap, newSet, setProp } from '../tools/object';
import { skipProp } from './skip';
import { state } from './state';

// * VARIABLES

/**
 * The state object that holds a reference to all observed states, their parent observed state (if any), listeners, and other settings.
 */
export let stateObjects: WeakMap<object, StateObject> = new WeakMap();

/**
 * Holds temporary functions that are called when a state is set to initialize the property.
 * 
 * In the example below, $persist() and $session() will each add a function to this initPropFns Set.
 * @example
 * let myState = state({ count: $persist(0) });
 * let myState = state({ count: $session(0) });
 */
export let initPropFns = newSet() as Set<FunctionType>;

export let initProp = (fn: FunctionType) => initPropFns.add(fn) && fn;


// * HELPERS

/** Check if a value is an observed state */
export let isState = (proxied: any) => stateObjects.has(proxied);

/** Get the state object for an observed state */
export let getStateObject = (proxied: any) =>
    stateObjects.get(proxied) as StateObject;

export let delState = (proxied: any) => {
    let stateObject = stateObjects.get(proxied);
    if (!stateObject) return false;
    for (let cleanup of stateObject.cleanup || []) cleanup();
    stateObject[STATE].clear();
    for (let prop in stateObject[PROPS]) {
        stateObject[PROPS][prop].clear();
        delete stateObject[PROPS][prop];
    }
    return stateObjects.delete(proxied);
}

export let addStateCleanup = (proxied: any, cleanup: FunctionType) => {
    let stateObject = getStateObject(proxied);
    (stateObject.cleanup ||= newSet()).add(cleanup);
    return () => {
        stateObject.cleanup?.delete(cleanup);
        cleanup();
    };
}

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

    // // If the property value is an observed state, add the listener to the state as well
    // let propValue = proxied[prop];
    // Return the disposer function to remove the listener from the property
    return () => {
        propsObject[prop][DELETE](fn);
        if (!propsObject[prop].size) delete propsObject[prop];
    }
}

setProp(state, 'init', initProp, 'e');
setProp(state, SKIP, skipProp, 'e');

// * API

export { state } from './state';
export { effect } from './effect';
export { watch } from './watch';
export { storage, storageEvent } from './storage';
export { computed } from './computed';
export { persist, session } from './storage';