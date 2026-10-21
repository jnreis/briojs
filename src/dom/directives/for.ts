import {
    isObjectType,
    isNumber,
    getLength,
    isString,
    isArray,
    arrayFrom,
    objectEntries,
    createTypeError,
    createError,
    createSyntaxError,
    removeElement,
    deleteItem,
    $PARENT,
} from '../../core/native';
import { getParent, getAttribute, removeAttribute, getOwnerDocument, insertBefore } from '../native';
import { createExpressionScope, evaluate } from '../../core/expression';
import { effect } from '../../reactivity/effect';
import { createScope, onCleanup } from '../../core/scope';
import { createScopedState } from '../../core/scoped-state';
import type { Scope } from '../../core/scope';
import type { DomRuntime } from '../types';
import { getNodeOwner } from '../ownership';
import { createDomRange, ownElementRange } from '../range';
import type { DomRange, PortalDestination } from '../range';
import { combinedError } from '../../core/errors';
import { cloneProjectedNode } from '../components';
import { createRefs } from '../refs';

type LoopRow = {
    element: Element;
    context: Record<PropertyKey, any>;
    values: Record<string, unknown>;
    scope: Scope;
    key: string | number;
    output: DomRange;
};

/** Indexes of a longest strictly increasing run of non-negative positions (O(n log n)). */
const longestIncreasing = (positions: number[]): Set<number> => {
    const tails: number[] = [];
    const previous: number[] = [];
    positions.forEach((position, index) => {
        if (position < 0) return;
        let low = 0;
        let high = getLength(tails);
        while (low < high) {
            const middle = (low + high) >> 1;
            if (positions[tails[middle]] < position) low = middle + 1;
            else high = middle;
        }
        previous[index] = low ? tails[low - 1] : -1;
        tails[low] = index;
    });
    const stable = new Set<number>();
    for (let index = getLength(tails) ? tails[getLength(tails) - 1] : -1; index >= 0; index = previous[index])
        stable.add(index);
    return stable;
};

const enumerate = (value: unknown): [unknown, unknown][] => {
    if (value === null || value === undefined) return [];
    if (isArray(value) || (isObjectType(value) && Symbol.iterator in value))
        return arrayFrom(value as Iterable<unknown>, (item, index) => [index, item]);
    if (isObjectType(value)) return objectEntries(value);
    if (isNumber(value) && Number.isInteger(value) && value >= 0)
        return arrayFrom({ length: value }, (_, index) => [index, index + 1]);
    throw createTypeError('b-for expects an array, iterable, object, or non-negative integer.');
};

export function handleFor(
    element: Element,
    expression: string,
    _modifiers: Record<string, boolean>,
    context: Record<PropertyKey, any>,
    runtime: DomRuntime,
    hydrateNodeFn: (node: Node, context: Record<PropertyKey, any>, runtime: DomRuntime) => void,
): void {
    const parent = getParent(element);
    if (!parent) throw createError('b-for requires an element with a parent node.');
    const parsed = /^\s*([A-Za-z_$][\w$]*)(?:\s*,\s*([A-Za-z_$][\w$]*))?\s+in\s+([\s\S]+)$/.exec(expression);
    if (!parsed) throw createSyntaxError(`Invalid b-for expression "${expression}". Use "item in $data.items".`);
    const [, itemName, indexName = '$index', collectionExpression] = parsed;
    if (itemName === $PARENT || indexName === $PARENT)
        throw createSyntaxError($PARENT + ' is reserved for Brio loop ancestry.');
    const keyExpression = getAttribute(element, 'b-key');
    const output = ownElementRange(element, context, runtime);
    const placeholder = output.start;
    const template = cloneProjectedNode(element);
    removeAttribute(template, 'b-for');
    removeAttribute(template, 'b-key');
    removeElement(element);

    const rows = new Map<string | number, LoopRow>();
    const portals: { destination: PortalDestination; range: DomRange }[] = [];
    let ordered: LoopRow[] = [];
    // DOM order of rows rendered directly in the loop's own range after the last reconciliation.
    let placed = new Map<LoopRow, number>();
    let reconciling = false;
    const reconcilePositions = () => {
        if (reconciling) return;
        const used = new Set<DomRange>();
        const destinations = new Map<LoopRow, DomRange>();
        for (const row of ordered) {
            const destination = row.output.destination;
            if (!destination) continue;
            let portal = portals.find(candidate => candidate.destination.target === destination.target &&
                candidate.destination.placement === destination.placement);
            if (!portal) {
                const range = createDomRange(getOwnerDocument(element), 'for:portal');
                range.redirect(destination, output.end);
                portal = { destination, range };
                portals.push(portal);
                output.addPortal(range);
            }
            used.add(portal.range);
            destinations.set(row, portal.range);
        }
        const references = new Map<DomRange, Node | null>([[output, output.end]]);
        for (const portal of portals) references.set(portal.range, portal.range.end);
        // Rows forming the longest run already in relative order stay put; only the rest move.
        const stable = longestIncreasing(ordered.map(row =>
            destinations.has(row) || row.output.detached ? -1 : placed.get(row) ?? -1));
        for (let index = getLength(ordered) - 1; index >= 0; index--) {
            const row = ordered[index];
            const destination = destinations.get(row) ?? output;
            if (!stable.has(index))
                row.output.moveBefore(getParent(destination.end)!, references.get(destination) ?? null);
            references.set(destination, row.output.start);
        }
        placed = new Map();
        for (const row of ordered) if (!destinations.has(row)) placed.set(row, placed.size);
        for (let index = getLength(portals) - 1; index >= 0; index--) {
            if (!used.has(portals[index].range)) {
                output.removePortal(portals[index].range);
                portals.splice(index, 1);
            }
        }
    };

    onCleanup(() => {
        const errors: unknown[] = [];
        for (const row of rows.values()) {
            try {
                row.scope.dispose();
            } catch (error) {
                errors.push(error);
            } finally {
                removeElement(row.output);
            }
        }
        rows.clear();
        removeElement(placeholder);
        if (getLength(errors)) throw new AggregateError(errors, 'One or more repeated items failed to dispose.');
    });

    effect(() => {
        reconciling = true;
        try {
            const entries = enumerate(evaluate(collectionExpression, context, 'b-for', element));
            const nextKeys = new Set<string | number>();
            ordered = [];
            for (const [index, item] of entries) {
                const loopData = { [itemName]: item, [indexName]: index };
                const rowState = createScopedState(loopData, context.$for);
                const rowContext = createExpressionScope({ $for: rowState }, context);
                const evaluatedKey = keyExpression ? evaluate(keyExpression, rowContext, 'b-key', element) : index;
                if (!isString(evaluatedKey) && !isNumber(evaluatedKey))
                    throw createTypeError('b-key must evaluate to a string or number.');
                if (nextKeys.has(evaluatedKey))
                    throw createError(`Duplicate b-for key "${evaluatedKey}" from b-key="${keyExpression}".`);
                nextKeys.add(evaluatedKey);

                let row = rows.get(evaluatedKey);
                if (!row) {
                    rowContext.$ref = createRefs();
                    const rowElement = cloneProjectedNode(template);
                    const rowScope = createScope();
                    insertBefore(getParent(output.end)!, rowElement, output.end);
                    const range = rowScope.run(() => ownElementRange(rowElement, rowContext, runtime));
                    range.onRedirect(reconcilePositions);
                    row = { element: rowElement, context: rowContext, values: rowState, scope: rowScope, key: evaluatedKey, output: range };
                    rows.set(evaluatedKey, row);
                    try {
                        rowScope.run(() => hydrateNodeFn(rowElement, rowContext, runtime));
                    } catch (error) {
                        deleteItem(rows, evaluatedKey);
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
                ordered.push(row);
            }
            for (const [key, row] of rows) {
                if (nextKeys.has(key)) continue;
                try {
                    row.scope.dispose();
                } finally {
                    removeElement(row.output);
                    deleteItem(rows, key);
                }
            }
        } finally {
            reconciling = false;
        }
        reconcilePositions();
    });
}
