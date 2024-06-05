import { wrapper } from '../hydration';
import { getParent } from '../tools/dom';
import { DISPLAY, STYLE } from '../tools/constants';
import { wait } from '../tools';
import { isFunction } from '../tools/typeCheck';

export let hydrateShow = (vnode: VNode, attrName: string, attrValue: string) => {

    wrapper(vnode, attrName, attrValue, (node) => (ctx, next) => {
        if (!getParent(node)) return;

        // Wait for the next tick.
        // * This is necessary for some directives to work properly (e.g. `on-click-outside`)
        wait(() => {
            let value = isFunction(ctx) ? ctx() : ctx;

            // Show or hide the element
            node[STYLE][DISPLAY] = value ? '' : 'none';

            // Next function
            next();
        });
    });
}