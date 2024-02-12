import { RawElement } from '../index.d';

import { raw, scope, hydrate, watch, watchProp, newID, getPropRef, getPropRefError, effect } from '..';
import { delAttr, entries, isArray, isObject, arrayRemove, has } from '../../tools';

export function hydrateEach(rawNode: RawElement, attrName: string, attrValue: string) {
    const el = rawNode.node;
    delAttr(el, attrName);

    const [alias, propName] = attrValue.split(' in ');
    let [item, index] = alias.split(',');

    const msg = 'The each directive requires'
    if (!propName) throw new Error(`${msg} a value.`);
    if (!item) throw new Error(`${msg} an alias.`);
    index = index.trim() || 'index';

    const [getProp, setProp] = getPropRef(rawNode, propName);
    if (!(getProp && setProp)) throw new Error(getPropRefError(propName));

    const template = el.cloneNode(true) as HTMLElement;

    const next = el.nextSibling;
    const parent = el.parentElement!;
  
    const anchor = new Text('')
    parent.insertBefore(anchor, el)
    parent.removeChild(el)

    // let mounted = false
    // let keyToIndexMap: Map<any, number>

    let size = 0;
    let eachScope: Map<string, any> = new Map();

    // Create a fragment
    let fragment = document.createDocumentFragment();

    const fn = () => {

        const data = getProp();
        console.log('data', data, eachScope);

        // Check if the data is an array or an object
        if (!(isArray(data) || isObject(data))) {
            throw new Error('The data must be an array or an object.');
        }

        console.log('size', size, data.length);

        // Check if size is the same
        if (size == data.length) return;

        // Remove all nodes
        for (const [id, node] of eachScope) {
            // Remove the node
            parent.removeChild(node);
            // Clean up the scope
            arrayRemove(rawNode.scopes, id);
            delete scope[id];
            eachScope.delete(id);
            console.log('deleting item', id, effect[id]);
        }

        // Convert the data to an array of entries
        for (const [i, v] of entries(data)) {

            // Create a new node for each item in the array
            const node = template.cloneNode(true);

            // Create a new id for the node
            const id = newID();
            
            // Add the id to the node
            (node as any).rawNodeID = id;
            console.log('new id', id);

            // Add the scope to the node
            if (!scope[id]) scope[id] = {};
            scope[id][index] = i;
            scope[id][item] = v;

            // Add the new scope to the rawNode.
            // The new node will inherit from the rawNode.
            rawNode.scopes.unshift(id);

            // Hydrate the new node
            hydrate([node], rawNode);

            fragment.appendChild(node);

            // Add the scope to the eachScope map
            eachScope.set(id, node);

            // console.log('recreating item', id)
        }

        // Update the size
        size = data.length;

        // Add the fragment before the next sibling
        if (next) parent?.insertBefore(fragment, next);
        // Add the fragment as the last child
        else parent?.appendChild(fragment);
    };

    // Add the effect to the effect object
    watch(rawNode.id, attrName, fn);

    // Save to the rawNode
    rawNode.each = attrValue;

    // Remove the attribute from the node
    delAttr(el, attrName);
}