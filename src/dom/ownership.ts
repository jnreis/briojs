import { getLength, createError, arrayFrom, deleteItem, includesItem, TELEPORT } from '../core/native';
import { getChildNodes } from './native';
import { getCurrentScope } from '../core/scope';
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
    loopRow?: boolean;
    teleport?: { source: Node; end: Node };
};

const owners = new WeakMap<Node, NodeOwner>();
// Nodes currently hydrating, innermost last; callbacks are allocated only when a teleport waits on one.
const hydratingNodes: Node[] = [];
const hydratingCallbacks: (Set<() => void> | undefined)[] = [];

export const getPendingHydration = (node: Node): Set<() => void> | undefined => {
    const index = hydratingNodes.lastIndexOf(node);
    return index < 0 ? undefined : (hydratingCallbacks[index] ??= new Set());
};

export function withHydration(node: Node, hydrate: () => void): void {
    if (includesItem(hydratingNodes, node)) {
        hydrate();
        return;
    }
    const depth = hydratingNodes.push(node) - 1;
    hydratingCallbacks[depth] = undefined;
    const pop = () => {
        const callbacks = hydratingCallbacks[depth];
        hydratingNodes.length = depth;
        hydratingCallbacks.length = depth;
        return callbacks;
    };
    try {
        hydrate();
    } catch (error) {
        pop();
        throw error;
    }
    pop()?.forEach(callback => callback());
}

// Owners are dropped lazily once their scope is disposed instead of registering a cleanup per node.
export function getNodeOwner(node: Node): NodeOwner | undefined {
    const owner = owners.get(node);
    if (owner?.scope.disposed) {
        deleteItem(owners, node);
        return undefined;
    }
    return owner;
}

export function ownNode(node: Node, context: ExpressionScope, runtime: DomRuntime): NodeOwner {
    const scope = getCurrentScope();
    if (!scope) throw createError('DOM hydration requires an active Brio scope.');
    const owner: NodeOwner = { context, runtime, scope };
    owners.set(node, owner);
    return owner;
}

export function disposeNodes(nodes: readonly Node[]): void {
    const scopes = new Set<Scope>();
    const selected = (node: Node) => nodes.some(root => root === node || root.contains(node));
    const visit = (node: Node) => {
        const owner = getNodeOwner(node);
        if (owner) scopes.add(owner.scope);
        visitChildren(arrayFrom(getChildNodes(node)));
    };
    const visitChildren = (children: readonly Node[]) => {
        for (let index = 0; index < getLength(children); index++) {
            const child = children[index];
            const portal = getNodeOwner(child)?.[TELEPORT];
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
