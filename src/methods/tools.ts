import { getType } from "../tools/typeCheck";

export let $uid = (vnode: VNode) => 
    (uidName: string) => `${uidName}-${vnode.uid[uidName]}`;

export let $type = () => getType;