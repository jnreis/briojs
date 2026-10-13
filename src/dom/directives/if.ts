import { evaluate } from '../../core/expression';
import { effect } from '../../reactivity/effect';
import { createScope, onCleanup } from '../../core/scope';
import type { Scope } from '../../core/scope';
import type { DomRuntime } from '../types';
import { cancelTransition, getTransitionName, leaveTransition } from './transition';

export function handleIf(
    element: Element,
    expression: string,
    _modifiers: Record<string, boolean>,
    context: Record<PropertyKey, any>,
    runtime: DomRuntime,
    hydrateNodeFn: (node: Node, context: Record<PropertyKey, any>, runtime: DomRuntime) => void,
): void {
    const parent = element.parentNode;
    if (!parent) throw new Error('b-if requires an element with a parent node.');
    const branches: { template: Element; expression?: string }[] = [
        { template: element.cloneNode(true) as Element, expression },
    ];
    branches[0].template.removeAttribute('b-if');
    const nextBranch = (node: Element): Element | null => {
        let next = node.nextSibling;
        while (next && (next.nodeType === Node.COMMENT_NODE ||
            (next.nodeType === Node.TEXT_NODE && !next.textContent?.trim()))) next = next.nextSibling;
        return next?.nodeType === Node.ELEMENT_NODE ? next as Element : null;
    };
    let sibling = nextBranch(element);
    let ended = false;
    while (sibling && (sibling.hasAttribute('b-else-if') || sibling.hasAttribute('b-else'))) {
        if (ended || (sibling.hasAttribute('b-else-if') && sibling.hasAttribute('b-else')))
            throw new SyntaxError('b-else must be the last branch of a b-if chain.');
        const template = sibling.cloneNode(true) as Element;
        const condition = sibling.getAttribute('b-else-if');
        ended = condition === null;
        template.removeAttribute('b-else-if');
        template.removeAttribute('b-else');
        branches.push({ template, expression: condition ?? undefined });
        const next = nextBranch(sibling);
        sibling.remove();
        sibling = next;
    }

    const placeholder = document.createComment('brio:if');
    parent.replaceChild(placeholder, element);
    const leaving = new Set<Element>();
    let instance: Element | undefined;
    let instanceScope: Scope | undefined;
    let activeBranch = -1;

    const removeCurrent = (animate: boolean) => {
        const current = instance;
        const scope = instanceScope;
        instance = undefined;
        instanceScope = undefined;
        activeBranch = -1;
        if (!current) return;
        const name = animate ? getTransitionName(current) : undefined;
        try {
            // Dehydrate immediately; an exiting node is only an inert visual snapshot.
            scope?.dispose();
        } catch (error) {
            current.remove();
            throw error;
        }
        if (name && current.isConnected) {
            leaving.add(current);
            leaveTransition(current, name, () => {
                leaving.delete(current);
                current.remove();
            });
        } else current.remove();
    };

    onCleanup(() => {
        try {
            removeCurrent(false);
        } finally {
            for (const node of leaving) {
                cancelTransition(node);
                node.remove();
            }
            leaving.clear();
            placeholder.remove();
        }
    });

    effect(() => {
        const branch = branches.findIndex(candidate =>
            candidate.expression === undefined || Boolean(evaluate(candidate.expression, context)));
        if (branch === activeBranch) return;
        removeCurrent(true);
        if (branch < 0) return;
        instance = branches[branch].template.cloneNode(true) as Element;
        instanceScope = createScope();
        activeBranch = branch;
        placeholder.parentNode?.insertBefore(instance, placeholder.nextSibling);
        instanceScope.run(() => hydrateNodeFn(instance!, context, runtime));
    });
}
