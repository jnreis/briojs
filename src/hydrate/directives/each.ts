import { RawElement } from '../index.d';

import { raw, internal, hydrate, watch, getPropName, newID, dehydrate, getPropOrExp, saveProp } from '..';
import {
    delAttr, entries, isArray, isObject, trim, getType, appendChild, has, 
    NUMBER, STRING, BOOLEAN, UNDEFINED, NULL, SYMBOL, BIGINT, ARRAY, OBJECT, removeChild, insertBefore, getParent, nextSibling
} from '../../tools';
import { hydrateEffect } from '.';

export const hydrateEach = (rawNode: RawElement, attrName: string, attrValue: string) => {

    const {id, $el} = rawNode;

    // Split the alias and the prop expression
    const [alias, propExp] = attrValue.split(' in ');

    // Split the alias into the item and the index
    let [item, index] = alias.split(',');

    // Validate the prop reference
    const msg = 'The each directive requires';

    // Check if the alias is a valid variable name
    if (!getPropName(item))
        throw new Error(`${msg} a valid alias.`);

    // Check if the index is a valid variable name
    index = index ? trim(index) : '';
    if (!getPropName(index)) index = 'index';

    // Remove the `each` attribute from the node.
    // This is done to prevent the attribute from being re-evaluated.
    // The un-evaluated node will be used as a template for the new nodes.
    delAttr($el, attrName);

    const next = nextSibling($el);
    const parent = getParent($el)!;
    removeChild(parent, $el);

    // Create a new set to keep track of the mounted items
    const mountedItems: Map<string, Node> = new Map();

    // Create a new fragment to hold the new nodes
    let fragment = document.createDocumentFragment();

    // Create a new effect.
    const fn = () => {
        // Get the value of the prop
        const value = getPropOrExp(rawNode, propExp);

        // Check if the prop is an array or an object
        if (!(isArray(value) || isObject(value)))
            throw new Error(`${msg} an ${ARRAY} or an ${OBJECT}.`);

        // Remove the nodes removed from the array
        for (const [key, $el] of mountedItems) {
            // Check if the item exists in the `value`
            if (value[key]) continue;
            // Remove the node from the DOM
            removeChild(parent, $el);
            // Dehydrate the node.
            // This will completely revert the node to its original state before hydration by removing all the effects and the context.
            dehydrate($el);
            // Remove the node from the mountedItems set
            mountedItems.delete(key);
        }

        // Convert the data to an array of entries
        for (const [i, v] of entries(value)) {

            // Check if the item exists in the mountedItems map
            if (mountedItems.get(i) && value[i]) continue;

            // Create a new ID
            const id = newID();

            // Create a new node for each item in the array
            const template = $el.cloneNode(true);

            // Add ID to the node
            (template as any).vNodeID = id;

            // New context
            const newContext = {
                [item]: v,
                [index]: i,
            };

            // When hydrating props, use the new context
            internal.props = {node: template, newContext}

            // Hydrate the new node
            hydrate([template], rawNode);

            // Add the node to the fragment
            appendChild(fragment, template);

            // Set two-way binding for primitive types
            if (has([NUMBER,STRING,BOOLEAN,UNDEFINED,NULL,SYMBOL,BIGINT], getType(v))) {
                // `its` means "Item to Source"
                hydrateEffect(raw[id] as any, 'its'+i, `${propExp}[${index}] = ${item}`);
                // `sti` means "Source to Item"
                hydrateEffect(raw[id] as any, 'sti'+i, `${item} = ${propExp}[${index}]`);
            }

            // Add the node to the mountedItems map
            mountedItems.set(i, template);
        }


        // Add the fragment before the next sibling
        if (next) insertBefore(parent, fragment, next);
        // Add the fragment as the last child
        else appendChild(parent, fragment);
    };

    // Add the effect to the effect object
    watch(id, attrName, fn);

    // Save to the rawNode
    saveProp(rawNode, attrName, attrValue);
}