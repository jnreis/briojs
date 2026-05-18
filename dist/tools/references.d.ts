type TokenType = 'identifier' | 'keyword' | 'punct' | 'number' | 'ref';
type Token = {
    type: TokenType;
    value: string;
    start: number;
    end: number;
};
export declare let extractReferences: (code: string) => Token[];
export declare let autoFillTemplateExpressions: (bnode: BNode, exp: string) => string;
export {};
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
