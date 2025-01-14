import { hydrateRefs } from './refs';
import { evaluate } from '../tools/evaluation';
import { logError } from '../tools';
import { getDescriptor, setKey } from '../tools/object';
import { getType, isObject } from '../tools/typeCheck';
import { DIRECTIVE, OBJECT, SKIP, $PROPS, $DATA, REQUIRES_ACTION_TYPE, PROPS, DATA, B_DATA, HOOKS } from '../tools/constants';

export let hydrateContext = async (vnode: VNode, attrName: string, attrValue: string, tools: HydrationTools) => {

    let [setHook, playHook] = tools[HOOKS];

    // Check if the props expression is empty. If so, return
    if (!attrValue) attrValue = '{}';

    let isData = attrName == B_DATA;

    let element = vnode.el;
    let context = vnode.lc[isData ? $DATA : $PROPS];

    let contextStore = isData ? tools[DATA] : tools[PROPS];

    setHook(element, attrName, async () => {

        // Get the new context object from the attribute value
        let newContext: FunctionType = attrValue in contextStore 
            // The attribute value is the name of a context function
            ? contextStore[attrValue]
            // The attribute value must be an object or a function that returns an object, evaluate it
            : evaluate(vnode, attrValue, '', false)[0];

        newContext = await newContext(vnode.lc, vnode.gc);

        // Check if newContext is an object. If not, throw an error
        if (!isObject(newContext)) {
            vnode[SKIP] = true;
            return logError(REQUIRES_ACTION_TYPE(DIRECTIVE, attrName, 'an ' + OBJECT, getType(newContext)));
        }

        // Set the new context
        for (let key in newContext) setKey(context, key, getDescriptor(newContext, key));

        // Hydrate the refs, if the context is b-data
        if (isData) await hydrateRefs(vnode, 'b-ref', tools);
    });

    await playHook(element, attrName, context);
}