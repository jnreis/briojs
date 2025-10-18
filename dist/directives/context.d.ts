/**
 * TODO?
 * - create a b-use directive to give access to other contexts:
 *   - parent: b-use="parent" alias to the parent context
 *   - contextName: b-use="contextName"
 *   - array of context names: b-use="['context1', 'context2']"
 */
export declare let hydrateContext: (bnode: BNode, attrName: string, attrValue: string) => Promise<any>;
export declare let propsDirective: Directive;
export declare let dataDirective: Directive;
