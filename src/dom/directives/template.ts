import { getOwnerDocument, getParent, getChildNodes, insertBefore } from '../native';
import { createError, arrayFrom, removeElement, TEMPLATE } from '../../core/native';
import type { DomRuntime } from '../types';
import { ownElementRange } from '../range';
import { cloneProjectedNode } from '../components';
import { withHydration } from '../ownership';

export function handleTemplate(
    element: Element,
    _expression: string,
    _modifiers: Record<string, boolean>,
    context: Record<PropertyKey, any>,
    runtime: DomRuntime,
    hydrateNodeFn: (node: Node, context: Record<PropertyKey, any>, runtime: DomRuntime) => void,
): void {
    ownElementRange(element, context, runtime);
    const isTemplateTag = element.tagName.toLowerCase() === TEMPLATE;
    const fragment = isTemplateTag
        ? cloneProjectedNode((element as HTMLTemplateElement).content)
        : getOwnerDocument(element).createDocumentFragment();

    if (!isTemplateTag) {
        while (element.firstChild) {
            fragment.appendChild(element.firstChild);
        }
    }

    const parent = getParent(element);
    if (!parent) throw createError('b-template requires an element with a parent node.');

    const insertedNodes = arrayFrom(getChildNodes(fragment));
    insertBefore(parent, fragment, element);
    removeElement(element);

    withHydration(parent, () => {
        for (const node of insertedNodes) {
            if (getParent(node) === parent) hydrateNodeFn(node, context, runtime);
        }
    });
}
