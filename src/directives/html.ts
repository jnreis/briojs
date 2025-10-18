import { updateDataLevelContext } from "../app";
import { ATTR, B_HTML, B_TEMPLATE, B_TEXT, EVAL_EFFECT, HYDRATE, INNER, INSERT, SKIP, TEMPLATE, TEXT } from "../tools/constants";
import { hasProp } from "../tools/object";
import { wrapInBackticks } from "../tools/string";

export let hydrateHtml = (where: 'inner'|'text') => (bnode: BNode, attrName: string, attrValue: string) => {

    // Single template hydration:
    // If b-template or b-html have been hydrated skip the hydration
    if (!(hasProp(bnode[ATTR], B_TEMPLATE) || (hasProp(bnode[ATTR], B_HTML) && where == TEXT))) {

        // Skip the hydration of the child nodes
        bnode[SKIP] = 2;

        let templates = bnode[TEMPLATE];

        // Wrap the attribute value in a function that returns the template name as a string.
        // Otherwise, evalEffect will evaluate the template name as a variable and most likely throw an error.
        if (attrValue in templates)
            attrValue = wrapInBackticks(templates[attrValue] || attrValue);

        if (attrValue) {
            // Evaluate the attribute value as an effect
            bnode[EVAL_EFFECT](bnode, attrName, attrValue, (node: HTMLElement) => async (exp) => {

                // Insert the evaluated content into the DOM
                await bnode[INSERT](exp(), where, node, {
                    [HYDRATE]: false
                });

                // Update the $slots and $refs objects
                if (where == INNER) await updateDataLevelContext(bnode);

                // Skip the rehydration of the node
                bnode[SKIP] = 1;

                // Hydrate the inserted nodes
                bnode[HYDRATE](node);
            });
        }
    }
}

export let htmlDirective: Directive = [B_HTML, hydrateHtml(INNER)];
export let textDirective: Directive = [B_TEXT, hydrateHtml(TEXT)];