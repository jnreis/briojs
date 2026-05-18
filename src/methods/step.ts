import { has, logWarn } from "../tools";
import { arrayAdd, indexOf } from "../tools/array";

/**
 * A simple step engine for managing multi-step processes, such as views, forms, tutorials, etc.
 * @param activeSteps a reactive array of strings
 * @returns 
 */
export let newStepEngine = (steps: Record<string, StepObject>, activeSteps: string[]) => {

    // Check if a step is currently active
    let isStepActive = (stepName: string) => has(activeSteps, stepName);

    let toStep = (currStepName: string, stepKey: 'next' | 'back' | 'origin') => {
        if (isStepActive(currStepName)) {
            let currStep = steps[currStepName];

            // Get the step name to go to
            let toStepName = currStep[stepKey];

            // Check if the step name exists and is valid
            if (toStepName && steps[toStepName]) {
                // Set the step as active
                if (!isStepActive(toStepName)) {
                    arrayAdd(activeSteps, toStepName);
                }

                // Keep track of the step origin for going back
                steps[toStepName].origin = currStepName;
            } else {
                logWarn(`Step "${currStepName}" does not have a valid "${stepKey}" step to go to.`);
            }

            // Keep current step active if specified, otherwise remove it from active steps
            if (!currStep.keep) {
                let activeStepIndex = indexOf(activeSteps, currStepName);
                if (activeStepIndex >= 0) {
                    activeSteps.splice(activeStepIndex, 1);
                }
            }
        }
    }

    // Go to the next step
    let nextStep = (currStepName: string) => toStep(currStepName, 'next');

    // Go to the previous step
    let backStep = (currStepName: string) => toStep(currStepName, 'back');

    // Go to the step which the current step originated from
    let originStep = (currStepName: string) => toStep(currStepName, 'origin');

    return [isStepActive, nextStep, backStep, originStep];
}