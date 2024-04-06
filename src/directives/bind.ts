import { hydrationWrapper } from '.';
import { has, slice } from '../tools';
import { setAttr, delAttr } from '../tools/dom';
import { VALUE, CHECKED, STYLE, CLASS } from '../tools/constants';

export let hydrateBind = (vnode: VNode, attrName: string, attrValue: string) => {

    let prop = slice(attrName, 2);

    let callback = (node: HTMLElement) => (value: any) => {
        // Set attribute
        if (has([VALUE,CHECKED,STYLE,CLASS], prop))
            (node as any)[prop == CLASS ? CLASS+'Name' : prop] = value;
        else if (value)
            setAttr(node, prop, value === true ? '' : value);
        else
            delAttr(node, prop);
    }

    hydrationWrapper(vnode, attrName, attrValue || 'true', callback);
}