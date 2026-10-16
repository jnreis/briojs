import type { DomRuntime } from '../types';
import { ownElementRange } from '../range';
import { cloneProjectedNode } from '../components';

export function handleTemplate(
    element: Element,
    _expression: string,
    _modifiers: Record<string, boolean>,
    context: Record<PropertyKey, any>,
    runtime: DomRuntime,
    hydrateNodeFn: (node: Node, context: Record<PropertyKey, any>, runtime: DomRuntime) => void,
): void {
    ownElementRange(element, context, runtime);
    const isTemplateTag = element.tagName.toLowerCase() === 'template';
    const fragment = isTemplateTag
        ? cloneProjectedNode((element as HTMLTemplateElement).content)
        : element.ownerDocument.createDocumentFragment();

    if (!isTemplateTag) {
        while (element.firstChild) {
            fragment.appendChild(element.firstChild);
        }
    }

    const parent = element.parentNode;
    if (!parent) throw new Error('b-template requires an element with a parent node.');

    const insertedNodes = Array.from(fragment.childNodes);
    parent.insertBefore(fragment, element);
    element.remove();

    for (const node of insertedNodes) {
        if (node.parentNode === parent) hydrateNodeFn(node, context, runtime);
    }
}
