import { each } from "./array";
import { CREATE } from "./constants";

export let getKeys = (value: Object) => Object.keys(value);

export let getAllKeys = (value: Object) => {
    let keys = new Set();

    // Recursively traverse the prototype chain
    let currentObj = value;
    while (currentObj) {
        each(getKeys(currentObj), (key) => keys.add(key));
        currentObj = getProto(currentObj);
    }

    return keys;
}

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
 * Deletes all keys in an object
 */
export let deleteKeys = (object: any) =>
    each(getKeys(object), (key) => {
        deleteKey(object, key);
    });

export let objectMerge = (target: ObjectType, source: ObjectType) =>
    each(getKeys(source), key => {
        target[key] = source[key];
    });