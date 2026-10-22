import { ObjectConstructor, createError, brioErrors, isObjectType } from './native';

const located = new WeakSet<object>();

const define = (error: object, name: string, value: unknown) =>
    ObjectConstructor.defineProperty(error, name, { configurable: true, value });

export const errorText = (error: unknown): string =>
    error && isObjectType(error) && 'message' in error ? `${(error as Error).name}: ${(error as Error).message}` : String(error);

const elementOf = (node: Node): Element | null => {
    const element = node.nodeType === 1 ? node : node.parentNode;
    return element?.nodeType === 1 ? element as Element : null;
};

/** Short, human-readable location such as `<button#save.primary> inside <user-card>`. */
export const describeNode = (node: Node): string => {
    const element = elementOf(node);
    if (!element) return 'a detached node';
    const tag = (el: Element) => el.tagName.toLowerCase();
    const classes = (element.getAttribute('class') ?? '').trim().split(/\s+/).filter(Boolean).slice(0, 2);
    let text = `<${tag(element)}${element.id ? '#' + element.id : ''}${classes.map(name => '.' + name).join('')}>`;
    for (let parent = element.parentElement; parent; parent = parent.parentElement)
        if (tag(parent).includes('-')) return `${text} inside <${tag(parent)}>`;
    return text;
};

export const mark = <E extends object>(error: E, node?: Node, directive?: string): E => {
    located.add(error);
    const element = node && elementOf(node);
    if (element) define(error, 'element', element);
    if (directive) define(error, 'directive', directive);
    return error;
};

export function causedError(message: string, cause: unknown): Error {
    const error = createError(message);
    define(error, 'cause', cause);
    return error;
}

/** Wraps a failure with the directive and element that triggered it, keeping the original as `cause`. */
export const directiveError = (message: string, cause: unknown, directive?: string, node?: Node, hint = ''): Error =>
    mark(causedError(
        `${message}${directive ? ` in ${directive}` : ''}${node ? ` on ${describeNode(node)}` : ''}: ${errorText(cause)}${hint}`,
        cause,
    ), node, directive);

/** Appends the element being hydrated or updated to a Brio-raised error that has no location yet. */
export const locate = (error: unknown, node?: Node): unknown => {
    if (node && brioErrors.has(error as object) && !located.has(error as object)) {
        (error as Error).message += ` (at ${describeNode(node)})`;
        mark(error as Error, node);
    }
    return error;
};

// Scopes carry the node they hydrate so effect failures can name it.
export const setScopeNode = (scope: object, node: Node | undefined) => {
    if (node) (scope as { _node?: Node })._node = node;
};
export const getScopeNode = (scope: object | undefined): Node | undefined => (scope as { _node?: Node } | undefined)?._node;

export function combinedError(message: string, errors: unknown[]): Error {
    const error = mark(createError(message + errors.map(item => '\n  - ' + errorText(item)).join('')));
    define(error, 'errors', errors);
    return error;
}
