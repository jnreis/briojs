import { wrapper } from '../hydration';
import { has, slice } from '../tools';
import { setAttr, delAttr } from '../tools/dom';
import { VALUE, CHECKED, STYLE, CLASS, SELECT } from '../tools/constants';
import { isFunction } from '../tools/typeCheck';

export let hydrateBind = (vnode: VNode, attrName: string, attrValue: string) => {

    let prop = slice(attrName, 2);

    wrapper(vnode, attrName, attrValue || 'true', (node) => (ctx, next) => {

        let value = isFunction(ctx) ? ctx() : ctx;

        // Set property directly
        if (has([VALUE, CHECKED, SELECT+'ed', STYLE, CLASS, 'src'], prop))
            (node as any)[prop == CLASS ? CLASS+'Name' : prop] = value;

        // Set attribute
        else if (value) setAttr(node, prop, value === true ? '' : value);

        // Remove attribute
        else delAttr(node, prop);

        // Next function
        next();
    });
}