import { size, uid } from ".";
import { each } from "./array";
import { CREATE, DEFINE_PROPERTIES, DEFINE_PROPERTY, DOCUMENT, GET_OWN_PROPERTY_DESCRIPTOR, GET_OWN_PROPERTY_DESCRIPTORS, HAS_OWN_PROPERTY, NULL, PROTOTYPE, VALUE } from "./constants";
import { isObject } from "./typeCheck";

export let W = window;
export let O = Object;
export let R = Reflect;
export let L = location;
export let D = W[DOCUMENT];

export let Regex = RegExp;

/** Gets the value of a key in an object or returns a default value */
export let getKey = (object: any, key: string, defaultValue?: any) => {
    return isObject(object) && key in object ? object[key] : defaultValue;
}

/** Generates a unique key for an object */
export let uniqueKey = (object: ObjectType) => {

    // Generate a key
    let key = uid();

    // Make sure the key is unique.
    // Make it 12 characters long to increase the chances of uniqueness.
    while (key in object) key = uid(12);

    return key;
}

export let countKeys = (value: any): number => size(getKeys(value));

export let renameKeys = (object: ObjectType, ...keys: [string, string][]) => {
    each(keys, ([oldName, newName]) => {
        if (oldName in object) {
            object[newName] = object[oldName];
            deleteKey(object, oldName);
        }
    })
}

/** Gets the keys of an object */
export let getKeys = (value: Object) => O.keys(value);

/** Creates a new object with the specified prototype */
export let newObject = (proto: object | null = NULL) => O[CREATE](proto);

/**
 * Creates a new context object by merging the parent context with the new context.
 * 
 * Note: This only works with objects.
 */
export let createContext = (parentContext: any, newContext = {}): any => {
    const mergedContext = newObject(parentContext);
    O[DEFINE_PROPERTIES](
        mergedContext,
        O[GET_OWN_PROPERTY_DESCRIPTORS](newContext)
    );
    return mergedContext;
}

export let getDescriptor = (value: any, key: string, source: any = O) =>
    source[GET_OWN_PROPERTY_DESCRIPTOR](value, key);

export let getProto = (object: any) =>
    O.getPrototypeOf(object);

export let hasOwnProperty = (object: any, key: string) =>
    O[PROTOTYPE][HAS_OWN_PROPERTY].call(object, key);

/** 
 * Defines a property on an object.
 * @param object - The object that will receive the key
 * @param key - The key that will be set
 * @param descriptor.v - The value of the key
 * @param descriptor.w - The key is writable (can be changed)
 * @param descriptor.e - The key is enumerable (can be iterated over)
 * @param descriptor.c - The key is configurable (can be deleted)
 */
export let setKey = (object: any, key: string, descriptor: PropertyDescriptorShorthand = {}) => {
    // Map shorthand keys to PropertyDescriptor keys
    renameKeys(descriptor, ['v', VALUE], ['w', 'writable'], ['e', 'enumerable'], ['c', 'configurable']);

    // Define the property on the object
    O[DEFINE_PROPERTY](object, key, descriptor);
}

/**
 * Updates the descriptor of each key in an object.
 * @param object - The object to update
 * @param descriptor.w - The keys are writable (can be changed)
 * @param descriptor.e - The keys are enumerable (can be iterated over)
 * @param descriptor.c - The keys are configurable (can be deleted)
 */
export let setObjectKeys = (object: any, descriptor: PropertyDescriptorShorthand = {}) => {
    each(getKeys(object), key => {
        setKey(object, key, descriptor);
    });
}

/**
 * Deletes a key in an object.
 * 
 * Note: This mutates the object.
 */
export let deleteKey = (object: any, key: string|number|symbol) => delete object[key];

/**
 * Deletes all keys in an object.
 * 
 * Note: This mutates the object.
 * @returns void
 */
export let deleteKeys = (object: any) =>
    each(getKeys(object), key => {
        deleteKey(object, key);
    });

/**
 * Creates a new Map object.
 * @returns Map
 */
export let newMap = () => new Map();

export let newRegExp = (pattern: RegExp | string, flags?: string) => new Regex(pattern, flags);