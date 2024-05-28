import { wrapper } from "../hydration";
import { TEXT_CONTENT } from "../tools/constants";
import { isFunction } from "../tools/typeCheck";

export let hydrateText = (vnode: VNode, attrName: string, attrValue: string) => {

    let callback = (node: HTMLElement) => (ctx: any, next: FunctionType) => {

        // Set the text content
        node[TEXT_CONTENT] = isFunction(ctx) ? ctx() : ctx;

        // Next lifecycle function
        next();
    };

    wrapper(vnode, attrName, attrValue, callback);
}