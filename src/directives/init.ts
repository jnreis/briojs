import { interceptor } from "../hydration";
import { evaluate } from "../evaluation";

export let hydrateInit = (vnode: VNode, attrName: string, attrValue: string) => {

    // Create an interceptor
    interceptor(vnode, attrName, (ctx, next) => {

        // Call the expression
        ctx();

        // Next function
        next();
    })
    // Evaluate the expression and run it only once
    (evaluate(vnode, attrValue, '', true)[0]);
}