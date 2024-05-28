import { wrapper } from "../hydration";
import { isFunction } from "../tools/typeCheck";

export let hydrateEffect = (vnode: VNode, attrName: string, attrValue: string) => {

    let callback = () => (ctx: any, next: FunctionType) => {

        // Call the expression
        if (isFunction(ctx)) ctx();

        // Next lifecycle function
        next();
    };

    wrapper(vnode, attrName, attrValue, callback);
}