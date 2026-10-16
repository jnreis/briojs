import { createExpressionScope } from '../core/expression';
import { createScope, onCleanup } from '../core/scope';
import type { Scope } from '../core/scope';
import { effect } from '../reactivity/effect';
import type { DomRuntime } from './types';
import { mountComponent, takeProjectedContext } from './components';
import { prepareTransition } from './directives/transition';
import { createInsert } from './insert';
import { getNodeOwner, ownNode } from './ownership';
import { emptyContextValues } from '../core/context-values';
import { interpolateText } from './interpolation';

export function mountRouterOutlet(
    element: Element,
    context: Record<PropertyKey, any>,
    runtime: DomRuntime,
    hydrateNodeFn: (node: Node, context: Record<PropertyKey, any>, runtime: DomRuntime) => void,
): void {
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
        const el = document.createElement(route.component);
        childElement = el;
        childScope = createScope();
        element.append(el);
        childScope.run(() => mountComponent(el, definition, context, runtime, hydrateNodeFn));
    });
}

const componentNamePattern = /^[a-z][a-z0-9]*-[a-z0-9-]+$/;

import {
    handleBind,
    handleOn,
    handleModel,
    handleIf,
    handleFor,
    handleHtml,
    handleText,
    handleData,
    handleProvide,
    handleId,
    handleIgnore,
    handleMask,
    handleTeleport,
    handleTemplate,
    handleTransition,
    handleIntersection,
    handleMutation,
    handleResize,
    handleEffect,
    handleScript,
    extractModifiers,
} from './directives';

export function hydrateChildren(
    element: Element,
    context: Record<PropertyKey, any>,
    runtime: DomRuntime,
): void {
    for (const child of Array.from(element.childNodes)) {
        if (child.parentNode === element && !getNodeOwner(child)) hydrateNode(child, context, runtime);
    }
}

export function hydrateTextNode(
    node: Text,
    context: Record<PropertyKey, any>,
): void {
    const raw = node.nodeValue ?? '';
    if (!raw.includes('${')) return;

    effect(() => {
        node.nodeValue = interpolateText(raw, context);
    });
}

export function hydrateNode(
    node: Node,
    parentContext: Record<PropertyKey, any>,
    runtime: DomRuntime,
): void {
    if (getNodeOwner(node)) throw new Error('Cannot hydrate an already hydrated Brio node.');
    parentContext = takeProjectedContext(node) ?? parentContext;
    const scope = createScope();
    scope.run(() => {
        ownNode(node, parentContext, runtime);
        hydrateOwnedNode(node, parentContext, runtime);
    });
}

function hydrateOwnedNode(
    node: Node,
    parentContext: Record<PropertyKey, any>,
    runtime: DomRuntime,
): void {
    if (node.nodeType === Node.TEXT_NODE) {
        hydrateTextNode(node as Text, parentContext);
        return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const element = node as Element;

    // 1. b-ignore
    if (element.hasAttribute('b-ignore') || element.hasAttribute('ignore')) {
        getNodeOwner(element)!.controlsChildren = true;
        handleIgnore(element);
        return;
    }

    const conditionalAttributes = Array.from(element.attributes).filter(attribute =>
        ['b-if', 'b-else-if', 'b-else'].includes(extractModifiers(attribute.name).baseName));
    if (conditionalAttributes.length > 1)
        throw new SyntaxError('An element can have only one conditional directive.');
    const ifAttr = conditionalAttributes[0];
    if (ifAttr && extractModifiers(ifAttr.name).baseName === 'b-if') {
        handleIf(element, ifAttr.value, extractModifiers(ifAttr.name).modifiers, parentContext, runtime, hydrateNode);
        return;
    }
    if (ifAttr)
        throw new SyntaxError('b-else-if and b-else require an adjacent preceding b-if branch.');

    let context = createExpressionScope({
        $el: element,
        $stores: parentContext.$stores ?? emptyContextValues,
        $provided: parentContext.$provided ?? emptyContextValues,
        ...(runtime.root ? { $insert: createInsert(runtime) } : {}),
    }, parentContext);

    // 2. b-data
    const dataAttr = element.getAttribute('b-data');
    if (dataAttr !== null) {
        context = handleData(element, dataAttr, {}, context);
        element.removeAttribute('b-data');
    }

    // 3. b-id
    const idAttr = element.getAttribute('b-id');
    if (idAttr !== null) {
        context = handleId(element, idAttr, {}, context);
        element.removeAttribute('b-id');
    }
    getNodeOwner(element)!.context = context;

    // 5. b-for
    const forAttr = element.getAttribute('b-for');
    if (forAttr !== null) {
        const { modifiers } = extractModifiers('b-for');
        handleFor(element, forAttr, modifiers, context, runtime, hydrateNode);
        return;
    }

    const provideAttr = element.getAttribute('b-provide');
    if (provideAttr !== null) {
        context = handleProvide(provideAttr, context);
        element.removeAttribute('b-provide');
        getNodeOwner(element)!.context = context;
    }

    // 6. b-template
    const templateAttr = element.getAttribute('b-template');
    if (templateAttr !== null) {
        handleTemplate(element, templateAttr, {}, context, runtime, hydrateNode);
        return;
    }

    // 7. Component tags
    const tagName = element.tagName.toLowerCase();
    const isComponent = componentNamePattern.test(tagName);
    const definition = isComponent ? runtime.components.get(tagName) : undefined;

    if (definition) {
        mountComponent(element, definition, context, runtime, hydrateNode);
        return;
    }

    // 8. Directives & Event Bindings
    let hasText = false;
    let hasHtml = false;
    const transitionAttr = Array.from(element.attributes)
        .find(attribute => ['b-transition', 'transition'].includes(extractModifiers(attribute.name).baseName));
    if (transitionAttr) prepareTransition(element, transitionAttr.value);

    // Scan element attributes
    for (const attribute of Array.from(element.attributes)) {
        const attrName = attribute.name;
        const attrValue = attribute.value;
        const { baseName, modifiers } = extractModifiers(attrName);

        if (baseName.startsWith('b-on-') || baseName.startsWith('on-')) {
            if (baseName.includes('-enter') || baseName.includes('-exit')) {
                handleIntersection(element, attrName, attrValue, modifiers, context);
            } else if (baseName.includes('-addednodes') || baseName.includes('-removednodes') || baseName.includes('-attrs') || baseName.includes('-text')) {
                handleMutation(element, attrName, attrValue, modifiers, context);
            } else if (baseName.includes('-resize')) {
                handleResize(element, attrName, attrValue, modifiers, context);
            } else {
                handleOn(element, baseName, attrValue, modifiers, context);
            }
            element.removeAttribute(attrName);
        } else if (baseName.startsWith('b-bind-') || baseName.startsWith('bind-')) {
            handleBind(element, baseName, attrValue, modifiers, context);
            element.removeAttribute(attrName);
        } else if (baseName === 'b-model' || baseName === 'model') {
            handleModel(element, attrValue, modifiers, context);
            element.removeAttribute(attrName);
        } else if (baseName === 'b-text' || baseName === 'text') {
            getNodeOwner(element)!.controlsChildren = true;
            handleText(element, attrValue, modifiers, context);
            element.removeAttribute(attrName);
            hasText = true;
        } else if (baseName === 'b-html' || baseName === 'html') {
            getNodeOwner(element)!.controlsChildren = true;
            handleHtml(element, attrValue, modifiers, context, runtime, hydrateChildren);
            element.removeAttribute(attrName);
            hasHtml = true;
        } else if (baseName === 'b-mask' || baseName === 'mask') {
            handleMask(element, attrValue, modifiers, context);
            element.removeAttribute(attrName);
        } else if (baseName === 'b-teleport' || baseName === 'teleport') {
            handleTeleport(element, attrValue, modifiers, context);
            element.removeAttribute(attrName);
        } else if (baseName === 'b-transition' || baseName === 'transition') {
            handleTransition(element, attrValue, modifiers, context);
            element.removeAttribute(attrName);
        } else if (baseName === 'b-effect' || baseName === 'effect') {
            handleEffect(element, attrValue, modifiers, context);
            element.removeAttribute(attrName);
        } else if (baseName === 'b-script') {
            handleScript(element, attrValue, modifiers, context);
            element.removeAttribute(attrName);
        } else if (baseName === 'b-router-outlet') {
            getNodeOwner(element)!.controlsChildren = true;
            mountRouterOutlet(element, context, runtime, hydrateNode);
            element.removeAttribute(attrName);
            return;
        }
    }

    if (!hasText && !hasHtml && tagName !== 'script') {
        hydrateChildren(element, context, runtime);
    }
}
