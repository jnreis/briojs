import { getSavedAssets, saveCleanup } from "../app";
import { has, uid } from "../tools";
import { join, map } from "../tools/array";
import { $DEHYDRATE, $HYDRATE, AFTER, B_, NEW_LINE, STYLE, TEXT_CONTENT } from "../tools/constants";
import { createElement, getTagName, insertNodes, setClass } from "../tools/dom";
import { replace, split, trim } from "../tools/string";

let cssSelectorRegex = /(?<=(?:^|})\s*)\S(?:.\s*?)*?(?=\s*{)/g;

/**
 * Hydrate the style directive.
 * 
 * It may receive one style asset name or an array of style asset names.
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

        prefix = '.' + prefix;

        // Create a style element
        let style = createElement(STYLE) as HTMLStyleElement;

        // Insert the style element after the current element
        insertNodes(el, AFTER, style);

        let styleContent = join(styles, NEW_LINE);

        // FORMAT STYLE CONTENT

        // Indentation inside the braces
        styleContent = replace(styleContent, /([{;])\s*/g, '$1' + NEW_LINE + '    ');

        // Spacing around closing braces
        styleContent = replace(styleContent, /\s*}\s*/g, NEW_LINE+ '}' +NEW_LINE);

        // Set the style content with prefixed selectors
        style[TEXT_CONTENT] = replace(styleContent, cssSelectorRegex, (selector: string) => {
            let newSelector = trim(selector);

            if (has(selector, '&')) {
                newSelector = replace(newSelector, /&/g, prefix);
            } else {
                newSelector = join(map(split(newSelector, ','), s => prefix + ' ' + trim(s)), ',' + NEW_LINE);
            }

            return newSelector;
        });

        // Hydrate the style element
        bnode.gc[$HYDRATE](style, el);

        // Remove the style element
        saveCleanup(bnode, () => {
            bnode.gc[$DEHYDRATE](style);
        });
    }
}

export let styleDirective: Directive = [B_+STYLE, hydrateStyle];