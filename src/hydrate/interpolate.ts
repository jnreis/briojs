import { ObjectType } from "./index.d";

import { scope } from ".";
import { findDelimitedContent } from "../tools";

type DelimitedContent = {
    start: number;
    end: number;
    content: string;
};

type Options = {
    wrap?: boolean;
    startDelimiter?: string;
    endDelimiter?: string;
};

export function interpolate(input: string, scopes: string[], options: Options = {}) {
    const { wrap = false, startDelimiter = "${", endDelimiter = "}" } = options;

    if (wrap) input = startDelimiter + input + endDelimiter;

    const interpolated: ObjectType = {};
    const delimitedContent = findDelimitedContent(input, startDelimiter, endDelimiter, true);

    const topItems = new Map<number, DelimitedContent>();
    let output = input;
    let usedProps = false;

    delimitedContent.forEach((item, index) => {
        let content = item.content;
        let indexes = [];

        // Top items
        topItems.forEach((topItem, topIndex) => {
            if (topItem.start > item.start && topItem.end < item.end) {
                topItems.delete(topIndex);
            }
        });
        topItems.set(index, item);

        // Replace the delimited content with placeholders
        for (let nestedIndex = index - 1; nestedIndex >= 0; nestedIndex--) {
            const nestedItem = delimitedContent[nestedIndex];
            if (content.includes(nestedItem.content)) {
                content = content.replace(nestedItem.content, `#${nestedIndex}`);
                indexes.push(nestedIndex);
            } else {
                break;
            }
        }

        // Process the template
        content = content.replace(
            // /\b(\w+)\b(?=(?:(?:[^'`"]*[`'"]){2})*[^'`"]*$)/g,
            /(?<!\.)\b(\w+)\b(?!:)(?=(?:(?:[^'`"]*[`'"]){2})*[^'`"]*$)/g,
            // new RegExp(pattern, 'g'),
            (match, prop) => {
                for (const id of scopes) {
                    if (prop in scope[id]) {
                        usedProps = true;
                        return `$sc['${id}']['${prop}']`;
                    }
                }
                return match; // If variable not found in scopes, return unchanged
            }
        );

        // Replace the placeholders with the processed content
        for (let nestedIndex = index - 1; nestedIndex >= 0; nestedIndex--) {
            const nestedItem = delimitedContent[nestedIndex];
            if (content.includes(`#${nestedIndex}`)) {
                content = content.replace(`#${nestedIndex}`, interpolated[nestedItem.content].content);
            } else {
                break;
            }
        }

        // Save interpolated content
        interpolated[item.content] = { content, indexes };
    });

    // Put the string back together
    topItems.forEach((item) => {
        output = output.replace(item.content, interpolated[item.content].content);
    });

    if (wrap) output = output.slice(2, -1);

    return {
        output,
        usedProps,
    };
}