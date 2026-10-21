import { getParent, getNodeType, getNextSibling, insertBefore, removeChild, getOwnerDocument } from './native';
import { createError, removeElement, deleteItem, includesItem, B_TELEPORT } from '../core/native';
import { onCleanup } from '../core/scope';

import { ownNode } from './ownership';
import type { DomRuntime } from './types';

export type PortalDestination = {
    target: Element;
    placement: 'before' | 'after' | 'prepend' | 'append';
};

export function portalPosition({ target, placement }: PortalDestination): { parent: Node; reference: Node | null } {
    const sibling = placement === 'before' || placement === 'after';
    const parent = sibling ? getParent(target) : target;
    if (!parent || (getNodeType(parent) !== Node.ELEMENT_NODE && getNodeType(parent) !== Node.DOCUMENT_FRAGMENT_NODE))
        throw createError(B_TELEPORT + ' placement requires an element or fragment container.');
    return {
        parent,
        reference: placement === 'before' ? target :
            placement === 'after' ? getNextSibling(target) :
                placement === 'prepend' ? target.firstChild : null,
    };
}

export type DomRange = {
    start: Comment;
    end: Comment;
    nodes(includeAnchors?: boolean): Node[];
    moveBefore(parent: Node, reference: Node | null): void;
    detach(): void;
    remove(): void;
    addPortal(range: DomRange): void;
    removePortal(range: DomRange): void;
    readonly detached: boolean;
    readonly destination: PortalDestination | undefined;
    redirect(destination: PortalDestination | undefined, source: Comment): void;
    onRedirect(callback: () => void): void;
};

export function createDomRange(document: Document, name: string): DomRange {
    const start = document.createComment(`brio:${name}`);
    const end = document.createComment(`/brio:${name}`);
    const fragment = document.createDocumentFragment();
    fragment.append(start, end);
    const portals = new Set<DomRange>();
    const homes = new Map<DomRange, Comment>();
    let detached = false;
    let destination: PortalDestination | undefined;
    let source: Comment | undefined;
    let redirected: (() => void) | undefined;
    let pendingRedirect = false;
    let resume: { parent: Node; reference: Node | null } | undefined;
    const detachPortal = (portal: DomRange) => {
        const home = document.createComment('brio:portal');
        insertBefore(getParent(portal.start)!, home, portal.start);
        homes.set(portal, home);
        portal.detach();
    };
    const nodes = (includeAnchors = false): Node[] => {
        const result: Node[] = [];
        if (getParent(start) && getParent(start) === getParent(end)) {
            let current: Node | null = includeAnchors ? start : getNextSibling(start);
            while (current && current !== end) {
                result.push(current);
                current = getNextSibling(current);
            }
            if (includeAnchors) result.push(end);
        }
        return result;
    };
    return {
        start, end,
        get detached() { return detached; },
        get destination() { return destination; },
        nodes,
        moveBefore(parent: Node, reference: Node | null) {
            const resuming = detached && getNodeType(parent) !== Node.DOCUMENT_FRAGMENT_NODE;
            if (resuming && pendingRedirect && source) {
                if (destination) ({ parent, reference } = portalPosition(destination));
                else if (getParent(source)) {
                    parent = getParent(source)!;
                    reference = getNextSibling(source);
                }
            } else if (resuming && resume &&
                (!resume.reference || getParent(resume.reference) === resume.parent)) {
                ({ parent, reference } = resume);
            }
            if (reference === start && parent === getParent(start)) return;
            if (getParent(start) !== parent || getNextSibling(end) !== reference) {
                const contents = nodes(true);
                if (reference && includesItem(contents, reference))
                    throw createError('Cannot move a Brio range inside itself.');
                for (const node of contents) insertBefore(parent, node, reference);
            }
            if (resuming) {
                detached = false;
                pendingRedirect = false;
                resume = undefined;
                for (const [portal, home] of homes) {
                    if (getParent(home)) portal.moveBefore(getParent(home)!, home);
                    removeElement(home);
                }
                homes.clear();
            }
        },
        detach() {
            if (!detached) {
                if (source && destination && getParent(start))
                    resume = { parent: getParent(start)!, reference: getNextSibling(end) };
                detached = true;
                portals.forEach(detachPortal);
            }
            this.moveBefore(document.createDocumentFragment(), null);
        },
        remove() {
            resume = undefined;
            portals.forEach(removeElement);
            homes.forEach(removeElement);
            homes.clear();
            for (const node of nodes(true)) removeChild(getParent(node), node);
        },
        addPortal(portal: DomRange) {
            portals.add(portal);
            if (detached) detachPortal(portal);
        },
        removePortal(portal: DomRange) {
            deleteItem(portals, portal);
            removeElement(homes.get(portal));
            deleteItem(homes, portal);
            removeElement(portal);
        },
        redirect(next: PortalDestination | undefined, home: Comment) {
            destination = next;
            source = home;
            if (detached) pendingRedirect = true;
            if (redirected) redirected();
            else if (!detached) {
                if (destination) {
                    const { parent, reference } = portalPosition(destination);
                    this.moveBefore(parent, reference);
                } else if (getParent(source)) this.moveBefore(getParent(source)!, getNextSibling(source));
            }
        },
        onRedirect(callback: () => void) {
            redirected = callback;
        },
    };
}

const outputs = new WeakMap<Element, DomRange>();

export function ownElementRange(
    element: Element,
    context: Record<PropertyKey, any>,
    runtime: DomRuntime,
): DomRange {
    const existing = outputs.get(element);
    if (existing) return existing;
    const parent = getParent(element);
    if (!parent) throw createError('Brio rendered output requires an element with a parent node.');
    const range = createDomRange(getOwnerDocument(element), 'range');
    insertBefore(parent, range.start, element);
    insertBefore(parent, range.end, getNextSibling(element));
    outputs.set(element, range);
    ownNode(range.start, context, runtime);
    ownNode(range.end, context, runtime);
    onCleanup(() => {
        deleteItem(outputs, element);
        removeElement(range);
    });
    return range;
}
