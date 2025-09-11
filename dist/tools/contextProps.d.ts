export declare const reserved: Set<string>;
export declare let variableNameRegex: RegExp;
export declare let findUsedButNotDeclaredVariables: (code: string) => [string, number, number][];
export declare let replaceUsedButNotDeclaredVariables: (bnode: BNode, code: string) => string;
