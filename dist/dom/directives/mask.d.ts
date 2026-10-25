import { DirectiveDefinition } from './registry.js';

export type MaskContext = {
    value: string;
    selectionStart: number | null;
    selectionEnd: number | null;
    selectionDirection: 'forward' | 'backward' | 'none' | null;
    inputType: string | undefined;
};
export type MaskResult = string | {
    value: string;
    selectionStart?: number;
    selectionEnd?: number;
};
export type MaskFormatter = (context: MaskContext) => MaskResult;
export declare const maskDirective: DirectiveDefinition;
