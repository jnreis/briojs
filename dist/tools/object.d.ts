export declare let W: Window & typeof globalThis;
export declare let O: ObjectConstructor;
export declare let R: typeof Reflect;
export declare let L: Location;
export declare let D: Document;
export declare let S: SymbolConstructor;
export declare let Regex: RegExpConstructor;
export declare let hasProp: (object: any, key: Prop) => boolean;
/** Gets the value of a key in an object or returns a default value */
export declare let getProp: (object: any, key: string, defaultValue?: any) => any;
export declare let renameProp: (object: ObjectType, oldName: string, newName: string, newValue?: any) => void;
/**
 * Deletes a key in an object.
 *
 * Note: This mutates the object.
 */
export declare let delProp: (object: any, key: Prop) => boolean;
/**
 * Defines a property on an object.
 * @param object - The object that will receive the key
 * @param key - The key that will be set
 * @param descriptor - The PropertyDescriptor or a string of shorthand letters to quickly mark a descriptor option as false.
 * @shorthand
 * - `w`: not writable (cannot be changed)
 * - `c`: not configurable (cannot be deleted)
 * - `e`: not enumerable (cannot be listed or iterated over)
 * @example
 * setProp(obj, 'key', 'value', 'wce');
 */
export declare let setProp: (object: any, key: string, value?: any, descriptor?: any) => void;
export declare let countKeys: (value: any) => number;
export declare let renameKeys: (object: ObjectType, ...keys: [string, string][]) => void;
/** Gets the keys of an object */
export declare let getKeys: (value: Object) => string[];
export declare let getAllKeys: (value: Object) => string[];
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
/**
 * Updates the descriptor of each key in an object.
 * @param object - The object to update
 * @param descriptor.w - The keys are not writable (cannot be changed)
 * @param descriptor.e - The keys are not enumerable (cannot be iterated over)
 * @param descriptor.c - The keys are not configurable (cannot be deleted)
 */
export declare let setObjectKeys: (object: any, descriptor?: any) => void;
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
export declare let newMap: (value?: any) => Map<any, any>;
/**
 * Creates a new Set object.
 * @param value - Optional initial values to add to the Set
 * @returns Set
 */
export declare let newSet: (value?: any) => Set<any>;
export declare let newRegExp: (pattern: RegExp | string, flags?: string) => RegExp;
/**
 * Performs a in-place deep sync from `source` to `target`.
 *
 * Note: this mutates the target.
 */
export declare let sync: (target: any, source: any) => any;
/** Clones a value deeply */
export declare let clone: (value: any) => any;
