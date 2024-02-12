import type {
    RawObject, EffectObject, ScopeObject,
    RawText, RawElement, RawElementProps
} from "./index.d";

import { observe, computed, dispose } from "../reactive";

import {
    uid, toNumber,
    isFn, isNumeric, inArray,
    walk, q, getAttr, getType,
} from "../tools";

import {
    hydrateBind,
    hydrateEach,
    hydrateIf,
    hydrateModel,
    hydrateScope,
    hydrateOn,
    hydrateShow,
} from "./directives";

import { evaluate } from "./evaluate";
import { interpolate } from "./interpolate";

// Raw values are evaluated only once in production mode, but are evaluated every time they are updated in development mode
export const raw : RawObject = observe({});
export const scope: ScopeObject = observe({});
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
export const effect: EffectObject = {};

export function newID() {
    return uid(6, (id) => !isNumeric(id[0]) && !(id in raw))
}

export function hydrate(nodes?: Node[], context: any = null) {
    // Find all top level scope nodes
    if (!nodes) nodes = getTopLevelScopes();
    for (const topNode of nodes) {
        // TODO: Recursively hydrate the nodes
        walk(topNode, context, (node, context) => {
            if (node instanceof Text) {
                return hydrateText(node, context);
            }
            else if (node instanceof HTMLElement) {
                return hydrateElement(node, context);
            }
            return context;
        });
    }
}

function newRawNode(node: Node, parent: RawElement | null) {
    const id = (node as any).rawNodeID || newID();
    (node as any).rawNodeID = id;
    return {
        id,
        node,
        scopes: [...(parent?.scopes || [])],
    }
}

function hydrateText(node: Text, parent: RawElement | null) {
    // * Empty text nodes are ignored by the walk function

    const rawNode = newRawNode(node, parent) as RawText;

    const text = node.textContent || '';
    if (!text) return;

    const { usedProps, output } = interpolate(text, rawNode.scopes, { wrap: true });

    // Evaluate the expression
    const fn = evaluate(scope, `()=>$el.textContent=\`${output}\``, node);

    // Add the rawNode to the raw object
    watch(rawNode.id, 'text', fn, usedProps);

    raw[rawNode.id] = rawNode;

    return parent;
}

export function hydrateElement(node: HTMLElement, parent: any) {

    const rawNode = newRawNode(node, parent) as RawElement;

    // Hydrate scope, if any
    hydrateScope(rawNode);
    
    // Hydrate props
    for (let { name, value } of [...node.attributes]) {
        // Skip scope prop
        if (inArray(['scope','ref'], name)) continue;

        // Trim the prop value
        value = value.trim();

        // Hydrate event listener
        if (name.startsWith('on-')) {
            hydrateOn(rawNode, name, value)
        }

        // Hydrate bind prop
        else if (name.startsWith('bind-')) {
            hydrateBind(rawNode, name, value)
        }

        // Hydrate model prop
        else if (name.startsWith('model')) {
            hydrateModel(rawNode, name, value)
        }

        // Hydrate if prop
        else if (name == 'if') {
            hydrateIf(rawNode, name, value)
        }

        // Hydrate show prop
        else if (name == 'show') {
            hydrateShow(rawNode, name, value)
        }

        // TODO: each prop
        else if (name == 'each') {
            hydrateEach(rawNode, name, value)
        }

        // TODO: html prop
        else if (name == 'html') {
            // htmlProp(vNode, name, value)
        }

        // TODO: text prop
        else if (name == 'text') {
            // textProp(vNode, name, value)
        }
    }

    // Add the rawNode to the raw object
    raw[rawNode.id] = rawNode

    if (Object.keys(rawNode).length == 3) return parent;
    return rawNode;
}

export function modelValue(value: any, modifiers: string[]) {
    if (inArray(modifiers, 'trim')) value = value.trim();
    if (inArray(modifiers, 'number')) value = toNumber(value);
    return value;
}

export function rawNodeProp(rawNode: RawElement, prop: RawElementProps, value: any) {
    if (!rawNode[prop]) rawNode[prop] = [];
    rawNode[prop] = value;
}

export function getPropName(exp: string) {
    // Get the direct name of the prop
    const name = exp.trim().split(/[\s[.]/)[0];
    // Check if the name is valid (starts with a letter, $, or _ and contains only letters, numbers, $, and _)
    return /^([a-zA-Z_$][\w$]*)$/.test(name)
        // Return the name if valid
        ? name
        // Return null if invalid
        : null;
}

type GetPropRef = [
    (() => any) | null, 
    ((value: any) => void) | null
];

export function getPropRefError(prop: string) {
    return `The variable ${prop} does not exist in the scope.`;
}

export function getPropRef(rawNode: RawElement | RawText, propExp: string): GetPropRef {

    const propRef: GetPropRef = [null, null];

    // Get the prop name
    const propName = getPropName(propExp);

    // Check if the prop name is valid
    if (!propName) return propRef;

    const { scopes, node } = rawNode;

    // Check if the prop is in scope
    if (!inScope(scopes, propName)) return propRef;

    // Interpolate the expression
    const { output } = interpolate(propExp, scopes, { wrap: true });

    // Evaluate the interpolated expression
    const value = evaluate(scope, output, node);

    // Check if value is a function. Getter only
    if (isFn(value)) return [value, null];

    // Getter and setter
    const exp = `[()=>${output},v=>${output}=v]`;

    // Return the getter and setter
    return evaluate(scope, exp, node);
}

type WatchPropOptions = {
    wrap?: boolean,
    runFunction?: boolean
};

export function watchProp(rawNode: RawElement | RawText, propName: string, callback: (value: any) => void, options: WatchPropOptions = {}) {
    const { wrap = true, runFunction = true } = options;
    const { scopes, node } = rawNode;

    // Interpolate the value
    const { output } = interpolate(propName, scopes, { wrap });

    // Get the scope where the prop is defined, if any
    const sid = inScope(scopes, propName);

    // The function to run when the prop changes
    return () => {
        let value: any;

        // Get the value from the scope
        if (sid) value = scope[sid][propName];

        // Evaluate the expression
        else value = evaluate(scope, output, node);

        // Run the function if the value is a function
        if (runFunction && isFn(value)) value = value();

        // Notify the callback every time the value changes
        callback(value);
    }

}

export function watch(id: string, prop: string, fn: (...args: any) => any, isComputed = true, autoRun = true) {
    // Create the effect object if it doesn't exist
    if (!effect[id]) effect[id] = {};
    // Set the cleanup function
    let cleanup: any;
    if (isComputed) {
        const c = computed(fn, { autoRun });
        cleanup = () => dispose(c);
    }
    else cleanup = fn;
    // Add the cleanup function to the effect object
    effect[id][prop] = cleanup;
}

// Check if value matches a prop in the scope
export function inScope(scopes: string[], prop: string) {
    return scopes.find(id => prop in scope[id]);
}

// Find top level scopes
export function getTopLevelScopes(attr = 'scope') {
    const scopes: HTMLElement[] = []
    // Only add top level scopes
    q(`[${attr}]:not([${attr}] [${attr}])`).forEach((el) => {
        if (getAttr(el as HTMLElement, attr)) {
            scopes.push(el as HTMLElement)
        }
    })
    return scopes
}