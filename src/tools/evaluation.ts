import { isStringFunction, match } from "./string";
import { sanitizeAttrValue } from "../app";
import { getKeys } from "./object";
import { filter, join } from "./array";
import { has } from ".";
import { $DATA, $FOR, $STORE } from "./constants";

export let newFn = (args: string, exp: string, returns: boolean = true) =>
    new Function(args, returns ? `return(${exp})` : exp) as FunctionType;

/** Ensure an expression is a function */
export let expToFn = (exp: string, args: string = '', returns: boolean = true) => {

    if (!isStringFunction(exp)) {
        // If the expression returns text, wrap it in backticks
        exp = sanitizeAttrValue(exp);

        // Make sure the expression is a function
        exp = `(${args})=>` + (returns ? `(${exp})` : `{${exp}`);
    }

    return exp;
}

let ctxNames = [$FOR, $DATA, $STORE];

/**
 * Auto-fill the property context when the expression starts with an identifier that 
 * matches a property in one of the context objects ($for, $data, $store).
 * 
 * @param bnode The BNode instance containing the context.
 * @param exp The expression to be evaluated.
 * @returns The expression with the context-prefixed identifier if a match is found.
 */
export let autoFillContextProp = (bnode: BNode, exp: string): string => {

    let propName = match(exp, /^\s*([a-z_$][\w$]*)/i);

    if (!propName) return exp;

    for (let ctxName of ctxNames) {
        let ctx = bnode.ctx[ctxName];
        if (ctx && propName[1] in ctx) {
            // If found, replace the identifier with the context-prefixed version
            exp = ctxName + '.' + exp;
            break;
        }
    }

    return exp;
}

export let destructuringObject = (obj: ObjectType, exp: string): string =>
    '{' + join(filter(getKeys(obj), key => has(exp, key)), ',') + '}';
