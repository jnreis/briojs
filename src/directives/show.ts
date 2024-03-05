import { VNode } from '..';

import { hydrationWrapper } from '.';
import { getParent } from '../tools/dom';
import { transitionControls } from './transition';

export let hydrateShow = (vnode: VNode, attrName: string, attrValue: string) => {

    let transition = transitionControls(vnode);

    let callback = (node: HTMLElement) => (value: any) => {
        if (!getParent(node)) return;

        if (value) {
            node.style.display = '';
            transition.in();
        }
        else transition.out(() => node.style.display = 'none');
    }

    hydrationWrapper(vnode, attrName, attrValue, callback);
}