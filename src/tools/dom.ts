export function q(selector: string, root: HTMLElement = document.body) {
    return root.querySelectorAll(selector);
}

export function getAttr(node: HTMLElement, attr: string) {
    return node.getAttribute(attr);
}

export function setAttr(node: HTMLElement, attr: string, value: string) {
    node.setAttribute(attr, value);
}

export function delAttr(node: HTMLElement, attr: string) {
    node.removeAttribute(attr);
}

// Listen to an event on a node with a callback and return a clean up function
export function listen(node: HTMLElement, eventName: string, callback: (event: Event) => void, options?: boolean | AddEventListenerOptions) {
    node.addEventListener(eventName, callback, options)
    return () => {
        node.removeEventListener(eventName, callback)
    }
}

// Emit an event on a node
export function emit(node: HTMLElement, eventName: string, eventData?: any) {
    node.dispatchEvent(new CustomEvent(eventName, eventData))
}

// Traverse DOM tree
export function walk(
    node: Node,
    context: any,
    callback: (node: Node, context: any) => any
) {
    // Call the callback on the current node
    // If the callback returns false, stop traversing the tree
    context = callback(node, context);
    if (!context) return;

    // Recursively walk through child nodes
    for (const child of node.childNodes) {
        // Skip empty text nodes
        if (child instanceof Text && !child.textContent?.trim().length)
            continue;
        // Recursively walk through child nodes
        walk(child, context, callback);
    }
}

export function onCompositionStart(e: Event) {
    (e.target as any).composing = true;
}

export function onCompositionEnd(e: Event) {
    const target = e.target as any;
    if (target.composing) {
        target.composing = false;
        emit(target, 'input', { bubbles: true, cancelable: true });
    }
}