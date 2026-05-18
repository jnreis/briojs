import { has, size } from ".";
import { arrayAdd } from "./array";
import { $DATA, $FOR, $PROPS, $STORE, ASYNC, CLASS, DEFAULT, DELETE, FUNCTION, GET, NUMBER, SET, SUPER, TEMPLATE, VALUE } from "./constants";
import { isUndefined } from "./typeCheck";

type TokenType =
  | 'identifier'
  | 'keyword'
  | 'punct'
  | 'number'

type Token = {
  type: TokenType;
  value: string;
  start: number;
  end: number;
};

type State =
  | 'code'
  | 'line-comment'
  | 'block-comment'
  | 'regex'
  | '"'
  | "'"
  | 'template';

let CODE: 'code' = 'code';
let LINE_COMMENT: 'line-comment' = 'line-comment';
let BLOCK_COMMENT: 'block-comment' = 'block-comment';
let REGEX: 'regex' = 'regex';
let DOUBLE_QUOTE: '"' = '"';
let SINGLE_QUOTE: "'" = "'";

let BREAK = 'break';
let CONTINUE = 'continue';

let declarationKeywords = new Set(['const', 'let', 'var', FUNCTION, CLASS]);

let keywords = new Set([
    // Core control flow
    BREAK, 'case', 'catch', CONTINUE, 'debugger', DEFAULT,
    'do', 'else', 'finally', 'for', 'if', 'return',
    'switch', 'throw', 'try', 'while',

    // Declarations & structure
    'const', 'let', 'var', FUNCTION, CLASS, // these are handled separately in the filtering logic

    // Literals
    'true', 'false', 'null', 'undefined',

    // Modules
    'import', 'export',

    // Operators / expressions
    DELETE, 'in', 'instanceof', 'new', 'typeof', 'void', 'with',

    // OOP / inheritance
    'extends', SUPER, 'this',

    // Async / generator context keywords
    ASYNC,   // contextual modifier for functions / methods
    'await',   // module / async function context
    'yield',   // generator function context

    // Future reserved words (strict mode)
    'enum', 'implements', 'interface', 'package',
    'private', 'protected', 'public',

    // Contextual keyword (class only)
    'static',
]);

let isIdStart = (c: string) => /[$_\p{ID_Start}]/u.test(c);
let isId = (c: string) => /[$_\u200C\u200D\p{ID_Continue}]/u.test(c);

let IDENTIFIER: 'identifier' = 'identifier';
let PUNCT: 'punct' = 'punct';
let KEYWORD: 'keyword' = 'keyword';

let isTokenType = (type: TokenType, t: Token, value?: string) => t?.type === type && (isUndefined(value) || t[VALUE] === value);
let isPunct = (t: Token, value?: string) => isTokenType(PUNCT, t, value);
let isIdentifier = (t: Token, value?: string) => isTokenType(IDENTIFIER, t, value);
let isKeyword = (t: Token, value?: string) => isTokenType(KEYWORD, t, value);
let isValue = (t: Token, ...value: string[]) => has(value, t[VALUE]);

export let extractReferences = (code: string): Token[] => {
    let tokens: Token[] = [];
    let stack: State[] = [CODE];
    let scopes: Set<string>[] = [new Set()]; // Stack of declared identifiers
    let references: Set<Token> = new Set();

    let i = 0;
    let peek = (n = 0) => code[i + n];
    let state = () => stack[size(stack) - 1];

    // Helper to enter/exit scopes
    let enterScope = () => scopes.push(new Set());
    let exitScope = () => scopes.pop();
    let declare = (name: string) => scopes[scopes.length - 1].add(name);
    let isDeclared = (name: string) => scopes.some(scope => scope.has(name));

    let prevNonSpace = (idx: number) => {
        let j = idx - 1;

        while (j >= 0 && /\s/.test(code[j])) {
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

            if (c === state()) {
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

            if (c === '$' && n === '{') {
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

        if (state() === CODE && /\d/.test(c)) {
            let start = i;

            i++;

            while (i < size(code) && /[\d_a-zA-Z.]/.test(code[i])) {
                i++;
            }

            let value = code.slice(start, i);

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

            let value = code.slice(start, i);

            let token: Token = {
                type: keywords.has(value) ? KEYWORD : IDENTIFIER,
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

    console.log('tokens', tokens);

    for (let i = 0; i < size(tokens); i++) {
        let t = tokens[i];
        let prev = tokens[i - 1];
        let next = tokens[i + 1];

        // Enter new scope on '{', exit on '}'
        if (isPunct(t, '{')) {
            enterScope();
            continue;
        }
        if (isPunct(t, '}')) {
            exitScope();
            continue;
        }

        // Variable declarations: const/let/var foo = ...
        if (isKeyword(t) && isValue(t, 'const', 'let', 'var')) {
            // Next identifier(s) are declarations
            let j = i + 1;
            while (isIdentifier(tokens[j])) {
                declare(tokens[j].value);
                j++;
                // Handle destructuring: const {foo, bar} = ...
                if (isPunct(tokens[j], ',')) j++;
                else break;
            }
            continue;
        }

        // Function declaration: function foo(...) { ... }
        if (isKeyword(t, FUNCTION)) {
            if (isIdentifier(next)) declare(next.value);
            // Parameters: function foo(bar, baz) { ... }
            let k = i + 2;
            if (isPunct(tokens[k], '(')) {
                k++;
                while (!isPunct(tokens[k], ')')) {
                    if (isIdentifier(tokens[k])) declare(tokens[k].value);
                    k++;
                }
            }
            continue;
        }

        // Class declaration: class Foo { ... }
        if (isKeyword(t, CLASS)) {
            if (isIdentifier(next)) declare(next.value);
            continue;
        }

        // Catch clause: catch (err) { ... }
        if (isKeyword(t, 'catch')) {
            let k = i + 1;
            if (isPunct(tokens[k], '(') && isIdentifier(tokens[k + 1])) {
                declare(tokens[k + 1].value);
            }
            continue;
        }

        // Function parameters (arrow functions): (foo, bar) => ...
        if (isPunct(t, '(') && isPunct(tokens[i + 2], ')') && isPunct(tokens[i + 3], '=')) {
            if (isIdentifier(next)) declare(next.value);
            continue;
        }

        // Only collect as reference if not declared in any scope and is an identifier
        if (isIdentifier(t) && !isDeclared(t.value)) {
            // Exclude property accesses (foo.bar), object keys, etc. as before
            // ...existing property/key exclusion logic...
            references.add(t);
        }

        // // only consider identifiers
        // if (!isIdentifier(t)) continue;

        // // ignore property access: foo.bar
        // if (isPunct(prev, '.')) {
        //     // allow spread/rest: ...rest
        //     let prev2 = tokens[i - 2];
        //     let prev3 = tokens[i - 3];

        //     let isSpread =
        //         isPunct(prev2, '.') &&
        //         isPunct(prev3, '.');

        //     if (!isSpread) continue;
        // }

        // // ignore object literal keys: { a: b }
        // if (isPunct(next, ':')) continue;

        // // ignore object/class method definitions: foo() {}
        // if (isPunct(next, '(')) {

        //     // ignore getters/setters method names: get foo() {}, set foo(v) {}
        //     if (isIdentifier(prev) && isValue(prev, GET, SET)) {
        //         continue;
        //     }

        //     // look backwards for '{'
        //     let j = i - 1;

        //     let foundBrace = false;

        //     while (j >= 0) {
        //         if (isPunct(tokens[j], '{')) {
        //             foundBrace = true;
        //             break;
        //         }
        //         if (isPunct(tokens[j], '}')) {
        //             break;
        //         }
        //         j--;
        //     }

        //     if (foundBrace) continue;
        // }

        // // ignore declaration keywords: const, let, var, function, class
        // if (
        //     isValue(t, ...declarationKeywords) && 
        //     (isIdentifier(next) || isPunct(next, '{') || isPunct(next, '['))
        // ) {
        //     continue;
        // }
        
        // // ignore declaration identifiers: const foo // foo is a declaration identifier, not a reference
        // if (
        //     isIdentifier(prev) && 
        //     isValue(prev, ...declarationKeywords) && 
        //     isIdentifier(t)
        // ) {
        //     continue;
        // }

        // let next2 = tokens[i + 2];

        // // ignore getters/setters in object literals: { get foo() {}, set foo(v) {} }
        // if (
        //     isValue(t, GET, SET) &&
        //     isIdentifier(next) &&
        //     isPunct(next2, '(')
        // ) {
        //     continue;
        // }

        // // ignore label references: break label, continue label
        // if (
        //     prev?.type === KEYWORD && 
        //     isValue(prev, BREAK, CONTINUE)
        // ) {
        //     continue;
        // }

        // // ignore decorators
        // if (isPunct(prev, '@')) {
        //     continue;
        // }

        // // ignore import assertions: import x from 'y' assert { type: 'json' }
        // if (
        //     isValue(t, 'assert') &&
        //     isPunct(next, '{')
        // ) {
        //     continue;
        // }

        // // ignore import "from" specifiers: 
        // // - import a from 'b'
        // // - import { a, b } from 'c'
        // if (
        //     isValue(t, 'from') &&
        //     (isIdentifier(prev) || isPunct(prev, '}'))
        // ) {
        //     continue;
        // }

        // result.add(t);
    }

    return [...result];
}

let replaceBetween = (str: string, start: number, end: number, replacement: string): string => {
  return str.slice(0, start) + replacement + str.slice(end);
}
        
// Check if the identifier exists in any of the contexts
let ctxNames: ('$for' | '$data' | '$props' | '$store')[] = [$FOR, $DATA, $PROPS, $STORE];

export let autoFillContext = (bnode: BNode, exp: string): string => {
    let ids = extractReferences(exp);

    // console.warn('autoFillContext\n', String.raw`${exp}`, '\n', ids);

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



let str = `
const [a1] = a2
let b1 {b2: b3, b4} = b5
let c1 = (c2, [c3, ...c4], {c5, c6 = c7}) => {}
let d1 = d2 => {}
function e1(e2, [e3, ...e4], {e5, e6 = e7}) {}
function (e2, [e3, ...e4], {e5, e6 = e7}) {}
`;
let ids = extractReferences(str);
console.log('extractReferences decorators', ids);

// let newStr = autoFillContext({ ctx: { $data: { user: {} }, $props: { messages: [] }, $for: { undefinedCount: 0} } } as any, str);

// console.log('extractReferences', ids, '\nautoFillContext', newStr, '\noriginal', str);



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