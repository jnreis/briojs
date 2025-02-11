import { loadedScripts, sanitizeAttrValue } from "../app";
import { http } from "../methods/http";
import { arrayAdd, map } from "../tools/array";
import { B_, CTX_ARGS, SCRIPT } from "../tools/constants";
import { getAttr, getNodeContent, getTagName, removeNode } from "../tools/dom";
import { newFn } from "../tools/evaluation";
import { isArray, isFunction, isString } from "../tools/typeCheck";

export let hydrateScript = async (vnode: VNode, attrName: string, attrValue: string) => {

    let el = vnode.el as HTMLScriptElement;

    let assetObject = vnode[SCRIPT];

    let isScript = getTagName(el) == SCRIPT;

    // Skip the hydration of the text node of this script element
    vnode.skip = isScript;

    let [setHook, playHook] = vnode.hook;

    // Get the asset or evaluate the attribute value
    let scripts: any = attrValue ? assetObject[attrValue] || vnode.exec(vnode, attrValue)() : [];

    // Get the scripts
    scripts = map(
        isArray(scripts) ? scripts : [scripts],
        script => assetObject[script] || script
    );

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
            if (isString(fn))
                fn = newFn(vnode[CTX_ARGS](), fn, false);

            // Execute the script
            if (isFunction(fn))
                await fn(vnode.ctx);
        };
    });

    // Play the hook
    await playHook(el, attrName);
}

export let scriptDirective: Directive = [B_+SCRIPT, hydrateScript];