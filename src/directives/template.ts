import { HOOKS, INNER, INSERT, REPLACE_WITH, TEMPLATES } from "../tools/constants";
import { childNodes, insertNodes } from "../tools/dom";
import { evaluate } from "../tools/evaluation";

export let hydrateTemplate = (vnode: VNode, attrName: string, attrValue: string, tools: HydrationTools) => {

    let el = vnode.el;

    // Evaluate the attribute value, if it does not match a saved template
    let template = tools[TEMPLATES][attrValue] || evaluate(vnode, attrValue)[0]();

    let [setHook, playHook] = tools[HOOKS];

    // Set the hook
    setHook(el, attrName, async () => {

        // Hydrate HTML content
        await tools.$dom[INSERT](template, INNER, el);

        // Replace the node with its children, if outer
        insertNodes(el, REPLACE_WITH, ...childNodes(el));
    });

    // Play the hook
    playHook(el, attrName);
}