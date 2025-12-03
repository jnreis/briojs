import { DELETE } from "./constants";
import { isStringFunction, match, startsWith, test, trim } from "./string";
import { sanitizeAttrValue } from "../app";
import { size, slice } from ".";

export let newFn = (args: string, exp: string, returns: boolean = true) =>
    new Function(args, returns ? `return(${exp})` : exp) as FunctionType;

/** Ensure an expression is a function */
export let expToFn = (exp: string, args: string = '', returns: boolean = true) => {

    // Call the expression as a function
    if (isPath(exp) && !returns) {
        exp += `(${args})`;
    }

    if (!isStringFunction(exp)) {
        // If the expression returns text, wrap it in backticks
        exp = sanitizeAttrValue(exp);

        // Make sure the expression is a function
        exp = `(${args})=>` + (returns ? `(${exp})` : `{${exp}}`);
    }

    return exp;
}

let startWithSpaceRegex = /^\s/;
let startWithVariableRegex = /^[a-z_$][\w$]*/i;
let startWithBracketRegex = /^\[[^\]]*\]/;
let startWithParenthesisRegex = /^\([^\)]*\)/;

/**
 * Check if a string is a valid path expression
 * 
 * Notes:
 * - Delete statements are not considered valid paths.
 * - Function calls and bracket notation are allowed, however they must NOT include a closing parenthesis or bracket before their actual end. 
 *   This is because the regex finds the first closing parenthesis/bracket and assumes it is the end of the expression.
 *   However, this should not be an issue in most cases.
 *   - Valid: `fn(1,2,3).name`, `$data['name']`
 *   - Not valid: `fn(')').name`, `$data.['name]']`
 */
let isPath = (exp: string) => {

    exp = trim(exp);

    // Is empty or a delete statement
    if (!exp || startsWith(exp, DELETE+' ')) return false;

    let lastIndex = size(exp);
    /**
     * 0. initial
     * 1. variable name
     * 2. bracket
     * 3. parenthesis
     * 4. dot notation
     */
    let lastMatchType: 0 | 1 | 2 | 3 | 4 = 0;
    for (let i = 0; i < lastIndex; i++) {

        // Get the remaining substring
        let sub = slice(exp, i) as string;

        let matchType: 0 | 1 | 2 | 3 | 4 = 0;
        let matchRegex: RegExp;

        let notFirstOrDot = lastMatchType != 0 && lastMatchType != 4;

        // Is space
        if (test(sub, startWithSpaceRegex)) {
            continue;
        }
        // Variable name
        // Valid: $data.name, $data['name'], $data['person'].name
        // Not valid: .name, $data['person']name
        else if (!notFirstOrDot && test(sub, startWithVariableRegex)) {
            matchType = 1;
            matchRegex = startWithVariableRegex;
        }
        // Bracket
        // - Valid: $data['name'], $data[0]
        // - Not valid: [0], $data.[0]
        else if (notFirstOrDot && test(sub, startWithBracketRegex)) {
            matchType = 2;
            matchRegex = startWithBracketRegex;
        }
        // Parenthesis (function call)
        // - Valid: $data()['name'], $data(0)
        // - Not valid: (0), $data.(0)
        else if (notFirstOrDot && test(sub, startWithParenthesisRegex)) {
            matchType = 3;
            matchRegex = startWithParenthesisRegex;
        }
        // Dot notation
        // - Valid: $data.name, $data.name.first
        // - Not valid: .name, $data..name
        else if (notFirstOrDot && startsWith(sub, '.')) {
            matchType = 4;
            matchRegex = /^\./;
        }
        // Not a valid path
        else return false;

        // Update the index and last match type
        let matched = match(sub, matchRegex);
        i += size(matched![0]) - 1;
        lastMatchType = matchType;
    }

    return lastMatchType == 1 || lastMatchType == 2;
}