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

export function newStepEngine(steps: StepRecord): [
    setStep: (name: string, definition: StepDefinition) => boolean,
    isStepActive: (name: string) => boolean,
    nextStep: (currentName: string) => boolean,
    backStep: (currentName: string) => boolean,
    originStep: (currentName: string) => boolean,
] {
    const engine = createStepEngine(steps);
    return [
        (name, def) => engine.setStep(name, def),
        (name) => engine.isStepActive(name),
        (name) => engine.nextStep(name),
        (name) => engine.backStep(name),
        (name) => engine.originStep(name),
    ];
}

export function createStepEngine(steps: StepRecord): StepEngine {
    const setStep = (stepName: string, stepObject: StepDefinition): boolean => {
        if (!stepName) {
            console.warn('Step name is required.');
            return false;
        }
        steps[stepName] = stepObject && typeof stepObject === 'object' ? stepObject : {};
        return true;
    };

    const isStepActive = (stepName: string): boolean => {
        return Boolean(steps[stepName]?.active);
    };

    const toStep = (currStepName: string, stepKey: 'next' | 'back' | 'origin'): boolean => {
        if (!isStepActive(currStepName)) return false;
        const currStep = steps[currStepName];
        const toStepName = currStep[stepKey] as string | undefined;

        if (toStepName && steps[toStepName]) {
            if (!isStepActive(toStepName)) {
                steps[toStepName].active = true;
            }
            steps[toStepName].origin = currStepName;
            if (!currStep.keep) {
                currStep.active = false;
            }
            return true;
        } else {
            console.warn(`Step "${currStepName}" does not have a valid ${stepKey} step to go to.`);
            return false;
        }
    };

    const nextStep = (currStepName: string): boolean => toStep(currStepName, 'next');
    const backStep = (currStepName: string): boolean => toStep(currStepName, 'back');
    const originStep = (currStepName: string): boolean => toStep(currStepName, 'origin');

    const getActiveStep = (): string | undefined => {
        for (const [key, val] of Object.entries(steps)) {
            if (val.active) return key;
        }
        return undefined;
    };

    return {
        setStep,
        isStepActive,
        nextStep,
        backStep,
        originStep,
        getActiveStep,
    };
}
