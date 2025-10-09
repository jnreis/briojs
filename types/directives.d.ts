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

type MaskContext = {
    mask: string,
    value: string,
    tokens: MaskTokensObject,
    cursor: number,
    parts: MaskItem[],
    output: string,
}

type MaskItem = {
    character: string,
    quantifier: number,
    isToken: boolean,
    isOptional: boolean,
    isMultiple: boolean,
    value?: string,
}

type StyleProps = Record<string, [string, string]>;