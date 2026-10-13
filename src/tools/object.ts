import { entries, has, size } from ".";
import { each } from "./array";
import { CREATE, DEFINE_PROPERTIES, DEFINE_PROPERTY, DOCUMENT, GET_OWN_PROPERTY_DESCRIPTOR, GET_OWN_PROPERTY_DESCRIPTORS, GET_OWN_PROPERTY_NAMES, HAS_OWN_PROPERTY, NULL, PROTOTYPE, UNDEFINED, VALUE } from "./constants";
import { isArray, isMap, isObject, isSet, isString } from "./typeCheck";

export let W: any = globalThis;
export let O = Object;
export let R = Reflect;
export let L = W.location;
export let D = W[DOCUMENT];
export let S = Symbol;

export let Regex = RegExp;

export let hasProp = (object: any, key: Prop) =>
    O[PROTOTYPE][HAS_OWN_PROPERTY].call(object, key);

/** Gets the value of a key in an object or returns a default value */
export let getProp = (object: any, key: string, defaultValue?: any) =>
    object != null && key in object ? object[key] : defaultValue;

export let renameProp = (object: ObjectType, oldName: string, newName: string, newValue?: any) => {
    if (oldName in object) {
        object[newName] = object[oldName];
        delProp(object, oldName);
    }
    else {
        object[newName] = newValue;
    }
}

/**
 * Deletes a key in an object.
 * 
 * Note: This mutates the object.
 */
export let delProp = (object: any, key: Prop) => delete object[key];

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
 * - `w`: writable (can be changed)
 * - `c`: configurable (can be deleted)
 * - `e`: enumerable (can be listed or iterated over)
 * @example
 * setProp(obj, 'key', 'value', 'wce');
 */
export let setProp = (object: any, key: string, value: any = UNDEFINED, descriptor: any = 'wce') => {

    if (isString(descriptor)) {
        let shorthand = descriptor;

        // Create a descriptor with the value
        descriptor = {[VALUE]: value};

        // Iterate over each shorthand and set the actual descriptor keys
        each(descriptorShorthand, ([shorthandKey, actualKey]) => {
            // Set the descriptor key to true if the shorthand is present
            descriptor[actualKey] = has(shorthand, shorthandKey);
        });
    }

    // Define the property on the object
    O[DEFINE_PROPERTY](object, key, descriptor);
}

export let countKeys = (value: any): number => size(getKeys(value));

export let renameKeys = (object: ObjectType, ...keys: [string, string][]) => {
    each(keys, ([oldName, newName]) => {
        if (oldName in object) {
            object[newName] = object[oldName];
            delProp(object, oldName);
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

/**
 * Updates the descriptor of each key in an object.
 * @param object - The object to update
 * @param descriptor.w - The keys are not writable (cannot be changed)
 * @param descriptor.e - The keys are not enumerable (cannot be iterated over)
 * @param descriptor.c - The keys are not configurable (cannot be deleted)
 */
export let setObjectKeys = (object: any, descriptor: any = {}) => {
    each(getKeys(object), key => {
        setProp(object, key, object[key], descriptor);
    });
}

/**
 * Deletes all keys in an object.
 * 
 * Note: This mutates the object.
 * @returns void
 */
export let deleteKeys = (object: any) =>
    each(getKeys(object), key => {
        delProp(object, key);
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
 * Performs a in-place deep sync from `source` to `target`.
 * 
 * Note: this mutates the target.
 */
export let sync = (target: any, source: any, seen = new WeakMap<object, object>()): any => {

    // Target and source are the same, no need to update
    if (target === source) return target;
    if ((isObject(source) || isArray(source) || isMap(source) || isSet(source)) && seen.has(source))
        return seen.get(source);
    if ((isObject(source) || isArray(source) || isMap(source) || isSet(source)) &&
        (isObject(target) || isArray(target) || isMap(target) || isSet(target)))
        seen.set(source, target);

    // Update target Array in-place
    if (isArray(target) && isArray(source)) {

        // Ensure target has the same length as source
        while (size(target) > size(source)) target.pop();

        // Update existing elements or add new ones
        for (let i = 0; i < size(source); i++) {
            if (i < size(target)) {
                target[i] = sync(target[i], source[i], seen);
            } else {
                target.push(clone(source[i], seen));
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
            target.set(key, targetCopy.has(key) ? sync(targetCopy.get(key), val, seen) : clone(val, seen));
        }
    }
    // Update target Set in-place
    else if (isSet(target) && isSet(source)) {

        // Remove all elements
        target.clear();

        // Add elements from source
        for (let val of source) {
            target.add(clone(val, seen));
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
                target[key] = hasProp(targetCopy, key) ? sync(targetCopy[key], source[key], seen) : clone(source[key], seen);
            }
        }
    }
    // If target is not an object, Map, Set, or Array, just return the source.
    // Including other Reference Types like Function, Date, RegExp, DOM nodes, etc.
    else {
        return source;
    }

    return target;
}

/** Clones a value deeply */
export let clone = (value: any, seen = new WeakMap<object, any>()): any => {
    if (value === null || typeof value !== 'object') return value;
    if (seen.has(value)) return seen.get(value);

    if (isArray(value)) {
        let result: any[] = [];
        seen.set(value, result);
        for (let item of value) result.push(clone(item, seen));
        return result;
    }
    if (isMap(value)) {
        let result = newMap();
        seen.set(value, result);
        for (let [key, item] of entries(value))
            result.set(clone(key, seen), clone(item, seen));
        return result;
    }
    if (isSet(value)) {
        let result = newSet();
        seen.set(value, result);
        for (let item of value) result.add(clone(item, seen));
        return result;
    }
    if (isObject(value)) {
        let result = Object.create(Object.getPrototypeOf(value));
        seen.set(value, result);
        for (let key of O.keys(value))
            result[key] = clone(value[key], seen);
        return result;
    }
    return value;
}
