import { B_, EVAL_EFFECT, HTML, INNER, INSERT, TEMPLATE, TEXT } from "../tools/constants";
import { wrapInBackticks } from "../tools/string";

export let hydrateHtml = (where: 'inner'|'text') => (vnode: VNode, attrName: string, attrValue: string) => {

    let templates = vnode[TEMPLATE];

    // Wrap the attribute value in a function that returns the template name as a string.
    // Otherwise, evalEffect will evaluate the template name as a variable and most likely throw an error.
    if (attrValue in templates)
        attrValue = wrapInBackticks(templates[attrValue] || attrValue);

    if (attrValue) {
        // Evaluate the attribute value as an effect
        vnode[EVAL_EFFECT](vnode, attrName, attrValue, (node: HTMLElement) => async (value) => {

            // Hydrate HTML content
            await vnode[INSERT](value(), where, node);
        });
    }
}

export let htmlDirective: Directive = [B_+HTML, hydrateHtml(INNER)];
export let textDirective: Directive = [B_+TEXT, hydrateHtml(TEXT)];