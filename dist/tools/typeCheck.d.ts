/** Get the type of a value */
export declare let getType: (value: any) => string;
/** Check the type of a value */
export declare let is: (value: any, type: string) => boolean;
/** Check if a value is null */
export declare let isNull: (value: any) => boolean;
/** Check if a value is undefined */
export declare let isUndefined: (value: any) => boolean;
/** Check if a value is an object */
export declare let isObject: (value: any) => boolean;
/** Check if a value is an array */
export declare let isArray: (value: any) => boolean;
/** Check if a value is a sync or async function */
export declare let isFunction: (value: any) => boolean;
/** Check if a value is a sync function */
export declare let isSyncFunction: (value: any) => boolean;
/** Check if a value is an async function */
export declare let isAsyncFunction: (value: any) => boolean;
/** Check if a value is an arrow function */
export declare let isArrowFunction: (value: any) => boolean;
/** Check if a value is a generator function */
export declare let isGetter: (object: Object, key: string) => boolean;
/** Check if a value is a setter function */
export declare let isSetter: (object: Object, key: string) => boolean;
/** Check if a value is a string */
export declare let isString: (value: any) => boolean;
/** Check if a value is a number */
export declare let isNumber: (value: any) => boolean;
/**
 * Check if a value is numeric.
 * - it must be a number or a string that can be converted to a number
 * - it must not be NaN
 */
export declare let isNumeric: (value: any) => boolean;
/** Check if a value is a boolean */
export declare let isBoolean: (value: any) => boolean;
/** Check if a value is a regular expression */
export declare let isRegExp: (value: any) => boolean;
export declare let isInstance: (value: any, ObjectConstructor: Function) => boolean;
/** Check if a value is a node */
export declare let isNode: (node: any) => boolean;
/** Check if a value is a text node */
export declare let isTextNode: (node: any) => boolean;
/** Check if a value is an element node */
export declare let isElementNode: (node: any) => boolean;
/** Check if a value is a document fragment */
export declare let isDocumentFragment: (node: any) => boolean;
/** Check if a value is a Map */
export declare let isMap: (value: any) => boolean;
/** Check if a value is a Set */
export declare let isSet: (value: any) => boolean;
