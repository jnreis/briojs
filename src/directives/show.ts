import { evalEffect } from '../app';
import { B_SHOW, DISPLAY, OPTIONS, STYLE } from '../tools/constants';
import { getParent, getStyle, nextFrame } from '../tools/dom';
import { B_TRANSITION_KEY } from './transition';

/**
 * b-show is the same as b-if but the element is not removed from the DOM
 * 
 * Must reference a prop, method, or be an expression that returns a value that can be converted to a boolean
 */
export let hydrateShow = (bnode: BNode, attrName: string, attrValue: string) => {

    let el = bnode.el;

    // Get the initial display value
    let initialDisplay = getStyle(bnode.el)[DISPLAY];

    // If the initial display value is 'none', set it to 'block'
    // * This is necessary because the 'none' value is used to hide the element
    if (initialDisplay == 'none') initialDisplay = 'block';

    // Evaluate the attribute value as an effect
    evalEffect(bnode, attrValue, (ctxFn) => {
        // Get the value
        let value = ctxFn();

        // Check if the parent node exists
        if (getParent(el)) {
            // Wait for the next tick.
            // * This is necessary for some directives to work properly (e.g. `on-click-outside`)
            nextFrame(() => {
                let transition = bnode[OPTIONS][B_TRANSITION_KEY];
                // Show the element
                if (value) {
                    el[STYLE][DISPLAY] = initialDisplay;
                    if (transition) transition(true);
                }
                // Hide the element after the transition
                else if (transition) {
                    transition(false, () => hideElement(el));
                }
                // Just hide the element
                else hideElement(el);
            });
        }
    });
}

export let showDirective: Directive = [B_SHOW, hydrateShow];


let hideElement = (el: HTMLElement) => {
    el[STYLE][DISPLAY] = 'none';
}