import { isString, getLength, isArray, createTypeError, ATTRIBUTES } from '../../core/native';
import { createExpressionScope, execute } from '../../core/expression';
import { onCleanup } from '../../core/scope';
import { observerOptions, observerTarget, observerBoolean, observerDelay } from './observer-options';

export function handleMutation(
    element: Element,
    attrName: string,
    expression: string,
    modifiers: Record<string, boolean>,
    context: Record<PropertyKey, any>,
): void {
    const baseName = attrName.split('.')[0];
    const isAdded = baseName.endsWith('-addednodes');
    const isRemoved = baseName.endsWith('-removednodes');
    const isAttrs = baseName.endsWith('-attrs');
    const isText = baseName.endsWith('-text');

    const configured = observerOptions(element, attrName, modifiers, context);
    const target = configured.target === undefined ? element :
        observerTarget(configured.target, element, 'Mutation target');
    const delay = observerDelay(configured);
    const options: MutationObserverInit = {
        childList: isAdded || isRemoved || (!isAttrs && !isText),
        [ATTRIBUTES]: isAttrs,
        characterData: isText,
        subtree: observerBoolean(configured, 'subtree', true),
    };
    if (isAttrs) {
        options.attributeOldValue = observerBoolean(configured, 'attributeOldValue', false);
        if (configured.attributeFilter !== undefined) {
            if (!isArray(configured.attributeFilter) ||
                !configured.attributeFilter.every(value => isString(value)))
                throw createTypeError('Mutation attributeFilter must be an array of strings.');
            options.attributeFilter = configured.attributeFilter;
        }
    }
    if (isText) options.characterDataOldValue = observerBoolean(configured, 'characterDataOldValue', false);

    let debounceTimer: ReturnType<typeof setTimeout> | undefined;
    let pending: MutationRecord[] = [];

    const observer = new MutationObserver((mutations) => {
        let matching: MutationRecord[] = [];
        if (isAdded) {
            matching = mutations.filter(m => getLength(m.addedNodes) > 0);
        } else if (isRemoved) {
            matching = mutations.filter(m => getLength(m.removedNodes) > 0);
        } else if (isAttrs) {
            matching = mutations.filter(m => m.type === ATTRIBUTES);
        } else if (isText) {
            matching = mutations.filter(m => m.type === 'characterData');
        } else {
            matching = mutations;
        }

        if (getLength(matching)) {
            const invoke = () => {
                const records = pending;
                pending = [];
                execute(expression, createExpressionScope({ $mutations: records }, context), undefined, attrName, element);
            };
            pending.push(...matching);

            if (delay !== undefined) {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(invoke, delay);
            } else {
                invoke();
            }
        }
    });

    onCleanup(() => {
        clearTimeout(debounceTimer);
        observer.disconnect();
        pending = [];
    });
    observer.observe(target, options);
}
