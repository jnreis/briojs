import { logError, wait } from '../tools';
import { getDescriptor, setProp } from '../tools/object';
import { getType, isElementNode, isObject } from '../tools/typeCheck';
import { DIRECTIVE, OBJECT, SKIP, REQUIRES_ACTION_TYPE, PROPS, DATA, B_DATA, $, B_, B_SAVE, B_IGNORE, TEMPLATE, CONTENT, NODES, PARENT } from '../tools/constants';
import { arrayAdd, each } from '../tools/array';
import { getTagName, queryAll } from '../tools/dom';
import { hydrateRefs } from './refs';
import { hydrateSlots } from './slot';
import { saveCleanup } from '../app';
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

    let context = bnode.ctx[$ + ctxType as keyof Context];

    // Evaluate the new context
    let newContext: ObjectType = await ctxFn(parent?.ctx || bnode.ctx);

    // Check if newContext is an object. If not, log an error
    if (!isObject(newContext)) {
        bnode[SKIP] = 3; // Skip the element and its children
        return logError(REQUIRES_ACTION_TYPE(DIRECTIVE, attrName, 'an ' + OBJECT, getType(newContext)));
    }

    // Set the new context
    for (let key in newContext) setProp(context, key, newContext[key], getDescriptor(newContext, key));

    // If the context is a data context, hydrate refs and slots
    if (isData) {
        await updateDataLevelContext(bnode);
    }

    // Cleanup the data context when the bnode is removed
    saveCleanup(bnode, () => {
        wait(() => {
            delState(bnode.ctx[$ + ctxType as keyof Context]);
        });
    });
}

export let propsDirective: Directive = [B_+PROPS, hydrateContext];
export let dataDirective: Directive = [B_DATA, hydrateContext];

/**
 * Generates a negative selector that ignores elements outside the current context
 */
let negativeSelector = (directiveName: string, ctxName: string) => 
    `:not([${ctxName}]):not([${ctxName}] [${directiveName}])`;

/**
 * Generates a selector that matches all elements in the context of a directive
 */
let dataLevelSelector = (directiveName: string) => {
    let negativeSelectors = 
        negativeSelector(directiveName, B_DATA) + 
        negativeSelector(directiveName, B_SAVE) + 
        negativeSelector(directiveName, B_IGNORE);

    return `[${directiveName}]${negativeSelectors},${TEMPLATE + negativeSelectors}`;
}

/**
 * Recursively queries all elements in the context of a directive, including those inside <template> elements
 */
let deepQuery = (selector: string, root: Node) => {
    let result: HTMLElement[] = [];
    each(queryAll(selector, root), el => {
        if (getTagName(el) == TEMPLATE) {
            each(deepQuery(selector, el[CONTENT]), child => arrayAdd(result, child));
        } else {
            arrayAdd(result, el);
        }
    });
    return result;
}

let dataLevelContext = async (bnode: BNode, attrName: string, logic: FunctionType) => {

    let $el = bnode.el;

    let els: HTMLElement[] = [];

    each(bnode[NODES] || [$el], el => {
        if (isElementNode(el)) {
            // Query all refs or slots not inside another context
            let query = deepQuery(dataLevelSelector(attrName), el);

            arrayAdd(els, el, ...query);
        }
    });

    each(els, el => logic(bnode, attrName, el));
}

export let updateDataLevelContext = async (bnode: BNode) => {
    await dataLevelContext(bnode, 'b-ref', hydrateRefs);
    await dataLevelContext(bnode, 'b-slot', hydrateSlots);
}