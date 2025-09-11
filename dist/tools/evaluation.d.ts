export declare let cache: Record<string, FunctionType>;
/**
 * Evaluate an expression using bnode properties
 * @param bnode The bnode object
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
export declare let evaluate: (bnode: BNode, exp: string, args?: string, isVoid?: boolean) => [FunctionType, 0 | 1 | 2];
export declare let makeFunction: (exp: string, args?: string, isVoid?: boolean) => string;
export declare let newFn: (args: string, exp: string, returns?: boolean) => FunctionType;
/** Sanitize an expression to prepare it for evaluation */
export declare let sanitizeExp: (exp: string, isText?: boolean) => string;
/** Ensure an expression is a function */
export declare let expToFn: (exp: string, args?: string, returns?: boolean | "text") => string;
