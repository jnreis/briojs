import { wrapper } from "../hydration";
import { isFunction } from "../tools/typeCheck";

export let hydrateEffect = (vnode: VNode, attrName: string, attrValue: string) => {

    wrapper(vnode, attrName, attrValue, () => (ctx, next) => {

        // Call the expression
        if (isFunction(ctx)) ctx();

        // Next function
        next();
    });
}