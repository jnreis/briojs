import { isState, propertyInitFns, watch } from ".";
import { logError, wait } from "../tools";
import { DELETE, INVALID__$CAP, OBJECT, STORAGE, STORAGE_AREA } from "../tools/constants";
import { getProto, hasOwnProperty, newMap } from "../tools/object";
import { parse, stringify } from "../tools/string";
import { setStateProperty } from "./prop";

let GET_ITEM = 'getItem';
let SET_ITEM = 'setItem';

/**
 * The storage stack is used to track the observed state, property, and storage object for each monitored property.
 */
let _storageStack = newMap();

/**
 * Check if an object has the getItem and setItem methods.
 */
let isStorage = (obj: any) => {
    let proto = getProto(obj);
    // Check if obj has the getItem and setItem methods
    return proto && hasOwnProperty(proto, GET_ITEM) && hasOwnProperty(proto, SET_ITEM);
}

/**
 * Get an item from a storage object.
 */
let getItem = (storage: any, key: string) => parse(storage[GET_ITEM](key) || '');

/**
 * Set an item in a storage object.
 */
let setItem = (storage: any, key: string, value: any) => storage[SET_ITEM](key, stringify(value));

/**
 * Prefixes a key with Brio's prefix.
 */
let keyPrefix = (key: string) => '_b_' + key;

/**
 * Creates a two-way binding between a reactive property and a storage object (like localStorage or sessionStorage).
 * 
 * A "storage object" is any object that has the `getItem` and `setItem` methods.
 * 
 * @param _storage - The storage object to use
 * @param value - The initial value to set the property to
 * @param alias - The key to use in the storage object. If not provided, the property name will be used.
 * @returns The property initialization function
 */
export let storage = (_storage: any, value: any, alias?: string) => {

    // Check if the storage object is valid
    if (!isStorage(_storage)) {
        return logError(INVALID__$CAP, STORAGE, OBJECT);
    }

    if (alias) {
        // Prefix the alias with Brio's prefix
        alias = keyPrefix(alias);
        // Get the value from the storage, if it exists
        if (hasOwnProperty(_storage, alias)) {
            value = getItem(_storage, alias);
        }
    }

    // Property initialization function
    // This will be called when the state object is created or set
    let initFn = ({ state, prop }: ListenerFunctionContext, stateObject: StateObject) => {

        // Remove the property initialization function from the set
        propertyInitFns[DELETE](initFn);

        // Add the observed state, property, and storage to the storage stack
        _storageStack.set(alias, [state, prop, _storage]);

        // Get the final alias. This will be the key used to store the value in the storage
        alias = alias || keyPrefix(prop);

        // Set the initial value if it doesn't exist in the storage
        if (!hasOwnProperty(_storage, alias)) {
            setItem(_storage, alias, value);
        } else {
            value = getItem(_storage, alias);
        }

        // Update the storage when the property changes
        let updateStorage = () =>
            setItem(_storage, alias as string, state[prop]);

        // Watch for changes to the property (property assignment)
        wait(() => watch(state, prop, updateStorage));

        // Add a property function to the state object
        setStateProperty(stateObject, prop, ({ state, prop }: { state: any, prop: string }) => {
            // If the property is an observed state
            // Watch for changes in the entire object/array
            // This will ensure that the storage is updated when the object/array is modified, not just during property assignment
            if (isState(state[prop]))
                watch(state[prop], "", updateStorage);
        });

        return value;
    }

    // Add the tracking callback to the property functions
    propertyInitFns.add(initFn);

    return initFn;
}

export let storageEvent = (event: StorageEvent) => {
    // If the key is being observed
    if (_storageStack.has(event.key)) {
        // Get the observed state, property, and storage
        let [state, prop, _storage] = _storageStack.get(event.key);

        // If the _storage is the same as the event storage
        if (_storage === event[STORAGE_AREA]) {
            // Update the observed state
            state[prop] = getItem(_storage, event.key as string);
        }
    }
}