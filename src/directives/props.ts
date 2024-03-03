import { ObjectType, VNode } from '..';

import { _each } from './each';
import { hydrateRefs } from './refs';
import { _reservedNames } from '../api';
import { evaluate } from '../evaluation';
import { saveAttr } from '../hydration';
import { state } from '../reactivity';
import { has } from '../tools';
import { getAttr } from '../tools/dom';
import { createContext, deleteKeys, getKeys } from '../tools/object';
import { trim } from '../tools/string';
import { getType, isFunction, isObject } from '../tools/typeCheck';
import { $EL, $PROPS, $REFS, $ROOT, OBJECT, PROPS } from '../tools/constants';

export let _props: ObjectType = {};

export let hydrateProps = (vnode: VNode, parent: VNode | null) => {
    let $el = vnode[$EL];

    // Get the context expression
    let contextExp = trim(getAttr($el as HTMLElement, PROPS) || '');

    // Set the parent if the element is an item of the `each` directive
    // This is done because an element of the `each` directive is only a copy of the original dehydrated `each` element.
    // Which means that the element it is not yet in the DOM or in the VNodes map, therefore it doesn't have a parent.
    let isEach = _each[$EL] == $el;
    if (isEach) parent = _each[$ROOT];

    // Parent context
    let parentProps = parent ? parent[$PROPS] : {};

    // Check if the context expression is empty. If so, use the parent context
    if (!contextExp && !isEach) {
        vnode[$PROPS] = parentProps;
        vnode[$REFS] = parent ? parent[$REFS] : {};
        return;
    }

    let newContext: any = {};
    // Check if the context is in the `props` object
    if (contextExp in _props) newContext = _props[contextExp];
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
        newContext = {...newContext, ..._each};
    }

    // Remove reserved keys from the new context
    _reservedNames.forEach(key => {
        if (key in newContext) delete newContext[key];
    });

    // Create the new context
    let context = state(parent ? createContext(parentProps, newContext) : newContext);

    // Add the context to the vnode
    vnode[$PROPS] = context;

    // Save attribute
    saveAttr(vnode, PROPS, contextExp);

    // Hydrate the refs
    hydrateRefs(vnode);

    // Init prop
    if (has(getKeys(context), 'init')) context.init();

    // Reset each context
    deleteKeys(_each);
}