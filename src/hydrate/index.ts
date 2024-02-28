import type { ObjectType, VNodes, VNode } from "..";

import { evaluate } from "../evaluate";
import { state, effect } from "../reactivity";
import { has } from "../tools";
import { inArray } from "../tools/array";
import { q, walk, getAttr, delAttr, getParent } from "../tools/dom";
import { toNumber } from "../tools/number";
import { getKeys } from "../tools/object";
import { capitalize, trim } from "../tools/string";
import { isFunction, isObject, isTextNode, isElementNode } from "../tools/typeCheck";
import { NUMBER, TEXT, EACH, PROPS, INIT, OBJECT, FUNCTION } from "../tools/constants";

import {
    hydrateBind,
    hydrateEach,
    hydrateHtml,
    hydrateIf,
    hydrateModel,
    hydrateProps,
    hydrateOn,
    hydrateShow,
    hydrateText,
    hydrateInit,
    hydrateEffect,
    hydrateTeleport,
    hydrateUid
} from "../directives";

// Raw values are evaluated only once in production mode, but are evaluated every time they are updated in development mode
export const vnodes : VNodes = new Map();
export const store: ObjectType = state({});
export const uids: ObjectType = {};
export let currentNode: ObjectType = {};
export const internal: ObjectType = {
    init: false,
    props: {},
    each: null,
};
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
        if (vnode) return vnode;
        _el = getParent(_el);
    }
    return null;
}

export let hydrate = (nodes?: Node[]) => {
    // Find all top level scope nodes
    if (!nodes) nodes = getTopLevelContext(PROPS);
    for (let topNode of nodes) {
        // Recursively hydrate the nodes
        walk(topNode, (node: Node) => {
            let result = false;
            if (isTextNode(node) && trim(node.textContent || '')) {
                result = hydrateTextNode(node as Text);
            }
            else if (isElementNode(node)) {
                result = hydrateElement(node as HTMLElement);
            }
            return result;
        });
    }
}

// Remove all the effects and the raw object from the node and its children
export let dehydrate = (node: Node, removeVNode = true) => {

    // Dehydrate the node and its children
    walk(node, (n) => {
        let vnode = vnodes.get(n);

        // Remove the effects
        if (vnode) {
            let effect = vnode.effect;
            for (let key in effect) {
                // Call the cleanup function
                effect[key]();
            }
            // Remove the context
            if (removeVNode) {
                vnodes.delete(n);
            }
        }

        return true;
    });
}

// // Restore the original state of the node.
// // Note: `dehydrate` must be called before `restore` to remove the effects.
// export let restore = (node: Node) => {

//     walk(node, true, (n, ctx) => {
//         let nid = (n as any).vNodeID;

//         // Add the raw attributes back to the node
//         if (nid in raw) {
//             // Restore the original text content
//             if (isTextNode(n)) {
//                 n.textContent = raw[nid].attrs.text;
//             }
//             else {
//                 let rawNode = raw[nid] as any;
//                 // Restore the original attributes
//                 [PROPS, 'if', 'show', 'each', 'ref', 'html', TEXT].forEach((prop) => {
//                     if (prop in rawNode) {
//                         setAttr(n as HTMLElement, prop, rawNode[prop]);
//                     }
//                 });
//                 // Restore the original special attributes
//                 ['model', 'bind', 'on'].forEach((prop) => {
//                     if (prop in rawNode) {
//                         for (let {attrName, attrValue} of rawNode[prop]) {
//                             // These attributes are set differently
//                             if (inArray(['value','checked','style','class'], attrName)) {
//                                 (n as any)[attrName == 'class' ? 'className' : attrName] = attrValue;
//                             }
//                             // Set the attribute
//                             setAttr(n as HTMLElement, attrName, attrValue);
//                             // Bind may leave a property behind, remove it
//                             if (prop == 'bind') {
//                                 delAttr(n as HTMLElement, attrName.split('-')[1]);
//                             }
//                         }
//                     }
//                 });
//             }
//             // Remove the raw object
//             delete raw[nid];
//         }

//         return ctx;
//     });
// }

export let newVNode = ($el: HTMLElement): VNode => ({
    // Magic attributes
    $el,
    $refs: {},
    $props: {},
    $root: $el,

    // UIDs
    uid: {},
    // Raw attributes
    attr: {},

    // Reactivity effects
    effect: {},
});

let hydrateTextNode = (node: Text) => {
    // * Empty text nodes are ignored by the walk callback

    let TEXT_CONTENT = `${TEXT}Content`;
    let text = (node as any)[TEXT_CONTENT];

    if (text && has(text, '${') && has(text, '}')) {

        let vnode = newVNode(node as any);
        let parent = closestVNode(node) || vnode;

        // Evaluate the expression
        let fn = evaluate({...parent, $el: vnode.$el}, `()=>$el.${TEXT_CONTENT}=\`${text}\``);

        // Save effect
        saveEffect(vnode, TEXT, fn);

        // Save attribute
        saveAttr(vnode, TEXT, text);

        // Save the vnode
        saveVNode(vnode);
    }

    return false;
}

let hydrateElement = (node: HTMLElement) => {

    let vnode = newVNode(node);
    let parent = closestVNode(node);

    // By default, the $root is the element itself
    if (parent) vnode.$root = parent.$el;

    // Hydrate each
    let each = getAttr(node, EACH);
    if (each) {
        hydrateEach(vnode, parent, EACH, each);
        return false;
    }

    // Hydrate props scope, if any
    hydrateProps(vnode, parent);

    // Hydrate init
    let init = getAttr(node, INIT);
    if (init) hydrateInit(vnode, INIT, init);

    // Hydrate uid scope, if any
    hydrateUid(vnode, parent);

    // Hydrate props
    for (let { name, value } of [...node.attributes]) {

        // Trim the prop value
        value = trim(value);

        // Hydrate event listener on="{click:()=>count++}", listen on-click="count++"
        if (name.startsWith('on-')) {
            hydrateOn(vnode, name, value)
        }

        // Hydrate bind prop bind value="prop", bind="['value']" value="prop + 'text'"
        else if (name.startsWith('bind-')) {
            hydrateBind(vnode, name, value)
        }

        // Hydrate model prop
        else if (name.startsWith('model')) {
            hydrateModel(vnode, name, value)
        }

        // Hydrate if prop
        else if (name == 'if') {
            hydrateIf(vnode, name, value)
        }

        // Hydrate show prop
        else if (name == 'show') {
            hydrateShow(vnode, name, value)
        }

        // Hydrate html prop
        else if (name == 'html') {
            hydrateHtml(vnode, name, value)
        }

        // Hydrate text prop
        else if (name == TEXT) {
            hydrateText(vnode, name, value)
        }

        // Hydrate effect prop
        else if (name == 'effect') {
            hydrateEffect(vnode, name, value)
        }

        // Hydrate teleport prop
        else if (name == 'teleport') {
            hydrateTeleport(vnode, name, value)
        }
    }

    // Check if any changes were made to the vnode
    if (getKeys(vnode.attr).length) {
        // Save the vnode
        saveVNode(vnode);
    }

    return true;
}

// Create a effect from a function and save it to the vnode
export let saveEffect = (vnode: VNode, effectName: string, fn: (...args: any) => any) => {
    vnode.effect[effectName] = effect(fn);
}

/** Saves the attribute to the vnode and removes it from the node */
export let saveAttr = (vnode: VNode, attr: string, value: string) => {
    vnode.attr[attr] = value;
    if (isElementNode(vnode.$el)) delAttr(vnode.$el as HTMLElement, attr);
}

// Save the vnode to the vnodes map
export let saveVNode = (vnode: VNode) => {
    vnodes.set(vnode.$el, vnode);
}

export let modelValue = (value: any, modifiers: string[]) => {
    if (inArray(modifiers, 'trim')) value = trim(value);
    if (inArray(modifiers, NUMBER)) value = toNumber(value);
    return value;
}

export let getPropName = (exp: string) => trim(exp).split(/[\[\].]+/)?.[0];

type GetPropRef = [
    (() => any) | null, 
    ((value: any) => void) | null
];

/**
 * Gets the reference to a prop. 
 * It returns a getter and a setter if the prop is in $props, only a getter if the prop is a function, or null if the prop is not in $props.
 * @return [getter | null, setter | null]
 */
export let getPropRef = (vnode: VNode, propExp: string): GetPropRef => {

    propExp = trim(propExp);

    let isPropOrStore = /^\$(props|store)\.?/.test(propExp);

    let propRef: GetPropRef = [null, null];

    // Get the prop name
    let propName = getPropName(propExp);

    // Check if the prop is invalid
    if (!isPropOrStore && !(propName in store) && !(propName in vnode.$props)) return propRef;

    // Evaluate the expression
    let value = evaluate(vnode, propExp);

    // Check if value is a function. Getter only
    if (isFunction(value)) return [value, null];

    // Getter and setter
    let exp = `[()=>${propExp},v=>${propExp}=v]`;

    // Return the getter and setter
    return evaluate(vnode, exp);
}

export let getPropOrExp = (vnode: VNode, prop: string, exp?: string) => {
    let {$props} = vnode;
    return (prop in $props)
        ? $props[prop]
        : evaluate(vnode, exp || prop);
}

// Find top level context nodes
export let getTopLevelContext = (attrName: string) => {
    let $props: HTMLElement[] = []
    // Only add top level context nodes
    q(`[${attrName}]:not([${attrName}] [${attrName}])`).forEach((el) => {
        if (getAttr(el as HTMLElement, attrName)) {
            $props.push(el as HTMLElement)
        }
    })
    return $props
}


export let props = (propsName: string, fn: any) => {
    let PROPS_CAP = capitalize(PROPS);
    if (internal.init) throw new Error(`${PROPS_CAP} must be defined before initialization.`);
    if (!isFunction(fn)) throw new Error(`${PROPS_CAP} must be a ${FUNCTION}.`);
    if (!isObject(fn())) throw new Error(`${PROPS_CAP} must return an ${OBJECT}.`);
    internal.props[propsName] = fn;
}