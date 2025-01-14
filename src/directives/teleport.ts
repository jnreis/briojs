import { has, logWarn } from "../tools";
import { AFTER, APPEND, BEFORE, ELEMENT, EVAL_EFFECT, NOT_FOUND, PREPEND, TELEPORT } from "../tools/constants";
import { insertNodes, query } from "../tools/dom";
import { makeFunction } from "../tools/evaluation";
import { stringify } from "../tools/string";
import { isArray, isNode } from "../tools/typeCheck";

export let hydrateTeleport = (vnode: VNode, attrName: string, attrValue: string, tools: HydrationTools) => {

    // Where to teleport the node in relation to the target element. Default is 'after'.
    
    let target: any;
    let where: 'before' | 'after' | 'prepend' | 'append';
    try {
        // Try to query the target element using the attribute value.
        // This will determine if the attribute value is a selector.
        target = query(attrValue);

        // Wrap the attribute value in a function that returns the selector as a string.
        // Otherwise, evalEffect will evaluate the selector as a variable and most likely throw an error.
        if (isNode(target))
            attrValue = makeFunction(stringify(attrValue));
    }
    catch {}

    // Evaluate the attribute value as an effect
    tools[EVAL_EFFECT](vnode, attrName, attrValue, (node: HTMLElement) => ([value]: [FunctionType]) => {
        try {
            let v = value();
            // If the value is an array, the first item is the target element and the second is the position
            if (isArray(v)) {
                [target, where] = v;
            }
            // Otherwise, the value is the target element
            else target = query(v);
        }
        catch {}

        // Make sure `where` is only one of the following values: 'before', 'after', 'prepend', 'append'.
        // This is to prevent values that not related to positioning the node from being passed. E.g. 'replaceWith', 'replaceChildren', 'remove', etc.
        // Default is 'after'
        if (!has([BEFORE, AFTER, PREPEND, APPEND], where))
            where = AFTER;

        // Teleport the node to the target element
        if (isNode(target)) insertNodes(target, where, node);

        // If the target is not found, log a warning
        else logWarn(TELEPORT, ELEMENT, NOT_FOUND, attrName + `="${attrValue}"`);
    });
}