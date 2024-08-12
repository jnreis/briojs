import { evaluate } from '../tools/evaluation';
import { isArray, isString } from '../tools/typeCheck';
import { ARRAY, DIRECTIVE, MUST_BE, STRING } from '../tools/constants';
import { logger } from '../tools';
import { callHook, setHook } from '../tools/hook';

let _uid: ObjectType = {};

export let hydrateUid = (vnode: VNode, attrName: string, attrValue: string) => {

    // Check if the UID expression is empty
    if (!attrValue) return;

    let $el = vnode.$el;

    // Set the directive hook
    setHook($el, attrName, () => {
        // Evaluate the UID expression
        let newUid = evaluate(vnode, attrValue)[0]();

        // Check if the UID expression is not an array of strings. If so, throw an error
        if (!isArray(newUid) || !newUid.every(isString))
            return logger(`The ${attrName} ${DIRECTIVE} ${MUST_BE} an ${ARRAY} of ${STRING}(s).`);

        // Convert the UID's to an object
        newUid = newUid.reduce((acc: any, uid: string) => {
            // If the UID is in the parent context, increment it by 1 in the new context.
            if (uid in _uid) _uid[uid]++;
            // Otherwise, set it to 1
            else _uid[uid] = 1;
            // Add the UID to the context
            acc[uid] = _uid[uid];
            return acc;
        }, {});

        // Add the context to the vnode
        vnode.uid = newUid;
    });

    // Call the hook
    callHook($el, attrName);
}