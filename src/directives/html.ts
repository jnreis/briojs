import { evalEffect } from "../app";
import { $INSERT, ATTR, B_HTML, B_TEMPLATE, B_TEXT, OPTIONS, REPLACE_CHILDREN, SKIP, TEMPLATE, TEXT } from "../tools/constants";
import { hasProp } from "../tools/object";
import { wrapInBackticks } from "../tools/string";

let hydrateHtml = (placement: 'replaceChildren'|'text') => (bnode: BNode, attrName: string, attrValue: string) => {

    // Single template hydration:
    // If b-template or b-html have been hydrated skip the hydration
    if (!(hasProp(bnode[ATTR], B_TEMPLATE) || (hasProp(bnode[ATTR], B_HTML) && placement == TEXT))) {
    
        // Options: {hydrate: boolean, selector: string}
        let options = bnode[OPTIONS][attrName] || {};

        // Skip the hydration of the child nodes
        bnode[SKIP] = 2;

        let templates = bnode[TEMPLATE];

        // Wrap the template name in backticks so it is treated as a string.
        // Otherwise, evalEffect will evaluate the template name as a variable and most likely throw an error.
        if (attrValue in templates)
            attrValue = wrapInBackticks(attrValue);

        if (attrValue) {
            // Evaluate the attribute value as an effect
            evalEffect(bnode, attrValue, async (ctxFn) => {

                // Insert the evaluated content into the DOM
                await bnode.gc[$INSERT](bnode.el, placement, ctxFn(), options);

                // Skip the rehydration of the node
                bnode[SKIP] = 3;
            });
        }
    }
}

export let htmlDirective: Directive = [B_HTML, hydrateHtml(REPLACE_CHILDREN)];
export let textDirective: Directive = [B_TEXT, hydrateHtml(TEXT)];