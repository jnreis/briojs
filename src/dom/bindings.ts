import {
    getLength, createError, arrayFrom, createSyntaxError, createTypeError, removeElement, includesItem,
    startsWith, TEMPLATE,
    B_TELEPORT,
    TELEPORT,
    ATTRIBUTES,
} from '../core/native';
import { getChildNodes, getParent, getNodeType, getAttribute, removeAttribute } from './native';
import { createExpressionScope } from '../core/expression';
import { createScope, onCleanup } from '../core/scope';
import type { Scope } from '../core/scope';
import { effect } from '../reactivity/effect';
import type { DomRuntime } from './types';
import { mountComponent, takeProjectedContext } from './components';
import { prepareTransition } from './directives/transition';
import { createInsert } from './insert';
import { getNodeOwner, ownNode, withHydration } from './ownership';
import { emptyContextValues } from '../core/context-values';
import { interpolateText } from './interpolation';
import { createRefs, registerRef } from './refs';

export function mountRouterOutlet(
    element: Element,
    context: Record<PropertyKey, any>,
    runtime: DomRuntime,
    hydrateNodeFn: (node: Node, context: Record<PropertyKey, any>, runtime: DomRuntime) => void,
): void {
    if (!runtime.router) throw createError('b-router-outlet requires a router on the Brio app.');
    const router = runtime.router;
    let childScope: Scope | undefined;
    let childElement: Element | undefined;
    onCleanup(() => {
        try {
            childScope?.dispose();
        } finally {
            removeElement(childElement);
        }
    });
    effect(() => {
        const route = router.current.value;
        try {
            childScope?.dispose();
        } finally {
            removeElement(childElement);
        }
        childScope = undefined;
        childElement = undefined;
        if (!route) return;
        const definition = runtime.components.get(route.component);
        if (!definition) throw createError(`No component registered for route "${route.component}".`);
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
    withHydration(element, () => {
        for (const child of arrayFrom(getChildNodes(element))) {
            if (getParent(child) === element && !getNodeOwner(child)) hydrateNode(child, context, runtime);
        }
    });
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
    if (getNodeOwner(node)) throw createError('Cannot hydrate an already hydrated Brio node.');
    parentContext = takeProjectedContext(node) ?? parentContext;
    if (!parentContext.$ref) parentContext = createExpressionScope({ $ref: createRefs() }, parentContext);
    const scope = createScope();
    withHydration(node, () => scope.run(() => {
        ownNode(node, parentContext, runtime);
        hydrateOwnedNode(node, parentContext, runtime);
    }));
}

function hydrateOwnedNode(
    node: Node,
    parentContext: Record<PropertyKey, any>,
    runtime: DomRuntime,
): void {
    if (getNodeType(node) === Node.TEXT_NODE) {
        hydrateTextNode(node as Text, parentContext);
        return;
    }
    if (getNodeType(node) !== Node.ELEMENT_NODE) return;
    const element = node as Element;

    // 1. b-ignore
    if (element.hasAttribute('b-ignore') || element.hasAttribute('ignore')) {
        getNodeOwner(element)!.controlsChildren = true;
        handleIgnore(element);
        return;
    }

    const conditionalAttributes = arrayFrom(element[ATTRIBUTES]).filter(attribute =>
        includesItem(['b-if', 'b-else-if', 'b-else'], extractModifiers(attribute.name).baseName));
    if (getLength(conditionalAttributes) > 1)
        throw createSyntaxError('An element can have only one conditional directive.');
    const ifAttr = conditionalAttributes[0];
    if (ifAttr && extractModifiers(ifAttr.name).baseName === 'b-if') {
        handleIf(element, ifAttr.value, extractModifiers(ifAttr.name).modifiers, parentContext, runtime, hydrateNode);
        return;
    }
    if (ifAttr)
        throw createSyntaxError('b-else-if and b-else require an adjacent preceding b-if branch.');

    let context = createExpressionScope({
        $el: element,
        $stores: parentContext.$stores ?? emptyContextValues,
        $provided: parentContext.$provided ?? emptyContextValues,
        ...(runtime.root ? { $insert: createInsert(runtime) } : {}),
    }, parentContext);

    const dataAttr = getAttribute(element, 'b-data');
    if (dataAttr !== null) {
        context = handleData(element, dataAttr, {}, context);
        context = createExpressionScope({ $ref: createRefs() }, context);
        removeAttribute(element, 'b-data');
    }

    getNodeOwner(element)!.context = context;

    const forAttr = getAttribute(element, 'b-for');
    if (forAttr !== null) {
        const { modifiers } = extractModifiers('b-for');
        handleFor(element, forAttr, modifiers, context, runtime, hydrateNode);
        return;
    }

    const idAttr = getAttribute(element, 'b-id');
    if (idAttr !== null) {
        context = handleId(element, idAttr, {}, context);
        removeAttribute(element, 'b-id');
        getNodeOwner(element)!.context = context;
    }

    const provideAttr = getAttribute(element, 'b-provide');
    if (provideAttr !== null) {
        context = handleProvide(provideAttr, context);
        removeAttribute(element, 'b-provide');
        getNodeOwner(element)!.context = context;
    }

    const templateAttr = getAttribute(element, 'b-template');
    if (arrayFrom(element[ATTRIBUTES]).some(attribute =>
        includesItem(['b-text', 'text', 'b-html', 'html', 'b-router-outlet'], extractModifiers(attribute.name).baseName)))
        getNodeOwner(element)!.controlsChildren = true;
    const refAttributes = arrayFrom(element[ATTRIBUTES]).filter(attribute =>
        extractModifiers(attribute.name).baseName === 'b-ref' || startsWith(attribute.name, 'b-ref-'));
    if (getLength(refAttributes)) {
        if (getLength(refAttributes) !== 1 || refAttributes[0].name !== 'b-ref')
            throw createSyntaxError('b-ref does not support arguments or modifiers.');
        const name = refAttributes[0].value.trim();
        if (!name) throw createSyntaxError('b-ref requires a nonempty literal name.');
        if (templateAttr !== null || element.tagName.toLowerCase() === TEMPLATE)
            throw createTypeError('b-ref requires a concrete element, not a template wrapper.');
        registerRef(context.$ref, name, element);
        removeAttribute(element, 'b-ref');
    }
    if (templateAttr !== null) {
        handleTemplate(element, templateAttr, {}, context, runtime, hydrateNode);
        for (const attribute of arrayFrom(element[ATTRIBUTES])) {
            const { baseName, modifiers } = extractModifiers(attribute.name);
            if (baseName === B_TELEPORT || baseName === TELEPORT)
                handleTeleport(element, attribute.value, modifiers, context);
            else if (baseName === 'b-effect' || baseName === 'effect')
                handleEffect(element, attribute.value, modifiers, context);
        }
        return;
    }

    const tagName = element.tagName.toLowerCase();
    const isComponent = componentNamePattern.test(tagName);
    const definition = isComponent ? runtime.components.get(tagName) : undefined;

    if (definition) {
        mountComponent(element, definition, context, runtime, hydrateNode);
        return;
    }

    let hasText = false;
    let hasHtml = false;
    const transitionAttr = arrayFrom(element[ATTRIBUTES])
        .find(attribute => includesItem(['b-transition', 'transition'], extractModifiers(attribute.name).baseName));
    if (transitionAttr) prepareTransition(element, transitionAttr.value);

    // Scan element attributes
    for (const attribute of arrayFrom(element[ATTRIBUTES])) {
        const attrName = attribute.name;
        const attrValue = attribute.value;
        const { baseName, modifiers } = extractModifiers(attrName);

        if (startsWith(baseName, 'b-on-') || startsWith(baseName, 'on-')) {
            if (baseName.includes('-enter') || baseName.includes('-exit')) {
                handleIntersection(element, attrName, attrValue, modifiers, context);
            } else if (baseName.includes('-addednodes') || baseName.includes('-removednodes') || baseName.includes('-attrs') || baseName.includes('-text')) {
                handleMutation(element, attrName, attrValue, modifiers, context);
            } else if (baseName.includes('-resize')) {
                handleResize(element, attrName, attrValue, modifiers, context);
            } else {
                handleOn(element, baseName, attrValue, modifiers, context);
            }
            removeAttribute(element, attrName);
        } else if (startsWith(baseName, 'b-bind-') || startsWith(baseName, 'bind-')) {
            handleBind(element, baseName, attrValue, modifiers, context);
            removeAttribute(element, attrName);
        } else if (baseName === 'b-model' || baseName === 'model') {
            handleModel(element, attrValue, modifiers, context);
            removeAttribute(element, attrName);
        } else if (baseName === 'b-text' || baseName === 'text') {
            getNodeOwner(element)!.controlsChildren = true;
            handleText(element, attrValue, context);
            removeAttribute(element, attrName);
            hasText = true;
        } else if (baseName === 'b-html' || baseName === 'html') {
            getNodeOwner(element)!.controlsChildren = true;
            handleHtml(element, attrValue, modifiers, context, runtime, hydrateChildren);
            removeAttribute(element, attrName);
            hasHtml = true;
        } else if (baseName === 'b-mask' || baseName === 'mask') {
            handleMask(element, attrValue, modifiers, context);
            removeAttribute(element, attrName);
        } else if (baseName === B_TELEPORT || baseName === TELEPORT) {
            handleTeleport(element, attrValue, modifiers, context);
            removeAttribute(element, attrName);
        } else if (baseName === 'b-transition' || baseName === 'transition') {
            handleTransition(element, attrValue, modifiers, context);
            removeAttribute(element, attrName);
        } else if (baseName === 'b-effect' || baseName === 'effect') {
            handleEffect(element, attrValue, modifiers, context);
            removeAttribute(element, attrName);
        } else if (baseName === 'b-script') {
            handleScript(element, attrValue, modifiers, context);
            removeAttribute(element, attrName);
        } else if (baseName === 'b-router-outlet') {
            getNodeOwner(element)!.controlsChildren = true;
            mountRouterOutlet(element, context, runtime, hydrateNode);
            removeAttribute(element, attrName);
            return;
        }
    }

    if (!hasText && !hasHtml && tagName !== 'script') {
        hydrateChildren(element, context, runtime);
    }
}
