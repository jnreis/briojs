import { VNode } from '..';

import { hydrationWrapper } from '.';
import { modelValue } from '../hydration';
import { inArray } from '../tools/array';
import { setAttr, delAttr } from '../tools/dom';
import { VALUE, CHECKED, STYLE, CLASS } from '../tools/constants';

export let hydrateBind = (vnode: VNode, attrName: string, attrValue: string) => {

    let [_, prop, ...modifiers] = attrName.split('-');

    let callback = (node: HTMLElement) => (value: any) => {
        // Apply modifiers
        value = modelValue(value, modifiers);

        // Set attribute
        if (inArray([VALUE,CHECKED,STYLE,CLASS], prop))
            (node as any)[prop == CLASS ? CLASS+'Name' : prop] = value;
        else if (value)
            setAttr(node, prop, value);
        else
            delAttr(node, prop);
    }

    hydrationWrapper(vnode, attrName, attrValue, callback);
}