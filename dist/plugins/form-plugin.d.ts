import { DirectiveDefinition } from '../dom/directives/registry.js';
import { ValidationRule, ValidationSchema } from './forms.js';

export type FormOptions = {
    rules?: ValidationSchema;
    customRules?: Record<string, ValidationRule>;
    /** Called with the values when a valid form submits. The native submission is prevented while it runs. */
    submit?(values: Record<string, unknown>, event: SubmitEvent): unknown;
};
export type FormState = {
    values: Record<string, unknown>;
    errors: Record<string, string[]>;
    touched: Record<string, boolean>;
    valid: boolean;
    submitting: boolean;
    submitted: boolean;
    submitError: unknown;
    /** The first message for a field once it was touched or the form was submitted; otherwise an empty string. */
    error(name: string): string;
    reset(): void;
    submit(): void;
};
/** Reads named controls the way a server would see them, with checkboxes, numbers, and multi-selects typed. */
export declare function readForm(form: HTMLFormElement): Record<string, unknown>;
export declare const formDirective: DirectiveDefinition;
