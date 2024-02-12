import { RawElement } from "../index.d";

import { watch, watchProp } from "..";
import { delAttr } from "../../tools";

export function hydrateIf(rawNode: RawElement, attrName: string, attrValue: string) {

    const el = rawNode.node as any;

    // Store references to parent and siblings
    const parentEl = el.parentElement;
    const nextEl = el.nextSibling;

    const watchFn = watchProp(rawNode, attrValue, (value: any) => {
        if (value) {
            // Add the node before the next sibling
            if (nextEl) parentEl?.insertBefore(el, nextEl);
            // Add the node as the last child
            else parentEl?.appendChild(el);
        }
        else el.remove();
    });

    // Add the effect to the effect object
    watch(rawNode.id, attrName, watchFn);

    // Save to the rawNode
    rawNode.if = attrValue;

    // Remove the attribute from the node
    delAttr(rawNode.node, attrName);
}