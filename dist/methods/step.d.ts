/**
 * A simple step engine for managing multi-step processes, such as views, forms, tutorials, etc.
 * @param activeSteps a reactive array of strings
 * @returns an array of functions: [setStep, isStepActive, nextStep, backStep, originStep]
 */
export declare let newStepEngine: (steps: Record<string, StepObject>) => (((stepName: string, stepObject: StepObject) => boolean) | ((stepName: string) => boolean | undefined))[];
