import { size, slice } from ".";
import { arrayAdd, map, some } from "./array";
import { $DATA, $EACH, $PROPS, $REFS, $SLOTS, $STORE, $TOOLS, CLASS, DELETE, INDEX, SUPER } from "./constants";
import { newSet } from "./object";
import { match, replace, split, trim } from "./string";

export const reserved = newSet([
    // ECMAScript reserved keywords
    "break", "case", "catch", CLASS, "const", "continue", "debugger", "default", DELETE, "do", "else",
    "export", "extends", "finally", "for", "function", "if", "import", "in", "instanceof", "let", "new", "return",
    SUPER, "switch", "this", "throw", "try", "typeof", "var", "void", "while", "with", "yield", "enum",
    "await", "implements", "package", "protected", "interface", "private", "public", "static", "null", "true", "false",
]) as Set<string>;

export let variableNameRegex = /^[a-z_$][\w$]*$/i;

export let findUsedButNotDeclaredVariables = (code: string) => {

    let identifierRegex = /[a-z_$][\w$]*/gi;

    let declared = newSet() as Set<string>;

    // 1. Capture declared variables/functions/params/imports
    let declarationRegexes = [
        /\b(?:var|let|const)\s+([a-z_$][\w$]*)/gi, // variable declarations
        /\bfunction\s+([a-z_$][\w$]*)/gi, // function declarations
        /\bclass\s+([a-z_$][\w$]*)/gi, // class declarations
        /\bimport\s+([a-z_$][\w$]*)/gi, // import statements
        /\bfunction\s*[^(]*\(([^)]*)\)/g, // function parameters
        /\(([^)]*)\)\s*=>/g, // arrow function parameters (parentheses)
        /\b([a-z_$][\w$]*)\s*=>/gi, // arrow function parameters (single param without parentheses)
    ];

    for (let regex of declarationRegexes) {
        let matched;
        while ((matched = regex.exec(code)) !== null) {
            let raw = matched[1];
            if (raw) {
                let names = map(split(raw, ","), (s) => replace(trim(s), /=.*$/, ""));
                for (let name of names) {
                    if (match(name, variableNameRegex)) {
                        declared.add(name);
                    }
                }
            }
        }
    }

    // 2. Exclude string ranges (including template literal non-${})
    let exclusionRanges: [number, number][] = [];
    let stringRegex = /(['"`])(?:\\[\s\S]|(?!\1)[^\\])*\1/g;
    let templateExprRegex = /\$\{([\s\S]*?)\}/g;

    let matched;
    while ((matched = stringRegex.exec(code)) !== null) {
        let quote = matched[1];
        let start = matched[INDEX];
        let end = start + size(matched[0]);

        if (quote === "`") {
            let content = matched[0];
            let baseOffset = matched[INDEX];
            let lastEnd = 0;
            let subMatch;
            while ((subMatch = templateExprRegex.exec(content)) !== null) {
                // NOTE: By excluding `${` and `}` also fix the issue of `$` being treated as a variable
                let subStart = subMatch[INDEX] + 2; // +2 to account for the ${ prefix
                let subEnd = subStart + size(subMatch[0]) - 3; // -3 to account for the } suffix
                if (subStart > lastEnd) {
                    arrayAdd(exclusionRanges, [
                        baseOffset + lastEnd,
                        baseOffset + subStart,
                    ]);
                }
                lastEnd = subEnd;
            }
            if (lastEnd < size(content)) {
                arrayAdd(exclusionRanges, [
                    baseOffset + lastEnd,
                    baseOffset + size(content),
                ]);
            }
        } else {
            arrayAdd(exclusionRanges, [start, end]);
        }
    }

    // 3. Find object literal keys and mark their start positions
    let objectKeys = newSet() as Set<string>;
    let objectKeyRegex = /\b([a-z_$][\w$]*)\s*:/gi;
    while ((matched = objectKeyRegex.exec(code)) !== null) {
        // Add the object key to the set, if not in an exclusion range
        if (!inRange(exclusionRanges, matched[INDEX])) {
            objectKeys.add(matched[1]);
        }
    }

    // 4. Final variable extraction
    let found: [string, number, number][] = [];
    while ((matched = identifierRegex.exec(code)) !== null) {
        let name = matched[0];
        let index = matched[INDEX];
        let before = code[index - 1];

        if (reserved.has(name) || 
            declared.has(name) || 
            before === "." || 
            objectKeys.has(name) ||
            inRange(exclusionRanges, index)
        ) continue;

        // Add the found variable to the set
        arrayAdd(found, [
            name,
            index, // start index of the variable
            index + size(name), // end index of the variable
        ]);
    }

    // Debug
    // console.warn('findUsedButNotDeclaredVariables:', { declared, objectKeys, exclusionRanges, found });

    return found;
}

export let inRange = (ranges: [number, number][], index: number) => 
    some(ranges, ([start, end]) => index >= start && index < end);

export let replaceUsedButNotDeclaredVariables = (bnode: BNode, code: string) => {

    let found = findUsedButNotDeclaredVariables(code);

    let updatedCode = '';
    let lastIndex = 0;

    let ctx = bnode.ctx;

    for (let [name, start, end] of found) {

        // The name of the variables in the context are reserved keywords
        if (name in ctx) continue;

        // Is in one of these contexts?
        for (let obj of [$EACH, /*'$uid', $REFS, $SLOTS,*/ $DATA, $PROPS, $STORE, $TOOLS] as (keyof Context)[]) {

            // Check if the variable is a property of a known context object
            if (ctx[obj] && name in ctx[obj]) {

                // Slice the code until the end of the variable
                updatedCode += slice(code, lastIndex, start) + `${obj}.${name}`;

                // Update the last index to the end of the variable
                lastIndex = end;

                // Stop at the first match
                break;
            }
        }
    }

    return updatedCode + slice(code, lastIndex);
}