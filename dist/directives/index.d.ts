/**
 * Active directives
 * [directiveName, hydrationFn][]
 */
export declare let directives: [string | RegExp, HydrationFunction][];
/** Set a directive */
export declare let setDirective: (directiveName: string | RegExp, hydrationFunction: HydrationFunction, afterDirective?: string) => void;
