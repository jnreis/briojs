import { createExpressionScope, evaluate } from '../../core/expression';
import { effect } from '../../reactivity/effect';
import { createScope, onCleanup } from '../../core/scope';
import { state } from '../../reactivity/state-v4';
import type { Scope } from '../../core/scope';
import type { DomRuntime } from '../types';

type LoopRow = {
    element: Element;
    context: Record<PropertyKey, any>;
    values: Record<string, unknown>;
    scope: Scope;
    key: string | number;
};

const enumerate = (value: unknown): [unknown, unknown][] => {
    if (value === null || value === undefined) return [];
    if (Array.isArray(value) || (typeof value === 'object' && Symbol.iterator in value))
        return Array.from(value as Iterable<unknown>, (item, index) => [index, item]);
    if (typeof value === 'object') return Object.entries(value);
    if (typeof value === 'number' && Number.isInteger(value) && value >= 0)
        return Array.from({ length: value }, (_, index) => [index, index + 1]);
    throw new TypeError('b-for expects an array, iterable, object, or non-negative integer.');
};

export function handleFor(
    element: Element,
    expression: string,
    _modifiers: Record<string, boolean>,
    context: Record<PropertyKey, any>,
    runtime: DomRuntime,
    hydrateNodeFn: (node: Node, context: Record<PropertyKey, any>, runtime: DomRuntime) => void,
): void {
    const parent = element.parentNode;
    if (!parent) throw new Error('b-for requires an element with a parent node.');
    const parsed = /^\s*([A-Za-z_$][\w$]*)(?:\s*,\s*([A-Za-z_$][\w$]*))?\s+in\s+([\s\S]+)$/.exec(expression);
    if (!parsed) throw new SyntaxError(`Invalid b-for expression "${expression}". Use "item in items".`);
    const [, itemName, indexName = '$index', collectionExpression] = parsed;
    const keyExpression = element.getAttribute('b-key');
    const placeholder = document.createComment('brio:for');
    const template = element.cloneNode(true) as Element;
    template.removeAttribute('b-for');
    template.removeAttribute('b-key');
    parent.replaceChild(placeholder, element);

    const rows = new Map<string | number, LoopRow>();

    onCleanup(() => {
        const errors: unknown[] = [];
        for (const row of rows.values()) {
            try {
                row.scope.dispose();
            } catch (error) {
                errors.push(error);
            } finally {
                row.element.remove();
            }
        }
        rows.clear();
        placeholder.remove();
        if (errors.length) throw new AggregateError(errors, 'One or more repeated items failed to dispose.');
    });

    effect(() => {
        const entries = enumerate(evaluate(collectionExpression, context));
        const nextKeys = new Set<string | number>();
        let cursor: Node = placeholder;
        for (const [index, item] of entries) {
            const rowState = state<Record<string, unknown>>({ [itemName]: item, [indexName]: index });
            const rowContext = createExpressionScope(rowState, context);
            const evaluatedKey = keyExpression ? evaluate(keyExpression, rowContext) : index;
            if (typeof evaluatedKey !== 'string' && typeof evaluatedKey !== 'number')
                throw new TypeError('b-key must evaluate to a string or number.');
            if (nextKeys.has(evaluatedKey))
                throw new Error(`Duplicate b-for key "${evaluatedKey}".`);
            nextKeys.add(evaluatedKey);

            let row = rows.get(evaluatedKey);
            if (!row) {
                const rowElement = template.cloneNode(true) as Element;
                const rowScope = createScope();
                row = { element: rowElement, context: rowContext, values: rowState, scope: rowScope, key: evaluatedKey };
                rows.set(evaluatedKey, row);
                rowScope.run(() => hydrateNodeFn(rowElement, rowContext, runtime));
            } else {
                row.values[itemName] = item;
                row.values[indexName] = index;
            }
            if (row.element.previousSibling !== cursor)
                placeholder.parentNode?.insertBefore(row.element, cursor.nextSibling);
            cursor = row.element;
        }
        for (const [key, row] of rows) {
            if (nextKeys.has(key)) continue;
            try {
                row.scope.dispose();
            } finally {
                row.element.remove();
                rows.delete(key);
            }
        }
    });
}
