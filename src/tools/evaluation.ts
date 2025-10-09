import { TEXT } from "./constants";
import { isStringFunction, isPath, wrapInBackticks } from "./string";
import { sanitizeAttrValue } from "../app";

export let newFn = (args: string, exp: string, returns: boolean = true) =>
    new Function(args, returns ? `return(${exp})` : exp) as FunctionType;

/** Sanitize an expression to prepare it for evaluation */
export let sanitizeExp = (exp: string, isText?: boolean) =>
    isText ? wrapInBackticks(exp) : sanitizeAttrValue(exp);

/** Ensure an expression is a function */
export let expToFn = (exp: string, args: string = '', returns: boolean | 'text' = true) => {

    // Call the expression as a function
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