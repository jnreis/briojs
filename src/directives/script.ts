import { loadedScripts, sanitizeAttrValue, saveToParent } from "../app";
import { http } from "../methods/http";
import { arrayAdd, map } from "../tools/array";
import { B_, CTX_ARGS, SCRIPT, SKIP } from "../tools/constants";
import { replaceUsedButNotDeclaredVariables } from "../tools/contextProps";
import { getAttr, getNodeContent, getTagName, removeNode } from "../tools/dom";
import { newFn } from "../tools/evaluation";
import { isStringFunction } from "../tools/string";
import { isArray, isFunction, isString } from "../tools/typeCheck";

export let hydrateScript = async (bnode: BNode, attrName: string, attrValue: string) => {

    let el = bnode.el as HTMLScriptElement;

    let assetObject = bnode[SCRIPT];

    let isScript = getTagName(el) == SCRIPT;

    // Skip the hydration of the text node of this script element
    bnode[SKIP] = isScript;

    let [setHook, playHook] = bnode.hook;

    // Get the asset or evaluate the attribute value
    let scripts: any = attrValue ? assetObject[attrValue] || bnode.exec(bnode, attrValue)() : [];

    // Get the scripts
    scripts = map(
        isArray(scripts) ? scripts : [scripts],
        script => assetObject[script] || script
    );

    /**
     * Since the script element will be removed, it needs to be saved to the parent
     * to ensure the element will go through the cleanup process and will trigger
     * any cleanup functions registered on the bnode
     */
    saveToParent(bnode, el);

    // Set the hook
    setHook(el, attrName, async () => {

        // Add this script element to the list of scripts
        if (isScript) {

            // Get the src attribute, if it exists
            let src = getAttr(el, 'src');
    
            // Mark the script as loaded, if it has a src link
            if (src) loadedScripts.add(src);

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
                let scriptFn = isStringFunction(fn);
                // Scripts can access context properties directly
                // e.g. `console.log(name)` instead of `console.log($data.name)`
                fn = newFn(bnode[CTX_ARGS](), replaceUsedButNotDeclaredVariables(bnode, fn), scriptFn);
                if (scriptFn) fn = fn(bnode.ctx);
            }

            // Execute the script
            if (isFunction(fn))
                await fn(bnode.ctx);
        };
    });

    // Play the hook
    await playHook(el, attrName);
}

export let scriptDirective: Directive = [B_+SCRIPT, hydrateScript];