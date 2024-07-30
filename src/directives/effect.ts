import { wrapper } from "../tools/hydration";

export let hydrateEffect = (vnode: VNode, attrName: string, attrValue: string) => {

    wrapper(vnode, attrName, attrValue, () => ([call], next) => {

        // Call the expression
        call();

        // Next function
        next();
    });
}