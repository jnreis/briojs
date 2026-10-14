import { evaluate } from '../../core/expression';
import { effect } from '../../reactivity/effect';
import { createScope, onCleanup } from '../../core/scope';
import type { Scope } from '../../core/scope';
import type { DomRuntime } from '../types';
import { cancelTransition, enterTransition, getTransitionName, leaveTransition } from './transition';
import { getNodeOwner, ownNode } from '../ownership';
import { extractModifiers } from './modifier';
import { combinedError } from '../../core/errors';

export function handleIf(
    element: Element,
    expression: string,
    modifiers: Record<string, boolean>,
    context: Record<PropertyKey, any>,
    runtime: DomRuntime,
    hydrateNodeFn: (node: Node, context: Record<PropertyKey, any>, runtime: DomRuntime) => void,
): void {
    const parent = element.parentNode;
    if (!parent) throw new Error('b-if requires an element with a parent node.');
    if (Object.keys(modifiers).some(name => !['hide', 'detach'].includes(name)))
        throw new SyntaxError('b-if supports only .hide and .detach modifiers.');
    if (modifiers.hide && modifiers.detach)
        throw new SyntaxError('b-if.hide and b-if.detach cannot be combined.');
    const preserved = Boolean(modifiers.hide || modifiers.detach);
    const branches: { template: Element; expression?: string }[] = [];
    const originals: Element[] = [];
    const addBranch = (node: Element, condition?: string) => {
        const attributes = Array.from(node.attributes);
        const conditional = attributes.filter(attribute =>
            ['b-if', 'b-else-if', 'b-else'].includes(extractModifiers(attribute.name).baseName));
        if (conditional.length !== 1)
            throw new SyntaxError('An element can have only one conditional directive.');
        if (node !== element && Object.keys(extractModifiers(conditional[0].name).modifiers).length)
            throw new SyntaxError('Conditional modifiers belong only on the leading b-if, not b-else-if or b-else.');
        if (attributes.some(attribute => ['b-show', 'show'].includes(extractModifiers(attribute.name).baseName)))
            throw new SyntaxError('b-show has been removed. Use b-if.detach or b-if.hide.');
        if (preserved && attributes.some(attribute =>
            ['b-for', 'b-template', 'template'].includes(extractModifiers(attribute.name).baseName)))
            throw new SyntaxError('b-if.hide and b-if.detach require a concrete branch element; wrap b-for or b-template in another element.');
        const template = node.cloneNode(true) as Element;
        template.removeAttribute(conditional[0].name);
        originals.push(node);
        branches.push({ template, expression: condition });
    };
    addBranch(element, expression);
    const nextBranch = (node: Element): Element | null => {
        let next = node.nextSibling;
        while (next && (next.nodeType === Node.COMMENT_NODE ||
            (next.nodeType === Node.TEXT_NODE && !next.textContent?.trim()))) next = next.nextSibling;
        return next?.nodeType === Node.ELEMENT_NODE ? next as Element : null;
    };
    let sibling = nextBranch(element);
    let ended = false;
    while (sibling) {
        const conditional = Array.from(sibling.attributes).find(attribute =>
            ['b-else-if', 'b-else'].includes(extractModifiers(attribute.name).baseName));
        if (!conditional) break;
        if (ended)
            throw new SyntaxError('b-else must be the last branch of a b-if chain.');
        ended = extractModifiers(conditional.name).baseName === 'b-else';
        addBranch(sibling, ended ? undefined : conditional.value);
        sibling = nextBranch(sibling);
    }

    const placeholder = element.ownerDocument.createComment('brio:if');
    ownNode(placeholder, context, runtime);
    parent.replaceChild(placeholder, element);
    originals.slice(1).forEach(node => node.remove());
    let stopCondition: ReturnType<typeof effect> | undefined;
    onCleanup(() => stopCondition?.());
    const selectBranch = () => branches.findIndex(candidate =>
        candidate.expression === undefined || Boolean(evaluate(candidate.expression, context)));

    type Instance = { index: number; element: HTMLElement; scope: Scope; anchor: Comment; display: string };
    const instances = new Map<number, Instance>();
    const anchors: Comment[] = [];
    let active: Instance | undefined;
    let activeBranch = -1;
    let initialized = false;
    const createAnchor = () => {
        const anchor = element.ownerDocument.createComment('brio:if:branch');
        ownNode(anchor, context, runtime);
        anchors.push(anchor);
        return anchor;
    };
    const destroy = (instance: Instance) => {
        instances.delete(instance.index);
        cancelTransition(instance.element);
        try {
            instance.scope.dispose();
        } finally {
            instance.element.remove();
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
        anchors.forEach(anchor => anchor.remove());
        placeholder.remove();
        if (errors.length) throw combinedError('Conditional branch cleanup failed.', errors);
    });

    const deactivate = (instance: Instance, animate: boolean) => {
        const current = instance.element;
        const name = getTransitionName(current);
        const finish = () => {
            if (!preserved) destroy(instance);
            else if (modifiers.hide) current.style.display = 'none';
            else current.remove();
        };
        if (animate && name && current.isConnected) leaveTransition(current, name, finish);
        else {
            cancelTransition(current);
            finish();
        }
    };
    const createInstance = (index: number, visible: boolean, anchor = placeholder): Instance => {
        const current = branches[index].template.cloneNode(true) as HTMLElement;
        const instance = {
            index, element: current, scope: createScope(), anchor,
            display: current.style.display === 'none' ? '' : current.style.display,
        };
        instances.set(index, instance);
        if (modifiers.hide) current.style.display = visible ? instance.display : 'none';
        if (visible || modifiers.hide) anchor.parentNode?.insertBefore(current, anchor.nextSibling);
        else element.ownerDocument.createDocumentFragment().append(current);
        try {
            instance.scope.run(() => hydrateNodeFn(current, context, runtime));
            const owner = getNodeOwner(current);
            if (owner) owner.structuralRoot = true;
            if (preserved && current.isConnected && current.parentNode !== parent) {
                instance.anchor = createAnchor();
                current.before(instance.anchor);
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
        else if (!current.parentNode) instance.anchor.parentNode?.insertBefore(current, instance.anchor.nextSibling);
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
                parent.insertBefore(anchor, cursor.nextSibling);
                const instance = createInstance(index, index === selected, anchor);
                cursor = instance.element.parentNode === parent ? instance.element : anchor;
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
