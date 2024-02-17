import { RawElement } from "../index.d";

import { evaluate } from "../evaluate";
import { delAttr, isFunction } from "../../tools";
import { saveProp } from "..";

export const hydrateInit = (rawNode: RawElement, attrName: string, attrValue: string) => {

    const {$el} = rawNode;

    const value = evaluate(rawNode, attrValue);

    if (isFunction(value)) value();

    // Save to the rawNode
    saveProp(rawNode, attrName, attrValue);

    // Remove the attribute from the node
    delAttr($el, attrName);
}