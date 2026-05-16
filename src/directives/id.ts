import { saveCleanup } from '../app';
import { logError, uid } from '../tools';
import { every } from '../tools/array';
import { ARRAY, DIRECTIVE, MUST_BE, STRING } from '../tools/constants';
import { delProp, setProp } from '../tools/object';
import { isArray, isString } from '../tools/typeCheck';

let ids: ObjectType = {};
// console.log('ids', ids);

let hydrateId = async (bnode: BNode, attrName: string, attrValue: string) => {

    // Check if the unique ID expression is empty
    if (attrValue) {

        // Evaluate the unique ID expression
        let newUid = bnode.exec(bnode, attrValue)();

        // Check if the unique ID expression is not an array of strings. If so, throw an error
        if (!isArray(newUid) || !every(newUid, isString))
            return logError('the', attrName, DIRECTIVE, MUST_BE, `an ${ARRAY} of ${STRING}(s).`);

        // Convert the unique IDs to an object and save them in the context
        bnode.id = newUid.reduce((acc: any, idName: string) => {

            let id = uid(5);

            // Keep track of all generated unique IDs
            ids[id] = true;

            // Add the unique ID to the context
            setProp(acc, idName, id, 'e');

            return acc;
        }, {});

        // Cleanup: remove the unique IDs from the global list
        saveCleanup(bnode, () => {
            for (let key in bnode.id) delProp(ids, bnode.id[key]);
        });

    }
}

export let idDirective: Directive = ['b-id', hydrateId];