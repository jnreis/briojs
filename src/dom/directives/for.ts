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
    ATTRIBUTES,
    B_TELEPORT,
    TELEPORT,
    TEMPLATE,
} from '../../core/native';
import { getParent, getAttribute, removeAttribute, getOwnerDocument, insertBefore, getChildNodes, getNextSibling } from '../native';
import { createExpressionScope, evaluate } from '../../core/expression';
import { effect } from '../../reactivity/effect';
import { createScope, onCleanup } from '../../core/scope';
import { createScopedState } from '../../core/scoped-state';
import type { Scope } from '../../core/scope';
import type { DomRuntime } from '../types';
import { getNodeOwner } from '../ownership';
import { createDomRange, createElementRange, ownElementRange } from '../range';
import { extractModifiers } from './modifier';
import type { DomRange, PortalDestination } from '../range';
import { combinedError } from '../../core/errors';
import { cloneProjectedNode } from '../components';
import { defineLazyRefs } from '../refs';

type LoopRow = {
    element: Element;
    context: Record<PropertyKey, any>;
    values: Record<string, unknown>;
    item: unknown;
    index: unknown;
    scope: Scope;
    key: string | number;
    output: DomRange<ChildNode>;
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

// Indexed sources omit `keys`; object entries supply them.
const enumerate = (value: unknown): { items: unknown[]; keys?: unknown[] } => {
    if (value === null || value === undefined) return { items: [] };
    if (isArray(value) || (isObjectType(value) && Symbol.iterator in value))
        return { items: arrayFrom(value as Iterable<unknown>) };
    if (isObjectType(value)) {
        const entries = objectEntries(value);
        return { keys: entries.map(entry => entry[0]), items: entries.map(entry => entry[1]) };
    }
    if (isNumber(value) && Number.isInteger(value) && value >= 0)
        return { items: arrayFrom({ length: value }, (_, index) => index + 1) };
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
    // Rows that cannot be teleported or expand into template content are their own range, without anchors.
    const anchorless = template.localName !== TEMPLATE && !arrayFrom(template[ATTRIBUTES]).some(({ name }) => {
        const { baseName } = extractModifiers(name);
        return baseName === B_TELEPORT || baseName === TELEPORT || baseName === 'b-template';
    });

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

    // Emptying the loop: when the parent holds only this loop's anchors, its rows and blank text,
    // one `textContent` write replaces a thousand individual removals.
    const clearAll = () => {
        const host = getParent(output.end)!;
        const kept: ChildNode[] = [];
        let blank = true;
        for (let node = host.firstChild; node; node = getNextSibling(node)) {
            if (node === output.start) node = output.end;
            else if (node.nodeType !== Node.TEXT_NODE || (node.nodeValue ?? '').trim()) {
                blank = false;
                break;
            }
            kept.push(node);
            if (getLength(kept) > 16) {
                blank = false;
                break;
            }
        }
        if (!blank || getLength(getChildNodes(host)) !== rows.size + getLength(kept) + 1) return;
        try {
            for (const row of rows.values()) row.scope.dispose();
        } finally {
            rows.clear();
            host.textContent = '';
            for (const node of kept) {
                if (node === output.end) host.appendChild(output.start);
                host.appendChild(node);
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
            const { items, keys } = enumerate(evaluate(collectionExpression, context, 'b-for', element));
            const nextKeys = new Set<string | number>();
            // Keys are read through one reusable probe so existing rows cost no per-row state or context.
            const probe: Record<PropertyKey, unknown> = { $parent: context.$for };
            const keyContext = keyExpression ? createExpressionScope({ $for: probe }, context) : undefined;
            const rowKeys: (string | number)[] = [];
            let survivors = 0;
            for (let position = 0; position < getLength(items); position++) {
                let evaluatedKey: unknown = keys ? keys[position] : position;
                if (keyContext) {
                    probe[itemName] = items[position];
                    probe[indexName] = evaluatedKey;
                    evaluatedKey = evaluate(keyExpression!, keyContext, 'b-key', element);
                }
                if (!isString(evaluatedKey) && !isNumber(evaluatedKey))
                    throw createTypeError('b-key must evaluate to a string or number.');
                if (nextKeys.has(evaluatedKey))
                    throw createError(`Duplicate b-for key "${evaluatedKey}" from b-key="${keyExpression}".`);
                nextKeys.add(evaluatedKey);
                rowKeys.push(evaluatedKey);
                if (rows.has(evaluatedKey)) survivors++;
            }
            // Nothing survives (clear or full replace): drop every old row at once before building new ones.
            if (!survivors && rows.size && anchorless && !getLength(portals)) clearAll();
            ordered = [];
            for (let position = 0; position < getLength(items); position++) {
                const item = items[position];
                const index = keys ? keys[position] : position;
                const evaluatedKey = rowKeys[position];
                let row = rows.get(evaluatedKey);
                if (!row) {
                    const rowState = createScopedState({ [itemName]: item, [indexName]: index }, context.$for);
                    const rowContext = defineLazyRefs(createExpressionScope({ $for: rowState }, context));
                    const rowElement = cloneProjectedNode(template);
                    const rowScope = createScope();
                    insertBefore(getParent(output.end)!, rowElement, output.end);
                    const range: DomRange<ChildNode> = anchorless
                        ? createElementRange(rowElement)
                        : rowScope.run(() => ownElementRange(rowElement, rowContext, runtime));
                    range.onRedirect(reconcilePositions);
                    row = { element: rowElement, context: rowContext, values: rowState, item, index, scope: rowScope, key: evaluatedKey, output: range };
                    rows.set(evaluatedKey, row);
                    try {
                        rowScope.run(() => hydrateNodeFn(rowElement, rowContext, runtime));
                    } catch (error) {
                        deleteItem(rows, evaluatedKey);
                        try {
                            rowScope.dispose();
                        } catch (cleanupError) {
                            throw combinedError('Loop hydration and cleanup both failed.', [error, cleanupError]);
                        } finally {
                            removeElement(range);
                        }
                        throw error;
                    }
                    const owner = getNodeOwner(rowElement);
                    if (owner) owner.structuralRoot = owner.loopRow = true;
                } else {
                    if (row.item !== item) row.values[itemName] = row.item = item;
                    if (row.index !== index) row.values[indexName] = row.index = index;
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
