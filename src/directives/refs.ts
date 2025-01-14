import { arrayAdd, each } from "../tools/array";
import { B_DATA, HOOKS } from "../tools/constants";
import { cssNotAttr, delAttr, getAttr, queryAll } from "../tools/dom";
import { isArray } from "../tools/typeCheck";

/**
 * NOTE
 * - refs are only available within a b-data context. Make sure to have a b-data directive around the refs you want make available to the context.
 */

export let hydrateRefs = async (vnode: VNode, attrName: string, tools: HydrationTools) => {

    let [setHook, playHook] = tools[HOOKS];

    let $el = vnode.el;

    setHook($el, attrName, () => {
        // Get the $refs object
        let $refs = vnode.lc.$refs as ObjectType;
        let attrSelector = ` [${attrName}]`;

        // Query all refs not inside another context
        let query = queryAll(attrSelector + cssNotAttr(B_DATA) + cssNotAttr(B_DATA, attrSelector), $el);

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
    });

    // Play the hook
    await playHook($el, attrName);
}