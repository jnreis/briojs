import { hydrationWrapper } from ".";
import { isFunction } from "../tools/typeCheck";

export let hydrateEffect = (vnode: VNode, attrName: string, attrValue: string) => {

    let callback = () => (value: any) => {
        // If the `value` is a function, execute it
        if (isFunction(value)) value();
    };

    hydrationWrapper(vnode, attrName, attrValue, callback);
}