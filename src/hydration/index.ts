import { evaluate } from "../evaluation";
import { effect } from "../reactivity";
import { has, size, uid } from "../tools";
import { arrayAdd, each } from "../tools/array";
import { q, walk, getAttr, delAttr, getParent, setAttr } from "../tools/dom";
import { toNumber } from "../tools/number";
import { startsWith, trim } from "../tools/string";
import { isTextNode, isElementNode } from "../tools/typeCheck";
import { NUMBER, TEXT, $PROPS, $EL, $ROOT, EFFECT, $REFS, TEXT_CONTENT, ATTR } from "../tools/constants";
import { _directives } from "../directives";

// Raw values are evaluated only once in production mode, but are evaluated every time they are updated in development mode
export const vnodes : VNodes = new Map();
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

export let closestVNode = (node: Node) => {
    let _el = isElementNode(node) ? node : getParent(node);
    while (_el) {
        let vnode = vnodes.get(_el);
        // Return the vnode if it has props
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
            else if (isElementNode(node)) {
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
            for (let key in vnode[EFFECT]) {
                // Call the cleanup function
                vnode[EFFECT][key]();
            }
            // Remove the context
            if (removeVNode) {
                vnodes.delete(n);
            }
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
                n[TEXT_CONTENT] = vnode[ATTR][TEXT];
            }
            else {
                for (let key in vnode[ATTR]) {
                    // Set the attribute
                    setAttr(n as HTMLElement, key, vnode[ATTR][key]);

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
export let newVNode = ($el: HTMLElement): VNode => {

    let vnode: any = vnodes.get($el);

    // Get the existing vnode
    if (!vnode) {
        // Get the parent vnode, if any
        let parent = closestVNode($el);

        vnode = {
            // Magic attributes: $el, $root, $refs, $props
            [$EL]: $el,

            // The closest element with a `props` attribute, or the element itself
            [$ROOT]: parent ? parent[$EL] : $el,

            // Raw attributes
            [ATTR]: {},

            // Reactivity effects
            [EFFECT]: {},
        }

        each([$REFS, $PROPS, 'uid'], key => {
            vnode[key] = parent ? parent[key as keyof VNode] : {};
        });
    }

    // Create a new vnode
    return vnode;
}

export let hydrateTextNode = (node: Text) => {
    // * Empty text nodes are ignored by the walk callback

    let text = (node as any)[TEXT_CONTENT];

    if (text && has(text, '${') && has(text, '}')) {

        let vnode = newVNode(node as any);

        // Evaluate the expression
        let fn = evaluate(vnode, `()=>${$EL}.${TEXT_CONTENT}=\`${text}\``);

        // Save effect
        saveEffect(vnode, fn, false);

        // Save attribute
        saveAttr(vnode, TEXT, text);

        // Save the vnode
        saveVNode(vnode);
    }

    return false;
}

export let hydrateElementNode = (node: HTMLElement) => {

    // Get the vnode or create a new one
    let vnode = newVNode(node);

    for (let [validateDirective, hydrateDirective] of _directives) {
        // Check if the attribute is a directive
        let attr = validateDirective(vnode);
        if (attr) {
            let [name, value] = attr;
            // Hydrate the directive
            if (hydrateDirective(vnode, name, trim(value)) === false)
                // Return false to stop the walk callback from hydrating the rest of the directives or the children
                return false;
        }
    }

    // Check if any changes were made to the vnode
    if (size(vnode[ATTR])) {
        // Save the vnode
        saveVNode(vnode);
    }

    return true;
}

// Create a effect from a function and save it to the vnode
export let saveEffect = (vnode: VNode, fn: (...args: any) => any, isCleanup = true) => {
    vnode[EFFECT][uid()] = isCleanup ? fn : effect(fn);
}

/** Saves the attribute to the vnode and removes it from the node */
export let saveAttr = (vnode: VNode, attrName: string, attrValue: string) => {
    vnode[ATTR][attrName] = attrValue;
    if (isElementNode(vnode[$EL])) delAttr(vnode[$EL], attrName);
}

// Save the vnode to the vnodes map
export let saveVNode = (vnode: VNode) => {
    vnodes.set(vnode[$EL], vnode);
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


// export let hydrationTools: ObjectType = {
//     hydrate,
//     dehydrate,
//     hydrateTextNode,
//     hydrateElementNode,

//     saveAttr,
//     saveEffect,
//     saveVNode,
//     newVNode,
//     closestVNode,

//     evaluate,
//     ref,
//     getRefOrEvaluate,
// };