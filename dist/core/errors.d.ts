export declare const errorText: (error: unknown) => string;
/** Short, human-readable location such as `<button#save.primary> inside <user-card>`. */
export declare const describeNode: (node: Node) => string;
export declare const mark: <E extends object>(error: E, node?: Node, directive?: string) => E;
export declare function causedError(message: string, cause: unknown): Error;
/** Wraps a failure with the directive and element that triggered it, keeping the original as `cause`. */
export declare const directiveError: (message: string, cause: unknown, directive?: string, node?: Node) => Error;
/** Appends the element being hydrated or updated to a Brio-raised error that has no location yet. */
export declare const locate: (error: unknown, node?: Node) => unknown;
export declare const setScopeNode: (scope: object, node: Node | undefined) => WeakMap<object, Node> | undefined;
export declare const getScopeNode: (scope: object | undefined) => Node | undefined;
export declare function combinedError(message: string, errors: unknown[]): Error;
