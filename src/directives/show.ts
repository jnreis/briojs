import { wrapper } from '../tools/hydration';
import { getParent } from '../tools/dom';
import { DISPLAY, STYLE } from '../tools/constants';
import { wait } from '../tools';

export let hydrateShow = (vnode: VNode, attrName: string, attrValue: string) => {

    wrapper(vnode, attrName, attrValue, (node) => ([call], next) => {
        // Get the value
        let value = call();

        // Check if the parent node exists
        if (!getParent(node)) return;

        // Wait for the next tick.
        // * This is necessary for some directives to work properly (e.g. `on-click-outside`)
        wait(() => {
            // Show or hide the element
            node[STYLE][DISPLAY] = value ? '' : 'none';

            // Next function
            next();
        });
    });
}