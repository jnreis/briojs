import { EVAL_EFFECT } from "../tools/constants";
import { makeFunction } from "../tools/evaluation";
import { isStringFunction } from "../tools/string";

export let hydrateEffect = (vnode: VNode, attrName: string, attrValue: string, tools: HydrationTools) => {

    // Check if string is a function
    if (!isStringFunction(attrValue))
        attrValue = makeFunction(attrValue, '$controls', true);

    // Evaluate the attribute value as an effect
    tools[EVAL_EFFECT](vnode, attrName, attrValue, () => async ([call]: any, controls: HookControls) => {
        // Call the expression
        await call(controls);
    });

}