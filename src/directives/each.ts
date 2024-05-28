import { evaluate } from '../evaluation';
import { state, watch } from '../reactivity';
import { hydrate, dehydrate, vnodes, saveVNode, saveCleanup, newVNode, lifecycle, attr } from '../hydration';
import { entries, has, logger } from '../tools';
import { appendChild, removeChild, insertBefore, getParent, nextSibling } from '../tools/dom';
import { split, test, trim } from '../tools/string';
import { isArray, isObject } from '../tools/typeCheck';
import { ARRAY, OBJECT, EACH, DIRECTIVE, REQUIRE, CREATE, UPDATE, DELETE, $PROPS, PROPS, STATUS, SKIP } from '../tools/constants';
import { createContext, deleteKey } from '../tools/object';

export let _each: ObjectType = {};

export let hydrateEach = (vnode: VNode, attrName: string, attrValue: string) => {

    let $el = vnode.$el;

    // Skip the node
    vnode[STATUS] = SKIP;

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
        return logger(`${msg} a valid alias.`);

    // Get the value of the prop
    let [ ref, isRef ] = evaluate(vnode, propExp);

    if (!isRef)
        return logger(`${msg} a prop.`);

    let value = ref();

    // Check if the prop is an array or an object
    if (!(isArray(value) || isObject(value)))
        return logger(`${msg} an ${ARRAY} or an ${OBJECT}.`);

    let nextEl = nextSibling($el);
    let parentEl = getParent($el)!;

    // Remove the node from the DOM
    removeChild(parentEl, $el);

    // Keep track of the mounted items
    let mountedItems: ObjectType = {};

    let KEY = Symbol('key');

    type EachContext = [number, any];

    // Mount a new item
    let mount = lifecycle(vnode, attrName, ([i, v]: EachContext, next: FunctionType) => {

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
        saveCleanup(_vnode, watch(_props, index, ({newValue}) => {
            if (newValue !== _props[KEY])
                _props[index] = _props[KEY];
        }));

        // Keep the `item` in sync with the `value`
        saveCleanup(_vnode, watch(_props, item, ({newValue}) => {
            value[_props[KEY]] = newValue;
        }));

        // Make this vnode a $root vnode so its children can inherit its context
        // This is done to make sure this item and its children have access to [item] and [index].
        attr(_vnode, PROPS, '');

        // Hydrate the new node
        hydrate([_el]);

        // Add the node to the mountedItems map
        mountedItems[i] = _el;

        // Next lifecycle function
        next();
    });

    // Update an existing item
    let sync = lifecycle(vnode, attrName, ([i, v]: EachContext, next: FunctionType) => {
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

        // Next lifecycle function
        next();
    });

    // Unmount an existing item
    let unmount = lifecycle(vnode, attrName, ([i, _]: EachContext, next: FunctionType) => {
        // Get the existing node
        let _el = mountedItems[i];

        // Remove the node from the DOM
        removeChild(parentEl, _el);

        // Dehydrate the node.
        // This will completely revert the node to its original state before hydration by removing all the effects and the context.
        dehydrate(_el);

        // Remove the node from the mountedItems set
        deleteKey(mountedItems, i);

        // Next lifecycle function
        next();
    });

    let operations: ObjectType = {
        [CREATE]: mount,
        [UPDATE]: sync,
        [DELETE]: unmount,
    };

    // Initialize all the items
    for (let entry of entries(value)) {
        // Create a new node for each item
        mount(entry);
    }


    // Watch the prop for changes
    let cleanup = watch(value, "", ({operation, prop, newValue}) => {
        if (has([CREATE,UPDATE,DELETE], operation)) {
            // Perform the operation
            operations[operation]([prop, newValue]);
        }
    });

    // Save the cleanup function
    saveCleanup(vnode, cleanup);
}

let validVariableName = (name: string) => test(name, /^[a-z_$][\w$]*$/i);