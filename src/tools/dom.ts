import { INPUT } from "./constants";
import { isElementNode } from "./typeCheck";

export let q = (selector: string, root: Node = document) => {
    return (root as HTMLElement).querySelectorAll(selector);
}

export let closest = (node: Node, selector: string) => {
    let el = isElementNode(node) ? node: getParent(node);
    return el && (el as HTMLElement).closest(selector);
}

export let appendChild = (parent: Node, child: Node) => {
    parent.appendChild(child);
}

export let insertBefore = (parent: Node, child: Node, beforeChild: Node) => {
    parent.insertBefore(child, beforeChild);
}

export let removeChild = (parent: Node, child: Node) => {
    parent.removeChild(child);
}

export let getParent = (node: Node) => {
    return node.parentElement;
}

export let nextSibling = (node: Node) => {
    return node.nextSibling;
}

export let getAttr = (node: HTMLElement, attr: string) => {
    return node.getAttribute(attr);
}

export let setAttr = (node: HTMLElement, attr: string, value: string) => {
    node.setAttribute(attr, value);
}

export let delAttr = (node: HTMLElement, attr: string) => {
    node.removeAttribute(attr);
}

// Listen to an event on a node with a callback and return a clean up function
export let listen = (node: HTMLElement, eventName: string, callback: (event: Event) => void, options?: boolean | AddEventListenerOptions) => {
    node.addEventListener(eventName, callback, options)
    return () => {
        node.removeEventListener(eventName, callback)
    }
}

// Emit an event on a node
export let emit = (node: HTMLElement, eventName: string, eventData?: any) => {
    node.dispatchEvent(new CustomEvent(eventName, {bubbles: true, cancelable: true, detail: eventData}))
}

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

export let onCompositionStart = (e: Event) => {
    (e.target as any).composing = true;
}

export let onCompositionEnd = (e: Event) => {
    let target = e.target as any;
    if (target.composing) {
        target.composing = false;
        emit(target, INPUT);
    }
}