import { assign, createExpressionScope, evaluate, execute } from './expression';
import { batch, createScope, effect, onCleanup, state } from './reactivity';
import type { Scope } from './reactivity';
import type { Router } from './router';
import { causedError } from './errors';

export type ComponentContext = {
    el: Element;
    props: Record<string, unknown>;
    emit(name: string, detail?: unknown): void;
    app: unknown;
};

export type ComponentDefinition = {
    template: string;
    setup?: (context: ComponentContext) => Record<string, unknown> | void;
};

export type DomRuntime = {
    app: unknown;
    state: Record<string, unknown>;
    components: Map<string, ComponentDefinition>;
    router?: Router;
};

const trustedMarkup = Symbol('brio.trustedMarkup');
const projectedContexts = new WeakMap<Node, Record<PropertyKey, any>>();
const staticClasses = new WeakMap<Element, Set<string>>();
const dynamicStyles = new WeakMap<Element, Set<string>>();
const componentNamePattern = /^[a-z][a-z0-9]*-[a-z0-9-]+$/;
const directiveNamePattern = /^b-[a-z-]+$/;

export type TrustedMarkup = { readonly [trustedMarkup]: string };

export function trustedHTML(markup: string): TrustedMarkup {
    return { [trustedMarkup]: markup };
}

const getExpression = (expression: string, context: Record<PropertyKey, any>) =>
    evaluate(expression, context);

const registerEventBindings = (
    element: Element,
    context: Record<PropertyKey, any>,
) => {
    for (const attribute of Array.from(element.attributes)) {
        if (!attribute.name.startsWith('b-on-')) continue;
        if (!directiveNamePattern.test(attribute.name))
            throw new SyntaxError(`Invalid Brio directive name "${attribute.name}".`);
        const eventName = attribute.name.slice('b-on-'.length);
        if (!eventName) throw new SyntaxError(`Brio event directive "${attribute.name}" has no event name.`);
        const source = attribute.value;
        const handler = (event: Event) => batch(() =>
            execute(source, createExpressionScope({ $event: event }, context), event));
        element.addEventListener(eventName, handler);
        onCleanup(() => element.removeEventListener(eventName, handler));
        element.removeAttribute(attribute.name);
    }
};

const setBoundValue = (element: Element, name: string, value: unknown) => {
    if (name === 'class') {
        let staticNames = staticClasses.get(element);
        if (!staticNames) {
            staticNames = new Set((element.getAttribute('class') ?? '').split(/\s+/).filter(Boolean));
            staticClasses.set(element, staticNames);
        }
        const currentDynamic = new Set<string>();
        if (typeof value === 'string')
            value.split(/\s+/).filter(Boolean).forEach(className => currentDynamic.add(className));
        else if (Array.isArray(value))
            value.filter(Boolean).forEach(className => String(className).split(/\s+/).filter(Boolean).forEach(name => currentDynamic.add(name)));
        else if (value && typeof value === 'object') {
            for (const [className, enabled] of Object.entries(value))
                if (enabled) className.split(/\s+/).filter(Boolean).forEach(name => currentDynamic.add(name));
        }
        const combined = new Set([...staticNames, ...currentDynamic]);
        if (combined.size) element.setAttribute('class', Array.from(combined).join(' '));
        else element.removeAttribute('class');
        return;
    }
    if (name === 'style' && value && typeof value === 'object') {
        const style = (element as HTMLElement).style;
        const previousProperties = dynamicStyles.get(element) ?? new Set<string>();
        const currentProperties = new Set<string>();
        const properties = Object.entries(value as Record<string, unknown>);
        for (const [property] of properties) {
            const normalized = property.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
            currentProperties.add(normalized);
            previousProperties.delete(normalized);
        }
        for (const property of previousProperties) style.removeProperty(property);
        for (const [property, propertyValue] of properties) {
            const normalized = property.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
            if (propertyValue === null || propertyValue === undefined || propertyValue === false)
                style.removeProperty(normalized);
            else style.setProperty(
                normalized,
                String(propertyValue),
            );
        }
        dynamicStyles.set(element, currentProperties);
        return;
    }
    if (name in element && !name.startsWith('aria-') && !name.startsWith('data-')) {
        try {
            (element as unknown as Record<string, unknown>)[name] = value;
            return;
        } catch (error) {
            throw causedError(`Unable to bind "${name}" on <${element.tagName.toLowerCase()}>.`, error);
        }
    }
    if (value === null || value === undefined || value === false) element.removeAttribute(name);
    else element.setAttribute(name, value === true ? '' : String(value));
};

const registerBindings = (
    element: Element,
    context: Record<PropertyKey, any>,
) => {
    for (const attribute of Array.from(element.attributes)) {
        if (!attribute.name.startsWith('b-bind-')) continue;
        if (!directiveNamePattern.test(attribute.name))
            throw new SyntaxError(`Invalid Brio directive name "${attribute.name}".`);
        const property = attribute.name.slice('b-bind-'.length);
        if (!property) throw new SyntaxError(`Brio binding directive "${attribute.name}" has no target.`);
        const expression = attribute.value;
        effect(() => setBoundValue(element, property, getExpression(expression, context)));
        element.removeAttribute(attribute.name);
    }
};

const registerModel = (element: Element, expression: string, context: Record<PropertyKey, any>) => {
    if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement))
        throw new TypeError('b-model can only be used on input, textarea, and select elements.');

    const updateState = () => {
        const input = element as HTMLInputElement;
        const current = getExpression(expression, context);
        if (element instanceof HTMLSelectElement && element.multiple) {
            assign(expression, context, Array.from(element.selectedOptions, option => option.value));
        } else if (input.type === 'checkbox' && Array.isArray(current)) {
            const values = current.slice() as unknown[];
            const index = values.indexOf(input.value);
            if (input.checked && index < 0) values.push(input.value);
            else if (!input.checked && index >= 0) values.splice(index, 1);
            assign(expression, context, values);
        } else if (input.type === 'checkbox') assign(expression, context, input.checked);
        else if (input.type === 'radio') {
            if (input.checked) assign(expression, context, input.value);
        } else assign(expression, context, element.value);
    };
    element.addEventListener('input', updateState);
    element.addEventListener('change', updateState);
    onCleanup(() => {
        element.removeEventListener('input', updateState);
        element.removeEventListener('change', updateState);
    });
    const updateElement = (value: unknown) => {
        const input = element as HTMLInputElement;
        if (element instanceof HTMLSelectElement && element.multiple && Array.isArray(value)) {
            const selected = new Set(value.map(String));
            for (const option of Array.from(element.options)) option.selected = selected.has(option.value);
        } else if (input.type === 'checkbox')
            input.checked = Array.isArray(value) ? value.includes(input.value) : Boolean(value);
        else if (input.type === 'radio') input.checked = Object.is(value, input.value);
        else if (element.value !== String(value ?? '')) element.value = String(value ?? '');
    };
    effect(() => updateElement(getExpression(expression, context)));
    if (element instanceof HTMLSelectElement) {
        const observer = new MutationObserver(() => updateElement(getExpression(expression, context)));
        observer.observe(element, { childList: true, subtree: true });
        onCleanup(() => observer.disconnect());
    }
    element.removeAttribute('b-model');
};

const makeChildContext = (
    parent: Record<PropertyKey, any>,
    data: Record<string, unknown>,
) => createExpressionScope(state(data), parent);

const mountConditional = (
    element: Element,
    expression: string,
    context: Record<PropertyKey, any>,
    runtime: DomRuntime,
) => {
    const parent = element.parentNode;
    if (!parent) throw new Error('b-if requires an element with a parent node.');
    const placeholder = document.createComment('brio:if');
    const template = element.cloneNode(true) as Element;
    template.removeAttribute('b-if');
    parent.replaceChild(placeholder, element);
    let instance: Element | undefined;
    let instanceScope: Scope | undefined;

    onCleanup(() => {
        try {
            instanceScope?.dispose();
        } finally {
            instance?.remove();
            placeholder.remove();
        }
    });

    effect(() => {
        if (getExpression(expression, context)) {
            if (instance) return;
            instance = template.cloneNode(true) as Element;
            instanceScope = createScope();
            placeholder.parentNode?.insertBefore(instance, placeholder.nextSibling);
            instanceScope.run(() => hydrateNode(instance!, context, runtime));
        } else if (instance) {
            try {
                instanceScope?.dispose();
            } finally {
                instance?.remove();
                instance = undefined;
                instanceScope = undefined;
            }
        }
    });
};

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

const mountLoop = (
    element: Element,
    expression: string,
    context: Record<PropertyKey, any>,
    runtime: DomRuntime,
) => {
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
        const entries = enumerate(getExpression(collectionExpression, context));
        const nextKeys = new Set<string | number>();
        let cursor: Node = placeholder;
        for (const [index, item] of entries) {
            const rowState = state<Record<string, unknown>>({ [itemName]: item, [indexName]: index });
            const rowContext = createExpressionScope(rowState, context);
            const evaluatedKey = keyExpression ? getExpression(keyExpression, rowContext) : index;
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
                rowScope.run(() => hydrateNode(rowElement, rowContext, runtime));
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
};

const fillSlots = (
    host: Element,
    template: DocumentFragment,
    context: Record<PropertyKey, any>,
) => {
    const slots = new Map<string, Node[]>();
    for (const child of Array.from(host.childNodes)) {
        const name = child instanceof Element ? child.getAttribute('slot') ?? '' : '';
        const content = slots.get(name) ?? [];
        content.push(child);
        slots.set(name, content);
    }
    for (const outlet of Array.from(template.querySelectorAll('slot'))) {
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
};

const mountComponent = (
    element: Element,
    definition: ComponentDefinition,
    context: Record<PropertyKey, any>,
    runtime: DomRuntime,
) => {
    const propsObject: Record<string, unknown> = {};
    for (const attribute of Array.from(element.attributes)) {
        if (!attribute.name.startsWith('b-')) propsObject[attribute.name] = attribute.value;
    }
    const propBindings = Array.from(element.attributes)
        .filter(attribute => attribute.name.startsWith('b-bind-'))
        .map(attribute => ({
            name: attribute.name.slice('b-bind-'.length),
            expression: attribute.value,
        }));
    const props = state(propsObject);
    const componentScope = createScope();
    onCleanup(() => componentScope.dispose());
    const emit = (name: string, detail?: unknown) => {
        if (!/^[a-z][a-z0-9-]*$/.test(name))
            throw new TypeError(`Invalid component event name "${name}".`);
        element.dispatchEvent(new CustomEvent(name, { detail, bubbles: true }));
    };
    componentScope.run(() => {
        for (const attribute of Array.from(element.attributes)) {
            if (attribute.name.startsWith('b-on-')) {
                const eventName = attribute.name.slice('b-on-'.length);
                if (!/^[a-z-]+$/.test(eventName))
                    throw new SyntaxError(`Invalid component event directive "${attribute.name}".`);
                const expression = attribute.value;
                const handler = (event: Event) => batch(() =>
                    execute(expression, createExpressionScope({ $event: event }, context), event));
                element.addEventListener(eventName, handler);
                onCleanup(() => element.removeEventListener(eventName, handler));
            } else if (attribute.name.startsWith('b-') && !attribute.name.startsWith('b-bind-')) {
                throw new Error(`Directive "${attribute.name}" is not supported on component hosts.`);
            }
        }
        for (const binding of propBindings)
            props[binding.name] = getExpression(binding.expression, context);
        const setupResult = definition.setup?.({ el: element, props, emit, app: runtime.app }) ?? {};
        const local = state({ ...setupResult, $el: element, props, emit });
        const componentContext = createExpressionScope(local, context);

        for (const binding of propBindings) {
            effect(() => {
                props[binding.name] = getExpression(binding.expression, context);
            });
        }

        const template = document.createElement('template');
        template.innerHTML = definition.template;
        fillSlots(element, template.content, context);
        element.replaceChildren(template.content);
        for (const child of Array.from(element.childNodes)) {
            const childContext = projectedContexts.get(child) ?? componentContext;
            projectedContexts.delete(child);
            hydrateNode(child, childContext, runtime);
        }
        for (const attribute of Array.from(element.attributes)) {
            if (attribute.name.startsWith('b-')) element.removeAttribute(attribute.name);
        }
    });
};

const mountRouterOutlet = (
    element: Element,
    context: Record<PropertyKey, any>,
    runtime: DomRuntime,
) => {
    if (!runtime.router) throw new Error('b-router-outlet requires a router on the Brio app.');
    const router = runtime.router;
    let childScope: Scope | undefined;
    let childElement: Element | undefined;
    onCleanup(() => {
        try {
            childScope?.dispose();
        } finally {
            childElement?.remove();
        }
    });
    effect(() => {
        const route = router.current.value;
        try {
            childScope?.dispose();
        } finally {
            childElement?.remove();
        }
        childScope = undefined;
        childElement = undefined;
        if (!route) return;
        const definition = runtime.components.get(route.component);
        if (!definition) throw new Error(`No component registered for route "${route.component}".`);
        childElement = document.createElement(route.component);
        childScope = createScope();
        element.append(childElement);
        childScope.run(() => mountComponent(childElement!, definition, context, runtime));
    });
};

const hydrateChildren = (
    element: Element,
    context: Record<PropertyKey, any>,
    runtime: DomRuntime,
) => {
    for (const child of Array.from(element.childNodes)) {
        const projectedContext = projectedContexts.get(child);
        if (projectedContext) projectedContexts.delete(child);
        hydrateNode(child, projectedContext ?? context, runtime);
    }
};

export function hydrateNode(
    node: Node,
    parentContext: Record<PropertyKey, any>,
    runtime: DomRuntime,
): void {
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const element = node as Element;
    if (element.hasAttribute('b-ignore')) return;

    let context = createExpressionScope({ $el: element }, parentContext);
    const dataExpression = element.getAttribute('b-data');
    if (dataExpression !== null) {
        const data = getExpression(dataExpression, context);
        if (data === null || typeof data !== 'object')
            throw new TypeError('b-data must evaluate to an object.');
        context = makeChildContext(parentContext, data);
        element.removeAttribute('b-data');
    }

    for (const attribute of Array.from(element.attributes)) {
        if (attribute.name.startsWith('b-') && !directiveNamePattern.test(attribute.name))
            throw new SyntaxError(`Invalid Brio directive name "${attribute.name}". Directive names use letters and hyphens only.`);
    }

    const ifExpression = element.getAttribute('b-if');
    if (ifExpression !== null) {
        mountConditional(element, ifExpression, context, runtime);
        return;
    }
    const forExpression = element.getAttribute('b-for');
    if (forExpression !== null) {
        mountLoop(element, forExpression, context, runtime);
        return;
    }

    const tagName = element.tagName.toLowerCase();
    const definition = componentNamePattern.test(tagName) ? runtime.components.get(tagName) : undefined;
    if (!definition) {
        registerEventBindings(element, context);
        registerBindings(element, context);
    }

    if (definition) {
        mountComponent(element, definition, context, runtime);
        return;
    }

    const textExpression = element.getAttribute('b-text');
    if (textExpression !== null) {
        effect(() => {
            const value = getExpression(textExpression, context);
            element.textContent = value === null || value === undefined ? '' : String(value);
        });
        element.removeAttribute('b-text');
    }

    const showExpression = element.getAttribute('b-show');
    if (showExpression !== null) {
        const display = (element as HTMLElement).style.display;
        effect(() => {
            (element as HTMLElement).style.display = getExpression(showExpression, context) ? display : 'none';
        });
        element.removeAttribute('b-show');
    }

    const modelExpression = element.getAttribute('b-model');
    if (modelExpression !== null) registerModel(element, modelExpression, context);

    if (element.hasAttribute('b-html')) {
        const expression = element.getAttribute('b-html')!;
        let contentScope: Scope | undefined;
        onCleanup(() => contentScope?.dispose());
        effect(() => {
            const html = getExpression(expression, context) as TrustedMarkup;
            if (!html || typeof html !== 'object' || !(trustedMarkup in html))
                throw new TypeError('b-html requires a value created by trustedHTML().');
            contentScope?.dispose();
            contentScope = createScope();
            const template = document.createElement('template');
            template.innerHTML = html[trustedMarkup];
            element.replaceChildren(template.content);
            contentScope.run(() => hydrateChildren(element, context, runtime));
        });
        element.removeAttribute('b-html');
        return;
    }

    if (element.hasAttribute('b-router-outlet')) {
        mountRouterOutlet(element, context, runtime);
        element.removeAttribute('b-router-outlet');
        return;
    }

    for (const attribute of Array.from(element.attributes)) {
        if (attribute.name.startsWith('b-'))
            throw new Error(`Unknown Brio directive "${attribute.name}".`);
    }

    if (textExpression === null) hydrateChildren(element, context, runtime);
}

export function hydrateRoot(
    root: Element,
    context: Record<PropertyKey, any>,
    runtime: DomRuntime,
): void {
    hydrateNode(root, context, runtime);
}
