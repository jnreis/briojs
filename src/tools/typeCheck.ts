import { ARRAY, ASYNC_FUNCTION, BOOLEAN, FUNCTION, NUMBER, OBJECT, PROTOTYPE, STRING, TO_STRING, UNDEFINED, NULL } from "./constants";
import { lower } from "./string";
import { getDescriptor, O, Regex } from "./object";
import { slice } from ".";

/** Get the type of a value */
export let getType = (value: any): string => lower(slice(O[PROTOTYPE][TO_STRING].call(value), 8, -1) as string);

/** Check the type of a value */
export let is = (value: any, type: string) => getType(value) === type;

/** Check if a value is null */
export let isNull = (value: any) => value === NULL;

/** Check if a value is undefined */
export let isUndefined = (value: any) => value === UNDEFINED;

/** Check if a value is an object */
export let isObject = (value: any): boolean => is(value, OBJECT);

/** Check if a value is an array */
export let isArray = (value: any): boolean => is(value, ARRAY);

/** Check if a value is a sync or async function */
export let isFunction = (value: any) => isSyncFunction(value) || isAsyncFunction(value);

/** Check if a value is a sync function */
export let isSyncFunction = (value: any) => is(value, FUNCTION);

/** Check if a value is an async function */
export let isAsyncFunction = (value: any) => is(value, ASYNC_FUNCTION);

/** Check if a value is an arrow function */
export let isArrowFunction = (value: any) => isUndefined(value[PROTOTYPE]) && value.name === "";

/** Check if a value is a generator function */
export let isGetter = (object: Object, key: string) => {
    let descriptor = getDescriptor(object, key);
    return !!descriptor && isFunction(descriptor.get);
}

/** Check if a value is a setter function */
export let isSetter = (object: Object, key: string) => {
    let descriptor = getDescriptor(object, key);
    return !!descriptor && isFunction(descriptor.set);
}

/** Check if a value is a string */
export let isString = (value: any) => is(value, STRING);

/** Check if a value is a number */
export let isNumber = (value: any) => is(value, NUMBER) && isFinite(value);

/**
 * Check if a value is numeric.
 * - it must be a number or a string that can be converted to a number
 * - it must be finite, not NaN or Infinity
 */
export let isNumeric = (value: any) => isNumber(parseFloat(value)) && isNumber(Number(value));

/** Check if a value is a boolean */
export let isBoolean = (value: any) => is(value, BOOLEAN);

/** Check if a value is a regular expression */
export let isRegExp = (value: any) => isInstance(value, Regex);

export let isInstance = (value: any, ObjectConstructor: Function) => value instanceof ObjectConstructor;

/** Check if a value is a node */
export let isNode = (node: any) => isInstance(node, Node);

/** Check if a value is a text node */
export let isTextNode = (node: any) => isInstance(node, Text);

/** Check if a value is an element node */
export let isElementNode = (node: any) => isInstance(node, HTMLElement);

/** Check if a value is a document fragment */
export let isDocumentFragment = (node: any) => isInstance(node, DocumentFragment);