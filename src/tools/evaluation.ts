import { isStringFunction, match, replace, test } from "./string";
import { sanitizeAttrValue, templateRegex } from "../app";
import { getKeys, newSet } from "./object";
import { arrayAdd, filter, join } from "./array";
import { has, size } from ".";
import { $DATA, $FOR, $STORE } from "./constants";

export let newFn = (args: string, exp: string, returns: boolean = true) =>
    new Function(args, returns ? `return(${exp})` : exp) as FunctionType;

/** Ensure an expression is a function */
export let expToFn = (exp: string, args: string = '', returns: boolean = true) => {

    if (!isStringFunction(exp)) {
        // If the expression returns text, wrap it in backticks
        exp = sanitizeAttrValue(exp);

        // Make sure the expression is a function
        exp = `(${args})=>` + (returns ? `(${exp})` : `{${exp}}`);
    }

    return exp;
}

export let autoFillContextProp = (bnode: BNode, exp: string): string => {

    let propName = match(exp, /^\s*([a-z_$][\w$]*)/i);

    if (!propName) return exp;

    for (let ctxName of [$FOR, $DATA, $STORE]) {
        let ctx = bnode.ctx[ctxName];
        if (ctx && propName[1] in ctx) {
            // If found, replace the identifier with the context-prefixed version
            exp = ctxName + '.' + exp;
            break;
        }
    }

    return exp;
}

/**
 * Find a missing character in a string among all Unicode characters (~1.1 million characters).
 * 
 * Useful for finding a unique placeholder character that does not exist in a given string.
 * 
 * Note it does not include surrogate halves (D800–DFFF) as they are invalid standalone codepoints.
 * 
 * @param str - The string to check
 * @returns A character that is not present in the string
 */
export let missingChar = (str: string, exclude: Set<string> = newSet()) => {
    // Fast lookup
    let has: Set<string> = newSet(str);

    // Unicode range goes up to U+10FFFF
    for (let cp = 0x80; cp <= 0x10FFFF; cp++) {
        // Skip surrogate halves (D800–DFFF) — invalid standalone codepoints
        if (cp >= 0xD800 && cp <= 0xDFFF) continue;

        let ch = String.fromCodePoint(cp);
        if (!has.has(ch) && !exclude.has(ch)) return ch;
    }

    // Nearly impossible to reach
}

export let getTemplateExpressions = (template: string): [string, [string, string][]] => {
    let items: [string, string][] = [];
    let placeholders: Set<string> = newSet();

    while (test(template, templateRegex)) {
        // Find a unique placeholder character
        let placeholder = missingChar(template, placeholders);

        // If no placeholder found, break the loop.
        // Nearly impossible to reach.
        if (!placeholder) break;

        // Replace the matched expression with the placeholder
        template = replace(template, templateRegex, (_: string, expression: string) => {
            // Store the matched expression
            arrayAdd(items, [placeholder, expression]);

            // Keep track of used placeholders
            placeholders.add(placeholder);

            return placeholder;
        });
    }

    return [template, items];
}

export let setTemplateExpressions = (template: string, expressions: [string, string][]) => {
    for (let i = size(expressions) - 1; i >= 0;  i--) {
        let [placeholder, expression] = expressions[i];
        template = replace(template, placeholder, '${' + expression + '}');
    }
    return template;
}

export let destructuringObject = (obj: ObjectType, exp: string): string =>
    '{' + join(filter(getKeys(obj), key => has(exp, key)), ',') + '}';
