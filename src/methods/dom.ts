import { updateDataLevelContext } from "../app";
import { has, logError, logWarn, size, slice } from "../tools";
import { arrayAdd, each, every, join, map, some } from "../tools/array";
import { BODY, ELEMENT, HTML, HYDRATE, INNER_HTML, NOT_FOUND, TEXT, TEXT_CONTENT, HEAD, SCRIPT, REPLACE_WITH, $INSERT, TEMPLATE, $HYDRATE, $DEHYDRATE, B_SCRIPT, B_IGNORE, B_SAVE, B_SLOT, CONTENT, PREPEND, APPEND, REPLACE_CHILDREN, MUST_BE, OF_TYPE, NODE__$CAP, TARGET, STRING, SELECTOR, BEFORE, AFTER, HTML__$UPPER, B_, PROPS, FUNCTION, BUT_GOT_INSTEAD, $PROPS, DEFAULT, REQUIRED, INVALID__$CAP } from "../tools/constants";
import { childNodes, createElement, delAttr, eachAttribute, forcePropertyAssignment, getAttr, getTagName, hasAttr, insertNodes, query, queryAll, setAttr } from "../tools/dom";
import { countKeys, getProp } from "../tools/object";
import { isStringFunction, lower, space, trim, upper, wrapInBackticks } from "../tools/string";
import { getType, isArray, isElementNode, isFunction, isNode, isNull, isObject, isString, isUndefined } from "../tools/typeCheck";

let onlySupportInsertions = (placement: string[]) => `only supports ${join(slice(placement, 0, -1) as string[], ', ')}, and ${placement[size(placement) - 1]} insertions`;

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
export let newInsert = (app: AppObject) => async (target: HTMLElement | string, placement: 'before'|'after'|'prepend'|'append'|'replaceWith'|'replaceChildren'|'text', content: any, options?: InsertOptions) => {

    let $INSERT_ = $INSERT + ':' as '$insert:';

    // Where to insert the content (textContent for 'text' placement)
    let place = placement == TEXT ? TEXT_CONTENT : placement;

    let placementOptions = [BEFORE, AFTER, PREPEND, APPEND, REPLACE_WITH, REPLACE_CHILDREN, TEXT];

    let hasPlacement = () => some(placementOptions, p => p == placement);

    // Log an error if the placement is invalid
    if (!hasPlacement())
        return logError($INSERT_, onlySupportInsertions(placementOptions));

    /** The `node` to insert the content relative to */
    let el = query(target) as any;

    // Log an error if the target is not a valid Node
    if (!isNode(el))
        return logError($INSERT_, TARGET, MUST_BE, OF_TYPE, NODE__$CAP);

    // Log an error if the target is the <html> element
    if (query(HTML) == el)
        return logError($INSERT_, TARGET, 'cannot be the', HTML__$UPPER, ELEMENT);

    placementOptions = [REPLACE_CHILDREN, PREPEND, APPEND];

    // `head` and `body` only support replaceChildren, prepend, and append insertions
    if ((query(HEAD) == el || query(BODY) == el) && !hasPlacement())
        return logError($INSERT_, upper(getTagName(el)), ELEMENT, onlySupportInsertions(placementOptions));

    // ! GET THE CONTENT

    // Await the content, in case it is a promise
    content = await content;

    let templates = app[TEMPLATE];

    // The content is a template
    if (content in templates) content = templates[content];

    let isText = place == TEXT_CONTENT;
    let parsedContent = content;
    let parsed = false;
    let propsNode: HTMLElement | undefined;

    // Parse the content if it is a string
    if (!isText && isString(content)) {
        parsedContent = createElement('div');
        parsedContent[INNER_HTML] = trim(content);
        propsNode = parsedContent.children[0] as HTMLElement;
        parsed = true;
    }

    // The content must be a Node or a string
    if (!isText && !isNode(parsedContent))
        return logError($INSERT_, CONTENT, MUST_BE, OF_TYPE, NODE__$CAP, 'or', STRING);

    // Query a HTMLElement using the provided selector
    let selector = getProp(options, SELECTOR) as string;
    if (!isText && selector && isString(selector)) {

        // Query the selector from the parsed content
        parsedContent = query(selector, parsedContent) as HTMLElement;

        // Log an error if the selector did not find a valid Node
        if (!isNode(parsedContent))
            return logError($INSERT_, ELEMENT, NOT_FOUND);

        if (getAttr(parsedContent, B_+PROPS)) propsNode = parsedContent;
    }

    let {n: newBNode, g: getBNode} = app.bnode;

    let bnode = getBNode(el) as BNode;

    // ! VALIDATE PROPS

    // Get props schema from b-props attribute
    if (bnode && propsNode && !isText) {

        let validProps = true;
        let $props: ObjectType = {};
        let propsSchema: ObjectType = {};

        // Get props schema
        let propsAttr = getAttr(propsNode, B_+PROPS);
        if (propsAttr) propsSchema = bnode.exec(bnode, propsAttr)() || {};

        // Process each prop defined in the schema
        for (let propName in propsSchema) {

            /**
             * Prop schema can be defined as:
             * - string: string, number, boolean, object, array, function, date, null, undefined, set, map, etc.
             * - array of strings: any of the above types
             * - object: {
             *      type: string or array of strings (see above)}
             *      required: boolean (optional, default: false)
             *      isText: boolean (optional, default: false)
             *      warn: function (optional)
             *      default: any (optional)
             *   }
             */
            let schema = propsSchema[propName];

            // Type. String or array of strings
            let type: any = schema;
            // Required. Defaults to false. If true, a warning is logged if the prop is not provided.
            let required = false;
            // IsText. If true, the prop value is treated as a string even if it looks like another type
            let isText = false;
            // Default value. A fallback value used when the prop value is of an invalid type or not provided.
            let defaultValue;
            // Custom warning function. A function that takes the prop value and prop name as arguments and may return a custom warning message.
            let warn;

            if (isObject(schema)) {
                type = schema.type;
                required = !!schema[REQUIRED];
                isText = !!schema.isText;
                defaultValue = schema[DEFAULT];
                warn = schema.warn;
            }

            // Ensure type is an array
            if (type && isString(type)) type = [type];

            // Log an error if the type is invalid
            if (!(isArray(type) && size(type) && every(type, t => isString(t)))) {
                logWarn(space(INVALID__$CAP, 'type for prop', propName + ':', MUST_BE, OF_TYPE, STRING, 'or an array of strings.'), el);
                continue;
            }

            // Normalize the type to lowercase
            type = map(type, lower);

            // Get the prop value
            let value: any = getAttr(el, propName);

            // Check required
            if (isNull(value)) {
                if (required) {
                    logError('Missing required prop: ' + propName + '.', el);
                    validProps = false;
                }
                continue;
            }

            // Delete the attribute after getting its value
            delAttr(el, propName);

            // If the value is text, wrap it in backticks to be evaluated as a string
            if (isText) value = wrapInBackticks(value);

            if (isStringFunction(value)) value = '()=>' + value;

            // Evaluate the prop value
            // Note: if the attribute is present but empty, the value will default to true
            if (isString(value)) value = bnode.exec(bnode, value || 'true')();

            // If the value is of an invalid type and a default value is provided, use the default value
            if (!has(type, getType(value)) && !isUndefined(defaultValue)) {
                // If the default value is a function and the type does not include function, call the function to get the default value.
                // Otherwise, use the default value as is.
                value = isFunction(defaultValue) && !has(type, FUNCTION) ? defaultValue() : defaultValue;
            }

            // Log a warning if the value is of an invalid type
            if (!has(type, getType(value))) {
                logWarn(space(INVALID__$CAP, 'prop type for', propName + ':', MUST_BE, OF_TYPE, join(type, ' or ') + ',', BUT_GOT_INSTEAD(getType(value))), el);
            }

            // The `warn` function perform a custom validation and may return a warning message
            if (isFunction(warn)) {
                let message = warn(value, propName);
                if (message) logWarn(message, el);
            }

            // Set the prop value
            $props[propName] = value;
        }

        // Set the props values in the bnode context
        if (validProps && countKeys($props)) bnode.ctx[$PROPS] = $props;
    }


    // ! CLEANUP THE DOM

    let dehydrate = app.gc[$DEHYDRATE];

    // Dehydrate but keep the element
    if (place == REPLACE_WITH) await dehydrate(el, false);

    // Dehydrate and remove the child nodes
    else if (isText || place == REPLACE_CHILDREN) {
        for (let node of childNodes(el)) await dehydrate(node, false);
    }


    // ! INSERT THE NODES

    /** The inserted nodes */
    let insertedNodes: Node[] = parsed ? childNodes(parsedContent) : [parsedContent];

    // Insert the nodes into the DOM at the specified placement
    insertNodes(el, isText ? REPLACE_CHILDREN : place as 'before'|'after'|'prepend'|'append'|'replaceWith'|'replaceChildren', ...insertedNodes);

    // Get the inserted nodes from text insertion
    if (isText) insertedNodes = childNodes(el);

    // Load/execute script elements
    each(insertedNodes, el => {

        let scripts: HTMLScriptElement[] = [];

        // Element is a script
        if (getTagName(el) == SCRIPT) arrayAdd(scripts, el);

        // Find script elements inside the inserted element
        else if (isElementNode(el)) arrayAdd(scripts, ...queryAll(SCRIPT, el));

        each(scripts, scriptElement => {
            // IMPORTANT: Don't load the script if it has the b-script, b-ignore, b-save, or b-slot directive
            if (every([B_SCRIPT, B_IGNORE, B_SAVE, B_SLOT], directive => !hasAttr(scriptElement, directive))) {

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
    });

    // Hydrate the inserted nodes
    if (getProp(options, HYDRATE, true)) {

        for (let node of insertedNodes) {
            if (isElementNode(node)) {
                // Create a new bnode
                let bnode = newBNode(node as HTMLElement, el);

                // Update the $ref and $slot objects
                await updateDataLevelContext(bnode);
            }

            // Hydrate the node
            await app.gc[$HYDRATE](node, el);
        }
    }

    // Return the inserted nodes
    return insertedNodes;
}