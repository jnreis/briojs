import { has } from '.';

export const hasSubstring = (haystack: string, needle: string, caseInsensitive = false) => {
    if (caseInsensitive) {
        return has(lower(haystack), lower(needle));
    }
    return has(haystack, needle);
}

export const lower = (str: string) => {
    return str.toLowerCase();
}

export const upper = (str: string) => {
    return str.toUpperCase();
}

export const capitalize = (str: string) => {
    return upper(str[0]) + str.slice(1);
}

export const reverse = (str: string) => {
    return str.split('').reverse().join('');
}

export const trim = (str: string) => {
    return str.trim();
}

// Check if a string is a function
export const isStringFunction = (value: string) => {
    return /^(function\s*\([^)]*\)\s*{[^}]*}|(?:\([^()]*\)|\w+)\s*=>)/.test(trim(value));
}

export const isStringArrowFunction = (value: string) => {
    return /^(?:\([^()]*\)|\w+)\s*=>/.test(trim(value));
}

export const validateBracketPair = (str: string) => {
    const pairs = ['{}', '[]', '()'];
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

export const getDelimitersIndexes = (subject: string, startingWith: string, endingWith: string) => {
    const pairs: number[][] = []
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

export const getDelimitedContent = (subject: string, startingWith: string, endingWith: string) => {
    const content: string[] = [];
    const pairs = getDelimitersIndexes(subject, startingWith, endingWith);

    pairs.forEach(pair => {
        content.push(subject.substring(pair[0], pair[1]));
    });

    return content;
}

export const findDelimitedContent = (
    input: string,
    startDelimiter: string,
    endDelimiter: string,
    includeDelimiters = false
) => {
    const pairs = [];
    const stack = [];

    for (let i = 0; i < input.length; i++) {
        if (input.substring(i, i + startDelimiter.length) === startDelimiter) {
            stack.push(i);
        }
        else if (input.substring(i, i + endDelimiter.length) === endDelimiter) {
            if (stack.length > 0) {
                const start = stack.pop() as number;
                const end = i;
                const pair = includeDelimiters
                    ? { start, end: end + endDelimiter.length }
                    : { start: start + startDelimiter.length, end };
                const content = input.substring(pair.start, pair.end);
                pairs.push({ ...pair, content });
            }
            // You may want to handle the case where a closing delimiter doesn't have a matching opening delimiter.
        }
    }

    // You may want to handle the case where there are unmatched opening delimiters.

    return pairs;
}

export const findTopmostDelimitedContent = (
    input: string,
    startDelimiter: string,
    endDelimiter: string
) => {
    const items = findDelimitedContent(input, startDelimiter, endDelimiter);
    const topItems: { start: number; end: number; content: string }[] = [];

    items.forEach((item) => {
        if (topItems.length) {
            const lastItem = topItems[topItems.length - 1];
            if (lastItem.start > item.start && lastItem.end < item.end) {
                topItems.pop();
            }
        }
        topItems.push(item);
    });

    return topItems;
}

export const replaceSubstring = (subject: string, startsAt: number, endsAt: number, replacement: string) => {
    return subject.slice(0, startsAt) + replacement + subject.slice(endsAt);
}
