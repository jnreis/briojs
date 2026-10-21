import { getLength, createError, arrayFrom, deleteItem, TELEPORT } from '../core/native';
import { getChildNodes } from './native';
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
    teleport?: { source: Node; end: Node };
};

const owners = new WeakMap<Node, NodeOwner>();
const pendingHydration = new WeakMap<Node, Set<() => void>>();

export const getPendingHydration = (node: Node): Set<() => void> | undefined => pendingHydration.get(node);

export function withHydration(node: Node, hydrate: () => void): void {
    if (pendingHydration.has(node)) {
        hydrate();
        return;
    }
    const callbacks = new Set<() => void>();
    pendingHydration.set(node, callbacks);
    try {
        hydrate();
    } finally {
        deleteItem(pendingHydration, node);
    }
    callbacks.forEach(callback => callback());
}

export function getNodeOwner(node: Node): NodeOwner | undefined {
    return owners.get(node);
}

export function ownNode(node: Node, context: ExpressionScope, runtime: DomRuntime): NodeOwner {
    const scope = getCurrentScope();
    if (!scope) throw createError('DOM hydration requires an active Brio scope.');
    const owner: NodeOwner = { context, runtime, scope };
    owners.set(node, owner);
    onDispose(scope, () => {
        if (owners.get(node) === owner) deleteItem(owners, node);
    });
    return owner;
}

export function disposeNodes(nodes: readonly Node[]): void {
    const scopes = new Set<Scope>();
    const selected = (node: Node) => nodes.some(root => root === node || root.contains(node));
    const visit = (node: Node) => {
        const owner = owners.get(node);
        if (owner) scopes.add(owner.scope);
        visitChildren(arrayFrom(getChildNodes(node)));
    };
    const visitChildren = (children: readonly Node[]) => {
        for (let index = 0; index < getLength(children); index++) {
            const child = children[index];
            const portal = owners.get(child)?.[TELEPORT];
            if (portal && !selected(portal.source)) {
                const end = children.indexOf(portal.end, index);
                if (end !== -1) {
                    index = end;
                    continue;
                }
            }
            visit(child);
        }
    };
    visitChildren(nodes);
    const errors: unknown[] = [];
    for (const scope of scopes) {
        try {
            scope.dispose();
        } catch (error) {
            errors.push(error);
        }
    }
    if (getLength(errors)) throw combinedError('Brio DOM content cleanup failed.', errors);
}
