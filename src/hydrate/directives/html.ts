import { RawElement } from "../index.d";

import { hydrationWrapper } from ".";

export const hydrateHtml = (rawNode: RawElement, attrName: string, attrValue: string) => {

    const callback = (node: HTMLElement) => (value: any) => node.innerHTML = value;

    hydrationWrapper(rawNode, attrName, attrValue, callback);
}