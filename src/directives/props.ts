import { ObjectType, VNode } from '..';

import { hydrateRefs } from './refs';
import { _reservedNames } from '../api';
import { evaluate } from '../evaluation';
import { saveAttr } from '../hydration';
import { state } from '../reactivity';
import { has } from '../tools';
import { createContext, deleteKey, getKeys } from '../tools/object';
import { getType, isFunction, isObject } from '../tools/typeCheck';
import { $EL, $PROPS, $ROOT, INIT, MUST_BE, OBJECT } from '../tools/constants';
import { each } from '../tools/array';

export let _props: ObjectType = {};

export let hydrateProps = (vnode: VNode, attrName: string, attrValue: string) => {

    // Save the attribute
    saveAttr(vnode, attrName, attrValue);

    // Check if the props expression is empty. If so, return
    if (!attrValue) return;

    // Check if the attribute value is a key in the _props object
    let newContext: any = attrValue in _props
        // Use the user-defined context
        ? _props[attrValue]
        // Evaluate the expression
        : evaluate(vnode, attrValue);

    // Check if the context is a function. If so, call it
    if (isFunction(newContext)) newContext = newContext();

    // Check if the context is an object. If not, throw an error
    if (!isObject(newContext))
        throw new Error(`The ${attrName} ${MUST_BE} an ${OBJECT}, but got ${getType(newContext)} instead.`);

    // Remove reserved keys from the new context
    each(_reservedNames, key => {
        if (key in newContext) deleteKey(newContext, key);
    });

    // Check if the vnode has a parent
    let hasParent = vnode[$EL] !== vnode[$ROOT];

    // Create the new context
    let context = state(hasParent ? createContext(vnode[$PROPS], newContext) : newContext);

    // Add the context to the vnode
    vnode[$PROPS] = context;

    // Hydrate the refs
    hydrateRefs(vnode);

    // Init prop
    if (has(getKeys(context), INIT)) context[INIT]();
}