import { CALLBACK, watch } from ".";
import { logger } from "../tools";
import { INVALID, OBJECT } from "../tools/constants";
import { getProto, hasOwnProperty } from "../tools/object";
import { parse, stringify } from "../tools/string";

let GET_ITEM = 'getItem';
let SET_ITEM = 'setItem';

/**
 * Check if an object has the getItem and setItem methods.
 */
export let isStorage = (obj: any) => {
    let proto = getProto(obj);
    // Check if obj has the getItem and setItem methods
    return proto && hasOwnProperty(proto, GET_ITEM) && hasOwnProperty(proto, SET_ITEM);
}

/**
 * Get an item from a storage object.
 */
export let getItem = (storage: any, key: string) => parse(storage[GET_ITEM](key) || '');

/**
 * Set an item in a storage object.
 */
export let setItem = (storage: any, key: string, value: any) => storage[SET_ITEM](key, stringify(value));

/**
 * Prefixes a key with Brio's prefix.
 */
let keyPrefix = (key: string) => '_b_' + key;

/**
 * The storage stack is used to track the observed state, property, and storage object for each monitored property.
 */
export let _storageStack = new Map();

/**
 * Creates a two-way binding between a reactive property and a storage object (like localStorage or sessionStorage).
 * A "storage object" is any object that has the `getItem` and `setItem` methods.
 */
export let storage = (_storage: any, value: any, alias?: string) => {

    // Check if the storage object is valid
    if (!isStorage(_storage)) {
        return logger(INVALID + ` storage ${OBJECT}.`);
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
    let fn = (proxied: any, prop: string) => {
        // Get the final alias. This will be the key used to store the value in the storage
        alias = alias || keyPrefix(prop);
        // Watch the property for changes
        watch(proxied, prop, ({newValue}) => {
            setItem(_storage, alias as string, newValue);
        });
        // Set the initial value if it doesn't exist in the storage
        if (!hasOwnProperty(_storage, alias)) {
            setItem(_storage, alias, value);
        } else {
            value = getItem(_storage, alias);
        }
        // Add the observed state, property, and storage to the storage stack
        _storageStack.set(alias, [proxied, prop, _storage])

        return value;
    }

    (fn as any)[CALLBACK] = true;

    return fn;
}

export let storageEvent = (event: StorageEvent) => {
    // If the key is being observed
    if (_storageStack.has(event.key)) {
        // Get the observed state, property, and storage
        let [proxied, prop, _storage] = _storageStack.get(event.key);

        // If the _storage is the same as the event storage
        if (_storage === event.storageArea) {
            // Update the observed state
            proxied[prop] = getItem(_storage, event.key as string);
        }
    }
}