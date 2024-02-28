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
import { lower } from "./string";
import { getDescriptor } from "./object";

// Get the type of a value
export let getType = (value: any): string => {
    return lower(Object.prototype.toString.call(value).slice(8, -1));
};

// Check the type of a value
export let is = (value: any, type: string) => {
    return getType(value) === type;
};

export let isNull = (value: any) => {
    return value === null;
};

export let isUndefined = (value: any) => {
    return value === undefined;
}

// Check if a value is an object
export let isObject = (value: any): boolean => {
    return is(value, OBJECT);
};

// Check if a value is an array
export let isArray = (value: any): boolean => {
    return is(value, ARRAY);
};

// Check if a value is a function
export let isFunction = (value: any) => {
    return is(value, FUNCTION);
};

// Check if a value is a string arrow function
export let isAsyncFunction = (value: any) => {
    return is(value, ASYNC_FUNCTION);
}

export let isArrowFunction = (value: any) => {
    return isUndefined(value.prototype) && value.name === "";
};

export let isGetter = (object: Object, key: string) => {
    let descriptor = getDescriptor(object, key);
    return !!descriptor && isFunction(descriptor.get);
};

export let isSetter = (object: Object, key: string) => {
    let descriptor = getDescriptor(object, key);
    return !!descriptor && isFunction(descriptor.set);
};

// Check if a value is a string
export let isString = (value: any) => {
    return is(value, STRING);
};

// Check if a value is a number
export let isNumber = (value: any) => {
    return is(value, NUMBER);
};

// Check if a value is numeric
export let isNumeric = (str: any) => {
    return !isNaN(parseFloat(str)) && isFinite(str);
};

// Check if a value is a boolean
export let isBoolean = (value: any) => {
    return is(value, BOOLEAN);
};

// Check if a value is a regular expression
export let isRegExp = (value: any) => {
    return is(value, REGEXP);
};

// Check if a value is a date
export let isDate = (value: any) => {
    return is(value, DATE);
};

// Check if a value is a map
export let isMap = (value: any) => {
    return is(value, MAP);
};

// Check if a value is a weak map
export let isWeakMap = (value: any) => {
    return is(value, WEAKMAP);
};

// Check if a value is a set
export let isSet = (value: any) => {
    return is(value, SET);
};

// Check if a value is a weak set
export let isWeakSet = (value: any) => {
    return is(value, WEAKSET);
};

// Check if a value is a symbol
export let isSymbol = (value: any) => {
    return is(value, SYMBOL);
};

// Check if a value is a promise
export let isPromise = (value: any) => {
    return is(value, PROMISE);
};

// Check if a value is an error
export let isError = (value: any) => {
    return is(value, ERROR);
};

// Check if a value is a class
export let isClass = (value: any) => {
    return isFunction(value) && /^\s*class\s+/.test(value.toString());
};

export let isTextNode = (node: Node) => {
    return node instanceof Text;
};

export let isElementNode = (node: Node) => {
    return node instanceof HTMLElement;
};
