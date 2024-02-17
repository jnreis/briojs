import { RawElement } from "../index.d";

import { hydrationWrapper } from ".";
import { isFunction } from "../../tools";

export const hydrateEffect = (rawNode: RawElement, attrName: string, attrValue: string) => {

    const callback = () => (value: any) => {
        // If the value is a function, call it
        // Other expressions run during evaluation
        if (isFunction(value)) value();
    };

    hydrationWrapper(rawNode, attrName, attrValue, callback);
}