import {
    getLength,
    arrayFrom,
    createTypeError,
    createSyntaxError,
    createError,
    isInstanceOf,
    deleteItem,
    startsWith,
    TEMPLATE,
    ATTRIBUTES,
} from '../core/native';
import {
    getChildNodes, getAttribute, removeChild, getParent, addEventListener, removeEventListener, removeAttribute,
    getOwnerDocument,
} from './native';
import { evaluate, execute, createExpressionScope } from '../core/expression';
import { state } from '../reactivity/state';
import { createScopedState } from '../core/scoped-state';
import { effect, batch } from '../reactivity/effect';
import { createScope, onCleanup } from '../core/scope';
import type { ComponentDefinition, DomRuntime } from './types';
import { getNodeOwner, ownNode, withHydration } from './ownership';
import { emptyContextValues } from '../core/context-values';
import { createRefs } from './refs';
import { handleBind } from './directives/bind';
import { extractModifiers } from './directives/modifier';

const projectedContexts = new WeakMap<Node, Record<PropertyKey, any>>();

export function takeProjectedContext(node: Node): Record<PropertyKey, any> | undefined {
    const context = projectedContexts.get(node);
    deleteItem(projectedContexts, node);
    return context;
}

// Sources already walked and found free of projected content; loop and branch templates are cloned repeatedly.
const projectionFree = new WeakSet<Node>();

const copyProjected = (source: Node, target: Node): boolean => {
    const context = projectedContexts.get(source);
    let found = !!context;
    if (context) projectedContexts.set(target, context);
    for (let child = source.firstChild, copy = target.firstChild; child && copy; child = child.nextSibling, copy = copy.nextSibling)
        found = copyProjected(child, copy) || found;
    if (isInstanceOf(source, HTMLTemplateElement) && isInstanceOf(target, HTMLTemplateElement))
        found = copyProjected(source.content, target.content) || found;
    return found;
};

export function cloneProjectedNode<T extends Node>(node: T): T {
    const clone = node.cloneNode(true) as T;
    if (!projectionFree.has(node) && !copyProjected(node, clone)) projectionFree.add(node);
    return clone;
}

/** A `<template>` carrying any `b-` directive (other than b-cloak, and unless b-ignore) renders in place, like `b-template`. */
export const isFragmentTemplate = (element: Element): boolean =>
    element.localName === TEMPLATE && !element.hasAttribute('b-ignore') &&
    arrayFrom(element[ATTRIBUTES]).some(({ name }) => startsWith(name, 'b-') && name !== 'b-cloak');

function findSlots(root: ParentNode): Element[] {
    return arrayFrom(root.querySelectorAll('slot, template')).flatMap(node =>
        isInstanceOf(node, HTMLTemplateElement) ? isFragmentTemplate(node) ? findSlots(node.content) : [] : [node]);
}

export function fillSlots(
    host: Element,
    template: DocumentFragment,
    context: Record<PropertyKey, any>,
): void {
    const slots = new Map<string, Node[]>();
    for (const child of arrayFrom(getChildNodes(host))) {
        const name = isInstanceOf(child, Element) ? getAttribute(child, 'slot') ?? '' : '';
        const content = slots.get(name) ?? [];
        content.push(child);
        slots.set(name, content);
    }
    for (const outlet of findSlots(template)) {
        const name = getAttribute(outlet, 'name') ?? '';
        const content = slots.get(name);
        if (!content?.length) {
            outlet.replaceWith(...arrayFrom(getChildNodes(outlet)));
            continue;
        }
        for (const node of content) projectedContexts.set(node, context);
        outlet.replaceWith(...content);
        deleteItem(slots, name);
    }
    for (const remaining of slots.values())
        for (const node of remaining) removeChild(getParent(node), node);
}

// Each definition's markup is parsed once per document and cloned for every instance.
const parsedTemplates = new WeakMap<ComponentDefinition, { source: string; document: Document; template: HTMLTemplateElement }>();

const instantiateTemplate = (definition: ComponentDefinition, host: Element): DocumentFragment => {
    const ownerDocument = getOwnerDocument(host)!;
    let parsed = parsedTemplates.get(definition);
    if (!parsed || parsed.source !== definition.template || parsed.document !== ownerDocument) {
        const template = ownerDocument.createElement(TEMPLATE) as HTMLTemplateElement;
        template.innerHTML = definition.template;
        parsedTemplates.set(definition, parsed = { source: definition.template, document: ownerDocument, template });
    }
    return parsed.template.content.cloneNode(true) as DocumentFragment;
};

export function mountComponent(
    element: Element,
    definition: ComponentDefinition,
    context: Record<PropertyKey, any>,
    runtime: DomRuntime,
    hydrateNodeFn: (node: Node, context: Record<PropertyKey, any>, runtime: DomRuntime) => void,
): void {
    const propsObject: Record<string, unknown> = {};
    for (const attribute of arrayFrom(element[ATTRIBUTES])) {
        if (!startsWith(attribute.name, 'b-')) propsObject[attribute.name] = attribute.value;
    }
    const propBindings = arrayFrom(element[ATTRIBUTES])
        .filter(attribute => startsWith(attribute.name, 'b-bind-') || startsWith(attribute.name, 'bind-'))
        .map(attribute => {
            const raw = startsWith(attribute.name, 'b-bind-')
                ? attribute.name.slice(getLength('b-bind-'))
                : attribute.name.slice(getLength('bind-'));
            return {
                name: raw.split('.')[0],
                directive: attribute.name,
                expression: attribute.value,
            };
        });

    const $props = state(propsObject);
    const $ref = createRefs();
    const componentScope = createScope();
    onCleanup(() => componentScope.dispose());

    const $emit = (name: string, detail?: unknown) => {
        if (!/^[a-z][a-z0-9-]*$/.test(name))
            throw createTypeError(`Invalid component event name "${name}".`);
        element.dispatchEvent(new CustomEvent(name, { detail, bubbles: true }));
    };

    componentScope.run(() => {
        for (const attribute of arrayFrom(element[ATTRIBUTES])) {
            if (startsWith(attribute.name, 'b-on-') || startsWith(attribute.name, 'on-')) {
                const prefix = startsWith(attribute.name, 'b-on-') ? 'b-on-' : 'on-';
                const eventPart = attribute.name.slice(getLength(prefix)).split('.')[0];
                if (!/^[a-z-]+$/.test(eventPart))
                    throw createSyntaxError(`Invalid component event directive "${attribute.name}".`);
                const expression = attribute.value;
                const handler = (event: Event) => batch(() =>
                    execute(expression, context, event, attribute.name, element));
                addEventListener(element, eventPart, handler);
                onCleanup(() => removeEventListener(element, eventPart, handler));
            } else if (startsWith(attribute.name, 'b-attr-')) {
                handleBind(element, extractModifiers(attribute.name).baseName, attribute.value,
                    extractModifiers(attribute.name).modifiers, context);
            } else if (startsWith(attribute.name, 'b-') && !startsWith(attribute.name, 'b-bind-')) {
                throw createError(`Directive "${attribute.name}" is not supported on component hosts.`);
            }
        }

        // Each bound prop is evaluated once here and re-evaluated only when its dependencies change.
        for (const binding of propBindings) {
            effect(() => {
                $props[binding.name] = evaluate(binding.expression, context, binding.directive, element);
            });
        }
        const setupResult = definition.setup?.({
            el: element, $props, $emit, app: runtime.app,
            $stores: context.$stores ?? emptyContextValues,
            $provided: context.$provided ?? emptyContextValues,
            $ref,
        }) ?? {};
        const local = createScopedState(setupResult, context.$data);
        const componentContext = createExpressionScope(
            { $data: local, $el: element, $props, $emit, $ref },
            context,
        );
        const owner = getNodeOwner(element);
        if (owner) {
            owner.context = componentContext;
        } else {
            ownNode(element, componentContext, runtime);
        }

        const content = instantiateTemplate(definition, element);
        fillSlots(element, content, context);
        element.replaceChildren(content);

        withHydration(element, () => {
            for (const child of arrayFrom(getChildNodes(element))) {
                hydrateNodeFn(child, componentContext, runtime);
            }
        });

        for (const attribute of arrayFrom(element[ATTRIBUTES])) {
            if (startsWith(attribute.name, 'b-')) removeAttribute(element, attribute.name);
        }
    });
}
