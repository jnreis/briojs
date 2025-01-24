import { loadedScripts, sanitizeAttrValue } from "../app";
import { http } from "../methods/http";
import { arrayAdd, map } from "../tools/array";
import { HOOKS, SCRIPT } from "../tools/constants";
import { getAttr, getNodeContent, getTagName, removeNode } from "../tools/dom";
import { evaluate } from "../tools/evaluation";
import { isStringFunction } from "../tools/string";
import { isArray, isFunction } from "../tools/typeCheck";

export let hydrateScripts = async (vnode: VNode, attrName: string, attrValue: string, tools: HydrationTools) => {

    let el = vnode.el as HTMLScriptElement;

    let scriptsObject = tools[SCRIPT];

    let isScript = getTagName(el) == SCRIPT;

    // Skip the hydration of the text node of this script element
    vnode.skip = isScript;

    let [setHook, playHook] = tools[HOOKS];

    // Evaluate the attribute value, if attribute value does not match a saved script
    let scripts = attrValue ? scriptsObject[attrValue] || evaluate(vnode, attrValue)[0]() : [];

    // Get the scripts
    scripts = map(
        isArray(scripts) ? scripts : [scripts],
        script => scriptsObject[script] || script
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
            let content = src ? await http.get(src) : getNodeContent(el) || '0';

            // Include code from this script element
            arrayAdd(scripts, sanitizeAttrValue(content));

            // Remove this script element
            removeNode(el);
        }

        let args = {...vnode.gc, ...vnode.lc};

        for (let script of scripts) {
            // Get the script function/string
            let fn = script;

            // Evaluate the script, if it is not a function
            if (!isFunction(fn))
                fn = evaluate(vnode, fn, '', !isStringFunction(fn))[0];

            // Execute the script
            await fn(args);
        };
    });

    // Play the hook
    await playHook(el, attrName);
}