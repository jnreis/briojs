import { q, delAttr, getAttr } from "../tools/dom";
import { isArray } from "../tools/typeCheck";
import { $REFS, PROPS } from "../tools/constants";
import { arrayAdd, each } from "../tools/array";
import { callHook, setHook } from "../tools/hook";

export let hydrateRefs = (vnode: VNode) => {

    let $el = vnode.$el;
    let attrName = 'b-ref';

    setHook($el, attrName, () => {
        // Query all refs not inside another context
        let $refs: ObjectType = {};

        let query = q(`[${attrName}]:not([b-${PROPS}]):not([b-${PROPS}] [${attrName}])`, $el);

        each([$el, ...query], ref => {
            let refName = getAttr(ref as HTMLElement, attrName);
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
                delAttr(ref as HTMLElement, attrName);
            }
        });

        // Add the refs to the vnode
        vnode[$REFS] = $refs;
    });

    // Call the hook
    callHook($el, attrName);
}