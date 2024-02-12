import { lower } from './string';

// Get the type of a value
export function getType(value: any): string {
    return lower(Object.prototype.toString.call(value).slice(8, -1));
}

// Check the type of a value
export function is(value: any, type: string) {
    return getType(value) === type;
}

// Check if a value is an object
export function isObject(value: any): boolean {
    return is(value, 'object');
}

// Check if a value is an array
export function isArray(value: any): boolean {
    return is(value, 'array');
}

// Check if a value is a function
export function isFn(value: any) {
    return is(value, 'function');
}

// Check if a value is a string
export function isString(value: any) {
    return is(value, 'string');
}

// Check if a value is a number
export function isNumber(value: any) {
    return is(value, 'number');
}

// Check if a value is numeric
export function isNumeric(str: any) {
    return !isNaN(parseFloat(str)) && isFinite(str);
}

// Check if a value is a boolean
export function isBoolean(value: any) {
    return is(value, 'boolean');
}

// Check if a value is a regular expression
export function isRegExp(value: any) {
    return is(value, 'regexp');
}

// Check if a value is a date
export function isDate(value: any) {
    return is(value, 'date');
}