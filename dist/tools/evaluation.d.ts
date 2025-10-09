export declare let newFn: (args: string, exp: string, returns?: boolean) => FunctionType;
/** Sanitize an expression to prepare it for evaluation */
export declare let sanitizeExp: (exp: string, isText?: boolean) => string;
/** Ensure an expression is a function */
export declare let expToFn: (exp: string, args?: string, returns?: boolean | "text") => string;
