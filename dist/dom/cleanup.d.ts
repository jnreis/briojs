export type CleanupFn = () => void;
export declare function registerCleanup(node: Node, cleanup: CleanupFn): void;
export declare function cleanupNode(node: Node): void;
