import { onCleanup } from '../core/scope';
import { ownNode } from './ownership';
import type { DomRuntime } from './types';

export type DomRange = {
    start: Comment;
    end: Comment;
    nodes(includeAnchors?: boolean): Node[];
    moveBefore(parent: Node, reference: Node | null): void;
    detach(): void;
    remove(): void;
    addPortal(range: DomRange): void;
};

export function createDomRange(document: Document, name: string): DomRange {
    const start = document.createComment(`brio:${name}`);
    const end = document.createComment(`/brio:${name}`);
    const fragment = document.createDocumentFragment();
    fragment.append(start, end);
    const portals = new Set<DomRange>();
    const homes = new Map<DomRange, Comment>();
    let detached = false;
    const detachPortal = (portal: DomRange) => {
        const home = document.createComment('brio:portal');
        portal.start.parentNode!.insertBefore(home, portal.start);
        homes.set(portal, home);
        portal.detach();
    };
    const nodes = (includeAnchors = false): Node[] => {
        const result: Node[] = [];
        if (start.parentNode && start.parentNode === end.parentNode) {
            let current: Node | null = includeAnchors ? start : start.nextSibling;
            while (current && current !== end) {
                result.push(current);
                current = current.nextSibling;
            }
            if (includeAnchors) result.push(end);
        }
        return result;
    };
    return {
        start, end,
        nodes,
        moveBefore(parent: Node, reference: Node | null) {
            if (start.parentNode !== parent || end.nextSibling !== reference) {
                const contents = nodes(true);
                if (reference && contents.includes(reference))
                    throw new Error('Cannot move a Brio range inside itself.');
                for (const node of contents) parent.insertBefore(node, reference);
            }
            if (detached && parent.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) {
                detached = false;
                for (const [portal, home] of homes) {
                    if (home.parentNode) portal.moveBefore(home.parentNode, home);
                    home.remove();
                }
                homes.clear();
            }
        },
        detach() {
            if (!detached) {
                detached = true;
                portals.forEach(detachPortal);
            }
            this.moveBefore(document.createDocumentFragment(), null);
        },
        remove() {
            portals.forEach(portal => portal.remove());
            homes.forEach(home => home.remove());
            homes.clear();
            for (const node of nodes(true)) node.parentNode?.removeChild(node);
        },
        addPortal(portal: DomRange) {
            portals.add(portal);
            if (detached) detachPortal(portal);
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
    const parent = element.parentNode;
    if (!parent) throw new Error('Brio rendered output requires an element with a parent node.');
    const range = createDomRange(element.ownerDocument, 'range');
    parent.insertBefore(range.start, element);
    parent.insertBefore(range.end, element.nextSibling);
    outputs.set(element, range);
    ownNode(range.start, context, runtime);
    ownNode(range.end, context, runtime);
    onCleanup(() => {
        outputs.delete(element);
        range.remove();
    });
    return range;
}
