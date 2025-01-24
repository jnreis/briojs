/**
 * TODO: The b-mask directive will be re-written taking as inspiration the Maska library.
 *
 * @option tokens
 * @option decimal   (default: `.`)
 * @option thousands (default: `,`)
 * @option precision (default: `2`)
 */
export declare let hydrateMask: (vnode: VNode, attrName: string, attrValue: string, tools: HydrationTools) => any;
export declare let money: ($mask: MaskContext) => void;
/**
 * Make sure that the deleted character is a valid character.
 * When one character is deleted and it's not a valid character, remove characters before it until a valid character is found and removed.
 * A valid character is a character that matches a wildcard.
 */
