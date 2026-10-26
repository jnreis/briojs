import { Scope } from '../core/scope.js';
import { ExpressionScope } from '../core/expression.js';
import { DomRuntime } from './types.js';
export type NodeOwner = {
    context: ExpressionScope;
    scope: Scope;
    runtime: DomRuntime;
    controlsChildren?: boolean;
    structuralRoot?: boolean;
    loopRow?: boolean;
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
