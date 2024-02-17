import { RawElement } from '../index.d';

import { hydrationWrapper } from '.';
import { getParent } from '../../tools';

export const hydrateShow = (rawNode: RawElement, attrName: string, attrValue: string) => {

    const callback = (node: HTMLElement) => (value: any) => {
        if (!getParent(node)) return;
        node.style.display = value ? '' : 'none';
    }

    hydrationWrapper(rawNode, attrName, attrValue, callback);
}