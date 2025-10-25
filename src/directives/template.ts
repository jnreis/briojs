import { saveToParent } from "../app";
import { logWarn } from "../tools";
import { $INSERT, B_TEMPLATE, BEFORE, INNER_HTML, INVALID__$CAP, NEW_LINE, NODES, SKIP, TEMPLATE, VALUE } from "../tools/constants";
import { removeNode } from "../tools/dom";
import { trim } from "../tools/string";
import { isString } from "../tools/typeCheck";

export let hydrateTemplate = async (bnode: BNode, attrName: string, attrValue: string) => {

    let el = bnode.el;

    // Evaluate the attribute value, if it does not match a saved template
    let template = attrValue ? bnode[TEMPLATE][attrValue] || bnode.exec(bnode, attrValue)() : el[INNER_HTML];

    // Skip the node
    bnode[SKIP] = 2;

    // Hydrate HTML content
    if (isString(template)) {

        // Insert the nodes from the template
        bnode[NODES] = await bnode.gc[$INSERT](el, BEFORE, trim(template));

        // Ensure the element will go through the cleanup process
        saveToParent(bnode, el);

        // Remove the wrapper element
        removeNode(el);
    }
    else logWarn(attrName + ':', INVALID__$CAP, VALUE, NEW_LINE, template);
}

export let templateDirective: Directive = [B_TEMPLATE, hydrateTemplate];