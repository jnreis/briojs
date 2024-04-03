import { evaluate } from "../evaluation";
import { saveAttr } from "../hydration";
import { slice } from "../tools";
import { each } from "../tools/array";
import { PREFIX } from "../tools/constants";
import { delAttr, getAttr, q, setAttr } from "../tools/dom";
import { startsWith } from "../tools/string";
import { isFunction } from "../tools/typeCheck";

/**
 * ! WORK IN PROGRESS!
 * Think about how to implement this feature.
 * Questions to answer:
 * - Is this directive necessary?
 *   - A1. Maybe, to avoid potential conflicts with other frameworks or libraries. E.g. UnoCSS's attributify mode.
 *     But, is it worth it, considering the potential drawbacks?
 * - How the prefixing of directives will affect the developer experience, code readability, performance, and bundle size?
 *   - A1. Could potentially cause confusion, by having two ways to do the same thing.
 *   - A2. It will make the code more verbose, but one could also argue that it makes the code more explicit.
 *   - A3. It will increase the bundle size, but the performance impact should be negligible.
 *   - A4. It will make the framework more flexible, by allowing the developer to choose between the two ways.
 * - How this directive will affect other directives? (e.g. ref, props, uid, etc.)
 *   - A1. Extra work will be needed to make sure that the `ref` and other directives work as expected.
 * - How to implement the prefix directive?
 */

export let hydratePrefix = (vnode: any, attrName: string, attrValue: string) => {

    // Evaluate the expression
    let value = !attrValue || evaluate(vnode, attrValue as string);

    // If the expression is a function, run it
    if (isFunction(value)) value = value();

    // Prefix the attribute name
    vnode[PREFIX] = !!value;

    if (value) {
        each([...q(`[props]:not([b-prefix] [props])`, vnode.$el)], $el => {
            let propsValue = getAttr($el, 'props');
            setAttr($el, 'b-props', propsValue || '');
            delAttr($el, 'props');
        });
    }

    // Save the attribute
    saveAttr(vnode, attrName, attrValue as string);
}

// Prefix the attribute name, if applicable
export let addPrefix = (attr: string) =>
    ['on-','b-'].some(startName => startsWith(attr, startName))
        ? attr
        : 'b-' + attr;

export let delPrefix = (attr: string) =>
    startsWith(attr, 'b-')
        ? slice(attr, 2) as string
        : attr;