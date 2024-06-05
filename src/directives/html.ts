import { wrapper } from "../hydration";
import { isFunction } from "../tools/typeCheck";

export let hydrateHtml = (vnode: VNode, attrName: string, attrValue: string) => {

    wrapper(vnode, attrName, attrValue, (node) => (ctx, next) => {

        // Set the innerHTML
        node.innerHTML = isFunction(ctx) ? ctx() : ctx;

        // Next function
        next();
    });
}