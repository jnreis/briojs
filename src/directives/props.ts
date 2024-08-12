import { hydrateRefs } from './refs';
import { reservedNames } from '../api';
import { _props } from '../api/props';
import { evaluate } from '../tools/evaluation';
import { closestVNode } from '../tools/hydration';
import { state } from '../reactivity';
import { has, logger } from '../tools';
import { deleteKey, getKeys, mergeKeys } from '../tools/object';
import { getType, isObject } from '../tools/typeCheck';
import { $PROPS, BUT_GOT_INSTEAD, DIRECTIVE, INIT, MUST_BE, OBJECT, PARENT, SKIP, STATUS } from '../tools/constants';
import { each } from '../tools/array';
import { toString } from '../tools/string';
import { callHook, setHook } from '../tools/hook';

export let hydrateProps = (vnode: VNode, attrName: string, attrValue: string) => {

    // Check if the props expression is empty. If so, return
    if (!attrValue) return;

    let $el = vnode.$el;

    // Set the directive hook
    setHook($el, attrName, (context: ObjectType) => {
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

        let parent = closestVNode($el);

        // Merge any keys added to the context object by previous hooks
        mergeKeys(newContext, false, context);

        // Create the new context
        context = state(newContext, { [PARENT]: parent ? parent[$PROPS] : null });

        // Add the context to the vnode
        vnode[$PROPS] = context;

        // Hydrate the refs
        hydrateRefs(vnode);
    
        // Init prop
        if (has(getKeys(context), INIT)) context[INIT]();
    });

    callHook($el, attrName, {});
}