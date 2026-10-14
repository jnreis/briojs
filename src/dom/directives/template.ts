import type { DomRuntime } from '../types';
import { ownNode } from '../ownership';

export function handleTemplate(
    element: Element,
    _expression: string,
    _modifiers: Record<string, boolean>,
    context: Record<PropertyKey, any>,
    runtime: DomRuntime,
    hydrateNodeFn: (node: Node, context: Record<PropertyKey, any>, runtime: DomRuntime) => void,
): void {
    // b-template can be used on any non-self-closing tag, including <template>
    const isTemplateTag = element.tagName.toLowerCase() === 'template';
    const fragment = isTemplateTag
        ? (element as HTMLTemplateElement).content.cloneNode(true)
        : document.createDocumentFragment();

    if (!isTemplateTag) {
        while (element.firstChild) {
            fragment.appendChild(element.firstChild);
        }
    }

    const parent = element.parentNode;
    if (!parent) throw new Error('b-template requires an element with a parent node.');

    const placeholder = document.createComment('brio:template');
    ownNode(placeholder, context, runtime);
    parent.replaceChild(placeholder, element);

    const insertedNodes = Array.from(fragment.childNodes);
    placeholder.parentNode?.insertBefore(fragment, placeholder.nextSibling);

    for (const node of insertedNodes) {
        if (node.parentNode === parent) hydrateNodeFn(node, context, runtime);
    }
}
