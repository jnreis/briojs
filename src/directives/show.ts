import { wrapper } from '../hydration';
import { getParent } from '../tools/dom';
import { DISPLAY, STYLE } from '../tools/constants';
import { wait } from '../tools';
import { isFunction } from '../tools/typeCheck';

export let hydrateShow = (vnode: VNode, attrName: string, attrValue: string) => {

    let callback = (node: HTMLElement) => (ctx: any, next: FunctionType) => {
        if (!getParent(node)) return;

        // Wait for the next tick.
        // * This is necessary for some directives to work properly (e.g. `on-click-outside`)
        wait(() => {
            let value = isFunction(ctx) ? ctx() : ctx;

            // Show or hide the element
            node[STYLE][DISPLAY] = value ? '' : 'none';

            // Next lifecycle function
            next();
        });
    }

    wrapper(vnode, attrName, attrValue, callback);
}