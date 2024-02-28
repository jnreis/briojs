import { VNode } from "..";

import { saveAttr } from "../hydrate";
import { q, appendChild } from "../tools/dom";

export let hydrateTeleport = (vnode: VNode, attrName: string, attrValue: string) => {

    // Where to teleport the node to
    let target = q(attrValue)[0];

    if (!target) {
        // ! DEVELOPMENT ONLY
        console.warn(`Teleport target not found: ${attrValue}`);
        return;
    }

    // Teleport the node
    appendChild(target, vnode.$el);

    // Save to the vnode
    saveAttr(vnode, attrName, attrValue);
}