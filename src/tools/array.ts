import { LENGTH, REVERSE } from "./constants";

// ! Array Mutator Methods (modify the original array)

/**
 * Add an item to the end of an array
 * @param array the array to add the item to
 * @param value the item to add
 * @returns the new length of the array
 */
export let arrayAdd = (array: any[], ...value: any) =>
    array.push(...value);

/**
 * Sort the items in an array
 * @param array the array to sort
 * @param compareFn a function that defines the sort order
 * @returns the sorted array
 */
export let sort = (array: any[], compareFn?: (a: any, b: any) => number) =>
    array.sort(compareFn);

/**
 * Reverse the items in an array
 * @param array the array to reverse
 * @returns the reversed array
 */
export let arrayReverse = (array: any[]) =>
    array[REVERSE]();



// ! Array Accessor Methods (do not modify the original array)

/**
 * Join all items of an array into a string
 * @param array the array to join
 * @param separator a string used to separate the items
 * @returns the joined string
 */
export let join = (array: any[], separator?: string) =>
    array.join(separator);



// ! Iteration Methods (Used to loop through arrays)

type PredicateFn = (value: any, index: number, array: any[]) => unknown;

/**
 * Loop through an array
 * @param value the array to loop through
 * @param callbackfn a function to execute on each item
 */
export let each = (value: any, callbackfn: (value: any, index: any, array: any) => void) =>
    value.forEach(callbackfn);

/**
 * Loop through an array to transform each item
 * @param array the array to loop through
 * @param callbackfn a function to execute on each item
 * @param thisArg an object to use as `this` when executing the callback
 * @returns a new array
 */
export let map = (array: any[], callbackfn: (value: any, index: number, array: any[]) => any, thisArg?: any) =>
    array.map(callbackfn, thisArg);

/**
 * Returns the elements of an array that meet the condition specified in a callback function
 * @param array the array to loop through
 * @param predicate a function to test each item
 * @param thisArg an object to use as `this` when executing the callback
 * @returns a new array
 */
export let filter = (array: any[], predicate: PredicateFn, thisArg?: any) =>
    array.filter(predicate, thisArg);

/**
 * Returns the value of the first element in the array where predicate is true, and undefined otherwise
 * @param array the array to loop through
 * @param predicate a function to test each item
 * @param thisArg an object to use as `this` when executing the callback
 * @returns the first item that meets the condition or undefined
 */
export let find = (array: any[], predicate: PredicateFn, thisArg?: any) =>
    array.find(predicate, thisArg);

/**
 * Determines whether all the members of an array satisfy the specified test
 * @param array the array to loop through
 * @param predicate a function to test each item
 * @param thisArg an object to use as `this` when executing the callback
 * @returns true if all items meet the condition, else false
 */
export let every = (array: any[], predicate: PredicateFn, thisArg?: any) =>
    array.every(predicate, thisArg);

/**
 * Determines whether the specified callback function returns true for any element of an array
 * @param array the array to loop through
 * @param predicate a function to test each item
 * @param thisArg an object to use as `this` when executing the callback
 * @returns true if any item meets the condition, else false
 */
export let some = (array: any[], predicate: PredicateFn, thisArg?: any) =>
    array.some(predicate, thisArg);

/**
 * Returns the index of the first element in the array where predicate is true, and -1 otherwise
 * @param array the array to loop through
 * @param predicate a function to test each item
 * @param thisArg an object to use as `this` when executing the callback
 */
export let findIndex = (array: any[], predicate: PredicateFn, thisArg?: any) =>
    array.findIndex(predicate, thisArg);

/**
 * Returns the index of the first occurrence of a value in an array/string, or -1 if it is not present.
 * @param searchElement — The value to locate in the target.
 * @param fromIndex — The index at which to begin the search. If fromIndex is omitted, the search starts at index 0.
 */
export let indexOf = (target: string | any[], searchElement: any, fromIndex?: number) =>
    target.indexOf(searchElement, fromIndex);

/**
 * Compare the highest priority using the second item in the array
 */
export let sortPriority = (a: [any, number], b: [any, number]) => b[1] - a[1];

// ! OTHER METHODS

/**
 * Create an array from an array-like or iterable object
 */
export let arrayFrom = (arrayLike: any) =>
    Array.from(arrayLike);

/**
 * Create an array of numbers, starting at a certain number
 * @param length the length of the array
 * @param startAt the number to start at
 */
export let arrayFill = (length: number, startAt: number = 0): number[] =>
    map(arrayFrom({ [LENGTH]: length }), (_, i) => startAt + i);

