import { evaluate } from "../tools/evaluation";

export let hydrateIgnore = async (vnode: VNode, _attrName: string, attrValue: string) => {
    vnode.skip = !attrValue || !!await evaluate(vnode, attrValue)[0]();
}