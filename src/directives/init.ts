import { lifecycle } from "../hydration";
import { evaluate } from "../evaluation";

export let hydrateInit = (vnode: VNode, attrName: string, attrValue: string) => {

    // Prepare the lifecycle functions, if any
    lifecycle(vnode, attrName, (ctx, next) => {

        // Call the expression
        ctx();

        // Next lifecycle function
        next();
    })
    // Evaluate the expression and run it only once
    (evaluate(vnode, attrValue, '', true)[0]);
}