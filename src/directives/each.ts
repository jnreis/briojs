import { isState, state, watch } from '../reactivity';
import { entries, logError } from '../tools';
import { arrayFill, map } from '../tools/array';
import { ARRAY, OBJECT, DIRECTIVE, REQUIRES, CREATE, UPDATE, DELETE, SKIP, NUMBER, $EACH, HOOKS } from '../tools/constants';
import { removeNode, getParent, nextSibling, insertNode, cloneNode } from '../tools/dom';
import { evaluate, makeFunction } from '../tools/evaluation';
import { saveAttr, saveCleanup } from '../app';
import { deleteKey, setKey } from '../tools/object';
import { split, test, trim } from '../tools/string';
import { isArray, isNumber, isObject } from '../tools/typeCheck';

export let hydrateEach = (vnode: VNode, attrName: string, attrValue: string, tools: HydrationTools) => {

    let $el = vnode.el;
    let [setHook, playHook] = tools[HOOKS];
    let { hydrate, dehydrate } = tools.$dom;

    // Skip the node
    vnode[SKIP] = true;

    // Split the alias and the prop expression
    let [alias, propExp] = map(split(attrValue, ' in '), trim);

    // Split the alias into the `item` and the `index`
    let [item, index] = map(split(alias, ','), trim);

    // Set the default value of the `index` alias
    if (!index) index = 'index';

    // Error message
    let msg = `the ${attrName} ${DIRECTIVE} ` + REQUIRES as 'the b-each directive requires';

    // Check if the `item` alias is a valid variable name
    if (!validVariableName(item) || !validVariableName(index))
        return logError(msg, 'a valid alias.');

    // Get the value of the prop
    let value = evaluate(vnode, makeFunction(propExp))[0]();

    // Check if the prop is an observed state (array or object)
    let isObservedState = isState(value);

    // If the `value` is a number fill an array with numbers starting from 1 to the number of `value`
    if (isNumber(value)) value = arrayFill(value, 1);

    // Check if the prop is an array or an object
    if (!(isArray(value) || isObject(value)))
        return logError(msg, `an ${ARRAY}, ${OBJECT}, or ${NUMBER}.`);

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

        // Create a new vnode
        let _vnode = tools.newVNode(_el);

        // Make sure the node has at least one attribute so it doesn't get removed
        saveAttr(_vnode, '', '');

        // The $each context
        let _each: ObjectType = state({});

        // Set the properties of the $each context
        setKey(_each, item, {v, w: true, e: true});
        setKey(_each, index, {v: i, w: true, e: true});

        // Save the $each context
        setKey(_vnode.lc, $EACH, {v: _each, e: true});

        // Make sure the `index` never changes
        saveCleanup(_vnode, watch(_each, index, ({newValue}) => {
            let currentIndex = mountedItems[i][1];
            if (newValue !== currentIndex)
                _each[index] = currentIndex;
        }));

        // Keep the `item` in sync with the `value` (if it's an observed state)
        if (isObservedState) {
            saveCleanup(_vnode, watch(_each, item, ({newValue}) => {
                value[_each[index]] = newValue;
            }));
        }

        // Add the node to the mountedItems map
        mountedItems[i] = [_el, i];

        // Hydrate the new node
        hydrate(_el);
    });

    // Update an existing item
    setHook($el, ATTR_NAME_UPDATE, ([i, v]: EachContext) => {

        // Get the existing node
        let mountedItem = mountedItems[i];

        let _vnode = tools.getVNode(mountedItem && mountedItem[0]);

        // Update the context
        if (_vnode) {
            let _each = _vnode.lc[$EACH] as ObjectType;
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
        dehydrate(_el);

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
    if (isObservedState) {
        // Save the cleanup function
        saveCleanup(vnode, watch(value, "", ({operation, prop, newValue}) => {
            // Perform the operation
            operations[operation]([prop, newValue]);
        }));
    }
}

let validVariableName = (name: string) => test(name, /^[a-z_$][\w$]*$/i);