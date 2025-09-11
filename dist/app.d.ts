export declare let symbol: symbol;
export declare let settings: ObjectType;
export declare let loadedScripts: Set<string>;
/** Create a new app */
export declare let newApp: () => AppObject;
/** Save the cleanup function to the bnode */
export declare let saveCleanup: (bnode: BNode, cleanupFn: FunctionType) => void;
/** Saves the attribute to the bnode and removes it from the node */
export declare let saveAttr: (bnode: BNode, attrName: string, attrValue: string) => void;
/**
 * Sanitize an attribute value by removing comments and trailing semicolons.
 * This is necessary to properly evaluate certain expressions.
 * Without this, the evaluate function may throw an error for some expressions.
 */
export declare let sanitizeAttrValue: (text: string) => string;
/** Match template literal ${} */
export declare let templateRegex: RegExp;
/** Match mustache syntax {{}} */
export declare let mustacheRegex: RegExp;
/** Sanitize string and replace mustache syntax with template literals */
export declare let replaceMustache: (text: string, replacement?: any) => string;
export declare let setup: (brioWindow?: ObjectType) => void;
export declare let sliceAttrName: (attrName: string, charsWithPrefix: number) => string;
