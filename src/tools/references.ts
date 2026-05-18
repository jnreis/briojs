import { has, size, slice } from ".";
import { arrayAdd } from "./array";
import { $DATA, $FOR, $STORE, NUMBER, VALUE } from "./constants";
import { test } from "./string";

type TokenType =
  | 'identifier'
  | 'keyword'
  | 'punct'
  | 'number'
  | 'ref'; // for template expression references (e.g. `${foo}` → 'foo' is a 'ref'

type Token = {
  type: TokenType;
  value: string;
  start: number;
  end: number;
};

type State =
  | 1 // code
  | 2 // line comment
  | 3 // block comment
  | 4 // regex literal
  | 5 // double quote
  | 6 // single quote
  | 7 // template literal

let CODE: 1 = 1;
let LINE_COMMENT: 2 = 2;
let BLOCK_COMMENT: 3 = 3;
let REGEX: 4 = 4;
let DOUBLE_QUOTE: 5 = 5;
let SINGLE_QUOTE: 6 = 6;
let TEMPLATE: 7 = 7;

let PUNCT: 'punct' = 'punct';

let isIdStart = (c: string) => test(c, /[$_\p{ID_Start}]/u);
let isId = (c: string) => test(c, /[$_\u200C\u200D\p{ID_Continue}]/u);

let isPunct = (t: Token) => t?.type === PUNCT;
let isRef = (t: Token) => t?.type === 'ref';
// let isValue = (t: Token, ...value: string[]) => has(value, t[VALUE]);

export let extractReferences = (code: string): Token[] => {
    let tokens: Token[] = [];
    let stack: State[] = [CODE];

    let inTemplateExpression = false;

    let i = 0;
    let peek = (n = 0) => code[i + n] || '';

    let state = () => stack[size(stack) - 1];

    let prevNonSpace = (idx: number) => {
        let j = idx - 1;

        while (j >= 0 && test(code[j], /\s/)) {
            j--;
        }

        return {
            char: code[j],
            index: j
        };
    }

    let isRegexStart = () => {
        let { char } = prevNonSpace(i);

        return (
            char == null ||
            '([{=,:;!&|?+-*%^<>'.includes(char)
        );
    }

    while (i < size(code)) {
        let c = code[i];
        let n = peek(1);

        // ---------------- LINE COMMENT ----------------

        if (state() === CODE && c === '/' && n === '/') {
            arrayAdd(stack, LINE_COMMENT);
            i += 2;
            continue;
        }

        // ---------------- BLOCK COMMENT ----------------

        if (state() === CODE && c === '/' && n === '*') {
            arrayAdd(stack, BLOCK_COMMENT);
            i += 2;
            continue;
        }

        if (state() === LINE_COMMENT) {
            if (c === '\n') {
                stack.pop();
            }

            i++;
            continue;
        }

        if (state() === BLOCK_COMMENT) {
            if (c === '*' && n === '/') {
                stack.pop();
                i += 2;
                continue;
            }

            i++;
            continue;
        }

        // ---------------- REGEX LITERALS ----------------

        if (
            state() === CODE &&
            c === '/' &&
            n !== '/' &&
            n !== '*' &&
            isRegexStart()
        ) {
            arrayAdd(stack, REGEX);
            i++;
            continue;
        }

        if (state() === REGEX) {
            if (c === '\\') {
                i += 2;
                continue;
            }

            if (c === '/') {
                stack.pop();
            }

            i++;
            continue;
        }

        // ---------------- STRINGS ----------------

        if (state() === CODE && (c === '"' || c === "'")) {
            arrayAdd(stack, c);
            i++;
            continue;
        }

        if (state() === DOUBLE_QUOTE || state() === SINGLE_QUOTE) {
            if (c === '\\') {
                i += 2;
                continue;
            }

            if (c === (state() === DOUBLE_QUOTE ? '"' : "'")) {
                stack.pop();
            }

            i++;
            continue;
        }

        // ---------------- TEMPLATE LITERALS ----------------

        if (c === '`') {
            if (state() === TEMPLATE) stack.pop();
            else arrayAdd(stack, TEMPLATE);

            i++;
            continue;
        }

        if (state() === TEMPLATE) {
            if (c === '\\') {
                i += 2;
                continue;
            }

            let p = peek(-1);

            if (c === '$' && n === '{' && p !== '\\') {
                arrayAdd(stack, CODE);
                inTemplateExpression = true;
                i += 2;
                continue;
            }

            i++;
            continue;
        }

        // leave ${}
        if (
            state() === CODE &&
            c === '}' &&
            stack[size(stack) - 2] === TEMPLATE
        ) {
            stack.pop();
            inTemplateExpression = false;
            i++;
            continue;
        }

        if (state() === CODE) {
            if (has('.?:(){}[];,@', c)) {
                arrayAdd(tokens, {
                    type: PUNCT,
                    value: c,
                    start: i,
                    end: i + 1
                });

                i++;
                continue;
            }
        }

        // ---------------- NUMBERS ----------------

        if (state() === CODE && test(c, /\d/)) {
            let start = i;

            i++;

            while (i < size(code) && test(code[i], /[\d_a-z.]/i)) {
                i++;
            }

            let value = slice(code, start, i);

            arrayAdd(tokens, {
                type: NUMBER,
                value,
                start,
                end: i
            });

            continue;
        }

        // ---------------- IDENTIFIERS ----------------

        if (state() === CODE && isIdStart(c)) {
            let start = i;

            i++;

            while (i < size(code) && isId(code[i])) {
                i++;
            }

            // Skip Private fields (e.g. #privateField)
            if (code[start - 1] === '#') continue;

            let value = slice(code, start, i) as string;

            // Only save references in template expressions
            // Other identifiers are 
            if (inTemplateExpression) {
                let token: Token = {
                    type: 'ref',
                    value,
                    start,
                    end: i
                };

                arrayAdd(tokens, token);
            }

            continue;
        }

        i++;
    }

    let result = new Set<Token>();

    // console.log('tokens', tokens);

    for (let i = 0; i < size(tokens); i++) {
        let token = tokens[i];

        if (!isRef(token)) continue;

        let prev = tokens[i - 1];
        let prev2 = tokens[i - 2];

        // ignore property accesses in template expressions (e.g. `${user.name}` → 'name' is a property, not a reference)
        if (isRef(prev2) && isPunct(prev) && prev[VALUE] === '.') continue;

        result.add(token);
    }

    return [...result];
}

let replaceBetween = (str: string, start: number, end: number, replacement: string): string => {
  return slice(str, 0, start) + replacement + slice(str, end);
}

// Check if the identifier exists in any of the contexts
let ctxNames: ('$for' | '$data' | '$store')[] = [$FOR, $DATA, $STORE];

export let autoFillTemplateExpressions = (bnode: BNode, exp: string): string => {
    let ids = extractReferences(exp);

    // Loop through each identifier and attempt to auto-fill the context if missing
    // Loop backwards to avoid messing up indices when replacing
    for (let i = size(ids) - 1; i >= 0; i--) {
        let id = ids[i];

        for (let ctxName of ctxNames) {
            let ctx = bnode.ctx[ctxName];
            if (ctx && id[VALUE] in ctx) {
                // If found, replace the identifier with the context-prefixed version
                exp = replaceBetween(exp, id.start, id.end, ctxName + '.' + id[VALUE]);
                break;
            }
        }
    }

    return exp;
}


/**
 * TODO

The single best improvement left

If you ever continue evolving this, the next genuinely meaningful upgrade would be:

token metadata

Example:

type Token = {
  type: TokenType;
  value: string;
  start: number;
  end: number;

  role?:
    | 'declaration'
    | 'reference'
    | 'property'
    | 'label';
};

Because then:

const x = y

becomes:

x → declaration
y → reference

and suddenly:

- dead code analysis
- rename tooling
- dependency graphs
- scope analysis

all become possible without a full parser.

But as a pure identifier extractor?

This is already very mature.
 */