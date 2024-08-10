import { _settings, reservedNames } from ".";
import { state } from "../reactivity";
import { has, logger } from "../tools";
import { arrayAdd } from "../tools/array";
import { $STORE, API_ADD_ERROR, INIT, MUST_BE, NAME_ALREADY_IN_USE, OBJECT } from "../tools/constants";
import { startsWith } from "../tools/string";
import { isObject } from "../tools/typeCheck";

// /** Reactive data store */
// export const store: ObjectType = state({});

// /** Non-reactive data store */
// export const data: ObjectType = {};

export let stores: ObjectType = {
    [$STORE]: state({}),
};

/** Add a global store */
export let addStore = (storeName: string, storeObject: ObjectType) => {
    let GLOBAL_STORE = 'global store';

    // Make sure the global store name starts with "$"
    if (!startsWith(storeName, "$"))
        storeName = '$' + storeName;

    // Can't add global store after initialization
    if (_settings[INIT])
        return logger(API_ADD_ERROR(GLOBAL_STORE, storeName));

    // Name already in use
    if (has(reservedNames, storeName))
        return logger(NAME_ALREADY_IN_USE(storeName));

    // Validate the global store
    if (isObject(storeObject)) {
        // Add the global store to the list of global stores
        stores[storeName] = storeObject;

        // Save the global store name
        arrayAdd(reservedNames, storeName);
    }

    // Error: The global store must be an object
    else logger(`The ${GLOBAL_STORE} "${storeName}" ${MUST_BE} an ${OBJECT}.`);

}