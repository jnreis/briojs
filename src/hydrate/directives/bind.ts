import { RawElement } from '../index.d';

import { modelValue } from '..';
import { setAttr, delAttr, inArray, VALUE, CHECKED, STYLE, CLASS } from '../../tools';
import { hydrationWrapper } from '.';

export const hydrateBind = (rawNode: RawElement, attrName: string, attrValue: string) => {

    const [_, prop, ...modifiers] = attrName.split('-');

    const callback = (node: HTMLElement) => (value: any) => {
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

    hydrationWrapper(rawNode, attrName, attrValue, callback);
}