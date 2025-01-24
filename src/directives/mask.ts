import { saveCleanup } from "../app";
import { entries, has, logError, size, slice, wait } from "../tools";
import { arrayAdd, find, indexOf, join } from "../tools/array";
import { CAN_ONLY_BE_USED_ON, DIRECTIVE, ELEMENT, HOOKS, INPUT, MASK, MASK_TOKEN, OPTIONS, SELECTION_START, TEXTAREA, TOKENS, VALUE } from "../tools/constants";
import { emit, listen } from "../tools/dom";
import { getKey, getKeys, newRegExp } from "../tools/object";
import { match, replace, split, startsWith } from "../tools/string";

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
let CHARACTER: 'character' = 'character';
let QUANTIFIER: 'quantifier' = 'quantifier';
let IS_TOKEN: 'isToken' = 'isToken';
let IS_OPTIONAL: 'isOptional' = 'isOptional';
let IS_MULTIPLE: 'isMultiple' = 'isMultiple';
let PARTS: 'parts' = 'parts';

/**
 * TODO: The b-mask directive will be re-written taking as inspiration the Maska library.
 * 
 * @option tokens
 * @option decimal   (default: `.`)
 * @option thousands (default: `,`)
 * @option precision (default: `2`)
 */
export let hydrateMask = (vnode: VNode, attrName: string, attrValue: string, tools: HydrationTools) => {

    let $el: any = vnode.el;

    let [setHook, playHook] = tools[HOOKS];

    // If the element has no value or selectionStart properties, return
    if (!(VALUE in $el && SELECTION_START in $el))
        return logError('the', attrName, DIRECTIVE, CAN_ONLY_BE_USED_ON, TEXTAREA, ELEMENT + 's and textual', INPUT, 'types (text, email, etc.).');

    // The mask to apply to the input value
    let mask = attrValue;

    // Dynamic mask function
    let dynamicMask: MaskFunction | undefined;
    if (tools.mask[mask]) dynamicMask = tools.mask[mask];

    // Options
    let options = vnode[OPTIONS][attrName] || {};

    // Updated mask object
    let $mask: MaskContext = {
        ...options,
        tokens: {...tools[MASK_TOKEN], ...options[TOKENS]},
        mask,
        [VALUE]: '',
        [CURSOR]: $el[SELECTION_START],
        [PARTS]: [],
        [OUTPUT]: '',
    };

    setHook($el, attrName, () => {

        // Get the current value of the input
        $mask[VALUE] = $el[VALUE];

        // If the value has not changed, return
        if ($mask[VALUE] != $mask[OUTPUT]) {

            // Reset the mask parts
            $mask[PARTS] = [];

            // Get the current cursor position
            $mask[CURSOR] = $el[SELECTION_START];

            // If a dynamic mask is provided, use it to generate the mask
            if (dynamicMask) dynamicMask($mask);

            applyMask($mask);

            // Apply the mask to the value and save it for the next iteration
            $el[VALUE] = $mask[OUTPUT];

            // Set the cursor position
            $el.setSelectionRange($mask[CURSOR], $mask[CURSOR]);

            // Emit the mask event
            emit($el, MASK, $mask);
        }

    });

    wait(() => playHook($el, attrName), 7);

    // This listener will `capture` and process the input value before any other listeners.
    let cleanup = listen($el, INPUT, () => playHook($el, attrName), true);

    // Save cleanup function
    saveCleanup(vnode, cleanup);
}

// /** Mask Item: [character, quantifier, isToken, isOptional, isMultiple] */
// type MaskItem = [string, number, boolean, boolean, boolean];

/**
 * Split a mask into an array of characters and quantifiers
 * @returns `[character, quantifier, isToken, isOptional, isMultiple][]`
 */
let splitMask = (mask: string, tokens: ObjectType) => {

    let result: MaskItem[] = [];

    let ESCAPE = '\\';

    for (let index = 0; index < size(mask); index++) {

        // Get the character at the current index
        let character = mask[index];

        /** Mask Item: [character, quantifier, isToken, isOptional, isMultiple] */
        let maskItem: MaskItem = {
            [CHARACTER]: character,
            [QUANTIFIER]: 1,
            [IS_TOKEN]: false,
            [IS_OPTIONAL]: false,
            [IS_MULTIPLE]: false,
        };

        // Skip escape characters
        if (character != ESCAPE || character == ESCAPE && mask[index + 1] == ESCAPE) {

            // Check if the character is a token and not escaped
            if (has(getKeys(tokens), character) && (mask[index - 1] != ESCAPE || mask[index - 2] == ESCAPE)) {

                // Get the quantifier, if any
                let matchQuantifier = match(slice(mask, index + 1) as string, /^\d+/)

                // If a quantifier was found
                if (matchQuantifier) {
                    let quantifier = matchQuantifier[0];

                    // Move the index to the end of the quantifier to skip it
                    index += size(quantifier);

                    // Add the quantifier to the mask item array
                    // Note: + (multiple) means all characters that match the token's regex until the next mask character or another token is found
                    // Note: ? (optional) means 0 or 1 character that matches the token's regex until the next mask character or another token is found
                    maskItem[QUANTIFIER] = +quantifier;
                }

                // The character is a token
                maskItem[IS_TOKEN] = true;

                // Is the next character ? or +
                let nextChar = mask[index + 1];

                // The token is optional or multiple
                if (nextChar == '?' || nextChar == '+') {
                    maskItem[IS_OPTIONAL] = nextChar == '?';
                    maskItem[IS_MULTIPLE] = nextChar == '+';
                    index++;
                }
            }

            // Save the mask token
            arrayAdd(result, maskItem);
        }
    }

    return result;
}

/**
 * Get the next non-optional mask item
 */
let getNextRequiredMaskItem = (maskItems: MaskItem[], index: number): MaskItem | undefined =>
    find(slice(maskItems, index + 1) as MaskItem[], maskItem => !maskItem[IS_OPTIONAL]);

let matchMaskItem = (remainingInput: string, maskItem: MaskItem, tokens: MaskTokens) => {

    let index = -1;

    if (maskItem) {
        let char = maskItem[CHARACTER];

        if (maskItem[IS_TOKEN]) {
            let matches = match(remainingInput, tokens[char]);
            if (matches) {
                index = matches.index!;
            }
        }
        else index = indexOf(remainingInput, char);
    }

    return index;
}

let applyMask = ($mask: MaskContext) => {

    let tokens = $mask[TOKENS];
    let input = $mask[VALUE];
    let cursor = $mask[CURSOR];

    let maskItems = splitMask($mask[MASK], tokens);

    let maskedOutput = '';

    let remainingInput = input;

    let cursorBefore = slice(input, cursor) as string;

    // Iterate over the mask items
    for (let [index, maskItem] of entries(maskItems)) {

        let character = maskItem[CHARACTER];
        let quantifier = maskItem[QUANTIFIER];

        if (maskItem[IS_TOKEN]) {
            if (quantifier > 0) {

                // There are no remaining characters to match the token's regex
                if (!remainingInput) break;

                /**
                 * Quantifiers: defaults to 1 if no quantifier is provided.
                 * Fixed    (n): match exactly n characters. Don't stop until the required number of characters is reached.
                 * Optional (?): match no more than n characters. Stop if the character being processed matches the next non-optional mask item.
                 * Multiple (+): match at least n characters. Only stop after the required number of characters is reached and the character being processed matches the next non-optional mask item.
                 */

                // All the characters required by the token's quantifier
                let unmaskedChars = '';

                // let [isNextToken, nextToken] = maskItems[+index + 1] || [false, ''];

                while (remainingInput && (quantifier > 0 || maskItem[IS_MULTIPLE])) {

                    // The token matched enough characters
                    let isSufficient = maskItem[IS_OPTIONAL] || quantifier < 1;

                    // The index of the first character that matches the token's regex
                    let charIndex = matchMaskItem(remainingInput, maskItem, tokens);

                    // Look ahead at the next required mask item
                    let nextRequiredMaskItem = isSufficient && charIndex > 0 && getNextRequiredMaskItem(maskItems, +index);
                    let nextRequiredMaskItemIndex = matchMaskItem(remainingInput, nextRequiredMaskItem, tokens);

                    // The remaining input doesn't contain the character
                    // The next required mask matches a character before the character matched by the current mask item
                    if (charIndex < 0 || (nextRequiredMaskItemIndex >= 0 && charIndex > nextRequiredMaskItemIndex)) {
                        // The input is insufficient. Stop the process.
                        if (!isSufficient) remainingInput = '';

                        // Go to the next mask item
                        break;
                    }

                    // The character is at the beginning of the input (index 0)
                    if (!charIndex) {

                        // Save unmasked character
                        unmaskedChars += remainingInput[0];

                        // Decrement the quantifier to stop the loop when the required number of characters is reached
                        quantifier--;
                    }

                    // Remove the first character from the remaining input
                    remainingInput = slice(remainingInput, 1) as string;

                    // Get the cursor position
                    if (cursorBefore == remainingInput) {
                        cursor = size(maskedOutput + unmaskedChars);
                    }
                }

                maskedOutput += unmaskedChars;
                maskItem[VALUE] = unmaskedChars;
            }
        }
        // There are characters to test against the mask item
        else if (remainingInput) {

            // Get the cursor position
            if (cursorBefore == remainingInput) {
                cursor = size(maskedOutput);
            }

            maskedOutput += character;
            maskItem[VALUE] = character;

            // Input starts with the static character
            if (remainingInput[0] == character) {
                remainingInput = slice(remainingInput, 1) as string;
            }
        }
    }

    // Preserve the cursor position if it's at the beginning or end of the input
    $mask[CURSOR] = $mask[CURSOR] == 0 ? 0 : $mask[CURSOR] == size($mask[VALUE]) ? size(maskedOutput) : cursor;
    $mask[OUTPUT] = maskedOutput;
    $mask[PARTS] = maskItems;
}

export let money = ($mask: MaskContext) => {

    let value = $mask[VALUE];

    // Get the mask options
    let decimal = getKey($mask, 'decimal', '.');
    let thousands = getKey($mask, 'thousands', ',');
    let precision = getKey($mask, 'precision', 2);

    // Make sure the decimal separator is different from the thousands separator
    if (decimal == ',') thousands = '.';
    if (thousands == '.') decimal = ',';

    // Split on the decimal separator
    let valueParts = split(value, decimal);

    // Get the integer part
    let integer = valueParts[0];

    // Determine if the integer is negative
    let isNegative = startsWith(integer, '-');

    // Remove non-numeric characters
    integer = replace(integer, /\D/g, '');

    // Remove leading zeros, but keep at least one zero
    // Scenarios: '007' = '7', '000' = '0', '' = ''
    integer = integer ? replace(integer, /^0+/, '') || '0' : integer;

    // Check if the value has decimals
    let hasDecimals = size(valueParts) > 1;

    // Join the decimals back together
    let decimals = hasDecimals ? join(slice(valueParts, 1) as string[], decimal) : '';

    // Get the size of the integer part
    let integerSize = size(integer);

    // Create the mask dynamically based on integer part and decimal precision
    let mask = isNegative ? '-' : '';

    // Add the integer part to the mask
    for (let i = 0; i < integerSize; i++) {

        // Add the thousands separator every 3 numbers
        if (i > 0 && (integerSize - i) % 3 == 0) mask += thousands;

        // Add the number
        mask += '#';
    }

    let tokens = $mask[TOKENS];

    value = isNegative ? '-' + integer : integer;

    // Add the decimal part to the mask, if precision is greater than 0.
    if (precision > 0) {

        // Add decimal token
        tokens[decimal] = newRegExp(`\\${decimal}`);

        // Add decimals to the value
        if (hasDecimals) value += decimal + decimals;

        // Add decimals to the mask
        mask += decimal + '#' + precision;
    }

    $mask.mask = mask;

    // Add negative token
    if (isNegative) tokens['-'] = /-/;

    // Ensure the # token is only numbers
    tokens['#'] = /\d/;

    // Replace the unwanted characters with an invalid character (∅) to remove them without changing the cursor position
    let valueIndex = 0;
    let newValue = '';
    for (let char of $mask[VALUE]) {
        if (char == value[valueIndex]) {
            newValue += char;
            valueIndex++;
        }
        else newValue += '∅';
    }

    $mask[VALUE] = newValue;
}

// let stringDiff = (previousValue: string, value: string) => {

//     let v = 0;
//     let p = 0;

//     // The change subtracted characters from the previous value
//     let subtraction = size(previousValue) - size(value);
//     let subtractedChars: [number, number, string][] = [];

//     // [previousValueIndex, valueIndex]
//     let changedChars: [number, number, string][] = [];

//     let unchangedChars: [number, number, string][] = [];

//     // Example: previousValue = "777-333-4444", value = "777-3335544"

//     /**
//      * The diff status of each character:
//      * @index `0`   character
//      * @index `1`   previousValue index
//      * @index `2`   value index
//      * @index `3`   0 = unchanged, 1 = changed, 2 = deleted
//      */
//     let chars: [string, number, number, -1|0|1][] = [];

//     while (v < size(value)) {
//         if (value[v] != previousValue[p]) {
//             // The character was deleted
//             if (subtraction > 0) {
//                 // Save the index of the subtracted character
//                 arrayAdd(chars, [previousValue[p], value[v], p, v, 2]);
//                 // Decrement the subtraction counter to properly count the number of characters that were subtracted
//                 subtraction--;
//                 // This will make the next `previousValue` character match the current `value` character
//                 v--;
//             }
//             // Save the index of the changed character
//             else arrayAdd(chars, [previousValue[p], value[v], p, v, 1]);
//         }
//         // // The character was not changed
//         // else arrayAdd(chars, [previousValue[p], value[v], p, v, 0]);

//         v++;
//         p++;
//     }

//     return chars;
// }

// console.log('stringDiff:', stringDiff('123-456-7890', '123-456-3890'));

/**
 * Make sure that the deleted character is a valid character.
 * When one character is deleted and it's not a valid character, remove characters before it until a valid character is found and removed.
 * A valid character is a character that matches a wildcard.
 */
// let deleteValidChar = (previousValue: string, value: string, tokens: ObjectType) => {

//     let previousValueSize = size(previousValue);
//     let tokenKeys = getKeys(tokens);

//     let previousValueIndex = 0;
//     let valueIndex = 0;

//     while (previousValueIndex <= previousValueSize) {

//         previousValueIndex++;
//         valueIndex++;

//         // A character was changed
//         if (previousValue[previousValueIndex] != value[valueIndex]) {

//             // Is the new character valid or was the previous character valid?
//             let isValidChange = some(tokenKeys, token => test(value[valueIndex], tokens[token]) || test(previousValue[previousValueIndex], tokens[token]));

//             // A valid character was changed
//             if (some(tokenKeys, token => test(previousValue[previousValueIndex], tokens[token]))) break;

//             // Remove the first valid character before the changed character
//             for (let j = i - 1; j >= 0; j--) {
//                 // A valid character was found
//                 if (some(tokenKeys, token => tokens[token](previousValue, j))) {
//                     // Remove a valid character
//                     value = slice(value, 0, j) as string + slice(value, i) as string;
//                     break;
//                 }
//             }
//         }
//     }

//     return value;
// }



// setTimeout(() => {

    // Options: eager: shows static characters before they are typed, e.g. #-# will show 1- when 1 is typed.

    // let str = '(#3) #3-#4'; // "(777) 333-4444"
    //     str = '&+ &+'; // "John Doe"
    //     str = '#+ *+ &2'; // "001 Main St", "123 Lake Dr"

//     let mask = '&+ *+';
//     applyMask(mask, 'Ângela Reis', tokens);
// });
