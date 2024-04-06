import { ref } from '../evaluation';
import { modelValue, saveAttr, saveEffect } from '../hydration';
import { entries, has } from '../tools';
import { arrayAdd, arrayRemove } from '../tools/array';
import { listen, onCompositionStart, onCompositionEnd, getAttr } from '../tools/dom';
import { capitalize, lower, split } from '../tools/string';
import { isNull, isArray, getType } from '../tools/typeCheck';
import { SELECT, INPUT, TEXTAREA, CHECKBOX, RADIO, VALUE, CHANGE, ARRAY, DIRECTIVE, ATTRIBUTE, REQUIRE, OBJECT, UNDEFINED, SYMBOL, $EL, COMPOSING, ELEMENT, CAN_ONLY_BE_USED_ON } from '../tools/constants';

export let hydrateModel = (vnode: VNode, attrName: string, attrValue: string) => {

    let [MODEL, ...modifiers] = split(attrName, '-');

    // Get the prop reference
    let value = ref(vnode, attrValue);

    let node = vnode[$EL] as any;
    let type = node.type;
    let tag = lower(node.tagName);

    if (!has([INPUT,TEXTAREA,SELECT], tag))
        return console.error(`The ${MODEL} ${DIRECTIVE} ${CAN_ONLY_BE_USED_ON} ${INPUT}, ${SELECT}, and ${TEXTAREA} ${ELEMENT}s.`);

    let msg = `The ${MODEL} ${VALUE} for ${tag}${tag == TEXTAREA ? '' : ' '+type} cannot be of type ${getType(value)}.`;

    if (has([OBJECT,UNDEFINED,SYMBOL], getType(value)) || type != CHECKBOX && isArray(value)) {
        return console.error(msg);
    }

    if (tag == INPUT && !has([CHECKBOX,RADIO], type)) {
        let theValueAttr = getAttr(node, VALUE);
        if (!isNull(theValueAttr)) {
            // Save the original `value` attribute
            saveAttr(vnode, VALUE, theValueAttr as string);
        }
    }

    // UPDATES THE DOM
    let watchFn = () => {
        let value = ref(vnode, attrValue);

        if (has([INPUT,TEXTAREA], tag)) {
            if (type == CHECKBOX && isArray(value)) {
                if (!getAttr(node, VALUE))
                    return console.error(`${capitalize(CHECKBOX)} ${VALUE} ${ATTRIBUTE} is ${REQUIRE}d when using an ${ARRAY} ${MODEL}.`);

                node.checked = has(value, node[VALUE]);
            }
            else if (type == RADIO || type == CHECKBOX) {
                node.checked = value === node[VALUE] || value === true && node[VALUE] == 'on';
            }
            else {
                // Composition is still in progress
                if (node[COMPOSING]) return;

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
    };
    // Add the effect to the effect object
    saveEffect(vnode, watchFn, false);

    // UPDATES THE PROP IN THE SCOPE
    let events: ObjectType = {};
    let setValue = ref(vnode, attrValue, true);
    let eventFn = () => setValue(modelValue(node[VALUE], modifiers));

    if (has([INPUT,TEXTAREA], tag)) {
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
    let event = (has(modifiers, 'lazy') || has([RADIO,CHECKBOX], type) || tag == SELECT)
        ? CHANGE 
        : INPUT;

    events[event] = eventFn;

    // Add the event listeners
    for (let [eventName, fn] of entries(events)) {
        saveEffect(vnode, listen(node, eventName, fn));
    }

    // Save to the vnode
    saveAttr(vnode, attrName, attrValue);
}