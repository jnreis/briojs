import {
    ARRAY,
    ASYNC_FUNCTION,
    BOOLEAN,
    DATE,
    ERROR,
    FUNCTION,
    MAP,
    NUMBER,
    OBJECT,
    PROMISE,
    REGEXP,
    SET,
    STRING,
    SYMBOL,
    WEAKMAP,
    WEAKSET
} from "./constants";
import { lower, test, toString } from "./string";
import { getDescriptor } from "./object";
import { slice } from ".";

// Get the type of a value
export let getType = (value: any): string => lower(slice(Object.prototype.toString.call(value), 8, -1));

// Check the type of a value
export let is = (value: any, type: string) => getType(value) === type;

export let isNull = (value: any) => value === null;

export let isUndefined = (value: any) => value === undefined;

// Check if a value is an object
export let isObject = (value: any): boolean => is(value, OBJECT);

// Check if a value is an array
export let isArray = (value: any): boolean => is(value, ARRAY);

// Check if a value is a function
export let isFunction = (value: any) => is(value, FUNCTION) || isAsyncFunction(value);

// Check if a value is a string arrow function
export let isAsyncFunction = (value: any) => is(value, ASYNC_FUNCTION);

export let isArrowFunction = (value: any) => isUndefined(value.prototype) && value.name === "";

export let isGetter = (object: Object, key: string) => {
    let descriptor = getDescriptor(object, key);
    return !!descriptor && isFunction(descriptor.get);
};

export let isSetter = (object: Object, key: string) => {
    let descriptor = getDescriptor(object, key);
    return !!descriptor && isFunction(descriptor.set);
};

// Check if a value is a string
export let isString = (value: any) => is(value, STRING);

// Check if a value is a number
export let isNumber = (value: any) => is(value, NUMBER);

// Check if a value is numeric
export let isNumeric = (str: any) => !isNaN(parseFloat(str)) && isFinite(str);

// Check if a value is a boolean
export let isBoolean = (value: any) => is(value, BOOLEAN);

// Check if a value is a regular expression
export let isRegExp = (value: any) => is(value, REGEXP);

// Check if a value is a date
export let isDate = (value: any) => is(value, DATE);

// Check if a value is a map
export let isMap = (value: any) => is(value, MAP);

// Check if a value is a weak map
export let isWeakMap = (value: any) => is(value, WEAKMAP);

// Check if a value is a set
export let isSet = (value: any) => is(value, SET);

// Check if a value is a weak set
export let isWeakSet = (value: any) => is(value, WEAKSET);

// Check if a value is a symbol
export let isSymbol = (value: any) => is(value, SYMBOL);

// Check if a value is a promise
export let isPromise = (value: any) => is(value, PROMISE);

// Check if a value is an error
export let isError = (value: any) => is(value, ERROR);

// Check if a value is a class
export let isClass = (value: any) => isFunction(value) && test(toString(value), /^\s*class\s+/);

export let isTextNode = (node: Node) => node instanceof Text;

export let isElementNode = (node: Node) => node instanceof HTMLElement;
