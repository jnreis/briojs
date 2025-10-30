import { sanitizeAttrValue, saveToParent } from "../app";
import { http } from "../methods/http";
import { arrayAdd, each } from "../tools/array";
import { B_SCRIPT, SCRIPT, SKIP } from "../tools/constants";
import { getAttr, getNodeContent, getTagName, removeNode } from "../tools/dom";
import { newFn } from "../tools/evaluation";
import { isStringFunction, split, trim } from "../tools/string";
import { isFunction, isString } from "../tools/typeCheck";

export let hydrateScript = async (bnode: BNode, _attrName: string, attrValue: string) => {

    let el = bnode.el as HTMLScriptElement;

    let assetObject = bnode[SCRIPT];

    // Skip the hydration of the text node of this script element
    bnode[SKIP] = 2;

    let scripts: any[] = [];

    // Get the scripts from the attribute value
    each(split(attrValue, ','), name => {
        name = trim(name);
        if (name && name in assetObject) arrayAdd(scripts, assetObject[name]);
    });

    /**
     * Since the script element will be removed, it needs to be saved to the parent
     * to ensure the element will go through the cleanup process and will trigger
     * any cleanup functions registered on the bnode
     */
    saveToParent(bnode, el);

    // Add this script element to the list of scripts
    if (getTagName(el) == SCRIPT) {

        // Get the src attribute, if it exists
        let src = getAttr(el, 'src');

        // Get the content of the script element
        let content = src ? await http.get(src) : getNodeContent(el);

        // Include code from this script element, if any
        if (content) arrayAdd(scripts, sanitizeAttrValue(content));

        // Remove this script element
        removeNode(el);
    }

    for (let script of scripts) {
        // Get the script function/string
        let fn = script;

        // Evaluate the script
        if (isString(fn)) {
            let stringIsFn = isStringFunction(fn);

            fn = newFn('', fn, stringIsFn);

            // If the script is a string function, evaluate it to get the actual function
            if (stringIsFn) fn = fn();
        }

        // Execute the script
        if (isFunction(fn))
            await fn(bnode.ctx);
    }
}

export let scriptDirective: Directive = [B_SCRIPT, hydrateScript];