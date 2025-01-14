import { effect } from '../reactivity';
import { entries, has, logError, logWarn, size, wait } from '../tools';
import { arrayAdd, arrayFrom, each, join } from '../tools/array';
import { SELECT, INPUT, TEXTAREA, CHECKBOX, RADIO, VALUE, ARRAY, DIRECTIVE, REQUIRES, COMPOSING, ELEMENT, CAN_ONLY_BE_USED_ON, BOOLEAN, STRING, NUMBER, CHECKED, BUT_GOT_INSTEAD, TEXT, OF_TYPE, OPTIONS, HOOKS, COMPOSITION_START, COMPOSITION_END } from '../tools/constants';
import { listen, onCompositionStart, onCompositionEnd, getAttr, queryAll, getTagName } from '../tools/dom';
import { evaluate } from '../tools/evaluation';
import { saveCleanup } from '../app';
import { D, newMap } from '../tools/object';
import { parse, trim } from '../tools/string';
import { isNull, isArray, getType, isUndefined, isString, isBoolean, isNumber } from '../tools/typeCheck';

/**
 * MODEL DIRECTIVE
 * The model directive is used to create a two-way binding between a reactive state and an input, textarea, or select element.
 * 
 * 
 * BEHAVIOR
 * - The reactive value is the source of truth for the value of the element.
 *   The model directive will ignore the initial value, checked, or selected properties of the element.
 * - Strings that represent numbers, booleans, or null will be typecast to their respective types. This is done using JSON.parse unless the raw modifier is present.
 * 
 * 
 * MODIFIERS
 * - trim: trims the value before setting it to the reactive state.
 * - raw: prevents the value from being typecast to a number, boolean, or null.
 * 
 * 
 * VALIDATION
 * 
 * select-one:
 * - reactive value: boolean, string, number, undefined, null.
 * 
 * select-multiple:
 * - reactive value: array, undefined, null.
 * - notes:
 *   - Brio will treat the reactive value as an array.
 * 
 * checkbox:
 * - reactive value: boolean, string, number, array, undefined, null.
 * - notes:
 *   - Brio will treat the reactive value as an array when multiple checkboxes are detected.
 *   - Single checkboxes also accept an array as a reactive value.
 * 
 * radio:
 * - reactive value: boolean, string, number, undefined, null.
 * - notes:
 *   - When the value attribute is not present, the reactive value will be a boolean based on the checked property.
 * 
 * number:
 * - reactive value: number, null.
 * - notes:
 *   - When undefined the browser logs an warning and sets the value to an empty string.
 * 
 * range:
 * - reactive value: number, undefined, null.
 * - notes:
 *   - The default value is 50 in most browsers. And that is how it is going to be displayed when the reactive value is undefined or null.
 * 
 * textarea and other input types:
 * - reactive value: string, number, undefined, null.
 * - notes:
 *   - string values are set as is.
 *   - null sets the value property to an empty string.
 *   - undefined, boolean, number, array, etc. are converted by the browser to their string representation.
 *     Note that the string representation for object, Map, Set, etc. is "[object Object|Map|Set|etc]".
 */

/**
 * The modifiers for checkboxes and select options. 
 * - This is used to apply the modifiers to the value of the checkbox or select option that don't have direct access to the modifiers.
 * - Without this, the value of these elements would not be properly modified.
 */
let nodeModifiers: Map<Node, string[]> = newMap();

/**
 * 
 * @option `trim`   trims the value before setting it to the reactive state.
 * @option `raw`    prevents the value from being typecast to a number, boolean, or null.
 * @option `lazy`   listens for the change event instead of the input event.
 */
export let hydrateModel = (vnode: VNode, attrName: string, attrValue: string, tools: HydrationTools) => {

    let [setHook, playHook] = tools[HOOKS];

    // Reusable strings
    let THE_MODEL_DIRECTIVE = `the ${attrName} ` + DIRECTIVE;
    let REQUIRES_A_REACTIVE_VALUE = REQUIRES + ` a reactive ` + VALUE;
    let SELECTED = SELECT+'ed' as 'selected';

    // The node, its tag, and its type
    let node = vnode.el as any;
    let tag = getTagName(node);
    let type = node.type;

    // ! ERROR: The model directive can only be used on input, textarea, and select elements.
    if (!has([INPUT,TEXTAREA,SELECT], tag))
        return logError(THE_MODEL_DIRECTIVE, CAN_ONLY_BE_USED_ON, INPUT, `, ${TEXTAREA}, and ${SELECT} ${ELEMENT}s.`, node);

    // Evaluate the expression to get the reactive value
    let [stateValue, isRef] = evaluate(vnode, attrValue);

    // ! ERROR: The model directive requires a reactive value.
    if (isRef != 1)
        return logError(THE_MODEL_DIRECTIVE, REQUIRES_A_REACTIVE_VALUE + ',', BUT_GOT_INSTEAD(stateValue()));

    // Get the reactive value
    let value = stateValue();
    let nodeValue: any;

    /** Get all the nodes that hold value for the reactive state */
    let getArrayNodes = () => arrayFrom(tag == SELECT ? node[OPTIONS] : getCheckboxGroup()) as Node[];

    // The modifiers
    let modifiers = vnode[OPTIONS][attrName] || {};

    /**
     * Get the node value and apply the modifiers `trim` and `raw`, if present.
     */
    let getNodeValue = (node: any) => {

        let value = node[isNull(getAttr(node, VALUE)) && isCheckboxOrRadio ? CHECKED : VALUE];

        let _modifiers = nodeModifiers.get(node) || modifiers;

        // Make sure the value is a string
        if (isString(value)) {

            // Trim the value
            if (_modifiers.trim) value = trim(value);

            // Raw prevents the value from being parsed
            // - By default, the model directive will typecast the value to a number, boolean, or null using JSON.parse.
            //   This is useful when the reactive value is a string that represents a number, boolean, or null.
            // - Note that 'undefined' is not a valid JSON string.
            // - Note that if one checkbox in a checkbox group has the raw modifier, all checkboxes in the group must have the raw modifier.
            if (!_modifiers.raw) {
                let parsed = parse(value);
                if (isNumber(parsed) || isNull(parsed) || isBoolean(parsed))
                    value = parsed;
            }
        }

        return value;
    }

    // Validation helpers
    let isInput = (_type: string|string[]) => tag == INPUT && has(_type, type);
    let isCheckboxOrRadio = isInput([CHECKBOX,RADIO]);

    let getCheckboxGroup = () => queryAll(INPUT+`[type="${CHECKBOX}"][name="${node.name}"]`);
    let isCheckboxGroup = () => isInput(CHECKBOX) && size(getCheckboxGroup()) > 1;

    /** Special validation to warn when the reactive value is not the expected type */
    let validate = () => {

        let rules: [string, string, string[]][] = [
            [INPUT, CHECKBOX, [NUMBER, STRING, BOOLEAN, ARRAY]],
            [INPUT, RADIO, [NUMBER, STRING, BOOLEAN]],
            [INPUT, NUMBER, [NUMBER]],
            [INPUT, 'range', [NUMBER]],
    
            [INPUT, '', [NUMBER, STRING]],
            [TEXTAREA, '', [NUMBER, STRING]],
            [SELECT, '', [NUMBER, STRING, BOOLEAN, ARRAY]],
        ];
        
        // Apply special validation
        for (let [_tag, _type, _typesArray] of rules) {

            // Not the correct tag or type, continue looking
            if (!(tag == _tag && (!_type || type == _type)))
                continue;
    
            // The type is invalid, log an error and return
            if (!(isNull(value) || isUndefined(value) || has(_typesArray, getType(value))))
                logWarn(THE_MODEL_DIRECTIVE, REQUIRES_A_REACTIVE_VALUE, OF_TYPE, join(_typesArray, ' or '), `for ${tag == INPUT ? type+' ' : ''}${_tag} ${ELEMENT}s,`, BUT_GOT_INSTEAD(getType(value)), node);

            break;
        }
    }

    // Wait for the node to be fully hydrated before running the special validation
    // Note: this is necessary because the reactive state may be used by multiple elements scattered throughout the template (e.g. multiple checkboxes in a group).
    wait(() => {
        validate();

        // Save modifiers
        if (SELECT == tag)
            each(getArrayNodes(), node => nodeModifiers.set(node, modifiers));

        else if (isInput(CHECKBOX))
            nodeModifiers.set(node, modifiers);
    }, 1);


    // UPDATES THE DOM
    let watchFn = () => {

        value = stateValue();
        nodeValue = getNodeValue(node);

        // Handle input and textarea elements
        if (has([INPUT,TEXTAREA], tag)) {

            // Handle checkboxes with an array model
            if (type == CHECKBOX && isArray(value)) {

                node[CHECKED] = has(value, nodeValue);
            }

            // Handle radio buttons and checkboxes
            else if (isCheckboxOrRadio) {

                // IMPORTANT:
                // * A checkbox with the value of false will be checked when all checkboxes are unchecked.
                // * This behavior may be helpful in some cases, but it can be confusing in others.
                // * To avoid this, use a different value for the checkbox, or use the raw modifier to treat false as a string.
                node[CHECKED] = value === nodeValue;
            }

            // Handle textarea elements, and other input types
            // Return if:
            // - the composition is still in progress, or
            // - the node is focused and the value hasn't changed
            else if (node[COMPOSING] || (D.activeElement === node && value === nodeValue)) return;

            // Otherwise, update the value
            else if (value !== nodeValue) node[VALUE] = value;
        }
        // Handle select elements
        else if (tag == SELECT) {

            // Handle multiple select
            if (isArray(value)) {

                // Select the options that are in the reactive state array, and deselect the others
                each(getArrayNodes(), option => {
                    option[SELECTED] = has(value, getNodeValue(option));
                });
            }

            // Handle single select
            else node[VALUE] = value;
        }
    }

    // Save the effect
    // Note: wait to save the effect until the node is fully hydrated because the model directive may depend on the bind directive to bind the value attribute.
    wait(() => saveCleanup(vnode, effect(watchFn)), 5); // 1ms is enough, but give it a little extra time to be safe


    // UPDATES THE PROP
    let events: ObjectType = {};
    setHook(node, attrName, (_: FunctionType) => {

        value = stateValue();

        // Handle multiple select options and checkboxes
        if ((tag == SELECT && node.multiple) || isCheckboxGroup()) {

            // The new reactive value
            let newValue: any[] = [];

            // Save the selected/checked values
            each(getArrayNodes(), node => {

                // Make sure that all option nodes have the modifiers of the select node
                // * This is because new option nodes may be added to the select element after the model directive is applied.
                if (tag == SELECT) nodeModifiers.set(node, modifiers);

                // Save the selected/checked value to the reactive state
                if (node[SELECTED] || node[CHECKED]) {
                    arrayAdd(newValue, getNodeValue(node));
                }
            });

            // Update the reactive state. This will trigger a DOM update
            stateValue(newValue);
        }

        // Handle other input types
        // Note: When a single checkbox with a value attribute is unchecked, the getNodeValue function returns the value attribute, if present, instead of false. In this case, the value should be set to false.
        else stateValue(isCheckboxOrRadio && !node[CHECKED] ? false : getNodeValue(node));
    });

    // Handle composition events
    if (isInput([TEXT,'search','url','tel','email','password']) || tag == TEXTAREA) {
        events[COMPOSITION_START] = onCompositionStart;
        events[COMPOSITION_END] = onCompositionEnd;
    }

    // Event name
    let event = (modifiers.lazy || isCheckboxOrRadio || tag == SELECT)
        ? 'change' 
        : INPUT;

    events[event] = () => playHook(node, attrName, stateValue);

    // Add the event listeners and save the cleanup functions
    for (let [eventName, fn] of entries(events)) {
        saveCleanup(vnode, listen(node, eventName, fn));
    }
}