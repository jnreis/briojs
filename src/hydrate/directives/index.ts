import { RawElement } from "../index.d";

import { getPropOrExp, saveProp, watch } from "..";
import { delAttr } from "../../tools";

export const hydrationWrapper = (
    rawNode: RawElement,
    attrName: string,
    attrValue: string,
    callback: (node: HTMLElement) => (...args: any) => any
) => {

    const {id, $el} = rawNode;

    // The callback returns the function to watch (watchFn).
    // The `watchFn` receives the prop or expression.
    // If the prop or expression contains observed value(s), the `watchFn` will be called when the observed value(s) change.
    const watchFn = callback($el);

    // Watch the prop or expression
    watch(id, attrName, () => watchFn(getPropOrExp(rawNode, attrValue)));

    // Save to the rawNode
    saveProp(
        rawNode, 
        attrName, 
        attrValue
    );

    // Remove the attribute from the node
    delAttr($el, attrName);
}


export * from './bind';
export * from './each';
export * from './effect';
export * from './html';
export * from './if';
export * from './init';
export * from './model';
export * from './on';
export * from './props';
export * from './refs';
export * from './show';
export * from './teleport';
export * from './text';
export * from './uid';