import { _components } from "../api/component"
import { interceptor } from "../tools/hydration";
import { logger } from "../tools";
import { COMPONENT, NOT_FOUND } from "../tools/constants";


export let hydrateComponent = (vnode: VNode, attrName: string, attrValue: string) => {

    // Create an interceptor
    interceptor(vnode, attrName, (ctx, next) => {

        // Replace the innerHTML with the component, if the component exists
        if (ctx) vnode.$el.innerHTML = ctx;
        else logger(COMPONENT + ` "${attrValue}" ` + NOT_FOUND);

        // Next function
        next();
    })
    // Evaluate the expression and run it only once
    (_components[attrValue]);
}