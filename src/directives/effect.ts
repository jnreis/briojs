import { wrapper } from "../tools/hydration";

export let hydrateEffect = (vnode: VNode, attrName: string, attrValue: string) => {

    wrapper(vnode, attrName, attrValue, () => async ([call]) => {
        // Call the expression
        await call();
    });
}