import { delState, effect, isState, state, watch } from '../reactivity';
import { entries, logError } from '../tools';
import { arrayFill, map } from '../tools/array';
import { ARRAY, OBJECT, DIRECTIVE, REQUIRES, CREATE, UPDATE, DELETE, SKIP, NUMBER, NEW_VALUE, INDEX, OPERATION, UNDEFINED, BEFORE, REPLACE_WITH, B_IF, ATTR, A_VALID, $DEHYDRATE, $HYDRATE, B_FOR, $FOR } from '../tools/constants';
import { cloneNode, createComment, insertNodes } from '../tools/dom';
import { saveCleanup, saveToParent, updateDataLevelContext } from '../app';
import { delProp, hasProp, setProp, sync } from '../tools/object';
import { space, split, test, trim } from '../tools/string';
import { isArray, isNumber, isObject } from '../tools/typeCheck';
import { getAccessedProp } from '../reactivity/track';

let variableNameRegex = /^[a-z_$][\w$]*$/i;

export let hydrateFor = (bnode: BNode, attrName: string, attrValue: string) => {

    let el = bnode.el;
    let {n: newBNode, g: getBNode} = bnode.bnode;

    // Skip the node and its children
    bnode[SKIP] = 3;

    // Split the alias and the prop expression
    let [alias, propExp] = map(split(attrValue, ' in '), trim);

    // Split the alias into the `item` and the `index`
    let [item, index] = map(split(alias, ','), trim);

    // Set the default value of the `index` alias
    if (!index) index = INDEX;

    // Error message
    let msg = space('the', attrName, DIRECTIVE, REQUIRES) as 'the b-for directive requires';

    // Check if the `item` alias is a valid variable name
    if (!test(item, variableNameRegex) || !test(index, variableNameRegex))
        return logError(msg, A_VALID, 'alias.');

    // Evaluate the prop expression
    let evalExp = bnode.exec(bnode, propExp);

    // Evaluate the expression to get the reactive value
    let [_state, _prop] = getAccessedProp(evalExp) as [any, Prop];

    // Get the value of the expression
    let value = _state ? _state[_prop] : evalExp();

    // Check if the prop is an observed state (array or object)
    let isObservedState = _state && isState(value);

    let stateCreated = false;

    // If the `value` is a number fill an array with numbers starting from 1 to the number of `value`
    if (isNumber(value)) {
        value = state(arrayFill(value, 1));
        stateCreated = true;

        // Keep the array length in sync with the number
        if (_state) {
            effect(() => {
                let n = _state[_prop] || 0;
                if (isNumber(n)) {
                    sync(value, arrayFill(n, 1));
                }
            }, () => _state[_prop]);
        }
    }

    // Check if the prop is an array or an object
    if (!(isArray(value) || isObject(value)))
        return logError(msg, `an ${ARRAY}, ${OBJECT}, or ${NUMBER}.`);

    // Hold the node's location with a placeholder
    bnode.ph = createComment(attrName);
    insertNodes(el, REPLACE_WITH, bnode.ph);

    // Ensure the element will go through the cleanup process
    saveToParent(bnode, el);

    // Keep track of the mounted items
    let mountedItems: ObjectType = {};

    type ForContext = [number|string, any];

    // Mount a new item
    let _create = async ([i, v]: ForContext) => {

        // Create a new node
        let _el = cloneNode(el) as HTMLElement;

        // Add the node to the DOM
        insertNodes(bnode.ph as any, BEFORE, _el);

        // Create a new bnode
        let _bnode = newBNode(_el, el);

        // Mark the bnode as a b-for item
        _bnode[ATTR][attrName] = '';

        // If the bnode is a copy of an b-if element, mark it as such
        // This can be used by b-transition and other directives that might need to know
        if (hasProp(bnode[ATTR], B_IF)) {
            _bnode[ATTR][B_IF] = '';
        }

        // The $for context
        let _for: ObjectType = state({}, _bnode.ctx[$FOR]);

        // Set the properties of the $for context
        setProp(_for, item, v, 'c');
        setProp(_for, index, i, 'c');

        // Save the $for context
        setProp(_bnode.ctx, $FOR, _for, 'c');

        saveCleanup(_bnode, () => {
            delState(_for);
        });

        // Make sure the `index` never changes
        saveCleanup(_bnode, watch(_for, index, ({[NEW_VALUE]:newValue}) => {
            let currentIndex = mountedItems[i][1];
            if (newValue !== currentIndex)
                _for[index] = currentIndex;
        }));

        // Keep the `item` in sync with the `value` (if it's an observed state)
        if (isObservedState) {
            saveCleanup(_bnode, watch(_for, item, () => {
                value[_for[index]] = _for[item];
            }));
        }

        // Add the node to the mountedItems map
        mountedItems[i] = [_el, i];

        // Update the $slot and $ref objects
        await updateDataLevelContext(_bnode);

        // Hydrate the new node
        await bnode.gc[$HYDRATE](_el, el);
    };

    // Update an existing item
    let _update = ([i, v]: ForContext) => {

        // Get the existing node
        let mountedItem = mountedItems[i];

        let _bnode = getBNode(mountedItem && mountedItem[0]);

        // Update the context
        if (_bnode) {
            let _for = _bnode.ctx[$FOR] as ObjectType;
            _for[item] = v;
            _for[index] = i;
            mountedItem[1] = i;
        }
    };

    // Unmount an existing item
    let _delete = ([i, _]: ForContext) => {

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
        _create(entry);
    }

    // Watch the prop for changes (if it's an observed state)
    if (_state) {
        // Cleanup watcher
        saveCleanup(bnode, watch(value, UNDEFINED, ({[OPERATION]: operation, prop, [NEW_VALUE]: newValue}) => {
            // Perform the operation
            operations[operation]([prop, newValue]);
        }));
    }

    // Unmount all items on cleanup
    saveCleanup(bnode, () => {
        for (let i in mountedItems) {
            _delete([Number(i), null]);
        }
        // Delete the state created for the number, if any
        if (stateCreated) {
            delState(value);
        }
    });
}

export let forDirective: Directive = [B_FOR, hydrateFor];