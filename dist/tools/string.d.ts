export declare let toString: (value: any, radix?: number | undefined) => any;
export declare let trim: (str: string) => string;
export declare let lower: (str: string) => string;
export declare let split: (str: string, separator: string | RegExp, limit?: number | undefined) => string[];
export declare let match: (str: string, regex: RegExp) => RegExpMatchArray | null;
export declare let upper: (str: string) => string;
export declare let reverseString: (str: string) => string;
export declare let startsWith: (str: string, search: string, position?: number) => boolean;
export declare let endsWith: (str: string, search: string, endPosition?: number) => boolean;
export declare let test: (str: string, regex: RegExp) => boolean;
export declare let replace: (str: string, search: string | RegExp, replacement: string) => string;
/**
 * Check if a string ONLY contains letters (a-z, A-Z)
 * @param value - The string to check
 */
export declare let isStringAlpha: (value: string) => boolean;
/**
 * Check if a string ONLY contains numbers (0-9). No decimals or commas.
 * @param value - The string to check
 */
export declare let isStringNumeric: (value: string) => boolean;
/** Check if a string is a valid path, but not a delete statement */
export declare let isPath: (exp: string) => boolean;
/**
 * Check if a string is an anonymous function or arrow function
 * @param value - The string to check e.g. `function() {}` or `() => {}` or `async function() {}` or `async () => {}`
 * @returns boolean
 */
export declare let isStringFunction: (value: string) => boolean;
/** Check if a string is an anonymous arrow function only */
export declare let isStringArrowFunction: (value: string) => boolean;
export declare let stringify: (value: any) => string;
/**
 * Attempts to parse a JavaScript Object Notation (JSON) string. If the string is not valid JSON, it returns the original string.
 * @param text - A valid JSON string.
 * @param reviver - A function that transforms the results. This function is called for each member of the object. If a member contains nested objects, the nested objects are transformed before the parent object is.
 */
export declare let parse: (value: string, reviver?: ((this: any, key: string, value: any) => any) | undefined) => string;
/**
 * Converts an object to a query string
 * @param params - The object to convert
 * @returns The query string. Includes the '?' character if the query string is not empty.
 */
export declare let queryString: (params: ObjectType) => string;
export declare let wrapInBackticks: (value: string) => string;
