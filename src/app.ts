import { directives } from "./directives";
import { money } from "./directives/mask";
import { newInsert } from "./methods/dom";
import { http } from "./methods/http";
import { newRouter } from "./methods/route";
import { newTransitions } from "./methods/transition";
import { effect, state, storageEvent, watch } from "./reactivity";
import { skipProp } from "./reactivity/skip";
import { logError, wait } from "./tools";
import { arrayAdd, each, join } from "./tools/array";
import { TEXT, TEXT_CONTENT, ATTR, DELETE, INNER_HTML, PARENT, HYDRATE, $PROPS, B_PROPS, NULL, B_DATA, SCRIPT, ELEMENT, NOT_FOUND, $DATA, $EACH, STYLE, B_, TEMPLATE, UNDEFINED, REPLACE_WITH, ROUTE_RULE, OPTIONS, ROUTE, EXP_ARGS, EVAL_EFFECT, TRANSITION, NEW_LINE, BRIO, STORAGE, STATE, $STORE, MASK_TOKEN, DIRECTIVE, PROPS, DEHYDRATE, INSERT, HOOKS } from "./tools/constants";
import { walk, getAttr, delAttr, getParent, queryAll, getTagName, getNodeContent, removeNode, eachAttribute, query, emit, listen, href, childNodes, setAttr, createElement, insertNodes } from "./tools/dom";
import { evaluate } from "./tools/evaluation";
import { newHooks } from "./tools/hook";
import { countKeys, getKey, getKeys, newMap, newRegExp, setKey, setObjectKeys, W } from "./tools/object";
import { isStringNumeric, replace, split, startsWith, test, trim, wrapInBackticks } from "./tools/string";
import { isTextNode, isElementNode, isNull, isRegExp, isUndefined, isString, isNode, isFunction } from "./tools/typeCheck";

// TODO: some notes that may be useful when writing documentation
// * Effects are functions that are called when a dependency changes
// * Most of the raw values are expressions, or references to a prop or method in the scope
// * All raw values are converted to functions that return the value of the expression, or void in some cases

export let symbol = Symbol();

export let settings: ObjectType = {};

export let loadedScripts: Set<string> = new Set();

/** Create a new app */
export let newApp = (node?: Node|string, ctxNode?: Node|string) => {

    let vnodes: Map<Node, VNode> = newMap();
    let unicodeLetters = '\\p{Letter}';

    let store: StoreObject = state({
        [ROUTE_RULE]: skipProp({ number: isStringNumeric }),

        mask: skipProp({ money }),
        [MASK_TOKEN]: skipProp({
            '#': /\d/, // only numbers
            '&': newRegExp(`[${unicodeLetters}]`, 'u'), // only letters (unicode)
            '*': newRegExp(`[${unicodeLetters}\\d]`, 'u'), // letters and numbers (unicode)
            // H: /[a-f\d]/i, // hexadecimal
        }),

        [DIRECTIVE]: skipProp([...directives]),
        [TEMPLATE]: skipProp({}),
        [SCRIPT]: skipProp({}),
        [STYLE]: skipProp({}),
        [PROPS]: skipProp({}),
        data: skipProp({}),
    });

    /** The global context of this app */
    // @ts-ignore
    let gc: GlobalContext = {
        $http: http,
        [$STORE]: store,
        $state: state,
        $watch: watch,
        $effect: effect,
    };

    /** Get a vnode, if any */
    let getVNode = (node: Node) => vnodes.get(node);

    /** Walks up the DOM tree to find the closest vnode */
    let closestVNode = (node: Node, validate: FunctionType = () => true) => {
        let _el: any = node ? getParent(node) : NULL;
        while (_el) {
            // Get the vnode, if any
            let vnode = getVNode(_el);

            // A vnode is valid if it has attributes, and passes the validation function
            if (vnode && countKeys(vnode[ATTR]) && validate(vnode)) return vnode;

            // Try the parent node, if vnode not found
            _el = getParent(_el);
        }
    }

    /** Create a new vnode or get the existing one */
    let newVNode = (el: HTMLElement, ctxNode?: Node) => {

        // Get the existing vnode, if any
        let vnode = getVNode(el) as VNode;

        // Create a new vnode
        if (!vnode) {

            // Get the parent vnode
            let parent = ctxNode ? getVNode(ctxNode) : closestVNode(ctxNode ? ctxNode : el);

            vnode = {
                // Local context
                // @ts-ignore
                lc: {},

                // Global context
                gc,

                // A reference to the element. Convenience for internal use.
                el,

                // UID context
                uid: getKey(parent, 'uid', {}),

                /** Attributes or directives */
                attr: {},

                /** Cleanup functions */
                cFns: [],
            };

            // Set the local context
            for (let key in localContext) {
                let v = localContext[key](vnode, parent);
                if (v) setKey(vnode!.lc, key, {v, e: true});
            }

            // Save the vnode
            vnodes.set(el, vnode);
        }

        // Create a new vnode
        return vnode;
    }

    /** Evaluate the attribute as an effect */
    let evalEffect = (vnode: VNode, attrName: string, attrValue: string, callback: (node: HTMLElement) => HookFunction) => {

        let $el = vnode.el;

        /**
         * Set the directive hook. Priority 0. Other hooks can be added.
         * - Hooks with higher priority will be called first.
         * - Hooks with lower priority (negative numbers) will be called after.
         */
        setHook($el, attrName, callback($el));

        // The context. Which most likely refers to reactive properties.
        let evaluation = evaluate(vnode, attrValue);

        // Create a new effect, and save the cleanup function.
        // This sets up the reactivity.
        saveCleanup(vnode, effect(() => playHook($el, attrName, evaluation)));
    }

    /**
     * Hydrate a node and every node within it.
     * 
     * Note: the directive attributes are removed from each node during hydration.
     * @param node The node to hydrate
     * @param ctxNode The node to inherit context from
     */
    let hydrate = (node: Node, ctxNode?: Node) => {

        // Query the node, if a string is provided
        if (isString(node)) node = query(node)!;

        // Query the ctxNode, if a string is provided
        if (isString(ctxNode)) ctxNode = query(ctxNode as any);

        if (!isNode(ctxNode)) ctxNode = UNDEFINED;

        if (isNode(node)) {

            // Register elements with the b-save attribute
            saveAssets(node as HTMLElement, hydrationTools);

            // Recursively hydrate the nodes
            walk(node, async (_node: Node) => {
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

                    // Handle template elements
                    if (tagName == TEMPLATE) {

                        // Create a new div element
                        let div = createElement('div');

                        // Copy the attributes
                        eachAttribute(_node as HTMLElement, (name, value) => setAttr(div, name, value));

                        // Copy the innerHTML
                        div[INNER_HTML] = (_node as any)[INNER_HTML];

                        // Replace the template element with the div element
                        insertNodes(_node as HTMLElement, REPLACE_WITH, div);

                        // Hydrate the div element
                        hydrate(div, _ctxNode);

                        // Replace the div element with its child nodes
                        // Note: wait the next tick to make sure the div is fully hydrated
                        wait(() => insertNodes(div, REPLACE_WITH, ...childNodes(div)));
                    }
                    // Hydrate the element
                    else {
                        /**
                         * IMPORTANT: THIS IS NOT PART OF THE MAIN BUILD, BUT YOU CAN UNCOMMENT IT IF YOU WANT TO USE IT
                         * Make sure every script element is hydrated by setting the b-script attribute
                         * Note: an element can still be marked to not be hydrated by setting the b-ignore attribute
                         */
                        // if (tagName == SCRIPT && isNull(getAttr(_node as HTMLElement, B_+SCRIPT)))
                        //     setAttr(_node as HTMLElement, B_+SCRIPT, '');

                        result = await hydrateElementNode(_node as HTMLElement, _ctxNode);
                    }
                }
                return result;
            });
        }
    }

    /**
     * Remove all the effects and vnode from the node and its children
     */
    let dehydrate = (node: Node, _removeNode = true, _removeVNode = true) => {

        // Dehydrate the node and its children
        walk(node, (n) => {
            let vnode = getVNode(n);

            // Remove the effects
            if (vnode) {
                // Call the cleanup functions
                each(vnode.cFns, cleanupFn => cleanupFn());

                // Remove the vnode
                if (_removeVNode) vnodes[DELETE](n);

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

            let vnode = newVNode(node as any, ctxNode);

            // Evaluate the expression
            let [call] = evaluate(vnode, `$el.${TEXT_CONTENT}=${wrapInBackticks(sanitizedText)}`, '', true);

            // Save the cleanup function
            saveCleanup(vnode, effect(call));

            // Save attribute
            saveAttr(vnode, TEXT, text);
        }

        // Always return false because text nodes don't have attributes or children
        return false;
    }

    /**
     * Hydrate an element node
     */
    let hydrateElementNode = async (node: HTMLElement, ctxNode?: Node) => {

        // Get the vnode or create a new one
        let vnode = newVNode(node, ctxNode);

        // Skip hydrated elements
        // Note: Hydrated elements have the skip property
        if (!isUndefined(getSkip(vnode))) return true;

        // Get the b-options directive
        vnode[OPTIONS] = evalAttr(vnode, B_+OPTIONS)();

        /**
         * Check the attributes against the directives.
         * Its important to hydrate the directives in the correct order because some directives depend on others.
         */
        for (let [directiveName, hydrationFn] of store[DIRECTIVE]) {

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

                // Stop hydrating the element
                if (getSkip(vnode)) break;

                // Save attribute
                saveAttr(vnode, attrName, attrValue);

                // Hydrate the directive
                await hydrationFn(vnode, attrName, sanitizeAttrValue(attrValue), hydrationTools);
            }

            // Stop hydrating the element
            if (getSkip(vnode)) break;
        }

        // Mark the element as hydrated by setting the skip property
        if (isUndefined(getSkip(vnode)))
            vnode.skip = false;

        // Remove the vnode if no attributes were hydrated and no context node was provided
        // Note: The vnode is not removed if it has a context node because it may be used by its children
        if (!countKeys(vnode[ATTR]) && !ctxNode)
            vnodes[DELETE](node);

        // Hydrate the children, if the element should not be skipped
        return !getSkip(vnode);
    }

    // * * * INSTANTIATE METHODS FOR THIS APP * * * //

    /** The `$insert` method of this app */
    let insert = newInsert(hydrate, dehydrate, store[TEMPLATE]);

    /** Hook methods */
    let [setHook, playHook] = newHooks(newMap());

    /** Router methods */
    let [setRoute, route] = newRouter({}, store[ROUTE_RULE], insert);

    // Make the router of the first instance the primary router
    if (!settings[ROUTE]) setRouter(route);

    let $set = {
        hook: setHook, // -> $hook
        [ROUTE]: setRoute, // -> $route
        router: setRouter, // -> $setRouter
    }

    /** Global context: $dom methods */
    let $dom = {
        [HYDRATE]: hydrate, 
        [DEHYDRATE]: dehydrate, 
        [INSERT]: insert, 
        [ROUTE]: route,
        emit, listen, query, queryAll,
        /** Get the closest parent element of a target element */
        closest(target: HTMLElement | string, directiveName: string = B_DATA) {
            let _vnode = closestVNode(query(target)!, vnode => directiveName in vnode[ATTR]);
            if (!_vnode) logError('closest:', ELEMENT, NOT_FOUND);
            return _vnode?.el;
        },
        /** Get the local context of an element */
        context: (target: HTMLElement | string) => getVNode(query(target)!)?.lc,
    }

    /** Global context objects */
    gc.$set = $set;
    gc.$dom = $dom;

    // Save the arguments used by the evaluate function
    settings[EXP_ARGS] = `{${join(getKeys(gc))},${join(getKeys(localContext))}}`;

    let hydrationTools: HydrationTools = {
        ...gc,
        ...store,
        newVNode,
        getVNode,
        eval: evaluate,
        [EVAL_EFFECT]: evalEffect,
        [HOOKS]: [setHook, playHook],
        [TRANSITION]: newTransitions(),
    };

    // Prevent the items in these objects from being changed or deleted
    each([$set, $dom, http, store, gc, hydrationTools], obj => setObjectKeys(obj, {w: false, c: false}));

    // // Save the assets in the document (templates, scripts, styles)
    // saveAssets(query(HTML) as HTMLElement, hydrationTools);

    // Query the node, if a string is provided
    if (isString(node)) node = query(node as any);

    if (node) {
        // Make sure the root node have a b-data attribute.
        // This ensures refs are available in the context.
        if (isElementNode(node) && isNull(getAttr(node as HTMLElement, B_DATA)))
            setAttr(node as HTMLElement, B_DATA, '');

        // Hydrate the root node
        hydrate(node as Node, ctxNode as Node);
    }

    return gc;
}

/** Get the skip property from the vnode */
let getSkip = (vnode: VNode) => vnode.skip;

/** Save the cleanup function to the vnode */
export let saveCleanup = (vnode: VNode, cleanupFn: FunctionType) => {
    arrayAdd(vnode.cFns, cleanupFn);
}

/** Saves the attribute to the vnode and removes it from the node */
export let saveAttr = (vnode: VNode, attrName: string, attrValue: string) => {
    // Save the attribute to the vnode
    vnode[ATTR][attrName] = attrValue;
    // Remove the attribute from the node
    if (isElementNode(vnode.el)) delAttr(vnode.el, attrName);
}

/**
 * Sanitize an attribute value by removing comments and trailing semicolons.
 * This is necessary to properly evaluate certain expressions.
 * Without this, the evaluate function may throw an error for some expressions.
 */
export let sanitizeAttrValue = (text: string) => 
    replace(trim(join(split(text, NEW_LINE).map(line => startsWith(trim(line), '//') ? '' : line), NEW_LINE)), /;$/, '');

/** Match template literal ${} */
export let templateRegex = /\${((?!.*\${).*?)}/;

/** Sanitize string and replace mustache syntax with template literals */
export let replaceMustache = (text: string) => {

    let mustacheRegex: RegExp = /{{((?!.*{{).*?)}}/;

    while (test(text, mustacheRegex))
        text = replace(text, mustacheRegex, '${$1}');

    return text;
}

/**
 * Save assets in the `element`.
 * 
 * Assets are elements with the `b-save` attribute.
 * 
 * Note: elements with the `b-save` attribute are removed from the DOM if they do not also have the `b-hydrate` attribute.
 */
let saveAssets = (element: HTMLElement, tools: HydrationTools) => {
    let B_SAVE = B_+'save';

    if (!isElementNode(element)) return;

    // Query all elements with the b-save attribute
    let elements = queryAll(TEMPLATE+`,[${B_SAVE}]`, element);

    // Include the element, if it has the b-save attribute
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
            each(childNodes((el as HTMLTemplateElement).content), el => saveAssets(el, tools));

        // Save the asset
        if (assetName) {
            // Determine the asset type (script, style, or template)
            let assetType = tagName == SCRIPT ? SCRIPT : tagName == STYLE ? STYLE : TEMPLATE;

            let assetValue = sanitizeAttrValue(el[INNER_HTML]);

            // Save the asset
            tools[assetType as 'script'|'style'|'template'][assetName] = tagName == SCRIPT ? assetValue : () => assetValue;

            // Remove the element, if it does not have the b-hydrate attribute
            if (isNull(getAttr(el, B_+HYDRATE))) removeNode(el);
        }
    });
}

/** Create a new context */
let newContext = (contextName: string, directiveName: string, inherit?: boolean) => (vnode: VNode, parent: VNode|undefined) => {
    // Get the parent context, if any
    let parentContext = parent ? parent.lc[contextName] : NULL;

    // Determine if a new context should be created (is element with no parent context or with directive)
    let createNewState = isElementNode(vnode.el) && (!parentContext || !isNull(getAttr(vnode.el as HTMLElement, directiveName)));

    // Return the context
    return createNewState ? state({}, {[PARENT]: inherit && parentContext}) : parentContext || {};
}

/** Defines how the local context should be set up for each element */
let localContext: ObjectType = {
    // The element itself
    $el: (vnode: VNode) => vnode.el,

    // References to `b-ref` elements under the same $data context, not including nested $data contexts
    $refs: (vnode: VNode, parent?: VNode) => !parent || (isElementNode(vnode.el) && !isNull(getAttr(vnode.el as HTMLElement, B_DATA))) ? {} : parent.lc.$refs,

    // Unique identifier for the element
    $uid: (vnode: VNode) => (uidName: string) => `${uidName}-${vnode.uid[uidName]}`,

    // Reactive properties defined in the element or inherited from the parent context
    [$PROPS]: newContext($PROPS, B_PROPS, true),

    // The $data context
    [$DATA]: newContext($DATA, B_DATA),

    // The $each context
    [$EACH]: (_: VNode, parent?: VNode) => parent?.lc[$EACH],
}

/** Sets the primary router */
let setRouter = (route: FunctionType) => {
    if (isFunction(route)) {
        settings[ROUTE] = () => route(href());
    }
}

/**
 * Evaluate attribute, if any
 * @param defaultAttrValue A string to fall back to if the attribute has no value. Default is an empty object.
 */
let evalAttr = (vnode: VNode, attrName: string, defaultAttrValue: string = '{}') => {

    // Get the attribute value
    let attrValue = sanitizeAttrValue(getAttr(vnode.el, attrName) || defaultAttrValue);

    // Remove the attribute
    saveAttr(vnode, attrName, attrValue);

    // Evaluate and return
    return evaluate(vnode, attrValue)[0];
}

export let setup = () => {
    // This will prevent another instance of Brio from being initialized
    if (!(BRIO in W)) {
    
        // Create the `brio` object
        let v = {};
    
        // Set the unchangeable `newApp` method in the `brio` object
        setKey(v, 'newApp', { v: newApp });
    
        // Set the unchangeable `brio` object in the `window` object
        setKey(W, BRIO, { v });
    
        // Listen to storage events
        listen(W as any, STORAGE, storageEvent as any);
    
        // Listen to route changes and update the view
        listen(W as any, 'pop'+STATE, settings[ROUTE]);
    
        // Emit the `brio` event to let listeners know that Brio is ready
        emit(W as any, BRIO);
    
        // // Initialize the primary app
        // let { $dom } = newApp();
    
        // // Hydrate top-level elements with the `b-hydrate` attribute
        // let B_HYDRATE = `[${B_+HYDRATE}]`;
        // each(queryAll(B_HYDRATE+`:not(${B_HYDRATE} ${B_HYDRATE})`), node => {
        //     // Make sure top-elements have a b-data attribute.
        //     // This ensures refs are available in the context.
        //     if (isNull(getAttr(node, B_DATA))) setAttr(node, B_DATA, '');
        //     $dom[HYDRATE](node);
        //     delAttr(node, B_+HYDRATE);
        // });
    }
}