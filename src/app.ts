import { newInsert } from "./methods/dom";
import { http } from "./methods/http";
import { go, newRouter } from "./methods/route";
import { effect, state, storageEvent, watch } from "./reactivity";
import { has, logError, uid } from "./tools";
import { arrayAdd, each, filter, find, join, map, some } from "./tools/array";
import { TEXT, TEXT_CONTENT, ATTR, DELETE, INNER_HTML, PARENT, $PROPS, NULL, B_DATA, SCRIPT, $DATA, STYLE, B_, TEMPLATE, UNDEFINED, OPTIONS, ROUTE, NEW_LINE, BRIO, STORAGE, STATE, PROPS, NUMBER, DIRECTIVES, MASKS, MASK_TOKENS, DATA, MASK_TOKEN, ROUTE_RULE, B_SAVE, OUTER_HTML, $STORE, SKIP, NODES, B_IF, MESSAGE, CLONE, $REF, $SLOT, B_TEMPLATE, B_REF, $, $DEHYDRATE, $HYDRATE, $INSERT, VALIDATOR, B_SCRIPT, B_SLOT, B_FOR, $FOR, DEHYDRATE_CHILDREN } from "./tools/constants";
import { walk, getAttr, delAttr, getParent, getTagName, getNodeContent, removeNode, eachAttribute, query, emit, listen, href, setAttr } from "./tools/dom";
import { expToFn, newFn } from "./tools/evaluation";
import { countKeys, hasProp, getProp, newMap, setProp, setObjectKeys, W, newSet, S, sync, clone, delProp, getKeys } from "./tools/object";
import { isStringNumeric, replace, replaceAll, split, startsWith, test, trim } from "./tools/string";
import { isTextNode, isElementNode, isNull, isRegExp, isString, isNode, isFunction, isArray, getType } from "./tools/typeCheck";
import { validator } from "./methods/validate";
import { getAccessedProp } from "./reactivity/track";
import { prefixPropsInContext } from "./tools/contextProps";

// TODO: some notes that may be useful when writing documentation
// * Effects are functions that are called when a dependency changes
// * Most of the raw values are expressions, or references to a prop or method in the scope
// * All raw values are converted to functions that return the value of the expression, or void in some cases

/**
 * TODO: I have this js frontend framework called Brio.js.
Its purpose is, like others frontend frameworks, to be a tools to create reactive and dynamic UIs. However it works directly with pure HTML, it can hydrate HTML in the page by calling $dom.hydrate(someElementOrSelector), it can also hydrate HTML strings by calling the $dom.insert(content, where, target).
An app is created by calling the newApp function. That returns a AppObject.
However I want to review with you its hydration process, and the very structure of the code because, even though it works, it feels fragile and rudimentary.
As of right now the hydrate walks the DOM, and hydrates the HTMLElement with directives or Text nodes with mustache or template literal syntaxes. However the element MUST be in the DOM, which can be cumbersome for directives that stops the hydration flow, like b-if, b-for, etc.
Suggest improvements to the exist structure AND suggest a new and improved structure.
 */

export let symbol = S(BRIO);

/** The router for each app */
export let routers: GetRoute[] = [];

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
            let parent = ctxNode && getBNode(ctxNode) || closestBNode(ctxNode ? ctxNode : el);

            bnode = {
                // Local context
                // @ts-ignore
                ctx: {...gc},

                // A reference to the element. Convenience for internal use.
                el,

                [PARENT]: parent,

                // Unique ID context
                id: getProp(parent, 'id', {}),

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

            // Register elements with the b-save attribute
            await saveAssets(node as HTMLElement);

            // Recursively hydrate the nodes
            await walk(node, async (_node: Node) => {
                let result = false;

                // The context node for the current node
                let _ctxNode = node == _node ? ctxNode : UNDEFINED;

                // Hydrate Text nodes
                if (isTextNode(_node) && getNodeContent(_node)) {
                    result = hydrateTextNode(_node as Text, _ctxNode);
                }

                // Hydrate HTMLElement nodes
                else if (isElementNode(_node)) {

                    let tagName = getTagName(_node);

                    // Ignore script elements that do not have the b-script attribute
                    if (tagName == SCRIPT && isNull(getAttr(_node as HTMLElement, B_SCRIPT))) {
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
    let dehydrate = async (node: Node, _removeNode = true, _removeBNode = true) => {

        // Dehydrate the node and its children
        await walk(node, async (n) => {
            let bnode = getBNode(n);

            // Remove the effects
            if (bnode) {
                // Dehydrate nodes in the DOM
                if (bnode[NODES]) {
                    for (let domNode of bnode[NODES] as Node[]) {
                        await dehydrate(domNode, _removeNode, _removeBNode);
                    }
                }

                // Dehydrate child nodes NOT in the DOM
                if (bnode[DEHYDRATE_CHILDREN]) {
                    for (let childNode of bnode[DEHYDRATE_CHILDREN] as Node[]) {
                        await dehydrate(childNode, _removeNode, _removeBNode);
                    }
                }

                // Remove the placeholder
                if (bnode.ph) removeNode(bnode.ph as any);

                // Call the cleanup functions
                each(bnode.cFns, cleanupFn => cleanupFn());

                // Remove the bnode
                if (_removeBNode) bnodes[DELETE](n);
            }

            // Remove the node
            if (_removeNode) removeNode(n as HTMLElement);

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
            saveCleanup(bnode, effect(() => node[TEXT_CONTENT] = value(bnode.ctx)));

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
            // Directives with static names (e.g. b-if, b-props, b-for)
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
                 *   b-if and b-for make a copy of the element.
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
        if (!countKeys(bnode[ATTR]))
            bnodes[DELETE](node);

        // Hydrate the children, if not skipped
        return !isSkip(bnode, 2) && !isSkip(bnode, 3);
    }

    /**
     * Save template, script, and style assets from the node and its children.
     * 
     * Assets are elements with the b-save attribute.
     * 
     * Note: elements with the b-save attribute are removed from the DOM.
     */
    let saveAssets = async (node: Node) => {
        let assets = await getElementsByDirective(node, B_SAVE, []);

        // Get the HTML content of the saved nodes
        each(assets, ([assetName, el]) => {
            let tagName = getTagName(el);

            // Determine the asset type (script, style, or template)
            let assetType = (tagName != SCRIPT && tagName != STYLE) ? TEMPLATE : tagName;

            let assetValue = el[assetType == TEMPLATE ? OUTER_HTML : INNER_HTML];

            app[assetType][assetName] = trim(assetValue);
        });
    }

    let setAsset = (assetType: AssetType) => (assetName: string, assetValue: any) => {
        // Save the asset
        app[assetType][assetName] = assetValue;
    }

    let cacheExp = (bnode: BNode, exp: string, args: string = '', returns: boolean | 'text' = true) => {
        // The cache key
        let cacheKey: string;

        /**
         * Make sure the expression is a function and auto-fill the references to props in the context objects.
         * This allows the use of "{{ $data.propName }}" to be written as "{{ propName }}".
         * The default context list and order is: $for, $data, $props, $store.
         */
        exp = expToFn(prefixPropsInContext(bnode, exp, returns != TEXT), args, returns);

        // Check if the expression is already cached
        if (exp in cached) {
            cacheKey = cached[exp];
        }
        else {
            // Generate a unique key for the function
            cacheKey = uid();

            // Cache the function
            cache[cacheKey] = newFn(genContextArgs(bnode, exp), exp);

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
        // The $data context
        [$DATA]: newContext($DATA, B_DATA),

        // Reactive properties defined in the element or inherited from the parent context
        [$PROPS]: newContext($PROPS, B_+PROPS, true),

        // The $for context
        [$FOR]: (_: BNode, parent?: BNode) => parent?.ctx[$FOR],

        // Data Level Context:
        // Referenced under the same $data context, not including nested $data contexts
        [$REF]: newDataLevelContext($REF),
        [$SLOT]: newDataLevelContext($SLOT),

        // The element itself
        $el: (bnode: BNode) => bnode.el,

        // Unique identifier for the element
        $id: (bnode: BNode) => bnode.id,

        $cleanup: (bnode: BNode) => (fn: FunctionType) => saveCleanup(bnode, fn),
    };

    /** Router methods */
    let [setRoute, getRoute] = newRouter(routes, routeRules);

    // The route function for this app
    let route = (routePath: string) => go(routePath, getRoute(routePath));

    let $set: SetObject = {
        [ROUTE]: setRoute,
        [ROUTE_RULE]: setAsset(ROUTE_RULE+'s' as 'routeRules'),
        [TEMPLATE]: setAsset(TEMPLATE),
        [STYLE]: setAsset(STYLE),
        [SCRIPT]: setAsset(SCRIPT),
        [PROPS]: setAsset(PROPS),
        data: setAsset(DATA),
        mask: setAsset(MASKS),
        [MASK_TOKEN]: setAsset(MASK_TOKENS),
    }

    /** The global context of this app */
    let gc: ObjectType = {
        [$STORE]: state({}),
        $set,
        [$HYDRATE]: hydrate,
        [$DEHYDRATE]: dehydrate,
    };

    /** Unprefixed global context */
    let _gc: ObjectType = {
        http,
        state,
        watch,
        effect,

        [ROUTE]: route,
        emit,
        listen,
        /** Get the local context of an element */
        context: (target: HTMLElement | string) => getBNode(query(target)!)?.ctx,

        // Tools
        hasProp,
        getProp,
        setProp,
        sync,
        [CLONE]: clone,
        [VALIDATOR]: validator,
        uid,
        getType,
    };

    // Prefix global context keys with $
    each(getKeys(_gc), key => gc[$+key] = _gc[key]);

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
        gc: gc as GlobalContext,

        exec,
        bnode: [newBNode, getBNode],
    };

    /** The $insert method of this app */
    gc[$INSERT] = newInsert(app);

    arrayAdd(routers, getRoute);

    // Prevent the items in these objects from being changed or deleted
    each([$set, http, gc, app], obj => setObjectKeys(obj, 'wc'));

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
        if (!parent[DEHYDRATE_CHILDREN]) {
            parent[DEHYDRATE_CHILDREN] = [];
        }
        // Add the element to the parent's nodes array, if not already present
        if (!has(parent[DEHYDRATE_CHILDREN] as Node[], el)) {
            arrayAdd(parent[DEHYDRATE_CHILDREN] as Node[], el);
        }
    }
}

/** Get the first inserted node from a list of nodes */
export let getFirstInsertedNode = (bnode: BNode) => find(getInsertedNodes(bnode), node => getParent(node));

/**
 * Get the inserted nodes from a bnode.
 * - Including placeholders
 * - Not including b-template, but including its nodes. Recursively, for nested b-templates.
 */
export let getInsertedNodes = (bnode: BNode) => {
    let nodes: Node[] = [];

    let [, getBNode] = bnode.bnode;

    if (bnode.ph) arrayAdd(nodes, bnode.ph);

    each(bnode[NODES] || [bnode.el], node => {
        let templateBnode = getBNode(node);
        // b-template nodes are skipped, but their nodes are included
        if (templateBnode && hasProp(templateBnode.attr, B_TEMPLATE)) {
            arrayAdd(nodes, ...getInsertedNodes(templateBnode));
        }
        else {
            arrayAdd(nodes, node);
        }
    });

    return nodes;
}

export let removeInsertedNodes = (bnode: BNode) => {
    each(getInsertedNodes(bnode), node => {
        if (node != bnode.ph) removeNode(node);
    })
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
    replace(join(map(split(text, NEW_LINE), line => startsWith(trim(line), '//') ? '' : line), NEW_LINE), /;$/, '');

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
    let parentContext = parent ? parent.ctx[contextName as '$data' | '$props'] : NULL;

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
    return createNewState && !isBif ? state({}, inherit && parentContext) : parentContext || {};
}

let newDataLevelContext = (contextName: string) => 
    (bnode: BNode, parent?: BNode) => !parent || (isElementNode(bnode.el) && !isNull(getAttr(bnode.el as HTMLElement, B_DATA))) ? {} : parent.ctx[contextName as keyof Context];

/** Handle route changes on popstate */
let onPopState = () => {
    let routePath = href();
    go(routePath, find(routers, getRoute => getRoute(routePath)));
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
        listen(W as any, 'pop'+STATE, onPopState);
    }

    // Emit the 'brio' event to let listeners know that Brio is ready
    emit(W as any, BRIO);
}

export let sliceAttrName = (attrName: string) => {
    let match = attrName.match(/^(b-\w+|bind|on)(-([\w-$]+))?$/) || [];
    return match[3] || '';
}

export let updateDataLevelContext = async (bnode: BNode) => {
    // Elements with the b-slot directive and does not have the b-data directive
    await _updateDataLevelContext(bnode, B_SLOT);
    // Elements with the b-ref directive and does not have the b-if, b-for, b-template, or b-data directives
    await _updateDataLevelContext(bnode, B_REF);
}

let _updateDataLevelContext = async (bnode: BNode, directiveName: 'b-slot' | 'b-ref') => {
    // Check if is slot or ref
    let isRef = directiveName == B_REF;

    // Get the context object
    let ctx = bnode.ctx[isRef ? $REF : $SLOT];

    // Get the skip directives
    let skipDirectives = isRef ? [/*B_IF,*/ B_FOR, B_TEMPLATE, B_DATA] : [B_DATA];

    // Iterate over all nodes in the bnode
    for (let node of bnode[NODES] || [bnode.el]) {

        // Get all assets in the node
        let assets = await getElementsByDirective(node, directiveName, skipDirectives);
    
        // Add each asset to the context
        each(assets, ([assetName, el]) => {
    
            /**
             * b-ref: the element itself.
             * b-slot: the outer HTML of the element.
             * 
             * Note: If multiple elements share the same asset name within a b-data context, only the last one will be available in the context.
             */
            ctx[assetName] = isRef ? el : el[OUTER_HTML];
    
            // Cleanup
            saveCleanup(bnode, () => delProp(ctx, assetName));
        });
    }
}

let getElementsByDirective = async (node: Node, directiveName: 'b-save' | 'b-slot' | 'b-ref', skipDirectives: string[]) => {
    let nodes: [string, HTMLElement][] = [];

    // If directive is b-ref, do not remove the node from the DOM and do not walk into templates
    let isNotRef = directiveName != B_REF;

    await walk(node, n => {
        if (isElementNode(n)) {

            // Skip elements that have any of the skipDirectives
            if (some(skipDirectives, d => !isNull(getAttr(n as HTMLElement, d)))) return false;

            // Get the asset name
            let assetName = getAttr(n as HTMLElement, directiveName);

            if (assetName) {
                // Remove the directive attribute
                delAttr(n as HTMLElement, directiveName);

                // Add the asset to the list
                arrayAdd(nodes, [assetName, n as HTMLElement]);

                // Remove the node from the DOM
                if (isNotRef) removeNode(n as HTMLElement);
            }
        }
        return true;
    }, isNotRef);

    return nodes;
}

export let genContextArgs = (bnode: BNode, exp: string): string =>
    '{' + join(filter(getKeys(bnode.ctx), ctxName => has(exp, ctxName)), ',') + '}';

/** Auto-fill the context name if missing and found in one of the data related contexts */
export let autoFillContextName = (bnode: BNode, propName: string): string => {
    for (let ctxName of [$FOR, $DATA, $PROPS, $STORE]) {
        let ctx = bnode.ctx[ctxName as '$data'];
        if (ctx && propName in ctx) {
            propName = ctxName + '.' + propName;
            break;
        }
    }
    return propName;
}

/** Evaluate the attribute as an effect */
export let evalEffect = (bnode: BNode, exp: string, callback: DirectiveCallback) => {

    // The context function
    let ctxFn = bnode.exec(bnode, exp);

    // Create a new effect, and save the cleanup function
    // This sets up the reactivity
    saveCleanup(bnode, effect(() => callback(ctxFn)));
}

export let evalContextProp = (bnode: BNode, propName: string): FunctionType | undefined => {

    // Evaluate the property
    let ctxFn = bnode.exec(bnode, propName);

    // Get the accessed state and prop
    let [state, prop] = getAccessedProp(ctxFn) as [any, Prop];

    // If found, return the property as a function
    if (state && prop in state) {
        return isFunction(state[prop]) ? state[prop] : () => state[prop];
    }
}

export let getContextProp = (ctxFn: FunctionType, ...ctxArgs: any[]) => {
    let value = ctxFn();
    return isFunction(value) ? value(...ctxArgs) : value;
}

/**
 * Get all saved assets from an asset object based on an asset name or expression.
 * @param bnode
 * @param assetObject 
 * @param assetName The name of an asset or an expression that evaluates to an array of asset names
 */
export let getSavedAssets = (bnode: BNode, assetObject: ObjectType, assetName: string) => {

    let assets: any[] = [];

    // Get the asset name(s)
    if (assetName) {
        // If the assetName is a direct reference, get the actual value
        if (assetName in assetObject) {
            arrayAdd(assets, assetObject[assetName]);
        }
        // If the assetName is not a direct reference, evaluate it
        else {
            assetName = bnode.exec(bnode, assetName)();

            // If the evaluated assetName is an array of references, get the actual values
            if (isArray(assetName)) {
                each(assetName, name => {
                    if (name in assetObject)
                        arrayAdd(assets, assetObject[name]);
                });
            }
        }
    }

    return assets;
}