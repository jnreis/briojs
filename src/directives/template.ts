import { saveToParent } from "../app";
import { logWarn } from "../tools";
import { B_TEMPLATE, BEFORE, INNER_HTML, INSERT, INVALID__$CAP, NODES, TEMPLATE, VALUE } from "../tools/constants";
import { removeNode } from "../tools/dom";
import { trim } from "../tools/string";
import { isString } from "../tools/typeCheck";
import { updateDataLevelContext } from "./context";

export let hydrateTemplate = async (bnode: BNode, attrName: string, attrValue: string) => {

    let el = bnode.el;

    // Evaluate the attribute value, if it does not match a saved template
    let template = attrValue ? bnode[TEMPLATE][attrValue] || bnode.exec(bnode, attrValue)() : el[INNER_HTML];

    if (!attrValue) {
        // Clear the inner HTML of the element, to prevent duplicate content
        el[INNER_HTML] = '';
    }

    // Hydrate HTML content
    if (isString(template)) {

        // Insert and hydrate the template content
        await bnode[INSERT](trim(template), BEFORE, el, {
            then: (insertedNodes: Node[]) => {
                // The nodes that were inserted
                bnode[NODES] = insertedNodes;
            }
        });

        // Ensure the element will go through the cleanup process
        saveToParent(bnode, el);

        // Remove the wrapper element
        removeNode(el);

        // Update the $refs and $slots objects
        await updateDataLevelContext(bnode);
    }
    else logWarn(attrName + ':', INVALID__$CAP, VALUE, '\n', template);
}

export let templateDirective: Directive = [B_TEMPLATE, hydrateTemplate];