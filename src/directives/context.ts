import { ctxKey, saveCleanup, updateDataLevelContext } from '../app';
import { logError, wait } from '../tools';
import { getDescriptor, setProp } from '../tools/object';
import { getType, isObject } from '../tools/typeCheck';
import { DIRECTIVE, OBJECT, SKIP, REQUIRES_ACTION_TYPE, PROPS, DATA, B_DATA, $, B_, PARENT } from '../tools/constants';
import { delState } from '../reactivity';

/**
 * TODO?
 * - create a b-use directive to give access to other contexts:
 *   - parent: b-use="parent" alias to the parent context
 *   - contextName: b-use="contextName"
 *   - array of context names: b-use="['context1', 'context2']"
 */

export let hydrateContext = async (bnode: BNode, attrName: string, attrValue: string) => {

    let isData = attrName == B_DATA;
    let ctxType = isData ? DATA : PROPS;

    let assetObject = bnode[ctxType];

    let parent = bnode[PARENT];

    let ctxFn: FunctionType = !attrValue
        // Attribute value returns an empty object if not provided
        ? () => ({})

        // Get the asset or evaluate the attribute value
        : assetObject[attrValue] || bnode.exec(parent || bnode, attrValue);

    let context = bnode[ctxKey][$ + ctxType as keyof Context];

    // Evaluate the new context
    let newContext: ObjectType = await ctxFn(parent?.[ctxKey] || bnode[ctxKey]);

    // Check if newContext is an object. If not, log an error
    if (!isObject(newContext)) {
        bnode[SKIP] = 3; // Skip the element and its children
        return logError(REQUIRES_ACTION_TYPE(DIRECTIVE, attrName, 'an ' + OBJECT, getType(newContext)));
    }

    // Set the new context
    for (let key in newContext) setProp(context, key, newContext[key], getDescriptor(newContext, key));

    // If the context is a data context, hydrate refs and slots
    if (isData) await updateDataLevelContext(bnode);

    // Cleanup the data context when the bnode is removed
    saveCleanup(bnode, () => {
        wait(() => {
            delState(bnode[ctxKey][$ + ctxType as keyof Context]);
        });
    });
}

export let propsDirective: Directive = [B_+PROPS, hydrateContext];
export let dataDirective: Directive = [B_DATA, hydrateContext];
