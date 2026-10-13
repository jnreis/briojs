import { getSavedAssets, saveCleanup } from "../app";
import { has, uid } from "../tools";
import { join, map } from "../tools/array";
import { $DEHYDRATE, $HYDRATE, AFTER, B_, NEW_LINE, STYLE, TEXT_CONTENT } from "../tools/constants";
import { createElement, getTagName, insertNodes, setClass } from "../tools/dom";
import { replace, trim } from "../tools/string";

let scopeCss = (content: string, prefix: string) => {
    let dynamicValues: string[] = [];
    let placeholderPrefix = `__brio_${uid()}_`;
    content = replace(content, /\$\{[\s\S]*?\}/g, (expression: string) => {
        let placeholder = placeholderPrefix + dynamicValues.length + '__';
        dynamicValues.push(expression);
        return placeholder;
    });

    let sheet = new CSSStyleSheet();
    sheet.replaceSync(content);

    let splitSelectors = (selectors: string) => {
        let result: string[] = [];
        let start = 0;
        let depth = 0;
        let quote = '';
        for (let index = 0; index < selectors.length; index++) {
            let character = selectors[index];
            if (quote) {
                if (character === quote && selectors[index - 1] !== '\\') quote = '';
            } else if (character === '"' || character === "'") quote = character;
            else if (character === '(' || character === '[') depth++;
            else if (character === ')' || character === ']') depth--;
            else if (character === ',' && depth === 0) {
                result.push(trim(selectors.slice(start, index)));
                start = index + 1;
            }
        }
        result.push(trim(selectors.slice(start)));
        return result;
    };

    let scopeRules = (rules: CSSRuleList) => {
        for (let rule of Array.from(rules)) {
            if (rule instanceof CSSStyleRule) {
                rule.selectorText = join(map(splitSelectors(rule.selectorText), selector =>
                    has(selector, '&') ? replace(selector, /&/g, prefix) : prefix + ' ' + selector
                ), ', ');
            } else if (rule instanceof CSSGroupingRule) {
                scopeRules(rule.cssRules);
            }
        }
    };

    scopeRules(sheet.cssRules);
    let scopedCss = join(map(Array.from(sheet.cssRules), rule => rule.cssText), NEW_LINE);
    dynamicValues.forEach((expression, index) => {
        scopedCss = replace(scopedCss, placeholderPrefix + index + '__', expression);
    });
    return scopedCss;
}

/**
 * Hydrate the style directive.
 * 
 * It may receive one style asset name or an array of style asset names.
 */
let hydrateStyle = (bnode: BNode, _attrName: string, attrValue: string) => {

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

        style[TEXT_CONTENT] = scopeCss(styleContent, prefix);

        // Hydrate the style element
        bnode.gc[$HYDRATE](style, el);

        // Remove the style element
        saveCleanup(bnode, () => {
            bnode.gc[$DEHYDRATE](style);
        });
    }

}

export let styleDirective: Directive = [B_+STYLE, hydrateStyle];