import { evaluate } from "../tools/evaluation";
import { callHook, setHook } from "../tools/hook";

export let hydrateInit = (vnode: VNode, attrName: string, attrValue: string) => {

    let $el = vnode.$el;

    // Set the directive hook
    setHook($el, attrName, async (ctx) => {
        // Call the expression
        await ctx();
    });

    // Evaluate the expression and run it only once
    callHook($el, attrName, evaluate(vnode, attrValue, '', true)[0]);
}