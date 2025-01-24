import { replaceMustache, templateRegex } from "../app";
import { has, uid } from "../tools";
import { arrayAdd, each, filter, join, map } from "../tools/array";
import { AFTER, HOOKS, HYDRATE, NEW_LINE, STYLE, TEXT_CONTENT } from "../tools/constants";
import { createElement, getTagName, insertNodes, setClass } from "../tools/dom";
import { evaluate } from "../tools/evaluation";
import { match, replace, split, test, trim } from "../tools/string";
import { isArray } from "../tools/typeCheck";

export let hydrateStyles = (vnode: VNode, attrName: string, attrValue: string, tools: HydrationTools) => {

    let el = vnode.el;

    // Skip style elements
    if (getTagName(el) != STYLE) {

        let [setHook, playHook] = tools[HOOKS];

        let stylesObject = tools[STYLE];

        // Evaluate the attribute value, if attribute value does not match a saved style
        let styles = stylesObject[attrValue] ? stylesObject[attrValue]() : evaluate(vnode, attrValue)[0]();

        // Get the styles
        styles = map(
            isArray(styles) ? styles : [styles],
            style => stylesObject[style] ? stylesObject[style]() : style
        );

        // Create a unique prefix for the CSS selectors
        let prefix = uid();

        // Set the hook
        setHook(el, attrName, () => {

            // Add the selector to the element
            setClass(el, prefix);

            // Create a style element
            let style = createElement(STYLE);

            // Set the style content
            style[TEXT_CONTENT] = prefixCssSelectors(join(styles, NEW_LINE), '.'+prefix);

            // Hydrate the style element
            tools.$dom[HYDRATE](style, el);

            // Insert the style element after the current element
            insertNodes(el, AFTER, style);
        });

        // Play the hook
        playHook(el, attrName, prefix);
    }
}


/** Prefix the CSS selectors with a given prefix */
let prefixCssSelectors = (css: string, prefix: string) => {

    // Remove comments
    css = replace(css, /\/\*[\s\S]*?\*\//g, '');

    // Replace mustache syntax in the CSS
    css = replaceMustache(css);

    // Matched template items in the CSS
    let templateItems: string[] = [];

    let placeholder = uid();

    // Replace template items with a placeholder
    // IMPORTANT: this is necessary to avoid conflicts with the template items
    while (test(css, templateRegex)) {
        let value = match(css, templateRegex);
        if (value) {
            arrayAdd(templateItems, value[0]);
            css = replace(css, templateRegex, placeholder);
        }
    }

    // Split the CSS string into individual rules
    let rules = filter(split(css, '}'), trim);

    let indent = NEW_LINE + '    ';

    // Process each rule
    let processRules = (rule: string) => {
        // Split the rule into selectors and declarations
        let [selectors, declarations] = split(rule, '{');

        // Prefix selectors
        let prefixedSelectors = map(
            map(split(selectors, ','), trim),
            selector => has(selector, '&') ? replace(selector, /&/g, prefix) : prefix+' '+selector
        );

        // Format declarations
        declarations = join(map(filter(split(declarations || '', NEW_LINE), trim), trim), indent);

        // Reconstruct the rule
        return join(prefixedSelectors, ',') + ` {${indent + declarations + NEW_LINE}}`;
    };

    // Join the prefixed rules back into a single string
    let prefixed = join(map(rules, processRules), NEW_LINE);

    // Replace the placeholders with the original template items
    each(templateItems, item => {
        prefixed = replace(prefixed, placeholder, item);
    });

    return prefixed;
}