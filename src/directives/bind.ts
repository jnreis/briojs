import { wrapper } from '../tools/hydration';
import { has, slice } from '../tools';
import { setAttr, delAttr, getAttr } from '../tools/dom';
import { VALUE, CHECKED, SELECT } from '../tools/constants';
import { isStringFunction } from '../tools/string';
import { makeFunction } from '../tools/evaluation';

export let hydrateBind = (vnode: VNode, attrName: string, attrValue: string) => {

    let prop = slice(attrName, 2);

    // When the attribute value is omitted, use the attribute name as the value
    // Example: b-hidden => b-hidden="hidden"
    attrValue = attrValue || prop;

    // Check is attrValue is a function
    if (!isStringFunction(attrValue)) {
        attrValue = makeFunction(attrValue || 'true', '$initial');
    }

    // Get the attribute's initial value
    let initialAttrValue = getAttr(vnode.$el, prop) || '';

    wrapper(vnode, attrName, attrValue, (node) => ([call]) => {

        let value = call(initialAttrValue);

        /**
         * Always set the DOM property for these attributes. No matter what the value is.
         * Explanation:
         * - Updating the "src" property normalizes the path and ensures the new resource is loaded
         * - The properties "value", "checked", "selected", and "disabled" reflect the current state of the element
         */
        let forceBind = has(['src', VALUE, CHECKED, SELECT+'ed', 'disabled'], prop);

        // Set attribute
        if (value || forceBind) {
            // Also set the DOM property for these attributes
            if (forceBind) (node as any)[prop] = value;

            setAttr(node, prop, !forceBind && value === true ? '' : value);
        }

        // Remove attribute
        else delAttr(node, prop);
    });
}