import { createExpressionScope } from '../core/expression';
import { createScope, onDispose } from '../core/scope';
import { createScopedState } from '../core/scoped-state';
import { combinedError } from '../core/errors';
import type { Insert, InsertHandle } from '../core/types';
import type { DomRuntime } from './types';
import { getTrustedHTMLString, trustedHTML } from './types';
import { hydrateNode } from './bindings';
import { disposeNodes, getNodeOwner, ownNode } from './ownership';

const placements = new Set(['before', 'after', 'prepend', 'append', 'replaceWith', 'replaceChildren', 'textContent']);

export function createInsert(runtime: DomRuntime): Insert {
    return (target, placement, content, options = {}) => {
        const root = runtime.root;
        const rootOwner = root && getNodeOwner(root);
        if (!root || !rootOwner || rootOwner.runtime.app !== runtime.app ||
            rootOwner.runtime.mountScope !== runtime.mountScope || runtime.mountScope?.disposed)
            throw new Error('$insert requires an active mounted Brio root.');
        const node = typeof target === 'string'
            ? (root.matches(target) ? root : root.querySelector(target))
            : target;
        if (!(node instanceof Node) || (!root.contains(node) && getNodeOwner(node)?.runtime.root !== root))
            throw new TypeError('$insert target must resolve to a node inside this app root.');
        const targetOwner = getNodeOwner(node);
        if (targetOwner && targetOwner.runtime.app !== runtime.app)
            throw new Error('$insert cannot target content owned by another Brio app.');
        if (!options || typeof options !== 'object' || Array.isArray(options))
            throw new TypeError('$insert options must be an object.');
        if (!placements.has(placement))
            throw new TypeError(`Invalid $insert placement "${placement}".`);
        const siblingPlacement = placement === 'before' || placement === 'after' || placement === 'replaceWith';
        if (siblingPlacement && node === root)
            throw new Error('$insert cannot insert beside or replace a mount root.');
        if (placement === 'replaceWith' && targetOwner?.structuralRoot)
            throw new Error('$insert cannot replace a root managed by b-if or b-for; replace its enclosing container instead.');
        const container = siblingPlacement ? node.parentNode : node;
        if (!(container instanceof Element))
            throw new TypeError('This $insert placement requires an element container.');
        const containerOwner = getNodeOwner(container);
        if (!containerOwner || containerOwner.runtime.app !== runtime.app || containerOwner.scope.disposed)
            throw new Error('$insert destination has no active context owned by this app.');
        if (containerOwner.controlsChildren)
            throw new Error('$insert cannot modify a container whose content is controlled by a directive.');
        if (typeof content !== 'string' && !(content instanceof Node))
            throw new TypeError('$insert content must be an HTML string or a node to clone.');

        const document = container.ownerDocument;
        const fragment = document.createDocumentFragment();
        if (placement === 'textContent') {
            fragment.append(document.createTextNode(typeof content === 'string' ? content : content.textContent ?? ''));
        } else if (typeof content === 'string') {
            const template = document.createElement('template');
            template.innerHTML = getTrustedHTMLString(trustedHTML(content));
            fragment.append(template.content);
        } else {
            const supportedTypes: number[] = [Node.ELEMENT_NODE, Node.TEXT_NODE, Node.COMMENT_NODE, Node.DOCUMENT_FRAGMENT_NODE];
            if (!supportedTypes.includes(content.nodeType))
                throw new TypeError('$insert can clone elements, text, comments, or document fragments.');
            fragment.append(document.importNode(content, true));
        }

        const context = options.data === undefined ? containerOwner.context : createExpressionScope({
            $data: createScopedState(options.data, containerOwner.context.$data),
        }, containerOwner.context);
        const previous = placement === 'replaceWith' ? [node] :
            placement === 'replaceChildren' || placement === 'textContent' ? Array.from(container.childNodes) : [];
        const reference = placement === 'before' ? node :
            placement === 'after' || placement === 'replaceWith' ? node.nextSibling :
                placement === 'prepend' ? container.firstChild : null;
        // Validate and parse before disposing any existing content.
        disposeNodes(previous);
        const start = document.createComment('brio:insert');
        const end = document.createComment('/brio:insert');
        const children = Array.from(fragment.childNodes);
        fragment.prepend(start);
        fragment.append(end);
        const scope = createScope(containerOwner.scope);
        const nodes = (): Node[] => {
            const result: Node[] = [];
            if (start.parentNode && start.parentNode === end.parentNode) {
                let current = start.nextSibling;
                while (current && current !== end) {
                    result.push(current);
                    current = current.nextSibling;
                }
            }
            return result;
        };
        let removed = false;
        const handle: InsertHandle = {
            get nodes() { return nodes(); },
            get removed() { return removed; },
            remove() { scope.dispose(); },
        };
        onDispose(scope, () => {
            removed = true;
            const current = nodes();
            try {
                disposeNodes(current);
            } finally {
                nodes().forEach(child => child.parentNode?.removeChild(child));
                start.remove();
                end.remove();
            }
        });
        try {
            if (placement === 'replaceChildren' || placement === 'textContent') {
                container.replaceChildren(fragment);
            } else {
                container.insertBefore(fragment, reference?.parentNode === container ? reference : null);
                previous.forEach(child => child.parentNode?.removeChild(child));
            }
            scope.run(() => {
                ownNode(start, context, containerOwner.runtime);
                ownNode(end, context, containerOwner.runtime);
                if (placement !== 'textContent') {
                    for (const child of children)
                        if (child.parentNode === container) hydrateNode(child, context, containerOwner.runtime);
                }
            });
        } catch (error) {
            try {
                handle.remove();
            } catch (cleanupError) {
                throw combinedError('Brio insertion and cleanup both failed.', [error, cleanupError]);
            }
            throw error;
        }
        return handle;
    };
}
