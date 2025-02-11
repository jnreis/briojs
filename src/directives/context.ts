import { hydrateRefs } from './refs';
import { newFn } from '../tools/evaluation';
import { logError } from '../tools';
import { getDescriptor, setKey } from '../tools/object';
import { getType, isObject } from '../tools/typeCheck';
import { DIRECTIVE, OBJECT, SKIP, REQUIRES_ACTION_TYPE, PROPS, DATA, B_DATA, $, CTX_ARGS, B_ } from '../tools/constants';

export let hydrateContext = async (vnode: VNode, attrName: string, attrValue: string) => {

    let [setHook, playHook] = vnode.hook;

    let isData = attrName == B_DATA;
    let ctxType = isData ? DATA : PROPS;

    let assetObject = vnode[ctxType];

    let ctxFn: FunctionType = !attrValue
        // Attribute value returns an empty object if not provided
        ? () => ({})

        // Get the asset or evaluate the attribute value
        : assetObject[attrValue] || newFn(vnode[CTX_ARGS](), attrValue);

    let context = vnode.ctx[$ + ctxType];

    setHook(vnode.el, attrName, async () => {

        // Evaluate the new context
        let newContext: ObjectType = await ctxFn(vnode.ctx);

        // Check if newContext is an object. If not, throw an error
        if (!isObject(newContext)) {
            vnode[SKIP] = true;
            return logError(REQUIRES_ACTION_TYPE(DIRECTIVE, attrName, 'an ' + OBJECT, getType(newContext)));
        }

        // Set the new context
        for (let key in newContext) setKey(context, key, getDescriptor(newContext, key));

        // Hydrate the refs, if the context is b-data
        if (isData) await hydrateRefs(vnode, 'b-ref');
    });

    await playHook(vnode.el, attrName, context);
}

export let propsDirective: Directive = [B_+PROPS, hydrateContext];
export let dataDirective: Directive = [B_DATA, hydrateContext];