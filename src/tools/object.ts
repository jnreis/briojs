import { entries, has, size, uid } from ".";
import { arrayFrom, each, map } from "./array";
import { CREATE, DEFINE_PROPERTIES, DEFINE_PROPERTY, DOCUMENT, GET_OWN_PROPERTY_DESCRIPTOR, GET_OWN_PROPERTY_DESCRIPTORS, GET_OWN_PROPERTY_NAMES, HAS_OWN_PROPERTY, NULL, PROTOTYPE, UNDEFINED, VALUE } from "./constants";
import { isArray, isMap, isObject, isSet, isString } from "./typeCheck";

export let W = window;
export let O = Object;
export let R = Reflect;
export let L = location;
export let D = W[DOCUMENT];
export let S = Symbol;

export let Regex = RegExp;

/** Gets the value of a key in an object or returns a default value */
export let getProp = (object: any, key: string, defaultValue?: any) => {
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

export let getAllKeys = (value: Object) => O[GET_OWN_PROPERTY_NAMES](value);

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

export let hasProp = (object: any, key: Prop) =>
    O[PROTOTYPE][HAS_OWN_PROPERTY].call(object, key);

let descriptorShorthand = [
    ['w', 'writable'], 
    ['e', 'enumerable'], 
    ['c', 'configurable'],
];

/** 
 * Defines a property on an object.
 * @param object - The object that will receive the key
 * @param key - The key that will be set
 * @param descriptor - The PropertyDescriptor or a string of shorthand letters to quickly mark a descriptor option as false.
 * @shorthand
 * - `w`: not writable (can not be changed)
 * - `c`: not configurable (can not be deleted)
 * - `e`: not enumerable (can not be iterated over)
 * @example
 * setProp(obj, 'key', 'value', 'wce');
 */
export let setProp = (object: any, key: string, value: any = UNDEFINED, descriptor: any = {}) => {

    let quickFalse = '';
    if (isString(descriptor)) {
        quickFalse = descriptor;
        descriptor = {};
    }

    each(descriptorShorthand, ([shortKey, longKey]) => {

        // If the short key is set, map it to the long key
        if (hasProp(descriptor, shortKey)) {
            descriptor[longKey] = descriptor[shortKey];
        }
        // If the long key is not set, set it to false if the short key is not in quickFalse
        else if (!hasProp(descriptor, longKey)) {
            descriptor[longKey] = !has(quickFalse, shortKey);
        }
    });

    descriptor[VALUE] = value;

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
export let setObjectKeys = (object: any, descriptor: any = {}) => {
    each(getKeys(object), key => {
        setProp(object, key, object[key], descriptor);
    });
}

/**
 * Deletes a key in an object.
 * 
 * Note: This mutates the object.
 */
export let deleteKey = (object: any, key: Prop) => delete object[key];

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
export let newMap = (value: any = UNDEFINED) => new Map(value) as Map<any, any>;

/**
 * Creates a new Set object.
 * @param value - Optional initial values to add to the Set
 * @returns Set
 */
export let newSet = (value: any = UNDEFINED) => new Set(value) as Set<any>;

export let newRegExp = (pattern: RegExp | string, flags?: string) => new Regex(pattern, flags);


/**
 * Performs a in-place deep sync between `target` and `source` values
 */
export let sync = (target: any, source: any): any => {

    // Target and source are the same, no need to update
    if (target === source) return target;

    // Update target Array in-place
    if (isArray(target) && isArray(source)) {

        // Ensure target has the same length as source
        while (size(target) > size(source)) target.pop();

        // Update existing elements or add new ones
        for (let i = 0; i < size(source); i++) {
            if (i < size(target)) {
                target[i] = sync(target[i], source[i]);
            } else {
                target.push(clone(source[i]));
            }
        }
    }
    // Update target Map in-place
    else if (isMap(target) && isMap(source)) {

        let targetCopy = newMap(target);

        // Remove all elements
        target.clear();

        // Update existing keys or add new ones
        for (let [key, val] of entries(source)) {
            target.set(key, targetCopy.has(key) ? sync(targetCopy.get(key), val) : clone(val));
        }
    }
    // Update target Set in-place
    else if (target instanceof Set && source instanceof Set) {

        // Remove all elements
        target.clear();

        // Add elements from source
        for (let val of source) {
            target.add(val);
        }
    }
    // Update target Object in-place
    else if (isObject(target) && isObject(source)) {

        let targetCopy = {...target};

        // Remove all keys
        deleteKeys(target);

        // Update existing keys or add new ones
        for (let key in source) {
            if (hasProp(source, key)) {
                target[key] = hasProp(targetCopy, key) ? sync(targetCopy[key], source[key]) : clone(source[key]);
            }
        }
    }
    // If target is not an object, Map, Set, or Array, just return the source
    else {
        return source;
    }

    return target;
}

/** Clones a value deeply */
export let clone = (value: any) => {

    let cloneValue = value;

    if (isObject(value)) {
        let res: ObjectType = {};
        for (let key in value) {
            if (hasProp(value, key)) res[key] = clone(value[key]);
        }
        cloneValue = res;
    }

    if (isArray(value)) 
        cloneValue = map(value, clone);

    if (isMap(value)) 
        cloneValue = newMap(map(arrayFrom(entries(value)), ([k, v]: [any, any]) => [k, clone(v)]));

    if (isSet(value)) 
        cloneValue = newSet(map(arrayFrom(value), clone));

    return cloneValue;
}
