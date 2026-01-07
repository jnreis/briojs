import { genContextArgs, getSavedAssets, sanitizeAttrValue, saveToParent } from "../app";
import { http } from "../methods/http";
import { arrayAdd } from "../tools/array";
import { B_SCRIPT, SCRIPT, SKIP } from "../tools/constants";
import { getAttr, getNodeContent, getTagName, removeNode } from "../tools/dom";
import { newFn } from "../tools/evaluation";
import { isStringFunction } from "../tools/string";
import { isFunction, isString } from "../tools/typeCheck";

export let hydrateScript = async (bnode: BNode, attrName: string, attrValue: string) => {

    let el = bnode.el as HTMLScriptElement;

    // Skip the hydration of the text node of this script element
    bnode[SKIP] = 2;

    // Get all saved scripts from the attribute value
    let scripts = getSavedAssets(bnode, bnode[SCRIPT], attrValue);

    // Add this script element to the list of scripts
    if (getTagName(el) == SCRIPT) {

        /**
         * Since the script element will be removed, it needs to be saved to the parent
         * to ensure the element will go through the cleanup process and will trigger
         * any cleanup functions registered on the bnode
         */
        saveToParent(bnode, el);

        // Get the src attribute, if it exists
        let src = getAttr(el, 'src');

        // Get the content of the script element
        let content = src ? await http.get(src) : getNodeContent(el);

        // Include code from this script element, if any
        if (content) arrayAdd(scripts, content);

        // Remove this script element
        removeNode(el);
    }

    for (let fn of scripts) {
        // Evaluate the script
        if (isString(fn)) {
            let isStringFn = isStringFunction(fn);

            fn = newFn(genContextArgs(bnode, fn), sanitizeAttrValue(fn), isStringFn);

            // If the script is a string function, call the wrapper function to get the actual function
            if (isStringFn) fn = fn(bnode.ctx);
        }

        // Execute the script
        if (isFunction(fn))
            await fn(bnode.ctx);
    }
}

export let scriptDirective: Directive = [B_SCRIPT, hydrateScript];