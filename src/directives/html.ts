import { EVAL_EFFECT, INSERT, TEMPLATES } from "../tools/constants";
import { makeFunction } from "../tools/evaluation";
import { stringify } from "../tools/string";

export let hydrateHtml = (where: 'inner'|'text') => (vnode: VNode, attrName: string, attrValue: string, tools: HydrationTools) => {

    // Wrap the attribute value in a function that returns the template name as a string.
    // Otherwise, evalEffect will evaluate the template name as a variable and most likely throw an error.
    if (attrValue in tools[TEMPLATES])
        attrValue = makeFunction(stringify(attrValue));

    // Evaluate the attribute value as an effect
    tools[EVAL_EFFECT](vnode, attrName, attrValue, (node: HTMLElement) => async ([value]: any) => {

        // Hydrate HTML content
        await tools.$dom[INSERT](value(), where, node);
    });
}