import { VNode } from "..";

import { hydrationWrapper } from ".";
import { afterAnimations } from "../api/animate";
import { appendChild, getParent, insertBefore, nextSibling } from "../tools/dom";

export let hydrateIf = (vnode: VNode, attrName: string, attrValue: string) => {

    let callback = (node: HTMLElement) => {
        // Store references to parent and siblings
        let parentEl = getParent(node);
        let nextEl = nextSibling(node);

        let animationTimeout: any;

        // Return the watch function
        return (value: any) => {
            // Clear the timeout
            clearTimeout(animationTimeout);

            if (value) {
                // Add the node before the next sibling
                if (nextEl) insertBefore(parentEl as HTMLElement, node, nextEl);
                // Add the node as the last child
                else appendChild(parentEl as HTMLElement, node);
            }
            // Wait until the next frame to get the animation time. Otherwise, the time might be 0.
            else setTimeout(() => {
                // Remove the node after the animations are finished
                animationTimeout = afterAnimations(node, () => node.remove());
            }, 0)
        }
    }

    hydrationWrapper(vnode, attrName, attrValue, callback);
}