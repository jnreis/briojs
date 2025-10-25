/**
 ** QUERYING NODES
 */
/** Query all elements that match a selector */
export declare let queryAll: (selector: string, root?: Node) => Element[];
/** Query the first element that matches a selector */
export declare let query: (selector: string | Node, root?: Node) => Element | undefined;
/**
 ** INSERTING NODES
 */
/**
 * Insert nodes adjacent to an element
 *
 * Comparison with insertHTML:
 * - replaceWith     = outerHTML
 * - replaceChildren = innerHTML
 */
export declare let insertNodes: (node: Element, position: "before" | "after" | "prepend" | "append" | "replaceWith" | "replaceChildren", ...content: string[] | Node[]) => void;
/**
 * Insert HTML adjacent to an element
 *
 * Comparison with insertNodes:
 * - outerHTML   = replaceWith
 * - innerHTML   = replaceChildren
 * - beforebegin = before
 * - afterend    = after
 * - afterbegin  = prepend
 * - beforeend   = append
 */
export declare let insertHTML: (node: Element, position: InsertPosition | "outerHTML" | "innerHTML", html: string) => void;
export declare let insertNode: (node: Node, parent: Node, nextSibling?: Node | null) => void;
export declare let cloneNode: (node: Node) => Node;
/** Restore the position of a node in the DOM to the closest position it was before being moved or removed */
export declare let restorePosition: (node: Node) => ((node: HTMLElement) => void) | undefined;
export declare let eachAttribute: (element: HTMLElement, callback: (name: string, value: string) => void) => any;
export declare let nodesBetween: (startNode: Node, endNode: Node, callback: FunctionType) => void;
export declare let removeNode: (node: HTMLElement | Text) => void;
export declare let getParent: (node: Node) => ParentNode | null;
export declare let previousSibling: (node: Node) => ChildNode | null;
export declare let nextSibling: (node: Node) => ChildNode | null;
export declare let firstChild: (node: Node) => ChildNode | null;
export declare let lastChild: (node: Node) => ChildNode | null;
export declare let getNodeContent: (node: Node) => string;
/** Get the child nodes of a node as an array */
export declare let childNodes: (node: Node) => ChildNode[];
export declare let getAttr: (node: HTMLElement, attr: string) => string | null;
export declare let setAttr: (node: HTMLElement, attr: string, value: string, prop?: string | false) => void;
export declare let delAttr: (node: HTMLElement, attr: string) => void;
export declare let setClass: (node: HTMLElement, ...className: string[]) => void;
export declare let delClass: (node: HTMLElement, ...className: string[]) => void;
export declare let hasClass: (node: HTMLElement, className: string) => boolean;
export declare let nextFrame: (callback: FunctionType) => number;
export declare let createElement: (tagName: string, options?: ElementCreationOptions) => HTMLElement;
export declare let createComment: (text: string) => Comment;
export declare let formData: (form?: HTMLFormElement, submitter?: HTMLElement | null) => FormData;
export declare let parseHTML: (html: string) => Document;
export declare let getTagName: (node: any) => string;
export declare let listen: (target: HTMLElement | string, eventName: string, callback: (event: Event) => void, options?: boolean | AddEventListenerOptions) => () => void;
export declare let emit: (target: HTMLElement | string, eventName: string, eventData?: any) => boolean;
export declare let walk: (node: Node, callback: WalkSyncCallback | WalkAsyncCallback, walkTemplate?: boolean) => Promise<void>;
export declare let onCompositionStart: (e: Event) => boolean;
export declare let onCompositionEnd: (e: Event) => void;
export declare let getStyle: (node: HTMLElement) => CSSStyleDeclaration;
export declare let isElementVisible: (node: HTMLElement) => boolean;
/** Create a URL object */
/** Get a part of a URL */
export declare let href: (_url?: string, part?: "href" | "origin" | "pathname" | "search") => string;
/** Check if a route path is on the same origin */
export declare let sameOrigin: (routePath: string) => boolean;
/**
 * Check if a property assignment should be forced.
 *
 * The following properties are forced: `src`, `value`, `checked`, and `selected`
 *
 * Explanation:
 * - Updating the `src` property normalizes the path and ensures the new resource is loaded
 * - The properties `value`, `checked`, and `selected` reflect the current state of the element
 */
export declare let forcePropertyAssignment: (attrName: string) => boolean;
export declare let sanitizeAttrName: (attrName: string) => string;
/**
 * ! UNUSED. MAY BE REMOVED IN THE FUTURE
 */
export declare let closest: (node: Node, selector: string) => Element | null;
/** Check if the browser supports a given CSS property-value pair */
export declare let cssSupport: (property: string, value: string) => boolean;
export declare let getDeclaredStyles: (style: CSSStyleDeclaration) => StyleProps;
/**
 * Split styles into transition-related and other styles
 *
 * returns [transitionStyles, otherStyles]
 */
export declare let splitTransitionStyles: (styles: StyleProps) => [StyleProps, StyleProps];
export declare let getStylesFromSelector: (selector: string) => StyleProps | undefined;
export declare let setStyleProp: (el: HTMLElement, prop: string, value: string, priority?: string) => void;
export declare let delStyleProp: (el: HTMLElement, prop: string) => void;
export declare let setStyleProps: (el: HTMLElement, ...styleProps: StyleProps[]) => void;
export declare let delStyleProps: (el: HTMLElement, ...styleProps: StyleProps[]) => void;
