import { saveCleanup } from "../app";
import { entries, has, logError, size } from "../tools";
import { arrayAdd, each, every, indexOf } from "../tools/array";
import { B_, CAN_ONLY_BE_USED_ON, DIRECTIVE, ELEMENT, INPUT, MASK, NUMBER, SELECTION_START, TEXTAREA, VALUE } from "../tools/constants";
import { emit, listen, nextFrame } from "../tools/dom";
import { destructuringObject } from "../tools/evaluation";
import { getProp } from "../tools/object";
import { split, test } from "../tools/string";
import { isArray, isFunction, isNumber, isRegExp, isString } from "../tools/typeCheck";

/** */
let OUTPUT: 'output' = 'output';
let CURSOR: 'cursor' = 'cursor';
let CURSOR_UPDATED = CURSOR + 'Updated' as 'cursorUpdated';
let UPDATE_CURSOR: 'updateCursor' = 'updateCursor';


/**
 * TODO: The b-mask directive will be re-written taking as inspiration the Maska library.
 * 
 * @option tokens
 * @option decimal   (default: `.`)
 * @option thousands (default: `,`)
 * @option precision (default: `2`)
 */
let hydrateMask = (bnode: BNode, attrName: string, attrValue: string) => {

    let $el: any = bnode.el;

    // If the element has no value or selectionStart properties, return
    if (!(VALUE in $el && SELECTION_START in $el))
        return logError('the', attrName, DIRECTIVE, CAN_ONLY_BE_USED_ON, TEXTAREA, ELEMENT + 's and textual', INPUT, 'types (text, email, etc.).');

    // The mask expression will have access to these helper functions for defining the mask
    let expHelpers = {
        char,
        letter,
        [NUMBER]: number,
        alpha,
        money,
    }

    // Updated mask object
    let $mask: MaskContext = {
        exp: () => {},
        [VALUE]: '',
        [CURSOR]: $el[SELECTION_START],
        [UPDATE_CURSOR]: updateCursor,
        [CURSOR_UPDATED]: false,
        [OUTPUT]: '',
        ...expHelpers,
    };

    $mask.exp = bnode.exec(bnode, attrValue, destructuringObject(expHelpers, attrValue));

    let _mask = () => {

        // Get the current value of the input
        $mask[VALUE] = $el[VALUE];

        // If the value has not changed, return
        if ($mask[VALUE] != $mask[OUTPUT]) {

            // Get the current cursor position
            $mask[CURSOR] = $el[SELECTION_START];

            applyMask($mask);

            // Apply the mask to the value and save it for the next iteration
            $el[VALUE] = $mask[OUTPUT];

            // Set the cursor position
            $el.setSelectionRange($mask[CURSOR], $mask[CURSOR]);

            // Emit the mask event
            emit($el, MASK, $mask);
        }

    };

    // Initial mask application
    saveCleanup(bnode, nextFrame(_mask));

    // Save cleanup function
    // This listener will `capture` and process the input value before any other listeners.
    saveCleanup(bnode, listen($el, INPUT, _mask, true));
}

let applyMask = ($mask: MaskContext) => {

    $mask[CURSOR_UPDATED] = false;
    $mask[OUTPUT] = '';

    let maskItems = $mask.exp($mask) as Mask;

    // Custom mask function
    if (isFunction(maskItems)) {
        (maskItems as FunctionType)($mask);
        return;
    }

    let str = $mask[VALUE];
    let strIndex = 0;
    let strLength = size(str);

    let normalizedMaskItems: MaskItem[] = [];
    each(maskItems as MaskItem[], maskItem => {
        if (isString(maskItem) && size(maskItem) > 1)
            normalizedMaskItems.push(...split(maskItem, ''));
        else normalizedMaskItems.push(maskItem);
    });
    maskItems = normalizedMaskItems;

    // Iterate over the mask items
    for (let [maskIndex, maskItem] of entries(maskItems) as [number, MaskItem][]) {

        // There are no remaining characters to match
        if (strIndex >= strLength) break;

        if (isArray(maskItem)) {

            let matchCount = 0;
            let [charFn, min, max] = maskItem as MaskCharacter;

            // Match characters until max is reached or string ends
            while (strIndex < strLength && matchCount < max) {

                // Mask character matches
                if (charFn(str[strIndex])) {
                    matchCount++;
                    $mask[OUTPUT] += str[strIndex];
                }
                // Mask character does not match
                else {
                    // Does the character match one of the next mask items?
                    let matchNextMask = false;
                    let nextMaskItem: MaskCharacter | undefined;
                    let nextMaskFromIndex = maskIndex;

                    while (nextMaskFromIndex > -1 && (nextMaskItem = getNextMask(maskItems as MaskItem[], nextMaskFromIndex + 1))) {
                        if (matchMaskCharacter(nextMaskItem, str, strIndex)) {
                            matchNextMask = true;
                            break;
                        }
                        // Move to the next mask item
                        nextMaskFromIndex = indexOf(maskItems as MaskItem[], nextMaskItem, nextMaskFromIndex);
                    }

                    // The current character matches a next mask item and minimum is reached, stop matching
                    if (matchNextMask && matchCount >= min) break;
                }

                // Move to the next character in the string
                strIndex++;

                // Update cursor position
                updateCursor($mask, strIndex);
            }
        }
        // There are characters to test against the mask item
        else if (isString(maskItem)) {

            // Add the mask item to the output
            $mask[OUTPUT] += maskItem;

            // Move the string index forward if the character matches the mask item
            if (str[strIndex] == maskItem) strIndex++;

            // Update cursor position
            updateCursor($mask, strIndex);
        }
    }
}

let getNextMask = (maskItems: MaskItem[], fromIndex: number) => {
    for (let i = fromIndex; i < size(maskItems); i++) {
        let maskItem = maskItems[i];
        if (isArray(maskItem)) {
            return maskItem as MaskCharacter;
        }
    }
}

let matchMaskCharacter = (maskChar: MaskCharacter, str: string, fromIndex: number) => {
    let matches: boolean = false;

    // Dynamic mask character
    if (isArray(maskChar)) {
        let [charFn, min, max] = maskChar;

        if (isFunction(charFn) && isNumber(min) && isNumber(max)) {
            let matchCount = 0;
            let strLength = size(str);

            // Match characters until max is reached or string ends
            for (let i = fromIndex; i < strLength && matchCount < max; i++) {
                // Mask character matches
                if (charFn(str[i])) {
                    matchCount++;
                }
            }

            matches = matchCount > 0 && matchCount >= min;
        }
    }

    return matches;
}

let money = ($options: {thousands?: string, decimal?: string, precision?: number} = {}) => ($mask: MaskContext) => {

    let str = $mask[VALUE];
    let strLength = size(str);

    // Get the mask options
    let thousands = getProp($options, 'thousands', ',');
    let decimal = getProp($options, 'decimal', '.');
    let precision = getProp($options, 'precision', 2);

    // Make sure the decimal separator is different from the thousands separator
    if (decimal == ',') thousands = '.';
    if (thousands == '.') decimal = ',';

    let isNegative = false;
    let inDecimal = false;
    let integerIndexes: number[] = [];
    let decimalIndexes: number[] = [];

    let [isCharNumber] = number();

    for (let i = 0; i < strLength; i++) {

        // Negative number
        if (str[i] == '-') {
            if (!size(integerIndexes) && !size(decimalIndexes))
                isNegative = true;
        }
        // Decimal part
        else if (inDecimal) {
            if (size(decimalIndexes) < precision && isCharNumber(str[i])) {
                arrayAdd(decimalIndexes, i);
            }
        }
        // Integer part
        else {
            // Start of decimal part
            if (str[i] == decimal) {
                inDecimal = true;
            }
            // Integer part
            else if (isCharNumber(str[i])) {

                // Replace leading zero
                if (size(integerIndexes) == 1 && str[integerIndexes[0]] == '0') {
                    integerIndexes[0] = i;
                }
                // Add integer index
                else {
                    arrayAdd(integerIndexes, i);
                }

            }
        }
    }

    $mask[OUTPUT] = isNegative ? '-' : '';
    let integerSize = size(integerIndexes);

    $mask[CURSOR_UPDATED] = false;

    // Mask the integer part with thousands separator and update cursor position
    for (let i = 0; i < integerSize; i++) {

        // Add the thousands separator every 3 numbers
        if (i > 0 && (integerSize - i) % 3 == 0) {
            $mask[OUTPUT] += thousands;
        }

        // Add the integer character
        $mask[OUTPUT] += str[integerIndexes[i]];

        // Update cursor position
        updateCursor($mask, integerIndexes[i] + 1);
    }

    // Add decimal character to output
    $mask[OUTPUT] += inDecimal ? decimal : '';

    // Mask the decimal part and update cursor position
    for (let i = 0; i < size(decimalIndexes); i++) {

        $mask[OUTPUT] += str[decimalIndexes[i]];

        // Update cursor position
        updateCursor($mask, decimalIndexes[i] + 1);
    }

    return $mask;
}

let updateCursor = ($mask: MaskContext, fromIndex: number) => {
    if (!$mask[CURSOR_UPDATED]) {
        // The initial cursor position
        let cursor = $mask[CURSOR];

        // Keep the cursor at the start if it was there
        if (cursor == 0) $mask[CURSOR_UPDATED] = true;
    
        // Move the cursor forward
        else if (cursor <= fromIndex) {
            $mask[CURSOR_UPDATED] = true;
            $mask[CURSOR] = size($mask[OUTPUT]);
        }
    }
}

/**
 * Get min and max quantifiers with defaults
 * - If min is not a number or less than 0, it defaults to 1.
 * - If max is not a number or less than min, it defaults to min. Unless min is 0, then it defaults to 1.
 * 
 * @param min Minimum quantifier (default: 1)
 * @param max Maximum quantifier (default: 1)
 * 
 * @returns `{ min: number, max: number }`
 */
let minMax = (min: number = 1, max: number = 1): [number, number] => {
    min = isNumber(min) && min >= 0 ? min : 1;
    max = isNumber(max) && max > min ? max : min > 0 ? min : 1;
    return [min, max];
}

/** Makes a character or regex a MaskCharacter */
let char = (_char: string[] | RegExp, min?: number, max?: number): MaskCharacter => {

    // Is regex or array of single-character strings
    if (!(isRegExp(_char) || (isArray(_char) && every(_char as string[], c => isString(c) && size(c) == 1)))) {
        return logError('Invalid mask character definition. Expected an array of characters or a regular expression.');
    }

    let testChar = isArray(_char)
        ? (char: string) => has(_char as string[], char)
        : (char: string) => {
            let regex = _char as RegExp;
            regex.lastIndex = 0;
            return test(char, regex);
        };

    return [testChar, ...minMax(min, max)];
}
/** Special helper for letter test */
let letter = (min?: number, max?: number) => char(/\p{L}/u, min, max);
/** Special helper for number test */
let number = (min?: number, max?: number) => char(/\p{Nd}/u, min, max);
/** Special helper for alphanumeric test */
let alpha = (min?: number, max?: number) => char(/[\p{L}\p{Nd}]/u, min, max);

// First name, last name, example: b-mask="[letter(), ' ', letter()]"
// Master card example: b-mask="[number(4), ' ', number(4), ' ', number(4), ' ', number(4)]"
// Money example: b-mask="money({ thousands: ',', decimal: '.', precision: 2 })"
export let maskDirective: Directive = [B_+MASK, hydrateMask];