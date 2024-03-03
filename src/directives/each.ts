import { ObjectType, VNode } from '..';

import { ref, validVariableName } from '../evaluation';
import { watch } from '../reactivity';
import { hydrate, dehydrate, vnodes, saveAttr, saveVNode } from '../hydration';
import { entries, has } from '../tools';
import { appendChild, removeChild, insertBefore, getParent, nextSibling } from '../tools/dom';
import { trim } from '../tools/string';
import { isArray, isObject } from '../tools/typeCheck';
import { ARRAY, OBJECT, EACH, DIRECTIVE, REQUIRE, CREATE, UPDATE, DELETE, $PROPS, $EL, $ROOT, EFFECT } from '../tools/constants';

export let _each: ObjectType = {};

export let hydrateEach = (vnode: VNode, parent: VNode | null, attrName: string, attrValue: string) => {

    let $el = vnode[$EL];

    // Since the element of the `each` directive is only used as a template, it doesn't have $props of its own.
    // Use the parent's $props instead.
    if (parent) vnode[$PROPS] = parent[$PROPS];

    // Split the alias and the prop expression
    let [alias, propExp] = attrValue.split(' in ').map(trim);

    // Split the alias into the `item` and the `index`
    let [item, index] = alias.split(',').map(trim);

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

    // Create a new fragment to temporarily store the new nodes before adding them to the DOM
    let fragment = document.createDocumentFragment();

    // Add the nodes in the fragment to the DOM
    let paint = () => {
        // Check if the fragment is empty
        if (!fragment.firstChild) return;

        // Add the fragment before the next sibling
        if (nextEl) insertBefore(parentEl, fragment, nextEl);

        // Or add the fragment as the last child
        else appendChild(parentEl, fragment);
    };

    let KEY = Symbol('key');

    // Mount a new item
    let mount = (i: string | number, v: any) => {
        // Create a new node for each item
        let _el = $el.cloneNode(true);

        // When hydrating props, use the new context
        _each = {
            [$EL]: _el,
            [$ROOT]: parent,
            [item]: v,
            [index]: i,
            [KEY]: i,
        };


        // Hydrate the new node
        hydrate([_el]);

        let _vnode = vnodes.get(_el);

        if (_vnode) {
            let p = _vnode[$PROPS];
            // Make sure the `index` never changes
            _vnode[EFFECT].i = watch(p, index, ({newValue}) => {
                if (newValue !== p[KEY])
                    p[index] = p[KEY];
            });
            // Keep the `item` in sync with the `value`
            _vnode[EFFECT].v = watch(p, item, ({newValue}) => {
                value[p[KEY]] = newValue;
            });
        }

        // Add the node to the fragment
        appendChild(fragment, _el);

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
        delete mountedItems[i];
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

    // Add all the nodes to the DOM
    paint();


    // Watch the prop for changes
    let cleanup = watch(value, "", ({operation, prop, newValue}) => {
        if (has([CREATE,UPDATE,DELETE], operation)) {
            // Perform the operation
            operations[operation](prop, newValue);
            // Wait for the next tick to add the fragment to the DOM
            setTimeout(paint, 0);
        }
    });

    // Save the effect to the vnode
    vnode[EFFECT][attrName] = cleanup;
}