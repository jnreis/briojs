import { VNode } from "..";

import { hydrationWrapper } from ".";

export let hydrateText = (vnode: VNode, attrName: string, attrValue: string) => {

    let callback = (node: HTMLElement) => (value: any) => node.textContent = value;

    hydrationWrapper(vnode, attrName, attrValue, callback);
}