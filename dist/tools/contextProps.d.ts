export declare const reserved: Set<string>;
export declare let variableNameRegex: RegExp;
/**
 * Find variables used in a template literal
 *
 * @param templateLiteral Template literal to analyze. Must not include surrounding backticks.
 * @returns A set of variable names found within template literals.
 */
export declare let findVariablesInTemplateLiteral: (templateLiteral: string) => Set<[string, number, number]>;
export declare let findUsedButNotDeclaredVariables: (code: string) => [string, number, number][];
export declare let inRange: (ranges: [number, number][], index: number) => boolean;
export declare let prefixPropsInContext: (bnode: BNode, code: string) => string;
