/**
 * NOTE
 * - refs are only available within a b-data context. Make sure to have a b-data directive around the refs you want make available to the context.
 */
export declare let hydrateRefs: (vnode: VNode, attrName: string, tools: HydrationTools) => Promise<void>;
