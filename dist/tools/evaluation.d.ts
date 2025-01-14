/**
 * Evaluate an expression using vnode properties
 * @param vnode The vnode object
 * @param exp The expression to evaluate
 * @param args The arguments to pass to the function
 * @param isVoid Whether the expression should be wrapped in a block
 *
 * @returns `[fn, isRef]` — An array containing the function and a number indicating the type of reference.
 *
 * @types
 * `0` — Not a reference.
 * `1` — Reference.
 * `2` — Reference is a function.
 */
export declare let evaluate: (vnode: VNode, exp: string, args?: string, isVoid?: boolean) => [FunctionType, 0 | 1 | 2];
export declare let makeFunction: (exp: string, args?: string, isVoid?: boolean) => string;
