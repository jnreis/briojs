import { RawElement } from "../index.d";

import { appendChild, delAttr, q } from "../../tools";
import { saveProp } from "..";

export const hydrateTeleport = (rawNode: RawElement, attrName: string, attrValue: string) => {

    const {$el} = rawNode;

    // Where to teleport the node to
    const target = q(attrValue)[0];

    if (!target) {
        console.warn(`Teleport target not found: ${attrValue}`);
        return;
    }

    // Teleport the node
    appendChild(target, $el);

    // Save to the rawNode
    saveProp(rawNode, attrName, attrValue);

    // Remove the attribute from the node
    delAttr($el, attrName);
}