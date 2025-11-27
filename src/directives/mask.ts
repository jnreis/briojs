import { saveCleanup } from "../app";
import { entries, logError, size } from "../tools";
import { arrayAdd, each, indexOf } from "../tools/array";
import { B_, CAN_ONLY_BE_USED_ON, DIRECTIVE, ELEMENT, INPUT, MASK, SELECTION_START, TEXTAREA, VALUE } from "../tools/constants";
import { emit, listen, nextFrame } from "../tools/dom";
import { getProp } from "../tools/object";
import { split, test } from "../tools/string";
import { isArray, isFunction, isNumber, isString } from "../tools/typeCheck";

/**
 *  This is what I'm thinking for my mask directive:
 *
 *  Note 1: the mask syntax is purposely designed to be short, simple and easy to understand.
 *  Note 2: for more complex scenarios, a function that returns the mask can be used.
 *
 *  Default Tokens: Note that the tokens object will be made available so tokens may be added or removed.
 *  # = numbers
 *  & = letters (unicode)
 *  * = letters and numbers (unicode)
 *
 *  Quantifiers: Note that quantifiers only apply if the previous character is an unescaped token.
 *  + = all characters that match the regex until another token is found
 *  n = for example 3 would test each character until 3 characters matching the regex are found, if a character matches another token before 3 characters are matched it would return.
 *
 *  Escaping tokens and quantifiers:
 *  - Add "\\" before a token or quantifier to escape it. It will be treated as a regular character.
 *
 *  Examples:
 *  The mask "(#3) #3-#4" would take 7773334444 and turn into this (777) 333-4444. Or this mask "&+ &4" would be able to take in two works like John Doe.
 *
 *  The mask can be a string or a function that returns the string, which would allow for dynamic mask generation.
 */

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
export let hydrateMask = (bnode: BNode, attrName: string, attrValue: string) => {

    let $el: any = bnode.el;

    // If the element has no value or selectionStart properties, return
    if (!(VALUE in $el && SELECTION_START in $el))
        return logError('the', attrName, DIRECTIVE, CAN_ONLY_BE_USED_ON, TEXTAREA, ELEMENT + 's and textual', INPUT, 'types (text, email, etc.).');

    // Updated mask object
    let $mask: MaskContext = {
        exp: bnode.exec(bnode, attrValue, '$mask'),
        [VALUE]: '',
        [CURSOR]: $el[SELECTION_START],
        [UPDATE_CURSOR]: updateCursor,
        [CURSOR_UPDATED]: false,
        [OUTPUT]: '',
        char,
        letter,
        number,
        alpha,
        money,
    };

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
    nextFrame(_mask);

    // Save cleanup function
    // This listener will `capture` and process the input value before any other listeners.
    saveCleanup(bnode, listen($el, INPUT, _mask, true));
}

export let applyMask = ($mask: MaskContext) => {

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

    // Split static mask into individual characters
    each([...maskItems as MaskItem[]], (maskItem, index) => {
        if (isString(maskItem) && size(maskItem) > 1) {
            (maskItems as MaskItem[]).splice(index, 1, ...split(maskItem as string, ''));
        }
    });

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
let char = (_char: string | RegExp, min?: number, max?: number): MaskCharacter => {

    let testChar = isString(_char)
        ? (char: string) => char == _char
        : (char: string) => test(char, _char as RegExp);

    return [testChar, ...minMax(min, max)];
}
/** Special helper for letter test */
let letter = (min?: number, max?: number) => char(/\p{L}/u, min, max);
/** Special helper for number test */
let number = (min?: number, max?: number) => char(/\p{Nd}/u, min, max);
/** Special helper for alphanumeric test */
let alpha = (min?: number, max?: number) => char(/[\p{L}\p{Nd}]/u, min, max);

// Example: b-mask="#2-#2-#4"
export let maskDirective: Directive = [B_+MASK, hydrateMask];