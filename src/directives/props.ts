import { hydrateRefs } from './refs';
import { reservedNames } from '../api';
import { _props } from '../api/props';
import { evaluate } from '../tools/evaluation';
import { closestVNode, interceptor } from '../tools/hydration';
import { state } from '../reactivity';
import { has, logger } from '../tools';
import { deleteKey, getKeys, mergeKeys } from '../tools/object';
import { getType, isObject } from '../tools/typeCheck';
import { $PROPS, BUT_GOT_INSTEAD, DIRECTIVE, INIT, MUST_BE, OBJECT, PARENT, SKIP, STATUS } from '../tools/constants';
import { each } from '../tools/array';
import { toString } from '../tools/string';

export let hydrateProps = (vnode: VNode, attrName: string, attrValue: string) => {

    // Check if the props expression is empty. If so, return
    if (!attrValue) return;

    // Create the context
    let context: ObjectType = {};

    // Create an interceptor
    interceptor(vnode, attrName, (context: ObjectType, next) => {
        // Check if the attribute value is a key in the _props object
        // Get the function as a string so it can be evaluated and receive the reserved names
        if (attrValue in _props) attrValue = toString(_props[attrValue]);

        // Evaluate the expression
        let newContext: any = evaluate(vnode, attrValue)[0]();

        // Check if the context is an object. If not, throw an error
        if (!isObject(newContext)) {
            vnode[STATUS] = SKIP;
            return logger(`The ${attrName} ${DIRECTIVE} ${MUST_BE} an ${OBJECT}, ${BUT_GOT_INSTEAD(getType(newContext))}`);
        }

        // Remove reserved keys from the new context
        each(reservedNames, key => {
            if (key in newContext) deleteKey(newContext, key);
        });

        let parent = closestVNode(vnode.$el);

        // Merge any keys passed in the context object from the `before` interceptor functions
        mergeKeys(newContext, false, context);

        // Create the new context
        context = state(newContext, { [PARENT]: parent ? parent[$PROPS] : null });

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