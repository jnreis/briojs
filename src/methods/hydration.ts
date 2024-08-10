import { attr, closestProps, newVNode, saveInterceptor, vnodes, vnodesQueue } from "../tools/hydration"
import { logger } from "../tools";
import { $ROOT, AFTER, BEFORE, BUT_GOT_INSTEAD, ELEMENT, METHOD, NOT_FOUND, REQUIRE } from "../tools/constants";
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

export let $before = () => $interceptor(BEFORE);

export let $after = () => $interceptor(AFTER);

export let $root = (_: any) => ($el: HTMLElement|Text) => {
    let _vnode = closestProps($el);
    if (!_vnode) logger($ROOT + ` ${ELEMENT} ` + NOT_FOUND);
    return _vnode?.$el;
};