import { ATTR, B_HTML, B_TEMPLATE, B_TEXT, EVAL_EFFECT, INNER, INSERT, TEMPLATE, TEXT } from "../tools/constants";
import { wrapInBackticks } from "../tools/string";
import { updateDataLevelContext } from "./context";

export let hydrateHtml = (where: 'inner'|'text') => (bnode: BNode, attrName: string, attrValue: string) => {

    // Single template hydration:
    // If b-template or b-html have been hydrated skip the hydration
    if (!bnode[ATTR][B_TEMPLATE] && !bnode[ATTR][B_HTML]) {

        let templates = bnode[TEMPLATE];

        // Wrap the attribute value in a function that returns the template name as a string.
        // Otherwise, evalEffect will evaluate the template name as a variable and most likely throw an error.
        if (attrValue in templates)
            attrValue = wrapInBackticks(templates[attrValue] || attrValue);

        if (attrValue) {
            // Evaluate the attribute value as an effect
            bnode[EVAL_EFFECT](bnode, attrName, attrValue, (node: HTMLElement) => async (exp) => {

                // Hydrate HTML content
                await bnode[INSERT](exp(), where, node);

                // Update the $refs and $slots objects
                if (where == INNER) await updateDataLevelContext(bnode);
            });
        }
    }

}

export let htmlDirective: Directive = [B_HTML, hydrateHtml(INNER)];
export let textDirective: Directive = [B_TEXT, hydrateHtml(TEXT)];