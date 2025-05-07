import { logError, size } from ".";
import { CTX_ARGS, NEW_LINE, TEXT } from "./constants";
import { newObject } from "./object";
import { isStringFunction, isPath, wrapInBackticks } from "./string";
import { getAccessedProp } from "../reactivity/track";
import { isFunction } from "./typeCheck";
import { sanitizeAttrValue, settings, symbol } from "../app";

// Inspired by code from petite-vue (https://github.com/vuejs/petite-vue/blob/main/src/eval.ts)
// Original code licensed under MIT License

export let cache: Record<string, FunctionType> = newObject();

let errorFn = () => symbol;

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
export let evaluate = (vnode: VNode, exp: string, args: string = '', isVoid: boolean = false): [FunctionType, 0|1|2] => {

    /** `0` — Not a reference. `1` — Reference. `2` — Reference is a function. */
    let isRef: 0|1|2 = 0;
    let _ref: FunctionType | undefined;

    // The expression is a path
    // * Since a delete statement matches the path regex, the expression needs to be checked for a delete statement.
    // * This is done to prevent the expression from being evaluated immediately. E.g. `delete $props.count` would delete the prop immediately.
    if (isPath(exp)) {
        // Get the reference, if any
        _ref = getAccessedProp(() => execute(vnode, exp));

        // Reference found
        if (_ref) {
            isRef = 1;

            // Reference is a function
            if (isFunction(_ref())) {
                isRef = 2;
                // Call the function with the arguments
                exp = makeFunction(`${exp}(${args})`, args, isVoid);
            }
        }
        // Reference not found. Wrap the expression in a function
        else exp = makeFunction(exp, args, isVoid);
    }

    // The expression is not a function. Wrap the expression in a function
    // ? This is done to prevent the expression from being evaluated immediately. E.g. `count++` would change the value of `count` immediately.
    else if (!isStringFunction(exp)) exp = makeFunction(exp, args, isVoid);

    /** The function to execute */
    let fn = isRef == 1 
        ? _ref as FunctionType 
        : (...args: any[]) => execute(vnode, exp)(...args);

    return [fn, isRef];
}

/** Execute an expression by creating a function from it */
let execute = (vnode: VNode, exp: string) => {

    // Get the function from the cache or create a new one
    let fn = cache[exp];

    try {
        // Create a new function, if necessary
        if (!fn) fn = new Function(settings[CTX_ARGS], `return(${exp})`) as FunctionType;

        /**
         * Cache the function, if it is not already cached and the expression size is less than 99 characters.
         * 
         * With the exception of expressions that come from script elements, all other expressions come from attributes and should be kept small.
         * It is a good practice to separate the logic from the template and long expressions should be moved into functions.
         * 
         * By experience, as expressions grow, they become more specific to the context in which they are used and less likely to be reused.
         * Keeping the functions from these expressions in the cache would be a waste of memory.
         * 
         * In the other hand, small expressions are more likely to be reused and should be kept in the cache.
         * Some exemples are references to $props or $data, simple calculations, truthy/falsy checks, and other common short expressions.
         * Recreating these functions every time they are used would be a waste of resources.
         * 
         * 99 characters strikes a balance between the two scenarios, but it is not a rule.
         * It comes from personal experience and principles of good programming practices, such as D.R.Y., K.I.S.S., and separation of concerns.
         */
        if (!cache[exp] && size(exp) < 99) cache[exp] = fn;

        // Execute the function
        fn = fn(vnode.ctx);
    }
    catch (error: any) {
        // Log the error
        logError(error.message, 'in expression:', exp);

        // Return an empty function to prevent the error from being thrown again
        fn = errorFn;
    }

    return fn;
}

export let makeFunction = (exp: string, args: string = '', isVoid: boolean = false) =>
    `(${ args })=>${ isVoid ? '{' : '(' }${ NEW_LINE + exp + NEW_LINE }${ isVoid ? '}' : ')' }`;



export let newFn = (args: string, exp: string, returns: boolean = true) =>
    new Function(args, returns ? `return(${exp})` : exp) as FunctionType;

/** Sanitize an expression to prepare it for evaluation */
export let sanitizeExp = (exp: string, isText?: boolean) =>
    isText ? wrapInBackticks(exp) : sanitizeAttrValue(exp);

/** Ensure an expression is a function */
export let expToFn = (exp: string, args: string = '', returns: boolean | 'text' = true) => {

    if (isPath(exp) && !returns) {
        exp += `(${args})`;
    }

    if (!isStringFunction(exp)) {
        // If the expression returns text, wrap it in backticks
        exp = sanitizeExp(exp, returns == TEXT);

        // Make sure the expression is a function
        exp = `(${args})=>` + (returns ? `(${exp})` : `{${exp}}`);
    }

    return exp;
}