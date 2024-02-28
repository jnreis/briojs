import { VNode } from '..';

import { hydrationWrapper } from '.';
import { getParent } from '../tools/dom';

export let hydrateShow = (vnode: VNode, attrName: string, attrValue: string) => {

    let callback = (node: HTMLElement) => (value: any) => {
        if (!getParent(node)) return;
        node.style.display = value ? '' : 'none';
    }

    hydrationWrapper(vnode, attrName, attrValue, callback);
}