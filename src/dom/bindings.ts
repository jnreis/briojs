import { createExpressionScope } from '../core/expression';
import { createScope, onCleanup } from '../core/scope';
import type { Scope } from '../core/scope';
import { effect } from '../reactivity/effect';
import type { DomRuntime } from './types';
import { mountComponent } from './components';

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
    handleShow,
    handleHtml,
    handleText,
    handleData,
    handleId,
    handleIgnore,
    handleMask,
    handleTeleport,
    handleTemplate,
    handleTransition,
    handleIntersection,
    handleMutation,
    handleResize,
    extractModifiers,
} from './directives';

export function hydrateChildren(
    element: Element,
    context: Record<PropertyKey, any>,
    runtime: DomRuntime,
): void {
    for (const child of Array.from(element.childNodes)) {
        hydrateNode(child, context, runtime);
    }
}

export function hydrateNode(
    node: Node,
    parentContext: Record<PropertyKey, any>,
    runtime: DomRuntime,
): void {
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const element = node as Element;

    // 1. b-ignore
    if (element.hasAttribute('b-ignore') || element.hasAttribute('ignore')) {
        handleIgnore(element);
        return;
    }

    let context = createExpressionScope({ $el: element }, parentContext);

    // 2. b-data
    const dataAttr = element.getAttribute('b-data');
    if (dataAttr !== null) {
        context = handleData(element, dataAttr, {}, parentContext);
        element.removeAttribute('b-data');
    }

    // 3. b-id
    const idAttr = element.getAttribute('b-id');
    if (idAttr !== null) {
        context = handleId(element, idAttr, {}, context);
        element.removeAttribute('b-id');
    }

    // 4. b-if
    const ifAttr = element.getAttribute('b-if');
    if (ifAttr !== null) {
        const { modifiers } = extractModifiers('b-if');
        handleIf(element, ifAttr, modifiers, context, runtime, hydrateNode);
        return;
    }

    // 5. b-for
    const forAttr = element.getAttribute('b-for');
    if (forAttr !== null) {
        const { modifiers } = extractModifiers('b-for');
        handleFor(element, forAttr, modifiers, context, runtime, hydrateNode);
        return;
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

    // Scan element attributes
    for (const attribute of Array.from(element.attributes)) {
        const attrName = attribute.name;
        const attrValue = attribute.value;
        const { baseName, modifiers } = extractModifiers(attrName);

        if (baseName.startsWith('b-on-') || baseName.startsWith('on-')) {
            if (baseName.includes('-enter') || baseName.includes('-exit')) {
                handleIntersection(element, baseName, attrValue, modifiers, context);
            } else if (baseName.includes('-addednodes') || baseName.includes('-removednodes') || baseName.includes('-attrs') || baseName.includes('-text')) {
                handleMutation(element, baseName, attrValue, modifiers, context);
            } else if (baseName.includes('-resize')) {
                handleResize(element, baseName, attrValue, modifiers, context);
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
        } else if (baseName === 'b-show' || baseName === 'show') {
            handleShow(element, attrValue, modifiers, context);
            element.removeAttribute(attrName);
        } else if (baseName === 'b-text' || baseName === 'text') {
            handleText(element, attrValue, modifiers, context);
            element.removeAttribute(attrName);
            hasText = true;
        } else if (baseName === 'b-html' || baseName === 'html') {
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
        } else if (baseName === 'b-router-outlet') {
            mountRouterOutlet(element, context, runtime, hydrateNode);
            element.removeAttribute(attrName);
            return;
        }
    }

    if (!hasText && !hasHtml) {
        hydrateChildren(element, context, runtime);
    }
}
