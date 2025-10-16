import { loadedScripts } from "../app";
import { logError } from "../tools";
import { each, filter, sort } from "../tools/array";
import { AFTER, BEFORE, BEGIN, BODY, ELEMENT, END, HTML, HYDRATE, INNER_HTML, NOT_FOUND, OUTER, OUTER_HTML, SELECT, TEXT, TEXT_CONTENT, INNER, PARENT, HEAD, SCRIPT, ONCE, STYLE, REPLACE_WITH, B_, INSERT } from "../tools/constants";
import { childNodes, createElement, eachAttribute, forcePropertyAssignment, getAttr, getParent, getTagName, insertHTML, insertNodes, parseHTML, query, queryAll, setAttr } from "../tools/dom";
import { getProp, newSet } from "../tools/object";
import { isNode, isNull } from "../tools/typeCheck";

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
export let newInsert = (hydrate: FunctionType, dehydrate: FunctionType, templates: ObjectType) => async (content: any, where: 'outer'|'inner'|'text'|'before'|'first'|'last'|'after', target: HTMLElement | string, options?: InsertOptions) => {

    // Where to insert the content
    let location = where == OUTER ? OUTER_HTML // outer - insert content as outerHTML of element
        : where == INNER ? INNER_HTML // inner - insert content as innerHTML of element
        : where == TEXT ? TEXT_CONTENT // text - insert content as textContent of element
        : where == BEFORE ? BEFORE+BEGIN // before - insert content before the element
        : where == 'first' ? AFTER+BEGIN // first - insert content as the first child of the element
        : where == 'last' ? BEFORE+END // last - insert content as the last child of the element
        : where == AFTER ? AFTER+END // after - insert content after the element
        : where; // full name: outerHTML, innerHTML, textContent, beforebegin, afterbegin, beforeend, afterend

    // Method name
    let $INSERT = '$dom.'+INSERT as '$dom.insert';

    /** The element to insert the content relative to */
    let el = query(target) as any;
    let head = query(HEAD)!;
    let body = query(BODY)!;

    // Log an error if the element is not found
    if (!el) return logError($INSERT, ELEMENT, NOT_FOUND);

    // If the target is the <head> or <body> element, only the innerHTML location is allowed
    if (head == el || body == el) location = INNER_HTML;

    // Reusable location checks
    let isHTML = query(HTML) == el;
    let isText = location == TEXT_CONTENT;
    let isInner = isText || location == INNER_HTML;
    let isOuter = location == OUTER_HTML;

    /** The parent element. If the location `isInner`, the parent is the element itself */
    let parent = isInner ? el : getParent(el);

    // Log an error if the parent element is not found
    if (!parent && !isHTML) return logError($INSERT, PARENT, ELEMENT, NOT_FOUND);


    // ! GET THE CONTENT

    // Await the content, in case it is a promise
    content = await content;

    // The content is a template
    if (content in templates) content = templates[content]();

    // Parse the content if it is a string
    let htmlContent = isNode(content) ? content : parseHTML(content);

    // Query the content using the provided selector
    let optionSelect = getProp(options, SELECT) as string;
    if (optionSelect) content = query(optionSelect, htmlContent);

    // Get the outerHTML of the content if it is a node
    if (isNode(content)) content = content[OUTER_HTML];


    // ! CLEANUP THE DOM

    // isOuter: Dehydrate the element
    if (isOuter || isHTML) dehydrate(el, false);

    // isInner: Dehydrate and remove the child nodes
    if (isInner) each(childNodes(el), node => dehydrate(node));


    // ! CACHE THE NODES

    // Cache the current child nodes of the element and its parent
    let cachedNodes = newSet(childNodes(el)) as Set<Node>;
    if (parent) each(childNodes(parent), node => cachedNodes.add(node));

    /** Filter the new nodes */
    let filterNewNodes = (parentNode: Node) => filter(childNodes(parentNode), node => !cachedNodes.has(node));

    /** The inserted nodes */
    let insertedNodes: Node[] = [];


    // ! INSERT THE NODES

    /**
     * IMPORTANT!
     * When the target is <html> the whole document is replaced.
     */
    if (isHTML) {
        el[INNER_HTML] = query(HTML, htmlContent)![INNER_HTML];

        // Get the inserted nodes
        insertedNodes = [el, ...queryAll(SCRIPT, el)];
    }
    /**
     * IMPORTANT!
     * When the target is <head> or <body> the child nodes of the element are replaced.
     */
    else if (isInner) {
        el[isText ? TEXT_CONTENT : INNER_HTML] = content;

        // Get the inserted nodes
        insertedNodes = childNodes(el);
    }
    // Insert content as outerHTML of the element. This will replace the element itself.
    else if (isOuter) {
        el[OUTER_HTML] = content;

        // Get the inserted nodes
        insertedNodes = filterNewNodes(parent);
    }
    // Insert content before, after, or as the first or last child of the element
    else {
        insertHTML(el, location as InsertPosition, content);

        // Get the inserted nodes
        insertedNodes = filterNewNodes(location == BEFORE+BEGIN || location == AFTER+END ? parent : el);
    }

    // Sort inserted style elements first, then the rest.
    // Note: This is necessary to ensure they are registered before other elements are hydrated.
    sort(insertedNodes, (a, b) => {
        let aIsStyle = getTagName(a) == STYLE;
        let bIsStyle = getTagName(b) == STYLE;
        return aIsStyle && !bIsStyle ? -1
            : bIsStyle && !aIsStyle ? 1
            : 0;
    });

    // Load/execute script elements
    each(insertedNodes, scriptElement => {

        // IMPORTANT: Don't load the external script if it has already been loaded and marked as "b-load-once"
        if (// is script element
            getTagName(scriptElement) == SCRIPT &&
            // is not b-script
            isNull(getAttr(scriptElement, B_+SCRIPT)) &&
            // should load: !(b-load-once attribute AND script already loaded)
            !(!isNull(getAttr(scriptElement, 'b-load-'+ONCE)) && loadedScripts.has(getAttr(scriptElement, 'src') as string))
        ) {

            // Create a new script element
            let newScriptElement = createElement(SCRIPT);

            // Copy the attributes from the old script
            eachAttribute(scriptElement, (name, value) => setAttr(newScriptElement, name, value, forcePropertyAssignment(name) && name));

            // Copy the innerHTML
            newScriptElement[INNER_HTML] = scriptElement[INNER_HTML];

            // Replace the old script element with the new one
            // Note: This will load/execute the script
            insertNodes(scriptElement, REPLACE_WITH, newScriptElement);
        }
    });

    // Hydrate the inserted nodes
    if (getProp(options, HYDRATE, true)) {
        for (let node of insertedNodes) await hydrate(node, el);
    }

    // Hydrate the inserted nodes
    let then = getProp(options, 'then');
    then && await then(insertedNodes);
}