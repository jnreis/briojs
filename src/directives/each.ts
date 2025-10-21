import { delState, effect, isState, state, watch } from '../reactivity';
import { entries, logError } from '../tools';
import { arrayFill, map } from '../tools/array';
import { ARRAY, OBJECT, DIRECTIVE, REQUIRES, CREATE, UPDATE, DELETE, SKIP, NUMBER, $EACH, NEW_VALUE, INDEX, OPERATION, UNDEFINED, B_EACH, BEFORE, REPLACE_WITH, B_IF, ATTR, A_VALID, $DEHYDRATE, $HYDRATE } from '../tools/constants';
import { cloneNode, createComment, insertNodes } from '../tools/dom';
import { ctxKey, saveCleanup, saveToParent } from '../app';
import { delProp, hasProp, setProp, sync } from '../tools/object';
import { space, split, test, trim } from '../tools/string';
import { isArray, isNumber, isObject } from '../tools/typeCheck';
import { variableNameRegex } from '../tools/contextProps';
import { getAccessedProp } from '../reactivity/track';

export let hydrateEach = (bnode: BNode, attrName: string, attrValue: string) => {

    let $el = bnode.el;
    let [newBNode, getBNode] = bnode.bnode;

    // Skip the node
    bnode[SKIP] = 3;

    // Split the alias and the prop expression
    let [alias, propExp] = map(split(attrValue, ' in '), trim);

    // Split the alias into the `item` and the `index`
    let [item, index] = map(split(alias, ','), trim);

    // Set the default value of the `index` alias
    if (!index) index = INDEX;

    // Error message
    let msg = space('the', attrName, DIRECTIVE, REQUIRES) as 'the b-each directive requires';

    // Check if the `item` alias is a valid variable name
    if (!test(item, variableNameRegex) || !test(index, variableNameRegex))
        return logError(msg, A_VALID, 'alias.');

    // Evaluate the prop expression
    let evalExp = bnode.exec(bnode, propExp);

    // Evaluate the expression to get the reactive value
    let accessedProp = getAccessedProp(evalExp);

    // Get the value of the expression
    let value = accessedProp ? accessedProp() : evalExp();

    // Check if the prop is an observed state (array or object)
    let isObservedState = accessedProp && isState(value);

    let stateCreated = false;

    // If the `value` is a number fill an array with numbers starting from 1 to the number of `value`
    if (isNumber(value)) {
        value = state(arrayFill(value, 1));
        stateCreated = true;

        if (accessedProp) {
            effect(() => {
                let n = accessedProp!();
                if (isNumber(n)) {
                    sync(value, arrayFill(n, 1));
                }
            }, () => accessedProp!());
        }
    }

    // Check if the prop is an array or an object
    if (!(isArray(value) || isObject(value)))
        return logError(msg, `an ${ARRAY}, ${OBJECT}, or ${NUMBER}.`);

    // TODO: it might be worth it to write a function to only replace or reorder the items in the array that changed instead of removing and re-adding all the items. This will improve performance when the array is large and only a few items change.

    // Hold the node's location with a placeholder
    bnode.ph = createComment(attrName);
    insertNodes($el, REPLACE_WITH, bnode.ph);

    // Ensure the element will go through the cleanup process
    saveToParent(bnode, $el);

    // Keep track of the mounted items
    let mountedItems: ObjectType = {};

    type EachContext = [number, any];

    // Mount a new item
    let _create = ([i, v]: EachContext) => {

        // Create a new node
        let _el = cloneNode($el) as HTMLElement;

        // Add the node to the DOM
        insertNodes(bnode.ph as any, BEFORE, _el);

        // Create a new bnode
        let _bnode = newBNode(_el, $el);

        // If the bnode is a copy of an b-if element, mark it as such
        // This can be used by b-transition and other directives that might need to know
        if (hasProp(bnode[ATTR], B_IF)) {
            _bnode[ATTR][B_IF] = '';
        }

        // The $each context
        let _each: ObjectType = state({});

        // Set the properties of the $each context
        setProp(_each, item, v, 'c');
        setProp(_each, index, i, 'c');

        // Save the $each context
        setProp(_bnode[ctxKey], $EACH, _each, 'c');

        saveCleanup(_bnode, () => {
            delState(_each);
        });

        // Make sure the `index` never changes
        saveCleanup(_bnode, watch(_each, index, ({[NEW_VALUE]:newValue}) => {
            let currentIndex = mountedItems[i][1];
            if (newValue !== currentIndex)
                _each[index] = currentIndex;
        }));

        // Keep the `item` in sync with the `value` (if it's an observed state)
        if (isObservedState) {
            saveCleanup(_bnode, watch(_each, item, () => {
                value[_each[index]] = _each[item];
            }));
        }

        // Add the node to the mountedItems map
        mountedItems[i] = [_el, i];

        // Hydrate the new node
        bnode.gc[$HYDRATE](_el, $el);
    };

    // Update an existing item
    let _update = ([i, v]: EachContext) => {

        // Get the existing node
        let mountedItem = mountedItems[i];

        let _bnode = getBNode(mountedItem && mountedItem[0]);

        // Update the context
        if (_bnode) {
            let _each = _bnode[ctxKey][$EACH] as ObjectType;
            _each[item] = v;
            _each[index] = i;
            mountedItem[1] = i;
        }
    };

    // Unmount an existing item
    let _delete = ([i, _]: EachContext) => {

        // Get the existing node
        let [_el] = mountedItems[i];

        // Dehydrate the node.
        // This will completely revert the node to its original state before hydration by removing all the effects and the context.
        bnode.gc[$DEHYDRATE](_el);

        // Remove the node from the mountedItems set
        delProp(mountedItems, i);
    };

    let operations: ObjectType = {
        [CREATE]: _create,
        [UPDATE]: _update,
        [DELETE]: _delete,
    }

    // Initialize all the items
    for (let entry of entries(value)) {
        // Create a new node for each item
        operations[CREATE](entry);
    }

    // Watch the prop for changes (if it's an observed state)
    if (accessedProp) {
        // Cleanup watcher
        saveCleanup(bnode, watch(value, UNDEFINED, ({[OPERATION]: operation, prop, [NEW_VALUE]: newValue}) => {
            // Perform the operation
            operations[operation]([prop, newValue]);
        }));
    }

    // Unmount all items on cleanup
    saveCleanup(bnode, () => {
        for (let i in mountedItems) {
            operations[DELETE]([Number(i), null]);
        }
        // Delete the state created for the number, if any
        if (stateCreated) {
            delState(value);
        }
    });
}

export let eachDirective: Directive = [B_EACH, hydrateEach];