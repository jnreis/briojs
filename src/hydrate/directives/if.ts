import { RawElement } from "../index.d";

import { hydrationWrapper } from ".";
import { appendChild, getParent, insertBefore, nextSibling } from "../../tools";

export const hydrateIf = (rawNode: RawElement, attrName: string, attrValue: string) => {

    const callback = (node: HTMLElement) => {
        // Store references to parent and siblings
        const parentEl = getParent(node);
        const nextEl = nextSibling(node);

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

    hydrationWrapper(rawNode, attrName, attrValue, callback);
}