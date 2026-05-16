import { evalEffect } from "../app";
import { isFunction } from "../tools/typeCheck";

let hydrateEffect = async (bnode: BNode, _attrName: string, attrValue: string) => {

    evalEffect(bnode, attrValue, (ctxFn) => {
        // Get value
        let value = ctxFn();

        console.warn('Effect value:', value);

        // If the returned value is a function, call it
        if (isFunction(value)) value();
    });
}

export let effectDirective: Directive = ['b-effect', hydrateEffect];