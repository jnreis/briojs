/**
 * TODO: The b-mask directive will be re-written taking as inspiration the Maska library.
 *
 * @option tokens
 * @option decimal   (default: `.`)
 * @option thousands (default: `,`)
 * @option precision (default: `2`)
 */
export declare let hydrateMask: (bnode: BNode, attrName: string, attrValue: string) => any;
export declare let applyMask: ($mask: MaskContext) => void;
export declare let maskDirective: Directive;
