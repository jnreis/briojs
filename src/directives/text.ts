import { replaceMustache, wrapper } from "../tools/hydration";
import { TEXT_CONTENT } from "../tools/constants";

export let hydrateText = (vnode: VNode, attrName: string, attrValue: string) => {

    wrapper(vnode, attrName, replaceMustache(attrValue), (node) => ([call], next) => {

        // Set the text content
        node[TEXT_CONTENT] = call();

        // Next function
        next();
    });
}