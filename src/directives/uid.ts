import { VNode, ObjectType } from '..';

import { evaluate } from '../evaluation';
import { saveAttr } from '../hydration';
import { getAttr } from '../tools/dom';
import { trim } from '../tools/string';
import { isArray, isString } from '../tools/typeCheck';
import { ARRAY, DIRECTIVE, MUST_BE, STRING } from '../tools/constants';

let _uid: ObjectType = {};

export let hydrateUid = (vnode: VNode, parent: VNode | null) => {

    // Get the UID expression
    let uidExp = trim(getAttr(vnode.$el, 'uid') || '');

    // Check if the UID expression is empty. If so, use the parent UID's
    if (!uidExp) {
        vnode.uid = parent?.uid || {};
        return;
    }

    // Evalute the UID expression
    let newUid: any = evaluate(vnode, uidExp);

    // Check if the UID expression is not an array. If so, throw an error
    if (!isArray(newUid) || !newUid.every(isString))
        throw new Error(`The 'uid' ${DIRECTIVE} ${MUST_BE} an ${ARRAY} of ${STRING}(s).`);

    // Convert the UID's to an object
    newUid = newUid.reduce((acc: any, uid: string) => {
        // If the UID is in the parent context, increment it by 1 in the new context.
        // Otherwise, set it to 1
        if (uid in _uid) _uid[uid]++;
        else _uid[uid] = 1;
        acc[uid] = _uid[uid];
        return acc;
    }, {});

    // Add the context to the vnode
    vnode.uid = newUid;

    // Save attribute
    saveAttr(vnode, 'uid', uidExp);
}