export let $uid = (vnode: VNode) => 
    (uidName: string) => `${uidName}-${vnode.uid[uidName]}`;