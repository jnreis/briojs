import { B_, INNER, INSERT, REPLACE_WITH, TEMPLATE } from "../tools/constants";
import { childNodes, insertNodes } from "../tools/dom";

export let hydrateTemplate = (vnode: VNode, attrName: string, attrValue: string) => {

    let el = vnode.el;

    // Evaluate the attribute value, if it does not match a saved template
    let template = vnode[TEMPLATE][attrValue] || vnode.exec(vnode, attrValue)();

    let [setHook, playHook] = vnode.hook;

    // Set the hook
    setHook(el, attrName, async () => {

        // Hydrate HTML content
        await vnode[INSERT](template, INNER, el);

        // Replace the node with its children, if outer
        insertNodes(el, REPLACE_WITH, ...childNodes(el));
    });

    // Play the hook
    playHook(el, attrName);
}

export let templateDirective: Directive = [B_+TEMPLATE, hydrateTemplate];