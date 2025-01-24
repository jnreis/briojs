import { EVAL_EFFECT, INSERT, TEMPLATE, TEXT } from "../tools/constants";
import { wrapInBackticks } from "../tools/string";

export let hydrateHtml = (where: 'inner'|'text') => (vnode: VNode, attrName: string, attrValue: string, tools: HydrationTools) => {

    // Wrap the attribute value in a function that returns the template name as a string.
    // Otherwise, evalEffect will evaluate the template name as a variable and most likely throw an error.
    if (attrValue in tools[TEMPLATE] || where == TEXT)
        attrValue = wrapInBackticks(attrValue);

    // Evaluate the attribute value as an effect
    tools[EVAL_EFFECT](vnode, attrName, attrValue, (node: HTMLElement) => async ([value]: any) => {

        // Hydrate HTML content
        await tools.$dom[INSERT](value(), where, node);
    });
}