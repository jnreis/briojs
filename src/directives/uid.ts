import { logError } from '../tools';
import { every } from '../tools/array';
import { ARRAY, DIRECTIVE, HOOKS, MUST_BE, STRING } from '../tools/constants';
import { evaluate } from '../tools/evaluation';
import { isArray, isString } from '../tools/typeCheck';

let _uid: ObjectType = {};

export let hydrateUid = async (vnode: VNode, attrName: string, attrValue: string, tools: HydrationTools) => {

    // Check if the UID expression is empty
    if (!attrValue) return;

    let $el = vnode.el;

    let [setHook, playHook] = tools[HOOKS];

    setHook($el, attrName, () => {
        // Evaluate the UID expression
        let newUid = evaluate(vnode, attrValue)[0]();

        // Check if the UID expression is not an array of strings. If so, throw an error
        if (!isArray(newUid) || !every(newUid, isString))
            return logError('the', attrName, DIRECTIVE, MUST_BE, `an ${ARRAY} of ${STRING}(s).`);

        // Convert the UID's to an object and save them in the context
        vnode.uid = newUid.reduce((acc: any, uid: string) => {

            // If the UID is in the parent context, increment it by 1 in the new context.
            if (uid in _uid) _uid[uid]++;

            // Otherwise, set it to 1
            else _uid[uid] = 1;

            // Add the UID to the context
            acc[uid] = _uid[uid];

            return acc;
        }, {});
    });

    // Call the hook
    await playHook($el, attrName);
}