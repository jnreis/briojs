/**
 * A simple step engine for managing multi-step processes, such as views, forms, tutorials, etc.
 * @param activeSteps a reactive array of strings
 * @returns
 */
export declare let newStepEngine: (steps: Record<string, StepObject>, activeSteps: string[]) => ((currStepName: string) => void)[];
