import { genContextArgs, saveCleanup, updateDataLevelContext } from '../app';
import { logError, wait } from '../tools';
import { getDescriptor, setProp } from '../tools/object';
import { getType, isFunction, isObject } from '../tools/typeCheck';
import { DIRECTIVE, OBJECT, SKIP, REQUIRES_ACTION_TYPE, B_DATA, PARENT, $DATA } from '../tools/constants';
import { delState } from '../reactivity';

let hydrateData = async (bnode: BNode, attrName: string, attrValue: string) => {

    // Get the asset function
    let assetFn: any = bnode.data[attrValue];

    // Not an asset function. Execute the expression to get the context function, if any
    if (!isFunction(assetFn) && attrValue) {
        assetFn = bnode.exec(bnode, attrValue, genContextArgs(bnode, attrValue) + ',$'+PARENT);
    }

    // Get the new context object
    let newContext: ObjectType = isFunction(assetFn) ? await assetFn(bnode.ctx, bnode[PARENT]?.ctx[$DATA] || {}) : {};

    // Check if newContext is an object. If not, log an error
    if (!isObject(newContext)) {
        // Skip the hydration of the element and its children
        bnode[SKIP] = 3;
        return logError(REQUIRES_ACTION_TYPE(DIRECTIVE, attrName, 'an ' + OBJECT, getType(newContext)));
    }

    // Set the new context
    for (let key in newContext) setProp(bnode.ctx[$DATA], key, newContext[key], getDescriptor(newContext, key));

    // Hydrate b-slot and b-ref
    await updateDataLevelContext(bnode);

    // Cleanup the data context when the bnode is removed
    saveCleanup(bnode, () => {
        wait(() => {
            delState(bnode.ctx[$DATA]);
        });
    });
}

export let dataDirective: Directive = [B_DATA, hydrateData];