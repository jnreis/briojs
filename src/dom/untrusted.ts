import { getLength, snapshotList, ATTRIBUTES, ObjectConstructor } from '../core/native';
import { removeAttribute } from './native';
import type { DomRuntime } from './types';
import { componentNamePattern, elementContext, hydrateChildren, hydrateNode } from './bindings';
import { mountComponent } from './components';
import { getNodeOwner } from './ownership';
import { extractModifiers } from './directives';
import { createBinding, findPluginDirective, keepCleanup, runHook } from './directives/registry';

/**
 * CSP build page markup. Nothing in it is evaluated: registered components mount with static attributes as
 * props, and plugin directives that take no value or options (such as b-router-outlet) run.
 */
export function hydrateUntrusted(element: Element, parentContext: Record<PropertyKey, any>, runtime: DomRuntime): void {
    const owner = getNodeOwner(element)!;
    const context = owner.context = elementContext(element, parentContext, runtime);
    removeAttribute(element, 'b-cloak');
    if (element.hasAttribute('b-ignore') || element.hasAttribute('ignore')) {
        owner.controlsChildren = true;
        return;
    }
    const tagName = element.localName;
    const definition = componentNamePattern.test(tagName) ? runtime.components.get(tagName) : undefined;
    if (definition) {
        mountComponent(element, definition, context, runtime, hydrateNode, true);
        return;
    }
    const after: (() => void)[] = [];
    let skipChildren = false;
    for (const attribute of snapshotList(element[ATTRIBUTES])) {
        const { baseName, modifiers } = extractModifiers(attribute.name);
        const match = findPluginDirective(runtime.directives, baseName);
        const definition = match?.definition;
        if (!definition || definition.value !== 'none' || definition.scope || attribute.value.trim()
            || getLength(ObjectConstructor.keys(modifiers))) continue;
        const binding = createBinding(element, attribute.name, '', {}, new Map(), match, runtime.app,
            node => hydrateNode(node, owner.context!, runtime));
        if (definition.children === false) owner.controlsChildren = skipChildren = true;
        if (definition.mount) keepCleanup(runHook(definition.mount, element, binding), binding);
        const ready = definition.ready;
        if (ready) after.push(() => keepCleanup(runHook(ready, element, binding), binding));
        removeAttribute(element, attribute.name);
    }
    if (!skipChildren) hydrateChildren(element, context, runtime);
    for (const run of after) run();
}

