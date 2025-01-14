import { slice } from '../tools';
import { setAttr, delAttr, getAttr, forcePropertyAssignment } from '../tools/dom';
import { B_, $DATA, OPTIONS, EVAL_EFFECT } from '../tools/constants';
import { isStringFunction, startsWith } from '../tools/string';
import { makeFunction } from '../tools/evaluation';

/**
 * Option
 * @option `prop`   Also set a specific DOM property.
 */
export let hydrateBind = (vnode: VNode, attrName: string, attrValue: string, tools: HydrationTools) => {

    let _attrName = slice(attrName, startsWith(attrName, B_) ? 7 : 5) as string; // 7: b-bind-, 5: bind-

    /**
     * When the attribute value is omitted, use the attribute name as the key in the $data context.
     * Example:
     *   bind-hidden  becomes  bind-hidden="$data['hidden']"
     */
    attrValue = attrValue || $DATA + `['${_attrName}']`;

    // Make sure the attribute value is a function that takes the attribute's initial value
    if (!isStringFunction(attrValue)) {
        attrValue = makeFunction(attrValue, '$initial');
    }

    // Get the attribute's initial value
    let initialAttrValue = getAttr(vnode.el, _attrName) || '';

    // Options
    let options = vnode[OPTIONS][attrName] || {};

    // Evaluate the attribute value as an effect
    tools[EVAL_EFFECT](vnode, attrName, attrValue, (node: HTMLElement) => ([call]) => {

        let value = call(initialAttrValue);

        /**
         * Always set the DOM property for these attributes. No matter what the value is.
         * Explanation:
         * - Updating the "src" property normalizes the path and ensures the new resource is loaded
         * - The properties "value", "checked", and "selected" reflect the current state of the element
         */
        let forceBind = options.prop || forcePropertyAssignment(_attrName) && _attrName;

        // Set attribute
        if (value || forceBind) {
            setAttr(node, _attrName, !forceBind && value === true ? '' : value, forceBind);
        }

        // Remove attribute
        else delAttr(node, _attrName);
    });
}