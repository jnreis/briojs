import { VNode } from "..";

import { hydrationWrapper } from ".";
import { appendChild, getParent, insertBefore, nextSibling } from "../tools/dom";

export let hydrateIf = (vnode: VNode, attrName: string, attrValue: string) => {

    let callback = (node: HTMLElement) => {
        // Store references to parent and siblings
        let parentEl = getParent(node);
        let nextEl = nextSibling(node);

        // Return the watch function
        return (value: any) => {
            if (value) {
                // Add the node before the next sibling
                if (nextEl) insertBefore(parentEl as HTMLElement, node, nextEl);
                // Add the node as the last child
                else appendChild(parentEl as HTMLElement, node);
            }
            else node.remove();
        }
    }

    hydrationWrapper(vnode, attrName, attrValue, callback);
}