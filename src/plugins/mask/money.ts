import { size, slice } from "../../tools";
import { join } from "../../tools/array";
import { TOKENS, VALUE } from "../../tools/constants";
import { getKey, newRegExp } from "../../tools/object";
import { replace, split, startsWith } from "../../tools/string";

let money = ($mask: MaskObject) => {

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

    // console.log(
    //     'MONEY',
    //     '\n- mask:', mask,
    //     '\n- value:', value,
    //     '\n- new value:', newValue,
    //     '\n- cursor:', $mask[CURSOR],
    // );
}

try {
    // @ts-ignore
    $set.mask('money', money);
} catch {
    console.error('Could not set the "money" mask.');
}