import { each } from "./array";
import { CREATE } from "./constants";
import { isObject } from "./typeCheck";

/** Gets the value of a key in an object or returns a default value */
export let getKey = (object: any, key: string, defaultValue?: any) => {
    return isObject(object) && hasOwnProperty(object, key) ? object[key] : defaultValue;
}

export let getKeys = (value: Object) => Object.keys(value);

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
    Object[CREATE](proto);

export let createContext = (parentContext: any, newContext = {}): any => {
    const mergedContext = newObject(parentContext);
    Object.defineProperties(
        mergedContext,
        Object.getOwnPropertyDescriptors(newContext)
    );
    return mergedContext;
};

export let getDescriptor = (value: any, key: string) =>
    Object.getOwnPropertyDescriptor(value, key);

export let getProto = (object: any) =>
    Object.getPrototypeOf(object);

export let hasOwnProperty = (object: any, key: string) =>
    object.hasOwnProperty(key);

export let getOwnProp = (object: any) =>
    Object.getOwnPropertyNames(object);

export let defineProp = (object: any, key: string, descriptor: PropertyDescriptor) => {
    Object.defineProperty(object, key, descriptor);
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