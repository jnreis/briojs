import { isTextNode } from '.';
import { trim } from './string';

export const q = (selector: string, root: Node = document) => {
    return (root as HTMLElement).querySelectorAll(selector);
}

export const appendChild = (parent: Node, child: Node) => {
    parent.appendChild(child);
}

export const insertBefore = (parent: Node, child: Node, beforeChild: Node) => {
    parent.insertBefore(child, beforeChild);
}

export const removeChild = (parent: Node, child: Node) => {
    parent.removeChild(child);
}

export const getParent = (node: Node) => {
    return node.parentElement;
}

export const nextSibling = (node: Node) => {
    return node.nextSibling;
}

export const getAttr = (node: HTMLElement, attr: string) => {
    return node.getAttribute(attr);
}

export const setAttr = (node: HTMLElement, attr: string, value: string) => {
    node.setAttribute(attr, value);
}

export const delAttr = (node: HTMLElement, attr: string) => {
    node.removeAttribute(attr);
}

// Listen to an event on a node with a callback and return a clean up function
export const listen = (node: HTMLElement, eventName: string, callback: (event: Event) => void, options?: boolean | AddEventListenerOptions) => {
    node.addEventListener(eventName, callback, options)
    return () => {
        node.removeEventListener(eventName, callback)
    }
}

// Emit an event on a node
export const emit = (node: HTMLElement, eventName: string, eventData?: any) => {
    node.dispatchEvent(new CustomEvent(eventName, {bubbles: true, cancelable: true, detail: eventData}))
}

// Skip the walk
export const walkControl = {
    skip: false,
}

// Traverse DOM tree
export const walk = (
    node: Node,
    context: any,
    callback: (node: Node, context: any) => any
) => {
    // Call the callback on the current node
    context = callback(node, context);

    // Skip walk
    if (walkControl.skip) {
        walkControl.skip = false;
        return context;
    }

    // Recursively walk through child nodes
    for (const child of node.childNodes) {
        // Skip empty text nodes
        if (isTextNode(child) && !trim(child.textContent || '').length) continue;

        // Recursively walk through child nodes
        walk(child, context, callback);
    }
    return context;
}

export const onCompositionStart = (e: Event) => {
    (e.target as any).composing = true;
}

export const onCompositionEnd = (e: Event) => {
    const target = e.target as any;
    if (target.composing) {
        target.composing = false;
        emit(target, 'input');
    }
}