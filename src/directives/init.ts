import { VNode } from "..";

import { saveAttr } from "../hydration";
import { evaluate } from "../evaluation";
import { isFunction } from "../tools/typeCheck";

export let hydrateInit = (vnode: VNode, attrName: string, attrValue: string) => {

    // Evaluate the expression and run it only once
    let value = evaluate(vnode, attrValue);

    if (isFunction(value)) value();

    // Save to the vnode
    saveAttr(vnode, attrName, attrValue);
}