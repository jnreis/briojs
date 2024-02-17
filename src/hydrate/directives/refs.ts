import { ObjectType, RawElement } from "../index.d";

import { PROPS, delAttr, getAttr, isArray, q } from "../../tools";

export const hydrateRefs = (rawNode: RawElement) => {
    const {$el} = rawNode;

    // Query all refs not inside another context
    const $refs: ObjectType = {};
    const REF = 'ref';

    const query = q(`[ref]:not([${PROPS}]):not([${PROPS}] [ref])`, $el);

    [$el, ...query].forEach(ref => {
        const refName = getAttr(ref as HTMLElement, REF);
        if (refName) {
            // Check if the ref already exists
            const r = $refs[refName];
            if (r) {
                // Add the ref to the ref array
                if (isArray(r)) r.push(ref);
                // Convert the ref to an array
                else $refs[refName] = [r, ref];
            }
            // Add the ref to the context
            else $refs[refName] = ref;
            // Remove the attribute from the node
            delAttr(ref as HTMLElement, REF);
        }
    });

    // Add the refs to the rawNode
    rawNode.$refs = $refs;
}