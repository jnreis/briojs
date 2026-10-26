import {
    getLength, createError, arrayFrom, snapshotList, createSyntaxError, createTypeError,
    startsWith, TEMPLATE, isObjectType,
    B_TELEPORT,
    ATTRIBUTES,
} from '../core/native';
import { getChildNodes, getParent, getNodeType, getAttribute, removeAttribute } from './native';
import { createExpressionScope } from '../core/expression';
import { createScope } from '../core/scope';
import { locate, setScopeNode } from '../core/errors';
import { effect } from '../reactivity/effect';
import type { DomRuntime } from './types';
import { hydrateScopedSlot, isFragmentTemplate, mountComponent, takeProjectedContext } from './components';
import { prepareTransition } from './directives/transition';
import { createInsert } from './insert';
import { getNodeOwner, ownNode, withHydration } from './ownership';
import { emptyContextValues } from '../core/context-values';
import { interpolateText } from './interpolation';
import { createRefs, registerRef } from './refs';

const inserts = new WeakMap<DomRuntime, ReturnType<typeof createInsert>>();
const getInsert = (runtime: DomRuntime) => {
    let insert = inserts.get(runtime);
    if (!insert) inserts.set(runtime, insert = createInsert(runtime));
    return insert;
};

const componentNamePattern = /^[a-z][a-z0-9]*-[a-z0-9-]+$/;
const conditionalNames = new Set(['b-if', 'b-else-if', 'b-else']);
const childControllingNames = new Set(['b-text', 'b-html', 'b-router-outlet']);
// Directives a fragment wrapper (b-template or a directive-bearing <template>) applies; the rest need a concrete element.
const fragmentNames = new Set(['b-template', 'b-teleport', 'b-effect']);

import {
    handleBind,
    handleOn,
    eventModifiers,
    handleModel,
    handleIf,
    handleFor,
    handleHtml,
    handleText,
    handleData,
    handleProvide,
    handleId,
    handleIgnore,
    handleTeleport,
    handleTemplate,
    handleTransition,
    handleEffect,
    handleScript,
    extractModifiers,
} from './directives';
import {
    addonError, addonFor, checkOptionsUsed, collectOptions, createBinding, findPluginDirective, readOptions, keepCleanup, runHook,
} from './directives/registry';
import type { DirectiveBinding } from './directives/registry';
import { devtoolsEnabled, notifyUnknownDirective } from '../plugins/devtools-bridge';

// b-* attributes that stay on an element after hydration without being directives of their own.
const passiveNames = new Set(['b-key', 'b-app', 'b-app-props']);

export function hydrateChildren(
    element: Element,
    context: Record<PropertyKey, any>,
    runtime: DomRuntime,
): void {
    withHydration(element, () => {
        for (const child of snapshotList(getChildNodes(element))) {
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

    let last: string | undefined;
    effect(() => {
        const text = interpolateText(raw, context);
        if (text !== last) node.nodeValue = last = text;
    });
}

export function hydrateNode(
    node: Node,
    parentContext: Record<PropertyKey, any>,
    runtime: DomRuntime,
): void {
    if (getNodeOwner(node)) throw createError('Cannot hydrate an already hydrated Brio node.');
    // Static text, comments and other non-element nodes need no scope, owner or context.
    const type = getNodeType(node);
    if (type !== Node.ELEMENT_NODE && (type !== Node.TEXT_NODE || !(node.nodeValue ?? '').includes('${'))) return;
    parentContext = takeProjectedContext(node) ?? parentContext;
    if (!('$ref' in parentContext)) parentContext = createExpressionScope({ $ref: createRefs() }, parentContext);
    const scope = createScope();
    setScopeNode(scope, node);
    try {
        withHydration(node, () => scope.run(() => {
            ownNode(node, parentContext, runtime);
            hydrateOwnedNode(node, parentContext, runtime);
        }));
    } catch (error) {
        throw locate(error, node);
    }
}

// Inherited values are only redefined when they differ, keeping each element context to its own `$el`.
function elementContext(element: Element, parentContext: Record<PropertyKey, any>, runtime: DomRuntime): Record<PropertyKey, any> {
    const own: Record<PropertyKey, any> = { $el: element };
    if (!parentContext.$stores) own.$stores = emptyContextValues;
    if (!parentContext.$provided) own.$provided = emptyContextValues;
    if (runtime.root) {
        const insert = getInsert(runtime);
        if (parentContext.$insert !== insert) own.$insert = insert;
    }
    return createExpressionScope(own, parentContext);
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
    // Plain elements (no attributes, not a component or script) only need a context for their children.
    if (!getLength(element[ATTRIBUTES]) && !element.localName.includes('-') && element.localName !== 'script') {
        const context = elementContext(element, parentContext, runtime);
        getNodeOwner(element)!.context = context;
        hydrateChildren(element, context, runtime);
        return;
    }
    removeAttribute(element, 'b-cloak');

    // 1. b-ignore
    if (element.hasAttribute('b-ignore') || element.hasAttribute('ignore')) {
        getNodeOwner(element)!.controlsChildren = true;
        handleIgnore(element);
        return;
    }

    const attributes = snapshotList(element[ATTRIBUTES]);
    const parsed = attributes.map(attribute => extractModifiers(attribute.name));
    const conditionalAttributes = attributes.filter((_, index) => conditionalNames.has(parsed[index].baseName));
    if (getLength(conditionalAttributes) > 1)
        throw createSyntaxError('An element can have only one conditional directive.');
    const ifAttr = conditionalAttributes[0];
    if (ifAttr && extractModifiers(ifAttr.name).baseName === 'b-if') {
        handleIf(element, ifAttr.value, extractModifiers(ifAttr.name).modifiers, parentContext, runtime, hydrateNode);
        return;
    }
    if (ifAttr)
        throw createSyntaxError('b-else-if and b-else require an adjacent preceding b-if branch.');

    // Decided before b-data/b-id/b-provide are consumed, since any of them makes a <template> render in place.
    const fragmentTemplate = isFragmentTemplate(element);
    let context = elementContext(element, parentContext, runtime);

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
    for (const attribute of attributes) {
        const { baseName } = extractModifiers(attribute.name);
        if (baseName === 'b-slot' && (element.localName !== 'slot' || attribute.name !== 'b-slot'))
            throw createSyntaxError('b-slot requires a <slot> outlet and does not support modifiers.');
    }
    if (element.localName === 'slot' && attributes.some(attribute => extractModifiers(attribute.name).baseName === 'b-bind-name'))
        throw createSyntaxError('Dynamic slot names are not supported. Use a literal name and b-slot to expose values through $slot.');
    if (element.localName === 'slot' && element.hasAttribute('b-slot')) {
        hydrateScopedSlot(element, context, runtime, hydrateNode);
        return;
    }
    if (parsed.some(({ baseName }) => childControllingNames.has(baseName)))
        getNodeOwner(element)!.controlsChildren = true;
    const refAttributes = attributes.filter((attribute, index) =>
        parsed[index].baseName === 'b-ref' || startsWith(attribute.name, 'b-ref-'));
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
    if (templateAttr !== null || fragmentTemplate) {
        for (const attribute of arrayFrom(element[ATTRIBUTES])) {
            const { baseName } = extractModifiers(attribute.name);
            if (fragmentNames.has(baseName)) continue;
            if (startsWith(baseName, 'b-'))
                throw createSyntaxError(`${baseName} needs a concrete element, but ${templateAttr !== null ? 'b-template' : '<template>'} renders its contents in place without one. Put it on an element inside.`);
        }
        handleTemplate(element, templateAttr ?? '', {}, context, runtime, hydrateNode);
        for (const attribute of arrayFrom(element[ATTRIBUTES])) {
            const { baseName, modifiers } = extractModifiers(attribute.name);
            if (baseName === B_TELEPORT)
                handleTeleport(element, attribute.value, modifiers, context);
            else if (baseName === 'b-effect')
                handleEffect(element, attribute.value, modifiers, context);
        }
        return;
    }

    const tagName = element.tagName.toLowerCase();
    const isComponent = componentNamePattern.test(tagName);
    const definition = isComponent ? runtime.components.get(tagName) : undefined;

    const registry = runtime.directives;
    const options = collectOptions(element);
    const names = parsed.map(({ baseName, modifiers }) => modifiers.options ? '' : baseName);
    const matches = names.map(name => findPluginDirective(registry, name));
    const bind = (index: number) => createBinding(element, attributes[index].name, attributes[index].value,
        parsed[index].modifiers, options, matches[index]!, runtime.app, node => hydrateNode(node, getNodeOwner(element)!.context!, runtime));
    if (definition) {
        for (let index = 0; index < getLength(attributes); index++)
            if (matches[index])
                throw createSyntaxError(`${attributes[index].name} cannot be used on a component host. Put it on an element inside the component.`);
        mountComponent(element, definition, context, runtime, hydrateNode);
        return;
    }
    for (const attribute of attributes) {
        const { baseName } = extractModifiers(attribute.name);
        if (baseName === 'b-props' || startsWith(baseName, 'b-prop-'))
            throw createSyntaxError(`${attribute.name} requires a registered Brio component.`);
        if (startsWith(baseName, 'b-attr-'))
            throw createSyntaxError(`${attribute.name} has been removed. Use b-bind-* for DOM bindings.`);
    }

    // Plugin scope hooks run before any other directive on the element, so all of them see the added names.
    const bindings: (DirectiveBinding | undefined)[] = [];
    if (registry?.scoped) {
        for (let index = 0; index < getLength(attributes); index++) {
            const scope = matches[index]?.definition.scope;
            if (!scope) continue;
            const { name } = attributes[index];
            const binding = bindings[index] = bind(index);
            const added = runHook(scope, element, binding);
            if (added === undefined) continue;
            if (!added || !isObjectType(added))
                throw createTypeError(`${name} scope hook must return an object of names or nothing.`);
            context = createExpressionScope(added, context);
            getNodeOwner(element)!.context = context;
        }
    }

    let skipChildren = false;
    // Form controls whose value depends on child options start after the children hydrate.
    const afterChildren: (() => void)[] = [];
    const transitionAttr = attributes.find((_, index) => names[index] === 'b-transition');
    if (transitionAttr) prepareTransition(element, transitionAttr.value);

    // Scan element attributes
    for (let index = 0; index < getLength(attributes); index++) {
        const attribute = attributes[index];
        const attrName = attribute.name;
        const attrValue = attribute.value;
        const { baseName, modifiers } = parsed[index];
        const match = matches[index];
        const addon = match ? undefined : addonFor(names[index]);

        if (modifiers.options) {
            removeAttribute(element, attrName);
        } else if (addon) {
            throw addonError(attrName, addon);
        } else if (match) {
            const { definition } = match;
            const binding = bindings[index] ?? bind(index);
            if (definition.children === false) {
                getNodeOwner(element)!.controlsChildren = true;
                skipChildren = true;
            }
            if (definition.mount) keepCleanup(runHook(definition.mount, element, binding), binding);
            const ready = definition.ready;
            if (ready) afterChildren.push(() => keepCleanup(runHook(ready, element, binding), binding));
            removeAttribute(element, attrName);
        } else if (startsWith(baseName, 'b-on-')) {
            handleOn(element, baseName, attrValue, modifiers, context,
                readOptions(options, baseName, eventModifiers, context, element));
            removeAttribute(element, attrName);
        } else if (startsWith(baseName, 'b-bind-')) {
            const start = handleBind(element, baseName, attrValue, modifiers, context);
            if (start) afterChildren.push(start);
            removeAttribute(element, attrName);
        } else if (baseName === 'b-model') {
            const start = handleModel(element, attrValue, modifiers, context);
            if (start) afterChildren.push(start);
            removeAttribute(element, attrName);
        } else if (baseName === 'b-text') {
            getNodeOwner(element)!.controlsChildren = true;
            handleText(element, attrValue, context);
            removeAttribute(element, attrName);
            skipChildren = true;
        } else if (baseName === 'b-html') {
            getNodeOwner(element)!.controlsChildren = true;
            handleHtml(element, attrValue, modifiers, context, runtime, hydrateChildren);
            removeAttribute(element, attrName);
            skipChildren = true;
        } else if (baseName === B_TELEPORT) {
            handleTeleport(element, attrValue, modifiers, context);
            removeAttribute(element, attrName);
        } else if (baseName === 'b-transition') {
            handleTransition(element, attrValue, modifiers, context);
            removeAttribute(element, attrName);
        } else if (baseName === 'b-effect') {
            handleEffect(element, attrValue, modifiers, context);
            removeAttribute(element, attrName);
        } else if (baseName === 'b-script') {
            handleScript(element, attrValue, modifiers, context);
            removeAttribute(element, attrName);
        } else if (devtoolsEnabled && startsWith(baseName, 'b-') && !passiveNames.has(baseName)) {
            notifyUnknownDirective(attrName, element);
        }
    }

    checkOptionsUsed(options, names);

    if (!skipChildren && tagName !== 'script') {
        hydrateChildren(element, context, runtime);
    }
    afterChildren.forEach(start => start());
}
