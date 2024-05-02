import { wrapper } from "../hydration";
import { afterAnimations } from "../api/animate";
import { appendChild, getParent, insertBefore, nextSibling } from "../tools/dom";
import { debounce } from "../tools";

export let hydrateIf = (vnode: VNode, attrName: string, attrValue: string) => {

    // The current value of the directive
    let currentValue: any;

    let add = debounce((parentEl: HTMLElement, node: HTMLElement, nextEl: HTMLElement) => {
        // Add the node before the next sibling
        if (nextEl) insertBefore(parentEl as HTMLElement, node, nextEl);
        // Add the node as the last child
        else appendChild(parentEl as HTMLElement, node);
    }, 0);

    let remove = afterAnimations($el => {
        // If the current value is still false after the animations, hide the node
        if (!currentValue)
            $el.remove();
    });

    let callback = (node: HTMLElement) => {
        // Store references to parent and siblings
        let parentEl = getParent(node);
        let nextEl = nextSibling(node);

        // Return the watch function
        return (value: any) => {

            // Update the current value
            currentValue = value;

            // Add
            if (value) add(parentEl, node, nextEl);
            // Remove
            else remove(node);
        }
    }

    wrapper(vnode, attrName, attrValue, callback);
}