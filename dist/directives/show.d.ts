/**
 * b-show is the same as b-if but the element is not removed from the DOM
 *
 * Must reference a prop, method, or be an expression that returns a value that can be converted to a boolean
 */
export declare let hydrateShow: (bnode: BNode, attrName: string, attrValue: string) => void;
export declare let showDirective: Directive;
