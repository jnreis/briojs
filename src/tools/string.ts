import { arrayReverse, join } from './array';
import { DELETE, ENDS_WITH, REPLACE, STARTS_WITH, TO_STRING } from './constants';

export let toString = (value: any, radix?: number | undefined) => value[TO_STRING](radix);

export let trim = (str: string) => str.trim();

export let lower = (str: string) => str.toLowerCase();

export let split = (str: string, separator: string | RegExp, limit?: number | undefined) => str.split(separator, limit);

export let match = (str: string, regex: RegExp) => str.match(regex);

// export let hasSubstring = (haystack: string, needle: string, caseInsensitive = false) => {
//     if (caseInsensitive) {
//         return has(lower(haystack), lower(needle));
//     }
//     return has(haystack, needle);
// }

// export let upper = (str: string) => str.toUpperCase();

// export let capitalize = (str: string) => upper(str[0]) + slice(str, 1);

// export let uncapitalize = (str: string) => lower(str[0]) + slice(str, 1);

export let reverseString = (str: string) => join(arrayReverse(split(str, '')), '');

// export let lastIndex = (str: string, search: string) => str.lastIndexOf(search);

export let startsWith = (str: string, search: string, position?: number) => str[STARTS_WITH](search, position);

export let endsWith = (str: string, search: string, endPosition?: number) => str[ENDS_WITH](search, endPosition);

export let test = (str: string, regex: RegExp) => regex.test(str);

export let replace = (str: string, search: string | RegExp, replacement: string) => str[REPLACE](search, replacement);

/**
 * Check if a string ONLY contains letters (a-z, A-Z)
 * @param value - The string to check
 */
export let isStringAlpha = (value: string) => test(value, /^[a-z]+$/i);

/**
 * Check if a string ONLY contains numbers (0-9). No decimals or commas.
 * @param value - The string to check
 */
export let isStringNumeric = (value: string) => test(value, /^\d+$/);

/** Check if a string is a valid path, but not a delete statement */
export let isPath = (exp: string) =>
    test(exp, /^(\w|\s|\.|\$|`|'|"|(\[(.|\s)+?\]))*;?$/g) && !startsWith(exp, DELETE+' ');

/**
 * Check if a string is an anonymous function or arrow function
 * @param value - The string to check e.g. `function() {}` or `() => {}` or `async function() {}` or `async () => {}`
 * @returns boolean
 */
export let isStringFunction = (value: string) =>
    test(trim(value), /^((async\s+)?function\s*\([^)]*\)\s*{[^}]*}|(async\s*)?(?:\([^()]*\)|[$\w]+)\s*=>)/);

/** Check if a string is an anonymous arrow function only */
export let isStringArrowFunction = (value: string) => test(trim(value), /^(async\s*)?(?:\([^()]*\)|[$\w]+)\s*=>/);

// export let makeFunctionAnonymous = (fn: Function) => {
//     let name = fn.name;
//     let body = toString(fn);

//     return test(body, new RegExp(`${name}\\s*\\(`)) ? replace(body, name, FUNCTION) : body;
// }


// export let camelCase = (...args: string[]) => uncapitalize(join(map(args, capitalize), ''));

export let stringify = (value: any) => JSON.stringify(value);

/**
 * Attempts to parse a JavaScript Object Notation (JSON) string. If the string is not valid JSON, it returns the original string.
 * @param text - A valid JSON string.
 * @param reviver - A function that transforms the results. This function is called for each member of the object. If a member contains nested objects, the nested objects are transformed before the parent object is.
 */
export let parse = (value: string, reviver?: ((this: any, key: string, value: any) => any) | undefined) => {
    try {
        value = JSON.parse(value, reviver);
    }
    catch {}
    return value;
}

/**
 * Converts an object to a query string
 * @param params - The object to convert
 * @returns The query string. Includes the '?' character if the query string is not empty.
 */
export let queryString = (params: ObjectType) => {
    let query = toString(new URLSearchParams(params));
    return query ? '?' + query : '';
}

export let wrapInBackticks = (value: string) => '`' + replace(value, /`/g, '\\`') + '`';