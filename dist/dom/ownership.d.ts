import { Scope } from '../core/scope';
import { ExpressionScope } from '../core/expression';
import { DomRuntime } from './types';

export type NodeOwner = {
    context: ExpressionScope;
    scope: Scope;
    runtime: DomRuntime;
    controlsChildren?: boolean;
    structuralRoot?: boolean;
    teleport?: {
        source: Node;
        end: Node;
    };
};
export declare const getPendingHydration: (node: Node) => Set<() => void> | undefined;
export declare function withHydration(node: Node, hydrate: () => void): void;
export declare function getNodeOwner(node: Node): NodeOwner | undefined;
export declare function ownNode(node: Node, context: ExpressionScope, runtime: DomRuntime): NodeOwner;
export declare function disposeNodes(nodes: readonly Node[]): void;
