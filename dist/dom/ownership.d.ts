import { Scope } from '../core/scope';
import { ExpressionScope } from '../core/expression';
import { DomRuntime } from './types';

export type NodeOwner = {
    context: ExpressionScope;
    scope: Scope;
    runtime: DomRuntime;
    controlsChildren?: boolean;
    structuralRoot?: boolean;
};
export declare function getNodeOwner(node: Node): NodeOwner | undefined;
export declare function ownNode(node: Node, context: ExpressionScope, runtime: DomRuntime): NodeOwner;
export declare function disposeNodes(nodes: readonly Node[]): void;
