import {
    getLength,
    createError,
    objectKeys,
    createSyntaxError,
    arrayFrom,
    removeElement,
    deleteItem,
    includesItem,
    TEMPLATE,
    ATTRIBUTES,
} from '../../core/native';
import { getParent, removeAttribute, getNextSibling, getNodeType, getOwnerDocument, insertBefore } from '../native';
import { evaluate } from '../../core/expression';
import { effect } from '../../reactivity/effect';
import { createScope, onCleanup } from '../../core/scope';
import type { Scope } from '../../core/scope';
import type { DomRuntime } from '../types';
import { cancelTransition, enterTransition, getTransitionName, leaveTransition } from './transition';
import { getNodeOwner, ownNode } from '../ownership';
import { extractModifiers } from './modifier';
import { combinedError } from '../../core/errors';
import { ownElementRange } from '../range';
import type { DomRange } from '../range';
import { cloneProjectedNode } from '../components';

export function handleIf(
    element: Element,
    expression: string,
    modifiers: Record<string, boolean>,
    context: Record<PropertyKey, any>,
    runtime: DomRuntime,
    hydrateNodeFn: (node: Node, context: Record<PropertyKey, any>, runtime: DomRuntime) => void,
): void {
    const parent = getParent(element);
    if (!parent) throw createError('b-if requires an element with a parent node.');
    if (objectKeys(modifiers).some(name => !includesItem(['hide', 'detach'], name)))
        throw createSyntaxError('b-if supports only .hide and .detach modifiers.');
    if (modifiers.hide && modifiers.detach)
        throw createSyntaxError('b-if.hide and b-if.detach cannot be combined.');
    const preserved = Boolean(modifiers.hide || modifiers.detach);
    const branches: { template: Element; expression?: string }[] = [];
    const originals: Element[] = [];
    const addBranch = (node: Element, condition?: string) => {
        const attributes = arrayFrom(node[ATTRIBUTES]);
        const conditional = attributes.filter(attribute =>
            includesItem(['b-if', 'b-else-if', 'b-else'], extractModifiers(attribute.name).baseName));
        if (getLength(conditional) !== 1)
            throw createSyntaxError('An element can have only one conditional directive.');
        if (node.localName === TEMPLATE && !node.hasAttribute('b-template'))
            throw createSyntaxError(`<template ${extractModifiers(conditional[0].name).baseName}> would render inert template contents; add b-template to render them in place, or use a concrete element.`);
        if (node !== element && getLength(objectKeys(extractModifiers(conditional[0].name).modifiers)))
            throw createSyntaxError('Conditional modifiers belong only on the leading b-if, not b-else-if or b-else.');
        if (modifiers.hide && attributes.some(attribute =>
            includesItem(['b-for', 'b-template', TEMPLATE], extractModifiers(attribute.name).baseName)))
            throw createSyntaxError('b-if.hide requires a concrete branch element; wrap b-for or b-template in another element or use .detach.');
        const template = cloneProjectedNode(node);
        removeAttribute(template, conditional[0].name);
        originals.push(node);
        branches.push({ template, expression: condition });
    };
    addBranch(element, expression);
    const nextBranch = (node: Element): Element | null => {
        let next = getNextSibling(node);
        while (next && (getNodeType(next) === Node.COMMENT_NODE ||
            (getNodeType(next) === Node.TEXT_NODE && !next.textContent?.trim()))) next = getNextSibling(next);
        return next?.nodeType === Node.ELEMENT_NODE ? next as Element : null;
    };
    let sibling = nextBranch(element);
    let ended = false;
    while (sibling) {
        const conditional = arrayFrom(sibling[ATTRIBUTES]).find(attribute =>
            includesItem(['b-else-if', 'b-else'], extractModifiers(attribute.name).baseName));
        if (!conditional) break;
        if (ended)
            throw createSyntaxError('b-else must be the last branch of a b-if chain.');
        ended = extractModifiers(conditional.name).baseName === 'b-else';
        addBranch(sibling, ended ? undefined : conditional.value);
        sibling = nextBranch(sibling);
    }

    const output = ownElementRange(element, context, runtime);
    const placeholder = output.start;
    removeElement(element);
    originals.slice(1).forEach(removeElement);
    let stopCondition: ReturnType<typeof effect> | undefined;
    onCleanup(() => stopCondition?.());
    const selectBranch = () => branches.findIndex(candidate =>
        candidate.expression === undefined
        || Boolean(evaluate(candidate.expression, context, candidate === branches[0] ? 'b-if' : 'b-else-if', candidate.template)));

    type Instance = { index: number; element: HTMLElement; scope: Scope; anchor: Comment; display: string; output: DomRange };
    const instances = new Map<number, Instance>();
    const anchors: Comment[] = [];
    let active: Instance | undefined;
    let activeBranch = -1;
    let initialized = false;
    const createAnchor = () => {
        const anchor = getOwnerDocument(element).createComment('brio:if:branch');
        ownNode(anchor, context, runtime);
        anchors.push(anchor);
        return anchor;
    };
    const destroy = (instance: Instance) => {
        deleteItem(instances, instance.index);
        cancelTransition(instance.element);
        try {
            instance.scope.dispose();
        } finally {
            removeElement(instance.output);
        }
    };
    onCleanup(() => {
        const errors: unknown[] = [];
        for (const instance of instances.values()) {
            try {
                destroy(instance);
            } catch (error) {
                errors.push(error);
            }
        }
        anchors.forEach(removeElement);
        removeElement(placeholder);
        if (getLength(errors)) throw combinedError('Conditional branch cleanup failed.', errors);
    });

    const deactivate = (instance: Instance, animate: boolean) => {
        const current = instance.element;
        const name = getTransitionName(current);
        const finish = () => {
            if (!preserved) destroy(instance);
            else if (modifiers.hide) current.style.display = 'none';
            else instance.output.detach();
        };
        if (animate && name && current.isConnected) leaveTransition(current, name, finish);
        else {
            cancelTransition(current);
            finish();
        }
    };
    const createInstance = (index: number, visible: boolean, anchor = placeholder): Instance => {
        const current = cloneProjectedNode(branches[index].template) as HTMLElement;
        const scope = createScope();
        const destination = visible || modifiers.hide ? getParent(anchor)! :
            getOwnerDocument(element).createDocumentFragment();
        insertBefore(destination, current, destination === getParent(anchor) ? getNextSibling(anchor) : null);
        const range = scope.run(() => ownElementRange(current, context, runtime));
        const instance = {
            index, element: current, scope, anchor, output: range,
            display: current.style.display === 'none' ? '' : current.style.display,
        };
        instances.set(index, instance);
        if (modifiers.hide) current.style.display = visible ? instance.display : 'none';
        try {
            instance.scope.run(() => hydrateNodeFn(current, context, runtime));
            const owner = getNodeOwner(current);
            if (owner) owner.structuralRoot = true;
            if (preserved && range.start.isConnected && !includesItem(output.nodes(), range.start)) {
                instance.anchor = createAnchor();
                range.start.before(instance.anchor);
            }
            if (!visible) deactivate(instance, false);
            return instance;
        } catch (error) {
            try {
                destroy(instance);
            } catch (cleanupError) {
                throw combinedError('Conditional hydration and cleanup both failed.', [error, cleanupError]);
            }
            throw error;
        }
    };
    const activate = (index: number, animate: boolean): Instance => {
        const instance = instances.get(index);
        if (!instance) return createInstance(index, true);
        const current = instance.element;
        if (modifiers.hide) current.style.display = instance.display;
        else if (getParent(instance.output.start)?.nodeType === Node.DOCUMENT_FRAGMENT_NODE && getParent(instance.anchor))
            instance.output.moveBefore(getParent(instance.anchor)!, getNextSibling(instance.anchor));
        const name = getTransitionName(current);
        if (animate && name) enterTransition(current, name);
        else cancelTransition(current);
        return instance;
    };
    stopCondition = effect(() => {
        let selected = selectBranch();
        const initial = !initialized;
        initialized = true;
        if (initial && preserved) {
            let cursor: Node = placeholder;
            for (const index of branches.keys()) {
                const anchor = createAnchor();
                insertBefore(parent, anchor, getNextSibling(cursor));
                const instance = createInstance(index, index === selected, anchor);
                cursor = getParent(instance.output.end) === parent ? instance.output.end : anchor;
            }
            activeBranch = selected;
            active = instances.get(selected);
            selected = selectBranch();
        }
        if (selected === activeBranch) return;
        const previous = active;
        active = undefined;
        activeBranch = selected;
        if (previous) deactivate(previous, !initial);
        if (selected >= 0) active = activate(selected, !initial);
    });
}
