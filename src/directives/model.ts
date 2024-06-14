import { evaluate } from '../evaluation';
import { interceptor, modelValue, saveAttr, saveCleanup } from '../hydration';
import { entries, has, logger } from '../tools';
import { arrayAdd, arrayFrom, arrayRemove, each } from '../tools/array';
import { listen, onCompositionStart, onCompositionEnd, getAttr } from '../tools/dom';
import { lower, split } from '../tools/string';
import { isNull, isArray, getType } from '../tools/typeCheck';
import { SELECT, INPUT, TEXTAREA, CHECKBOX, RADIO, VALUE, CHANGE, ARRAY, DIRECTIVE, ATTRIBUTE, REQUIRE, COMPOSING, ELEMENT, CAN_ONLY_BE_USED_ON, BOOLEAN, STRING, NUMBER } from '../tools/constants';
import { effect } from '../reactivity';

export let hydrateModel = (vnode: VNode, attrName: string, attrValue: string) => {

    let [_B, MODEL, ...modifiers] = split(attrName, '-');

    let [call, isRef] = evaluate(vnode, attrValue);

    let ATTR_REPRESENTATION = `${attrName}="${attrValue}"`;
    let MODEL_DIRECTIVE = `${MODEL} ${DIRECTIVE}`;

    if (isRef != 1)
        return logger(`The ${MODEL_DIRECTIVE} ${REQUIRE}s a reactive state.`, ATTR_REPRESENTATION);

    // Get the value
    let value = call();
    let valueType = getType(value);

    let node = vnode.$el as any;
    let type = node.type;
    let tag = lower(node.tagName);

    if (!has([INPUT,TEXTAREA,SELECT], tag))
        return logger(`The ${MODEL_DIRECTIVE} ${CAN_ONLY_BE_USED_ON} ${INPUT}, ${SELECT}, and ${TEXTAREA} ${ELEMENT}s.`);

    // Helper function to check if the model value is of the correct type
    let invalidType = (_tag: string, _type: string, _typesArray: string[]) => tag == _tag && type == _type && !has(_typesArray, valueType);

    // Make sure the model value is of the correct type
    if (
        // Checkbox can be a boolean or an array
        invalidType(INPUT, CHECKBOX, [BOOLEAN,ARRAY]) ||
        // Radio can be a string or a number
        invalidType(INPUT, RADIO, [STRING,NUMBER]) ||
        // Number can only be a number
        invalidType(INPUT, NUMBER, [NUMBER]) ||
        // Range can only be a number
        invalidType(INPUT, 'range', [NUMBER]) ||
        // Other input types must be a string
        (tag == INPUT && !has([CHECKBOX,RADIO,NUMBER,'range'], type) && valueType != STRING) ||

        // Single select can be a string or a number
        invalidType(SELECT, SELECT+'-one', [STRING,NUMBER]) ||
        // Multiple select can only be an array
        invalidType(SELECT, SELECT+'-multiple', [ARRAY]) ||

        // Textarea must be a string
        (tag == TEXTAREA && valueType != STRING)
    ) return logger(`The ${VALUE} of the ${MODEL_DIRECTIVE} cannot be of type ${getType(value)}.`, ATTR_REPRESENTATION);

    // Save the original `value` attribute
    // Except for checkboxes and radio buttons, because the value attribute is required
    if (tag == INPUT && !has([CHECKBOX,RADIO], type)) {
        // Get the value attribute
        let theValueAttr = getAttr(node, VALUE);
        // Save the value attribute, if any
        if (!isNull(theValueAttr)) saveAttr(vnode, VALUE, theValueAttr as string);
    }

    // Helper function to construct an error message
    let mustHaveValue = (tagOrType: string) => `The ${tagOrType} must have a ${VALUE} ${ATTRIBUTE} when using an ${ARRAY} ${MODEL}.`;

    // UPDATES THE DOM
    let watchFn = () => {
        let value = call();

        // Handle input and textarea elements
        if (has([INPUT,TEXTAREA], tag)) {
            // Handle checkboxes with an array model
            if (type == CHECKBOX && isArray(value)) {
                // The value attribute is required. Check if it exists and log an error if it doesn't
                if (!getAttr(node, VALUE))
                    return logger(mustHaveValue(CHECKBOX));
                // Update the checked property
                node.checked = has(value, node[VALUE]);
            }
            // Handle radio buttons and checkboxes
            else if (type == RADIO || type == CHECKBOX) {
                node.checked = value === node[VALUE] || value === true && node[VALUE] == 'on';
            }
            // Handle textarea elements, and other input types
            else {
                if (// Composition is still in progress, or
                    node[COMPOSING] || 
                    // the node is focused and the value hasn't changed
                    (document.activeElement === node && node[VALUE] === value)
                ) return;

                // Otherwise, update the value
                if (node[VALUE] !== value) node[VALUE] = value;
            }
        }
        // Handle select elements
        else if (tag == SELECT) {
            // Handle multiple select
            if (isArray(value)) {
                each(arrayFrom(node.options), option => {
                    // The value attribute is required. Check if it exists and log an error if it doesn't
                    if (!getAttr(option, VALUE))
                        return logger(mustHaveValue(SELECT + ' options'));
                    // Update the selected property
                    option.selected = has(value, option.value);
                });
            }
            // Handle single select
            else if (node[VALUE] !== value) node[VALUE] = value;
        }
    };
    // Save the cleanup function
    saveCleanup(vnode, effect(watchFn));

    // UPDATES THE PROP
    let events: ObjectType = {};
    let eventFn = interceptor(vnode, attrName, (_: FunctionType, next) => {
        let value = call();
        let nodeValue = modelValue(node[VALUE], modifiers);
        // Handle array models
        if (isArray(value)) {
            // Handle multiple checkboxes
            if (type == CHECKBOX) {
                if (node.checked) arrayAdd(value, nodeValue);
                else arrayRemove(value, nodeValue);
            }
            // Handle multiple select options
            else if (tag == SELECT) {
                // Add the selected options to a temporary array
                // ? This is necessary because each iteration of the loop updates the reactive state and triggers a DOM update which resets the selected options before the next iteration.
                let _value: any[] = [];
                each(arrayFrom(node.selectedOptions), option => {
                    arrayAdd(_value, modelValue(option[VALUE], modifiers));
                });

                // Update the value. This will trigger a DOM update
                call(_value);
            }
            // ? Other input types are not supported with an array model at the moment.
            // ? But an error message is not necessary because the validation above should catch this.
        }
        // Handle other input types
        else call(nodeValue);

        // Handle composition events
        if (has([INPUT,TEXTAREA], tag)) {
            events.compositionstart = onCompositionStart;
            events.compositionend = onCompositionEnd;
        }

        // Next function
        next();
    });

    // Event name
    let event = (has(modifiers, 'lazy') || has([RADIO,CHECKBOX], type) || tag == SELECT)
        ? CHANGE 
        : INPUT;

    events[event] = () => eventFn(call);

    // Add the event listeners and save the cleanup functions
    for (let [eventName, fn] of entries(events)) {
        saveCleanup(vnode, listen(node, eventName, fn));
    }
}