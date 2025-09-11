/**
 * Inserts an HTML string into the DOM relative to an element
 *
 * When the target is the HTML element the whole document is replaced.
 *
 * When the target is the HEAD or BODY element the child nodes of the element are replaced.
 *
 * The content may also be the name of a template.
 *
 * @param content The content to insert
 * @param where Where to insert the content (outer, inner, text, before, after, first, last)
 * @param target The element to insert the content relative to
 * @param options.select A selector to query an element from the content
 * @param options.hydrate Whether to hydrate the inserted nodes (default: true)
 * @param options.then A callback function to be called with the inserted nodes
 *
 * @example
 * $dom.insert('<html lang="en"><head>...</head><body>...</body></html>', 'outer', 'html');
 * $dom.insert('<div>...</div>', 'inner', 'body');
 * $dom.insert('Hello, World!', 'text', 'p');
 */
export declare let newInsert: (hydrate: FunctionType, dehydrate: FunctionType, templates: ObjectType) => (content: any, where: "outer" | "inner" | "text" | "before" | "first" | "last" | "after", target: HTMLElement | string, options?: InsertOptions) => Promise<any>;
