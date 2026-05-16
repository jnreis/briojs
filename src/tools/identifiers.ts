import { $DATA, $FOR, $PROPS, $STORE } from "./constants";

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

let keywords = new Set([
    // Core control flow
    'break', 'case', 'catch', 'continue', 'debugger', 'default',
    'do', 'else', 'finally', 'for', 'if', 'return',
    'switch', 'throw', 'try', 'while',

    // Declarations & structure
    'class', 'const', 'function', 'let', 'var',

    // Literals
    'true', 'false', 'null', 'undefined',

    // Modules
    'import', 'export',

    // Operators / expressions
    'delete', 'in', 'instanceof', 'new', 'typeof', 'void', 'with',

    // OOP / inheritance
    'extends', 'super', 'this',

    // Async / generator context keywords
    'async',   // contextual modifier for functions / methods
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

export let extractIdentifiers = (code: string): Token[] => {
    let tokens: Token[] = [];

    let stack: State[] = ['code'];

    let i = 0;

    let peek = (n = 0) => code[i + n];

    let state = () => stack[stack.length - 1];

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

    while (i < code.length) {
        let c = code[i];
        let n = peek(1);

        // ---------------- LINE COMMENT ----------------

        if (state() === 'code' && c === '/' && n === '/') {
            stack.push('line-comment');
            i += 2;
            continue;
        }

        // ---------------- BLOCK COMMENT ----------------

        if (state() === 'code' && c === '/' && n === '*') {
            stack.push('block-comment');
            i += 2;
            continue;
        }

        if (state() === 'line-comment') {
            if (c === '\n') {
                stack.pop();
            }

            i++;
            continue;
        }

        if (state() === 'block-comment') {
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
            state() === 'code' &&
            c === '/' &&
            n !== '/' &&
            n !== '*' &&
            isRegexStart()
        ) {
            stack.push('regex');
            i++;
            continue;
        }

        if (state() === 'regex') {
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

        if (
            state() === 'code' &&
            (c === '"' || c === "'")
        ) {
            stack.push(c);
            i++;
            continue;
        }

        if (state() === '"' || state() === "'") {
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
            if (state() === 'template') {
                stack.pop();
            } else {
                stack.push('template');
            }

            i++;
            continue;
        }

        if (state() === 'template') {
            if (c === '\\') {
                i += 2;
                continue;
            }

            if (c === '$' && n === '{') {
                stack.push('code');
                i += 2;
                continue;
            }

            i++;
            continue;
        }

        // leave ${}
        if (
            state() === 'code' &&
            c === '}' &&
            stack[stack.length - 2] === 'template'
        ) {
            stack.pop();
            i++;
            continue;
        }

        if (state() === 'code') {
            if ('.?:(){}[];,@'.includes(c)) {
                tokens.push({
                    type: 'punct',
                    value: c,
                    start: i,
                    end: i + 1
                });

                i++;
                continue;
            }
        }

        // ---------------- NUMBERS ----------------

        if (state() === 'code' && /\d/.test(c)) {
            let start = i;

            i++;

            while (i < code.length && /[\d_a-zA-Z.]/.test(code[i])) {
                i++;
            }

            let value = code.slice(start, i);

            tokens.push({
                type: 'number',
                value,
                start,
                end: i
            });

            continue;
        }

        // ---------------- IDENTIFIERS ----------------

        if (
            state() === 'code' &&
            isIdStart(c)
        ) {
            let start = i;

            i++;

            while (i < code.length && isId(code[i])) {
                i++;
            }

            // Skip Private fields (e.g. #privateField)
            if (code[start - 1] === '#') continue;

            let value = code.slice(start, i);

            let token: Token = {
                type: keywords.has(value) ? 'keyword' : 'identifier',
                value,
                start,
                end: i
            };

            tokens.push(token);

            continue;
        }

        i++;
    }

    let result = new Set<Token>();

    // console.log('tokens', tokens);

    for (let i = 0; i < tokens.length; i++) {
        let t = tokens[i];

        // only consider identifiers
        if (t.type !== 'identifier') continue;

        // the previous token
        let prev = tokens[i - 1];

        // ignore property access: foo.bar
        if (
            prev?.type === 'punct' &&
            prev.value === '.'
        ) {
            // allow spread/rest: ...rest
            let prev2 = tokens[i - 2];
            let prev3 = tokens[i - 3];

            let isSpread =
                prev2?.type === 'punct' &&
                prev2.value === '.' &&
                prev3?.type === 'punct' &&
                prev3.value === '.';

            if (!isSpread) {
                continue;
            }
        }

        // ignore object keys: { a: b }
        let next = tokens[i + 1];

        // ignore object literal keys: { a: b }
        if (next?.type === 'punct' && next.value === ':') continue;

        // ignore object/class method definitions: foo() {}
        // Also covers getters/setters: get foo() {}, set foo(v) {}
        if (next?.type === 'punct' && next.value === '(') {

            // ignore getters/setters: get foo() {}, set foo(v) {}
            if (prev?.type === 'identifier' && (prev.value === 'get' || prev.value === 'set')) {
                continue;
            }

            // look backwards for '{'
            let j = i - 1;

            let foundBrace = false;

            while (j >= 0) {
                if (tokens[j].type === 'punct' && tokens[j].value === '{') {
                    foundBrace = true;
                    break;
                }
                if (tokens[j].type === 'punct' && tokens[j].value === '}') {
                    break;
                }
                j--;
            }

            if (foundBrace) continue;
        }

        // ignore getters/setters in object literals: { get foo() {}, set foo(v) {} }
        if (
            t.value === 'get' ||
            t.value === 'set'
        ) {
            let next2 = tokens[i + 2];

            if (
                next?.type === 'identifier' &&
                next2?.type === 'punct' &&
                next2.value === '('
            ) {
                continue;
            }
        }

        // ignore label references: break label, continue label
        if (
            prev?.type === 'keyword' &&
            (
                prev.value === 'break' ||
                prev.value === 'continue'
            )
        ) {
            continue;
        }

        // ignore decorators
        if (
            tokens[i - 1]?.type === 'punct' &&
            tokens[i - 1].value === '@'
        ) {
            continue;
        }

        // ignore import assertions: import x from 'y' assert { type: 'json' }
        if (
            t.value == 'assert' &&
            next?.type === 'punct' &&
            next.value === '{'
        ) {
            continue;
        }

        // ignore import "from" specifiers: 
        // - import a from 'b'
        // - import { a, b } from 'c'
        if (
            t.value === 'from' &&
            (prev?.type === 'identifier' || (prev?.type === 'punct' && prev.value === '}'))
        ) {
            continue;
        }

        result.add(t);
    }

    return [...result];
}

let replaceBetween = (str: string, start: number, end: number, replacement: string): string => {
  return str.slice(0, start) + replacement + str.slice(end);
}
        
// Check if the identifier exists in any of the contexts
let ctxNames: ('$for' | '$data' | '$props' | '$store')[] = [$FOR, $DATA, $PROPS, $STORE];

let autoFillContext = (bnode: BNode, exp: string): string => {
    let ids = extractIdentifiers(exp);

    // Loop through each identifier and attempt to auto-fill the context if missing
    // Loop backwards to avoid messing up indices when replacing
    for (let i = ids.length - 1; i >= 0; i--) {
        let id = ids[i];

        for (let ctxName of ctxNames) {
            let ctx = bnode.ctx[ctxName];
            if (ctx && id.value in ctx) {
                // If found, replace the identifier with the context-prefixed version
                exp = replaceBetween(exp, id.start, id.end, ctxName + '.' + id.value);
                break;
            }
        }
    }

    return exp;
}

// let str = "`Hello ${user.name}, you have ${messages.length} new messages and ${undefinedCount} unread emails.`";
// let ids = extractIdentifiers(str);

// let newStr = autoFillContext({ ctx: { $data: { user: {} }, $props: { messages: [] }, $for: { undefinedCount: 0} } } as any, str);

// console.log('extractIdentifiers', ids, '\nautoFillContext', newStr, '\noriginal', str);

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