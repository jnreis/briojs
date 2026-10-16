export type StepDefinition = {
    readonly next?: string;
};
export type StepRecord = Readonly<Record<string, StepDefinition>>;
export type StepOptions = {
    readonly initial: string;
    readonly steps: StepRecord;
};
export type StepEngine = {
    readonly current: string;
    readonly canGoNext: boolean;
    readonly canGoBack: boolean;
    readonly isActive: (name: string) => boolean;
    readonly go: (name: string) => boolean;
    readonly next: () => boolean;
    readonly back: () => boolean;
    readonly reset: () => boolean;
};
export declare function createStepEngine(options: StepOptions): StepEngine;
