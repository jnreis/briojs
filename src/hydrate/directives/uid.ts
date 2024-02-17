import { ObjectType, RawElement } from '../index.d';

import { newRawNode, saveProp } from '..';
import { evaluate } from '../evaluate';
import { observe } from '../../reactive';
import {
    getAttr, delAttr, createContext, isArray, isString, 
    ARRAY
} from '../../tools';

export const hydrateUid = (rawNode: RawElement, parent: RawElement | null = null) => {
    const {$el} = rawNode;

    // Parent UID's
    const parentUids = parent ? parent.uids : {};
    
    // Get the UID expression
    const uidExp = getAttr($el, 'uid') || '';

    // Check if the UID expression is empty. If so, use the parent UID's
    if (!uidExp) {
        rawNode.uids = parentUids;
        return;
    }

    // Evalute the UID expression
    let newContext: any = evaluate(parent || newRawNode($el), uidExp);

    // Check if the UID expression is not an array. If so, throw an error
    if (!isArray(newContext) || !newContext.every(isString))
        throw new Error(`The 'uid' directive must be an ${ARRAY} of string(s).`);

    // Convert the UID's to an object
    newContext = newContext.reduce((acc: any, uid: string) => {
        // If the UID is in the parent context, increment it by 1 in the new context.
        // Otherwise, set it to 1
        acc[uid] = (uid in parentUids) ? parentUids[uid] + 1 : 1;
        return acc;
    }, {});

    // Create the new context
    const context = observe(
        (parent ? createContext(parentUids, newContext) : newContext)
    );

    // Add the context to the rawNode
    rawNode.uids = context;

    // Add the attribute to the rawNode
    saveProp(rawNode, 'uid', uidExp);

    // Remove the attribute from the node
    delAttr($el, 'uid');
}

export const $uid = (uids: ObjectType) => 
    (uidName: string) => `${uidName}-${uids[uidName]}`;