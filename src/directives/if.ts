import { wrapper } from "../tools/hydration";
import { wait } from "../tools";
import { getParent, insertNode, nextSibling } from "../tools/dom";

export let hydrateIf = (vnode: VNode, attrName: string, attrValue: string) => {

    wrapper(vnode, attrName, attrValue, (node) => {
        // Store references to parent and siblings
        let parentEl = getParent(node) as HTMLElement;
        let nextEl = nextSibling(node);

        // Return the watch function
        return ([call]) => {
            // Get the value
            let value = call();

            // Wait for the next tick.
            // * This is necessary for some directives to work properly (e.g. `on-click-outside`)
            wait(() => {
                // Add
                if (value) {
                    insertNode(node, parentEl, nextEl);
                }
                // Remove
                else node.remove();
            });
        }
    });
}