import { hydrateRefs } from './refs';
import { getReservedNames } from '../api';
import { _props } from '../api/props';
import { evaluate } from '../evaluation';
import { interceptor } from '../hydration';
import { state } from '../reactivity';
import { has, logger } from '../tools';
import { createContext, deleteKey, getKeys, objectMerge } from '../tools/object';
import { getType, isObject } from '../tools/typeCheck';
import { $PROPS, $ROOT, BUT_GOT_INSTEAD, DIRECTIVE, INIT, MUST_BE, OBJECT, SKIP, STATUS } from '../tools/constants';
import { each } from '../tools/array';

export let hydrateProps = (vnode: VNode, attrName: string, attrValue: string) => {

    // Check if the props expression is empty. If so, return
    if (!attrValue) return;

    // Create the context
    let context: ObjectType = {};

    // Create an interceptor
    interceptor(vnode, attrName, (context: ObjectType, next) => {
        // Check if the attribute value is a key in the _props object
        let newContext: any = attrValue in _props
            // Use the user-defined context
            ? _props[attrValue]()
            // Evaluate the expression
            : evaluate(vnode, attrValue)[0]();

        // Check if the context is an object. If not, throw an error
        if (!isObject(newContext)) {
            vnode[STATUS] = SKIP;
            return logger(`The ${attrName} ${DIRECTIVE} ${MUST_BE} an ${OBJECT}, ${BUT_GOT_INSTEAD(getType(newContext))}`);
        }

        // Remove reserved keys from the new context
        each(getReservedNames(), key => {
            if (key in newContext) deleteKey(newContext, key);
        });

        // Check if the vnode has a parent
        let hasParent = vnode.$el !== vnode[$ROOT];

        // Merge any keys passed in the context object from the `before` interceptor functions
        objectMerge(newContext, context);

        // Create the new context
        context = state(hasParent ? createContext(vnode[$PROPS], newContext) : newContext);

        // Add the context to the vnode
        vnode[$PROPS] = context;

        // Hydrate the refs
        hydrateRefs(vnode);
    
        // Init prop
        if (has(getKeys(context), INIT)) context[INIT]();

        // Next function
        next();
    })(context);
}