import { replaceMustache, wrapper } from "../hydration";
import { TEXT_CONTENT } from "../tools/constants";
import { isFunction } from "../tools/typeCheck";

export let hydrateText = (vnode: VNode, attrName: string, attrValue: string) => {

    wrapper(vnode, attrName, replaceMustache(attrValue), (node) => (ctx, next) => {

        // Set the text content
        node[TEXT_CONTENT] = isFunction(ctx) ? ctx() : ctx;

        // Next function
        next();
    });
}