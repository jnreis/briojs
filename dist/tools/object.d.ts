export declare let W: Window & typeof globalThis;
export declare let O: ObjectConstructor;
export declare let R: typeof Reflect;
export declare let L: Location;
export declare let D: Document;
export declare let Regex: RegExpConstructor;
/** Gets the value of a key in an object or returns a default value */
export declare let getKey: (object: any, key: string, defaultValue?: any) => any;
/** Generates a unique key for an object */
export declare let uniqueKey: (object: ObjectType) => string;
export declare let countKeys: (value: any) => number;
export declare let renameKeys: (object: ObjectType, ...keys: [string, string][]) => void;
/** Gets the keys of an object */
export declare let getKeys: (value: Object) => string[];
/** Creates a new object with the specified prototype */
export declare let newObject: (proto?: object | null) => any;
/**
 * Creates a new context object by merging the parent context with the new context.
 *
 * Note: This only works with objects.
 */
export declare let createContext: (parentContext: any, newContext?: {}) => any;
export declare let getDescriptor: (value: any, key: string, source?: any) => any;
export declare let getProto: (object: any) => any;
export declare let hasOwnProperty: (object: any, key: string) => boolean;
/**
 * Defines a property on an object.
 * @param object - The object that will receive the key
 * @param key - The key that will be set
 * @param descriptor.v - The value of the key
 * @param descriptor.w - The key is writable (can be changed)
 * @param descriptor.e - The key is enumerable (can be iterated over)
 * @param descriptor.c - The key is configurable (can be deleted)
 */
export declare let setKey: (object: any, key: string, descriptor?: PropertyDescriptorShorthand) => void;
/**
 * Updates the descriptor of each key in an object.
 * @param object - The object to update
 * @param descriptor.w - The keys are writable (can be changed)
 * @param descriptor.e - The keys are enumerable (can be iterated over)
 * @param descriptor.c - The keys are configurable (can be deleted)
 */
export declare let setObjectKeys: (object: any, descriptor?: PropertyDescriptorShorthand) => void;
/**
 * Deletes a key in an object.
 *
 * Note: This mutates the object.
 */
export declare let deleteKey: (object: any, key: string | number | symbol) => boolean;
/**
 * Deletes all keys in an object.
 *
 * Note: This mutates the object.
 * @returns void
 */
export declare let deleteKeys: (object: any) => any;
/**
 * Creates a new Map object.
 * @returns Map
 */
export declare let newMap: () => Map<any, any>;
export declare let newRegExp: (pattern: RegExp | string, flags?: string) => RegExp;
