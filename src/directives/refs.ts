import { delAttr, getAttr } from "../tools/dom";

/**
 * NOTES:
 * - refs are only available within a b-data context. Make sure to have a b-data directive around the refs you want make available to the context.
 * - if multiple elements share the same ref name within a b-data context, only the last one will be available in the $refs object.
 */

export let hydrateRefs = async (bnode: BNode, attrName: string, el: HTMLElement) => {

    let attrValue = getAttr(el, attrName);

    if (attrValue) {

        // Get the context object
        let $refs = bnode.ctx.$refs;

        // Add the ref to the context
        // NOTE: if multiple elements share the same ref name within a b-data context, only the last one will be available in the $refs object.
        $refs[attrValue] = el;

        // Remove the attribute from the node
        delAttr(el, attrName);
    }
}