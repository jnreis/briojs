import { sliceAttrName } from '../app';
import { OPTIONS, EVAL_EFFECT } from '../tools/constants';
import { setAttr, delAttr, getAttr, forcePropertyAssignment, sanitizeAttrName } from '../tools/dom';
import { expToFn } from '../tools/evaluation';
import { camelCase } from '../tools/string';

// TODO: disable all the fields in a form when a disabled attribute is present on the form element

/**
 * Option
 * @option `prop`   Also set a specific DOM property.
 */
export let hydrateBind = (bnode: BNode, attrName: string, attrValue: string) => {

    let _attrName = sliceAttrName(attrName, 7); // 7: b-bind-, 5: bind-

    /**
     * Make sure the attribute value is a function that takes the attribute's initial value as an argument.
     * 
     * When the attribute value is omitted, use the attribute name as the context key. Note that it must be a valid HTML attribute name.
     * 
     * Rules for valid HTML attribute name:
     * - must start with a letter or underscore
     * - subsequent characters can be letters, numbers, underscores, or hyphens
     * - uppercase letters are treated as lowercase (HTML is case-insensitive)
     * - any special characters are removed for the purpose of setting the attribute value, but not for context lookup.
     * Context lookup using shorthand syntax (_attrName):
     * - attribute names with hyphens (e.g., "first-name") are converted to camelCase (e.g., "firstName").
     * - all other cases, including underscores, are used as is. Examples: firstname and first_name will be used as is.
     * - for any other cases, use the regular bind syntax (e.g., `b-bind-first-name="FirstName"`).
     */
    attrValue = expToFn(attrValue || camelCase(_attrName), '$initial');

    // Sanitize the attribute name to ensure it is a valid HTML attribute name
    // This is necessary because some attributes may contain special characters that are not valid in HTML.
    _attrName = sanitizeAttrName(_attrName);

    // Get the attribute's initial value
    let initialAttrValue = getAttr(bnode.el, _attrName);

    // Options
    let options = bnode[OPTIONS][attrName] || {};

    // Evaluate the attribute value as an effect
    bnode[EVAL_EFFECT](bnode, attrName, attrValue, (node: HTMLElement) => (exp) => {

        let value = exp(initialAttrValue || '');

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

    // // Cleanup: restore the attribute's initial value
    // saveCleanup(bnode, () => {
    //     if (isNull(initialAttrValue)) delAttr(bnode.el, _attrName);
    //     else setAttr(bnode.el, _attrName, initialAttrValue!);
    // })
}

export let bindDirective: Directive = [/^(b-bind-|bind-)[\w-$]+$/, hydrateBind];