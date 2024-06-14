import { _components } from "../api/component";
import { evaluate } from "../evaluation";
import { hydrate, mustacheRegex, replaceMustache, templateRegex, wrapper } from "../hydration";
import { childNodes } from "../tools/dom";
import { replace, test } from "../tools/string";
import { isFunction } from "../tools/typeCheck";

export let hydrateHtml = (vnode: VNode, attrName: string, attrValue: string) => {

    wrapper(vnode, attrName, attrValue, (node) => (ctx, next) => {

        // Get the value
        let value = isFunction(ctx) ? ctx() : ctx;

        // Check if the value is a component
        if (value in _components) value = _components[value];

        // Make sure the value is fully evaluated
        while (test(value, templateRegex) || test(value, mustacheRegex)) {
            // Save the value before evaluation
            let valueBefore = value;

            // The code below does the following:
            // - Replaces all mustache expressions with template literal expressions. {{}} -> ${}
            // - Wraps the `value` in backticks to allow for the use of template literal expressions.
            // - Escapes all backticks inside the `value` to prevent syntax errors.
            // - Evaluates the `value` and gets the result by calling the returned function.
            value = evaluate(vnode, '`' + replace(replaceMustache(value), /`/g, '\\`') + '`')[0]();

            // Break the loop if the value is the same as before
            if (valueBefore == value) break;
        }

        // Set the innerHTML
        node.innerHTML = value;

        // Hydrate the innerHTML
        hydrate(childNodes(node));

        // Next function
        next();
    });
}