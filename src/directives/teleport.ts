import { interceptor } from "../tools/hydration";
import { logger } from "../tools";
import { ELEMENT, NOT_FOUND, TARGET, TELEPORT } from "../tools/constants";
import { q, appendChildren } from "../tools/dom";

export let hydrateTeleport = (vnode: VNode, attrName: string, attrValue: string) => {

    // Where to teleport the node to
    let target = q(attrValue)[0];

    // If the target is not found, log a warning
    if (!target)
        return logger(`The ${TELEPORT} ${TARGET} ${ELEMENT} was ` + NOT_FOUND, `${attrName}="${attrValue}"`, 'warn');

    // Teleport the node
    interceptor(vnode, attrName, (target: Element, next) => {
        // Append the node to the target
        appendChildren(target, vnode.$el);

        // Next function
        next();
    })(target);
}