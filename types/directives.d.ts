type DirectivesArray = [string | RegExp, HydrationFunction][];

/** The hydration function of a directive */
type HydrationFunction = (vnode: VNode, attrName: string, attrValue: string, tools: HydrationTools) => any;

// type Masked = {
//     cursor: number,
//     masked: string,
//     unmasked: string,
//     complete: boolean,
// }

type MaskFunction = (context: MaskContext) => void

type MaskObject = {
    [mask: string]: MaskFunction
}

type MaskTokens = {
    [token: string]: RegExp
}

type MaskContext = {
    mask: string,
    value: string,
    tokens: MaskTokens,
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