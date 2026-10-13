import { addStateCleanup, watch, initProp } from ".";
import { logError } from "../tools";
import { INVALID__$CAP, OBJECT, STATE, STORAGE, STORAGE_AREA } from "../tools/constants";
import { newMap } from "../tools/object";
import { parse, stringify } from "../tools/string";

let GET_ITEM = 'getItem';
let SET_ITEM = 'setItem';

/**
 * The storage stack is used to track the observed state, property, and storage object for each monitored property.
 */
let _storageStack = new WeakMap<object, Map<string, [any, Prop, any]>>();

/**
 * Check if an object has the getItem and setItem methods.
 */
let isStorage = (obj: any) => {
    return obj && typeof obj[GET_ITEM] === 'function' && typeof obj[SET_ITEM] === 'function';
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
        let storedValue = _storage[GET_ITEM](alias);
        if (storedValue !== null) {
            value = parse(storedValue);
        }
    }

    // Property initialization function
    // This will be called when the state object is created or set
    let initFn = ({ [STATE]: state, prop }: ListenerFunctionContext) => {

        // Get the final alias. This will be the key used to store the value in the storage
        alias = alias || keyPrefix(String(prop));

        // Set the initial value if it doesn't exist in the storage
        let storedValue = _storage[GET_ITEM](alias);
        if (storedValue === null) {
            setItem(_storage, alias, value);
        } else {
            value = parse(storedValue);
        }

        let storageEntries = _storageStack.get(_storage) || newMap();
        _storageStack.set(_storage, storageEntries);
        storageEntries.set(alias, [state, prop, _storage]);

        let cleanup = watch(state, prop, () => {
            // Update the storage when the property changes
            // or one of its direct keys/indexes is changed, if it is a state object/array
            setItem(_storage, alias as string, state[prop]);
        });
        addStateCleanup(state, () => {
            cleanup();
            storageEntries.delete(alias as string);
        });

        return value;
    }

    // Add the tracking callback to the property functions
    return initProp(initFn);
}

export let persist = (value: any, alias?: string) => storage(localStorage, value, alias);

export let session = (value: any, alias?: string) => storage(sessionStorage, value, alias);

export let storageEvent = (event: StorageEvent) => {
    let storageArea = event[STORAGE_AREA];
    if (event.key === null || !storageArea) return;
    let entry = _storageStack.get(storageArea)?.get(event.key);
    if (entry)
        entry[0][entry[1]] = getItem(storageArea, event.key);
}