import { isString, getLength, isArray, createTypeError, ATTRIBUTES } from '../../core/native';
import type { DirectiveBinding, DirectiveDefinition } from './registry';
import { observerOptions, observerTarget, observerBoolean, observerDelay } from './observer-options';

function handleMutation(element: Element, binding: DirectiveBinding): void {
    const { directive } = binding;
    const isAdded = directive === 'b-on-addednodes';
    const isRemoved = directive === 'b-on-removednodes';
    const isAttrs = directive === 'b-on-attrs';
    const isText = directive === 'b-on-text';

    const configured = observerOptions(element, binding);
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
                binding.run({ $mutations: records });
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

    binding.onCleanup(() => {
        clearTimeout(debounceTimer);
        observer.disconnect();
        pending = [];
    });
    observer.observe(target, options);
}

const mutation = (name: string, ...extra: string[]): DirectiveDefinition => ({
    name, value: 'statement', mount: handleMutation,
    modifiers: ['debounce', 'subtree'], options: ['target', 'subtree', 'debounce', ...extra],
});
export const addedNodesDirective = /* @__PURE__ */ mutation('b-on-addednodes');
export const removedNodesDirective = /* @__PURE__ */ mutation('b-on-removednodes');
export const attrsDirective = /* @__PURE__ */ mutation('b-on-attrs', 'attributeFilter', 'attributeOldValue');
export const textDirective = /* @__PURE__ */ mutation('b-on-text', 'characterDataOldValue');
