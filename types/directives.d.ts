type DirectiveCallback = (context: any) => Promise<void> | void;

type DirectivesArray = [string | RegExp, HydrateDirective][];

/** The hydration function of a directive */
type HydrateDirective = (bnode: BNode, attrName: string, attrValue: string) => any;
type EvaluateDirective = (bnode: BNode, attrName: string, attrValue: string) => any;

// type Masked = {
//     cursor: number,
//     masked: string,
//     unmasked: string,
//     complete: boolean,
// }

type MaskFunction = (context: MaskContext) => void

type MasksObject = {
    [mask: string]: MaskFunction
}

type MaskTokensObject = {
    [token: string]: RegExp
}

// type MaskContext = {
//     mask: string,
//     value: string,
//     tokens: MaskTokensObject,
//     cursor: number,
//     parts: MaskItem[],
//     output: string,
// }

// type MaskItem = {
//     character: string,
//     quantifier: number,
//     isToken: boolean,
//     isOptional: boolean,
//     isMultiple: boolean,
//     value?: string,
// }

type StyleProps = Record<string, string>;

type MaskItem = string | MaskCharacter;
type MaskFunction = ($mask: MaskContext) => void;
type Mask = MaskItem[] | MaskFunction;

type MaskContext = {
    /** The function that returns the mask */
    exp: FunctionType;
    /** Original unmasked value */
    value: string;
    /** Cursor position */
    cursor: number;
    /** New cursor position is the first masked character after the original cursor position */
    cursorUpdated: boolean;
    updateCursor: ($mask: MaskContext, fromIndex: number) => void;
    /** The masked output */
    output: string;
    /** Makes a character or regex a MaskCharacter */
    char: (regex: string | RegExp, min?: number, max?: number) => MaskCharacter;
    /** A MaskCharacter for letters */
    letter: (min?: number, max?: number) => MaskCharacter;
    /** A MaskCharacter for numbers */
    number: (min?: number, max?: number) => MaskCharacter;
    /** A MaskCharacter for alphanumeric characters */
    alpha: (min?: number, max?: number) => MaskCharacter;
    /** Special function for masking money values */
    money: ($options?: {thousands?: string, decimal?: string, precision?: number}) => ($mask: MaskContext) => void;
}

type MaskCharacter = [
    (char: string) => boolean,
    number,
    number,
]