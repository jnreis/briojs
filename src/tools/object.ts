import { each } from "./array";
import { CREATE, GET_OWN_PROPERTY_DESCRIPTOR, GET_OWN_PROPERTY_DESCRIPTORS, GET_OWN_PROPERTY_NAMES, HAS_OWN_PROPERTY, PROTOTYPE } from "./constants";
import { isObject } from "./typeCheck";

export let W = window;
export let D = document;
export let R = Reflect;
export let O = Object;

/** Gets the value of a key in an object or returns a default value */
export let getKey = (object: any, key: string, defaultValue?: any) => {
    return isObject(object) && hasOwnProperty(object, key) ? object[key] : defaultValue;
}

/** 
 * Sets the value of a key in an object.
 * This only works with objects.
 */
export let setKey = (object: any, key: string, value: any) => {
    defineProp(object, key, {
        value,
        writable: true,
        enumerable: true,
        configurable: true,
    });
}

export let getKeys = (value: Object) => O.keys(value);

export let getAllKeys = (value: Object) => {
    let keys: Set<string> = new Set();

    // Recursively traverse the prototype chain
    let currentObj = value;
    while (currentObj) {
        each(getKeys(currentObj), (key) => keys.add(key));
        currentObj = getProto(currentObj);
    }

    return keys;
}

/** Recursively goes up the prototype chain to find an object with a specific key */
export let findObjectByKey = (object: any, key: string) => {
    let currentObj = object;
    while (currentObj) {
        if (hasOwnProperty(currentObj, key)) return currentObj;
        currentObj = getProto(currentObj);
    }
    return null;
};

export let newObject = (proto: object | null = null) =>
    O[CREATE](proto);

/**
 * Creates a new context object by merging the parent context with the new context.
 * Note: This only works with objects.
 */
export let createContext = (parentContext: any, newContext = {}): any => {
    const mergedContext = newObject(parentContext);
    O.defineProperties(
        mergedContext,
        O[GET_OWN_PROPERTY_DESCRIPTORS](newContext)
    );
    return mergedContext;
};

export let getDescriptor = (value: any, key: string, source: any = O) =>
    source[GET_OWN_PROPERTY_DESCRIPTOR](value, key);

export let getProto = (object: any) =>
    O.getPrototypeOf(object);

export let hasOwnProperty = (object: any, key: string) =>
    O[PROTOTYPE][HAS_OWN_PROPERTY].call(object, key);

export let getOwnProp = (object: any) =>
    O[GET_OWN_PROPERTY_NAMES](object);

export let defineProp = (object: any, key: string, descriptor: PropertyDescriptor) => {
    O.defineProperty(object, key, descriptor);
}

export let createGetterSetter = (source: ObjectType, target: ObjectType, propertyName: string, alias: string = '') =>
    defineProp(target, alias || propertyName, {
        // Getter returns the value of the property in `source`
        get() {
            return source[propertyName];
        },
        // Setter sets the value of the property in `source`
        set(value) {
            source[propertyName] = value;
        }
    });

export let setHiddenKey = (object: any, key: string, value: any) =>
    defineProp(object, key, {
        value,
        enumerable: false,
        configurable: true,
    });

export let deleteKey = (object: any, key: string|number) => delete object[key];

/**
 * Deletes all keys in an object.
 * Note: This mutates the object.
 * @returns void
 */
export let deleteKeys = (object: any) =>
    each(getKeys(object), (key) => {
        deleteKey(object, key);
    });

/**
 * Merges the keys of each object into the `target` object.
 * Note: This mutates the `target` object.
 * @param target - The target object
 * @param missingKeysOnly - If true, only missing keys will be merged
 * @param ...objects - The objects to merge
 * @returns void
 */
export let mergeKeys = (target: ObjectType, missingKeysOnly: boolean, ...objects: ObjectType[]) => {
    // Each object
    each(objects, object => {
        if (isObject(object)) {
            // Each key in the object
            each(getKeys(object), key => {
                if (!missingKeysOnly || (missingKeysOnly && !hasOwnProperty(target, key))) {
                    target[key] = object[key];
                }
            });
        }
    });
};