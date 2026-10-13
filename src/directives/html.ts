import { evalEffect, saveCleanup } from "../app";
import { logError } from "../tools";
import { $INSERT, ATTR, B_HTML, B_TEMPLATE, B_TEXT, OPTIONS, REPLACE_CHILDREN, SKIP, TEMPLATE, TEXT } from "../tools/constants";
import { hasProp } from "../tools/object";
import { wrapInBackticks } from "../tools/string";

let hydrateHtml = (placement: 'replaceChildren'|'text') => (bnode: BNode, attrName: string, attrValue: string) => {

    // Single template hydration:
    // If b-template or b-html have been hydrated skip the hydration
    if (!(hasProp(bnode[ATTR], B_TEMPLATE) || (hasProp(bnode[ATTR], B_HTML) && placement == TEXT))) {
    
        // Options: {hydrate: boolean, selector: string}
        let baseAttrName = attrName.split('.')[0];
        let dotModifiers = attrName.includes('.') ? attrName.split('.').slice(1) : [];
        let options: Record<string, any> = {
            ...(bnode[OPTIONS][baseAttrName] || {}),
            ...(bnode[OPTIONS][attrName] || {})
        };
        for (let mod of dotModifiers) {
            options[mod] = true;
        }

        // Skip the hydration of the child nodes
        bnode[SKIP] = 2;

        let templates = bnode[TEMPLATE];

        // Wrap the template name in backticks so it is treated as a string.
        // Otherwise, evalEffect will evaluate the template name as a variable and most likely throw an error.
        if (attrValue in templates)
            attrValue = wrapInBackticks(attrValue);

        if (attrValue) {
            let disposed = false;
            let generation = 0;
            let insertQueue: Promise<any> = Promise.resolve();
            saveCleanup(bnode, () => {
                disposed = true;
                generation++;
            });

            // Evaluate the attribute value as an effect
            evalEffect(bnode, attrValue, ctxFn => {
                let currentGeneration = ++generation;
                let content = ctxFn();
                insertQueue = insertQueue.then(async () => {
                    content = await content;
                    if (disposed || currentGeneration !== generation) return;
                    await bnode.gc[$INSERT](bnode.el, placement, content, options);
                    if (!disposed && currentGeneration === generation)
                        bnode[SKIP] = 3;
                }).catch(error => logError(error));
                return insertQueue;
            });
        }
    }
}

export let htmlDirective: Directive = [/^(b-html|html)(\.[\w-]+)*$/, hydrateHtml(REPLACE_CHILDREN)];
export let textDirective: Directive = [/^(b-text|text)(\.[\w-]+)*$/, hydrateHtml(TEXT)];