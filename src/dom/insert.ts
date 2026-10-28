import {
    isString, isObjectType, createError, createTypeError, isArray, arrayFrom, isInstanceOf, removeElement,
    includesItem, TEMPLATE,
} from '../core/native';
import {
    getParent, getOwnerDocument, getNodeType, getChildNodes, getNextSibling, insertBefore, removeChild,
} from './native';
import { createExpressionScope } from '../core/expression';
import { createScope, onDispose } from '../core/scope';
import { createScopedState } from '../core/scoped-state';
import { combinedError } from '../core/errors';
import type { Insert, InsertHandle } from '../core/types';
import type { DomRuntime } from './types';
import { getTrustedHTMLString, trustedHTML, UNTRUSTED } from './types';
import { hydrateNode } from './bindings';
import { disposeNodes, getNodeOwner, ownNode, withHydration } from './ownership';
import { createDomRange } from './range';

const placements = new Set(['before', 'after', 'prepend', 'append', 'replaceWith', 'replaceChildren', 'textContent']);

export function createInsert(runtime: DomRuntime): Insert {
    return (target, placement, content, options = {}) => {
        const root = runtime.root;
        if (!root || getNodeOwner(root)?.runtime !== runtime)
            throw createError('$insert requires an active mounted Brio root.');
        const node = isString(target)
            ? (root.matches(target) ? root : root.querySelector(target))
            : target;
        if (!isInstanceOf(node, Node) || (!root.contains(node) && getNodeOwner(node)?.runtime.root !== root))
            throw createTypeError('$insert target must resolve to a node inside this app root.');
        const targetOwner = getNodeOwner(node);
        if (targetOwner && targetOwner.runtime.app !== runtime.app)
            throw createError('$insert cannot target content owned by another Brio app.');
        if (!options || !isObjectType(options) || isArray(options))
            throw createTypeError('$insert options must be an object.');
        if (!placements.has(placement))
            throw createTypeError(`Invalid $insert placement "${placement}".`);
        const siblingPlacement = placement === 'before' || placement === 'after' || placement === 'replaceWith';
        if (siblingPlacement && node === root)
            throw createError('$insert cannot insert beside or replace a mount root.');
        if ((placement === 'before' || placement === 'after') && targetOwner?.loopRow)
            throw createError('$insert cannot insert beside a b-for row; insert inside the row or into the list container instead.');
        if (placement === 'replaceWith' && targetOwner?.structuralRoot)
            throw createError('$insert cannot replace a root managed by b-if or b-for; replace its enclosing container instead.');
        const container = siblingPlacement ? getParent(node) : node;
        if (!isInstanceOf(container, Element))
            throw createTypeError('This $insert placement requires an element container.');
        const containerOwner = getNodeOwner(container);
        if (!containerOwner || containerOwner.runtime.app !== runtime.app || containerOwner.scope.disposed)
            throw createError('$insert destination has no active context owned by this app.');
        if (containerOwner.controlsChildren)
            throw createError('$insert cannot modify a container whose content is controlled by a directive.');
        if (!isString(content) && !isInstanceOf(content, Node))
            throw createTypeError('$insert content must be an HTML string or a node to clone.');

        const document = getOwnerDocument(container);
        const fragment = document.createDocumentFragment();
        if (placement === 'textContent') {
            fragment.append(document.createTextNode(isString(content) ? content : content.textContent ?? ''));
        } else if (isString(content)) {
            const template = document.createElement(TEMPLATE);
            template.innerHTML = getTrustedHTMLString(trustedHTML(content));
            fragment.append(template.content);
        } else {
            const supportedTypes: number[] = [Node.ELEMENT_NODE, Node.TEXT_NODE, Node.COMMENT_NODE, Node.DOCUMENT_FRAGMENT_NODE];
            if (!includesItem(supportedTypes, getNodeType(content)))
                throw createTypeError('$insert can clone elements, text, comments, or document fragments.');
            fragment.append(document.importNode(content, true));
        }

        let context = options.data === undefined ? containerOwner.context : createExpressionScope({
            $data: createScopedState(options.data, containerOwner.context.$data),
        }, containerOwner.context);
        // The CSP build treats inserted markup like page markup: only registered components activate.
        if (containerOwner.runtime.untrusted) context = createExpressionScope({ [UNTRUSTED]: true }, context);
        const previous = placement === 'replaceWith' ? [node] :
            placement === 'replaceChildren' || placement === 'textContent' ? arrayFrom(getChildNodes(container)) : [];
        const reference = placement === 'before' ? node :
            placement === 'after' || placement === 'replaceWith' ? getNextSibling(node) :
                placement === 'prepend' ? container.firstChild : null;
        // Validate and parse before disposing any existing content.
        disposeNodes(previous);
        const range = createDomRange(document, 'insert');
        const { start, end } = range;
        const children = arrayFrom(getChildNodes(fragment));
        fragment.prepend(start);
        fragment.append(end);
        const scope = createScope(containerOwner.scope);
        let removed = false;
        const handle: InsertHandle = {
            get nodes() { return range.nodes(); },
            get removed() { return removed; },
            remove() { scope.dispose(); },
        };
        onDispose(scope, () => {
            removed = true;
            const current = range.nodes();
            try {
                disposeNodes(current);
            } finally {
                removeElement(range);
            }
        });
        try {
            if (placement === 'replaceChildren' || placement === 'textContent') {
                container.replaceChildren(fragment);
            } else {
                insertBefore(container, fragment, reference?.parentNode === container ? reference : null);
                previous.forEach(child => removeChild(getParent(child), child));
            }
            scope.run(() => {
                ownNode(start, context, containerOwner.runtime);
                ownNode(end, context, containerOwner.runtime);
                if (placement !== 'textContent') {
                    withHydration(container, () => {
                        for (const child of children)
                            if (getParent(child) === container) hydrateNode(child, context, containerOwner.runtime);
                    });
                }
            });
        } catch (error) {
            try {
                removeElement(handle);
            } catch (cleanupError) {
                throw combinedError('Brio insertion and cleanup both failed.', [error, cleanupError]);
            }
            throw error;
        }
        return handle;
    };
}
