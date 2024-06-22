import { wrapper } from '../hydration';
import { has, slice } from '../tools';
import { setAttr, delAttr, getAttr } from '../tools/dom';
import { VALUE, CHECKED, STYLE, CLASS, SELECT } from '../tools/constants';
import { isStringFunction } from '../tools/string';
import { makeFunction } from '../evaluation';

export let hydrateBind = (vnode: VNode, attrName: string, attrValue: string) => {

    let prop = slice(attrName, 2);

    // Check is attrValue is a function
    if (!isStringFunction(attrValue)) {
        attrValue = makeFunction(attrValue || 'true', '$initial');
    }

    // Get the attribute initial value
    let initialAttrValue = getAttr(vnode.$el, prop) || '';

    wrapper(vnode, attrName, attrValue, (node) => ([call], next) => {

        let value = call(initialAttrValue);

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