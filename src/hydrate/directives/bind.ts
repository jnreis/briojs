import { RawElement } from '../index.d';

import { watch, watchProp, rawNodeProp, modelValue } from '..';
import { setAttr, delAttr, inArray } from '../../tools';

export function hydrateBind(rawNode: RawElement, attrName: string, attrValue: string) {

    const [_, prop, ...modifiers] = attrName.split('-');

    const el = rawNode.node as any;

    const watchFn = watchProp(rawNode, attrValue, (value: any) => {
        // Apply modifiers
        value = modelValue(value, modifiers);

        // Set attribute
        if (inArray(['value','checked','style','class'], prop)) {
            el[prop == 'class' ? 'className' : prop] = value;
        }
        else {
            if (value) setAttr(el, prop, value);
            else delAttr(el, prop);
        }
    })

    // Add the effect to the effect object
    watch(rawNode.id, prop, watchFn);

    // Remove the attribute from the node
    delAttr(rawNode.node, attrName);

    // Save to the rawNode
    rawNodeProp(rawNode, 'bind', { prop, modifiers });
}