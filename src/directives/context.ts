import { saveCleanup, updateDataLevelContext } from '../app';
import { logError, wait } from '../tools';
import { getDescriptor, setProp } from '../tools/object';
import { getType, isFunction, isObject } from '../tools/typeCheck';
import { DIRECTIVE, OBJECT, SKIP, REQUIRES_ACTION_TYPE, PROPS, DATA, B_DATA, $, B_, PARENT, $DATA, $PROPS } from '../tools/constants';
import { delState } from '../reactivity';

/**
 * TODO?
 * - create a b-use directive to give access to other contexts:
 *   - parent: b-use="parent" alias to the parent context
 *   - contextName: b-use="contextName"
 *   - array of context names: b-use="['context1', 'context2']"
 */

export let hydrateContext = async (bnode: BNode, attrName: string, attrValue: string) => {

    // Determine if it's a data or props directive
    let isData = attrName == B_DATA;

    // Determine the context name
    let $ctxName = isData ? $DATA : $PROPS;

    // Get the asset function
    let assetFn = bnode[isData ? DATA : PROPS][attrValue];

    // Evaluate the new context
    let newContext: ObjectType = isFunction(assetFn) ? await assetFn(bnode[PARENT]?.ctx || bnode.ctx) : {};

    // Check if newContext is an object. If not, log an error
    if (!isObject(newContext)) {
        // Skip the hydration of the element and its children
        bnode[SKIP] = 3;
        return logError(REQUIRES_ACTION_TYPE(DIRECTIVE, attrName, 'an ' + OBJECT, getType(newContext)));
    }

    // Set the new context
    for (let key in newContext) setProp(bnode.ctx[$ctxName], key, newContext[key], getDescriptor(newContext, key));

    // If the context is a data context, hydrate refs and slots
    if (isData) await updateDataLevelContext(bnode);

    // Cleanup the data context when the bnode is removed
    saveCleanup(bnode, () => {
        wait(() => {
            delState(bnode.ctx[$ctxName]);
        });
    });
}

export let propsDirective: Directive = [B_+PROPS, hydrateContext];
export let dataDirective: Directive = [B_DATA, hydrateContext];
