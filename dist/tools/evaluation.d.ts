export declare let newFn: (args: string, exp: string, returns?: boolean) => FunctionType;
/** Ensure an expression is a function */
export declare let expToFn: (exp: string, args?: string, returns?: boolean) => string;
/**
 * Auto-fill the property context when the expression starts with an identifier that
 * matches a property in one of the context objects ($for, $data, $store).
 *
 * @param bnode The BNode instance containing the context.
 * @param exp The expression to be evaluated.
 * @returns The expression with the context-prefixed identifier if a match is found.
 */
export declare let autoFillContextProp: (bnode: BNode, exp: string) => string;
export declare let destructuringObject: (obj: ObjectType, exp: string) => string;
