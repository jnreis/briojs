import { CALLBACK, watch } from ".";
import { getProto, hasOwnProperty } from "../tools/object";

let GET_ITEM = 'getItem';
let SET_ITEM = 'setItem';

/**
 * Check if an object has the getItem and setItem methods.
 */
export let isStorage = (obj: any) => {
    let proto = getProto(obj);
    // Check if obj has a prototype
    return proto && hasOwnProperty(proto, GET_ITEM) && hasOwnProperty(proto, SET_ITEM);
}

/**
 * Get an item from a storage object.
 */
export let getItem = (storage: any, key: string) => JSON.parse(storage[GET_ITEM](key) || '');

/**
 * Set an item in a storage object.
 */
export let setItem = (storage: any, key: string, value: any) => storage[SET_ITEM](key, JSON.stringify(value));

/**
 * Prefixes a key with Brio's prefix.
 */
let keyPrefix = (key: string) => '_b_' + key;

/**
 * The storage stack is used to track the observed state, property, and storage object for each monitored property.
 */
export let _storageStack = new Map();

/**
 * Tracks a property and stores it in a storage object like localStorage or sessionStorage or any other object that has the getItem and setItem methods.
 */
export let storage = (_storage: any, value: any, alias?: string) => {

    // Check if the storage object is valid
    if (!isStorage(_storage)) {
        return console.error('Invalid storage object:', _storage);
    }

    if (alias) {
        // Prefix the alias with Brio's prefix
        alias = keyPrefix(alias);
        // Get the value from the storage, if it exists
        if (hasOwnProperty(_storage, alias)) {
            value = getItem(_storage, alias);
        }
    }

    // Set the tracking callback
    // This will be called when the state object is created or set
    let fn = (observedState: any, prop: string) => {
        // Get the final alias. This will be the key used to store the value in the storage
        alias = alias || keyPrefix(prop);
        // Watch the property for changes
        watch(observedState, prop, ({newValue}) => {
            setItem(_storage, alias as string, newValue);
        });
        // Set the initial value if it doesn't exist in the storage
        if (!hasOwnProperty(_storage, alias)) {
            setItem(_storage, alias, value);
        } else {
            value = getItem(_storage, alias);
        }
        // Add the observed state, property, and storage to the storage stack
        _storageStack.set(alias, [observedState, prop, _storage])

        return value;
    }

    (fn as any)[CALLBACK] = true;

    return fn;
}

export let storageEvent = (event: StorageEvent) => {
    // If the key is being observed
    if (_storageStack.has(event.key)) {
        // Get the observed state, property, and storage
        let [observedState, prop, _storage] = _storageStack.get(event.key);

        // If the _storage is the same as the event storage
        if (_storage === event.storageArea) {
            // Update the observed state
            observedState[prop] = getItem(_storage, event.key as string);
        }
    }
}