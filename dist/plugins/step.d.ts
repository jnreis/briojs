export type StepDefinition = {
    active?: boolean;
    next?: string;
    back?: string;
    origin?: string;
    keep?: boolean;
    [key: string]: unknown;
};
export type StepRecord = Record<string, StepDefinition>;
export type StepEngine = {
    setStep(name: string, definition: StepDefinition): boolean;
    isStepActive(name: string): boolean;
    nextStep(currentName: string): boolean;
    backStep(currentName: string): boolean;
    originStep(currentName: string): boolean;
    getActiveStep(): string | undefined;
};
export declare function createStepEngine(steps: StepRecord): StepEngine;
