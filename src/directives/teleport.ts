import { saveToParent } from "../app";
import { has, logWarn } from "../tools";
import { AFTER, APPEND, B_, BEFORE, ELEMENT, EVAL_EFFECT, NODES, NOT_FOUND, PREPEND, TELEPORT, TEXT } from "../tools/constants";
import { insertNodes, query } from "../tools/dom";
import { expToFn } from "../tools/evaluation";
import { isArray, isNode } from "../tools/typeCheck";

export let hydrateTeleport = (bnode: BNode, attrName: string, attrValue: string) => {

    // Where to teleport the node in relation to the target element. Default is 'after'.

    let el = bnode.el;

    let target: any;
    let where: 'before' | 'after' | 'prepend' | 'append';
    try {
        // Try to query the target element using the attribute value.
        // This will determine if the attribute value is a selector.
        target = query(attrValue);

        // Wrap the attribute value in a function that returns the selector as a string.
        // Otherwise, evalEffect will evaluate the selector as a variable and most likely throw an error.
        if (isNode(target))
            attrValue = expToFn(attrValue, '', TEXT);
    }
    catch {}

    // Evaluate the attribute value as an effect
    bnode[EVAL_EFFECT](bnode, attrValue, (ctxFn) => {
        try {
            let value = ctxFn();
            // If the value is an array, the first item is the target element and the second is the position
            if (isArray(value)) {
                [target, where] = value;
            }
            // Otherwise, the value is the target element
            else target = query(value);
        }
        catch {}

        // Make sure `where` is only one of the following values: 'before', 'after', 'prepend', 'append'.
        // This is to prevent values that not related to positioning the node from being passed. E.g. 'replaceWith', 'replaceChildren', 'remove', etc.
        // Default is 'after'
        if (!has([BEFORE, AFTER, PREPEND, APPEND], where))
            where = AFTER;

        // Teleport the node to the target element
        // Note: the teleported node(s) may be the b-if placeholder (ph), or the b-template nodes (nodes), or the node itself.
        if (isNode(target)) {
            insertNodes(target, where, ...(bnode[NODES] || [el]));

            // Ensure the element will go through the cleanup process
            saveToParent(bnode, el);
        }

        // If the target is not found, log a warning
        else logWarn(TELEPORT, ELEMENT, NOT_FOUND, attrName + `="${attrValue}"`);
    });
}

export let teleportDirective: Directive = [B_+TELEPORT, hydrateTeleport];