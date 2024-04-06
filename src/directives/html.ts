import { hydrationWrapper } from ".";

export let hydrateHtml = (vnode: VNode, attrName: string, attrValue: string) => {

    let callback = (node: HTMLElement) => (value: any) => node.innerHTML = value;

    hydrationWrapper(vnode, attrName, attrValue, callback);
}