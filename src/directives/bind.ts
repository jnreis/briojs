import { evalEffect, sliceAttrName } from '../app';
import { logWarn } from '../tools';
import { BUT_GOT_INSTEAD, CLASS, NEW_LINE, OPTIONS, REQUIRES_REACTIVE_VALUE, STYLE } from '../tools/constants';
import { setAttr, delAttr, getAttr, forcePropertyAssignment, sanitizeAttrName, setStyleProps, setClass, delClass, delStyleProp } from '../tools/dom';
import { autoFillContextProp, expToFn } from '../tools/evaluation';
import { camelCase } from '../tools/string';
import { isObject } from '../tools/typeCheck';

/**
 * Bind Directive
 * 
 * This directive binds a DOM element's attribute to a reactive property or method.
 *
 * Note: it will always set the DOM property for these attributes: "value", "checked", "selected", and "src".
 *
 * @option `prop`   Also set a specific DOM property.
 */
let hydrateBind = (bnode: BNode, dirName: string, dirValue: string) => {

    let el = bnode.el;

    let rawAttrName = sliceAttrName(dirName);
    let [targetAttrName, ...dotModifiers] = rawAttrName.split('.');
    let attrName = targetAttrName;

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
     * Context lookup using shorthand syntax (attrName):
     * - attribute names with hyphens (e.g., "first-name") are converted to camelCase (e.g., "firstName").
     * - all other cases, including underscores, are used as is. Examples: firstname and first_name will be used as is.
     * - for any other cases, use the regular bind syntax (e.g., `b-bind-first-name="FirstName"`).
     */
    let stateProp = expToFn(autoFillContextProp(bnode, dirValue || camelCase(attrName)), '$initial');

    // Sanitize the attribute name to ensure it is a valid HTML attribute name
    // This is necessary because some attributes may contain special characters that are not valid in HTML.
    attrName = sanitizeAttrName(attrName);

    // Get the attribute's initial value
    let initialAttrValue = getAttr(el, attrName);
    let boundStyleProps = new Set<string>();
    let boundClassNames = new Set<string>();

    // Options
    let baseDirName = dirName.split('.')[0];
    let options: Record<string, any> = {
        ...(bnode[OPTIONS][baseDirName] || {}),
        ...(bnode[OPTIONS][dirName] || {})
    };
    for (let modifier of dotModifiers) {
        options[modifier] = true;
    }

    // Evaluate the attribute value as an effect
    evalEffect(bnode, stateProp, (ctxFn) => {

        if (!ctxFn)
            return logWarn(dirValue, REQUIRES_REACTIVE_VALUE, BUT_GOT_INSTEAD(dirName+`="${dirValue}"`), NEW_LINE, el);

        let value = ctxFn(initialAttrValue || '');

        /**
         * Always set the DOM property for these attributes. No matter what the value is.
         * Explanation:
         * - Updating the "src" property normalizes the path and ensures the new resource is loaded
         * - The properties "value", "checked", and "selected" reflect the current state of the element
         */
        let forceBind = options.prop === true
            ? attrName
            : options.prop || forcePropertyAssignment(attrName) && attrName;

        if (attrName == STYLE) {
            if (isObject(value)) {
                for (let prop of boundStyleProps)
                    if (!(prop in value)) delStyleProp(el, prop);
                setStyleProps(el, value as StyleProps);
                boundStyleProps = new Set(Object.keys(value));
            }
            else {
                for (let prop of boundStyleProps) delStyleProp(el, prop);
                boundStyleProps.clear();
                if (value === null || value === undefined || value === false)
                    delAttr(el, attrName);
                else setAttr(el, attrName, value, forceBind);
            }
        } else if (attrName == CLASS && isObject(value)) {
            for (let className of boundClassNames)
                if (!(className in value)) delClass(el, className);
            for (let className in value) {
                if (value[className]) setClass(el, className);
                else delClass(el, className);
            }
            boundClassNames = new Set(Object.keys(value));
        } else {
            for (let className of boundClassNames) delClass(el, className);
            boundClassNames.clear();
            if (value !== null && value !== undefined && value !== false || forceBind) {
                // Set attribute
                if (value === true && !forceBind) setAttr(el, attrName, '');
                else setAttr(el, attrName, value, forceBind);
            } else {
                delAttr(el, attrName);
            }
        }
    });

    // // Cleanup: restore the attribute's initial value
    // saveCleanup(bnode, () => {
    //     if (isNull(initialAttrValue)) delAttr(el, attrName);
    //     else setAttr(el, attrName, initialAttrValue!);
    // })
}

export let bindDirective: Directive = [/^(b-bind|bind)-([\w-$.]+)$/, hydrateBind];