import type {
    RawObject, EffectObject, ScopeObject,
    RawText, RawElement, ObjectType
} from "./index.d";

import { observe, computed, dispose } from "../reactive";

import {
    uid, toNumber,
    isFunction, isNumeric, inArray,
    walk, walkControl, q, getAttr, has, trim, setAttr, delAttr, isTextNode, isElementNode,
    NUMBER, TEXT, EACH, PROPS, INIT, emit, isObject, isArray
} from "../tools";

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
} from "./directives";

import { evaluate } from "./evaluate";

// Raw values are evaluated only once in production mode, but are evaluated every time they are updated in development mode
export const raw : RawObject = {};
export const stores: ObjectType = {};
export const internal: ObjectType = {
    rawNode: null,
    props: null,

    init: false,
};
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

export const newID = () => {
    return uid(6, (id) => !isNumeric(id[0]) && !(id in raw))
}

export const hydrate = (nodes?: Node[], parent: any = null) => {
    // Find all top level scope nodes
    if (!nodes) nodes = getTopLevelContext(PROPS);
    for (const topNode of nodes) {
        // Recursively hydrate the nodes
        walk(topNode, parent, (node, parent) => {
            if (isTextNode(node)) {
                return hydrateTextNode(node as Text, parent);
            }
            else if (isElementNode(node)) {
                return hydrateElement(node as HTMLElement, parent);
            }
            return parent;
        });
    }
}

// Remove all the effects and the raw object from the node and its children
export const dehydrate = (node: Node, removeRawNode = true) => {
    // Dehydrate the node and its children
    walk(node, true, (n, ctx) => {
        const nid = (n as any).vNodeID;

        // Remove the effects
        if (nid in effect) {
            for (const key in effect[nid]) {
                // Call the cleanup function
                effect[nid][key]();
            }
            // Remove the effect object
            delete effect[nid];
        }

        // Remove the context
        if (removeRawNode && nid in raw) {
            delete raw[nid];
        }

        return ctx;
    });
}

// Restore the original state of the node.
// Note: `dehydrate` must be called before `restore` to remove the effects.
export const restore = (node: Node) => {

    walk(node, true, (n, ctx) => {
        const nid = (n as any).vNodeID;

        // Add the raw attributes back to the node
        if (nid in raw) {
            // Restore the original text content
            if (isTextNode(n)) {
                n.textContent = raw[nid].attrs.text;
            }
            else {
                const rawNode = raw[nid] as any;
                // Restore the original attributes
                [PROPS, 'if', 'show', 'each', 'ref', 'html', TEXT].forEach((prop) => {
                    if (prop in rawNode) {
                        setAttr(n as HTMLElement, prop, rawNode[prop]);
                    }
                });
                // Restore the original special attributes
                ['model', 'bind', 'on'].forEach((prop) => {
                    if (prop in rawNode) {
                        for (let {attrName, attrValue} of rawNode[prop]) {
                            // These attributes are set differently
                            if (inArray(['value','checked','style','class'], attrName)) {
                                (n as any)[attrName == 'class' ? 'className' : attrName] = attrValue;
                            }
                            // Set the attribute
                            setAttr(n as HTMLElement, attrName, attrValue);
                            // Bind may leave a property behind, remove it
                            if (prop == 'bind') {
                                delAttr(n as HTMLElement, attrName.split('-')[1]);
                            }
                        }
                    }
                });
            }
            // Remove the raw object
            delete raw[nid];
        }

        return ctx;
    });
}

export const newRawNode = ($el: Node) => {
    const id = ($el as any).vNodeID || newID();
    ($el as any).vNodeID = id;

    let vNode: ObjectType = {
        id,
        // Magic attributes
        $el,
        // Raw attributes
        attrs: {},
    };

    if (isElementNode($el)) {
        vNode = {
            ...vNode,
            // Magic attributes
            $refs: {},
            $props: {},
            uids: {},
            $uid: (scopeName: string) => {
                // TODO: create a function that returns the scope name plus a unique id
                return `${scopeName}-SOME_UNIQUE_ID`;
            },
            // Magic methods
            $emit: (eventName: string, eventData?: any) => {
                emit($el as HTMLElement, eventName, eventData);
            }
        };
    }

    return vNode;
}

const hydrateTextNode = (node: Text, parent: RawElement | null) => {
    // * Empty text nodes are ignored by the walk function

    const rawNode = newRawNode(node) as RawText;

    const TEXT_CONTENT = `${TEXT}Content`;

    const text = node[TEXT_CONTENT] || '';
    if (!text || !(has(text, '${') && has(text, '}'))) return parent;

    // Evaluate the expression
    const fn = evaluate(parent || rawNode, `()=>$el.${TEXT_CONTENT}=\`${text}\``);

    // Add the rawNode to the raw object
    watch(rawNode.id, TEXT, fn);

    // Add the text to the rawNode
    saveProp(rawNode as any, TEXT, text);

    raw[rawNode.id] = rawNode;

    return parent;
}

export const hydrateElement = (node: HTMLElement, parent: RawElement | null) => {

    const rawNode = newRawNode(node) as RawElement;

    // Hydrate props scope, if any
    hydrateProps(rawNode, parent);

    // Hydrate uid scope, if any
    hydrateUid(rawNode, parent);

    // Hydrate init
    const init = getAttr(node, INIT);
    if (init) {
        hydrateInit(rawNode, INIT, init);
    }

    // Hydrate each
    const props = getAttr(node, EACH);
    if (props) {
        hydrateEach(rawNode, EACH, props)
        walkControl.skip = true;
        return parent;
    }

    // Hydrate props
    for (let { name, value } of [...node.attributes]) {

        // Trim the prop value
        value = trim(value);

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

        // Hydrate html prop
        else if (name == 'html') {
            hydrateHtml(rawNode, name, value)
        }

        // Hydrate text prop
        else if (name == TEXT) {
            hydrateText(rawNode, name, value)
        }

        // Hydrate effect prop
        else if (name == 'effect') {
            hydrateEffect(rawNode, name, value)
        }

        // Hydrate teleport prop
        else if (name == 'teleport') {
            hydrateTeleport(rawNode, name, value)
        }
    }

    // Check if any changes were made to the rawNode
    if (rawNode.attrs.length) return parent;

    // Add the rawNode to the raw object
    raw[rawNode.id] = rawNode;

    return rawNode;
}

export const modelValue = (value: any, modifiers: string[]) => {
    if (inArray(modifiers, 'trim')) value = trim(value);
    if (inArray(modifiers, NUMBER)) value = toNumber(value);
    return value;
}

export const saveProp = (rawNode: RawElement, prop: string, value: string) => {
    rawNode.attrs[prop] = value;
}

export const getPropName = (exp: string) => {
    // Get the direct name of the prop
    const name = trim(exp).split(/[\s[.]/)[0];
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

/**
 * Gets the reference to a prop. 
 * It returns a getter and a setter if the prop is in $props, only a getter if the prop is a function, or null if the prop is not in $props.
 * @return [getter | null, setter | null]
 */
export const getPropRef = (rawNode: RawElement, propExp: string): GetPropRef => {

    const propRef: GetPropRef = [null, null];

    // Get the prop name
    const propName = getPropName(propExp);

    // Check if the prop name is valid
    if (!propName) return propRef;

    const {$props} = rawNode;

    // Check if the prop is in the $props
    if (!(propName in $props)) return propRef;

    // Evaluate the expression
    const value = evaluate(rawNode, propExp);

    // Check if value is a function. Getter only
    if (isFunction(value)) return [value, null];

    // Getter and setter
    const exp = `[()=>${propExp},v=>${propExp}=v]`;

    // Return the getter and setter
    return evaluate(rawNode, exp);
}

export const getPropOrExp = (rawNode: RawElement, prop: string, exp?: string) => {
    const {$props} = rawNode;
    return (prop in $props)
        ? $props[prop]
        : evaluate(rawNode, exp || prop);
}

export const watch = (id: string, prop: string, fn: (...args: any) => any, isComputed = true, autoRun = true) => {
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

// Find top level context nodes
export const getTopLevelContext = (attrName: string) => {
    const $props: HTMLElement[] = []
    // Only add top level context nodes
    q(`[${attrName}]:not([${attrName}] [${attrName}])`).forEach((el) => {
        if (getAttr(el as HTMLElement, attrName)) {
            $props.push(el as HTMLElement)
        }
    })
    return $props
}

export const store = (storeName: string, data: any) => {
    if (internal.init) throw new Error('Store must be defined before hydrating the elements.');
    if (!isObject(data) || isArray(data)) throw new Error('Store data must be an object or array.');
    stores[storeName] = observe(data);
}