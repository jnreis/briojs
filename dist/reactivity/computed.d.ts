/**
 * Create a computed property that automatically updates whenever its dependencies change.
 *
 * @param fn - The function that computes the value
 * @returns The property initialization function. This function will be called when the property is first set.
 */
export declare let computed: (fn: FunctionType) => FunctionType;
