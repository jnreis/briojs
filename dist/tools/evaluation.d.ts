export declare let newFn: (args: string, exp: string, returns?: boolean) => FunctionType;
/** Ensure an expression is a function */
export declare let expToFn: (exp: string, args?: string, returns?: boolean) => string;
/**
 * Find a missing character in a string among all Unicode characters (~1.1 million characters).
 *
 * Useful for finding a unique placeholder character that does not exist in a given string.
 *
 * Note it does not include surrogate halves (D800–DFFF) as they are invalid standalone codepoints.
 *
 * @param str - The string to check
 * @returns A character that is not present in the string
 */
export declare let missingChar: (str: string, exclude?: Set<string>) => string | undefined;
export declare let getTemplateExpressions: (template: string) => [string, [string, string][]];
export declare let setTemplateExpressions: (template: string, expressions: [string, string][]) => string;
