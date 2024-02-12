import { has } from '.';

export function hasSubstring(haystack: string, needle: string, caseInsensitive = false) {
    if (caseInsensitive) {
        return has(lower(haystack), lower(needle));
    }
    return has(haystack, needle);
}

export function lower(str: string) {
    return str.toLowerCase();
}

export function upper(str: string) {
    return str.toUpperCase();
}

export function capitalize(str: string) {
    return upper(str[0]) + str.slice(1);
}

export function reverse(str: string) {
    return str.split('').reverse().join('');
}

// Check if a string is a function
export function isStringFn(value: string) {
    return /^(function\s*\([^)]*\)\s*{[^}]*}|(?:\([^()]*\)|\w+)\s*=>)/.test(value.trim());
}

export function validateBracketPair(str: string) {
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

export function findDelimitedContent(
    input: string,
    startDelimiter: string,
    endDelimiter: string,
    includeDelimiters = false
) {
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

export function findTopmostDelimitedContent(
    input: string,
    startDelimiter: string,
    endDelimiter: string
) {
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

export function replaceSubstring(subject: string, startsAt: number, endsAt: number, replacement: string) {
    return subject.slice(0, startsAt) + replacement + subject.slice(endsAt);
}
