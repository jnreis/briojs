import { wrapper } from "../hydration";

export let hydrateHtml = (vnode: VNode, attrName: string, attrValue: string) => {

    let callback = (node: HTMLElement) => (value: any) => node.innerHTML = value;

    wrapper(vnode, attrName, attrValue, callback);
}