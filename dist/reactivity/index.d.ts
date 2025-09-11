/**
 * The state object that holds a reference to all observed states, their parent observed state (if any), listeners, and other settings.
 */
export declare let stateObjects: Map<any, StateObject>;
/**
 * Holds temporary functions that are called when a state is set to initialize the property.
 *
 * In the example below, $persist() and $session() will each add a function to this initPropFns Set.
 * @example
 * let myState = state({ count: $persist(0) });
 * let myState = state({ count: $session(0) });
 */
export declare let initPropFns: Set<FunctionType>;
export declare let initProp: (fn: FunctionType) => FunctionType;
/** Check if a value is an observed state */
export declare let isState: (proxied: any) => boolean;
/** Get the state object for an observed state */
export declare let getStateObject: (proxied: any) => StateObject;
export declare let delState: (proxied: any) => boolean;
/**
 * Add a listener to an observed state
 * @returns The disposer function to remove the listener from the state
 */
export declare let addStateListener: (proxied: any, fn: ListenerFunction, priority?: number) => (() => boolean) | undefined;
/**
 * Add a listener to a property of an observed state
 * @returns The disposer function to remove the listener from the property and state (if the property is also an observed state)
 */
export declare let addPropertyListener: (proxied: any, prop: string | number, fn: ListenerFunction, priority?: number) => () => boolean;
export { state } from './state';
export { effect } from './effect';
export { watch } from './watch';
export { storage, storageEvent } from './storage';
