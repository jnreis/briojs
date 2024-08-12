import { _components } from "../api/component";
import { dehydrate, hydrate, wrapper } from "../tools/hydration";
import { childNodes } from "../tools/dom";
import { each } from "../tools/array";
import { wait } from "../tools";

export let hydrateHtml = (vnode: VNode, attrName: string, attrValue: string) => {

    wrapper(vnode, attrName, attrValue, (node) => async ([call]) => {

        // Get the value
        let value = await call();

        // Check if the value is a component
        if (value in _components) value = _components[value];

        // Dehydrate the innerHTML
        each(childNodes(node), child => dehydrate(child));

        wait(() => {
            // Set the innerHTML
            node.innerHTML = value;

            // Hydrate the innerHTML
            hydrate(childNodes(node));
        });
    });
}