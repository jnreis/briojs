import { size, slice } from ".";
import { $DATA, $FOR, $PROPS, $STORE, INDEX } from "./constants";
import { newSet } from "./object";

/**
 * Find variables used in a template literal
 * 
 * @param templateLiteral Template literal to analyze. Must not include surrounding backticks.
 * @returns A set of variable names found within template literals.
 */
export let findVariablesInTemplateLiteral = (templateLiteral: string, wrapInTemplateExp = false) => {
    
    let found: Set<[string, number, number]> = newSet();

    let openBackticks = 1;
    let openTemplateExpressions = wrapInTemplateExp ? 1 : 0;
    let quote: `'` | `"` | `` = '';

    // Regex to match quotes, backticks, template expressions, and variable names
    let regex = /('|"|`|\${|}|[a-z_$][\w$]*)/gi;

    let matched;
    while ((matched = regex.exec(templateLiteral)) !== null) {
        let index = matched[INDEX];
        let prevChar = templateLiteral[index - 1] || '';

        // Escaped character, skip processing
        if (prevChar == '\\') {
            continue;
        }

        let matchStr = matched[0];

        // In quote, ignore everything until the quote is closed
        if (quote) {
            // Close quote
            if (matchStr == quote) quote = '';
        }
        // Open quote
        else if (matchStr == `'` || matchStr == `"`) {
            quote = matchStr;
        }
        // Open/close backticks
        else if (matchStr == '`') {
            openBackticks += openBackticks <= openTemplateExpressions ? 1 : -1;
        }
        else if (matchStr == '${' || matchStr == '}') {
            openTemplateExpressions += matchStr == '}' ? -1 : 1;
        }
        // Capture variable if in template expression within backticks
        else if (openBackticks > 0 && openBackticks == openTemplateExpressions && prevChar != '.') {
            found.add([matchStr, index, index + size(matchStr)]);
        }
    }

    return found;
}

export let prefixPropsInContext = (bnode: BNode, code: string, wrapInTemplateExp = false) => {

    let found = findVariablesInTemplateLiteral(code, wrapInTemplateExp);

    let updatedCode = '';
    let lastIndex = 0;

    let ctx = bnode.ctx;

    for (let [name, start, end] of found) {

        // Is in one of these contexts?
        for (let obj of [$FOR, $DATA, $PROPS, $STORE] as (keyof Context)[]) {

            // Check if the variable is a property of a known context object
            if (ctx[obj] && name in ctx[obj]) {

                // Slice the code until the end of the variable
                updatedCode += slice(code, lastIndex, start) + `${obj}.${name}`;

                // Update the last index to the end of the variable
                lastIndex = end;

                // Stop at the first match
                break;
            }
        }
    }

    return updatedCode + slice(code, lastIndex);
}