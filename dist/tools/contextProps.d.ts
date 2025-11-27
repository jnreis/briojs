export declare let variableNameRegex: RegExp;
/**
 * Find variables used in a template literal
 *
 * @param templateLiteral Template literal to analyze. Must not include surrounding backticks.
 * @returns A set of variable names found within template literals.
 */
export declare let findVariablesInTemplateLiteral: (templateLiteral: string, wrapInTemplateExp?: boolean) => Set<[string, number, number]>;
export declare let prefixPropsInContext: (bnode: BNode, code: string, wrapInTemplateExp?: boolean) => string;
