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
    isString,
    objectEntries,
    isObjectType,
    isArray,
} from '../core/native';
import {
    getChildNodes, getAttribute, removeChild, getParent, removeAttribute,
    getOwnerDocument,
} from './native';
import { evaluate, createExpressionScope } from '../core/expression';
import { state } from '../reactivity/state';
import { createScopedState } from '../core/scoped-state';
import { batch, effect, untrack } from '../reactivity/effect';
import { createScope, onCleanup } from '../core/scope';
import type { ComponentDefinition, DomRuntime } from './types';
import { getNodeOwner, ownNode, withHydration } from './ownership';
import { emptyContextValues } from '../core/context-values';
import { createRefs } from './refs';
import { handleBind } from './directives/bind';
import { extractModifiers } from './directives/modifier';
import { handleOn, eventModifiers } from './directives/on';
import { checkOptionsUsed, collectOptions, readOptions } from './directives/registry';
import { handleTransition } from './directives/transition';
import { ownElementRange } from './range';

const projectedContexts = new WeakMap<Node, Record<PropertyKey, any>>();
const slotSources = Symbol('brio.slots');
type SlotSources = { nodes: Map<string, Node[]>; context: Record<PropertyKey, any> };

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
        if (arrayFrom(outlet[ATTRIBUTES]).some(attribute =>
            ['b-slot', 'b-bind-name'].includes(extractModifiers(attribute.name).baseName))) continue;
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

export function hydrateScopedSlot(
    element: Element,
    context: Record<PropertyKey, any>,
    runtime: DomRuntime,
    hydrate: (node: Node, context: Record<PropertyKey, any>, runtime: DomRuntime) => void,
): void {
    const sources = context[slotSources] as SlotSources | undefined;
    if (!sources) throw createError('b-slot requires a component template.');
    const values = state<Record<string, unknown>>({});
    effect(() => {
        const value: unknown = evaluate(getAttribute(element, 'b-slot')!, context, 'b-slot', element);
        if (!value || !isObjectType(value) || isArray(value))
            throw createTypeError('b-slot must evaluate to a non-null, non-array object.');
        const next = Object.fromEntries(objectEntries(value));
        untrack(() => batch(() => {
            for (const key of Object.keys(values)) if (!Object.hasOwn(next, key)) delete values[key];
            for (const [key, entry] of objectEntries(next))
                Object.defineProperty(values, key, { value: entry, enumerable: true, configurable: true, writable: true });
        }));
    });
    const range = ownElementRange(element, context, runtime);
    const supplied = sources.nodes.get(getAttribute(element, 'name') ?? '');
    const nodes = (supplied ?? arrayFrom(getChildNodes(element))).map(node => cloneProjectedNode(node));
    const projected = supplied ? createExpressionScope({ $slot: values }, sources.context) : context;
    const parent = range.end.parentNode!;
    element.remove();
    withHydration(parent, () => {
        for (const node of nodes) parent.insertBefore(node, range.end);
        for (const node of nodes)
            if (node.parentNode === parent) hydrate(node, projected, runtime);
    });
}

// Snapshot on first use; authored templates stay untouched and later edits cannot change new instances.
const parsedTemplates = new WeakMap<ComponentDefinition, { document: Document; content: DocumentFragment }>();
const templateSelector = /^#[A-Za-z][\w-]*$/;

const instantiateTemplate = (definition: ComponentDefinition, host: Element): DocumentFragment => {
    const ownerDocument = getOwnerDocument(host)!;
    const source = definition.template;
    let parsed = parsedTemplates.get(definition);
    if (!parsed || parsed.document !== ownerDocument) {
        let template = source as HTMLTemplateElement;
        if (isString(source)) {
            if (templateSelector.test(source)) {
                template = ownerDocument.getElementById(source.slice(1)) as HTMLTemplateElement;
                if (template?.localName !== TEMPLATE)
                    throw createError(`Component <${host.localName}> template "${source}" does not match a <template> element.`);
            } else {
                template = ownerDocument.createElement(TEMPLATE) as HTMLTemplateElement;
                template.innerHTML = source;
            }
        }
        const content = template.content.cloneNode(true) as DocumentFragment;
        parsedTemplates.set(definition, parsed = { document: ownerDocument, content });
    }
    return parsed.content.cloneNode(true) as DocumentFragment;
};

export function mountComponent(
    element: Element,
    definition: ComponentDefinition,
    context: Record<PropertyKey, any>,
    runtime: DomRuntime,
    hydrateNodeFn: (node: Node, context: Record<PropertyKey, any>, runtime: DomRuntime) => void,
): void {
    const propsObject: Record<string, unknown> = Object.create(null);
    const declared = definition.props ?? {};
    for (const [name, type] of objectEntries(declared)) if (type === Boolean) propsObject[name] = false;
    for (const attribute of arrayFrom(element[ATTRIBUTES])) {
        const { name, value } = attribute;
        if (startsWith(name, 'b-')) continue;
        const type = declared[name];
        propsObject[name] = type === Boolean ? value !== 'false' : type === Number ? Number(value) : value;
    }
    const attributes = arrayFrom(element[ATTRIBUTES]);
    const propBindings = attributes
        .filter(attribute => startsWith(attribute.name, 'b-prop-'))
        .map(attribute => {
            const raw = attribute.name.slice(getLength('b-prop-'));
            if (!/^[a-z][a-z0-9-]*$/.test(raw))
                throw createSyntaxError(`Invalid component prop directive "${attribute.name}". Props do not support modifiers.`);
            return {
                name: raw,
                directive: attribute.name,
                expression: attribute.value,
            };
        });

    const $props = state({ ...propsObject });
    const $ref = createRefs();
    const componentScope = createScope();
    onCleanup(() => componentScope.dispose());

    const $emit = (name: string, detail?: unknown) => {
        if (!/^[a-z][a-z0-9-]*$/.test(name))
            throw createTypeError(`Invalid component event name "${name}".`);
        element.dispatchEvent(new CustomEvent(name, { detail, bubbles: true }));
    };

    componentScope.run(() => {
        const options = collectOptions(element);
        const names: string[] = [];
        for (const attribute of arrayFrom(element[ATTRIBUTES])) {
            const { baseName, modifiers } = extractModifiers(attribute.name);
            if (modifiers.options) continue;
            names.push(baseName);
            if (startsWith(attribute.name, 'b-on-')) {
                if (!/^b-on-[a-z-]+$/.test(baseName))
                    throw createSyntaxError(`Invalid component event directive "${attribute.name}".`);
                handleOn(element, baseName, attribute.value, modifiers, context,
                    readOptions(options, baseName, eventModifiers, context, element));
            } else if (startsWith(attribute.name, 'b-bind-')) {
                handleBind(element, baseName, attribute.value, modifiers, context);
            } else if (startsWith(attribute.name, 'b-attr-')) {
                throw createSyntaxError(`${attribute.name} has been removed. Use b-bind-* for DOM bindings.`);
            } else if (extractModifiers(attribute.name).baseName === 'b-transition') {
                handleTransition(element, attribute.value, {}, context);
            } else if (startsWith(attribute.name, 'b-') && baseName !== 'b-props' && !startsWith(attribute.name, 'b-prop-')) {
                throw createError(`Directive "${attribute.name}" is not supported on component hosts.`);
            } else if (baseName === 'b-props' && attribute.name !== 'b-props') {
                throw createSyntaxError('b-props does not support modifiers.');
            }
        }
        checkOptionsUsed(options, names);

        // Evaluate inputs separately, then compose once so attribute/effect order cannot change precedence.
        const named = state<Record<string, unknown>>(Object.fromEntries(propBindings.map(binding => [binding.name, undefined])));
        for (const binding of propBindings) {
            effect(() => {
                named[binding.name] = evaluate(binding.expression, context, binding.directive, element);
            });
        }
        const spreadSource = getAttribute(element, 'b-props');
        effect(() => {
            const next = { ...propsObject, ...named };
            if (spreadSource !== null) {
                const spread: unknown = evaluate(spreadSource, context, 'b-props', element);
                if (!spread || !isObjectType(spread) || isArray(spread))
                    throw createTypeError('b-props must evaluate to a non-null, non-array object.');
                for (const [key, value] of objectEntries(spread))
                    Object.defineProperty(next, key, { value, enumerable: true, configurable: true, writable: true });
            }
            untrack(() => batch(() => {
                for (const key of Object.keys($props)) if (!Object.hasOwn(next, key)) delete $props[key];
                for (const [key, value] of objectEntries(next))
                    Object.defineProperty($props, key, { value, enumerable: true, configurable: true, writable: true });
            }));
        });
        const setupResult = definition.setup?.({
            el: element, $props, $emit, app: runtime.app,
            $stores: context.$stores ?? emptyContextValues,
            $provided: context.$provided ?? emptyContextValues,
            $ref,
            route: runtime.router?.route,
        }) ?? {};
        const local = createScopedState(setupResult, context.$data);
        const slotNodes = new Map<string, Node[]>();
        for (const node of arrayFrom(getChildNodes(element))) {
            const name = isInstanceOf(node, Element) ? getAttribute(node, 'slot') ?? '' : '';
            const nodes = slotNodes.get(name) ?? [];
            nodes.push(cloneProjectedNode(node));
            slotNodes.set(name, nodes);
        }
        const componentContext = createExpressionScope(
            { $data: local, $el: element, $props, $emit, $ref,
                [slotSources]: { nodes: slotNodes, context } satisfies SlotSources },
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
            // A root b-if consumes its b-else-if/b-else siblings, which must not hydrate again as strays.
            for (const child of arrayFrom(getChildNodes(element))) {
                if (getParent(child) === element && !getNodeOwner(child)) hydrateNodeFn(child, componentContext, runtime);
            }
        });

        for (const attribute of arrayFrom(element[ATTRIBUTES])) {
            if (startsWith(attribute.name, 'b-')) removeAttribute(element, attribute.name);
        }
    });
}
