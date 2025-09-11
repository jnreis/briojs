import { effect, isState, state, watch } from '../reactivity';
import { entries, logError } from '../tools';
import { arrayFill, map } from '../tools/array';
import { ARRAY, OBJECT, DIRECTIVE, REQUIRES, CREATE, UPDATE, DELETE, SKIP, NUMBER, $EACH, HYDRATE, DEHYDRATE, NEW_VALUE, INDEX, OPERATION, UNDEFINED, B_EACH } from '../tools/constants';
import { removeNode, getParent, nextSibling, insertNode, cloneNode } from '../tools/dom';
import { saveAttr, saveCleanup } from '../app';
import { deleteKey, setProp, sync } from '../tools/object';
import { split, test, trim } from '../tools/string';
import { isArray, isNumber, isObject } from '../tools/typeCheck';
import { variableNameRegex } from '../tools/contextProps';
import { getAccessedProp } from '../reactivity/track';

export let hydrateEach = (bnode: BNode, attrName: string, attrValue: string) => {

    let $el = bnode.el;
    let [newBNode, getBNode] = bnode.bnode;
    let [setHook, playHook] = bnode.hook

    // Skip the node
    bnode[SKIP] = true;

    // Split the alias and the prop expression
    let [alias, propExp] = map(split(attrValue, ' in '), trim);

    // Split the alias into the `item` and the `index`
    let [item, index] = map(split(alias, ','), trim);

    // Set the default value of the `index` alias
    if (!index) index = INDEX;

    // Error message
    let msg = `the ${attrName} ${DIRECTIVE} ` + REQUIRES as 'the b-each directive requires';

    // Check if the `item` alias is a valid variable name
    if (!test(item, variableNameRegex) || !test(index, variableNameRegex))
        return logError(msg, 'a valid alias.');

    // Evaluate the prop expression
    let evalExp = bnode.exec(bnode, propExp);

    // Evaluate the expression to get the reactive value
    let accessedProp = getAccessedProp(evalExp);

    // Get the value of the expression
    let value = accessedProp ? accessedProp() : evalExp();

    // Check if the prop is an observed state (array or object)
    let isObservedState = accessedProp && isState(value);

    // If the `value` is a number fill an array with numbers starting from 1 to the number of `value`
    if (isNumber(value)) {
        value = state(arrayFill(value, 1));

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

    // Get the node's location in the DOM
    let nextEl = nextSibling($el);
    let parentEl = getParent($el)!;

    // Remove the node from the DOM
    removeNode($el);

    // Keep track of the mounted items
    let mountedItems: ObjectType = {};

    type EachContext = [number, any];

    /** b-each-create */
    let ATTR_NAME_CREATE = attrName + '-' + CREATE;
    /** b-each-update */
    let ATTR_NAME_UPDATE = attrName + '-' + UPDATE;
    /** b-each-delete */
    let ATTR_NAME_DELETE = attrName + '-' + DELETE;

    // Mount a new item
    setHook($el, ATTR_NAME_CREATE, ([i, v]: EachContext) => {

        // Create a new node
        let _el = cloneNode($el) as HTMLElement;

        // Add the node to the DOM
        insertNode(_el, parentEl, nextEl);

        // Create a new bnode
        let _bnode = newBNode(_el);

        // Make sure the node has at least one attribute so it doesn't get removed
        saveAttr(_bnode, '', '');

        // The $each context
        let _each: ObjectType = state({});

        // Set the properties of the $each context
        setProp(_each, item, v, 'c');
        setProp(_each, index, i, 'c');

        // Save the $each context
        setProp(_bnode.ctx, $EACH, _each, 'wc');

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
        bnode[HYDRATE](_el);
    });

    // Update an existing item
    setHook($el, ATTR_NAME_UPDATE, ([i, v]: EachContext) => {

        // Get the existing node
        let mountedItem = mountedItems[i];

        let _bnode = getBNode(mountedItem && mountedItem[0]);

        // Update the context
        if (_bnode) {
            let _each = _bnode.ctx[$EACH] as ObjectType;
            _each[item] = v;
            _each[index] = i;
            mountedItem[1] = i;
        }
    });

    // Unmount an existing item
    setHook($el, ATTR_NAME_DELETE, ([i, _]: EachContext) => {

        // Get the existing node
        let [_el] = mountedItems[i];

        // Dehydrate the node.
        // This will completely revert the node to its original state before hydration by removing all the effects and the context.
        bnode[DEHYDRATE](_el);

        // Remove the node from the mountedItems set
        deleteKey(mountedItems, i);
    });

    let operations: ObjectType = {
        [CREATE]: (context: any) => playHook($el, ATTR_NAME_CREATE, context),
        [UPDATE]: (context: any) => playHook($el, ATTR_NAME_UPDATE, context),
        [DELETE]: (context: any) => playHook($el, ATTR_NAME_DELETE, context),
    }

    // Initialize all the items
    for (let entry of entries(value)) {
        // Create a new node for each item
        operations[CREATE](entry);
    }

    // Watch the prop for changes (if it's an observed state)
    if (accessedProp) {
        // Save the cleanup function
        saveCleanup(bnode, watch(value, UNDEFINED, ({[OPERATION]: operation, prop, [NEW_VALUE]: newValue}) => {
            // Perform the operation
            operations[operation]([prop, newValue]);
        }));
    }
}

export let eachDirective: Directive = [B_EACH, hydrateEach];