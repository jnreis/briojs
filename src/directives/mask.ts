import { evaluate } from "../evaluation";
import { interceptor, saveCleanup } from "../hydration";
import { logger, size, slice, wait } from "../tools";
import { each } from "../tools/array";
import { CAN_ONLY_BE_USED_ON, DIRECTIVE, ELEMENT, INPUT, SELECTION_START, TEXTAREA, VALUE } from "../tools/constants";
import { listen } from "../tools/dom";
import { deleteKey, getKeys } from "../tools/object";
import { isStringAlpha, isStringNumeric, replaceSubstring, split, startsWith, trim } from "../tools/string";
import { isUndefined } from "../tools/typeCheck";

export let hydrateMask = (vnode: VNode, attrName: string, attrValue: string) => {

    let $el: any = vnode.$el;
    let [MASK, modifier] = split(attrName, '-');

    // If the element has no value or selectionStart properties, return
    if (!(VALUE in $el && SELECTION_START in $el))
        return logger(`The ${MASK} ${DIRECTIVE} ${CAN_ONLY_BE_USED_ON} ${TEXTAREA} ${ELEMENT}s and textual ${INPUT} types (text, email, etc.).`);

    let value: string;
    let previousValue: string;
    let cursorOffset: number;
    let mask = attrValue;
    let dynamicMask: ($mask: ObjectType) => string;
    /**
     * Wildcards are characters that can be used in the mask and are used to determine which characters are valid.
     */
    let wildcards: ObjectType = {
        '1': (input: string, index: number) => isStringNumeric(input[index]),
        'a': (input: string, index: number) => isStringAlpha(input[index]),
        '*': (input: string, index: number) => isStringNumeric(input[index]) || isStringAlpha(input[index]),
    };
    /**
     * Keep only valid characters
     */
    let sanitize = (input: string) => {
        let output = '',
        w = getKeys(wildcards);
        for (let i = 0; i < size(input); i++) {
            if (w.some(c => wildcards[c](input, i))) {
                output += input[i];
            }
        }
        return output;
    };
    /**
     * Create a mask for money
     */
    let money = (decimal = '.', thousands = ',', precision = 2) => {

        // Remove imcompatible wildcards
        each(['a', '*'], c => deleteKey(wildcards, c));

        // Add negative wildcard
        wildcards['-'] = (input: string, index: number) => index == 0 && trim(input[index]) == '-';

        // Add decimal wildcard
        wildcards[decimal] = (input: string, index: number) => input[index] == decimal;

        // Overwrite `1` wildcard to remove leading zeros
        wildcards['1'] = (input: string, index: number) => {
            let char = input[index];
            // Remove leading zeros
            if (char == '0') {
                // Check if zero(s) exist before a non-zero number.
                // Also, handle the case where the input is negative.
                let leadingZeros = trim(input).match(new RegExp(`^-?[0${thousands}]+[1-9]`));
                // If the zero at the index is a leading zero, return false to remove it
                return !(leadingZeros && index <= size(leadingZeros[0]) - 1);
            }
            // Check if the character is a number
            return isStringNumeric(char);
        };

        // If the decimal and thousands separators are the same, update the thousands separator
        if (decimal == ',' && thousands == ',') thousands = '.';

        // Determine if the input is negative
        let isNegative = startsWith(trim(value), '-'),

        // Sanitize input: remove non-numeric characters and leading zeros
        sanitizedValue = sanitize(value);

        // Remove the negative sign, if it exists
        if (isNegative) sanitizedValue = replaceSubstring(sanitizedValue, 0, 1);

        // Split input into integer and decimal parts
        let [integerPart, decimalPart] = split(sanitizedValue, decimal),

        // Create the mask dynamically based on integer part and decimal precision
        mask = '';

        // Add the integer part to the mask
        for (let i = 0; i < size(integerPart); i++) {
            if (i > 0 && (size(integerPart) - i) % 3 == 0) {
                mask += thousands;
            }
            mask += '1';
        }

        // Add the decimal part to the mask if it exists and precision is greater than 0.
        // The decimal part length is determined by the precision.
        if (!isUndefined(decimalPart) && precision > 0) {
            mask += decimal;
            if (size(decimalPart)) {
                for (let i = 0; i < precision; i++) {
                    mask += '1';
                }
            }
        }

        // Add the negative sign to the mask if the input is negative
        if (isNegative) mask = '-' + mask;

        return mask;
    };
    /**
     * Apply the mask to the input
     */
    let applyMask = (input: string) => {
        let output = '',
        i = 0;

        for (let m = 0; m < mask.length; m++) {
            let maskChar = mask[m],
            inputChar = input[i];
    
            if (maskChar in wildcards) {
                if (wildcards[maskChar](input, i)) {
                    output += inputChar;
                    i++;
                }
                // Stop if input character doesn't match mask
                else break;
            } else {
                output += maskChar;
                if (maskChar == inputChar) i++;
            }
        }

        return output;
    };
    /**
     * Make sure that the deleted character is a valid character.
     * When one character is deleted and it's not a valid character, remove characters before it until a valid character is found and removed.
     * A valid character is a character that matches a wildcard.
     */
    let deleteValidChar = () => {
        if (size(previousValue) == size(value) + 1) {
            // Find out what has changed
            let deletedCharIndex = -1;
            for (let p = 0; p < size(previousValue); p++) {
                if (value[p] != previousValue[p]) {
                    deletedCharIndex = p;
                    break;
                }
            }

            let w = getKeys(wildcards);
            // If the deleted character is not a wildcard, remove the character before it
            if (deletedCharIndex > -1 && !w.some(c => wildcards[c](previousValue, deletedCharIndex))) {
                let validCharRemoved = false;
                for (let i = deletedCharIndex -1; i >= 0; i--) {
                    // A valid character was removed
                    if (validCharRemoved) break;
    
                    // A valid character will be removed
                    if (w.some(c => wildcards[c](value, i))) validCharRemoved = true;
    
                    // Remove the character
                    value = replaceSubstring(value, i, i+1);
                    cursorOffset--;
                }
            }
        }
    };
    /**
     * Get the number of valid characters before the cursor
     */
    let getCursorPosition = ($el: HTMLInputElement) => {
        let cursorPosition = $el[SELECTION_START],
        input = $el.value,
        // Check how many valid characters are before the cursor
        validCharsBeforeCursor = sanitize(slice(input, 0, cursorPosition || size(input)));
        return validCharsBeforeCursor ? size(validCharsBeforeCursor) : 0;
    };
    /**
     * Set the cursor before the next valid character after the last valid character
     * example: 123-456-789 if the cursor is after the 3, it will be set before the 4 (the next valid character)
     */
    let setCursorPosition = ($el: HTMLInputElement, validChars: number) => {
        let value = $el.value,
        w = getKeys(wildcards),
        nextChar = false;
        for (let index = 0; index < size(value); index++) {
            if (nextChar) {
                index--;
                $el.setSelectionRange(index, index);
                break;
            }
            // If the character is valid, decrement the counter
            if (w.some(c => wildcards[c](value, index))) {
                if (validChars) validChars--;
                else nextChar = true;
            }
        }
    };

    if (modifier == 'dynamic') {
        dynamicMask = evaluate(vnode, attrValue, '$mask')[0];
    }

    // Get the initial value of the input
    wait(() => previousValue = $el.value);

    // This listener will `capture` and process the input value before any other listeners.
    let cleanup = listen($el, INPUT, interceptor(vnode, attrName, (_, next) => {

        // Get the current value of the input
        value = $el.value;

        // If the value has not changed, return
        if (value == previousValue) return;

        // Reset the cursor offset
        cursorOffset = 0;

        // If a character was deleted make sure it was a valid character
        deleteValidChar();

        // If a dynamic mask is provided, use it to generate the mask
        if (dynamicMask) mask = dynamicMask({money, sanitize, wildcards});

        // Sanitize the value
        let sanitizedValue = sanitize(value);

        // Get the cursor position before the input value changes
        let newCursorPosition = getCursorPosition($el);

        // Apply the mask to the value and save it for the next iteration
        $el.value = previousValue = applyMask(sanitizedValue);

        // Set the cursor position
        setCursorPosition($el, newCursorPosition + cursorOffset);

        // Next function
        next();
    }), true);

    // Save cleanup function
    saveCleanup(vnode, cleanup);
}