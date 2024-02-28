import { VNode, ObjectType } from "..";

import { q, delAttr, getAttr } from "../tools/dom";
import { isArray } from "../tools/typeCheck";
import { PROPS } from "../tools/constants";

export let hydrateRefs = (vnode: VNode) => {

    // Query all refs not inside another context
    let $refs: ObjectType = {};

    let query = q(`[ref]:not([${PROPS}]):not([${PROPS}] [ref])`, vnode.$el);

    [vnode.$el, ...query].forEach(ref => {
        let refName = getAttr(ref as HTMLElement, 'ref');
        if (refName) {
            // Check if the ref already exists
            let r = $refs[refName];
            if (r) {
                // Add the ref to the ref array
                if (isArray(r)) r.push(ref);
                // Convert the ref to an array
                else $refs[refName] = [r, ref];
            }
            // Add the ref to the context
            else $refs[refName] = ref;
            // Remove the attribute from the node
            delAttr(ref as HTMLElement, 'ref');
        }
    });

    // Add the refs to the vnode
    vnode.$refs = $refs;
}