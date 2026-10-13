export type ValidationRule = (value: unknown, ruleValue: unknown, allData: Record<string, unknown>) => boolean;
export type ValidationSchema = Record<string, Array<{
    name: string;
    value?: unknown;
    message?: string;
}>>;
export type ValidationResult = true | Record<string, string[]>;
export declare const defaultRules: Record<string, ValidationRule>;
export declare function validate(data: Record<string, unknown>, schema: ValidationSchema, customRules?: Record<string, ValidationRule>): ValidationResult;
