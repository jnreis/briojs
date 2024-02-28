import { has } from '.';
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

        pairs.forEach(pair => {
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
    while (index < subject.length) {
        if (subject.substring(index, index + startingWith.length) === startingWith) {
            pairs.push([index, -1]);
            lastDelimiter = startingWith;
            index += startingWith.length;
        }
        else if (subject.substring(index, index + endingWith.length) === endingWith) {
            if (lastDelimiter === endingWith) {
                // Find the last opening delimiter that doesn't have a closing delimiter
                for (let i = pairs.length - 1; i >= 0; i--) {
                    if (pairs[i][1] === -1) {
                        // If there is a last opening delimiter, set its closing delimiter
                        pairs[i][1] = index + endingWith.length;
                        break;
                    }
                }
            }
            // Check if there is a last opening delimiter that doesn't have a closing delimiter
            else if (pairs.length > 0 && pairs[pairs.length - 1][1] === -1) {
                pairs[pairs.length - 1][1] = index + endingWith.length;
            }

            lastDelimiter = endingWith;
            index += endingWith.length;
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

    pairs.forEach(pair => {
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

    for (let i = 0; i < input.length; i++) {
        if (input.substring(i, i + startDelimiter.length) === startDelimiter) {
            stack.push(i);
        }
        else if (input.substring(i, i + endDelimiter.length) === endDelimiter) {
            if (stack.length > 0) {
                let start = stack.pop() as number;
                let end = i;
                let pair = includeDelimiters
                    ? { start, end: end + endDelimiter.length }
                    : { start: start + startDelimiter.length, end };
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

    items.forEach((item) => {
        if (topItems.length) {
            let lastItem = topItems[topItems.length - 1];
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
