import { saveAttr } from "../hydration";
import { $EL, TELEPORT } from "../tools/constants";
import { q, appendChild } from "../tools/dom";
import { capitalize } from "../tools/string";

export let hydrateTeleport = (vnode: VNode, attrName: string, attrValue: string) => {

    // Where to teleport the node to
    let target = q(attrValue)[0];

    // ! DEVELOPMENT ONLY
    if (!target)
        return console.warn(`${capitalize(TELEPORT)} target not found: ${attrValue}`);

    // Teleport the node
    appendChild(target, vnode[$EL]);

    // Save to the vnode
    saveAttr(vnode, attrName, attrValue);
}