import { logger } from "../tools";
import { ELEMENT, NOT_FOUND, TARGET, TELEPORT } from "../tools/constants";
import { q, appendChildren } from "../tools/dom";
import { callHook, setHook } from "../tools/hook";

export let hydrateTeleport = (vnode: VNode, attrName: string, attrValue: string) => {

    // Where to teleport the node to
    let target = q(attrValue)[0];

    let $el = vnode.$el;

    // If the target is not found, log a warning
    if (!target)
        return logger(`The ${TELEPORT} ${TARGET} ${ELEMENT} was ` + NOT_FOUND, `${attrName}="${attrValue}"`, 'warn');

    // Teleport the node
    setHook($el, attrName, (target: Element) => {
        // Append the node to the target
        appendChildren(target, $el);
    });

    callHook($el, attrName, target);
}