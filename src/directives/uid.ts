import { saveCleanup } from '../app';
import { logError, uid } from '../tools';
import { every } from '../tools/array';
import { ARRAY, DIRECTIVE, MUST_BE, STRING } from '../tools/constants';
import { delProp, setProp } from '../tools/object';
import { isArray, isString } from '../tools/typeCheck';

let ids: ObjectType = {};
// console.log('ids', ids);

export let hydrateUid = async (bnode: BNode, attrName: string, attrValue: string) => {

    // Check if the UID expression is empty
    if (attrValue) {

        // Evaluate the UID expression
        let newUid = bnode.exec(bnode, attrValue)();

        // Check if the UID expression is not an array of strings. If so, throw an error
        if (!isArray(newUid) || !every(newUid, isString))
            return logError('the', attrName, DIRECTIVE, MUST_BE, `an ${ARRAY} of ${STRING}(s).`);

        // Convert the UID's to an object and save them in the context
        bnode.uid = newUid.reduce((acc: any, idName: string) => {

            let id = uid(5);

            // Keep track of all generated UID's
            ids[id] = true;

            // Add the UID to the context
            setProp(acc, idName, id, 'wc');

            return acc;
        }, {});

        // Cleanup: remove the UID's from the global list
        saveCleanup(bnode, () => {
            for (let key in bnode.uid) delProp(ids, bnode.uid[key]);
        });

    }
}

export let uidDirective: Directive = ['b-uid', hydrateUid];