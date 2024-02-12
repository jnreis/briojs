import { RawElement, ObjectType } from '../index.d';

import { watch, watchProp, rawNodeProp, modelValue, getPropRef } from '..';
import {
    listen, delAttr, onCompositionStart, onCompositionEnd,
    inArray, isArray, arrayAdd, arrayRemove, entries, isFn
} from '../../tools';

export function hydrateModel(rawNode: RawElement, name: string, propExp: string) {

    const [model, ...modifiers] = name.split('-');

    // Get the model value
    const [getProp, setProp] = getPropRef(rawNode, propExp);

    if (!(getProp && setProp)) throw new Error(`The variable ${propExp} does not exist in the scope.`);

    const el = rawNode.node as any;
    const type = el.type;
    const tag = el.tagName;

    // UPDATES THE DOM
    const watchFn = () => {
        const value = getProp();

        if (inArray(['INPUT','TEXTAREA'], tag)) {
            if (type == 'checkbox') {
                if (isArray(value)) el.checked = inArray(value, el.value);
                else el.checked = value == el.value;
            }
            else if (type == 'radio') {
                el.checked = value == el.value;
            }
            else {
                // Composition is still in progress
                if (el.composing) return;

                // If the element is focused and the value hasn't changed, return
                if (document.activeElement === el && el.value === value) return;

                // Update the value
                if (el.value !== value) el.value = value;
            }
        }
        else if (tag == 'SELECT') {
            // Update the value
            if (el.value !== value) el.value = value;
        }
        else {
            throw new Error(`The model directive can only be used on input, select, and textarea elements.`);
        }
    };
    // Add the effect to the effect object
    watch(rawNode.id, model, watchFn);


    // UPDATES THE PROP IN THE SCOPE
    const events: ObjectType = {};
    let eventFn = () => setProp(modelValue(el.value, modifiers));

    if (inArray(['INPUT','TEXTAREA'], tag)) {
        // Checkbox with array model
        if (type == 'checkbox' && isArray(getProp())) {
            eventFn = () => {
                const v = modelValue(el.value, modifiers);
                if (el.checked) arrayAdd(getProp(), v);
                else arrayRemove(getProp(), v);
            }
        }

        events.compositionstart = onCompositionStart;
        events.compositionend = onCompositionEnd;
    }

    // Event name
    let event = (inArray(modifiers, 'lazy') || inArray(['radio','checkbox'], type) || tag == 'SELECT')
        ? 'change' 
        : 'input';

    events[event] = eventFn;

    // Add the event listeners
    for (const [eventName, fn] of entries(events)) {
        watch(rawNode.id, `${model}:${eventName}`, listen(el, eventName, fn), false, false);
    }

    // Save to the rawNode
    rawNodeProp(rawNode, 'model', {event, modifiers});

    // Remove the attribute from the node
    delAttr(rawNode.node, name);
}