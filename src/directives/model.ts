import { VNode, ObjectType } from '..';

import { ref } from '../evaluate';
import { modelValue, saveAttr, saveEffect } from '../hydrate';
import { entries } from '../tools';
import { inArray, arrayAdd, arrayRemove } from '../tools/array';
import { listen, onCompositionStart, onCompositionEnd, getAttr } from '../tools/dom';
import { capitalize, lower } from '../tools/string';
import { isNull, isArray, isUndefined } from '../tools/typeCheck';
import { SELECT, INPUT, TEXTAREA, CHECKBOX, RADIO, VALUE, CHANGE, ARRAY, INVALID_PROP_OR_EXPRESSION, DIRECTIVE, ATTRIBUTE, REQUIRE } from '../tools/constants';

export let hydrateModel = (vnode: VNode, attrName: string, attrValue: string) => {

    let [MODEL, ...modifiers] = attrName.split('-');

    // Get the prop reference
    let value = ref(vnode, attrValue);

    if (isUndefined(value))
        throw new Error(`${INVALID_PROP_OR_EXPRESSION} provided to ${MODEL}. ${attrValue}`);

    let node = vnode.$el as any;
    let type = node.type;
    let tag = lower(node.tagName);

    if (tag == INPUT && !inArray([CHECKBOX,RADIO], type)) {
        let theValueAttr = getAttr(node, VALUE);
        if (!isNull(theValueAttr)) {
            // Save the original `value` attribute
            saveAttr(vnode, VALUE, theValueAttr as string);
        }
    }

    // UPDATES THE DOM
    let watchFn = () => {
        let value = ref(vnode, attrValue);

        if (inArray([INPUT,TEXTAREA], tag)) {
            if (type == CHECKBOX && isArray(value)) {
                if (isNull(getAttr(node, VALUE)))
                    throw new Error(`${capitalize(CHECKBOX)} ${VALUE} ${ATTRIBUTE} is ${REQUIRE}d when using an ${ARRAY} ${MODEL}.`);

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
            throw new Error(`The ${MODEL} ${DIRECTIVE} can only be used on ${INPUT}, ${SELECT}, and ${TEXTAREA} elements.`);
        }
    };
    // Add the effect to the effect object
    saveEffect(vnode, MODEL, watchFn);

    // UPDATES THE PROP IN THE SCOPE
    let events: ObjectType = {};
    let setValue = ref(vnode, attrValue, true);
    let eventFn = () => setValue(modelValue(node[VALUE], modifiers));

    if (inArray([INPUT,TEXTAREA], tag)) {
        // Checkbox with array model
        if (type == CHECKBOX) {
            eventFn = () => {
                // When the checkbox doesn't have a value attribute, use the checked property instead
                let value = isNull(getAttr(node, VALUE)) ? node.checked : modelValue(node[VALUE], modifiers);

                let array = ref(vnode, attrValue);
                if (isArray(array)) {
                    if (node.checked) arrayAdd(array, value);
                    else arrayRemove(array, value);
                } else {
                    setValue(value);
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
    for (let [eventName, fn] of entries(events)) {
        let cleanup = listen(node, eventName, fn);
        vnode.effect[eventName] = cleanup;
    }

    // Save to the vnode
    saveAttr(vnode, attrName, attrValue);
}