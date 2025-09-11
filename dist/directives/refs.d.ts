/**
 * NOTES:
 * - refs are only available within a b-data context. Make sure to have a b-data directive around the refs you want make available to the context.
 * - if multiple elements share the same ref name within a b-data context, only the last one will be available in the $refs object.
 */
export declare let hydrateRefs: (bnode: BNode, attrName: string, el: HTMLElement) => Promise<void>;
