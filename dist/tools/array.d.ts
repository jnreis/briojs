/**
 * Add an item to the end of an array
 * @param array the array to add the item to
 * @param value the item to add
 * @returns the new length of the array
 */
export declare let arrayAdd: (array: any[], value: any) => number;
/**
 * Sort the items in an array
 * @param array the array to sort
 * @param compareFn a function that defines the sort order
 * @returns the sorted array
 */
export declare let sort: (array: any[], compareFn?: (a: any, b: any) => number) => any[];
/**
 * Reverse the items in an array
 * @param array the array to reverse
 * @returns the reversed array
 */
export declare let arrayReverse: (array: any[]) => any[];
/**
 * Join all items of an array into a string
 * @param array the array to join
 * @param separator a string used to separate the items
 * @returns the joined string
 */
export declare let join: (array: any[], separator?: string) => string;
type PredicateFn = (value: any, index: number, array: any[]) => unknown;
/**
 * Loop through an array
 * @param value the array to loop through
 * @param callbackfn a function to execute on each item
 */
export declare let each: (value: any, callbackfn: (value: any, index: number, array: any) => void) => any;
/**
 * Loop through an array to transform each item
 * @param array the array to loop through
 * @param callbackfn a function to execute on each item
 * @param thisArg an object to use as `this` when executing the callback
 * @returns a new array
 */
export declare let map: (array: any[], callbackfn: (value: any, index: number, array: any[]) => any, thisArg?: any) => any[];
/**
 * Returns the elements of an array that meet the condition specified in a callback function
 * @param array the array to loop through
 * @param predicate a function to test each item
 * @param thisArg an object to use as `this` when executing the callback
 * @returns a new array
 */
export declare let filter: (array: any[], predicate: PredicateFn, thisArg?: any) => any[];
/**
 * Returns the value of the first element in the array where predicate is true, and undefined otherwise
 * @param array the array to loop through
 * @param predicate a function to test each item
 * @param thisArg an object to use as `this` when executing the callback
 * @returns the first item that meets the condition or undefined
 */
export declare let find: (array: any[], predicate: PredicateFn, thisArg?: any) => any;
/**
 * Determines whether all the members of an array satisfy the specified test
 * @param array the array to loop through
 * @param predicate a function to test each item
 * @param thisArg an object to use as `this` when executing the callback
 * @returns true if all items meet the condition, else false
 */
export declare let every: (array: any[], predicate: PredicateFn, thisArg?: any) => boolean;
/**
 * Determines whether the specified callback function returns true for any element of an array
 * @param array the array to loop through
 * @param predicate a function to test each item
 * @param thisArg an object to use as `this` when executing the callback
 * @returns true if any item meets the condition, else false
 */
export declare let some: (array: any[], predicate: PredicateFn, thisArg?: any) => boolean;
/**
 * Returns the index of the first element in the array where predicate is true, and -1 otherwise
 * @param array the array to loop through
 * @param predicate a function to test each item
 * @param thisArg an object to use as `this` when executing the callback
 */
export declare let findIndex: (array: any[], predicate: PredicateFn, thisArg?: any) => number;
/**
 * Returns the index of the first occurrence of a value in an array/string, or -1 if it is not present.
 * @param searchElement — The value to locate in the target.
 * @param fromIndex — The index at which to begin the search. If fromIndex is omitted, the search starts at index 0.
 */
export declare let indexOf: (target: string | any[], searchElement: any, fromIndex?: number) => number;
/**
 * Compare the highest priority using the second item in the array
 */
export declare let sortPriority: (a: [any, number], b: [any, number]) => number;
/**
 * Create an array from an array-like or iterable object
 */
export declare let arrayFrom: (arrayLike: any) => unknown[];
/**
 * Create an array of numbers, starting at a certain number
 * @param length the length of the array
 * @param startAt the number to start at
 */
export declare let arrayFill: (length: number, startAt?: number) => number[];
export {};
