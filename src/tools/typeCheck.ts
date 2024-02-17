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
    WEAKSET,

    getDescriptor,
    lower,
} from ".";

// Get the type of a value
export const getType = (value: any): string => {
    return lower(Object.prototype.toString.call(value).slice(8, -1));
};

// Check the type of a value
export const is = (value: any, type: string) => {
    return getType(value) === type;
};

export const isNull = (value: any) => {
    return value === null;
};

// Check if a value is an object
export const isObject = (value: any): boolean => {
    return is(value, OBJECT);
};

// Check if a value is an array
export const isArray = (value: any): boolean => {
    return is(value, ARRAY);
};

// Check if a value is a function
export const isFunction = (value: any) => {
    return is(value, FUNCTION);
};

// Check if a value is a string arrow function
export const isAsyncFunction = (value: any) => {
    return is(value, ASYNC_FUNCTION);
}

export const isArrowFunction = (value: any) => {
    return value.prototype === undefined && value.name === "";
};

export const isGetter = (object: Object, key: string) => {
    const descriptor = getDescriptor(object, key);
    return !!descriptor && isFunction(descriptor.get);
};

export const isSetter = (object: Object, key: string) => {
    const descriptor = getDescriptor(object, key);
    return !!descriptor && isFunction(descriptor.set);
};

// Check if a value is a string
export const isString = (value: any) => {
    return is(value, STRING);
};

// Check if a value is a number
export const isNumber = (value: any) => {
    return is(value, NUMBER);
};

// Check if a value is numeric
export const isNumeric = (str: any) => {
    return !isNaN(parseFloat(str)) && isFinite(str);
};

// Check if a value is a boolean
export const isBoolean = (value: any) => {
    return is(value, BOOLEAN);
};

// Check if a value is a regular expression
export const isRegExp = (value: any) => {
    return is(value, REGEXP);
};

// Check if a value is a date
export const isDate = (value: any) => {
    return is(value, DATE);
};

// Check if a value is a map
export const isMap = (value: any) => {
    return is(value, MAP);
};

// Check if a value is a weak map
export const isWeakMap = (value: any) => {
    return is(value, WEAKMAP);
};

// Check if a value is a set
export const isSet = (value: any) => {
    return is(value, SET);
};

// Check if a value is a weak set
export const isWeakSet = (value: any) => {
    return is(value, WEAKSET);
};

// Check if a value is a symbol
export const isSymbol = (value: any) => {
    return is(value, SYMBOL);
};

// Check if a value is a promise
export const isPromise = (value: any) => {
    return is(value, PROMISE);
};

// Check if a value is an error
export const isError = (value: any) => {
    return is(value, ERROR);
};

// Check if a value is a class
export const isClass = (value: any) => {
    return isFunction(value) && /^\s*class\s+/.test(value.toString());
};

export const isTextNode = (node: Node) => {
    return node instanceof Text;
};

export const isElementNode = (node: Node) => {
    return node instanceof HTMLElement;
};
