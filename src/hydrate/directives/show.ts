import { RawElement } from '../index.d';

import { watch, watchProp } from '..';
import { delAttr } from '../../tools';

export function hydrateShow(rawNode: RawElement, attrName: string, attrValue: string) {

    const el = rawNode.node as any;

    const watchFn = watchProp(rawNode, attrValue, (value: any) => {
        if (!el.parentElement) return;
        if (value) el.style.display = '';
        else el.style.display = 'none';
    });

    // Add the effect to the effect object
    watch(rawNode.id, attrName, watchFn);

    // Save to the rawNode
    rawNode.if = attrValue;

    // Remove the attribute from the node
    delAttr(rawNode.node, attrName);
}