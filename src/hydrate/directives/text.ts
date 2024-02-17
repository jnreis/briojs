import { RawElement } from "../index.d";

import { hydrationWrapper } from ".";

export const hydrateText = (rawNode: RawElement, attrName: string, attrValue: string) => {

    const callback = (node: HTMLElement) => (value: any) => node.textContent = value;

    hydrationWrapper(rawNode, attrName, attrValue, callback);
}