import { createExpressionScope, execute } from '../../core/expression';
import { onCleanup } from '../../core/scope';

export function handleMutation(
    element: Element,
    attrName: string,
    expression: string,
    modifiers: Record<string, boolean>,
    context: Record<PropertyKey, any>,
): void {
    const isAdded = attrName.includes('addednodes');
    const isRemoved = attrName.includes('removednodes');
    const isAttrs = attrName.includes('attrs');
    const isText = attrName.includes('text');

    const options: MutationObserverInit = {
        childList: isAdded || isRemoved || (!isAttrs && !isText),
        attributes: isAttrs,
        characterData: isText,
        subtree: true,
    };

    let debounceTimer: any;

    const observer = new MutationObserver((mutations) => {
        let matching: MutationRecord[] = [];
        if (isAdded) {
            matching = mutations.filter(m => m.addedNodes.length > 0);
        } else if (isRemoved) {
            matching = mutations.filter(m => m.removedNodes.length > 0);
        } else if (isAttrs) {
            matching = mutations.filter(m => m.type === 'attributes');
        } else if (isText) {
            matching = mutations.filter(m => m.type === 'characterData');
        } else {
            matching = mutations;
        }

        if (matching.length) {
            const invoke = () => {
                execute(expression, createExpressionScope({ $mutations: matching }, context));
            };

            if (modifiers.debounce) {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(invoke, 100);
            } else {
                invoke();
            }
        }
    });

    observer.observe(element, options);
    onCleanup(() => {
        clearTimeout(debounceTimer);
        observer.disconnect();
    });
}
