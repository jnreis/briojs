import { DomRuntime } from './types';

export type PortalDestination = {
    target: Element;
    placement: 'before' | 'after' | 'prepend' | 'append';
};
export declare function portalPosition({ target, placement }: PortalDestination): {
    parent: Node;
    reference: Node | null;
};
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
export declare function createDomRange(document: Document, name: string): DomRange;
export declare function ownElementRange(element: Element, context: Record<PropertyKey, any>, runtime: DomRuntime): DomRange;
