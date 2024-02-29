import { VNode } from '..';

import { hydrateRefs } from '.';
import { evaluate } from '../evaluate';
import { internal, saveAttr } from '../hydrate';
import { state } from '../reactivity';
import { has } from '../tools';
import { getAttr } from '../tools/dom';
import { createContext, getKeys } from '../tools/object';
import { trim } from '../tools/string';
import { getType, isFunction, isObject } from '../tools/typeCheck';
import { OBJECT, PROPS, RESERVED_NAMES } from '../tools/constants';

export let hydrateProps = (vnode: VNode, parent: VNode | null) => {
    let {$el} = vnode;
    let {each, props} = internal;

    // Get the context expression
    let contextExp = trim(getAttr($el as HTMLElement, PROPS) || '');

    // Set the parent if the element is an item of the `each` directive
    // This is done because an element of the `each` directive is only a copy of the original dehydrated `each` element.
    // Which means that the element it is not yet in the DOM or in the VNodes map, therefore it doesn't have a parent.
    let isEach = each && each.$el == $el;
    if (isEach) parent = each.$root;

    // Parent context
    let parentProps = parent?.$props || {};

    // Check if the context expression is empty. If so, use the parent context
    if (!contextExp && !isEach) {
        vnode.$props = parentProps;
        vnode.$refs = parent?.$refs || {};
        return;
    }

    let newContext: any = {};
    // Check if the context is in the `props` object
    if (contextExp in props) newContext = props[contextExp];
    // Evaluate the context expression
    else if (contextExp) newContext = evaluate(parent || vnode, contextExp);

    // Check if the context is a function. If so, call it
    if (isFunction(newContext)) newContext = (newContext as Function)();

    // Check if the context is not an object. If so, throw an error
    if (!isObject(newContext)) {
        throw new Error(`The ${PROPS} must be an ${OBJECT}, but got ${getType(newContext)} instead.`);
    }

    // Merge `each` context
    if (isEach) {
        newContext = {...newContext, ...each};
    }

    // Remove reserved keys from the new context
    RESERVED_NAMES.forEach(key => {
        if (key in newContext) delete newContext[key];
    });

    // Create the new context
    let context = state(parent ? createContext(parentProps, newContext) : newContext);

    // Add the context to the vnode
    vnode.$props = context;

    // Save attribute
    saveAttr(vnode, PROPS, contextExp);

    // Hydrate the refs
    hydrateRefs(vnode);

    // Init prop
    if (has(getKeys(context), 'init')) context.init();

    // Reset each context
    internal.each = null;
}