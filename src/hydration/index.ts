import { evaluate, makeFunction } from "../evaluation";
import { effect } from "../reactivity";
import { has, size } from "../tools";
import { arrayAdd, each, join } from "../tools/array";
import { q, walk, getAttr, delAttr, getParent, setAttr } from "../tools/dom";
import { toNumber } from "../tools/number";
import { isStringFunction, split, startsWith, test, trim } from "../tools/string";
import { isTextNode, isElementNode } from "../tools/typeCheck";
import { NUMBER, TEXT, $PROPS, $ROOT, $REFS, TEXT_CONTENT, ATTR, CLEANUP, VALUE, STATUS, SKIP, BEFORE, AFTER, ATTRIBUTE } from "../tools/constants";
import { _directives } from "../directives";

// Raw values are evaluated only once in production mode, but are evaluated every time they are updated in development mode
export const vnodes : VNodes = new Map();
export let vnodesQueue: Map<Node, ObjectType> = new Map();
export let currentNode: ObjectType = {};

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
    callback: (node: HTMLElement) => Interceptor
) => {

    // Create an interceptor
    // The interceptor runner is a function that executes the `before`, `directive`, and `after` interceptor functions in sequence by calling a `next` function.
    let runner = interceptor(vnode, attrName, callback(vnode.$el));

    // The context. Which most likely refers to reactive properties.
    let [ctx] = evaluate(vnode, attrValue);

    // Get the dependencies, if any
    let deps = attr(vnode, attrName).deps;

    // Create a new effect, and save the cleanup function.
    // This sets up the reactivity.
    saveCleanup(vnode, effect(
        () => runner(deps ? ctx : ctx()),
        deps
    ));
}

export let closestVNode = (node: Node) => {
    let _el = isElementNode(node) ? node : getParent(node);
    while (_el) {
        let vnode = vnodes.get(_el);
        // Return the vnode if it has attributes
        if (vnode && size(vnode[ATTR])) return vnode;
        _el = getParent(_el);
    }
}

export let hydrate = (nodes?: Node[]) => {
    // Get all the nodes if none are provided
    if (!nodes) nodes = [document.body];

    // Hydrate the nodes
    for (let _node of nodes) {
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
            if (removeVNode) vnodes.delete(n);
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
            // Magic attributes: $el, $root, $refs, $props
            $el, // the element itself
            [$ROOT]: $el, // The closest element with a `props` attribute, or the element itself
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

    // Hydration status
    vnode[STATUS] = status; /*
    ok: the element is about to be hydrated or has been hydrated
    temp: the element will be hydrated later
    skip: skips the hydration process
*/

    // Update context data
    if (status == 'ok') {
        // Get the parent vnode, if any
        let parent = closestVNode($el);

        if (parent) {
            vnode[$ROOT] = parent.$el;

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

        // Evaluate the expression
        let [call] = evaluate(vnode, `$el.${TEXT_CONTENT}=\`${sanitizedText}\``, '', true);

        // Save the cleanup function
        saveCleanup(vnode, effect(call));

        // Save attribute
        saveAttr(vnode, TEXT, text);
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

                // Hydrate the directive
                hydrateDirective(vnode, name, sanitizeAttrValue(value), tools);

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
    if (!size(vnode[ATTR])) vnodes.delete(node);

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
        [VALUE]: attrValue || '',
        [BEFORE]: [],
        [AFTER]: [],
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

export let saveInterceptor = (vnode: VNode, attrName: string, interceptorType: 'before'|'after', fn: Interceptor) => {
    arrayAdd(attr(vnode, attrName)[interceptorType], fn);
}

// Save the vnode to the vnodes map
export let saveVNode = (vnode: VNode) => {
    if (!vnodes.has(vnode.$el)) vnodes.set(vnode.$el, vnode);
}

export let modelValue = (value: any, modifiers: string[]) => {
    if (has(modifiers, 'trim')) value = trim(value);
    if (has(modifiers, NUMBER)) value = toNumber(value);
    return value;
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

/** Hydrate the interceptor functions of a directive */
let hydrateInterceptor = (vnode: VNode, attrName: string, interceptorType: 'before'|'after') => {
    let $el = vnode.$el;
    let attrCycle = interceptorType + '-' + attrName;

    // Get the attribute value
    let attrValue = getAttr($el, attrCycle);

    // Evaluate the attribute value, if any
    if (attrValue) {
        let fn = evaluate(vnode, attrValue, '$ctx,$next,$remove', true)[0];
        saveInterceptor(vnode, attrName, interceptorType, fn);
        delAttr($el, attrCycle);
    }

    // Get queued interceptor functions
    let qVnode = vnodesQueue.get($el);

    if (qVnode && qVnode[ATTR][attrName]) {
        each(qVnode[ATTR][attrName][interceptorType], fn => {
            saveInterceptor(vnode, attrName, interceptorType, fn);
        });
    }
}

/** Set the interceptor functions (before and after) of a directive, as well as the dependencies, and return the interceptor runner */
export let interceptor = (vnode: VNode, attrName: string, directiveFn: Interceptor) => {

    let $el = vnode.$el;
    let _attr = attr(vnode, attrName);

    // * Hydrate the interceptor functions, if any
    hydrateInterceptor(vnode, attrName, BEFORE);
    hydrateInterceptor(vnode, attrName, AFTER);

    // * Hydrate the dependencies, if any
    let attrDeps = attrName + '-deps';
    // Get attribute value
    let depsValue = getAttr($el, attrDeps);
    // Evaluate the attribute value, if any
    if (depsValue) {
        // If the value is not a function, make it a function
        if (!isStringFunction(depsValue)) depsValue = makeFunction(depsValue, '', true);
        // Evaluate and save the dependencies
        _attr.deps = evaluate(vnode, depsValue, '', true)[0];
        // Delete the attribute from the node
        delAttr($el, attrDeps);
    }

    // Execute the interceptor functions
    let runner = (context: any, index: number = 0) => {

        let interceptorFns = [..._attr[BEFORE], directiveFn, ..._attr[AFTER]];

        // Execute the interceptor functions in sequence
        if (index < size(interceptorFns)) {
            interceptorFns[index](
                // * $ctx: the context contains the data that is passed to the interceptor function. It can be modified if it is an object.
                context,
                // * $next(): go to the next interceptor function.
                (stop: boolean = false) => {
                    if (!stop) runner(context, index + 1);
                },
                // * $remove(): remove the interceptor function.
                () => {
                    // Ignore the directive function
                    if (interceptorFns[index] == directiveFn) return;

                    // The size of the `before` array
                    let beforeSize = size(_attr[BEFORE]);

                    // Remove the interceptor function
                    if (index < beforeSize) _attr[BEFORE].splice(index, 1);
                    else _attr[AFTER].splice(index - beforeSize - 1, 1);
                }
            );
        }
    }

    // Return the interceptor runner
    return runner;
}

/**
 * Sanitize an attribute value by removing new lines and extra spaces. 
 * This is necessary to properly evaluate certain expressions.
 * Without this, the evaluate function may throw an error for some expressions.
 */
export let sanitizeAttrValue = (text: string) => join(split(text, '\n').map(trim), '');

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

    interceptor,
    saveInterceptor,

    evaluate,
};