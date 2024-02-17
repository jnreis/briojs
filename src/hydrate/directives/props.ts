import { RawElement } from '../index.d';

import { internal, newRawNode, saveProp } from '..';
import { evaluate } from '../evaluate';
import { observe } from '../../reactive';
import {
    getAttr, delAttr, 
    getType, getDescriptor, getKeys, defineProp, createContext, 
    isArray, isFunction, isObject, isStringArrowFunction, isGetter, isSetter, 
    OBJECT, ARRAY, FUNCTION, isAsyncFunction, has
} from '../../tools';
import { hydrateRefs } from '.';

export const hydrateProps = (rawNode: RawElement, parent: RawElement | null = null) => {
    const {$el} = rawNode;
    const PROPS = 'props';

    // Parent context
    const parentContext = parent ? parent.$props : {};
    
    // Get the context expression
    const contextExp = getAttr($el, PROPS) || '';

    const hasNewContext = internal.props && internal.props.node === $el;

    // Check if the context expression is empty. If so, use the parent context
    if (!contextExp && !hasNewContext) {
        rawNode.$props = parentContext;
        rawNode.$refs = parent?.$refs || {};
        return;
    }

    // Evalute the context expression
    let newContext: any = hasNewContext 
        ? internal.props.newContext 
        : evaluate(parent || newRawNode($el), contextExp);

    // Check if the context is a function. If so, call it
    if (isFunction(newContext)) newContext = (newContext as Function)();

    // Check if the context is not an object or array. If so, throw an error
    if (!(isObject(newContext) || isArray(newContext))) 
        throw new Error(`The ${PROPS} must be an ${OBJECT} or ${ARRAY}, but got ${getType(newContext)} instead.`);

    // If context is an object, remove reserved keys
    if (isObject(newContext)) {
        delete newContext.$el;
        delete newContext.$refs;
        delete newContext.$props;
    }

    // Create the new context
    const context = observe(
        (parent ? createContext(parentContext, newContext) : newContext)
    );

    // Add the context to the rawNode
    rawNode.$props = context;

    // Add the attribute to the rawNode
    saveProp(rawNode, PROPS, contextExp);

    // Remove the attribute from the node
    delAttr($el, PROPS);

    // Make function anonymous
    function makeAnonymous(fn: Function) {
        let f = fn.toString();
        if (!isStringArrowFunction(f)) {
            f = f.replace(new RegExp(fn.name), FUNCTION);
        }
        return f;
    }

    // Give functions, getters, and setters access to the context by typing `$props`.
    // Just like in the template to keep the syntax consistent.
    // `props`, unlike `this`, will work with arrow functions, and setters.
    const propNames = getKeys(context);
    for (const prop of propNames) {
        // Functions
        if (isFunction(context[prop]) || isAsyncFunction(context[prop])) {
            context[prop] = evaluate(rawNode, makeAnonymous(context[prop]));
        }
        // Getters and setters
        else if (isGetter(context, prop) || isSetter(context, prop)) {
            const descriptor: any = getDescriptor(context, prop);
            for (const desc of ['get','set']) {
                // Check if the descriptor has a getter or setter
                if (!(desc in descriptor && isFunction(descriptor[desc]))) continue;
                // Evaluate the getter or setter
                defineProp(context, prop, {
                    [desc]: evaluate(rawNode, makeAnonymous(descriptor[desc]))
                });
            }
        }
    }

    // Hydrate the refs
    hydrateRefs(rawNode);

    // Init prop
    if (has(propNames, 'init')) context.init();

    // Stop hydrating props
    internal.props = null;
}