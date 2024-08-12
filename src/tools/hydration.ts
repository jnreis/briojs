import { evaluate } from "./evaluation";
import { effect, storageEvent } from "../reactivity";
import { has, logger, size } from ".";
import { arrayAdd, each, join } from "./array";
import { q, walk, getAttr, delAttr, getParent, setAttr, listen } from "./dom";
import { slugify, split, startsWith, test, trim } from "./string";
import { isTextNode, isElementNode } from "./typeCheck";
import { TEXT, $PROPS, $REFS, TEXT_CONTENT, ATTR, CLEANUP, VALUE, STATUS, SKIP, BEFORE, AFTER, ATTRIBUTE, DELETE, INIT, PROPS, MUST_BE, HYDRATE } from "./constants";
import { _directives } from "../directives";
import { D, W } from "./object";
import { _settings } from "../api";
import { callHook, hasHook, setHook } from "./hook";

// Raw values are evaluated only once in production mode, but are evaluated every time they are updated in development mode
export const vnodes : VNodes = new Map();

// Effects are functions that are called when a dependency changes
// Most of the raw values are expressions, or references to a prop or method in the scope
// All raw values are converted to functions that return the evaluated value
// Some props are always evaluated as a function, such as 'on-click'
// Specifics:
//  scope is alway a string that is evaluated as an object or a function that returns an object.
//  model must reference a prop
//  bind-* may reference a prop or be a expression (template literal)
//  on-click may reference a function or be a expression
//  if must reference a prop, method, or be a expression that returns a value that can be converted to a boolean
//  same as if
//  each must reference a prop, method or be an expression that returns an array
//  ref must reference a prop
//  html must be an expression that returns html
//  text must be an expression that returns text

export let wrapper = (
    vnode: VNode,
    attrName: string,
    attrValue: string,
    callback: (node: HTMLElement) => HookFunction
) => {

    let $el = vnode.$el;

    // * Set the directive hook. Priority 0. Other hooks can be added.
    // * - Hooks with higher priority will be called first.
    // * - Hooks with lower priority (negative numbers) will be called after.
    setHook($el, attrName, callback($el));

    // The context. Which most likely refers to reactive properties.
    let evaluation = evaluate(vnode, attrValue);

    let attrNameDeps = attrName+'-deps';

    // Create a new effect, and save the cleanup function.
    // This sets up the reactivity.
    saveCleanup(vnode, effect(
        () => callHook($el, attrName, evaluation),
        // Get the dependencies, if any
        (hasHook($el, attrNameDeps) ? () => callHook($el, attrNameDeps, evaluation) : undefined)
    ));
}

/**
 * Walks up the DOM tree to find the closest vnode
 */
export let closestVNode = (node: Node) => {
    let _el: any = node;
    while (_el) {
        // Get the vnode, if any
        let vnode = vnodes.get(_el);

        // A vnode is valid if it has attributes
        if (vnode && size(vnode[ATTR])) return vnode;

        // Try the parent node if the vnode
        // - was not found, or
        // - has no attributes
        _el = getParent(_el);
    }
}

/** Get the closest vnode with props */
export let closestProps = (node: HTMLElement|Text): VNode | undefined => {
    let _el: any = node;
    while (_el) {
        // Get the closest vnode, if any
        let vnode = closestVNode(_el);

        // There is no vnode up the DOM tree
        if (!vnode) break;

        // Check if the vnode has props
        if ('b-'+PROPS in vnode[ATTR]) return vnode;

        // Try the parent node of the vnode if it has no props
        _el = getParent(vnode.$el);
    }
};

export let hydrate = (nodes?: Node[]) => {

    // Get all the nodes if none are provided
    if (!nodes) nodes = [D.body];

    // Hydrate the nodes
    for (let _node of nodes) {

        // Skip nodes that are not in the DOM
        if (!getParent(_node)) {
            logger(`The node ${MUST_BE} in the DOM ${BEFORE} hydration.`, _node);
            continue;
        }

        // Recursively hydrate the nodes
        walk(_node, (node: Node) => {
            let result = false;
            if (isTextNode(node) && trim(node[TEXT_CONTENT] || '')) {
                result = hydrateTextNode(node as Text);
            }
            else if (isElementNode(node) && !has(['SCRIPT','STYLE'], node.nodeName)) {
                result = hydrateElementNode(node as HTMLElement);
            }
            return result;
        });
    }
}

// Remove all the effects and vnode from the node and its children
export let dehydrate = (node: Node, removeVNode = true) => {

    // Dehydrate the node and its children
    walk(node, (n) => {
        let vnode = vnodes.get(n);

        // Remove the effects
        if (vnode) {
            // Call the cleanup functions
            each(vnode[CLEANUP], cleanupFn => cleanupFn());

            // Remove the context
            if (removeVNode) vnodes[DELETE](n);
        }

        return true;
    });
}

// Restore the original state of the node.
// Note: `dehydrate` must be called before `restore` to remove the effects.
export let restore = (node: Node) => {

    walk(node, (n) => {
        let vnode = vnodes.get(n) as VNode;

        // Add the raw attributes back to the node
        if (vnode) {
            // Restore the original text content
            if (isTextNode(n)) {
                n[TEXT_CONTENT] = vnode[ATTR][TEXT][VALUE];
            }
            else {
                for (let key in vnode[ATTR]) {
                    // Set the attribute
                    setAttr(n as HTMLElement, key, vnode[ATTR][key][VALUE]);

                    // Bind may leave a property behind, remove it
                    if (startsWith(key, 'b-')) {
                        delAttr(n as HTMLElement, key.substring(5));
                    }
                }
            }
        }

        return true;
    });
}

/**
 * Create a new vnode or get the existing one
 */
export let newVNode = ($el: HTMLElement, status: 'ok' | 'temp' = 'ok'): VNode => {

    let vnode: any = vnodes.get($el);

    // Get the existing vnode
    if (!vnode) {
        vnode = {
            // Magic attributes: $el, $refs, $props
            $el, // the element itself
            [$REFS]: {}, // References to other elements available to all elements in the same $props context. Except for nested contexts.
            [$PROPS]: {}, // context

            // UIDs
            uid: {}, // context

            // Attributes or directives
            [ATTR]: {},

            // Cleanup functions
            [CLEANUP]: [],
        }
    }

    /**
     * Hydration status
     * - ok: the element is about to be hydrated or has been hydrated
     * - temp: the element will be hydrated later
     * - skip: the element will not be hydrated
     */
    vnode[STATUS] = status;

    // Update context data
    if (status == 'ok') {
        // Get the parent vnode, if any
        let parent = closestVNode($el);

        if (parent) {
            each([$REFS, $PROPS, 'uid'], key => {
                vnode[key] = parent[key as keyof VNode];
            });
        }

        // Save the vnode
        saveVNode(vnode);
    }

    // Create a new vnode
    return vnode;
}

export let hydrateTextNode = (node: Text) => {
    // * Empty text nodes are ignored by the walk callback

    let text = (node as any)[TEXT_CONTENT];
    let sanitizedText = replaceMustache(sanitizeAttrValue(text || ''));

    if (sanitizedText && test(sanitizedText, templateRegex)) {

        let vnode = newVNode(node as any);

        // HOOK: before-hydrate
        callHook(node, slugify(BEFORE, HYDRATE, TEXT), sanitizedText);

        // Evaluate the expression
        let [call] = evaluate(vnode, `$el.${TEXT_CONTENT}=\`${sanitizedText}\``, '', true);

        // Save the cleanup function
        saveCleanup(vnode, effect(call));

        // Save attribute
        saveAttr(vnode, TEXT, text);

        // HOOK: after-hydrate
        callHook(node, slugify(AFTER, HYDRATE, TEXT), sanitizedText);
    }

    // Always return false because text nodes don't have attributes or children
    return false;
}

export let hydrateElementNode = (node: HTMLElement) => {

    // Get the vnode or create a new one
    let vnode = newVNode(node);

    // Check all the directives
    // Its important to hydrate the directives in the correct order
    for (let [validateDirective, hydrateDirective] of _directives) {

        // Check all the attributes against the directive
        for (let { name, value } of [...node[ATTRIBUTE + 's' as 'attributes']]) {

            // Check if the attribute is a directive
            let isDirective = validateDirective(vnode, name);

            if (isDirective > 0) {

                // Save attribute
                saveAttr(vnode, name, value);

                // HOOK: before-hydrate-[attrName]
                callHook(node, slugify(BEFORE, HYDRATE, name), [vnode, name, value]);

                // Hydrate the directive
                hydrateDirective(vnode, name, sanitizeAttrValue(value), tools);

                // HOOK: after-hydrate-[attrName]
                callHook(node, slugify(AFTER, HYDRATE, name), [vnode, name, value]);

                // Break the directives loop if the directive has no modifiers
                // This is because directives with no modifiers are unique and no further processing is needed after hydrating them
                if (isDirective == 1) break;
            }
        }
        // Break the attributes loop if the vnode was marked as SKIP
        // This will prevent the walk callback from hydrating the rest of the directives or the children elements
        if (vnode[STATUS] == SKIP) break;
    }

    // Remove the vnode if no attributes were hydrated
    if (!size(vnode[ATTR])) vnodes[DELETE](node);

    // Continue the walk callback to
    return vnode[STATUS] != SKIP;
}

// Save the cleanup function to the vnode
export let saveCleanup = (vnode: VNode, cleanupFn: FunctionType) => {
    arrayAdd(vnode[CLEANUP], cleanupFn);
}

/** Get an attribute object. Create one if it doesn't exist. */
export let attr = (vnode: VNode, attrName: string, attrValue: string = '') => {
    if (!vnode[ATTR][attrName]) vnode[ATTR][attrName] = {
        [VALUE]: attrValue || ''
    };
    return vnode[ATTR][attrName];
}

/** Saves the attribute to the vnode and removes it from the node */
export let saveAttr = (vnode: VNode, attrName: string, attrValue: string) => {
    // Save the attribute to the vnode
    attr(vnode, attrName, attrValue);
    // Remove the attribute from the node
    if (isElementNode(vnode.$el)) delAttr(vnode.$el, attrName);
}

// Save the vnode to the vnodes map
export let saveVNode = (vnode: VNode) => {
    if (!vnodes.has(vnode.$el)) vnodes.set(vnode.$el, vnode);
}

// Find top level context nodes
export let getTopLevelContext = (attrName: string) => {
    let $props: HTMLElement[] = [];
    // Query only top level nodes
    each(q(`[${attrName}]:not([${attrName}] [${attrName}])`) as any, (el) => {
        if (getAttr(el as HTMLElement, attrName)) {
            arrayAdd($props, el as HTMLElement)
        }
    });
    return $props
}

/**
 * Sanitize an attribute value by removing new lines and extra spaces and comments.
 * This is necessary to properly evaluate certain expressions.
 * Without this, the evaluate function may throw an error for some expressions.
 */
export let sanitizeAttrValue = (text: string) => join(split(text, '\n').map(line => startsWith(trim(line), '//') ? '' : trim(line)), '');

/** Match template literal ${} */
export let templateRegex = /\${((?!.*\${).*?)}/;

/** Match mustache syntax {{}} */
export let mustacheRegex = /{{((?!.*{{).*?)}}/;

/** Replace mustache syntax with template literals */
export let replaceMustache = (text: string) => {

    while (test(text, mustacheRegex)) {
        text = text.replace(mustacheRegex, '${$1}');
    }

    return text;
};

/**
 * Initializes Brio and effectively prevents further programmatic addition of:
 * - directives
 * - methods
 * - transition engines
 * - components
 * - props
 * - and stores
 */
export let init = () => {

    // If Brio is not initialized
    if (!_settings[INIT]) {

        // Listen to storage events
        listen(W as any, 'storage', storageEvent as any);

        // Mark Brio as initialized
        _settings[INIT] = true;
    }
};

export let tools: HydrationTools = {
    vnodes,
    wrapper,
    hydrate,
    dehydrate,
    saveCleanup,

    newVNode,
    saveVNode,

    attr,
    saveAttr,

    setHook,
    callHook,

    evaluate,
};