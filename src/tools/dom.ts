import { ATTRIBUTE, COMPOSING, DISPLAY, GET_COMPUTED_STYLE, INPUT, OPACITY } from "./constants";
import { isElementNode } from "./typeCheck";

export let q = (selector: string, root: Node = document) =>
    (root as HTMLElement).querySelectorAll(selector);

export let closest = (node: Node, selector: string) => {
    let el = isElementNode(node) ? node: getParent(node);
    return el && (el as HTMLElement).closest(selector);
}

export let appendChild = (parent: Node, child: Node) =>
    parent.appendChild(child);

export let insertBefore = (parent: Node, child: Node, beforeChild: Node) =>
    parent.insertBefore(child, beforeChild);

export let removeChild = (parent: Node, child: Node) =>
    parent.removeChild(child);

export let getParent = (node: Node) =>
    node.parentElement;

export let nextSibling = (node: Node) =>
    node.nextSibling;

export let getAttr = (node: HTMLElement, attr: string) =>
    node.getAttribute(attr);

export let setAttr = (node: HTMLElement, attr: string, value: string) =>
    node.setAttribute(attr, value);

export let findAttr = (node: HTMLElement, callback: Function): [string, string] | undefined => {
    for (let { name, value } of [...node[ATTRIBUTE + 's' as 'attributes']]) {
        if (callback(name, value)) return [name, value];
    }
}

export let delAttr = (node: HTMLElement, attr: string) =>
    node.removeAttribute(attr);

// Listen to an event on a node with a callback and return a clean up function
export let listen = (node: HTMLElement, eventName: string, callback: (event: Event) => void, options?: boolean | AddEventListenerOptions) => {
    node.addEventListener(eventName, callback, options)
    return () => {
        node.removeEventListener(eventName, callback)
    }
}

// Emit an event on a node
export let emit = (node: HTMLElement, eventName: string, eventData?: any) =>
    node.dispatchEvent(new CustomEvent(eventName, {bubbles: true, cancelable: true, detail: eventData}));

// Traverse DOM tree
export let walk = (node: Node, callback: (node: Node) => boolean | null) => {
    // If callback returns false, don't walk through child nodes
    if (callback(node)) {
        // Recursively walk through child nodes
        for (let child of node.childNodes) {
            walk(child, callback);
        }
    }
}

export let onCompositionStart = (e: Event) =>
    (e.target as any)[COMPOSING] = true;

export let onCompositionEnd = (e: Event) => {
    let target = e.target as any;
    if (target[COMPOSING]) {
        target[COMPOSING] = false;
        emit(target, INPUT);
    }
}

export let isElementVisible = (node: HTMLElement) => {
    // Check if element is hidden due to display, visibility, or opacity
    let style = window[GET_COMPUTED_STYLE](node);
    return !(!getParent(node) || style[DISPLAY] == 'none' || style.visibility == 'hidden' || style[OPACITY] == '0');
}