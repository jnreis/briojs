/**
 * TODO: I have this js frontend framework called Brio.js.
Its purpose is, like others frontend frameworks, to be a tools to create reactive and dynamic UIs. However it works directly with pure HTML, it can hydrate HTML in the page by calling $dom.hydrate(someElementOrSelector), it can also hydrate HTML strings by calling the $dom.insert(content, where, target).
An app is created by calling the newApp function. That returns a AppObject.
However I want to review with you its hydration process, and the very structure of the code because, even though it works, it feels fragile and rudimentary.
As of right now the hydrate walks the DOM, and hydrates the HTMLElement with directives or Text nodes with mustache or template literal syntaxes. However the element MUST be in the DOM, which can be cumbersome for directives that stops the hydration flow, like b-if, b-each, etc.
Suggest improvements to the exist structure AND suggest a new and improved structure.
 */
export declare let symbol: symbol;
export declare let settings: ObjectType;
export declare let loadedScripts: Set<string>;
/** Create a new app */
export declare let newApp: () => AppObject;
/** Save the cleanup function to the bnode */
export declare let saveCleanup: (bnode: BNode, cleanupFn: FunctionType) => void;
/** Saves an element to the parent's nodes array. These nodes will be used for cleanup and other operations */
export declare let saveToParent: (bnode: BNode, el: HTMLElement) => void;
/**
 * Evaluate attribute, if any
 * @param defaultAttrValue A string to fall back to if the attribute has no value. Default is an empty object.
 */
export declare let evalAttr: (bnode: BNode, attrName: string, defaultAttrValue?: string) => FunctionType;
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
