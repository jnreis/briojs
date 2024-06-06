import { attr, newVNode, saveInterceptor, vnodes, vnodesQueue } from "../hydration"
import { logger } from "../tools";
import { BUT_GOT_INSTEAD, ELEMENT, METHOD, REQUIRE } from "../tools/constants";
import { getType, isElementNode } from "../tools/typeCheck";

export let $interceptor = (interceptorType: 'before' | 'after') => (_: any) => ($el: HTMLElement, attrName: string, fn: Interceptor) => {
    // Check if $el is an HTMLElement
    if (!isElementNode($el))
        return logger(`The $${interceptorType} ${METHOD} ${REQUIRE}s an HTML ${ELEMENT}, ${BUT_GOT_INSTEAD(getType($el))}`);

    let hasVNode = vnodes.has($el);

    // Create a temporary vnode, if it doesn't exist
    let vnode: any = newVNode($el, 'temp');

    // Create the attr object, if it doesn't exist
    attr(vnode, attrName);

    // Save the interceptor
    saveInterceptor(vnode, attrName, interceptorType, fn);

    // Add the vnode to the queue
    if (!hasVNode) vnodesQueue.set($el, vnode);
};