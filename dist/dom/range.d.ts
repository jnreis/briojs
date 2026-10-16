import { DomRuntime } from './types';

export type DomRange = {
    start: Comment;
    end: Comment;
    nodes(includeAnchors?: boolean): Node[];
    moveBefore(parent: Node, reference: Node | null): void;
    detach(): void;
    remove(): void;
    addPortal(range: DomRange): void;
};
export declare function createDomRange(document: Document, name: string): DomRange;
export declare function ownElementRange(element: Element, context: Record<PropertyKey, any>, runtime: DomRuntime): DomRange;
