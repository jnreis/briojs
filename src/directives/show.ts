import { VNode } from '..';

import { hydrationWrapper } from '.';
import { afterAnimations } from '../api/animate';
import { getParent } from '../tools/dom';

export let hydrateShow = (vnode: VNode, attrName: string, attrValue: string) => {

    let animationTimeout: any;

    let callback = (node: HTMLElement) => (value: any) => {
        if (!getParent(node)) return;

        // Clear the timeout
        clearTimeout(animationTimeout);

        if (value) {
            if (node.style.display == 'none')
                node.style.display = '';
        }
        // Wait until the next frame to get the animation time. Otherwise, the time might be 0.
        else setTimeout(() => {
            // Remove the node after the animations are finished
            animationTimeout = afterAnimations(node, () => node.style.display = 'none');
        }, 0)
    }

    hydrationWrapper(vnode, attrName, attrValue, callback);
}