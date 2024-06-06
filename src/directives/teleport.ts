import { interceptor } from "../hydration";
import { logger } from "../tools";
import { NOT_FOUND, TELEPORT } from "../tools/constants";
import { q, appendChild } from "../tools/dom";

export let hydrateTeleport = (vnode: VNode, attrName: string, attrValue: string) => {

    // Where to teleport the node to
    let target = q(attrValue)[0];

    // If the target is not found, log a warning
    if (!target)
        return logger(TELEPORT + ' target ' + NOT_FOUND, `${attrName}="${attrValue}"`, 'warn');

    // Teleport the node
    interceptor(vnode, attrName, (target: Element, next) => {
        // Append the node to the target
        appendChild(target, vnode.$el);

        // Next function
        next();
    })(target);
}