import { evaluate, execute, createExpressionScope } from '../core/expression';
import { state } from '../reactivity/state';
import { createScopedState } from '../core/scoped-state';
import { effect, batch } from '../reactivity/effect';
import { createScope, onCleanup } from '../core/scope';
import type { ComponentDefinition, DomRuntime } from './types';
import { getNodeOwner, ownNode } from './ownership';
import { emptyContextValues } from '../core/context-values';
import { createRefs } from './refs';

const projectedContexts = new WeakMap<Node, Record<PropertyKey, any>>();

export function takeProjectedContext(node: Node): Record<PropertyKey, any> | undefined {
    const context = projectedContexts.get(node);
    projectedContexts.delete(node);
    return context;
}

export function cloneProjectedNode<T extends Node>(node: T): T {
    const clone = node.cloneNode(true) as T;
    const copy = (source: Node, target: Node) => {
        const context = projectedContexts.get(source);
        if (context) projectedContexts.set(target, context);
        const children = Array.from(target.childNodes);
        Array.from(source.childNodes).forEach((child, index) => copy(child, children[index]));
        if (source instanceof HTMLTemplateElement && target instanceof HTMLTemplateElement)
            copy(source.content, target.content);
    };
    copy(node, clone);
    return clone;
}

function findSlots(root: ParentNode): Element[] {
    return Array.from(root.querySelectorAll('slot, template[b-template]')).flatMap(node =>
        node instanceof HTMLTemplateElement ? findSlots(node.content) : [node]);
}

export function fillSlots(
    host: Element,
    template: DocumentFragment,
    context: Record<PropertyKey, any>,
): void {
    const slots = new Map<string, Node[]>();
    for (const child of Array.from(host.childNodes)) {
        const name = child instanceof Element ? child.getAttribute('slot') ?? '' : '';
        const content = slots.get(name) ?? [];
        content.push(child);
        slots.set(name, content);
    }
    for (const outlet of findSlots(template)) {
        const name = outlet.getAttribute('name') ?? '';
        const content = slots.get(name);
        if (!content?.length) {
            outlet.replaceWith(...Array.from(outlet.childNodes));
            continue;
        }
        for (const node of content) projectedContexts.set(node, context);
        outlet.replaceWith(...content);
        slots.delete(name);
    }
    for (const remaining of slots.values())
        for (const node of remaining) node.parentNode?.removeChild(node);
}

export function mountComponent(
    element: Element,
    definition: ComponentDefinition,
    context: Record<PropertyKey, any>,
    runtime: DomRuntime,
    hydrateNodeFn: (node: Node, context: Record<PropertyKey, any>, runtime: DomRuntime) => void,
): void {
    const propsObject: Record<string, unknown> = {};
    for (const attribute of Array.from(element.attributes)) {
        if (!attribute.name.startsWith('b-')) propsObject[attribute.name] = attribute.value;
    }
    const propBindings = Array.from(element.attributes)
        .filter(attribute => attribute.name.startsWith('b-bind-') || attribute.name.startsWith('bind-'))
        .map(attribute => {
            const raw = attribute.name.startsWith('b-bind-')
                ? attribute.name.slice('b-bind-'.length)
                : attribute.name.slice('bind-'.length);
            return {
                name: raw.split('.')[0],
                expression: attribute.value,
            };
        });

    const $props = state(propsObject);
    const $ref = createRefs();
    const componentScope = createScope();
    onCleanup(() => componentScope.dispose());

    const $emit = (name: string, detail?: unknown) => {
        if (!/^[a-z][a-z0-9-]*$/.test(name))
            throw new TypeError(`Invalid component event name "${name}".`);
        element.dispatchEvent(new CustomEvent(name, { detail, bubbles: true }));
    };

    componentScope.run(() => {
        for (const attribute of Array.from(element.attributes)) {
            if (attribute.name.startsWith('b-on-') || attribute.name.startsWith('on-')) {
                const prefix = attribute.name.startsWith('b-on-') ? 'b-on-' : 'on-';
                const eventPart = attribute.name.slice(prefix.length).split('.')[0];
                if (!/^[a-z-]+$/.test(eventPart))
                    throw new SyntaxError(`Invalid component event directive "${attribute.name}".`);
                const expression = attribute.value;
                const handler = (event: Event) => batch(() =>
                    execute(expression, createExpressionScope({ $event: event }, context), event));
                element.addEventListener(eventPart, handler);
                onCleanup(() => element.removeEventListener(eventPart, handler));
            } else if (attribute.name.startsWith('b-') && !attribute.name.startsWith('b-bind-')) {
                throw new Error(`Directive "${attribute.name}" is not supported on component hosts.`);
            }
        }

        for (const binding of propBindings)
            $props[binding.name] = evaluate(binding.expression, context);
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

        for (const binding of propBindings) {
            effect(() => {
                $props[binding.name] = evaluate(binding.expression, context);
            });
        }

        const template = document.createElement('template');
        template.innerHTML = definition.template;

        fillSlots(element, template.content, context);
        element.replaceChildren(template.content);

        for (const child of Array.from(element.childNodes)) {
            hydrateNodeFn(child, componentContext, runtime);
        }

        for (const attribute of Array.from(element.attributes)) {
            if (attribute.name.startsWith('b-')) element.removeAttribute(attribute.name);
        }
    });
}
