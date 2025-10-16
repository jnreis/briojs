import { newInsert } from "./methods/dom";
import { http } from "./methods/http";
import { newRouter } from "./methods/route";
import { replaceUsedButNotDeclaredVariables } from "./tools/contextProps";
import { effect, state, storageEvent, watch } from "./reactivity";
import { has, logError, slice, uid } from "./tools";
import { arrayAdd, each, join, map } from "./tools/array";
import { TEXT, TEXT_CONTENT, ATTR, DELETE, INNER_HTML, PARENT, HYDRATE, $PROPS, NULL, B_DATA, SCRIPT, $DATA, $EACH, STYLE, B_, TEMPLATE, UNDEFINED, OPTIONS, ROUTE, CTX_ARGS, EVAL_EFFECT, NEW_LINE, BRIO, STORAGE, STATE, PROPS, DEHYDRATE, INSERT, NUMBER, DIRECTIVES, MASKS, MASK_TOKENS, DATA, MASK_TOKEN, ROUTE_RULE, B_SAVE, OUTER_HTML, $STORE, $TOOLS, SKIP, CONTENT, NODES, B_IF, MESSAGE, VALIDATE, CLONE, $REFS, $SLOTS } from "./tools/constants";
import { walk, getAttr, delAttr, getParent, queryAll, getTagName, getNodeContent, removeNode, eachAttribute, query, emit, listen, href, childNodes, setAttr } from "./tools/dom";
import { expToFn, newFn } from "./tools/evaluation";
import { countKeys, hasProp, getProp, getKeys, newMap, setProp, setObjectKeys, W, newSet, S, sync, clone } from "./tools/object";
import { isStringNumeric, replace, replaceAll, split, startsWith, test, trim } from "./tools/string";
import { isTextNode, isElementNode, isNull, isRegExp, isString, isNode, isFunction } from "./tools/typeCheck";
import { validate } from "./methods/validate";

// TODO: some notes that may be useful when writing documentation
// * Effects are functions that are called when a dependency changes
// * Most of the raw values are expressions, or references to a prop or method in the scope
// * All raw values are converted to functions that return the value of the expression, or void in some cases

/**
 * TODO: I have this js frontend framework called Brio.js.
Its purpose is, like others frontend frameworks, to be a tools to create reactive and dynamic UIs. However it works directly with pure HTML, it can hydrate HTML in the page by calling $dom.hydrate(someElementOrSelector), it can also hydrate HTML strings by calling the $dom.insert(content, where, target).
An app is created by calling the newApp function. That returns a AppObject.
However I want to review with you its hydration process, and the very structure of the code because, even though it works, it feels fragile and rudimentary.
As of right now the hydrate walks the DOM, and hydrates the HTMLElement with directives or Text nodes with mustache or template literal syntaxes. However the element MUST be in the DOM, which can be cumbersome for directives that stops the hydration flow, like b-if, b-each, etc.
Suggest improvements to the exist structure AND suggest a new and improved structure.
 */

export let symbol = S(BRIO);

export let settings: ObjectType = {};

export let loadedScripts = newSet() as Set<string>;

/** Create a new app */
export let newApp = (): AppObject => {

    /** Get a bnode, if any */
    let getBNode = (node: Node) => bnodes.get(node);

    /** Walks up the DOM tree to find the closest bnode */
    let closestBNode = (node: Node, validate: FunctionType = () => true) => {
        let _el: any = node ? getParent(node) : NULL;
        while (_el) {
            // Get the bnode, if any
            let bnode = getBNode(_el);

            // A bnode is valid if it passes the validation function
            if (bnode && validate(bnode)) return bnode;

            // Try the parent node, if bnode not found
            _el = getParent(_el);
        }
    }

    /** Create a new bnode or get the existing one */
    let newBNode = (el: HTMLElement, ctxNode?: Node) => {

        // Get the existing bnode, if any
        let bnode = getBNode(el) as BNode;

        // Create a new bnode
        if (!bnode) {

            // Get the parent bnode
            let parent = ctxNode ? getBNode(ctxNode) : closestBNode(ctxNode ? ctxNode : el);

            bnode = {
                // Local context
                // @ts-ignore
                ctx: {...globalContext},

                // A reference to the element. Convenience for internal use.
                el,

                [PARENT]: parent,

                // UID context
                uid: getProp(parent, 'uid', {}),

                /** Attributes or directives */
                attr: {},

                /** Cleanup functions */
                cFns: [],

                /**
                 * Skip the hydration process
                 * - 0: not hydrated (default)
                 * - 1: skip self
                 * - 2: skip children
                 * - 3: skip self and children
                 */
                [SKIP]: 0,

                ...$dom,
                ...app,
            };

            // Set the local context
            for (let key in localContextFns) {
                let v = localContextFns[key](bnode, parent);
                if (v) setProp(bnode.ctx, key, v, 'c');
            }

            // Save the bnode
            bnodes.set(el, bnode);

            bnode[OPTIONS] = evalAttr(bnode, B_+OPTIONS)();
        }

        // Create a new bnode
        return bnode;
    }

    /** Evaluate the attribute as an effect */
    let evalEffect = (bnode: BNode, _attrName: string, attrValue: string, callback: (node: HTMLElement) => DirectiveCallback) => {

        // Get the directive callback
        let cb = callback(bnode.el);

        // The context. Which most likely refers to reactive properties.
        let context = exec(bnode, attrValue);

        // Create a new effect, and save the cleanup function.
        // This sets up the reactivity.
        saveCleanup(bnode, effect(() => cb(context)));
    }

    /**
     * Hydrate a node and every node within it.
     * 
     * Note: the directive attributes are removed from each node during hydration.
     * @param node The node to hydrate
     * @param ctxNode The node to inherit context from
     */
    let hydrate = async (node: Node, ctxNode?: Node) => {

        // Query the node, if a string is provided
        if (isString(node)) node = query(node)!;

        // Query the ctxNode, if a string is provided
        if (isString(ctxNode)) ctxNode = query(ctxNode as any);

        if (!isNode(ctxNode)) ctxNode = UNDEFINED;

        if (isNode(node)) {

            // Test representation of the node
            // let rep = nodeRep(node);
            // console.log('rep', rep);

            // Register elements with the b-save attribute
            saveAssets(node as HTMLElement);

            // Recursively hydrate the nodes
            await walk(node, async (_node: Node) => {
                let result = false;

                // Only pass the context node the node it was called with
                let _ctxNode = node == _node ? ctxNode : UNDEFINED;

                // Hydrate Text nodes
                if (isTextNode(_node) && getNodeContent(_node)) {
                    result = hydrateTextNode(_node as Text, _ctxNode);
                }

                // Hydrate HTMLElement nodes
                else if (isElementNode(_node)) {

                    let tagName = getTagName(_node);

                    // Ignore script elements that do not have the b-script attribute
                    if (tagName == SCRIPT && isNull(getAttr(_node as HTMLElement, B_+SCRIPT))) {
                        result = false;
                    }
                    // Hydrate the element
                    else {
                        result = await hydrateElementNode(_node as HTMLElement, _ctxNode);
                    }
                }
                return result;
            });
        }
    }

    /**
     * Remove all the effects and bnode from the node and its children
     */
    let dehydrate = (node: Node, _removeNode = true, _removeBNode = true) => {

        // Dehydrate the node and its children
        walk(node, (n) => {
            let bnode = getBNode(n);

            // Remove the effects
            if (bnode) {
                // Dehydrate the child nodes
                if (bnode[NODES]) {
                    each(bnode[NODES], childNode => bnode[DEHYDRATE](childNode, _removeNode, _removeBNode));
                }

                // Remove the placeholder
                if (bnode.ph) {
                    removeNode(bnode.ph as any);
                }

                // Call the cleanup functions
                each(bnode.cFns, cleanupFn => cleanupFn());

                // Remove the bnode
                if (_removeBNode) bnodes[DELETE](n);

                // Remove the node
                if (_removeNode) removeNode(n as HTMLElement);
            }

            return true;
        });
    }

    /**
     * Hydrate a text node
     * 
     * Note: Empty text nodes are ignored by the walk callback
     */
    let hydrateTextNode = (node: Text, ctxNode?: Node) => {

        let text = node[TEXT_CONTENT] as string;
        let sanitizedText = replaceMustache(sanitizeAttrValue(text || ''));

        if (sanitizedText && test(sanitizedText, templateRegex)) {

            let bnode = newBNode(node as any, ctxNode);

            // Evaluate the expression
            let value = exec(bnode, sanitizedText, '', TEXT);

            // Save the cleanup function
            saveCleanup(bnode, effect(() => node[TEXT_CONTENT] = value()));

            // Save attribute
            saveAttr(bnode, TEXT, text);
        }

        // Always return false because text nodes don't have attributes or children
        return false;
    }

    /**
     * Hydrate an element node
     */
    let hydrateElementNode = async (node: HTMLElement, ctxNode?: Node) => {

        // Get the bnode or create a new one
        let bnode = newBNode(node, ctxNode);

        // Skip hydrated elements
        if (isSkip(bnode, 3)) return true;

        /**
         * Check the attributes against the directives.
         * Its important to hydrate the directives in the correct order because some directives depend on others.
         */
        for (let [directiveName, hydrationFn] of directives) {

            // The attributes to hydrate
            let hydrateAttributes: [string, string][] = [];

            // Directives with dynamic names (e.g. bind-*, on-*, b-model-*)
            if (isRegExp(directiveName)) {
                eachAttribute(node, (name, value) => {
                    // Queue all attributes that start with the directive name
                    if (test(name, directiveName as RegExp)) {

                        // Queue the attribute for hydration
                        arrayAdd(hydrateAttributes, [name, value]);
                    }
                });
            }
            // Directives with static names (e.g. b-if, b-props, b-each)
            else {
                // Get the attribute value
                let attrValue = getAttr(node, directiveName as string);

                // Directive found
                if (!isNull(attrValue)) {

                    // Queue the attribute for hydration
                    arrayAdd(hydrateAttributes, [directiveName, attrValue]);
                }
            }

            // Hydrate the attributes for the directive
            for (let [attrName, attrValue] of hydrateAttributes) {

                // Stop hydrating the directives of this element
                if (isSkip(bnode, 1) || isSkip(bnode, 3)) break;

                /** 
                 * Save attribute before hydration
                 * Notes: 
                 *   b-if and b-each make a copy of the element.
                 *   Having the attribute saved before prevents infinite loops in those directives.
                 *   Other directives may also benefit from this, but for now only these two need it.
                 */
                saveAttr(bnode, attrName, attrValue);

                // Hydrate the directive
                await hydrationFn(bnode, attrName, sanitizeAttrValue(attrValue));
            }

            // Stop hydrating the directives of this element
            if (isSkip(bnode, 1) || isSkip(bnode, 3)) break;
        }

        // Mark the directives of this element as hydrated
        if (isSkip(bnode, 0))
            bnode[SKIP] = 1;

        // Remove the bnode if no attributes were hydrated and no context node was provided
        // Note: The bnode is not removed if it has a context node because it may be used by its children
        if (!countKeys(bnode[ATTR]) && !ctxNode)
            bnodes[DELETE](node);

        // Hydrate the children, if not skipped
        return !isSkip(bnode, 2) && !isSkip(bnode, 3);
    }

    /**
     * Save assets in the element.
     * 
     * Assets are elements with the b-save attribute.
     * 
     * Note: elements with the b-save attribute are removed from the DOM if they do not also have the b-hydrate attribute.
     */
    let saveAssets = (element: HTMLElement) => {

        if (isElementNode(element)) {
            // Query all elements with the b-save attribute
            let elements = queryAll(TEMPLATE+`,[${B_SAVE}]`, element);

            // Include the element, if it has the b-save attribute or is a template
            if (getAttr(element, B_SAVE) || getTagName(element) == TEMPLATE)
                arrayAdd(elements, element);

            // Register each asset
            each(elements, (el: HTMLElement) => {
                // Get the asset name
                let assetName = getAttr(el, B_SAVE);

                // Remove the b-save attribute
                delAttr(el, B_SAVE);

                let tagName = getTagName(el);

                // Recursively register elements in the template
                if (tagName == TEMPLATE)
                    each(childNodes((el as HTMLTemplateElement)[CONTENT]), el => saveAssets(el));

                // Save the asset
                if (assetName) {
                    let isScript = tagName == SCRIPT;

                    // Determine the asset type (script, style, or template)
                    let assetType = isScript ? SCRIPT : tagName == STYLE ? STYLE : TEMPLATE;

                    let assetValue = el[tagName == TEMPLATE ? OUTER_HTML : INNER_HTML];

                    app[assetType][assetName] = isScript
                        ? newFn(ctxArgs, sanitizeAttrValue(assetValue), false)
                        : assetValue;

                    // Remove the element, if it does not have the b-hydrate attribute
                    if (isNull(getAttr(el, B_+HYDRATE))) removeNode(el);
                }
            });
        }
    }

    let setAsset = (assetType: AssetType) => (assetName: string, assetValue: any) => {
        // Save the asset
        app[assetType][assetName] = assetValue;
    }

    let cacheExp = (bnode: BNode, exp: string, args: string = '', returns: boolean | 'text' = true) => {
        // The cache key
        let cacheKey: string;

        // Make sure the expression is a function
        exp = replaceUsedButNotDeclaredVariables(bnode, expToFn(exp, args, returns));

        // Check if the expression is already cached
        if (exp in cached) {
            cacheKey = cached[exp];
        }
        else {
            // Generate a unique key for the function
            cacheKey = uid();

            /**
             * Cache the function and auto-fill the references to props in the context objects.
             * This allows the use of "{{ propName }}" instead of "{{ $data.propName }}".
             * The default context list and order is: $each, $data, $props, $store, $tools.
             */
            cache[cacheKey] = newFn(ctxArgs, exp);

            // Save the cache key
            cached[exp] = cacheKey;
        }

        return cacheKey;
    }

    let exec = (bnode: BNode, exp: string, args: string = '', returns: boolean | 'text' = true) => {
        let fn: FunctionType;

        try {
            // Get the cache key or evaluate the expression
            let cacheKey = exp in cache ? exp : cacheExp(bnode, exp, args, returns);

            fn = cache[cacheKey](bnode.ctx);
        }
        catch (error: any) {
            logError(error[MESSAGE]);

            fn = () => symbol;
        }

        return fn;
    }

    let bnodes: Map<Node, BNode> = newMap();
    let directives: Directive[] = [];
    let template: CacheAssetObject = {};
    let routes: RoutesObject = {};
    let routeRules: RouteRulesObject = { [NUMBER]: isStringNumeric };

    let cache: CacheObject = {};
    let cached: ObjectType = {};

    /** Defines how the local context should be set up for each element */
    let localContextFns: LocalContextFns = {
        // The element itself
        $el: (bnode: BNode) => bnode.el,

        // Unique identifier for the element
        $uid: (bnode: BNode) => bnode.uid,

        // Reactive properties defined in the element or inherited from the parent context
        [$PROPS]: newContext($PROPS, B_+PROPS, true),

        // The $data context
        [$DATA]: newContext($DATA, B_DATA),

        // Data Level Context:
        // Referenced under the same $data context, not including nested $data contexts
        [$REFS]: newDataLevelContext($REFS),
        [$SLOTS]: newDataLevelContext($SLOTS),

        // The $each context
        [$EACH]: (_: BNode, parent?: BNode) => parent?.ctx[$EACH],

        $cleanup: (bnode: BNode) => (fn: FunctionType) => saveCleanup(bnode, fn),
    };

    /** The $insert method of this app */
    let insert = newInsert(hydrate, dehydrate, template);

    /** Router methods */
    let [setRoute, route] = newRouter(routes, routeRules, insert);

    // Make the router of the first instance the primary router
    if (!settings[ROUTE]) setRouter(route);

    let $set: SetObject = {
        [ROUTE]: setRoute,
        router: setRouter,
        [ROUTE_RULE]: setAsset(ROUTE_RULE+'s' as 'routeRules'),
        [TEMPLATE]: setAsset(TEMPLATE),
        [STYLE]: setAsset(STYLE),
        [SCRIPT]: setAsset(SCRIPT),
        [PROPS]: setAsset(PROPS),
        data: setAsset(DATA),
        mask: setAsset(MASKS),
        [MASK_TOKEN]: setAsset(MASK_TOKENS),
    }

    /** Global context: $dom methods */
    let $dom = {
        [HYDRATE]: hydrate, 
        [DEHYDRATE]: dehydrate, 
        [INSERT]: insert, 
        [ROUTE]: route,
        emit, listen, query, queryAll,
        /** Get the local context of an element */
        context: (target: HTMLElement | string) => getBNode(query(target)!)?.ctx,
    }

    /** The global context of this app */
    let globalContext: GlobalContext = {
        $dom,
        $http: http,
        $set,
        [$STORE]: state({}),
        $state: state,
        $watch: watch,
        $effect: effect,
        [$TOOLS]: {
            hasProp,
            getProp,
            setProp,
            sync,
            [CLONE]: clone,
            [VALIDATE]: validate,
        },
    };

    // The arguments used by the evaluate function
    let ctxArgs = `{${join(getKeys(globalContext))},${join(getKeys(localContextFns))}}`;

    /** App context */
    let app: AppObject = {

        [TEMPLATE]: template,
        [STYLE]: {},
        [SCRIPT]: {},
        [PROPS]: {},
        data: {},

        // ! HYDRATION
        [DIRECTIVES]: directives,
        bnodes,

        [MASKS]: {},
        [MASK_TOKENS]: {},

        routes,
        routeRules,

        // ! PUBLIC CONTEXT
        gc: globalContext,

        // ! TOOLS
        exec,
        [CTX_ARGS]: ctxArgs,
        [EVAL_EFFECT]: evalEffect,
        bnode: [newBNode, getBNode],
        // insert,
        // route: [SetRoute, Route],
    };

    // Prevent the items in these objects from being changed or deleted
    each([$set, $dom, http, globalContext, app], obj => setObjectKeys(obj, 'wc'));

    return app;
}

/** Check the hydration level to skip */
let isSkip = (bnode: BNode, status: number) => bnode[SKIP] == status;

/** Save the cleanup function to the bnode */
export let saveCleanup = (bnode: BNode, cleanupFn: FunctionType) => {
    arrayAdd(bnode.cFns, cleanupFn);
}

/** Saves an element to the parent's nodes array. These nodes will be used for cleanup and other operations */
export let saveToParent = (bnode: BNode, el: HTMLElement) => {
    let parent = bnode[PARENT];
    if (parent) {
        // Ensure the parent has a nodes array
        if (!parent[NODES]) {
            parent[NODES] = [];
        }
        // Add the element to the parent's nodes array, if not already present
        if (!has(parent[NODES]!, el)) {
            arrayAdd(parent[NODES]!, el);
        }
    }
}

/**
 * Evaluate attribute, if any
 * @param defaultAttrValue A string to fall back to if the attribute has no value. Default is an empty object.
 */
export let evalAttr = (bnode: BNode, attrName: string, defaultAttrValue: string = '{}') => {

    // Get the attribute value
    let attrValue = isElementNode(bnode.el) ? getAttr(bnode.el, attrName) : null;

    // Remove the attribute
    if (!isNull(attrValue)) saveAttr(bnode, attrName, attrValue!);

    attrValue = sanitizeAttrValue(attrValue || defaultAttrValue);

    // Evaluate and return
    return bnode.exec(bnode, attrValue);
}

/** Saves the attribute to the bnode and removes it from the node */
export let saveAttr = (bnode: BNode, attrName: string, attrValue: string) => {
    // Save the attribute to the bnode
    bnode[ATTR][attrName] = attrValue;
    // Remove the attribute from the node
    if (isElementNode(bnode.el)) delAttr(bnode.el, attrName);
}

/**
 * Sanitize an attribute value by removing comments and trailing semicolons.
 * This is necessary to properly evaluate certain expressions.
 * Without this, the evaluate function may throw an error for some expressions.
 */
export let sanitizeAttrValue = (text: string) => 
    replace(trim(join(map(split(text, NEW_LINE), line => startsWith(trim(line), '//') ? '' : line), NEW_LINE)), /;$/, '');

/** Match template literal ${} */
export let templateRegex = /\${((?!.*\${).*?)}/;

/** Match mustache syntax {{}} */
export let mustacheRegex: RegExp = /{{((?!.*{{).*?)}}/;

/** Sanitize string and replace mustache syntax with template literals */
export let replaceMustache = (text: string, replacement: any = '${$1}') => 
    replaceAll(text, mustacheRegex, replacement);


/** Create a new context */
let newContext = (contextName: string, directiveName: string, inherit?: boolean) => (bnode: BNode, parent: BNode|undefined) => {
    // The node element
    let el = bnode.el as HTMLElement;

    // Get the parent context, if any
    let parentContext = parent ? parent.ctx[contextName as keyof Context] : NULL;

    let isElement = isElementNode(el);
    let hasDirective = isElement && !isNull(getAttr(el, directiveName));

    // Elements with b-if stop the hydration flow before b-data or b-props can be processed
    let isBif = isElement && (bnode[ATTR][B_IF] || !isNull(getAttr(el, B_IF)));

    // Determine if a new context should be created (is element with no parent context or with directive)
    let createNewState = isElement && (!parentContext || hasDirective);

    // Make sure the root node have a b-data attribute.
    // This ensures refs are available in the context.
    if (createNewState && !hasDirective && directiveName == B_DATA) {
        // Make sure the element has a b-data attribute
        setAttr(el, B_DATA, '');
    }

    // Return the context
    return createNewState && !isBif ? state({}, {[PARENT]: inherit && parentContext}) : parentContext || {};
}

let newDataLevelContext = (contextName: string) => 
    (bnode: BNode, parent?: BNode) => !parent || (isElementNode(bnode.el) && !isNull(getAttr(bnode.el as HTMLElement, B_DATA))) ? {} : parent.ctx[contextName as keyof Context];

/** Sets the primary router */
let setRouter = (routeFn: FunctionType) => {
    if (isFunction(routeFn)) {
        settings[ROUTE] = () => routeFn(href());
    }
}

export let setup = (brioWindow: ObjectType = {}) => {
    // This will prevent another instance of Brio from being initialized
    if (!(BRIO in W)) {

        // Ensure the items in the 'brioWindow' object cannot be changed or deleted
        setObjectKeys(brioWindow, 'wc');

        // Set the unchangeable 'brio' object in the 'window' object
        setProp(W, BRIO, brioWindow, 'wc');

        // Listen to storage events
        listen(W as any, STORAGE, storageEvent as any);

        // Listen to route changes and update the view
        listen(W as any, 'pop'+STATE, settings[ROUTE]);

        // Emit the 'brio' event to let listeners know that Brio is ready
        emit(W as any, BRIO);
    }
}

export let sliceAttrName = (attrName: string, charsWithPrefix: number) =>
    slice(attrName, startsWith(attrName, B_) ? charsWithPrefix : charsWithPrefix - 2) as string;

/** Node representation */
type NodeRep = {
    tag: string;
    attrs: Record<string, string>;
    // dirs: Record<string, string>;
    children: NodeRep[];
    /** Undefined for root node */
    parent?: NodeRep;
    /** Only for text nodes */
    text?: string;
}

/**
 * Parse a Node into a NodeRep object
 * @param node 
 * @param ctxNode 
 */
let nodeRep = (node: Node, parent?: NodeRep): NodeRep => {

    let rep: NodeRep = {
        tag: '',
        attrs: {},
        children: [],
        parent,
    };

    if (isElementNode(node)) {

        // Get tag name
        rep.tag = getTagName(node);

        // Get attributes
        eachAttribute(node as HTMLElement, (name, value) => {
            rep.attrs[name] = value;
        });

        // Get child nodes
        // If the node is a template, get the content child nodes
        let children = childNodes(rep.tag == TEMPLATE ? (node as HTMLTemplateElement)[CONTENT] : node);

        // Get node representation of child nodes
        each(children, child => {
            // Note: only include HTML elements and Text nodes with content
            if (isElementNode(child) || (isTextNode(child) && getNodeContent(child))) {
                arrayAdd(rep.children, nodeRep(child, rep));
            }
        });
    }
    else if (isTextNode(node)) {
        rep.text = getNodeContent(node);
    }

    return rep;
}