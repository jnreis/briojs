import { createExpressionScope, evaluate } from '../../core/expression';
import { effect } from '../../reactivity/effect';
import { createScope, onCleanup } from '../../core/scope';
import { createScopedState } from '../../core/scoped-state';
import type { Scope } from '../../core/scope';
import type { DomRuntime } from '../types';
import { getNodeOwner } from '../ownership';
import { createDomRange, ownElementRange } from '../range';
import type { DomRange } from '../range';
import { combinedError } from '../../core/errors';
import { cloneProjectedNode } from '../components';

type LoopRow = {
    element: Element;
    context: Record<PropertyKey, any>;
    values: Record<string, unknown>;
    scope: Scope;
    key: string | number;
    output: DomRange;
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
    if (!parsed) throw new SyntaxError(`Invalid b-for expression "${expression}". Use "item in $data.items".`);
    const [, itemName, indexName = '$index', collectionExpression] = parsed;
    if (itemName === '$parent' || indexName === '$parent')
        throw new SyntaxError('$parent is reserved for Brio loop ancestry.');
    const keyExpression = element.getAttribute('b-key');
    const output = ownElementRange(element, context, runtime);
    const placeholder = output.start;
    const template = cloneProjectedNode(element);
    template.removeAttribute('b-for');
    template.removeAttribute('b-key');
    element.remove();

    const rows = new Map<string | number, LoopRow>();
    const portals = new Map<Node, DomRange>();

    onCleanup(() => {
        const errors: unknown[] = [];
        for (const row of rows.values()) {
            try {
                row.scope.dispose();
            } catch (error) {
                errors.push(error);
            } finally {
                row.output.remove();
            }
        }
        rows.clear();
        placeholder.remove();
        if (errors.length) throw new AggregateError(errors, 'One or more repeated items failed to dispose.');
    });

    effect(() => {
        const entries = enumerate(evaluate(collectionExpression, context));
        const nextKeys = new Set<string | number>();
        const ordered: LoopRow[] = [];
        for (const [index, item] of entries) {
            const loopData = { [itemName]: item, [indexName]: index };
            const rowState = createScopedState(loopData, context.$for);
            const rowContext = createExpressionScope({ $for: rowState }, context);
            const evaluatedKey = keyExpression ? evaluate(keyExpression, rowContext) : index;
            if (typeof evaluatedKey !== 'string' && typeof evaluatedKey !== 'number')
                throw new TypeError('b-key must evaluate to a string or number.');
            if (nextKeys.has(evaluatedKey))
                throw new Error(`Duplicate b-for key "${evaluatedKey}".`);
            nextKeys.add(evaluatedKey);

            let row = rows.get(evaluatedKey);
            if (!row) {
                const rowElement = cloneProjectedNode(template);
                const rowScope = createScope();
                output.end.parentNode!.insertBefore(rowElement, output.end);
                const range = rowScope.run(() => ownElementRange(rowElement, rowContext, runtime));
                row = { element: rowElement, context: rowContext, values: rowState, scope: rowScope, key: evaluatedKey, output: range };
                rows.set(evaluatedKey, row);
                try {
                    rowScope.run(() => hydrateNodeFn(rowElement, rowContext, runtime));
                } catch (error) {
                    rows.delete(evaluatedKey);
                    try {
                        rowScope.dispose();
                    } catch (cleanupError) {
                        throw combinedError('Loop hydration and cleanup both failed.', [error, cleanupError]);
                    }
                    throw error;
                }
                const owner = getNodeOwner(rowElement);
                if (owner) owner.structuralRoot = true;
            } else {
                row.values[itemName] = item;
                row.values[indexName] = index;
            }
            const destination = row.output.start.parentNode!;
            const local = destination === output.end.parentNode &&
                Boolean(row.output.end.compareDocumentPosition(output.end) & Node.DOCUMENT_POSITION_FOLLOWING);
            if (!local && ![...portals.values()].some(portal => portal.start.parentNode === destination)) {
                let portal = portals.get(destination);
                if (!portal) {
                    portal = createDomRange(element.ownerDocument, 'for:portal');
                    destination.insertBefore(portal.start, row.output.start);
                    destination.insertBefore(portal.end, row.output.end.nextSibling);
                    portals.set(destination, portal);
                    output.addPortal(portal);
                }
                row.output.moveBefore(portal.end.parentNode!, portal.end);
            }
            ordered.push(row);
        }
        for (const [key, row] of rows) {
            if (nextKeys.has(key)) continue;
            try {
                row.scope.dispose();
            } finally {
                row.output.remove();
                rows.delete(key);
            }
        }
        const destinations = new Map<Node, Node | null>([[output.end.parentNode!, output.end]]);
        for (const portal of portals.values()) destinations.set(portal.end.parentNode!, portal.end);
        for (const row of ordered.reverse()) {
            const destination = row.output.end.parentNode!;
            row.output.moveBefore(destination, destinations.get(destination) ?? null);
            destinations.set(destination, row.output.start);
        }
    });
}
