import { lifecycle } from "../hydration";
import { logger } from "../tools";
import { NOT_FOUND, TELEPORT } from "../tools/constants";
import { q, appendChild } from "../tools/dom";
import { capitalize } from "../tools/string";

export let hydrateTeleport = (vnode: VNode, attrName: string, attrValue: string) => {

    // Where to teleport the node to
    let target = q(attrValue)[0];

    // If the target is not found, log a warning
    if (!target)
        return logger(capitalize(TELEPORT) + ` target ${NOT_FOUND}`, `${attrName}="${attrValue}"`, 'warn');

    // Teleport the node
    lifecycle(vnode, attrName, (target: Element, next: FunctionType) => {
        // Append the node to the target
        appendChild(target, vnode.$el);

        // Next lifecycle function
        next();
    })(target);
}