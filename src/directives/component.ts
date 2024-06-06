import { _components } from "../api/component"
import { logger } from "../tools";
import { COMPONENT, NOT_FOUND } from "../tools/constants";


export let hydrateComponent = (vnode: VNode, _attrName: string, attrValue: string) => {

    // Get the component
    let component = _components[attrValue];

    // Replace the innerHTML with the component, if the component exists
    if (component) vnode.$el.innerHTML = component;
    else logger(COMPONENT + ` "${attrValue}" ` + NOT_FOUND);
}