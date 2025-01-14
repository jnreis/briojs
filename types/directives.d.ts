/** The hydration function of a directive */
type HydrationFunction = (vnode: VNode, attrName: string, attrValue: string, tools: HydrationTools) => any;

// type Masked = {
//     cursor: number,
//     masked: string,
//     unmasked: string,
//     complete: boolean,
// }

type MaskTokens = {
    [token: string]: RegExp
}

type MaskObject = {
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