import { wrapper } from "../hydration";
import { wait } from "../tools";
import { appendChildren, getParent, insertBefore, nextSibling } from "../tools/dom";
import { isFunction } from "../tools/typeCheck";

export let hydrateIf = (vnode: VNode, attrName: string, attrValue: string) => {

    wrapper(vnode, attrName, attrValue, (node) => {
        // Store references to parent and siblings
        let parentEl = getParent(node) as HTMLElement;
        let nextEl = nextSibling(node);

        // Return the watch function
        return (ctx, next) => {
            // Wait for the next tick.
            // * This is necessary for some directives to work properly (e.g. `on-click-outside`)
            wait(() => {
                let value = isFunction(ctx) ? ctx() : ctx;

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