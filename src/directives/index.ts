import { VNode } from "..";
import { getRefOrExp } from "../evaluate";

import { saveAttr, saveEffect } from "../hydrate";

export let hydrationWrapper = (
    vnode: VNode,
    attrName: string,
    attrValue: string,
    callback: (node: HTMLElement) => (...args: any) => any
) => {

    // The callback returns the function to watch (watchFn).
    // The `watchFn` receives the prop or expression.
    // If the prop or expression contains observed value(s), the `watchFn` will be called when the observed value(s) change.
    let watchFn = callback(vnode.$el);

    // Watch the prop or expression
    saveEffect(vnode, attrName, () => watchFn(getRefOrExp(vnode, attrValue)));

    // Save attribute
    saveAttr(vnode, attrName, attrValue);
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