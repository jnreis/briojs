import { getCurrentScope, onDispose } from '../core/scope';
import type { Scope } from '../core/scope';
import type { ExpressionScope } from '../core/expression';
import type { DomRuntime } from './types';
import { combinedError } from '../core/errors';

export type NodeOwner = {
    context: ExpressionScope;
    scope: Scope;
    runtime: DomRuntime;
    controlsChildren?: boolean;
    structuralRoot?: boolean;
};

const owners = new WeakMap<Node, NodeOwner>();

export function getNodeOwner(node: Node): NodeOwner | undefined {
    return owners.get(node);
}

export function ownNode(node: Node, context: ExpressionScope, runtime: DomRuntime): NodeOwner {
    const scope = getCurrentScope();
    if (!scope) throw new Error('DOM hydration requires an active Brio scope.');
    const owner: NodeOwner = { context, runtime, scope };
    owners.set(node, owner);
    onDispose(scope, () => {
        if (owners.get(node) === owner) owners.delete(node);
    });
    return owner;
}

export function disposeNodes(nodes: readonly Node[]): void {
    const scopes = new Set<Scope>();
    const visit = (node: Node) => {
        const owner = owners.get(node);
        if (owner) scopes.add(owner.scope);
        for (const child of Array.from(node.childNodes)) visit(child);
    };
    nodes.forEach(visit);
    const errors: unknown[] = [];
    for (const scope of scopes) {
        try {
            scope.dispose();
        } catch (error) {
            errors.push(error);
        }
    }
    if (errors.length) throw combinedError('Brio DOM content cleanup failed.', errors);
}
