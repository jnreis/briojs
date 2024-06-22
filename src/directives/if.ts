import { wrapper } from "../hydration";
import { wait } from "../tools";
import { appendChildren, getParent, insertBefore, nextSibling } from "../tools/dom";

export let hydrateIf = (vnode: VNode, attrName: string, attrValue: string) => {

    wrapper(vnode, attrName, attrValue, (node) => {
        // Store references to parent and siblings
        let parentEl = getParent(node) as HTMLElement;
        let nextEl = nextSibling(node);

        // Return the watch function
        return ([call], next) => {
            // Get the value
            let value = call();

            // Wait for the next tick.
            // * This is necessary for some directives to work properly (e.g. `on-click-outside`)
            wait(() => {
                // Add
                if (value) {
                    // Add the node before the next sibling
                    if (nextEl) insertBefore(parentEl, node, nextEl);
                    // Add the node as the last child
                    else appendChildren(parentEl, node);
                }
                // Remove
                else node.remove();

                // Next function
                next();
            });
        }
    });
}