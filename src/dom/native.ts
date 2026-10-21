export const getParent = (node: Node): ParentNode | null => node.parentNode;
export const getNextSibling = (node: Node): ChildNode | null => node.nextSibling;
export const getOwnerDocument = <T extends Node>(node: T): T['ownerDocument'] => node.ownerDocument;
export const getChildNodes = <T extends Node>(node: T): T['childNodes'] => node.childNodes;
export const getNodeType = (node: Node): number => node.nodeType;
export const removeAttribute = (element: Element, name: string): void => element.removeAttribute(name);
export const getAttribute = (element: Element, name: string): string | null => element.getAttribute(name);
export const insertBefore = <T extends Node>(parent: Node, node: T, reference: Node | null): T =>
    parent.insertBefore(node, reference);
export const removeChild = <T extends Node>(parent: Node | null | undefined, node: T): T | undefined =>
    parent?.removeChild(node);

export function addEventListener<K extends keyof WindowEventMap>(
    target: Window, type: K, listener: (event: WindowEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions,
): void;
export function addEventListener(
    target: EventTarget, type: string, listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
): void;
export function addEventListener(
    target: EventTarget,
    ...args: [type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions]
): void {
    target.addEventListener(...args);
}

export function removeEventListener<K extends keyof WindowEventMap>(
    target: Window, type: K, listener: (event: WindowEventMap[K]) => void,
    options?: boolean | EventListenerOptions,
): void;
export function removeEventListener(
    target: EventTarget, type: string, listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
): void;
export function removeEventListener(
    target: EventTarget,
    ...args: [type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions]
): void {
    target.removeEventListener(...args);
}
