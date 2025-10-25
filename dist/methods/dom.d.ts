/**
 * Inserts an HTML string or Node into the DOM relative to a Node.
 *
 * *Notes*:
 * - Targeting the `html` element is not allowed.
 * - The `head` and `body` elements only support `replaceChildren`, `prepend`, and `append` insertions.
 *
 * @param target The Node to insert the content relative to (Node or selector)
 * @param placement Where to insert the content (before, after, prepend, append, replaceWith, replaceChildren, text)
 * @param content The content to insert (HTML string, Node, template name, or Promise)
 * @param options.selector A selector to query an element from the content
 * @param options.hydrate Whether to hydrate the inserted nodes (default: true)
 * @returns The inserted nodes
 */
export declare let newInsert: (app: AppObject) => (target: HTMLElement | string, placement: "before" | "after" | "prepend" | "append" | "replaceWith" | "replaceChildren" | "text", content: any, options?: InsertOptions) => Promise<any>;
