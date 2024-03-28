import { has, size } from '.';
import { arrayAdd, each } from './array';
import { FUNCTION } from './constants';

export let regexAlpha = /^[a-z]/i;
export let regexNumeric = /^[0-9]/;

export let hasSubstring = (haystack: string, needle: string, caseInsensitive = false) => {
    if (caseInsensitive) {
        return has(lower(haystack), lower(needle));
    }
    return has(haystack, needle);
}

export let lower = (str: string) => str.toLowerCase();

export let upper = (str: string) => str.toUpperCase();

export let capitalize = (str: string) => upper(str[0]) + str.slice(1);

export let split = (str: string, separator: string | RegExp, limit?: number | undefined) => str.split(separator, limit);

export let reverse = (str: string) => split(str, '').reverse().join('');

export let lastIndex = (str: string, search: string) => str.lastIndexOf(search);

export let trim = (str: string) => str.trim();

export let startsWith = (str: string, search: string) => str.startsWith(search);

export let test = (str: string, regex: RegExp) => regex.test(str);

export let isStringNumeric = (value: string) => test(value, regexNumeric);

export let isStringAlpha = (value: string) => test(value, regexAlpha);

// Check if a string is a function
export let isStringFunction = (value: string) =>
    test(trim(value), /^(function\s*\([^)]*\)\s*{[^}]*}|(?:\([^()]*\)|\w+)\s*=>)/);

export let isStringArrowFunction = (value: string) => test(trim(value), /^(?:\([^()]*\)|\w+)\s*=>/);

export let makeFunctionAnonymous = (fn: Function) => {
    let name = fn.name;
    let body = fn.toString();

    return test(body, new RegExp(`${name}\\s*\\(`)) ? body.replace(name, FUNCTION) : body;
};

export let validateBracketPair = (str: string) => {
    let pairs = ['{}', '[]', '()'];
    let found = true;

    while (found) {
        found = false;

        each(pairs, pair => {
            if (has(str, pair)) {
                str = str.replace(pair, '');
                found = true;
            }
        });
    }

    return split(str, '');
}

export let getDelimitersIndexes = (subject: string, startingWith: string, endingWith: string) => {
    let pairs: number[][] = []
    let lastDelimiter = '';

    let index = 0;
    while (index < size(subject)) {
        if (subject.substring(index, index + size(startingWith)) === startingWith) {
            arrayAdd(pairs, [index, -1]);
            lastDelimiter = startingWith;
            index += size(startingWith);
        }
        else if (subject.substring(index, index + size(endingWith)) === endingWith) {
            if (lastDelimiter === endingWith) {
                // Find the last opening delimiter that doesn't have a closing delimiter
                for (let i = size(pairs) - 1; i >= 0; i--) {
                    if (pairs[i][1] === -1) {
                        // If there is a last opening delimiter, set its closing delimiter
                        pairs[i][1] = index + size(endingWith);
                        break;
                    }
                }
            }
            // Check if there is a last opening delimiter that doesn't have a closing delimiter
            else if (size(pairs) > 0 && pairs[size(pairs) - 1][1] === -1) {
                pairs[size(pairs) - 1][1] = index + size(endingWith);
            }

            lastDelimiter = endingWith;
            index += size(endingWith);
        }
        // Skip the next character
        else {
            index++;
        }
    };

    return pairs;
}

export let getDelimitedContent = (subject: string, startingWith: string, endingWith: string) => {
    let content: string[] = [];
    let pairs = getDelimitersIndexes(subject, startingWith, endingWith);

    each(pairs, pair => {
        arrayAdd(content, subject.substring(pair[0], pair[1]));
    });

    return content;
}

export let findDelimitedContent = (input: string, startDelimiter: string, endDelimiter: string, includeDelimiters = false) => {
    let pairs: any[] = [];
    let stack: number[] = [];

    for (let i = 0; i < size(input); i++) {
        if (input.substring(i, i + size(startDelimiter)) === startDelimiter) {
            arrayAdd(stack, i);
        }
        else if (input.substring(i, i + size(endDelimiter)) === endDelimiter) {
            if (size(stack) > 0) {
                let start = stack.pop() as number;
                let end = i;
                let pair = includeDelimiters
                    ? { start, end: end + size(endDelimiter) }
                    : { start: start + size(startDelimiter), end };
                let content = input.substring(pair.start, pair.end);
                arrayAdd(pairs, { ...pair, content });
            }
            // You may want to handle the case where a closing delimiter doesn't have a matching opening delimiter.
        }
    }

    // You may want to handle the case where there are unmatched opening delimiters.

    return pairs;
}

export let findTopmostDelimitedContent = (input: string, startDelimiter: string, endDelimiter: string) => {
    let items = findDelimitedContent(input, startDelimiter, endDelimiter);
    let topItems: { start: number; end: number; content: string }[] = [];

    each(items, (item) => {
        if (size(topItems)) {
            let lastItem = topItems[size(topItems) - 1];
            if (lastItem.start > item.start && lastItem.end < item.end) {
                topItems.pop();
            }
        }
        arrayAdd(topItems, item);
    });

    return topItems;
}

export let replaceSubstring = (subject: string, startsAt: number, endsAt: number, replacement: string) =>
    subject.slice(0, startsAt) + replacement + subject.slice(endsAt);

export let alphaNumericOnly = (str: string) => str.replace(/[^a-z0-9]/gi, '');

export let removeCharacterAtIndex = (str: string, index: number) => {
    // Return the original string if the index is out of bounds
    if (index < 0 || index >= str.length) return str;

    // Use string concatenation to remove the character at the specified index
    return replaceSubstring(str, index, index + 1, '');
}