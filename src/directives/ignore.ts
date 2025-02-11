import { SKIP } from "../tools/constants";

export let hydrateIgnore = async (vnode: VNode, _attrName: string, attrValue: string) => {
    vnode[SKIP] = !attrValue || !!await vnode.exec(vnode, attrValue)();
}

export let ignoreDirective: Directive = ['b-ignore', hydrateIgnore];