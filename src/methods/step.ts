import { logWarn } from "../tools";
import { isObject } from "../tools/typeCheck";

/**
 * A simple step engine for managing multi-step processes, such as views, forms, tutorials, etc.
 * @param activeSteps a reactive array of strings
 * @returns an array of functions: [setStep, isStepActive, nextStep, backStep, originStep]
 */
export let newStepEngine = (steps: Record<string, StepObject>) => {

    let setStep = (stepName: string, stepObject: StepObject) => {
        let success = false;

        if (stepName) {
            // Set the step object in the steps record
            steps[stepName] = isObject(stepObject) ? stepObject : {};

            // Indicate that the step was successfully set
            success = true;
        }
        else logWarn('Step name is required.');

        return success;
    }

    // Check if a step is currently active
    let isStepActive = (stepName: string) => steps[stepName] && steps[stepName].active;

    let toStep = (currStepName: string, stepKey: 'next' | 'back' | 'origin') => {
        let success = false;
        if (isStepActive(currStepName)) {
            let currStep = steps[currStepName];

            // Get the step name to go to
            let toStepName = currStep[stepKey];

            // Check if the step name exists and is valid
            if (toStepName && steps[toStepName]) {

                // Set the step as active
                if (!isStepActive(toStepName)) {
                    steps[toStepName].active = true;
                }

                // Keep track of the step origin for going back
                steps[toStepName].origin = currStepName;

                // Indicate that the step was successfully changed
                success = true;

                // Keep current step active if specified, otherwise remove it from active steps
                if (!currStep.keep) {
                    currStep.active = false;
                }
            }
            else logWarn(`Step "${currStepName}" does not have a valid ${stepKey} step to go to.`);
        }

        return success;
    }

    // Go to the next step
    let nextStep = (currStepName: string) => toStep(currStepName, 'next');

    // Go to the previous step
    let backStep = (currStepName: string) => toStep(currStepName, 'back');

    // Go to the step which the current step originated from
    let originStep = (currStepName: string) => toStep(currStepName, 'origin');

    return [setStep, isStepActive, nextStep, backStep, originStep];
}