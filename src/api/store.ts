import { _settings } from ".";
import { state } from "../reactivity";
import { logger } from "../tools";
import { $STORE, BEFORE_INIT, INIT } from "../tools/constants";

/** Reactive data store */
export const store: ObjectType = state({});

/** Non-reactive data store */
export const data: ObjectType = {};

/** Adds an item to the data store */
export let addStoreItem = (globalStore: ObjectType) => (key: string, value: any) => {

    // Can't add items to the data store after initialization
    if (_settings[INIT])
        return logger(`The ${globalStore === store ? $STORE : '$data'} item "${key}" ` + BEFORE_INIT);

    globalStore[key] = value;
}