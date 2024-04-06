import { q, delAttr, getAttr } from "../tools/dom";
import { isArray } from "../tools/typeCheck";
import { $EL, $REFS, PROPS } from "../tools/constants";
import { arrayAdd, each } from "../tools/array";

export let hydrateRefs = (vnode: VNode) => {

    // Query all refs not inside another context
    let $refs: ObjectType = {};

    let query = q(`[ref]:not([${PROPS}]):not([${PROPS}] [ref])`, vnode[$EL]);

    each([vnode[$EL], ...query], ref => {
        let refName = getAttr(ref as HTMLElement, 'ref');
        if (refName) {
            // Check if the ref already exists
            let r = $refs[refName];
            if (r) {
                // Add the ref to the ref array
                if (isArray(r)) arrayAdd(r, ref);
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
    vnode[$REFS] = $refs;
}