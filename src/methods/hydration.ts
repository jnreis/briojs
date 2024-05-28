import { attr, newVNode, saveLifecycle, vnodes, vnodesQueue } from "../hydration"
import { BUT_GOT_INSTEAD, ELEMENT, METHOD, REQUIRE } from "../tools/constants";
import { getType, isElementNode } from "../tools/typeCheck";

export let $lifecycle = (lifecycleType: 'before' | 'after') => (_: any) => ($el: HTMLElement, attrName: string, callback: FunctionType) => {
    // Check if $el is an HTMLElement
    if (!isElementNode($el))
        return console.error(`The $${lifecycleType} lifecycle ${METHOD} ${REQUIRE}s an HTML ${ELEMENT}, ${BUT_GOT_INSTEAD(getType($el))}`);

    let hasVNode = vnodes.has($el);

    // Create a temporary vnode, if it doesn't exist
    let vnode: any = newVNode($el, 'temp');

    // Create the attr object, if it doesn't exist
    attr(vnode, attrName);

    // Save the lifecycle
    saveLifecycle(vnode, attrName, lifecycleType, callback);

    // Add the vnode to the queue
    if (!hasVNode) vnodesQueue.set($el, vnode);
};