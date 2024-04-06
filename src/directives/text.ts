import { hydrationWrapper } from ".";
import { TEXT_CONTENT } from "../tools/constants";

export let hydrateText = (vnode: VNode, attrName: string, attrValue: string) => {

    let callback = (node: HTMLElement) => (value: any) => node[TEXT_CONTENT] = value;

    hydrationWrapper(vnode, attrName, attrValue, callback);
}