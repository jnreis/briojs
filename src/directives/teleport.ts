import { VNode } from "..";

import { saveAttr } from "../hydration";
import { $EL, TELEPORT } from "../tools/constants";
import { q, appendChild } from "../tools/dom";
import { capitalize } from "../tools/string";

export let hydrateTeleport = (vnode: VNode, attrName: string, attrValue: string) => {

    // Where to teleport the node to
    let target = q(attrValue)[0];

    if (!target) {
        // ! DEVELOPMENT ONLY
        console.warn(`${capitalize(TELEPORT)} target not found: ${attrValue}`);
        return;
    }

    // Teleport the node
    appendChild(target, vnode[$EL]);

    // Save to the vnode
    saveAttr(vnode, attrName, attrValue);
}