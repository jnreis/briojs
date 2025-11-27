import { getSavedAssets, saveCleanup } from "../app";
import { uid } from "../tools";
import { arrayAdd, join } from "../tools/array";
import { $DEHYDRATE, $HYDRATE, AFTER, B_, NEW_LINE, SELECTOR_TEXT, STYLE, TEXT_CONTENT } from "../tools/constants";
import { createElement, getTagName, insertNodes, setClass } from "../tools/dom";
import { replace } from "../tools/string";

/**
 * Hydrate the style directive.
 * 
 * It may receive one or more style asset names or CSS strings.
 */
export let hydrateStyle = (bnode: BNode, _attrName: string, attrValue: string) => {

    let el = bnode.el;

    // Skip style elements
    if (attrValue && getTagName(el) != STYLE) {

        // Get all saved styles from the attribute value
        let styles = getSavedAssets(bnode, bnode[STYLE], attrValue);

        // Create a unique prefix for the CSS selectors
        let prefix = uid();

        // Add the selector to the element
        setClass(el, prefix);

        // Create a style element
        let style = createElement(STYLE) as HTMLStyleElement;

        // Insert the style element after the current element
        insertNodes(el, AFTER, style);

        // Set the initial style content
        style[TEXT_CONTENT] = join(styles, NEW_LINE);

        // Set the prefixed CSS content
        style[TEXT_CONTENT] = prefixCssSelectors(style, '.'+prefix);

        // Hydrate the style element
        bnode.gc[$HYDRATE](style, el);

        // Remove the style element
        saveCleanup(bnode, () => {
            bnode.gc[$DEHYDRATE](style);
        });
    }
}


/** Prefix the CSS selectors with a given prefix */
let prefixCssSelectors = (css: HTMLStyleElement, prefix: string) => {

    let rules: string[] = [];

    for (let rule of css.sheet?.cssRules as CSSRuleList || []) {
        // Get the selector
        let selector = (rule as CSSStyleRule)[SELECTOR_TEXT];

        // Add the CSS rule with the prefixed selector
        arrayAdd(rules, replace(rule.cssText, selector, prefix + ' ' + selector));
    }

    return join(rules, NEW_LINE);
}

export let styleDirective: Directive = [B_+STYLE, hydrateStyle];