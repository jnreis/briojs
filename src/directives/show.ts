import { hydrationWrapper } from '.';
import { afterAnimations } from '../api/animate';
import { getParent } from '../tools/dom';
import { debounce } from '../tools';
import { DISPLAY, STYLE } from '../tools/constants';

export let hydrateShow = (vnode: VNode, attrName: string, attrValue: string) => {

    // The current value of the directive
    let currentValue: any;

    let show = debounce(($el: HTMLElement) => $el[STYLE][DISPLAY] = '', 0)

    let hide = afterAnimations($el => {
        // If the current value is still false after the animations, hide the node
        if (!currentValue)
            $el[STYLE][DISPLAY] = 'none';
    });

    let callback = (node: HTMLElement) => (value: any) => {
        if (!getParent(node)) return;

        // Update the current value
        currentValue = value;

        // Show
        if (value) show(node);
        // Hide
        else hide(node);
    }

    hydrationWrapper(vnode, attrName, attrValue, callback);
}