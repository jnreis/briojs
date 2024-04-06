import { ref, validVariableName } from '../evaluation';
import { state, watch } from '../reactivity';
import { hydrate, dehydrate, vnodes, saveAttr, saveVNode, saveEffect, newVNode } from '../hydration';
import { entries, has } from '../tools';
import { appendChild, removeChild, insertBefore, getParent, nextSibling } from '../tools/dom';
import { split, trim } from '../tools/string';
import { isArray, isObject } from '../tools/typeCheck';
import { ARRAY, OBJECT, EACH, DIRECTIVE, REQUIRE, CREATE, UPDATE, DELETE, $PROPS, $EL, ATTR, PROPS } from '../tools/constants';
import { createContext, deleteKey } from '../tools/object';

export let _each: ObjectType = {};

export let hydrateEach = (vnode: VNode, attrName: string, attrValue: string) => {

    let $el = vnode[$EL];

    // Split the alias and the prop expression
    let [alias, propExp] = split(attrValue, ' in ').map(trim);

    // Split the alias into the `item` and the `index`
    let [item, index] = split(alias, ',').map(trim);

    // Set the default value of the `index` alias
    if (!index) index = 'index';

    // Error message
    let msg = `The ${EACH} ${DIRECTIVE} ${REQUIRE}s`;

    // Check if the `item` alias is a valid variable name
    if (!validVariableName(item) || !validVariableName(index))
        throw new Error(`${msg} a valid alias.`);

    // Get the value of the prop
    let value = ref(vnode, propExp);

    // Check if the prop is an array or an object
    if (!(isArray(value) || isObject(value)))
        throw new Error(`${msg} an ${ARRAY} or an ${OBJECT}.`);

    // Saves the `each` attribute to the vnode and removes it from the node.
    // This is done to prevent the attribute from being re-evaluated.
    // The un-evaluated node will be used as a template for the new items.
    saveAttr(vnode, attrName, attrValue);

    // Save the vnode
    // This is because the vnode of a `each` directive skips the hydration process and never gets saved to the vnodes map, like other vnodes.
    saveVNode(vnode);

    let nextEl = nextSibling($el);
    let parentEl = getParent($el)!;

    // Remove the node from the DOM
    removeChild(parentEl, $el);

    // Keep track of the mounted items
    let mountedItems: ObjectType = {};

    let KEY = Symbol('key');

    // Mount a new item
    let mount = (i: string | number, v: any) => {

        // Create a new node
        let _el = $el.cloneNode(true) as HTMLElement;

        // Add the node to the DOM
        if (nextEl) insertBefore(parentEl, _el, nextEl);
        else appendChild(parentEl, _el);

        // Create a new vnode
        let _vnode = newVNode(_el);

        // Save the vnode
        saveVNode(_vnode);

        // Create a new context
        let _props = state(createContext(_vnode[$PROPS], {
            [item]: v,
            [index]: i,
            [KEY]: i,
        }));

        // Save the context to the vnode
        _vnode[$PROPS] = _props;

        // Make sure the `index` never changes
        saveEffect(_vnode, watch(_props, index, ({newValue}) => {
            if (newValue !== _props[KEY])
                _props[index] = _props[KEY];
        }));

        // Keep the `item` in sync with the `value`
        saveEffect(_vnode, watch(_props, item, ({newValue}) => {
            value[_props[KEY]] = newValue;
        }));

        // Make this vnode a $root vnode so its children can inherit its context
        // This is done to make sure this item and its children have access to [item] and [index].
        _vnode[ATTR][PROPS] = '';

        // Hydrate the new node
        hydrate([_el]);

        // Add the node to the mountedItems map
        mountedItems[i] = _el;
    };

    // Update an existing item
    let sync = (i: string | number, v: any) => {
        // Get the existing node
        let _el = mountedItems[i];

        let _vnode = vnodes.get(_el);

        // Update the context
        if (_vnode) {
            let _props = _vnode[$PROPS];
            _props[item] = v;
            _props[index] = i;
            _props[KEY] = i;
        }
    };

    // Unmount an existing item
    let unmount = (i: string | number, _: any) => {
        // Get the existing node
        let _el = mountedItems[i];

        // Remove the node from the DOM
        removeChild(parentEl, _el);

        // Dehydrate the node.
        // This will completely revert the node to its original state before hydration by removing all the effects and the context.
        dehydrate(_el);

        // Remove the node from the mountedItems set
        deleteKey(mountedItems, i);
    };

    let operations: ObjectType = {
        [CREATE]: mount,
        [UPDATE]: sync,
        [DELETE]: unmount,
    };

    // Initialize all the items
    for (let [i, v] of entries(value)) {
        // Create a new node for each item
        mount(i, v);
    }


    // Watch the prop for changes
    let cleanup = watch(value, "", ({operation, prop, newValue}) => {
        if (has([CREATE,UPDATE,DELETE], operation)) {
            // Perform the operation
            operations[operation](prop, newValue);
        }
    });

    // Save the effect to the vnode
    saveEffect(vnode, cleanup);

    return false;
}