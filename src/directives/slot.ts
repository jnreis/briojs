import { saveCleanup } from "../app";
import { OUTER_HTML } from "../tools/constants";
import { delAttr, getAttr, removeNode } from "../tools/dom";
import { delProp } from "../tools/object";

export let hydrateSlots = async (bnode: BNode, attrName: string, el: HTMLElement) => {

    // Get the name of the slot from the 'b-slot' attribute
    let attrValue = getAttr(el, attrName);

    // If the slot has a name, save its outer HTML to the component's $slots context
    if (attrValue)  {

        let $slots = bnode.ctx.$slots;

        // Delete the 'b-slot' attribute from the element before saving
        delAttr(el, attrName);

        // Get the outer HTML of the element
        $slots[attrValue] = el[OUTER_HTML];

        removeNode(el);

        // Cleanup
        saveCleanup(bnode, () => delProp($slots, attrValue));
    }
}