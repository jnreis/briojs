import { evaluate } from '../../core/expression';
import { effect } from '../../reactivity/effect';
import { createScope, onCleanup } from '../../core/scope';
import type { Scope } from '../../core/scope';
import type { DomRuntime } from '../types';
import { leaveTransition } from './transition';

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
    const placeholder = document.createComment('brio:if');
    const template = element.cloneNode(true) as Element;
    template.removeAttribute('b-if');
    parent.replaceChild(placeholder, element);
    let instance: Element | undefined;
    let instanceScope: Scope | undefined;
    let isLeaving = false;

    onCleanup(() => {
        try {
            instanceScope?.dispose();
        } finally {
            instance?.remove();
            placeholder.remove();
        }
    });

    effect(() => {
        if (evaluate(expression, context)) {
            isLeaving = false;
            if (instance) return;
            instance = template.cloneNode(true) as Element;
            instanceScope = createScope();
            placeholder.parentNode?.insertBefore(instance, placeholder.nextSibling);
            instanceScope.run(() => hydrateNodeFn(instance!, context, runtime));
        } else if (instance && !isLeaving) {
            const currentInstance = instance;
            const currentScope = instanceScope;
            instance = undefined;
            instanceScope = undefined;

            const transitionAttr = currentInstance.getAttribute('b-transition');
            if (transitionAttr !== null) {
                isLeaving = true;
                const transitionName = transitionAttr.trim().replace(/^['"]|['"]$/g, '') || 'brio';
                leaveTransition(currentInstance, transitionName, () => {
                    try {
                        currentScope?.dispose();
                    } finally {
                        currentInstance.remove();
                    }
                });
            } else {
                try {
                    currentScope?.dispose();
                } finally {
                    currentInstance.remove();
                }
            }
        }
    });
}
