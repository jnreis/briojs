import { has, size, slice } from ".";
import { arrayAdd } from "./array";
import { $DATA, $FOR, $STORE, CLASS, FUNCTION, NUMBER, VALUE } from "./constants";
import { test } from "./string";
import { isUndefined } from "./typeCheck";

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

let DECLARATION_KEYWORDS = ['const', 'let', 'var', FUNCTION, CLASS];
let SPECIAL_KEYWORDS = ['true', 'false', 'null', 'undefined', 'NaN', 'Infinity'];

let IDENTIFIER: 'identifier' = 'identifier';
let PUNCT: 'punct' = 'punct';

let isIdStart = (c: string) => test(c, /[$_\p{ID_Start}]/u);
let isId = (c: string) => test(c, /[$_\u200C\u200D\p{ID_Continue}]/u);

let isPunct = (t: Token, value?: string) => t?.type === PUNCT && (isUndefined(value) || t[VALUE] === value);
let isIdentifier = (t: Token, value?: string) => t?.type === IDENTIFIER && (isUndefined(value) || t[VALUE] === value);
let isValue = (t: Token, ...value: string[]) => has(value, t[VALUE]);

export let extractReferences = (code: string): Token[] => {
    let tokens: Token[] = [];
    let stack: State[] = [CODE];

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
            arrayAdd(stack, c === '"' ? DOUBLE_QUOTE : SINGLE_QUOTE);
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
            i++;
            continue;
        }

        if (state() === CODE) {
            if (has('.?:(){}[];,@=\n', c)) {
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

            let token: Token = {
                type: IDENTIFIER,
                value,
                start,
                end: i
            };

            arrayAdd(tokens, token);

            continue;
        }

        i++;
    }

    let result = new Set<Token>();

    let isDestructuring = 0;
    let bracketStack: ('[' | '{')[] = [];
    let isLastBracket = (value: '[' | '{') => bracketStack[size(bracketStack) - 1] === value;

    for (let i = 0; i < size(tokens); i++) {
        let token = tokens[i];
        let next = tokens[i + 1];
        let prev = tokens[i - 1];

        // ignore keywords and special values
        if (isIdentifier(token) && isValue(token, ...SPECIAL_KEYWORDS)) {
            continue;
        }

        // ignore keywords and special values
        if (isIdentifier(token) && isPunct(next, '{') && isValue(token, 'do', 'else', 'try', 'catch', 'finally')) {
            continue;
        }

        // ignore keywords and special values
        if (isIdentifier(token) && isPunct(next, '(') && isValue(token, 'for', 'if', 'while', 'switch', 'catch')) {
            continue;
        }

        // ignore declaration keywords
        // e.g. `const`, `let`, `var`, `function`, `class` should not count as references
        if (isIdentifier(token) && isValue(token, ...DECLARATION_KEYWORDS)) {

            // keep track of destructuring assignments
            // e.g. `const [a, b] = arr` or `const {x, y} = obj`
            if (isPunct(next) && isValue(next, '[', '{')) {
                isDestructuring = size(bracketStack) + 1;
            }

            continue;
        }

        // ignore simple declarations
        // e.g. `const x = 5` should not count `x` as a reference
        if (isIdentifier(token) && isIdentifier(prev) && isValue(prev, ...DECLARATION_KEYWORDS)) {
            continue;
        }

        // ignore declarations within destructuring assignments, but still count references within them
        // e.g. in `const [a, b = c] = arr`, `a` and `b` should not count as references, but `c` should count as a reference
        if (isDestructuring && isIdentifier(token) && !isPunct(prev, '=')) {
            continue;
        }

        // handle brackets
        // e.g. `const [a, b] = arr` or `const {x, y} = obj`)
        if (isPunct(token) && isValue(token, '[', '{', '}', ']')) {

            if (isValue(token, '[', '{')) {
                arrayAdd(bracketStack, token.value as '[' | '{');
            }
            else {
                let expectedOpen = token.value === ']' ? '[' : '{';

                let currSize = size(bracketStack);

                // found a matching closing bracket
                if (bracketStack[currSize - 1] === expectedOpen) {

                    // close the current bracket level
                    bracketStack.pop();

                    // end of destructuring assignment
                    if (isDestructuring == currSize) {
                        isDestructuring = currSize - 1;
                    }
                }
            }
            continue;
        }

        // save identifier, if:
        if (isIdentifier(token)) {
            // - ignore object method definitions (e.g. `{method() {}, f: fun1()}` should not count `method` as a reference, but should count `fun1` as a reference)
            if (isPunct(next, '(') && !isPunct(prev, ':') && isLastBracket('{')) {
                continue;
            }

            if (
                // - it's not a property access (e.g. `obj.prop` should not count `prop` as a reference, only `obj`)
                // - it's not an object key (e.g. `{a: b}` should not count `a` as a reference, only `b`)
                !(isPunct(prev, '.') || isPunct(next, ':')) ||

                // - is spread operator (e.g. `...obj` should count `obj` as a reference)
                (isPunct(prev, '.') && isPunct(tokens[i - 2], '.') && isPunct(tokens[i - 3], '.'))
            ) {
                result.add(token);
            }
        }
    }

    // console.warn('code:\n\n', code, '\n\ntokens', [...tokens].map(t => t.value), '\nreferences', [...result].map(t => t.value));

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


// extractReferences("`${ count.toString() }`");
// extractReferences("`Count: ${ count.toString() }`");
// extractReferences("let a = 'John'");
// extractReferences("a = 'John'");
// extractReferences("const [a, b = c] = d");
// extractReferences("const {a: b, c: d = e} = {name: 'John'}");
// extractReferences("{a: b, c: {d: d1 = d2, ...obj}, e, f, g = function g1() {}} = {name: 'John', c: {}}");
// extractReferences("{name: 'John', c: {}}");
// extractReferences("{ 'b-model': { raw: true, trim: true, lazy: true } }");
// extractReferences(`{
//   opacity: 0, 
//   transform: 'scale(0.9)', 
//   transition: 'opacity 1s, transform 1s',
//   m1() {}, // no refs
//   m2: function() {}, // no refs
//   m3: function m4() {}, // no refs
//   m5: () => {}, // no refs
//   notFound: found1(), // 'found1' should be a ref
//   alsoNotFound: found2.method(), // 'found2' should be a ref, but 'method' should not be a ref
// }`);
// extractReferences("try {} catch (err) {} finally {}");
extractReferences(`
for (let i = 0; i < 10; i++) {
  if (i === 5) break
}`)


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