import { has, size } from '.';
import { each } from './array';
import { FUNCTION } from './constants';

export let hasSubstring = (haystack: string, needle: string, caseInsensitive = false) => {
    if (caseInsensitive) {
        return has(lower(haystack), lower(needle));
    }
    return has(haystack, needle);
}

export let lower = (str: string) => {
    return str.toLowerCase();
}

export let upper = (str: string) => {
    return str.toUpperCase();
}

export let capitalize = (str: string) => {
    return upper(str[0]) + str.slice(1);
}

export let reverse = (str: string) => {
    return str.split('').reverse().join('');
}

export let lastIndex = (str: string, search: string) => {
    return str.lastIndexOf(search);
}

export let trim = (str: string) => {
    return str.trim();
}

export let startsWith = (str: string, search: string) => {
    return str.startsWith(search);
}

// Check if a string is a function
export let isStringFunction = (value: string) => {
    return /^(function\s*\([^)]*\)\s*{[^}]*}|(?:\([^()]*\)|\w+)\s*=>)/.test(trim(value));
}

export let isStringArrowFunction = (value: string) => {
    return /^(?:\([^()]*\)|\w+)\s*=>/.test(trim(value));
}

export let makeFunctionAnonymous = (fn: Function) => {
    let name = fn.name;
    let body = fn.toString()
    
    return new RegExp(`${name}\\s*\\(`).test(body) ? body.replace(name, FUNCTION) : body;
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

    return str.split('');
}

export let getDelimitersIndexes = (subject: string, startingWith: string, endingWith: string) => {
    let pairs: number[][] = []
    let lastDelimiter = '';

    let index = 0;
    while (index < size(subject)) {
        if (subject.substring(index, index + size(startingWith)) === startingWith) {
            pairs.push([index, -1]);
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
        content.push(subject.substring(pair[0], pair[1]));
    });

    return content;
}

export let findDelimitedContent = (
    input: string,
    startDelimiter: string,
    endDelimiter: string,
    includeDelimiters = false
) => {
    let pairs = [];
    let stack = [];

    for (let i = 0; i < size(input); i++) {
        if (input.substring(i, i + size(startDelimiter)) === startDelimiter) {
            stack.push(i);
        }
        else if (input.substring(i, i + size(endDelimiter)) === endDelimiter) {
            if (size(stack) > 0) {
                let start = stack.pop() as number;
                let end = i;
                let pair = includeDelimiters
                    ? { start, end: end + size(endDelimiter) }
                    : { start: start + size(startDelimiter), end };
                let content = input.substring(pair.start, pair.end);
                pairs.push({ ...pair, content });
            }
            // You may want to handle the case where a closing delimiter doesn't have a matching opening delimiter.
        }
    }

    // You may want to handle the case where there are unmatched opening delimiters.

    return pairs;
}

export let findTopmostDelimitedContent = (
    input: string,
    startDelimiter: string,
    endDelimiter: string
) => {
    let items = findDelimitedContent(input, startDelimiter, endDelimiter);
    let topItems: { start: number; end: number; content: string }[] = [];

    each(items, (item) => {
        if (size(topItems)) {
            let lastItem = topItems[size(topItems) - 1];
            if (lastItem.start > item.start && lastItem.end < item.end) {
                topItems.pop();
            }
        }
        topItems.push(item);
    });

    return topItems;
}

export let replaceSubstring = (subject: string, startsAt: number, endsAt: number, replacement: string) => {
    return subject.slice(0, startsAt) + replacement + subject.slice(endsAt);
}

export let alphaOnly = (str: string) => {
    return str.replace(/[^a-zA-Z0-9]/g, '');
}