import { evalEffect, getInsertedNodes, saveToParent } from "../app";
import { has, logWarn } from "../tools";
import { AFTER, APPEND, B_, BEFORE, ELEMENT, NOT_FOUND, PREPEND, TELEPORT } from "../tools/constants";
import { insertNodes } from "../tools/dom";
import { wrapInBackticks } from "../tools/string";
import { isArray, isNode, isString } from "../tools/typeCheck";

let hydrateTeleport = (bnode: BNode, attrName: string, attrValue: string) => {

    let target: any = attrValue;

    // Where to teleport the node in relation to the target element. Default is 'after'.
    let where: 'before' | 'after' | 'prepend' | 'append';

    let $ref = bnode.ctx.$ref;

    // Check if the target is a $ref
    if (target in $ref)
        target = wrapInBackticks(target);

    // Evaluate the attribute value as an effect
    evalEffect(bnode, target, (ctxFn) => {

        target = ctxFn();

        // If the value is an array, the first item is the target and the second is the position
        if (isArray(target))
            [target, where] = target;

        // Get the target element from $ref, if applicable
        if (isString(target) && target in $ref)
            target = $ref[target];

        // Make sure `where` is only one of the following values: 'before', 'after', 'prepend', 'append'.
        // This is to prevent values that not related to positioning the node from being passed. E.g. 'replaceWith', 'replaceChildren', 'remove', etc.
        // Default is 'after'
        if (!has([BEFORE, AFTER, PREPEND, APPEND], where))
            where = AFTER;

        // Teleport the node to the target element
        // Note: the teleported node(s) may include placeholder, or the b-template nodes, or the node itself.
        if (isNode(target)) {
            insertNodes(target, where, ...getInsertedNodes(bnode));

            // Ensure the element will go through the cleanup process
            saveToParent(bnode, bnode.el);
        }

        // If the target is not found, log a warning
        else logWarn(TELEPORT, ELEMENT, NOT_FOUND, attrName + `="${attrValue}"`);
    });
}

export let teleportDirective: Directive = [B_+TELEPORT, hydrateTeleport];