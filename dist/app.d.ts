export declare let symbol: symbol;
/** Create a new app */
export declare let newApp: () => AppObject;
/** Save the cleanup function to the bnode */
export declare let saveCleanup: (bnode: BNode, cleanupFn: FunctionType) => void;
/** Saves an element to the parent's nodes array. These nodes will be used for cleanup and other operations */
export declare let saveToParent: (bnode: BNode, el: HTMLElement) => void;
/** Get the first inserted node from a list of nodes */
export declare let getFirstInsertedNode: (bnode: BNode) => any;
/**
 * Get the inserted nodes from a bnode.
 * - Including placeholders
 * - Not including b-template, but including its nodes. Recursively, for nested b-templates.
 */
export declare let getInsertedNodes: (bnode: BNode) => Node[];
export declare let removeInsertedNodes: (bnode: BNode) => void;
/**
 * Sanitize an attribute value by removing comments and trailing semicolons.
 * This is necessary to properly evaluate certain expressions.
 * Without this, the evaluate function may throw an error for some expressions.
 */
export declare let sanitizeAttrValue: (text: string) => string;
/** Handle route changes on popstate */
export declare let setup: (brioWindow?: ObjectType) => void;
/** Slice the attribute name to get the part after the directive prefix */
export declare let sliceAttrName: (attrName: string) => string;
export declare let updateDataLevelContext: (bnode: BNode) => Promise<void>;
/** Evaluate the attribute as an effect */
export declare let evalEffect: (bnode: BNode, exp: string, callback: DirectiveCallback) => void;
export declare let evalContextProp: (bnode: BNode, propName: string) => FunctionType | undefined;
export declare let getContextProp: (ctxFn: FunctionType, ...ctxArgs: any[]) => any;
/**
 * Get all saved assets from an asset object based on an asset name or expression.
 * @param bnode
 * @param assetObject
 * @param assetName The name of an asset or an expression that evaluates to an array of asset names
 */
export declare let getSavedAssets: (bnode: BNode, assetObject: ObjectType, assetName: string) => any[];
