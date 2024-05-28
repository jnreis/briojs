import { wrapper } from "../hydration";
import { isFunction } from "../tools/typeCheck";

export let hydrateHtml = (vnode: VNode, attrName: string, attrValue: string) => {

    let callback = (node: HTMLElement) => (ctx: any, next: FunctionType) => {

        // Set the innerHTML
        node.innerHTML = isFunction(ctx) ? ctx() : ctx;

        // Next lifecycle function
        next();
    }

    wrapper(vnode, attrName, attrValue, callback);
}