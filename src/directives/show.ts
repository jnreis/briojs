import { wait } from '../tools';
import { B_SHOW, DISPLAY, EVAL_EFFECT, STYLE } from '../tools/constants';
import { getParent, getStyle } from '../tools/dom';

/**
 * b-show is the same as b-if but the element is not removed from the DOM
 * 
 * Must reference a prop, method, or be an expression that returns a value that can be converted to a boolean
 */
export let hydrateShow = (vnode: VNode, attrName: string, attrValue: string) => {

    // Get the initial display value
    let initialDisplay = getStyle(vnode.el)[DISPLAY];

    // If the initial display value is 'none', set it to 'block'
    // * This is necessary because the 'none' value is used to hide the element
    if (initialDisplay == 'none') initialDisplay = 'block';

    // Evaluate the attribute value as an effect
    vnode[EVAL_EFFECT](vnode, attrName, attrValue, (node: HTMLElement) => (call) => {
        // Get the value
        let value = call();

        // Check if the parent node exists
        if (getParent(node)) {
            // Wait for the next tick.
            // * This is necessary for some directives to work properly (e.g. `on-click-outside`)
            wait(() => {
                // Show or hide the element
                node[STYLE][DISPLAY] = value ? initialDisplay : 'none';
            });
        }
    });
}

export let showDirective: Directive = [B_SHOW, hydrateShow];