import { has, slice } from ".";
import { arrayFrom, arrayReverse, each, indexOf } from "./array";
import { COMPOSING, DISPLAY, HREF, HTML, INPUT, TARGET, TEXT, TEXT_CONTENT, AFTER, VALUE, CHECKED, SELECT, CLASS_LIST, REMOVE, GET_ATTRIBUTE, SET_ATTRIBUTE, REMOVE_ATTRIBUTE, ADD_EVENT_LISTENER, REMOVE_EVENT_LISTENER, INNER_HTML, OUTER_HTML, BEFORE, APPEND, INSERT_ADJACENT_HTML, CLONE_NODE, PARENT_NODE, PREVIOUS_SIBLING, NEXT_SIBLING, FIRST_CHILD, LAST_CHILD, CREATE_ELEMENT, DETAIL, CREATE_COMMENT, STYLE, GET_PROPERTY_VALUE, GET_PROPERTY_PRIORITY, SET_PROPERTY, REMOVE_PROPERTY, TRANSITION, CONTENT, TEMPLATE } from "./constants";
import { D, L, W } from "./object";
import { lower, replace, startsWith, trim } from "./string";
import { isElementNode, isString } from "./typeCheck";


/**
 ** QUERYING NODES
 */

/** Query all elements that match a selector */
export let queryAll = (selector: string, root: Node = D) =>
    arrayFrom((root as HTMLElement).querySelectorAll(selector)) as Element[];

/** Query the first element that matches a selector */
export let query = (selector: string | Node, root: Node = D) => (
    isString(selector) 
        ? queryAll(selector as string, root)[0] 
        : selector
) as Element | undefined;


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
export let insertNodes = (node: Element, position: 'before' | 'after' | 'prepend' | 'append' | 'replaceWith' | 'replaceChildren', ...content: string[]|Node[]) =>
    node[position](...content);

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
export let insertHTML = (node: Element, position: InsertPosition | 'outerHTML' | 'innerHTML', html: string) => {
    if (position == INNER_HTML || position == OUTER_HTML) node[position] = html;
    else node[INSERT_ADJACENT_HTML](position, html);
}

export let insertNode = (node: Node, parent: Node, nextSibling?: Node|null) => {
    // If the next sibling was provided and is in the DOM, insert the node before it
    if (nextSibling && getParent(nextSibling))
        insertNodes(nextSibling as Element, BEFORE, node);

    // If the next sibling was not provided or is not in the DOM, append the node to the parent
    else insertNodes(parent as Element, APPEND, node);
}

export let cloneNode = (node: Node) =>
    node[CLONE_NODE](true);

/** Restore the position of a node in the DOM to the closest position it was before being moved or removed */
export let restorePosition = (node: Node) => {
    let parent = getParent(node);

    if (parent) {
        // Get the child nodes of the parent
        let nodes = childNodes(parent!) as any[];

        // Get the index of the target node
        let index = indexOf(nodes, node);

        // Get the nodes before the target node
        let nodesBefore = arrayReverse(slice(nodes, 0, index) as any[]) as Element[];

        // Get the nodes after the target node
        let nodesAfter = slice(nodes, index + 1) as Element[];

        // Return a function to insert the node in the correct position
        return (node: HTMLElement) => {
            let inserted = false;

            // Attempt to insert the node before the the after nodes
            for (let nodeAfter of nodesAfter) {
                if (getParent(nodeAfter) == parent) {
                    insertNodes(nodeAfter, BEFORE, node);
                    inserted = true;
                    break;
                }
            }

            // If the node was not inserted, attempt to insert the node after the before nodes
            if (!inserted) {
                for (let nodeBefore of nodesBefore) {
                    if (getParent(nodeBefore) == parent) {
                        insertNodes(nodeBefore, AFTER, node);
                        inserted = true;
                        break;
                    }
                }
            }

            // If the node was not inserted, append the node to the parent
            if (!inserted) insertNodes(parent as Element, APPEND, node);
        }
    }
}

export let eachAttribute = (element: HTMLElement, callback: (name: string, value: string) => void) =>
    each(arrayFrom(element.attributes), ({name, [VALUE]: value}) => callback(name, value));

export let nodesBetween = (startNode: Node, endNode: Node, callback: FunctionType) => {
    let currentNode = nextSibling(startNode);
    while (currentNode && currentNode != endNode) {
        callback(currentNode);
        currentNode = nextSibling(currentNode);
    }
}

export let removeNode = (node: HTMLElement | Text) =>
    node[REMOVE]();

export let getParent = (node: Node) =>
    node[PARENT_NODE];

export let previousSibling = (node: Node) =>
    node[PREVIOUS_SIBLING];

export let nextSibling = (node: Node) =>
    node[NEXT_SIBLING];

export let firstChild = (node: Node) =>
    node[FIRST_CHILD];

export let lastChild = (node: Node) =>
    node[LAST_CHILD];

export let getNodeContent = (node: Node) =>
    trim(node[TEXT_CONTENT] || '');

/** Get the child nodes of a node as an array */
export let childNodes = (node: Node) =>
    [...node.childNodes];

export let getAttr = (node: HTMLElement, attr: string) =>
    node[GET_ATTRIBUTE](attr);

export let setAttr = (node: HTMLElement, attr: string, value: string, prop?: string|false) => {
    // Set the DOM property
    if (prop) (node as any)[prop] = value;

    // Set the attribute
    node[SET_ATTRIBUTE](attr, value);
}

export let delAttr = (node: HTMLElement, attr: string) =>
    node[REMOVE_ATTRIBUTE](attr);

export let setClass = (node: HTMLElement, ...className: string[]) =>
    node[CLASS_LIST].add(...className);

export let delClass = (node: HTMLElement, ...className: string[]) =>
    node[CLASS_LIST][REMOVE](...className);

export let hasClass = (node: HTMLElement, className: string) =>
    node[CLASS_LIST].contains(className);

let rAF = requestAnimationFrame;
export let nextFrame = (callback: FunctionType) => rAF(() => rAF(callback));

export let createElement = (tagName: string, options?: ElementCreationOptions) =>
    D[CREATE_ELEMENT](tagName, options);

export let createComment = (text: string) =>
    D[CREATE_COMMENT](text);

export let formData = (form?: HTMLFormElement, submitter?: HTMLElement | null) =>
    new FormData(form, submitter);

export let parseHTML = (html: string) =>
    new DOMParser().parseFromString(html, TEXT+'/'+HTML as 'text/html');

export let getTagName = (node: any) =>
    lower(node.tagName || '');

// Listen to an event on a node with a callback and return a clean up function
export let listen = (target: HTMLElement|string, eventName: string, callback: (event: Event) => void, options?: boolean | AddEventListenerOptions) => {
    // Get the target element, if it is a string
    target = query(target) as HTMLElement;

    // Add the event listener
    (target  as HTMLElement)[ADD_EVENT_LISTENER](eventName, callback, options);

    // Return a clean up function
    return () => (target as HTMLElement)[REMOVE_EVENT_LISTENER](eventName, callback)
}

// Emit an event on a node
export let emit = (target: HTMLElement|string, eventName: string, eventData?: any) =>
    query(target)!.dispatchEvent(new CustomEvent(lower(replace(eventName, /[^a-z\d]/gi, '')), {
        bubbles: true, 
        cancelable: true, 
        [DETAIL]: eventData
    }));

// Traverse DOM tree
export let walk = async (node: Node, callback: WalkSyncCallback | WalkAsyncCallback, walkTemplate: boolean = false) => {
    // If callback returns false, don't walk through child nodes
    if (await callback(node)) {
        // Recursively walk through child nodes
        for (let child of childNodes(walkTemplate && getTagName(node) == TEMPLATE ? (node as HTMLTemplateElement)[CONTENT] : node)) {
            await walk(child, callback, walkTemplate);
        }
    }
}

export let onCompositionStart = (e: Event) =>
    (e[TARGET] as any)[COMPOSING] = true;

export let onCompositionEnd = (e: Event) => {
    let target = e[TARGET] as any;
    if (target[COMPOSING]) {
        target[COMPOSING] = false;
        emit(target, INPUT);
    }
}

export let getStyle = (node: HTMLElement) =>
    W.getComputedStyle(node);

export let isElementVisible = (node: HTMLElement) => {
    // Check if element is hidden due to display, visibility, or opacity
    let style = getStyle(node);
    return !(!getParent(node) || style[DISPLAY] == 'none' || style.visibility == 'hidden' || style.opacity == '0');
}

/** Create a URL object */
// export let newURL = (_url: string | URL, base?: string | URL) =>
//     new URL(_url, base);

/** Get a part of a URL */
export let href = (_url: string = '', part: 'href'|'origin'|'pathname'|'search' = HREF) =>
    new URL(_url, L[HREF])[part];

/** Check if a route path is on the same origin */
export let sameOrigin = (routePath: string) => startsWith(href(routePath), L.origin);

/**
 * Check if a property assignment should be forced.
 * 
 * The following properties are forced: `src`, `value`, `checked`, and `selected`
 * 
 * Explanation:
 * - Updating the `src` property normalizes the path and ensures the new resource is loaded
 * - The properties `value`, `checked`, and `selected` reflect the current state of the element
 */
export let forcePropertyAssignment = (attrName: string) =>
    has(['src', VALUE, CHECKED, SELECT+'ed'], attrName);

export let sanitizeAttrName = (attrName: string) => 
    replace(replace(attrName, /[^a-z0-9_-]/gi, ''), /^[^a-z_]+/i, '');


/**
 * ! UNUSED. MAY BE REMOVED IN THE FUTURE
 */
export let closest = (node: Node, selector: string) => {
    let el = isElementNode(node) ? node: getParent(node);
    return el && (el as HTMLElement).closest(selector);
}

/** Check if the browser supports a given CSS property-value pair */
export let cssSupport = (property: string, value: string) => {
    let supported = false;
    try {
        supported = CSS.supports(property, value);
    } catch {}

    return supported;
}

export let getDeclaredStyles = (style: CSSStyleDeclaration): StyleProps => {
    let styles: Record<string, [string, string]> = {};
    for (let prop of style) {
        styles[prop] = [style[GET_PROPERTY_VALUE](prop), style[GET_PROPERTY_PRIORITY](prop)];
    }
    return styles;
}

/**
 * Split styles into transition-related and other styles
 * 
 * returns [transitionStyles, otherStyles]
 */
export let splitTransitionStyles = (styles: StyleProps): [StyleProps, StyleProps] => {
    let transitionStyles: StyleProps = {};
    let otherStyles: StyleProps = {};

    for (let prop in styles) {
        (startsWith(prop, TRANSITION) ? transitionStyles : otherStyles)[prop] = styles[prop];
    }

    return [transitionStyles, otherStyles];
}

export let getStylesFromSelector = (selector: string) => {
  for (let sheet of document.styleSheets) {
    try {
      for (let rule of sheet.cssRules) {
        if ((rule as CSSStyleRule).selectorText == selector) {
          return getDeclaredStyles((rule as CSSStyleRule)[STYLE]);
        }
      }
    }
    // Skip inaccessible stylesheets (e.g. CORS-restricted stylesheets)
    catch {}
  }
}

export let setStyleProp = (el: HTMLElement, prop: string, value: string, priority?: string) => {
    el[STYLE][SET_PROPERTY](prop, value, priority);
}

export let delStyleProp = (el: HTMLElement, prop: string) => {
    el[STYLE][REMOVE_PROPERTY](prop);
}

export let setStyleProps = (el: HTMLElement, ...styleProps: StyleProps[]) => {
    for (let styles of styleProps) {
        for (let prop in styles) {
            setStyleProp(el, prop, ...styles[prop]);
        }
    }
}

export let delStyleProps = (el: HTMLElement, ...styleProps: StyleProps[]) => {
    for (let styles of styleProps) {
        for (let prop in styles) {
            delStyleProp(el, prop);
        }
    }
}