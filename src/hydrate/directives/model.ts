import { RawElement, ObjectType } from '../index.d';

import { watch, saveProp, modelValue, getPropRef } from '..';
import {
    listen, delAttr, onCompositionStart, onCompositionEnd,
    inArray, isArray, arrayAdd, arrayRemove, entries, getAttr, isNull,
    SELECT, INPUT, TEXTAREA, CHECKBOX, RADIO, VALUE, CHANGE, lower, ARRAY, INVALID_PROP_OR_EXPRESSION
} from '../../tools';

export const hydrateModel = (rawNode: RawElement, attrName: string, attrValue: string) => {

    const [MODEL, ...modifiers] = attrName.split('-');

    // Get the prop reference
    const [prop, setProp] = getPropRef(rawNode, attrValue);

    if (!(prop && setProp)) throw new Error(`${MODEL}: ${INVALID_PROP_OR_EXPRESSION}.\n${attrValue}`);

    const {id} = rawNode;

    const node = rawNode.$el as any;
    const type = node.type;
    const tag = lower(node.tagName);

    if (tag == INPUT && !inArray([CHECKBOX,RADIO], type)) {
        const theValueAttr = getAttr(node, VALUE);
        if (!isNull(theValueAttr)) {
            // Save the original value
            saveProp(rawNode, VALUE, theValueAttr as string);
        }
    }

    // UPDATES THE DOM
    const watchFn = () => {
        const value = prop();

        if (inArray([INPUT,TEXTAREA], tag)) {
            if (type == CHECKBOX && isArray(value)) {
                if (isNull(getAttr(node, VALUE)))
                    throw new Error(`Checkbox ${VALUE} attribute is required when using an ${ARRAY} ${MODEL}.`);

                node.checked = inArray(value, node[VALUE]);
            }
            else if (type == RADIO || type == CHECKBOX) {
                node.checked = value === node[VALUE] || value === true && node[VALUE] == 'on';
            }
            else {
                // Composition is still in progress
                if (node.composing) return;

                // If the element is focused and the value hasn't changed, return
                if (document.activeElement === node && node[VALUE] === value) return;

                // Update the value
                if (node[VALUE] !== value) node[VALUE] = value;
            }
        }
        else if (tag == SELECT) {
            // Update the value
            if (node[VALUE] !== value) node[VALUE] = value;
        }
        else {
            throw new Error(`The ${MODEL} directive can only be used on ${INPUT}, ${SELECT}, and ${TEXTAREA} elements.`);
        }
    };
    // Add the effect to the effect object
    watch(id, MODEL, watchFn);


    // UPDATES THE PROP IN THE SCOPE
    const events: ObjectType = {};
    let eventFn = () => setProp(modelValue(node[VALUE], modifiers));

    if (inArray([INPUT,TEXTAREA], tag)) {
        // Checkbox with array model
        if (type == CHECKBOX) {
            eventFn = () => {
                // When the checkbox doesn't have a value attribute, use the checked property instead
                let value = isNull(getAttr(node, VALUE)) ? node.checked : modelValue(node[VALUE], modifiers);

                const array = prop();
                if (isArray(array)) {
                    if (node.checked) arrayAdd(array, value);
                    else arrayRemove(array, value);
                } else {
                    setProp(value);
                }
            }
        }

        events.compositionstart = onCompositionStart;
        events.compositionend = onCompositionEnd;
    }

    // Event name
    let event = (inArray(modifiers, 'lazy') || inArray([RADIO,CHECKBOX], type) || tag == SELECT)
        ? CHANGE 
        : INPUT;

    events[event] = eventFn;

    // Add the event listeners
    for (const [eventName, fn] of entries(events)) {
        watch(id, eventName, listen(node, eventName, fn), false, false);
    }

    // Save to the rawNode
    saveProp(rawNode, attrName, attrValue);

    // Remove the attribute from the node
    delAttr(node, attrName);
}